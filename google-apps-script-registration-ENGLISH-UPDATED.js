/**
 * Updated English Registration Script
 *
 * Updates include:
 * 1. Program start date (November 2nd, 2025)
 * 2. Location TBD notice
 * 3. Required items list
 * 4. First Lesson FREE highlight (paid plans only)
 * 5. Check payment option added
 * 6. Free trial handling (₪0 registrations)
 * 7. Updated subject lines based on registration type
 *
 * Contact: raphael@aikidz.club | +972-54-315-9025
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
    const sheet = ss.getSheetByName('Registrations');

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Process registration data
    const timestamp = new Date();
    const rowData = [
      timestamp,
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
      data.additionalInfo || ''
    ];

    sheet.appendRow(rowData);

    // Send confirmation email
    const groupAssignments = {}; // Process group assignments if needed
    sendConfirmation(data.email, data, groupAssignments);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Registration successful'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendConfirmation(email, data, groupAssignments) {
  const isFreeTrialRegistration = !data.totalPrice || parseFloat(data.totalPrice) === 0;

  // Subject line based on registration type
  const subject = isFreeTrialRegistration
    ? 'Welcome to AI Kids Club - Free Trial Confirmed!'
    : 'Welcome to AI Kids Club - Registration Confirmed!';

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

  // First lesson FREE highlight (only for paid plans)
  const firstLessonFreeNotice = isFreeTrialRegistration ? '' : `
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center; border: 2px solid rgba(16, 185, 129, 0.3);">
      <div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 8px;">
        First Lesson FREE
      </div>
      <div style="color: rgba(255,255,255,0.9); font-size: 15px;">
        Try your first lesson at no cost before starting your plan
      </div>
    </div>
  `;

  // Payment instructions section (only for paid plans)
  let paymentInstructions = '';
  if (!isFreeTrialRegistration) {
    if (data.paymentMethod === 'bit') {
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

          <!-- Program Start Notice -->
          ${programStartNotice}

          <!-- Required Items -->
          ${requiredItemsSection}

          <!-- First Lesson FREE (paid plans only) -->
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

  // Send email
  GmailApp.sendEmail(email, subject, plainTextBody, {
    htmlBody: htmlBody,
    name: 'AI Kids Club',
    replyTo: 'raphael@aikidz.club'
  });
}

// Test function
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

  sendConfirmation(testData.email, testData, groupAssignments);
  Logger.log('Test email sent to: ' + testData.email);
}

// Test free trial email
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

  sendConfirmation(testData.email, testData, groupAssignments);
  Logger.log('Test free trial email sent to: ' + testData.email);
}
