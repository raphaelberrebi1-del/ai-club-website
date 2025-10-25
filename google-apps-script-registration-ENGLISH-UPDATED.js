/**
 * Updated English Registration Script - Complete System v2.0
 *
 * Features:
 * 1. Duplicate free trial detection and prevention
 * 2. Smart "First Lesson FREE" banner (new users only)
 * 3. Registration confirmation numbers
 * 4. Email validation
 * 5. BCC to admin on all confirmations
 * 6. Multiple children support
 * 7. Payment status tracking
 * 8. Lead tracking integration
 *
 * Contact: raphael@aikidz.club | +972-54-315-9025
 */

// ==================== HELPER FUNCTIONS ====================

/**
 * Validates email format
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generates unique registration ID
 */
function generateRegistrationId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `REG-${timestamp}-${random}`;
}

/**
 * Checks if user exists and their registration history
 * Returns: { exists: boolean, hadFreeTrial: boolean }
 */
function checkExistingUser(email, parentName, childNames) {
  const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
  const sheet = ss.getSheetByName('Registrations');
  const data = sheet.getDataRange().getValues();

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const rowEmail = data[i][3]; // Email is column D (index 3)
    const rowParentName = data[i][2]; // Parent Name is column C (index 2)
    const rowChildrenJSON = data[i][5]; // Children is column F (index 5)
    const rowPrice = data[i][8]; // Total Price is column I (index 8)

    // Check for matches
    const emailMatch = rowEmail && email &&
      rowEmail.toString().toLowerCase().trim() === email.toString().toLowerCase().trim();

    const nameMatch = rowParentName && parentName &&
      rowParentName.toString().toLowerCase().trim() === parentName.toString().toLowerCase().trim();

    let childMatch = false;
    if (rowChildrenJSON && childNames && childNames.length > 0) {
      try {
        const rowChildren = JSON.parse(rowChildrenJSON);
        for (const inputChildName of childNames) {
          childMatch = rowChildren.some(child =>
            child.name && child.name.toString().toLowerCase().trim() === inputChildName.toString().toLowerCase().trim()
          );
          if (childMatch) break;
        }
      } catch (e) {
        // JSON parse error, skip this row
      }
    }

    // If any match found, check if they had a free trial
    if (emailMatch || nameMatch || childMatch) {
      const hadFreeTrial = !rowPrice || parseFloat(rowPrice) === 0;
      return { exists: true, hadFreeTrial: hadFreeTrial };
    }
  }

  return { exists: false, hadFreeTrial: false };
}

/**
 * Updates lead tracking sheet with registration completion
 */
function updateLeadTracking(sessionId, status) {
  if (!sessionId) return;

  try {
    const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
    let trackingSheet = ss.getSheetByName('Lead Tracking');

    // Find the session and update status
    if (trackingSheet) {
      const data = trackingSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === sessionId) { // Session ID in column A
          trackingSheet.getRange(i + 1, 8).setValue(status); // Status in column H
          trackingSheet.getRange(i + 1, 9).setValue(new Date()); // Completion time in column I
          break;
        }
      }
    }
  } catch (error) {
    Logger.log('Lead tracking update error: ' + error.toString());
  }
}

