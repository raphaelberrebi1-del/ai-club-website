# Complete Registration System Upgrade Guide

**Date:** October 26, 2025
**Version:** 3.0
**Author:** Claude Code

---

## 📋 Overview

This guide implements a comprehensive upgrade to the AI Kids Club registration system including:

1. ✅ Duplicate free trial detection
2. ✅ Smart "First Lesson FREE" banner (only for new users)
3. ✅ Step-by-step lead tracking
4. ✅ Email validation
5. ✅ Registration confirmation numbers
6. ✅ BCC on all confirmation emails
7. ✅ Better error handling
8. ✅ Multiple children support

---

## 🎯 Business Logic Summary

### "First Lesson FREE" Banner Display Rules:
- **Free Trial Registration:** Always show banner + ₪0
- **New User (Paid Plan):** Show banner + actual price
- **Existing User (Paid Plan):** Hide banner, just show actual price
- **Existing User (Free Trial Again):** BLOCK with error message

### Duplicate Free Trial Prevention:
- Check Google Sheets for existing registration by: Email, Parent Name, or Child Name
- If found previous free trial → Block new free trial attempt
- If found previous free trial → Allow paid plan upgrade

### Lead Tracking:
- Track progression through all 4 steps
- Store in "Lead Tracking" sheet for analytics and nurturing
- Update same session row as user progresses
- Mark as "Completed" when registration finishes

---

## 📂 Files That Need Updates

### Google Apps Script (2 files):
1. `google-apps-script-registration-ENGLISH-UPDATED.js`
2. `google-apps-script-registration-hebrew-UPDATED.js`

### Website Forms (4 files):
3. `public/index.html`
4. `public/index-he.html`
5. `public/mobile.html`
6. `public/mobile-he.html`

---

## 🛠️ Part 1: Google Apps Script Changes

### Step 1.1: Add Helper Functions (Add at top after doPost)

```javascript
/**
 * Validate email format
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate unique registration ID
 */
function generateRegistrationId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `REG-${timestamp}-${random}`;
}

/**
 * Check if user exists in system and their history
 * Returns: { exists: boolean, hadFreeTrial: boolean, childNames: [] }
 */
function checkExistingUser(email, parentName, childNames) {
  const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
  const sheet = ss.getSheetByName('Registrations');
  const data = sheet.getDataRange().getValues();

  // Skip header row (row 0)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowEmail = row[2]; // Column C - email
    const rowParentName = row[1]; // Column B - parent name
    const rowChildrenJSON = row[4]; // Column E - children JSON
    const rowPrice = row[7]; // Column H - totalPrice

    // Check email match (primary)
    const emailMatch = rowEmail && email &&
      rowEmail.toString().toLowerCase().trim() === email.toString().toLowerCase().trim();

    // Check parent name match (secondary)
    const nameMatch = rowParentName && parentName &&
      rowParentName.toString().toLowerCase().trim() === parentName.toString().toLowerCase().trim();

    // Check child name match (tertiary)
    let childMatch = false;
    if (rowChildrenJSON && childNames && childNames.length > 0) {
      try {
        const rowChildren = JSON.parse(rowChildrenJSON);
        if (Array.isArray(rowChildren)) {
          for (const inputChildName of childNames) {
            const inputNameLower = inputChildName.toString().toLowerCase().trim();
            childMatch = rowChildren.some(child =>
              child.name && child.name.toString().toLowerCase().trim() === inputNameLower
            );
            if (childMatch) break;
          }
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }

    // If any match found
    if (emailMatch || nameMatch || childMatch) {
      const hadFreeTrial = !rowPrice || parseFloat(rowPrice) === 0;
      const existingChildNames = [];

      try {
        const rowChildren = JSON.parse(rowChildrenJSON);
        if (Array.isArray(rowChildren)) {
          rowChildren.forEach(child => {
            if (child.name) existingChildNames.push(child.name);
          });
        }
      } catch (e) {}

      return {
        exists: true,
        hadFreeTrial: hadFreeTrial,
        childNames: existingChildNames
      };
    }
  }

  return {
    exists: false,
    hadFreeTrial: false,
    childNames: []
  };
}

/**
 * Update lead tracking sheet to mark as completed
 */
function updateLeadTracking(sessionId, status) {
  if (!sessionId) return;

  try {
    const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
    let sheet = ss.getSheetByName('Lead Tracking');

    if (!sheet) return; // Sheet doesn't exist yet

    const data = sheet.getDataRange().getValues();

    // Find row with matching session ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === sessionId) {
        // Update status column (column D = index 3)
        sheet.getRange(i + 1, 4).setValue(status);
        // Update last activity time
        sheet.getRange(i + 1, 11).setValue(new Date());
        return;
      }
    }
  } catch (error) {
    // Don't block registration if tracking update fails
    console.error('Lead tracking update failed:', error);
  }
}
```

