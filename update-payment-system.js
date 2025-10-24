#!/usr/bin/env node

/**
 * AllPay Removal and Payment System Update Script
 *
 * This script removes AllPay integration and adds new payment notices
 * across all 4 HTML files (mobile.html, mobile-he.html, index.html, index-he.html)
 *
 * Usage:
 *   Dry run (preview): node update-payment-system.js --dry-run
 *   Apply changes:    node update-payment-system.js
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

// Translation dictionaries
const translations = {
  english: {
    programStartTitle: 'Program Start Date',
    programStartDate: 'First lesson: <strong>November 2nd, 2025</strong>',
    programStartLocation: 'Exact location will be confirmed shortly',
    requiredItemsTitle: 'Students MUST Bring:',
    requiredItems: [
      'Laptop or tablet (laptop is more recommended)',
      'Device charged (minimum 2-hour battery)',
      'Water bottle and snack (optional)'
    ],
    paymentTitle: 'Payment Information',
    firstLessonFree: 'First Lesson is FREE for all students!',
    paymentMethodsIntro: 'We currently accept the following payment methods:',
    paymentMethods: [
      'Bit transfers',
      'PayBox',
      'Bank transfers',
      'Cash payment',
      'Checks'
    ],
    creditCardsSoon: 'Credit card payments will be available soon!',
    successTitle: 'Registration Confirmed!',
    successMessage: 'Thank you for registering. You will receive a confirmation email shortly with all the details.',
    successDate: 'First lesson: November 2nd, 2025',
    successLocation: 'Location details will be sent to you before the start date.'
  },
  hebrew: {
    programStartTitle: 'תאריך תחילת התוכנית',
    programStartDate: 'שיעור ראשון: <strong>2 בנובמבר 2025</strong>',
    programStartLocation: 'המיקום המדויק יאושר בקרוב',
    requiredItemsTitle: 'התלמידים חייבים להביא:',
    requiredItems: [
      'מחשב נייד או טאבלט (מחשב נייד מומלץ יותר)',
      'מכשיר טעון (סוללה של 2 שעות לפחות)',
      'בקבוק מים וחטיף (אופציונלי)'
    ],
    paymentTitle: 'מידע על תשלום',
    firstLessonFree: 'השיעור הראשון חינם לכל התלמידים!',
    paymentMethodsIntro: 'אנו מקבלים כרגע את אמצעי התשלום הבאים:',
    paymentMethods: [
      'העברות Bit',
      'PayBox',
      'העברות בנקאיות',
      'תשלום במזומן',
      'המחאות'
    ],
    creditCardsSoon: 'תשלומי כרטיס אשראי יהיו זמינים בקרוב!',
    successTitle: 'ההרשמה אושרה!',
    successMessage: 'תודה שנרשמתם. תקבלו אימייל אישור בקרוב עם כל הפרטים.',
    successDate: 'שיעור ראשון: 2 בנובמבר 2025',
    successLocation: 'פרטי המיקום יישלחו אליכם לפני תאריך ההתחלה.'
  }
};

// HTML Template Generators

function generateProgramStartNotice(lang) {
  const t = translations[lang];
  return `
                <!-- Program Start Date Notice -->
                <div class="bg-amber-500/20 border-2 border-amber-400/50 rounded-xl p-5 mb-6">
                    <div class="flex items-start gap-3">
                        <svg class="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div>
                            <h3 class="text-lg font-bold text-white mb-2">${t.programStartTitle}</h3>
                            <p class="text-white/90">
                                ${t.programStartDate}
                            </p>
                            <p class="text-white/80 text-sm mt-1">
                                ${t.programStartLocation}
                            </p>
                        </div>
                    </div>
                </div>
`;
}

function generateRequiredItemsNotice(lang) {
  const t = translations[lang];
  const itemsHtml = t.requiredItems.map(item => `
                        <li class="flex items-start gap-2">
                            <span class="text-cyan-400 mt-1">-</span>
                            <span>${item}</span>
                        </li>`).join('');

  return `
                <!-- Required Items Notice -->
                <div class="bg-cyan-500/10 border-2 border-cyan-400/40 rounded-xl p-5 mb-6">
                    <h3 class="text-lg font-bold text-white mb-3">${t.requiredItemsTitle}</h3>
                    <ul class="space-y-2 text-white/90">${itemsHtml}
                    </ul>
                </div>
`;
}

function generatePaymentMethodsNotice(lang) {
  const t = translations[lang];
  const methodsHtml = t.paymentMethods.map(method => `
                            <li class="flex items-center gap-2">
                                <span class="text-cyan-400">-</span> ${method}
                            </li>`).join('');

  return `
                        <!-- Payment Methods Notice - Replaces AllPay -->
                        <div id="payment-methods-notice" class="bg-cyan-500/10 border-2 border-cyan-400/40 rounded-xl p-6">
                            <div class="mb-4">
                                <h3 class="text-xl font-bold text-white mb-3">${t.paymentTitle}</h3>
                                <div class="bg-green-500/20 border border-green-400/40 rounded-lg p-4 mb-4">
                                    <p class="text-white font-semibold text-lg">
                                        ${t.firstLessonFree}
                                    </p>
                                </div>
                                <p class="text-white/90 mb-4">
                                    ${t.paymentMethodsIntro}
                                </p>
                                <ul class="space-y-2 text-white/90 mb-4">${methodsHtml}
                                </ul>
                                <div class="bg-amber-500/20 border border-amber-400/40 rounded-lg p-4">
                                    <p class="text-white/95 font-semibold">
                                        ${t.creditCardsSoon}
                                    </p>
                                </div>
                            </div>
                        </div>
`;
}

// Processing Functions

function removeAllPayScripts(html) {
  log('  Removing AllPay script tags...', 'cyan');

  // Remove AllPay SDK script
  html = html.replace(/<script src="https:\/\/allpay\.to\/js\/allpay-hf\.js"><\/script>/g, '');
  html = html.replace(/<script src="https:\/\/cdn\.allpay\.to[^"]*"><\/script>/g, '');

  // Remove AllPay comment
  html = html.replace(/<!-- AllPay Hosted Fields SDK -->/g, '');
  html = html.replace(/<!-- AllPay Integration Scripts -->/g, '');

  return html;
}

function removeAllPayFunctions(html) {
  log('  Removing AllPay JavaScript functions...', 'cyan');

  // Remove AllpayInstance variable
  html = html.replace(/let AllpayInstance = null;?\n?/g, '');
  html = html.replace(/var AllpayInstance = null;?\n?/g, '');

  // Remove initializeAllPayPayment function
  html = html.replace(/async function initializeAllPayPayment\(\) \{[\s\S]*?^\s*\}/gm, '');

  // Remove createAllPayPayment function
  html = html.replace(/async function createAllPayPayment\(\) \{[\s\S]*?^\s*\}/gm, '');

  // Remove submitAllPayPayment function
  html = html.replace(/function submitAllPayPayment\(\) \{[\s\S]*?^\s*\}/gm, '');

  // Remove handleAllPaySuccess function
  html = html.replace(/function handleAllPaySuccess\([^)]*\) \{[\s\S]*?^\s*\}/gm, '');

  // Remove handleAllPayError function
  html = html.replace(/function handleAllPayError\([^)]*\) \{[\s\S]*?^\s*\}/gm, '');

  // Remove calls to AllPay functions
  html = html.replace(/await initializeAllPayPayment\(\);?\n?/g, '');
  html = html.replace(/initializeAllPayPayment\(\);?\n?/g, '');

  // Remove AllPay comments
  html = html.replace(/\/\*\*[\s\S]*?Initialize AllPay[\s\S]*?\*\//g, '');
  html = html.replace(/\/\/ Initialize AllPay[^\n]*\n/g, '');

  return html;
}

function removeAllPayElements(html) {
  log('  Removing AllPay HTML elements...', 'cyan');

  // Remove payment-iframe-container div and all its contents
  html = html.replace(/<div id="payment-iframe-container"[^>]*>[\s\S]*?<\/div>\s*<!-- (End|Close) payment-iframe-container -->/g, '');
  html = html.replace(/<div id="payment-iframe-container"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<!-- Payment methods/g, '<!-- Payment methods');

  // Remove standalone AllPay iframe if any
  html = html.replace(/<iframe[^>]*id="allpay-payment-iframe"[^>]*>[\s\S]*?<\/iframe>/g, '');

  // Remove AllPay submit button if standalone
  html = html.replace(/<button[^>]*onclick="submitAllPayPayment\(\)"[^>]*>[\s\S]*?<\/button>/g, '');

  // Remove credit card payment option from payment method selection
  html = html.replace(/<label[^>]*>\s*<input[^>]*name="payment-method"[^>]*value="credit-card"[\s\S]*?<\/label>/g, '');
  html = html.replace(/<label[^>]*>\s*<input[^>]*name="payment-method"[^>]*value="card"[\s\S]*?<\/label>/g, '');

  // Remove AllPay-specific comments
  html = html.replace(/<!-- AllPay[^>]*-->/g, '');

  return html;
}

function addProgramStartNotice(html, lang) {
  log('  Adding program start notice...', 'cyan');

  const notice = generateProgramStartNotice(lang);

  // Find Step 1 or registration form start and add notice before it
  // Look for common patterns in registration forms
  const patterns = [
    /(<div[^>]*id="step-1"[^>]*>)/,
    /(<div class="registration-form")/,
    /(<form[^>]*id="registration-form")/,
    /(<!-- Step 1:)/
  ];

  for (const pattern of patterns) {
    if (pattern.test(html)) {
      html = html.replace(pattern, notice + '$1');
      break;
    }
  }

  return html;
}

function addRequiredItemsNotice(html, lang) {
  log('  Adding required items notice...', 'cyan');

  const notice = generateRequiredItemsNotice(lang);

  // Add after program start notice or before payment section
  // Look for Step 3 or before Step 4
  const patterns = [
    /(<div[^>]*id="step-3"[^>]*>[\s\S]{0,500})/,
    /(<!-- Step 3:[\s\S]{0,500})/,
    /(<div[^>]*id="step-4"[^>]*>)/
  ];

  for (const pattern of patterns) {
    if (pattern.test(html)) {
      html = html.replace(pattern, '$1' + notice);
      break;
    }
  }

  return html;
}

function replacePaymentSection(html, lang) {
  log('  Replacing payment section with new notice...', 'cyan');

  const notice = generatePaymentMethodsNotice(lang);

  // Find Step 4 payment section and add notice there
  const step4Pattern = /(<div[^>]*id="step-4"[^>]*>[\s\S]{0,300})/;

  if (step4Pattern.test(html)) {
    html = html.replace(step4Pattern, '$1' + notice);
  }

  return html;
}

function updateSuccessMessages(html, lang) {
  log('  Updating success messages...', 'cyan');

  const t = translations[lang];

  // Update success modal content
  html = html.replace(
    /(<div[^>]*class="[^"]*success[^"]*"[\s\S]{0,200})<h[23][^>]*>[^<]*<\/h[23]>/,
    `$1<h2 class="text-2xl font-bold text-white mb-4">${t.successTitle}</h2>`
  );

  // Add November 2nd date and location notice to success messages
  const successDateNotice = `
                <p class="text-white/90 text-lg mb-3">
                    ${t.successMessage}
                </p>
                <p class="text-white font-semibold text-lg mb-2">
                    ${t.successDate}
                </p>
                <p class="text-white/80">
                    ${t.successLocation}
                </p>
  `;

  // Find success modal content area and add date info
  html = html.replace(
    /(<div[^>]*class="[^"]*success[^"]*"[\s\S]{0,300}<h2[^>]*>[^<]*<\/h2>)/,
    '$1' + successDateNotice
  );

  return html;
}

function detectLanguage(filename) {
  if (filename.includes('-he')) {
    return 'hebrew';
  }
  return 'english';
}

function processFile(filePath, dryRun = false) {
  const filename = path.basename(filePath);
  const lang = detectLanguage(filename);

  log(`\nProcessing ${filename} (${lang})...`, 'blue');

  if (!fs.existsSync(filePath)) {
    log(`  ERROR: File not found: ${filePath}`, 'red');
    return false;
  }

  // Read file
  let html = fs.readFileSync(filePath, 'utf8');
  const originalLength = html.length;

  // Create backup
  if (!dryRun) {
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, html, 'utf8');
    log(`  Created backup: ${path.basename(backupPath)}`, 'green');
  }

  // Apply all transformations
  html = removeAllPayScripts(html);
  html = removeAllPayFunctions(html);
  html = removeAllPayElements(html);
  html = addProgramStartNotice(html, lang);
  html = addRequiredItemsNotice(html, lang);
  html = replacePaymentSection(html, lang);
  html = updateSuccessMessages(html, lang);

  const newLength = html.length;
  const diff = newLength - originalLength;
  const diffSign = diff > 0 ? '+' : '';

  log(`  Size change: ${diffSign}${diff} bytes`, diff > 0 ? 'green' : 'yellow');

  if (dryRun) {
    log(`  DRY RUN: Changes NOT saved`, 'yellow');
  } else {
    fs.writeFileSync(filePath, html, 'utf8');
    log(`  Changes saved successfully`, 'green');
  }

  return true;
}

// Validation function
function validateChanges(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);

  log(`\nValidating ${filename}...`, 'blue');

  const checks = [
    { name: 'AllPay scripts removed', test: !html.includes('allpay.to/js/') },
    { name: 'AllPay functions removed', test: !html.includes('AllpayInstance') },
    { name: 'AllPay iframe removed', test: !html.includes('allpay-payment-iframe') },
    { name: 'Program start notice added', test: html.includes('November 2nd, 2025') || html.includes('2 בנובמבר 2025') },
    { name: 'Required items added', test: html.includes('Students MUST Bring') || html.includes('התלמידים חייבים להביא') },
    { name: 'Payment methods notice added', test: html.includes('First Lesson is FREE') || html.includes('השיעור הראשון חינם') }
  ];

  let allPassed = true;
  checks.forEach(check => {
    if (check.test) {
      log(`  ✓ ${check.name}`, 'green');
    } else {
      log(`  ✗ ${check.name}`, 'red');
      allPassed = false;
    }
  });

  return allPassed;
}

// Main execution
function main() {
  const dryRun = process.argv.includes('--dry-run');

  log('\n========================================', 'cyan');
  log('AllPay Removal & Payment System Update', 'cyan');
  log('========================================\n', 'cyan');

  if (dryRun) {
    log('DRY RUN MODE - No changes will be saved\n', 'yellow');
  }

  const files = [
    'public/mobile.html',
    'public/mobile-he.html',
    'public/index.html',
    'public/index-he.html'
  ];

  let successCount = 0;
  const processed = [];

  // Process each file
  files.forEach(file => {
    if (processFile(file, dryRun)) {
      successCount++;
      processed.push(file);
    }
  });

  // Validation (only if not dry run)
  if (!dryRun && successCount > 0) {
    log('\n========================================', 'cyan');
    log('Validating Changes', 'cyan');
    log('========================================', 'cyan');

    let allValid = true;
    processed.forEach(file => {
      if (!validateChanges(file)) {
        allValid = false;
      }
    });

    if (allValid) {
      log('\n✓ All validations passed!', 'green');
    } else {
      log('\n✗ Some validations failed. Please review.', 'red');
    }
  }

  // Summary
  log('\n========================================', 'cyan');
  log('Summary', 'cyan');
  log('========================================', 'cyan');
  log(`Files processed: ${successCount}/${files.length}`, successCount === files.length ? 'green' : 'yellow');

  if (!dryRun && successCount > 0) {
    log('\nBackup files created with .backup extension', 'green');
    log('To restore: node restore-from-backup.js', 'cyan');
  }

  if (dryRun) {
    log('\nTo apply changes, run: node update-payment-system.js', 'yellow');
  } else {
    log('\nNext steps:', 'cyan');
    log('1. Test each HTML file in browser', 'white');
    log('2. Verify registration flow works', 'white');
    log('3. Check both English and Hebrew versions', 'white');
    log('4. Commit changes if everything works', 'white');
  }

  log('\n');
}

// Run main function
main();
