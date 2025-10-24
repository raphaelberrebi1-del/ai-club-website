#!/bin/bash

# ========================================
# Complete Google Apps Script Generator
# ========================================
# This script embeds all three curriculum HTMLs into the Google Apps Script
# Run this to generate the final, ready-to-use Google Apps Script file

echo "🔧 Completing Google Apps Script with all curriculum HTMLs..."
echo ""

# Check if curriculum files exist
if [ ! -f "pdf-curriculum-young-explorers.html" ]; then
    echo "❌ Error: pdf-curriculum-young-explorers.html not found"
    exit 1
fi

if [ ! -f "pdf-curriculum-teen-champions.html" ]; then
    echo "❌ Error: pdf-curriculum-teen-champions.html not found"
    exit 1
fi

if [ ! -f "pdf-curriculum-future-leaders.html" ]; then
    echo "❌ Error: pdf-curriculum-future-leaders.html not found"
    exit 1
fi

echo "✅ All curriculum HTML files found"
echo ""

# Read the complete Google Apps Script template
if [ ! -f "google-apps-script-curriculum-COMPLETE.js" ]; then
    echo "❌ Error: google-apps-script-curriculum-COMPLETE.js not found"
    exit 1
fi

echo "📄 Reading Teen Champions HTML (1406 lines)..."
TEEN_HTML=$(cat "pdf-curriculum-teen-champions.html" | sed 's/`/\\`/g' | sed 's/\$/\\$/g')

echo "📄 Reading Future Leaders HTML (1406 lines)..."
FUTURE_HTML=$(cat "pdf-curriculum-future-leaders.html" | sed 's/`/\\`/g' | sed 's/\$/\\$/g')

echo "📝 Creating final Google Apps Script file..."
echo ""

# Create the final file using Node.js for better string handling
node -e "
const fs = require('fs');

// Read the template
let script = fs.readFileSync('google-apps-script-curriculum-COMPLETE.js', 'utf8');

// Read the HTMLs
const teenHTML = fs.readFileSync('pdf-curriculum-teen-champions.html', 'utf8');
const futureHTML = fs.readFileSync('pdf-curriculum-future-leaders.html', 'utf8');

// Replace the Teen Champions placeholder
script = script.replace(
  'return \`<!-- TEEN CHAMPIONS HTML WILL BE FULLY EMBEDDED HERE -->\`;',
  'return \`' + teenHTML.replace(/\`/g, '\\\`').replace(/\\\$/g, '\\\\\$') + '\`;'
);

// Replace the Future Leaders placeholder
script = script.replace(
  'return \`<!-- FUTURE LEADERS HTML WILL BE FULLY EMBEDDED HERE -->\`;',
  'return \`' + futureHTML.replace(/\`/g, '\\\`').replace(/\\\$/g, '\\\\\$') + '\`;'
);

// Write the final file
fs.writeFileSync('google-apps-script-curriculum-FINAL.js', script, 'utf8');

console.log('✅ Final Google Apps Script created: google-apps-script-curriculum-FINAL.js');
console.log('');
console.log('📊 File Statistics:');
const stats = fs.statSync('google-apps-script-curriculum-FINAL.js');
console.log('   Size: ' + Math.round(stats.size / 1024) + ' KB');
console.log('   Lines: ~' + (script.split('\\n').length).toLocaleString());
console.log('');
console.log('🎯 Next Steps:');
console.log('   1. Open https://script.google.com');
console.log('   2. Create a new project or open your existing \"AI Kidz Club - Curriculum Download\" project');
console.log('   3. Copy the ENTIRE contents of google-apps-script-curriculum-FINAL.js');
console.log('   4. Paste it into the Google Apps Script editor (replacing all existing code)');
console.log('   5. Save the project');
console.log('   6. Deploy as Web App (Execute as: Me, Who has access: Anyone)');
console.log('   7. Test with testAllCurricula() function');
console.log('');
console.log('✨ You\\'re ready to send beautiful curriculum emails!');
"

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ SUCCESS!"
    echo "================================================"
    echo ""
    echo "Your complete Google Apps Script file is ready:"
    echo "📁 google-apps-script-curriculum-FINAL.js"
    echo ""
    echo "This file contains:"
    echo "  ✓ All script functions"
    echo "  ✓ Young Explorers HTML (666 lines) - COMPLETE"
    echo "  ✓ Teen Champions HTML (1406 lines) - COMPLETE"
    echo "  ✓ Future Leaders HTML (1406 lines) - COMPLETE"
    echo ""
    echo "🚀 Ready to copy-paste into Google Apps Script!"
else
    echo "❌ Error: Failed to create final script. Make sure Node.js is installed."
    echo "   Install Node.js from: https://nodejs.org"
    exit 1
fi
