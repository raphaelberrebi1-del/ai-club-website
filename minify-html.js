#!/usr/bin/env node

/**
 * HTML Minifier for Curriculum Files
 * Removes whitespace and comments while preserving all content and styling
 */

const fs = require('fs');
const path = require('path');

function minifyHTML(html) {
  // Remove HTML comments (but not conditional comments)
  html = html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');

  // Remove whitespace between tags (but preserve single spaces in content)
  html = html.replace(/>\s+</g, '><');

  // Remove leading/trailing whitespace from lines
  html = html.split('\n').map(line => line.trim()).join('');

  // Remove multiple spaces within tags
  html = html.replace(/\s+/g, ' ');

  // Clean up spaces around = in attributes
  html = html.replace(/\s*=\s*/g, '=');

  // Remove spaces after opening tags
  html = html.replace(/(<[^>]+>)\s+/g, '$1');

  // Remove spaces before closing tags
  html = html.replace(/\s+(<\/[^>]+>)/g, '$1');

  return html;
}

function processFile(inputFile, outputFile) {
  console.log(`📄 Reading: ${path.basename(inputFile)}`);

  const originalHTML = fs.readFileSync(inputFile, 'utf8');
  const originalSize = Buffer.byteLength(originalHTML, 'utf8');

  console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);

  console.log(`🔧 Minifying...`);
  const minifiedHTML = minifyHTML(originalHTML);
  const minifiedSize = Buffer.byteLength(minifiedHTML, 'utf8');

  console.log(`   Minified size: ${(minifiedSize / 1024).toFixed(2)} KB`);
  console.log(`   Reduced by: ${(((originalSize - minifiedSize) / originalSize) * 100).toFixed(1)}%`);

  fs.writeFileSync(outputFile, minifiedHTML, 'utf8');
  console.log(`✅ Saved: ${path.basename(outputFile)}`);
  console.log('');

  return {
    originalSize,
    minifiedSize,
    reduction: ((originalSize - minifiedSize) / originalSize) * 100
  };
}

// Process command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node minify-html.js <input-file> <output-file>');
  process.exit(1);
}

const [inputFile, outputFile] = args;

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

const stats = processFile(inputFile, outputFile);

if (stats.minifiedSize < 100 * 1024) {
  console.log('✅ Minified file is under 100 KB email limit!');
} else {
  console.log('⚠️  Warning: Minified file is still over 100 KB');
}
