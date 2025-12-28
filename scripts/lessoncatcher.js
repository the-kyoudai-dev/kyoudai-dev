#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const lessonsDir = path.join(__dirname, '../public/gateways/prappt/lessons');
const curriculumPath = path.join(__dirname, '../public/gateways/prappt/curriculum.json');
const registryPath = path.join(__dirname, '../public/gateways/prappt/registry.json');

// ANSI colors for output
const colors = {
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Validate lesson structure
 * Checks for required files and metadata
 */
function validateLesson(lessonId) {
  const lessonPath = path.join(lessonsDir, `${lessonId}.md`);
  const metadataPath = path.join(lessonsDir, `${lessonId}_metadata.json`);

  const hasMarkdown = fs.existsSync(lessonPath);
  const hasMetadata = fs.existsSync(metadataPath);

  return {
    id: lessonId,
    hasMarkdown,
    hasMetadata,
    complete: hasMarkdown && hasMetadata,
    markdownPath: lessonPath,
    metadataPath,
  };
}

/**
 * Parse YAML frontmatter from markdown
 */
function parseFrontmatter(markdown) {
  const lines = markdown.split('\n');
  const frontmatter = {};

  // Extract lesson metadata from markdown structure
  const titleMatch = markdown.match(/^# (.+)$/m);
  if (titleMatch) frontmatter.title = titleMatch[1];

  const instructorMatch = markdown.match(/^Instructor: (.+)$/m);
  if (instructorMatch) frontmatter.instructor = instructorMatch[1];

  const durationMatch = markdown.match(/^Duration: (.+)$/m);
  if (durationMatch) {
    const match = durationMatch[1].match(/(\d+)\s*min/);
    if (match) frontmatter.estimated_time = parseInt(match[1]);
  }

  return frontmatter;
}

/**
 * Count wikilinks in markdown
 */
function countWikilinks(markdown) {
  const matches = markdown.match(/\[\[(\w+[\w-]*)(?:\|[^\]]+)?\]\]/g) || [];
  return matches.length;
}

/**
 * Load and validate curriculum
 */
function validateCurriculum() {
  if (!fs.existsSync(curriculumPath)) {
    log('❌ curriculum.json not found!', 'yellow');
    return null;
  }

  const content = fs.readFileSync(curriculumPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load and validate registry
 */
function validateRegistry() {
  if (!fs.existsSync(registryPath)) {
    log('❌ registry.json not found!', 'yellow');
    return null;
  }

  const content = fs.readFileSync(registryPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Run health check on lessons
 */
function runHealthCheck() {
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║   PrAPPt Lesson Health Report              ║', 'cyan');
  log('╚════════════════════════════════════════════╝\n', 'cyan');

  const curriculum = validateCurriculum();
  const registry = validateRegistry();

  if (!curriculum || !registry) {
    log('⚠️  Missing curriculum or registry. Skipping full validation.', 'yellow');
    return;
  }

  let completeCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  log('Checking lessons...\n', 'cyan');

  for (const lesson of curriculum.lessons) {
    const validation = validateLesson(lesson.id);

    if (!validation.complete) {
      log(`🚨 ${lesson.id}: MISSING FILES`, 'yellow');
      if (!validation.hasMarkdown) log(`   - Missing: ${lesson.id}.md`, 'yellow');
      if (!validation.hasMetadata) log(`   - Missing: ${lesson.id}_metadata.json`, 'yellow');
      criticalCount++;
    } else {
      const markdown = fs.readFileSync(validation.markdownPath, 'utf-8');
      const wikilinks = countWikilinks(markdown);
      const frontmatter = parseFrontmatter(markdown);

      log(`✅ ${lesson.id}`, 'green');
      log(`   Title: ${frontmatter.title || 'N/A'}`);
      log(`   Time: ${frontmatter.estimated_time || lesson.estimated_time || 'N/A'} min`);
      log(`   Links: ${wikilinks}`);
      completeCount++;
    }
  }

  log(`\n📊 Summary:`, 'cyan');
  log(`✅ Complete:  ${completeCount}`);
  log(`⚠️  Warnings:  ${warningCount}`);
  log(`🚨 Critical:  ${criticalCount}`);
  log(`📊 Total:     ${curriculum.lessons.length}\n`);

  log(`💾 Registry updated: ./public/gateways/prappt/curriculum.json`, 'green');
  log(`⏰ Timestamp: ${new Date().toISOString()}\n`, 'cyan');
}

/**
 * Watch mode: Monitor for changes
 */
function watchLessons(pollInterval = 5000) {
  log('\n🔍 lessoncatcher started (watch mode)', 'cyan');
  log(`📂 Watching: ${lessonsDir}`, 'cyan');
  log(`⏱️  Poll interval: ${pollInterval}ms\n`, 'cyan');
  log('Press Ctrl+C to stop.\n', 'cyan');

  let lastCheck = {};

  const checkFiles = () => {
    try {
      const files = fs.readdirSync(lessonsDir);
      const mdFiles = files.filter((f) => f.endsWith('.md')).map((f) => f.replace('.md', ''));

      const curriculum = validateCurriculum();
      if (!curriculum) return;

      const lessonIds = new Set(mdFiles);
      const registeredIds = new Set(curriculum.lessons.map((l) => l.id));

      // Check for new files
      for (const id of lessonIds) {
        if (!lastCheck[id]) {
          log(`📝 New lesson detected: ${id}`, 'green');
          lastCheck[id] = true;
        }
      }

      // Check for missing files
      for (const id of registeredIds) {
        if (!lessonIds.has(id) && lastCheck[id]) {
          log(`🗑️  Lesson removed: ${id}`, 'yellow');
          delete lastCheck[id];
        }
      }
    } catch (err) {
      log(`Error checking files: ${err.message}`, 'yellow');
    }
  };

  // Run immediately
  checkFiles();

  // Set up polling
  setInterval(checkFiles, pollInterval);
}

/**
 * CLI Execution
 */
const args = process.argv.slice(2);

if (args[0] === '--watch') {
  watchLessons();
} else if (args[0] === '--check' || args.length === 0) {
  runHealthCheck();
} else {
  log('lessoncatcher - Validate & monitor PrAPPt lessons\n', 'cyan');
  log('Usage:');
  log('  node lessoncatcher.js          Run health check');
  log('  node lessoncatcher.js --check  Run health check');
  log('  node lessoncatcher.js --watch  Watch for changes (polling mode)');
}
