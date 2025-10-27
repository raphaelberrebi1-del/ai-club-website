/**
 * Updated Hebrew Registration Script - Complete System v2.0
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
        message: 'נא לספק כתובת אימייל תקינה'
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
        message: 'כבר השתמשת בניסיון החינמי שלך. אנא בחר תוכנית בתשלום כדי להמשיך.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Generate registration ID
    const registrationId = generateRegistrationId();

    // Determine if "First Lesson FREE" banner should be shown
    const showFirstLessonFree = !existingUser.exists;

    // Determine payment status
    const paymentStatus = isFreeTrialRegistration ? 'ניסיון חינם' : 'ממתין לתשלום';

    // Access Google Sheet
    const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
    const sheet = ss.getSheetByName('Registrations');

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'sheet_not_found',
        message: 'גיליון ההרשמה לא נמצא. אנא צור קשר עם התמיכה.'
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
      data.language || 'hebrew',                      // J: Language
      data.referralSource || '',                      // K: Referral Source
      data.preferredContactMethod || '',              // L: Preferred Contact
      data.additionalInfo || '',                      // M: Additional Info
      paymentStatus                                   // N: Payment Status (NEW)
    ];

    sheet.appendRow(rowData);

    // Update lead tracking if session ID provided
    if (data.sessionId) {
      updateLeadTracking(data.sessionId, 'הושלם');
    }

    // Send confirmation email with flags
    const groupAssignments = {}; // Process group assignments if needed
    sendConfirmationHebrew(data.email, data, groupAssignments, showFirstLessonFree, registrationId);

    // Send admin notification to both emails
    try {
      const totalRevenue = data.totalPrice || 0;
      const childrenList = data.children.map(c => `${c.name} (${c.program || c.ageGroup})`).join(', ');
      const isTrial = data.paymentPlan === 'trial' || totalRevenue === 0;

      MailApp.sendEmail({
        to: 'raphaelberrebi@gmail.com, raphael@aikidz.club',
        subject: isTrial ? `🎁 הרשמת ניסיון חינם חדשה - ${data.parentName}` : `💰 הרשמה חדשה - ₪${totalRevenue} - ${data.parentName}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px;" dir="rtl">
              <h2 style="color: ${isTrial ? '#10b981' : '#0891b2'};">${isTrial ? '🎁 הרשמת ניסיון חינם חדשה' : '✅ הרשמה חדשה'}</h2>

              <h3 style="color: #0891b2;">פרטי הורה</h3>
              <p><strong>שם:</strong> ${data.parentName}</p>
              <p><strong>אימייל:</strong> ${data.email}</p>
              <p><strong>טלפון:</strong> ${data.phone}</p>

              <h3 style="color: #0891b2;">ילדים</h3>
              <p>${childrenList}</p>

              <h3 style="color: #0891b2;">פרטי תשלום</h3>
              <p><strong>תוכנית:</strong> ${data.paymentPlan}</p>
              <p><strong>סה"כ:</strong> ${isTrial ? '₪0 (ניסיון חינם)' : `₪${totalRevenue}/חודש`}</p>
              <p><strong>אמצעי תשלום:</strong> ${data.paymentMethod}</p>

              <p><strong>מזהה רישום:</strong> ${registrationId}</p>
              <p><strong>שפה:</strong> עברית</p>
              <p><strong>זמן:</strong> ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })}</p>
              <hr>
              <p style="color: #666; font-size: 12px;">זוהי הודעה אוטומטית ממועדון AI.</p>
            </div>
          </div>
        `
      });
      Logger.log('✅ Admin notification sent');
    } catch (error) {
      Logger.log('⚠️ Failed to send admin notification: ' + error.toString());
      // Don't fail the whole request if notification fails
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'ההרשמה הושלמה בהצלחה',
      registrationId: registrationId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Registration error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'server_error',
      message: 'אירעה שגיאה בעת ההרשמה. אנא נסה שוב או צור קשר עם התמיכה.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== EMAIL CONFIRMATION ====================

function sendConfirmationHebrew(email, data, groupAssignments, showFirstLessonFree, registrationId) {
  const isFreeTrialRegistration = !data.totalPrice || parseFloat(data.totalPrice) === 0;

  // Subject line based on registration type
  const subject = isFreeTrialRegistration
    ? 'ברוכים הבאים למועדון AI לילדים - ניסיון חינם אושר!'
    : 'ברוכים הבאים למועדון AI לילדים - ההרשמה אושרה!';

  // Registration ID display
  const registrationIdSection = registrationId ? `
    <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%); padding: 16px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #06b6d4; direction: rtl;">
      <div style="color: #0f172a; font-size: 14px; font-weight: 600; margin-bottom: 4px; text-align: right;">
        מספר הרשמה
      </div>
      <div style="color: #0891b2; font-size: 16px; font-weight: bold; font-family: monospace; text-align: right;">
        ${registrationId}
      </div>
      <div style="color: #64748b; font-size: 12px; margin-top: 4px; text-align: right;">
        שמור מספר זה לרישומים שלך
      </div>
    </div>
  ` : '';

  // Program start and location notice
  const programStartNotice = `
    <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border: 2px solid rgba(6, 182, 212, 0.3); direction: rtl;">
      <div style="color: white; font-size: 20px; font-weight: bold; margin-bottom: 12px; text-align: right;">
        תאריך תחילת התוכנית
      </div>
      <div style="color: rgba(255,255,255,0.95); font-size: 16px; line-height: 1.6; margin-bottom: 8px; text-align: right;">
        שיעור ראשון: <strong>2 בנובמבר, 2025</strong>
      </div>
      <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right;">
        המיקום המדויק יאושר בקרוב
      </div>
    </div>
  `;

  // Required items section
  const requiredItemsSection = `
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border: 2px solid rgba(245, 158, 11, 0.3); direction: rtl;">
      <div style="color: white; font-size: 20px; font-weight: bold; margin-bottom: 12px; text-align: right;">
        על התלמידים להביא:
      </div>
      <div style="color: rgba(255,255,255,0.95); font-size: 15px; line-height: 1.8; text-align: right;">
        <div style="margin-bottom: 8px;">• מחשב נייד או טאבלט (מחשב נייד מומלץ יותר)</div>
        <div style="margin-bottom: 8px;">• המכשיר טעון (סוללה מינימלית ל-2 שעות)</div>
        <div>• בקבוק מים וחטיף (אופציונלי)</div>
      </div>
    </div>
  `;

  // First lesson FREE highlight (conditional - only for new users)
  const firstLessonFreeNotice = showFirstLessonFree ? `
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center; border: 2px solid rgba(16, 185, 129, 0.3); direction: rtl;">
      <div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 8px;">
        שיעור ראשון בחינם
      </div>
      <div style="color: rgba(255,255,255,0.9); font-size: 15px;">
        נסו את השיעור הראשון ללא עלות לפני תחילת התוכנית
      </div>
    </div>
  ` : '';

  // Payment instructions section (shown for ALL registrations)
  let paymentInstructions = '';
  if (isFreeTrialRegistration) {
    // Free trial - show ₪0 payment info
    paymentInstructions = `
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 20px 0; direction: rtl;">
        <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px; text-align: right;">
          ניסיון חינם - אין צורך בתשלום
        </div>
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right;">
          סכום: <strong>₪0</strong><br>
          זהו <strong>שיעור ניסיון חינם</strong>. אין צורך בתשלום בשלב זה.<br>
          לאחר הניסיון, נדבר על אפשרויות תוכנית המתאימות לצרכים שלכם.
        </div>
      </div>
    `;
  } else {
    // Paid plan - show general payment information with total amount (Hebrew, RTL)
    paymentInstructions = `
      <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; border-radius: 12px; margin: 20px 0; direction: rtl;">
        <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 12px; text-align: right;">
          מידע על תשלום
        </div>
        <div style="color: rgba(255,255,255,0.95); font-size: 16px; font-weight: bold; margin-bottom: 12px; text-align: right;">
          סכום כולל: <strong>₪${data.totalPrice}</strong>
        </div>
        <div style="color: rgba(255,255,255,0.95); font-size: 15px; line-height: 1.8; margin-bottom: 12px; text-align: right;">
          השיעור הראשון <strong>חינם</strong> לכל התלמידים!
        </div>
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.8; text-align: right;">
          אנחנו מקבלים את אמצעי התשלום הבאים:
          <div style="margin-top: 8px;">
            • העברות Bit<br>
            • PayBox<br>
            • העברה בנקאית<br>
            • תשלום במזומן<br>
            • המחאות
          </div>
          <div style="margin-top: 12px; font-style: italic;">
            תשלומי כרטיס אשראי יהיו זמינים בקרוב!
          </div>
        </div>
      </div>
    `;
  }

  // Child information section
  let childrenInfo = '';
  if (data.children && data.children.length > 0) {
    childrenInfo = '<div style="margin: 24px 0; direction: rtl;">';
    childrenInfo += '<div style="color: #0891b2; font-size: 20px; font-weight: bold; margin-bottom: 16px; text-align: right;">ילדים רשומים:</div>';

    data.children.forEach((child, index) => {
      const groupInfo = groupAssignments && groupAssignments[child.name]
        ? `<div style="color: #0891b2; font-weight: 600; margin-top: 8px; text-align: right;">קבוצה: ${groupAssignments[child.name]}</div>`
        : '';

      childrenInfo += `
        <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%); padding: 16px; border-radius: 8px; margin-bottom: 12px; border-right: 4px solid #06b6d4; direction: rtl;">
          <div style="color: #0f172a; font-size: 16px; font-weight: 600; margin-bottom: 4px; text-align: right;">
            ${index + 1}. ${child.name}
          </div>
          <div style="color: #475569; font-size: 14px; text-align: right;">גיל: ${child.age}</div>
          <div style="color: #475569; font-size: 14px; text-align: right;">תוכנית: ${child.program}</div>
          ${groupInfo}
        </div>
      `;
    });
    childrenInfo += '</div>';
  }

  // HTML email body
  const htmlBody = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ברוכים הבאים למועדון AI לילדים</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 24px; text-align: center;">
          <div style="color: white; font-size: 28px; font-weight: bold; margin-bottom: 8px;">
            ברוכים הבאים למועדון AI לילדים!
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 16px;">
            ${isFreeTrialRegistration ? 'הרשמה לניסיון חינם אושרה' : 'ההרשמה אושרה'}
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px; direction: rtl;">

          <!-- Greeting -->
          <div style="color: #0f172a; font-size: 16px; line-height: 1.6; margin-bottom: 24px; text-align: right;">
            ${data.parentName ? `${data.parentName} שלום,` : 'הורה נכבד,'}
          </div>

          <div style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: right;">
            תודה שנרשמתם למועדון AI לילדים! אנו מתרגשים לקבל את פני הילד שלכם לתוכנית החינוך החדשנית שלנו ב-AI.
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
          <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%); padding: 20px; border-radius: 12px; margin: 24px 0; border: 2px solid rgba(6, 182, 212, 0.2); direction: rtl;">
            <div style="color: #0f172a; font-size: 18px; font-weight: bold; margin-bottom: 12px; text-align: right;">
              שאלות או צריכים עזרה?
            </div>
            <div style="color: #475569; font-size: 14px; line-height: 1.6; text-align: right;">
              <div style="margin-bottom: 6px;">אימייל: <a href="mailto:raphael@aikidz.club" style="color: #0891b2; text-decoration: none;">raphael@aikidz.club</a></div>
              <div style="margin-bottom: 6px;">טלפון/WhatsApp: <a href="tel:+972543159025" style="color: #0891b2; text-decoration: none;">054-315-9025</a></div>
              <div>אנחנו כאן כדי לעזור עם כל שאלה שיש לכם.</div>
            </div>
          </div>

          <!-- Closing -->
          <div style="color: #475569; font-size: 15px; line-height: 1.6; margin-top: 24px; text-align: right;">
            אנו מצפים לראות את הילד שלכם במועדון AI לילדים!
          </div>

          <div style="color: #475569; font-size: 15px; line-height: 1.6; margin-top: 16px; text-align: right;">
            בברכה,<br>
            <strong style="color: #0891b2;">צוות מועדון AI לילדים</strong>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
            מועדון AI לילדים<br>
            מעצימים את הדור הבא עם חינוך AI
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  // Plain text version
  const plainTextBody = `
ברוכים הבאים למועדון AI לילדים!
${isFreeTrialRegistration ? 'הרשמה לניסיון חינם אושרה' : 'ההרשמה אושרה'}

${data.parentName ? `${data.parentName} שלום,` : 'הורה נכבד,'}

תודה שנרשמתם למועדון AI לילדים! אנו מתרגשים לקבל את פני הילד שלכם לתוכנית החינוך החדשנית שלנו ב-AI.

תאריך תחילת התוכנית
שיעור ראשון: 2 בנובמבר, 2025
המיקום המדויק יאושר בקרוב

על התלמידים להביא:
- מחשב נייד או טאבלט (מחשב נייד מומלץ יותר)
- המכשיר טעון (סוללה מינימלית ל-2 שעות)
- בקבוק מים וחטיף (אופציונלי)

${!isFreeTrialRegistration ? 'שיעור ראשון בחינם\nנסו את השיעור הראשון ללא עלות לפני תחילת התוכנית\n' : ''}

${childrenInfo ? 'ילדים רשומים:\n' + data.children.map((child, i) => `${i+1}. ${child.name} (גיל ${child.age}) - ${child.program}`).join('\n') + '\n' : ''}

${paymentInstructions ? 'מידע תשלום:\n' + (data.paymentMethod === 'bit' ? `תשלום ב-Bit למספר: 054-315-9025\nסכום: ₪${data.totalPrice}` : data.paymentMethod === 'paybox' ? `תשלום ב-PayBox למספר: 054-315-9025\nסכום: ₪${data.totalPrice}` : data.paymentMethod === 'bank_transfer' ? `העברה בנקאית:\nבנק: הפועלים\nסניף: 689\nחשבון: 518748\nסכום: ₪${data.totalPrice}` : data.paymentMethod === 'cash' ? `תשלום במזומן: ₪${data.totalPrice}\nצרו קשר במספר 054-315-9025 לתיאום התשלום.` : data.paymentMethod === 'check' ? `תשלום בצ'ק: ₪${data.totalPrice}\nצ'ק לפקודת: AI Kids Club\nצרו קשר במספר 054-315-9025 לתיאום המסירה.` : '') + '\n' : ''}

שאלות או צריכים עזרה?
אימייל: raphael@aikidz.club
טלפון/WhatsApp: 054-315-9025
אנחנו כאן כדי לעזור עם כל שאלה שיש לכם.

אנו מצפים לראות את הילד שלכם במועדון AI לילדים!

בברכה,
צוות מועדון AI לילדים

מועדון AI לילדים
מעצימים את הדור הבא עם חינוך AI
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
      trackingSheet.getRange(existingRowIndex, 8).setValue('בתהליך'); // Status (In Progress in Hebrew)
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
        'בתהליך', // Status: In Progress
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
function testConfirmationEmailHebrew() {
  const testData = {
    parentName: 'הורה לבדיקה',
    email: 'raphael@aikidz.club',
    phone: '054-315-9025',
    children: [
      { name: 'ילד לבדיקה 1', age: 10, program: 'חוקרי טכנולוגיה' },
      { name: 'ילד לבדיקה 2', age: 8, program: 'חדשנים צעירים' }
    ],
    paymentPlan: 'חודשי',
    paymentMethod: 'bit',
    totalPrice: 450,
    language: 'hebrew'
  };

  const groupAssignments = {
    'ילד לבדיקה 1': 'קבוצה א - ימי שלישי 16:30',
    'ילד לבדיקה 2': 'קבוצה ב - ימי רביעי 15:30'
  };

  const showFirstLessonFree = true; // New user
  const registrationId = 'REG-TEST-12345ABC';

  sendConfirmationHebrew(testData.email, testData, groupAssignments, showFirstLessonFree, registrationId);
  Logger.log('Test paid email sent to: ' + testData.email);
}

/**
 * Test free trial email (new user)
 */
