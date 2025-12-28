import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const YATTAI_PATH = './public/gateways/aiboumos/yattai';
const REGISTRY_PATH = './public/gateways/aiboumos/registry.json';

// Normalization function
function normalize(filename) {
  return filename
    .toLowerCase()
    .replace(/[-_]/g, '')
    .replace(/\.[^/.]+$/, '');
}

// Extract PURPOSE from .CARD.md or .PrAPPt.md
function extractPurpose(folderPath, cardFile, prapptFile) {
  let purpose = '';

  // Try .CARD.md first
  if (cardFile && fs.existsSync(path.join(folderPath, cardFile))) {
    try {
      const content = fs.readFileSync(path.join(folderPath, cardFile), 'utf-8');
      const purposeMatch = content.match(/PURPOSE:\s*(.+)/i);
      if (purposeMatch) purpose = purposeMatch[1].trim();
    } catch (error) {
      console.error(`Error reading ${cardFile}: ${error.message}`);
    }
  }

  // Fallback to .PrAPPt.md if PURPOSE not found
  if (!purpose && prapptFile && fs.existsSync(path.join(folderPath, prapptFile))) {
    try {
      const content = fs.readFileSync(path.join(folderPath, prapptFile), 'utf-8');
      const purposeMatch = content.match(/\[PURPOSE\]\s*\n\s*(.+)/i);
      if (purposeMatch) purpose = purposeMatch[1].trim();
    } catch (error) {
      console.error(`Error reading ${prapptFile}: ${error.message}`);
    }
  }

  return purpose;
}

// Scan YATTAi cards
function scanCards() {
  const cards = [];
  const stats = { total: 0, complete: 0, warnings: 0, critical: 0 };

  if (!fs.existsSync(YATTAI_PATH)) {
    console.error(`❌ YATTAi path not found: ${YATTAI_PATH}`);
    return { cards, stats };
  }

  const folders = fs.readdirSync(YATTAI_PATH, { withFileTypes: true });

  folders.forEach(folder => {
    if (!folder.isDirectory()) return;

    const folderPath = path.join(YATTAI_PATH, folder.name);
    const files = fs.readdirSync(folderPath);

    const card = {
      id: normalize(folder.name),
      name: folder.name,
      purpose: '',
      quote: '',
      keywords: [],
      status: 'incomplete',
      files: { card: null, prappt: null, image: null, yattai: null },
      health: { complete: false, missing: [], warnings: [] },
    };

    // Find 4 required files (case-insensitive, flexible naming)
    files.forEach(file => {
      const normalized = normalize(file);
      const folderId = normalize(folder.name);
      
      // Match files by pattern (allows flexibility in naming)
      if (file.endsWith('.CARD.md') || file.endsWith('.Card.md') || file.endsWith('.card.md')) {
        card.files.card = file;
      }
      if (file.endsWith('.PrAPPt.md') || file.endsWith('.prappt.md') || file.endsWith('.PRAPPT.md')) {
        card.files.prappt = file;
      }
      if (file.endsWith('.IMAGE.png') || file.endsWith('.image.png') || file.endsWith('.Image.png')) {
        card.files.image = file;
      }
      if (file.endsWith('.YATTAI.png') || file.endsWith('.yattai.png') || file.endsWith('.YATTAi.png')) {
        card.files.yattai = file;
      }
    });

    // Extract PURPOSE
    card.purpose = extractPurpose(folderPath, card.files.card, card.files.prappt);

    // Validate completeness
    const required = ['card', 'prappt', 'image', 'yattai'];
    const missing = required.filter(key => !card.files[key]);

    if (missing.length === 0) {
      card.status = 'complete';
      card.health.complete = true;
      stats.complete++;
    } else {
      card.health.missing = missing;
      
      if (missing.includes('prappt')) {
        stats.critical++;
        card.health.warnings.push('🚨 CRITICAL: Missing .PrAPPt.md');
        card.status = 'critical';
      } else {
        stats.warnings++;
        card.health.warnings.push(`⚠️  Missing: ${missing.join(', ')}`);
        card.status = 'warning';
      }
    }

    stats.total++;
    cards.push(card);
  });

  return { cards, stats };
}

// Main execution
function main() {
  const { cards, stats } = scanCards();

  const registry = {
    timestamp: new Date().toISOString(),
    cards,
    stats,
  };

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));

  // Print report
  console.log(``);
  console.log('╔════════════════════════════════════════════╗');
  console.log('║       YATTAi Card Health Report            ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(``);
  console.log(`✅ Complete:  ${stats.complete}`);
  console.log(`⚠️  Warnings:  ${stats.warnings}`);
  console.log(`🚨 Critical:  ${stats.critical}`);
  console.log(`📊 Total:     ${stats.total}`);
  console.log(``);
  console.log(`💾 Registry updated: ${REGISTRY_PATH}`);
  console.log(`⏰ Timestamp: ${registry.timestamp}`);
  console.log(``);

  // Print card details
  if (cards.length > 0) {
    console.log('📋 Card Details:');
    console.log('────────────────────────────────────────────');
    cards.forEach(card => {
      const statusIcon = card.status === 'complete' ? '✅' : card.status === 'critical' ? '🚨' : '⚠️';
      console.log(`${statusIcon} ${card.name} (${card.status})`);
      if (card.health.warnings.length > 0) {
        card.health.warnings.forEach(warning => {
          console.log(`   ${warning}`);
        });
      }
    });
  }
}

main();