// ==================== MAIN REGISTRATION HANDLER ====================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Validate email
    if (!isValidEmail(data.email)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'invalid_email',
        message: 'Please provide a valid email address'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Check for existing user
    const childNames = data.children ? data.children.map(child => child.name) : [];
    const existingUser = checkExistingUser(data.email, data.parentName, childNames);

    // Determine if this is a free trial registration
    const isFreeTrialRegistration = !data.totalPrice || parseFloat(data.totalPrice) === 0;

    // Block duplicate free trial attempts
    if (isFreeTrialRegistration && existingUser.exists && existingUser.hadFreeTrial) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'duplicate_free_trial',
        message: 'You have already used your free trial. Please select a paid plan to continue.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Generate registration ID
    const registrationId = generateRegistrationId();

    // Determine if "First Lesson FREE" banner should be shown
    const showFirstLessonFree = !existingUser.exists;

    // Determine payment status
    const paymentStatus = isFreeTrialRegistration ? 'Free Trial' : 'Pending';

    // Access Google Sheet
    const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
    const sheet = ss.getSheetByName('Registrations');

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'sheet_not_found',
        message: 'Registration sheet not found. Please contact support.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Process registration data (updated with new columns)
    const timestamp = new Date();
    const rowData = [
      timestamp,                                      // A: Timestamp
      registrationId,                                 // B: Registration ID (NEW)
      data.parentName || '',                          // C: Parent Name
      data.email || '',                               // D: Email
      data.phone || '',                               // E: Phone
      data.children ? JSON.stringify(data.children) : '', // F: Children (JSON)
      data.paymentPlan || '',                         // G: Payment Plan
      data.paymentMethod || '',                       // H: Payment Method
      data.totalPrice || 0,                           // I: Total Price
      data.language || 'english',                     // J: Language
      data.referralSource || '',                      // K: Referral Source
      data.preferredContactMethod || '',              // L: Preferred Contact
      data.additionalInfo || '',                      // M: Additional Info
      paymentStatus                                   // N: Payment Status (NEW)
    ];

    sheet.appendRow(rowData);

    // Update lead tracking if session ID provided
    if (data.sessionId) {
      updateLeadTracking(data.sessionId, 'Completed');
    }

    // Send confirmation email with flags
    const groupAssignments = {}; // Process group assignments if needed
    sendConfirmation(data.email, data, groupAssignments, showFirstLessonFree, registrationId);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Registration successful',
      registrationId: registrationId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Registration error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'server_error',
      message: 'An error occurred during registration. Please try again or contact support.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== EMAIL CONFIRMATION ====================

function sendConfirmation(email, data, groupAssignments, showFirstLessonFree, registrationId) {
  const isFreeTrialRegistration = !data.totalPrice || parseFloat(data.totalPrice) === 0;

  // Subject line based on registration type
  const subject = isFreeTrialRegistration
    ? 'Welcome to AI Kids Club - Free Trial Confirmed!'
    : 'Welcome to AI Kids Club - Registration Confirmed!';

  // Registration ID display
  const registrationIdSection = registrationId ? `
    <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%); padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
      <div style="color: #0f172a; font-size: 14px; font-weight: 600; margin-bottom: 4px;">
        Registration ID
      </div>
      <div style="color: #0891b2; font-size: 16px; font-weight: bold; font-family: monospace;">
        ${registrationId}
      </div>
      <div style="color: #64748b; font-size: 12px; margin-top: 4px;">
        Save this ID for your records
      </div>
    </div>
  ` : '';

  // Program start and location notice
  const programStartNotice = `
    <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border: 2px solid rgba(6, 182, 212, 0.3);">
      <div style="color: white; font-size: 20px; font-weight: bold; margin-bottom: 12px;">
        Program Start Date
      </div>
      <div style="color: rgba(255,255,255,0.95); font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
        First lesson: <strong>November 2nd, 2025</strong>
      </div>
      <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
        Exact location will be confirmed shortly
      </div>
    </div>
  `;

  // Required items section
  const requiredItemsSection = `
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border: 2px solid rgba(245, 158, 11, 0.3);">
      <div style="color: white; font-size: 20px; font-weight: bold; margin-bottom: 12px;">
        Students MUST Bring:
      </div>
      <div style="color: rgba(255,255,255,0.95); font-size: 15px; line-height: 1.8;">
        <div style="margin-bottom: 8px;">• Laptop or tablet (laptop is more recommended)</div>
        <div style="margin-bottom: 8px;">• Device charged (minimum 2-hour battery)</div>
        <div>• Water bottle and snack (optional)</div>
      </div>
    </div>
  `;

  // First lesson FREE highlight (conditional - only for new users)
  const firstLessonFreeNotice = showFirstLessonFree ? `
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center; border: 2px solid rgba(16, 185, 129, 0.3);">
      <div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 8px;">
        First Lesson FREE
      </div>
      <div style="color: rgba(255,255,255,0.9); font-size: 15px;">
        Try your first lesson at no cost before starting your plan
      </div>
    </div>
  ` : '';

  // Payment instructions section (shown for ALL registrations)
  let paymentInstructions = '';
  if (isFreeTrialRegistration) {
    // Free trial - show ₪0 payment info
    paymentInstructions = `
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px;">
          Free Trial - No Payment Required
        </div>
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
          Amount: <strong>₪0</strong><br>
          This is a <strong>free trial lesson</strong>. No payment is required at this time.<br>
          After your trial, we'll discuss program options that fit your needs.
        </div>
      </div>
    `;
  } else if (data.paymentMethod === 'bit') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px;">
            Pay with Bit
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
            Complete your payment via Bit to: <strong>054-315-9025</strong><br>
            Amount: <strong>₪${data.totalPrice}</strong><br>
            Include child name(s) in payment note
          </div>
        </div>
      `;
    } else if (data.paymentMethod === 'paybox') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px;">
            Pay with PayBox
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
            Complete your payment via PayBox to: <strong>054-315-9025</strong><br>
            Amount: <strong>₪${data.totalPrice}</strong><br>
            Include child name(s) in payment note
          </div>
        </div>
      `;
    } else if (data.paymentMethod === 'bank_transfer') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px;">
            Pay via Bank Transfer
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
            Bank: <strong>Hapoalim</strong><br>
            Branch: <strong>689</strong><br>
            Account: <strong>518748</strong><br>
            Amount: <strong>₪${data.totalPrice}</strong><br>
            Include child name(s) in transfer note
          </div>
        </div>
      `;
    } else if (data.paymentMethod === 'cash') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px;">
            Pay with Cash
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
            Amount: <strong>₪${data.totalPrice}</strong><br>
            Cash payment can be made at the first lesson or arranged in advance.<br>
            Contact us at <strong>054-315-9025</strong> to coordinate payment.
          </div>
        </div>
      `;
    } else if (data.paymentMethod === 'check') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px;">
            Pay with Check
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
            Amount: <strong>₪${data.totalPrice}</strong><br>
            Make check payable to: <strong>AI Kids Club</strong><br>
            Check can be provided at the first lesson or mailed in advance.<br>
            Contact us at <strong>054-315-9025</strong> to coordinate delivery.
          </div>
        </div>
      `;
    }
  }

  // Child information section
  let childrenInfo = '';
  if (data.children && data.children.length > 0) {
    childrenInfo = '<div style="margin: 24px 0;">';
    childrenInfo += '<div style="color: #0891b2; font-size: 20px; font-weight: bold; margin-bottom: 16px;">Registered Children:</div>';

    data.children.forEach((child, index) => {
      const groupInfo = groupAssignments && groupAssignments[child.name]
        ? `<div style="color: #0891b2; font-weight: 600; margin-top: 8px;">Group: ${groupAssignments[child.name]}</div>`
        : '';

      childrenInfo += `
        <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%); padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #06b6d4;">
          <div style="color: #0f172a; font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${index + 1}. ${child.name}
          </div>
          <div style="color: #475569; font-size: 14px;">Age: ${child.age}</div>
          <div style="color: #475569; font-size: 14px;">Program: ${child.program}</div>
          ${groupInfo}
        </div>
      `;
    });
    childrenInfo += '</div>';
  }

  // HTML email body
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AI Kids Club</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 24px; text-align: center;">
          <div style="color: white; font-size: 28px; font-weight: bold; margin-bottom: 8px;">
            Welcome to AI Kids Club!
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 16px;">
            ${isFreeTrialRegistration ? 'Free Trial Registration Confirmed' : 'Registration Confirmed'}
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">

          <!-- Greeting -->
          <div style="color: #0f172a; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear ${data.parentName || 'Parent'},
          </div>

          <div style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for registering with AI Kids Club! We're excited to welcome your child to our innovative AI education program.
          </div>

          <!-- Registration ID -->
          ${registrationIdSection}

          <!-- Program Start Notice -->
          ${programStartNotice}

          <!-- Required Items -->
          ${requiredItemsSection}

          <!-- First Lesson FREE (new users only) -->
          ${firstLessonFreeNotice}

          <!-- Child Information -->
          ${childrenInfo}

          <!-- Payment Instructions (paid plans only) -->
          ${paymentInstructions}

          <!-- Contact Information -->
          <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%); padding: 20px; border-radius: 12px; margin: 24px 0; border: 2px solid rgba(6, 182, 212, 0.2);">
            <div style="color: #0f172a; font-size: 18px; font-weight: bold; margin-bottom: 12px;">
              Questions or Need Help?
            </div>
            <div style="color: #475569; font-size: 14px; line-height: 1.6;">
              <div style="margin-bottom: 6px;">Email: <a href="mailto:raphael@aikidz.club" style="color: #0891b2; text-decoration: none;">raphael@aikidz.club</a></div>
              <div style="margin-bottom: 6px;">Phone/WhatsApp: <a href="tel:+972543159025" style="color: #0891b2; text-decoration: none;">+972-54-315-9025</a></div>
              <div>We're here to help with any questions you may have.</div>
            </div>
          </div>

          <!-- Closing -->
          <div style="color: #475569; font-size: 15px; line-height: 1.6; margin-top: 24px;">
            We look forward to seeing your child at AI Kids Club!
          </div>

          <div style="color: #475569; font-size: 15px; line-height: 1.6; margin-top: 16px;">
            Best regards,<br>
            <strong style="color: #0891b2;">The AI Kids Club Team</strong>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
            AI Kids Club<br>
            Empowering the next generation with AI education
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  // Plain text version
  const plainTextBody = `
