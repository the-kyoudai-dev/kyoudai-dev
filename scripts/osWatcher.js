import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const WATCH_PATH = './public/gateways/respengr/desktop';
const REGISTRY_PATH = './public/gateways/respengr/filesystem.json';
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_DELAY = 1000; // 1 second

// Normalization function (case-insensitive + remove hyphens/underscores)
function normalize(filename) {
  return filename
    .toLowerCase()
    .replace(/[-_]/g, '')
    .replace(/\.[^/.]+$/, '');
}

// Initialize registry object
let registry = {
  timestamp: new Date().toISOString(),
  files: [],
  folders: [],
};

// Recursive directory scanner
function scanDirectory(dir, prefix = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  const folders = [];

  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    const relativePath = prefix ? `${prefix}/${item.name}` : item.name;

    if (item.isDirectory()) {
      const subScan = scanDirectory(fullPath, relativePath);
      folders.push({
        id: normalize(item.name),
        name: item.name,
        path: relativePath,
        children: subScan.files,
        childFolders: subScan.folders,
        itemCount: subScan.files.length + subScan.folders.length,
      });
    } else if (item.isFile() && item.name.endsWith('.md')) {
      files.push({
        id: normalize(item.name),
        name: item.name,
        basename: normalize(item.name),
        path: relativePath,
        type: 'file',
        updatedAt: fs.statSync(fullPath).mtime.toISOString(),
      });
    }
  });

  return { files, folders };
}

// Update registry
function updateRegistry() {
  try {
    const scanned = scanDirectory(WATCH_PATH);
    registry = {
      timestamp: new Date().toISOString(),
      files: scanned.files,
      folders: scanned.folders,
    };
    
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
    console.log(`✅ Registry updated: ${registry.timestamp}`);
    console.log(`   Total files: ${scanned.files.length}`);
  } catch (error) {
    console.error('❌ Error updating registry:', error.message);
  }
}

// File watcher
const watcher = chokidar.watch(WATCH_PATH, {
  ignored: /(^|[\/\\])\.|node_modules/,
  persistent: true,
  debounceDelay: DEBOUNCE_DELAY,
});

// Watch events
watcher.on('add', (filePath) => {
  console.log(`📝 Added: ${filePath}`);
  updateRegistry();
});

watcher.on('unlink', (filePath) => {
  console.log(`🗑️  Deleted: ${filePath}`);
  updateRegistry();
});

watcher.on('addDir', (dirPath) => {
  console.log(`📁 Folder added: ${dirPath}`);
  updateRegistry();
});

watcher.on('unlinkDir', (dirPath) => {
  console.log(`📁 Folder deleted: ${dirPath}`);
  updateRegistry();
});

watcher.on('error', (error) => {
  console.error('❌ Watcher error:', error);
});

// Initial scan
updateRegistry();
console.log(`🔍 osWatcher started`);
console.log(`📂 Watching: ${WATCH_PATH}`);
console.log(`💾 Registry: ${REGISTRY_PATH}`);
console.log(`⏱️  Poll interval: ${POLL_INTERVAL / 1000 / 60} minutes`);
console.log(``);
console.log('Press Ctrl+C to stop.');
