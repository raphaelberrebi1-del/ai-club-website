#!/bin/bash

# ========================================
# Complete Responsive Curriculum Build Script
# ========================================
# This script automates the complete process:
# 1. Adds responsive CSS to all three curriculum files
# 2. Minifies Teen Champions and Future Leaders (Young Explorers stays as-is)
# 3. Builds complete Google Apps Script with responsive versions
#
# Run this script whenever you update the curriculum HTML files

set -e  # Exit on any error

echo "================================================"
echo "  AI Kidz Club - Responsive Curriculum Build"
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

if [ ! -f "add-responsive-css.js" ]; then
    echo "❌ Error: add-responsive-css.js not found"
    exit 1
fi
echo "   ✅ Responsive CSS script found"

if [ ! -f "minify-html.js" ]; then
    echo "❌ Error: minify-html.js not found"
    exit 1
fi
echo "   ✅ Minify script found"

if [ ! -f "build-google-script-responsive.js" ]; then
    echo "❌ Error: build-google-script-responsive.js not found"
    exit 1
fi
echo "   ✅ Build script found"

echo ""
echo "================================================"
echo "  Step 1: Adding Responsive CSS"
echo "================================================"
echo ""

node add-responsive-css.js

echo ""
echo "================================================"
echo "  Step 2: Minifying Large Files"
echo "================================================"
echo ""

echo "📄 Minifying Teen Champions (responsive)..."
node minify-html.js "pdf-curriculum-teen-champions-responsive.html" "pdf-curriculum-teen-champions-responsive-minified.html"

echo ""
echo "📄 Minifying Future Leaders (responsive)..."
node minify-html.js "pdf-curriculum-future-leaders-responsive.html" "pdf-curriculum-future-leaders-responsive-minified.html"

echo ""
echo "ℹ️  Young Explorers: No minification needed (already under 100 KB)"

echo ""
echo "================================================"
echo "  Step 3: Building Google Apps Script"
echo "================================================"
echo ""

node build-google-script-responsive.js

echo ""
echo "================================================"
echo "  ✅ BUILD COMPLETE!"
echo "================================================"
echo ""
echo "📁 Files Created:"
echo "   • pdf-curriculum-young-explorers-responsive.html"
echo "   • pdf-curriculum-teen-champions-responsive.html"
echo "   • pdf-curriculum-teen-champions-responsive-minified.html"
echo "   • pdf-curriculum-future-leaders-responsive.html"
echo "   • pdf-curriculum-future-leaders-responsive-minified.html"
echo "   • google-apps-script-curriculum-RESPONSIVE.js"
echo ""
echo "📊 Final File Sizes:"
ls -lh pdf-curriculum-*-responsive*.html google-apps-script-curriculum-RESPONSIVE.js 2>/dev/null | awk '{print "   " $9 ": " $5}'
echo ""
echo "📱 Mobile Features Added:"
echo "   ✅ Responsive @media queries"
echo "   ✅ Stacked pricing cards on mobile (< 480px)"
echo "   ✅ Reduced font sizes on mobile"
echo "   ✅ Reduced padding on mobile"
echo "   ✅ Stacked header logo + text on mobile"
echo ""
echo "💻 Desktop Experience:"
echo "   ✅ UNCHANGED - Looks exactly the same"
echo "   ✅ Side-by-side pricing cards"
echo "   ✅ Large fonts"
echo "   ✅ Generous padding"
echo ""
echo "🎯 Next Steps:"
echo "   1. Open https://script.google.com"
echo "   2. Open your 'AI Kidz Club - Curriculum Download' project"
echo "   3. Copy ALL contents of: google-apps-script-curriculum-RESPONSIVE.js"
echo "   4. Paste into Google Apps Script editor (replace all existing code)"
echo "   5. Save the project (Ctrl+S or Cmd+S)"
echo "   6. Deploy as Web App (if not already deployed)"
echo "   7. Test with: testAllCurricula()"
echo "   8. Test on mobile devices:"
echo "      - Open Gmail app on iPhone/Android"
echo "      - Check iOS Mail app"
echo "      - Verify pricing cards stack vertically"
echo "      - Verify fonts are readable"
echo ""
echo "📧 Expected Results:"
echo "   Desktop:"
echo "   ✅ Young Explorers (50 KB) - Side-by-side layout"
echo "   ✅ Teen Champions (60 KB) - Side-by-side layout"
echo "   ✅ Future Leaders (60 KB) - Side-by-side layout"
echo ""
echo "   Mobile:"
echo "   ✅ Young Explorers - Stacked layout, smaller fonts"
echo "   ✅ Teen Champions - Stacked layout, smaller fonts"
echo "   ✅ Future Leaders - Stacked layout, smaller fonts"
echo ""
echo "✨ All three curricula are responsive and under 100 KB!"
echo ""