Welcome to AI Kids Club!
${isFreeTrialRegistration ? 'Free Trial Registration Confirmed' : 'Registration Confirmed'}

Dear ${data.parentName || 'Parent'},

Thank you for registering with AI Kids Club! We're excited to welcome your child to our innovative AI education program.

PROGRAM START DATE
First lesson: November 2nd, 2025
Exact location will be confirmed shortly

STUDENTS MUST BRING:
- Laptop or tablet (laptop is more recommended)
- Device charged (minimum 2-hour battery)
- Water bottle and snack (optional)

${!isFreeTrialRegistration ? 'FIRST LESSON FREE\nTry your first lesson at no cost before starting your plan\n' : ''}

${childrenInfo ? 'REGISTERED CHILDREN:\n' + data.children.map((child, i) => `${i+1}. ${child.name} (Age ${child.age}) - ${child.program}`).join('\n') + '\n' : ''}

${paymentInstructions ? 'PAYMENT INFORMATION:\n' + (data.paymentMethod === 'bit' ? `Pay with Bit to: 054-315-9025\nAmount: ₪${data.totalPrice}` : data.paymentMethod === 'paybox' ? `Pay with PayBox to: 054-315-9025\nAmount: ₪${data.totalPrice}` : data.paymentMethod === 'bank_transfer' ? `Bank Transfer:\nBank: Hapoalim\nBranch: 689\nAccount: 518748\nAmount: ₪${data.totalPrice}` : data.paymentMethod === 'cash' ? `Cash Payment: ₪${data.totalPrice}\nContact us at 054-315-9025 to coordinate payment.` : data.paymentMethod === 'check' ? `Check Payment: ₪${data.totalPrice}\nMake check payable to: AI Kids Club\nContact us at 054-315-9025 to coordinate delivery.` : '') + '\n' : ''}