function testFreeTrialEmailHebrew() {
  const testData = {
    parentName: 'הורה ניסיון חינם',
    email: 'raphael@aikidz.club',
    phone: '054-315-9025',
    children: [
      { name: 'ילד ניסיון', age: 9, program: 'חדשנים צעירים' }
    ],
    paymentPlan: 'ניסיון חינם',
    paymentMethod: '',
    totalPrice: 0,
    language: 'hebrew'
  };

  const groupAssignments = {
    'ילד ניסיון': 'קבוצה ג - ימי חמישי 16:00'
  };

  const showFirstLessonFree = true; // New user
  const registrationId = 'REG-TEST-67890XYZ';

  sendConfirmationHebrew(testData.email, testData, groupAssignments, showFirstLessonFree, registrationId);
  Logger.log('Test free trial email sent to: ' + testData.email);
}

/**
 * Test existing user registration (no First Lesson FREE banner)
 */
function testExistingUserEmailHebrew() {
  const testData = {
    parentName: 'הורה קיים',
    email: 'raphael@aikidz.club',
    phone: '054-315-9025',
    children: [
      { name: 'ילד קיים', age: 11, program: 'חוקרי טכנולוגיה' }
    ],
    paymentPlan: 'רבעוני',
    paymentMethod: 'bit',
    totalPrice: 1200,
    language: 'hebrew'
  };

  const groupAssignments = {
    'ילד קיים': 'קבוצה ד - ימי שישי 16:30'
  };

  const showFirstLessonFree = false; // Existing user - no banner
  const registrationId = 'REG-TEST-11111EXT';

  sendConfirmationHebrew(testData.email, testData, groupAssignments, showFirstLessonFree, registrationId);
  Logger.log('Test existing user email sent to: ' + testData.email);
}
