#!/usr/bin/env node

/**
 * Restore from Backup Script
 *
 * Restores all HTML files from their .backup copies
 * Use this if the update-payment-system.js script caused issues
 *
 * Usage: node restore-from-backup.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function restoreFile(filePath) {
  const backupPath = filePath + '.backup';
  const filename = path.basename(filePath);

  if (!fs.existsSync(backupPath)) {
    log(`  ✗ Backup not found: ${filename}.backup`, 'red');
    return false;
  }

  try {
    // Read backup
    const backupContent = fs.readFileSync(backupPath, 'utf8');

    // Restore original file
    fs.writeFileSync(filePath, backupContent, 'utf8');

    log(`  ✓ Restored: ${filename}`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ Error restoring ${filename}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('\n========================================', 'cyan');
  log('Restore from Backup', 'cyan');
  log('========================================\n', 'cyan');

  const files = [
    'public/mobile.html',
    'public/mobile-he.html',
    'public/index.html',
    'public/index-he.html'
  ];

  let restoredCount = 0;

  files.forEach(file => {
    if (restoreFile(file)) {
      restoredCount++;
    }
  });

  log('\n========================================', 'cyan');
  log('Summary', 'cyan');
  log('========================================', 'cyan');
  log(`Files restored: ${restoredCount}/${files.length}\n`, restoredCount === files.length ? 'green' : 'yellow');

  if (restoredCount === files.length) {
    log('All files successfully restored from backup!\n', 'green');
  } else {
    log('Some files could not be restored. Please check manually.\n', 'red');
  }
}

main();