QUESTIONS OR NEED HELP?
Email: raphael@aikidz.club
Phone/WhatsApp: +972-54-315-9025
We're here to help with any questions you may have.

We look forward to seeing your child at AI Kids Club!

Best regards,
The AI Kids Club Team

AI Kids Club
Empowering the next generation with AI education
  `;

  // Send email with BCC to admin
  GmailApp.sendEmail(email, subject, plainTextBody, {
    htmlBody: htmlBody,
    name: 'AI Kids Club',
    replyTo: 'raphael@aikidz.club',
    bcc: 'raphael@aikidz.club'
  });
}

// ==================== LEAD TRACKING HANDLER ====================

/**
 * Separate endpoint for tracking user progression through registration steps
 * Deploy this as a separate web app with URL parameter 'tracking'
 */
function doPostTracking(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
    let trackingSheet = ss.getSheetByName('Lead Tracking');

    // Create Lead Tracking sheet if it doesn't exist
    if (!trackingSheet) {
      trackingSheet = ss.insertSheet('Lead Tracking');
      trackingSheet.appendRow([
        'Session ID',
        'Timestamp',
        'Step Completed',
        'Child Names',
        'Age Groups',
        'Payment Plan',
        'Parent Email',
        'Status',
        'Completion Time'
      ]);
    }

    // Check if session already exists
    const trackingData = trackingSheet.getDataRange().getValues();
    let existingRowIndex = -1;

    for (let i = 1; i < trackingData.length; i++) {
      if (trackingData[i][0] === data.sessionId) {
        existingRowIndex = i + 1; // +1 for 1-indexed Google Sheets
        break;
      }
    }

    if (existingRowIndex > 0) {
      // Update existing row
      trackingSheet.getRange(existingRowIndex, 2).setValue(new Date()); // Timestamp
      trackingSheet.getRange(existingRowIndex, 3).setValue(data.stepCompleted || ''); // Step
      trackingSheet.getRange(existingRowIndex, 4).setValue(data.childNames || ''); // Child Names
      trackingSheet.getRange(existingRowIndex, 5).setValue(data.ageGroups || ''); // Age Groups
      trackingSheet.getRange(existingRowIndex, 6).setValue(data.paymentPlan || ''); // Payment Plan
      trackingSheet.getRange(existingRowIndex, 7).setValue(data.parentEmail || ''); // Email
      trackingSheet.getRange(existingRowIndex, 8).setValue('In Progress'); // Status
    } else {
      // Create new row
      trackingSheet.appendRow([
        data.sessionId || '',
        new Date(),
        data.stepCompleted || '',
        data.childNames || '',
        data.ageGroups || '',
        data.paymentPlan || '',
        data.parentEmail || '',
        'In Progress',
        '' // Completion time (empty until registration completes)
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Tracking updated'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Tracking error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== TEST FUNCTIONS ====================

/**
 * Test paid registration email (new user - shows First Lesson FREE)
 */
function testConfirmationEmail() {
  const testData = {
    parentName: 'Test Parent',
    email: 'raphael@aikidz.club',
    phone: '054-315-9025',
    children: [
      { name: 'Test Child 1', age: 10, program: 'Tech Explorers' },
      { name: 'Test Child 2', age: 8, program: 'Young Innovators' }
    ],
    paymentPlan: 'Monthly',
    paymentMethod: 'bit',
    totalPrice: 450,
    language: 'english'
  };

  const groupAssignments = {
    'Test Child 1': 'Group A - Tuesdays 4:30 PM',
    'Test Child 2': 'Group B - Wednesdays 3:30 PM'
  };

  const showFirstLessonFree = true; // New user
  const registrationId = 'REG-TEST-12345ABC';

  sendConfirmation(testData.email, testData, groupAssignments, showFirstLessonFree, registrationId);
  Logger.log('Test paid email sent to: ' + testData.email);
}

/**
 * Test free trial email (new user)
 */
function testFreeTrialEmail() {
  const testData = {
    parentName: 'Free Trial Parent',
    email: 'raphael@aikidz.club',
    phone: '054-315-9025',
    children: [
      { name: 'Trial Child', age: 9, program: 'Young Innovators' }
    ],
    paymentPlan: 'Free Trial',
    paymentMethod: '',
    totalPrice: 0,
    language: 'english'
  };

  const groupAssignments = {
    'Trial Child': 'Group C - Thursdays 4:00 PM'
  };

  const showFirstLessonFree = true; // New user
  const registrationId = 'REG-TEST-67890XYZ';

  sendConfirmation(testData.email, testData, groupAssignments, showFirstLessonFree, registrationId);
  Logger.log('Test free trial email sent to: ' + testData.email);
}

/**
 * Test existing user registration (no First Lesson FREE banner)
 */
function testExistingUserEmail() {
  const testData = {
    parentName: 'Existing Parent',
    email: 'raphael@aikidz.club',
    phone: '054-315-9025',
    children: [
      { name: 'Existing Child', age: 11, program: 'Tech Explorers' }
    ],
    paymentPlan: 'Quarterly',
    paymentMethod: 'bit',
    totalPrice: 1200,
    language: 'english'
  };

  const groupAssignments = {
    'Existing Child': 'Group D - Fridays 4:30 PM'
  };

  const showFirstLessonFree = false; // Existing user - no banner
  const registrationId = 'REG-TEST-11111EXT';

  sendConfirmation(testData.email, testData, groupAssignments, showFirstLessonFree, registrationId);
  Logger.log('Test existing user email sent to: ' + testData.email);
}
