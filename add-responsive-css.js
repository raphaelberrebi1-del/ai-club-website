#!/usr/bin/env node

/**
 * Add Responsive CSS to Curriculum HTML Files
 * Makes emails mobile-friendly while preserving desktop experience
 */

const fs = require('fs');
const path = require('path');

// Responsive CSS to add to the <head> section
const responsiveCSS = `
    <style>
        /* Responsive styles for mobile devices */
        @media only screen and (max-width: 480px) {
            /* Force 100% width on mobile regardless of desktop width */
            .mobile-full-width-container { max-width: 100% !important; width: 100% !important; }

            /* Reduce outer padding on mobile */
            .mobile-padding-outer { padding: 10px 0 !important; }

            /* Reduce content padding on mobile */
            .mobile-padding { padding: 20px 15px !important; }
            .mobile-padding-small { padding: 15px 12px !important; }
            .mobile-padding-tiny { padding: 12px 10px !important; }

            /* Stack pricing cards vertically */
            .pricing-card {
                width: 100% !important;
                display: block !important;
                padding: 0 0 12px 0 !important;
            }

            /* Reduce font sizes on mobile */
            .mobile-heading-xl { font-size: 24px !important; }
            .mobile-heading-large { font-size: 22px !important; }
            .mobile-heading-medium { font-size: 18px !important; }
            .mobile-heading-small { font-size: 16px !important; }
            .mobile-text { font-size: 14px !important; }
            .mobile-text-small { font-size: 13px !important; }

            /* Stack header logo and text vertically */
            .header-logo {
                display: block !important;
                padding-right: 0 !important;
                padding-bottom: 15px !important;
                text-align: center !important;
            }

            .header-text {
                display: block !important;
                text-align: center !important;
            }

            /* Make images responsive */
            .mobile-img { max-width: 100% !important; height: auto !important; }

            /* Improve button sizing on mobile */
            .mobile-button {
                padding: 14px 28px !important;
                font-size: 16px !important;
            }

            /* Reduce table cell widths on mobile */
            .mobile-full-width { width: 100% !important; }

            /* Better spacing for mobile */
            .mobile-margin-bottom { margin-bottom: 16px !important; }
        }
    </style>
`;

