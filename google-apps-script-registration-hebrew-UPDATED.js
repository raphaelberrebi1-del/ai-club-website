/**
 * Updated Hebrew Registration Script
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
      data.language || 'hebrew',
      data.referralSource || '',
      data.preferredContactMethod || '',
      data.additionalInfo || ''
    ];

    sheet.appendRow(rowData);

    // Send confirmation email
    const groupAssignments = {}; // Process group assignments if needed
    sendConfirmationHebrew(data.email, data, groupAssignments);

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

function sendConfirmationHebrew(email, data, groupAssignments) {
  const isFreeTrialRegistration = !data.totalPrice || parseFloat(data.totalPrice) === 0;

  // Subject line based on registration type
  const subject = isFreeTrialRegistration
    ? 'ברוכים הבאים למועדון AI לילדים - ניסיון חינם אושר!'
    : 'ברוכים הבאים למועדון AI לילדים - ההרשמה אושרה!';

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

  // First lesson FREE highlight (only for paid plans)
  const firstLessonFreeNotice = isFreeTrialRegistration ? '' : `
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center; border: 2px solid rgba(16, 185, 129, 0.3); direction: rtl;">
      <div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 8px;">
        שיעור ראשון בחינם
      </div>
      <div style="color: rgba(255,255,255,0.9); font-size: 15px;">
        נסו את השיעור הראשון ללא עלות לפני תחילת התוכנית
      </div>
    </div>
  `;

  // Payment instructions section (only for paid plans)
  let paymentInstructions = '';
  if (!isFreeTrialRegistration) {
    if (data.paymentMethod === 'bit') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 20px 0; direction: rtl;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px; text-align: right;">
            תשלום באמצעות Bit
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right;">
            השלימו את התשלום דרך Bit למספר: <strong>054-315-9025</strong><br>
            סכום: <strong>₪${data.totalPrice}</strong><br>
            כללו את שם הילד/ים בהערת התשלום
          </div>
        </div>
      `;
    } else if (data.paymentMethod === 'paybox') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; border-radius: 12px; margin: 20px 0; direction: rtl;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px; text-align: right;">
            תשלום באמצעות PayBox
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right;">
            השלימו את התשלום דרך PayBox למספר: <strong>054-315-9025</strong><br>
            סכום: <strong>₪${data.totalPrice}</strong><br>
            כללו את שם הילד/ים בהערת התשלום
          </div>
        </div>
      `;
    } else if (data.paymentMethod === 'bank_transfer') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 20px; border-radius: 12px; margin: 20px 0; direction: rtl;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px; text-align: right;">
            תשלום באמצעות העברה בנקאית
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right;">
            בנק: <strong>הפועלים</strong><br>
            סניף: <strong>689</strong><br>
            חשבון: <strong>518748</strong><br>
            סכום: <strong>₪${data.totalPrice}</strong><br>
            כללו את שם הילד/ים בהערת ההעברה
          </div>
        </div>
      `;
    } else if (data.paymentMethod === 'cash') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 12px; margin: 20px 0; direction: rtl;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px; text-align: right;">
            תשלום במזומן
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right;">
            סכום: <strong>₪${data.totalPrice}</strong><br>
            תשלום במזומן יכול להתבצע בשיעור הראשון או להיות מתואם מראש.<br>
            צרו איתנו קשר במספר <strong>054-315-9025</strong> לתיאום התשלום.
          </div>
        </div>
      `;
    } else if (data.paymentMethod === 'check') {
      paymentInstructions = `
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; border-radius: 12px; margin: 20px 0; direction: rtl;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px; text-align: right;">
            תשלום בצ'ק
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right;">
            סכום: <strong>₪${data.totalPrice}</strong><br>
            צ'ק לפקודת: <strong>AI Kids Club</strong><br>
            ניתן למסור את הצ'ק בשיעור הראשון או לשלוח אותו מראש.<br>
            צרו איתנו קשר במספר <strong>054-315-9025</strong> לתיאום המסירה.
          </div>
        </div>
      `;
    }
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

  // Send email
  GmailApp.sendEmail(email, subject, plainTextBody, {
    htmlBody: htmlBody,
    name: 'AI Kids Club',
    replyTo: 'raphael@aikidz.club'
  });
}

// Test function
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

  sendConfirmationHebrew(testData.email, testData, groupAssignments);
  Logger.log('Test email sent to: ' + testData.email);
}

// Test free trial email
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

  sendConfirmationHebrew(testData.email, testData, groupAssignments);
  Logger.log('Test free trial email sent to: ' + testData.email);
}
