#!/bin/bash

# ========================================
# Minify Curricula and Build Google Apps Script
# ========================================
# This script automates the complete process:
# 1. Minifies Teen Champions HTML
# 2. Minifies Future Leaders HTML
# 3. Builds complete Google Apps Script with all three curricula
#
# Run this script whenever you update the curriculum HTML files

set -e  # Exit on any error

echo "================================================"
echo "  AI Kidz Club - Curriculum Build Script"
echo "================================================"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed."
    echo "   Install from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if all required files exist
echo "🔍 Checking for required files..."

if [ ! -f "pdf-curriculum-young-explorers.html" ]; then
    echo "❌ Error: pdf-curriculum-young-explorers.html not found"
    exit 1
fi
echo "   ✅ Young Explorers HTML found"

if [ ! -f "pdf-curriculum-teen-champions.html" ]; then
    echo "❌ Error: pdf-curriculum-teen-champions.html not found"
    exit 1
fi
echo "   ✅ Teen Champions HTML found"

if [ ! -f "pdf-curriculum-future-leaders.html" ]; then
    echo "❌ Error: pdf-curriculum-future-leaders.html not found"
    exit 1
fi
echo "   ✅ Future Leaders HTML found"

if [ ! -f "minify-html.js" ]; then
    echo "❌ Error: minify-html.js not found"
    exit 1
fi
echo "   ✅ Minify script found"

if [ ! -f "build-google-script-minified.js" ]; then
    echo "❌ Error: build-google-script-minified.js not found"
    exit 1
fi
echo "   ✅ Build script found"

echo ""
echo "================================================"
echo "  Step 1: Minifying Teen Champions HTML"
echo "================================================"
echo ""

node minify-html.js "pdf-curriculum-teen-champions.html" "pdf-curriculum-teen-champions-minified.html"

echo ""
echo "================================================"
echo "  Step 2: Minifying Future Leaders HTML"
echo "================================================"
echo ""

node minify-html.js "pdf-curriculum-future-leaders.html" "pdf-curriculum-future-leaders-minified.html"

echo ""
echo "================================================"
echo "  Step 3: Building Google Apps Script"
echo "================================================"
echo ""

node build-google-script-minified.js

echo ""
echo "================================================"
echo "  ✅ BUILD COMPLETE!"
echo "================================================"
echo ""
echo "📁 Files Created:"
echo "   • pdf-curriculum-teen-champions-minified.html"
echo "   • pdf-curriculum-future-leaders-minified.html"
echo "   • google-apps-script-curriculum-MINIFIED.js"
echo ""
echo "📊 File Sizes:"
ls -lh pdf-curriculum-*-minified.html google-apps-script-curriculum-MINIFIED.js | awk '{print "   " $9 ": " $5}'
echo ""
echo "🎯 Next Steps:"
echo "   1. Open https://script.google.com"
echo "   2. Open your 'AI Kidz Club - Curriculum Download' project"
echo "   3. Copy ALL contents of: google-apps-script-curriculum-MINIFIED.js"
echo "   4. Paste into Google Apps Script editor (replace all existing code)"
echo "   5. Save the project (Ctrl+S or Cmd+S)"
echo "   6. Deploy as Web App:"
echo "      - Deploy → New deployment"
echo "      - Type: Web app"
echo "      - Execute as: Me"
echo "      - Who has access: Anyone"
echo "   7. Test with: testAllCurricula()"
echo ""
echo "📧 Expected Test Results:"
echo "   ✅ Young Explorers (47 KB) - Complete email"
echo "   ✅ Teen Champions (57 KB) - Complete email"
echo "   ✅ Future Leaders (58 KB) - Complete email"
echo ""
echo "✨ All three curricula should now send completely without truncation!"
echo ""