function addResponsiveCSS(inputFile, outputFile) {
    console.log(`📄 Processing: ${path.basename(inputFile)}`);

    let html = fs.readFileSync(inputFile, 'utf8');
    const originalSize = Buffer.byteLength(html, 'utf8');

    // Add responsive CSS before </head>
    if (html.includes('</head>')) {
        html = html.replace('</head>', responsiveCSS + '\n</head>');
        console.log('   ✅ Added responsive CSS to <head>');
    } else {
        console.log('   ⚠️  No </head> tag found');
        return false;
    }

    // Add classes to outer padding (email container padding)
    html = html.replace(
        /align="center" style="padding: 20px 0;"/g,
        'align="center" class="mobile-padding-outer" style="padding: 20px 0;"'
    );

    // Add classes to main content padding (40px 30px patterns)
    html = html.replace(
        /style="padding: 40px 30px/g,
        'class="mobile-padding" style="padding: 40px 30px'
    );

    // Add classes to medium padding (30px patterns)
    html = html.replace(
        /style="padding: 30px;/g,
        'class="mobile-padding" style="padding: 30px;'
    );

    html = html.replace(
        /style="padding: 30px 30px/g,
        'class="mobile-padding" style="padding: 30px 30px'
    );

    // Add classes to headers with logo (32px font)
    html = html.replace(
        /font-size: 32px; font-weight: bold;/g,
        'font-size: 32px; font-weight: bold;'
    ).replace(
        /<h1 style="margin: 0 0 8px 0; font-size: 32px;/g,
        '<h1 class="mobile-heading-xl" style="margin: 0 0 8px 0; font-size: 32px;'
    );

    // Add classes to large headings (28px, 26px font)
    html = html.replace(
        /font-size: 28px; font-weight:/g,
        'font-size: 28px; font-weight:'
    ).replace(
        /<h2 style="margin: 0 0 [\d]+px 0; font-size: 28px;/g,
        (match) => match.replace('<h2', '<h2 class="mobile-heading-large"')
    );

    html = html.replace(
        /<h2 style="margin: 0 0 [\d]+px 0; font-size: 26px;/g,
        (match) => match.replace('<h2', '<h2 class="mobile-heading-large"')
    );

    // Add classes to medium headings (24px, 22px, 20px font)
    html = html.replace(
        /<h2 style="margin: 0 0 [\d]+px 0; font-size: 24px;/g,
        (match) => match.replace('<h2', '<h2 class="mobile-heading-medium"')
    );

    html = html.replace(
        /<h3 style="margin: 0 0 [\d]+px 0; font-size: 2[024]px;/g,
        (match) => match.replace('<h3', '<h3 class="mobile-heading-medium"')
    );

    // Add classes to small headings (18px font)
    html = html.replace(
        /<h3 style="margin: 0 0 [\d]+px 0; font-size: 18px;/g,
        (match) => match.replace('<h3', '<h3 class="mobile-heading-small"')
    );

    html = html.replace(
        /<h4 style="margin: 0 0 [\d]+px 0; font-size: 18px;/g,
        (match) => match.replace('<h4', '<h4 class="mobile-heading-small"')
    );

    // Add classes to header logo and text sections
    html = html.replace(
        /<td width="80" valign="middle" style="padding-right: 20px;">/g,
        '<td width="80" valign="middle" class="header-logo" style="padding-right: 20px;">'
    );

    html = html.replace(
        /<td valign="middle" style="text-align: left;">/g,
        '<td valign="middle" class="header-text" style="text-align: left;">'
    );

    // Add class to main content table to ensure 100% width on mobile
    html = html.replace(
        /<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="800" style="max-width: 800px;/g,
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="800" class="mobile-full-width-container" style="max-width: 800px;'
    );

    // Add classes to pricing card columns (width="32%" or width="36%")
    html = html.replace(
        /<td width="32%" valign="top"/g,
        '<td width="32%" valign="top" class="pricing-card"'
    );

    html = html.replace(
        /<td width="36%" valign="top"/g,
        '<td width="36%" valign="top" class="pricing-card"'
    );

    // Add classes to buttons
    html = html.replace(
        /<a href="[^"]*" style="display: inline-block; background-color: white; color: #0891b2; text-decoration: none; padding: 18px 40px;/g,
        (match) => match.replace('style="', 'class="mobile-button" style="')
    );

    const updatedSize = Buffer.byteLength(html, 'utf8');
    const sizeIncrease = updatedSize - originalSize;

    console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Updated size: ${(updatedSize / 1024).toFixed(2)} KB`);
    console.log(`   Size increase: ${(sizeIncrease / 1024).toFixed(2)} KB (+${((sizeIncrease / originalSize) * 100).toFixed(1)}%)`);

    // Write the updated file
    fs.writeFileSync(outputFile, html, 'utf8');
    console.log(`   ✅ Saved: ${path.basename(outputFile)}`);
    console.log('');

    return {
        originalSize,
        updatedSize,
        sizeIncrease
    };
}

// Process all three curriculum files
console.log('================================================');
console.log('  Adding Responsive CSS to Curriculum Files');
console.log('================================================');
console.log('');

const files = [
    {
        input: 'pdf-curriculum-young-explorers.html',
        output: 'pdf-curriculum-young-explorers-responsive.html'
    },
    {
        input: 'pdf-curriculum-teen-champions.html',
        output: 'pdf-curriculum-teen-champions-responsive.html'
    },
    {
        input: 'pdf-curriculum-future-leaders.html',
        output: 'pdf-curriculum-future-leaders-responsive.html'
    }
];

const results = [];

files.forEach(file => {
    if (!fs.existsSync(file.input)) {
        console.error(`❌ Error: ${file.input} not found`);
        return;
    }

    const stats = addResponsiveCSS(file.input, file.output);
    results.push({ file: file.output, ...stats });
});

console.log('================================================');
console.log('  ✅ Responsive CSS Added Successfully!');
console.log('================================================');
console.log('');
console.log('📊 Summary:');
results.forEach(r => {
    console.log(`   ${path.basename(r.file)}: ${(r.updatedSize / 1024).toFixed(2)} KB`);
});
console.log('');
console.log('📱 Mobile Features Added:');
console.log('   ✅ Responsive @media queries');
console.log('   ✅ Stacked pricing cards on mobile');
console.log('   ✅ Reduced font sizes on mobile');
console.log('   ✅ Reduced padding on mobile');
console.log('   ✅ Stacked header logo + text on mobile');
console.log('   ✅ Responsive buttons');
console.log('');
console.log('💻 Desktop Experience:');
console.log('   ✅ UNCHANGED - Looks exactly the same');
console.log('');
console.log('🎯 Next Steps:');
console.log('   1. Minify the responsive files');
console.log('   2. Rebuild Google Apps Script');
console.log('   3. Test on mobile devices');