### Step 1.2: Replace doPost Function

Replace the entire existing `doPost` function with this updated version:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Validate email format first
    if (!isValidEmail(data.email)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'invalid_email',
        message: 'Please enter a valid email address.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
    const sheet = ss.getSheetByName('Registrations');

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const isFreeTrialRegistration = !data.totalPrice || parseFloat(data.totalPrice) === 0;

    // Extract child names for checking
    const childNames = [];
    if (data.children && Array.isArray(data.children)) {
      data.children.forEach(child => {
        if (child.name) childNames.push(child.name);
      });
    }

    // Check if user already exists in system
    const userHistory = checkExistingUser(data.email, data.parentName, childNames);

    // Block duplicate free trials
    if (isFreeTrialRegistration && userHistory.hadFreeTrial) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'duplicate_free_trial',
        message: 'This user has already registered for a free trial. Please select a paid plan or contact us at raphael@aikidz.club for assistance.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Generate unique registration ID
    const registrationId = generateRegistrationId();

    // Process registration data
    const timestamp = new Date();
    const rowData = [
      timestamp,
      registrationId, // NEW: Registration ID
      data.parentName || '',
      data.email || '',
      data.phone || '',
      data.children ? JSON.stringify(data.children) : '',
      data.paymentPlan || '',
      data.paymentMethod || '',
      data.totalPrice || 0,
      data.language || 'english',
      data.referralSource || '',
      data.preferredContactMethod || '',
      data.additionalInfo || '',
      'Pending' // NEW: Payment Status
    ];

    sheet.appendRow(rowData);

    // Determine if "First Lesson FREE" banner should show
    // Show for: Free trials OR New users only
    const showFirstLessonFree = isFreeTrialRegistration || !userHistory.exists;

    // Send confirmation email
    const groupAssignments = {}; // Process group assignments if needed
    sendConfirmation(data.email, data, groupAssignments, showFirstLessonFree, registrationId);

    // Update lead tracking to "Completed"
    if (data.sessionId) {
      updateLeadTracking(data.sessionId, 'Completed');
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Registration successful',
      registrationId: registrationId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 1.3: Update sendConfirmation Function Signature

Find the line that says:
```javascript
function sendConfirmation(email, data, groupAssignments) {
```

Replace with:
```javascript
function sendConfirmation(email, data, groupAssignments, showFirstLessonFree, registrationId) {
```

### Step 1.4: Update "First Lesson FREE" Banner Logic

Find the section around line 102-112 that creates `firstLessonFreeNotice`.

Replace:
```javascript
  // First lesson FREE highlight (shown for ALL registrations)
  const firstLessonFreeNotice = `
```

With:
```javascript
  // First lesson FREE highlight (conditional based on user status)
  const firstLessonFreeNotice = showFirstLessonFree ? `
```

Make sure to keep the closing ` : '';` at the end:
```javascript
  ` : '';
```

### Step 1.5: Update Payment Instructions for Free Trial

The free trial payment section should remain as you recently updated it (showing ₪0).

### Step 1.6: Add Registration ID to Email

Find the section where the email body HTML is assembled (around line 236-245).

After the greeting section, add registration ID display:

```javascript
          <div style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for registering with AI Kids Club! We're excited to welcome your child to our innovative AI education program.
          </div>

          <!-- Registration ID -->
          <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%); padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #06b6d4;">
            <div style="color: #0891b2; font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              Registration Confirmation
            </div>
            <div style="color: #0f172a; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace;">
              ${registrationId}
            </div>
            <div style="color: #475569; font-size: 13px; margin-top: 4px;">
              Please save this number for your records
            </div>
          </div>
```

### Step 1.7: Add BCC to Email Send

Find the `GmailApp.sendEmail` call (near the end of sendConfirmation function).

Update from:
```javascript
    GmailApp.sendEmail(email, subject, plainTextBody, {
      htmlBody: htmlBody,
      name: 'AI Kids Club',
      replyTo: 'raphael@aikidz.club'
    });
```

To:
```javascript
    GmailApp.sendEmail(email, subject, plainTextBody, {
      htmlBody: htmlBody,
      name: 'AI Kids Club',
      replyTo: 'raphael@aikidz.club',
      bcc: 'raphael@aikidz.club' // ← You get copy of all emails
    });
```

### Step 1.8: Add Lead Tracking Function (Separate Script/Function)

This should be added as a SEPARATE function (you can deploy it as a separate web app endpoint):

```javascript
/**
 * Lead Tracking Endpoint
 * Deploy as separate web app for tracking step progression
 */
function doPostTracking(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
    let sheet = ss.getSheetByName('Lead Tracking');

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Lead Tracking');
      sheet.appendRow([
        'Timestamp',
        'Session ID',
        'Last Step',
        'Status',
        'Child Count',
        'Children (JSON)',
        'Payment Plan',
        'Parent Name',
        'Email',
        'Phone',
        'Last Activity'
      ]);
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 11);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#06b6d4');
      headerRange.setFontColor('#ffffff');
    }

    const sessionId = data.sessionId;
    const timestamp = new Date();

    // Check if session already exists
    const dataRange = sheet.getDataRange().getValues();
    let existingRow = -1;

    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][1] === sessionId) {
        existingRow = i + 1; // Convert to 1-indexed
        break;
      }
    }

    if (existingRow > 0) {
      // Update existing row
      sheet.getRange(existingRow, 3).setValue(data.step); // Last Step
      sheet.getRange(existingRow, 4).setValue('In Progress'); // Status
      sheet.getRange(existingRow, 5).setValue(data.data.childCount || ''); // Child Count

      if (data.data.children) {
        sheet.getRange(existingRow, 6).setValue(JSON.stringify(data.data.children)); // Children
      }
      if (data.data.paymentPlan) {
        sheet.getRange(existingRow, 7).setValue(data.data.paymentPlan); // Payment Plan
      }
      if (data.data.parentName) {
        sheet.getRange(existingRow, 8).setValue(data.data.parentName); // Parent Name
      }
      if (data.data.parentEmail) {
        sheet.getRange(existingRow, 9).setValue(data.data.parentEmail); // Email
      }
      if (data.data.parentPhone) {
        sheet.getRange(existingRow, 10).setValue(data.data.parentPhone); // Phone
      }

      sheet.getRange(existingRow, 11).setValue(timestamp); // Last Activity
    } else {
      // Create new row
      sheet.appendRow([
        timestamp,
        sessionId,
        data.step,
        'In Progress',
        data.data.childCount || '',
        data.data.children ? JSON.stringify(data.data.children) : '',
        data.data.paymentPlan || '',
        data.data.parentName || '',
        data.data.parentEmail || '',
        data.data.parentPhone || '',
        timestamp
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      sessionId: sessionId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## ⚠️ IMPORTANT: Apply Same Changes to Hebrew Script

All the changes above must be applied to BOTH:
- `google-apps-script-registration-ENGLISH-UPDATED.js`
- `google-apps-script-registration-hebrew-UPDATED.js`

The Hebrew version needs:
- Same function names (in English)
- Same logic
- Hebrew text in the email templates
- Registration ID section in Hebrew

---

## 🌐 Part 2: Website Form Updates

### Changes Needed in All 4 HTML Files:
1. `public/index.html`
2. `public/index-he.html`
3. `public/mobile.html`
4. `public/mobile-he.html`

### Step 2.1: Add Session Tracking (Add at top of `<script>` section)

```javascript
// Generate or retrieve session ID for lead tracking
let sessionId = localStorage.getItem('registrationSessionId');
if (!sessionId) {
  sessionId = 'SESSION-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  localStorage.setItem('registrationSessionId', sessionId);
}
```

### Step 2.2: Add Tracking Function

```javascript
/**
 * Track step progression for lead nurturing
 */
async function trackStepProgression(completedStep) {
  const trackingData = {
    sessionId: sessionId,
    step: completedStep,
    timestamp: new Date().toISOString(),
    data: {
      childCount: wizardData.childCount,
      children: completedStep >= 1 ? wizardData.children : null,
      paymentPlan: completedStep >= 2 ? wizardData.bulkDuration : null,
      parentName: completedStep >= 3 ? wizardData.parentName : null,
      parentEmail: completedStep >= 3 ? wizardData.parentEmail : null,
      parentPhone: completedStep >= 3 ? wizardData.parentPhone : null
    }
  };

  try {
    await fetch('YOUR_TRACKING_SCRIPT_URL_HERE', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData)
    });
  } catch (error) {
    console.error('Tracking failed:', error);
    // Don't block user progress if tracking fails
  }
}
```

### Step 2.3: Add Email Validation Function

```javascript
/**
 * Validate email format
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Step 2.4: Update nextStep() to Track Progress

Find the `nextStep()` function and update it to track before moving:

```javascript
async function nextStep() {
    if (currentWizardStep === 1) {
        if (!validateStep1()) return;
        await trackStepProgression(1); // ← Add tracking
    } else if (currentWizardStep === 2) {
        if (!validateStep2()) return;
        await trackStepProgression(2); // ← Add tracking
    } else if (currentWizardStep === 3) {
        if (!validateStep3()) return;
        await trackStepProgression(3); // ← Add tracking
    }

    // Rest of existing nextStep logic...
    const currentStepEl = document.getElementById(`step-${currentWizardStep}`);
    const nextStepEl = document.getElementById(`step-${currentWizardStep + 1}`);

    if (currentStepEl && nextStepEl) {
        currentStepEl.classList.add('hidden');
        nextStepEl.classList.remove('hidden');
        currentWizardStep++;
        updateProgressIndicator();
    }
}
```

### Step 2.5: Add Error Display Functions

```javascript
/**
 * Show error message banner
 */
function showError(message) {
  // Remove any existing error banners
  const existingErrors = document.querySelectorAll('.error-banner');
  existingErrors.forEach(banner => banner.remove());

  // Create error banner
  const errorBanner = document.createElement('div');
  errorBanner.className = 'error-banner bg-red-500/20 border-2 border-red-400 rounded-xl p-4 mb-6 animate-fadeIn';
  errorBanner.innerHTML = `
    <div class="flex items-start gap-3">
      <span class="text-red-400 text-2xl flex-shrink-0">⚠️</span>
      <div class="flex-1">
        <div class="text-white font-semibold text-lg mb-1">Registration Error</div>
        <div class="text-white/90 text-sm">${message}</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-white/60 hover:text-white text-xl leading-none">&times;</button>
    </div>
  `;

  // Insert at top of current step
  const currentStep = document.getElementById(`step-${currentWizardStep}`);
  if (currentStep) {
    currentStep.insertBefore(errorBanner, currentStep.firstChild);
    // Scroll to top to see error
    currentStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Auto-remove after 15 seconds
  setTimeout(() => {
    if (errorBanner.parentElement) {
      errorBanner.remove();
    }
  }, 15000);
}

/**
 * Show success page after registration
 */
function showSuccessPage(registrationId) {
  // Clear session storage
  localStorage.removeItem('registrationSessionId');

  // Find the registration wizard container
  const wizardContainer = document.querySelector('.step-content')?.parentElement ||
                          document.getElementById('registration-wizard') ||
                          document.querySelector('[class*="wizard"]');

  if (wizardContainer) {
    wizardContainer.innerHTML = `
      <div class="text-center py-12 px-6">
        <div class="text-7xl mb-6 animate-bounce">✅</div>
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Registration Confirmed!</h2>

        <div class="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-400/30 rounded-xl p-6 max-w-lg mx-auto mb-6">
          <p class="text-white/90 text-lg mb-6">Thank you for registering with AI Kids Club!</p>

          <div class="bg-black/40 rounded-lg p-4 mb-6">
            <div class="text-sm text-white/60 mb-2">Registration Confirmation</div>
            <div class="text-2xl font-mono font-bold text-cyan-400 break-all">${registrationId}</div>
            <div class="text-xs text-white/50 mt-2">Please save this number for your records</div>
          </div>

          <div class="space-y-3 text-left">
            <div class="flex items-start gap-3 text-white/80">
              <span class="text-xl">✉️</span>
              <span>Check your email for confirmation details</span>
            </div>
            <div class="flex items-start gap-3 text-white/80">
              <span class="text-xl">📅</span>
              <span>First lesson: <strong class="text-white">November 2nd, 2025</strong></span>
            </div>
            <div class="flex items-start gap-3 text-white/80">
              <span class="text-xl">📍</span>
              <span>Location will be confirmed shortly</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <a href="https://wa.me/972543159025?text=Hi%2C%20I%20just%20registered%20for%20AI%20Kids%20Club"
             target="_blank"
             class="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Questions? WhatsApp Us
          </a>

          <div class="text-white/60 text-sm">
            Or call us at <a href="tel:+972543159025" class="text-cyan-400 hover:underline">054-315-9025</a>
          </div>
        </div>
      </div>
    `;
  }
}
```

### Step 2.6: Update submitRegistration() Function

Find and replace the entire `submitRegistration()` function:

```javascript
async function submitRegistration() {
    const submitButton = document.getElementById('step-4-next');

    // Show loading state
    submitButton.disabled = true;
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Submitting...';

    // Validate email format
    if (!isValidEmail(wizardData.parentEmail)) {
        showError('Please enter a valid email address.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        return;
    }

    // Calculate total amount (this should already exist in your code)
    const totalAmount = calculateTotalAmount(); // Use your existing calculation

    const registrationData = {
        sessionId: sessionId,
        parentName: wizardData.parentName,
        email: wizardData.parentEmail,
        phone: wizardData.parentPhone,
        children: wizardData.children,
        paymentPlan: wizardData.bulkDuration,
        paymentMethod: wizardData.paymentMethod,
        totalPrice: totalAmount,
        language: 'english', // or 'hebrew' for Hebrew pages
        referralSource: wizardData.referralSource || '',
        preferredContactMethod: wizardData.preferredContactMethod || 'email',
        additionalInfo: wizardData.additionalInfo || ''
    };

    try {
        const response = await fetch('YOUR_GOOGLE_SCRIPT_URL_HERE', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData)
        });

        const result = await response.json();

        if (!result.success) {
            // Handle specific error types
            if (result.error === 'duplicate_free_trial') {
                showError('You have already registered for a free trial. Please select a paid plan or contact us at <a href="mailto:raphael@aikidz.club" class="underline">raphael@aikidz.club</a> for assistance.');
            } else if (result.error === 'invalid_email') {
                showError('Please enter a valid email address.');
            } else {
                showError('Registration failed: ' + (result.message || 'Please try again or contact us for assistance.'));
            }

            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }

        // Success! Show success page
        showSuccessPage(result.registrationId);

    } catch (error) {
        console.error('Registration error:', error);
        showError('Unable to complete registration. Please check your internet connection and try again. If the problem persists, contact us at <a href="tel:+972543159025" class="underline">054-315-9025</a>.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}
```

---

## 📊 Google Sheets Updates

### Update "Registrations" Sheet Columns

Your "Registrations" sheet should now have these columns:

```
Column A: Timestamp
Column B: Registration ID (NEW)
Column C: Parent Name
Column D: Email
Column E: Phone
Column F: Children (JSON)
Column G: Payment Plan
Column H: Payment Method
Column I: Total Price
Column J: Language
Column K: Referral Source
Column L: Preferred Contact
Column M: Additional Info
Column N: Payment Status (NEW)
```

**Action Required:**
1. Open your Google Sheet
2. Insert a new column after "Timestamp" (becomes column B)
3. Name it "Registration ID"
4. Add a new column at the end called "Payment Status"
5. Set default value to "Pending" for all existing rows

### Create "Lead Tracking" Sheet

The `doPostTracking` function will create this automatically when first called, but you can manually create it:

```
Column A: Timestamp
Column B: Session ID
Column C: Last Step
Column D: Status
Column E: Child Count
Column F: Children (JSON)
Column G: Payment Plan
Column H: Parent Name
Column I: Email
Column J: Phone
Column K: Last Activity
```

---

## 🚀 Deployment Steps

### Phase 1: Deploy Google Apps Script

1. **Update English Script:**
   - Open Google Apps Script editor
   - Apply all changes to `sendConfirmation` function
   - Add all new helper functions
   - Replace `doPost` function
   - Save as new version

2. **Update Hebrew Script:**
   - Apply same changes with Hebrew text
   - Save as new version

3. **Add Tracking Script:**
   - Create new `.gs` file or add `doPostTracking` function
   - Deploy as separate web app
   - Get tracking URL

4. **Deploy Both Scripts:**
   - Click "Deploy" → "New deployment"
   - Choose "Web app"
   - Execute as: Me
   - Who has access: Anyone
   - Copy deployment URLs

### Phase 2: Update Website Forms

1. **Update All 4 HTML Files:**
   - Add session tracking code
   - Add tracking function
   - Add validation functions
   - Update `nextStep()` function
   - Update `submitRegistration()` function
   - Add success/error display functions

2. **Update Script URLs:**
   - Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with actual registration URL
   - Replace `YOUR_TRACKING_SCRIPT_URL_HERE` with actual tracking URL

3. **Set Language:**
   - English files: `language: 'english'`
   - Hebrew files: `language: 'hebrew'`

### Phase 3: Testing

1. **Test Free Trial (New User):**
   - Should show "First Lesson FREE" + ₪0
   - Should track all 4 steps
   - Should receive confirmation email with registration ID
   - You should receive BCC copy

2. **Test Free Trial (Existing User):**
   - Should show error: "Already used free trial"
   - Should NOT create registration
   - Should NOT send email

3. **Test Paid Plan (New User):**
   - Should show "First Lesson FREE" + actual price
   - Should complete registration
   - Should receive confirmation email

4. **Test Paid Plan (Existing User):**
   - Should NOT show "First Lesson FREE"
   - Should show just actual price
   - Should complete registration

5. **Test Lead Tracking:**
   - Go through steps 1, 2, 3 and stop
   - Check "Lead Tracking" sheet
   - Verify all data captured

6. **Test Multiple Children:**
   - Register Child A
   - Register Child B with same parent
   - Should allow both

---

## 📝 Checklist

### Google Apps Script:
- [ ] Added helper functions (isValidEmail, generateRegistrationId, checkExistingUser)
- [ ] Updated doPost function with validation and duplicate checking
- [ ] Updated sendConfirmation signature to accept new parameters
- [ ] Changed "First Lesson FREE" banner to conditional
- [ ] Added Registration ID to email template
- [ ] Added BCC to email send
- [ ] Created doPostTracking function
- [ ] Deployed both scripts
- [ ] Saved deployment URLs

### Website Forms (All 4):
- [ ] Added session ID tracking
- [ ] Added trackStepProgression function
- [ ] Added isValidEmail function
- [ ] Updated nextStep() to track progression
- [ ] Added showError() function
- [ ] Added showSuccessPage() function
- [ ] Updated submitRegistration() with better error handling
- [ ] Updated script URLs
- [ ] Set correct language parameter

### Google Sheets:
- [ ] Added "Registration ID" column
- [ ] Added "Payment Status" column
- [ ] Verified "Lead Tracking" sheet created

### Testing:
- [ ] Tested free trial for new user
- [ ] Tested free trial for existing user (should block)
- [ ] Tested paid plan for new user
- [ ] Tested paid plan for existing user
- [ ] Tested lead tracking
- [ ] Tested email confirmations
- [ ] Verified BCC emails received

---

## 🎯 Success Criteria

After implementation:

✅ **Duplicate Prevention:**
- Existing free trial users cannot register for another free trial
- System shows clear error message with contact info

✅ **Smart Banner Display:**
- New users see "First Lesson FREE" banner
- Existing users see payment info without banner
- Free trials always see banner

✅ **Lead Tracking:**
- Every step progression logged in "Lead Tracking" sheet
- Can identify where users drop off
- Have contact info for Step 3+ dropoffs

✅ **Better UX:**
- Email validation prevents typos
- Clear error messages
- Registration confirmation numbers
- Success page after completion

✅ **Better Admin:**
- BCC on all emails (you see what parents see)
- Unique registration IDs for support
- Payment status tracking
- Lead nurturing data

---

## 🆘 Troubleshooting

### Issue: "duplicate_free_trial" error for legitimate user

**Solution:** Check if they're registering a different child. The system should allow same parent to register multiple children.

### Issue: Lead tracking not working

**Solution:**
1. Verify tracking URL is correct in HTML
2. Check browser console for errors
3. Verify "Lead Tracking" sheet exists
4. Check Google Apps Script execution logs

### Issue: Emails not showing Registration ID

**Solution:** Verify you updated `sendConfirmation` function signature to accept `registrationId` parameter.

### Issue: Not receiving BCC emails

**Solution:** Check Gmail spam folder. Verify `bcc` parameter added to `GmailApp.sendEmail` call.

---

## 📞 Support

If you need help:
- Email: raphael@aikidz.club
- Phone: +972-54-315-9025

---

**Document Version:** 3.0
**Last Updated:** October 26, 2025
**Status:** Ready for Implementation
