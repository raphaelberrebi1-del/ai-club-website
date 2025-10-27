// ========================================
// מועדון AI לילדים - מטפל בהורדת תוכניות לימודים
// ========================================
// גרסה עברית - אימיילים מותאמים למובייל
// Use the same spreadsheet as registration: 1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M
// Deploy as: Web App (Anyone can access)
//
// מוכן להעתקה ל-GOOGLE APPS SCRIPT בכתובת: https://script.google.com

// Handle preflight OPTIONS requests (CORS)
function doGet(e) {
  const output = ContentService.createTextOutput(JSON.stringify({ status: 'ok' }));
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

function doPost(e) {
  try {
    console.log('📥 Curriculum download request received (Hebrew)');
    console.log('🔍 Request data:', e.postData);

    // Target your specific AI Club spreadsheet
    const spreadsheetId = '1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M';
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    const downloadsSheet = sheet.getSheetByName('Curriculum Downloads');

    if (!downloadsSheet) {
      throw new Error('Curriculum Downloads sheet not found. Please create it first.');
    }

    // Parse request data (handle both FormData and JSON methods)
    let data;
    if (e.parameter && e.parameter.data) {
      console.log('📦 Using parameter data (FormData method)');
      data = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      console.log('📦 Using postData contents (JSON method)');
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No data received - check request format');
    }

    console.log('✅ Parsed data:', JSON.stringify(data));

    // Validate required fields
    if (!data.name || !data.email || !data.program) {
      throw new Error('Missing required fields: name, email, or program');
    }

    // Save to Google Sheet
    const rowData = [
      new Date(), // A: Timestamp
      data.name, // B: Parent Name
      data.email, // C: Email
      data.program, // D: Program (young/tech/future)
      data.source || 'desktop-he', // E: Source Page
      'Hebrew', // F: Language
      'TRUE' // G: PDF Downloaded
    ];

    console.log('📝 Writing row to sheet:', rowData);
    downloadsSheet.appendRow(rowData);
    console.log('✅ Row written successfully');

    // Get curriculum HTML URL based on program (Hebrew versions)
    const curriculumUrls = {
      'young': 'https://www.aikidz.club/curriculum-he-desktop.html',
      'tech': 'https://www.aikidz.club/curriculum-he-desktop.html',
      'future': 'https://www.aikidz.club/curriculum-he-desktop.html'
    };

    const curriculumUrl = curriculumUrls[data.program];

    if (!curriculumUrl) {
      throw new Error('Invalid program type: ' + data.program);
    }

    // Send email with curriculum HTML
    console.log('📧 Sending curriculum email (Hebrew)...');
    sendCurriculumEmailHebrew(data.email, data.name, data.program, curriculumUrl);
    console.log('✅ Email sent successfully');

    // Send admin notification to both emails
    try {
      MailApp.sendEmail({
        to: 'raphaelberrebi@gmail.com, raphael@aikidz.club',
        subject: `📄 הורדת תוכנית לימודים חדשה - ${data.program.toUpperCase()}`,
        replyTo: 'noreply@aikidz.club',
        noReply: true,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px;" dir="rtl">
              <h2 style="color: #0891b2;">✅ הורדת תוכנית לימודים חדשה</h2>
              <p><strong>שם ההורה:</strong> ${data.name}</p>
              <p><strong>אימייל:</strong> ${data.email}</p>
              <p><strong>תוכנית:</strong> ${data.program}</p>
              <p><strong>מקור:</strong> ${data.source || 'desktop-he'}</p>
              <p><strong>שפה:</strong> עברית</p>
              <p><strong>זמן:</strong> ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })}</p>
              <hr>
              <p style="color: #666; font-size: 12px;">זוהי הודעה אוטומטית ממועדון AI.</p>
            </div>
          </div>
        `
      });
      console.log('✅ Admin notification sent');
    } catch (error) {
      console.error('⚠️ Failed to send admin notification:', error);
      // Don't fail the whole request if notification fails
    }

    console.log('✅ Curriculum download processed successfully');

    const output = ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        curriculumUrl: curriculumUrl,
        message: 'בדקו את האימייל שלכם לתוכנית הלימודים!'
      }))
      .setMimeType(ContentService.MimeType.JSON);

    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return output;

  } catch (error) {
    console.error('❌ Error processing curriculum download:', error.toString());
    console.error('❌ Error stack:', error.stack);

    const errorOutput = ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

    errorOutput.setHeader('Access-Control-Allow-Origin', '*');
    errorOutput.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    errorOutput.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return errorOutput;
  }
}

function sendCurriculumEmailHebrew(email, name, program, curriculumUrl) {
  console.log('📧 Sending curriculum email (Hebrew) to:', email);
  console.log('📧 Program:', program);

  const programNames = {
    'young': 'ממציאים צעירים (גילאי 8-10)',
    'tech': 'חוקרי טכנולוגיה (גילאי 11-13)',
    'future': 'מנהיגי העתיד (גילאי 14-18)'
  };

  const programName = programNames[program] || 'מועדון AI';

  const subject = `תוכנית הלימודים המלאה שלכם - ${programName} - מועדון AI`;

  // Get the curriculum HTML based on program type
  console.log('📄 Generating curriculum HTML (Hebrew) for:', programName);
  let htmlBody;

  try {
    if (program === 'young') {
      htmlBody = getYoungExplorersHTMLHebrew();
    } else if (program === 'tech') {
      htmlBody = getTeenChampionsHTMLHebrew();
    } else if (program === 'future') {
      htmlBody = getFutureLeadersHTMLHebrew();
    } else {
      throw new Error('Invalid program type');
    }
    console.log('✅ Curriculum HTML generated successfully, length:', htmlBody.length);
  } catch (error) {
    console.error('❌ Failed to generate curriculum HTML:', error.toString());
    // Fallback to a simple message if generation fails
    htmlBody = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="utf-8">
        <title>תוכנית לימודים - מועדון AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; direction: rtl;">
        <h1 style="color: #06b6d4;">תודה שהורדתם את תוכנית ${programName}!</h1>
        <p>שאלות? צרו קשר ב-<a href="mailto:raphael@aikidz.club">raphael@aikidz.club</a></p>
      </body>
      </html>
    `;
  }

  const plainTextBody = `שלום ${name},

תודה על העניין שלך במועדון AI!

תוכנית הלימודים המלאה של 48 שבועות עבור ${programName}

האימייל הזה מכיל את תוכנית הלימודים המלאה עם:
• מסע למידה לשנה שלמה (48 שבועות)
• כל 4 הרבעונים עם פעילויות מפורטות
• פרויקטי גמר עיקריים לכל רבעון
• מפת דרכים להתקדמות בכישורים
• מתווה לימודים שבוע אחר שבוע

צפו בתוכנית הלימודים באינטרנט: ${curriculumUrl}

מוכנים להירשם?
צפו במחירים והירשמו: https://www.aikidz.club/pricing-he-desktop.html

יש שאלות? צרו קשר:
WhatsApp: ‎054-315-9025
אימייל: raphael@aikidz.club

אנו מצפים לראות את הילד שלכם משגשג בתוכניות ה-AI שלנו!

בברכה,
רפאל
מועדון AI
www.aikidz.club
`;

  try {
    console.log('📤 Attempting to send email via GmailApp...');

    GmailApp.sendEmail(email, subject, plainTextBody, {
      htmlBody: htmlBody,
      name: 'מועדון AI',
      replyTo: 'raphael@aikidz.club'
    });

    console.log('✅ Email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Email sending failed:', error.toString());
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

// ========================================
// TEST FUNCTIONS
// ========================================

/**
 * Test the curriculum email function
 * Run this manually in Apps Script editor to test
 */
function testCurriculumEmailHebrew() {
  console.log('🧪 Testing curriculum email (Hebrew)...');

  try {
    sendCurriculumEmailHebrew(
      'raphael.berrebi.1@gmail.com',
      'הורה לדוגמה',
      'young',
      'https://www.aikidz.club/curriculum-he-desktop.html'
    );

    console.log('✅ Test email sent successfully');
    return 'Success! Check raphael.berrebi.1@gmail.com';
  } catch (error) {
    console.error('❌ Test failed:', error.toString());
    return 'Failed: ' + error.toString();
  }
}

/**
 * Test sending all three curricula
 * Run this to test all program types at once
 */
function testAllCurriculaHebrew() {
  console.log('🧪 Testing all three curricula (Hebrew)...');

  const programs = [
    { name: 'ממציאים צעירים', code: 'young' },
    { name: 'חוקרי טכנולוגיה', code: 'tech' },
    { name: 'מנהיגי העתיד', code: 'future' }
  ];

  const results = [];

  programs.forEach(program => {
    try {
      const curriculumUrls = {
        'young': 'https://www.aikidz.club/curriculum-he-desktop.html',
        'tech': 'https://www.aikidz.club/curriculum-he-desktop.html',
        'future': 'https://www.aikidz.club/curriculum-he-desktop.html'
      };

      sendCurriculumEmailHebrew(
        'raphael.berrebi.1@gmail.com',
        'הורה לדוגמה',
        program.code,
        curriculumUrls[program.code]
      );

      results.push('✅ ' + program.name + ': הצלחה');
      console.log('✅ Sent ' + program.name + ' curriculum');

      // Wait 2 seconds between emails
      Utilities.sleep(2000);

    } catch (error) {
      results.push('❌ ' + program.name + ': ' + error.toString());
      console.error('❌ Failed to send ' + program.name + ':', error.toString());
    }
  });

  console.log('📊 Test Results:', results.join('\n'));
  return results.join('\n');
}

/**
 * Test the full curriculum download flow
 */
function testCurriculumDownloadHebrew() {
  console.log('🧪 Testing full curriculum download flow (Hebrew)...');

  const testEvent = {
    postData: {
      contents: JSON.stringify({
        name: 'הורה לדוגמה',
        email: 'raphael.berrebi.1@gmail.com',
        program: 'young',
        source: 'test-hebrew'
      })
    }
  };

  try {
    const result = doPost(testEvent);
    const response = JSON.parse(result.getContent());

    console.log('✅ Test completed. Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Test failed:', error.toString());
    return { success: false, error: error.toString() };
  }
}

// ========================================
// CURRICULUM HTML TEMPLATES (HEBREW)
// ========================================

/**
 * Returns the complete Young Explorers curriculum HTML (Ages 8-10) - HEBREW
 * RESPONSIVE VERSION - Mobile-optimized with @media queries and RTL support
 */
function getYoungExplorersHTMLHebrew() {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>תוכנית ממציאים צעירים - תוכנית לימודים מלאה של 48 שבועות | מועדון AI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <style>
        /* Responsive styles for mobile devices */
        @media only screen and (max-width: 480px) {
            .mobile-full-width-container { width: 100% !important; max-width: 100% !important; }
            .mobile-padding { padding: 20px 15px !important; }
            .mobile-padding-outer { padding: 10px 0 !important; }
            .mobile-padding-small { padding: 15px 12px !important; }
            .mobile-heading-xl { font-size: 24px !important; line-height: 1.2 !important; }
            .mobile-heading-large { font-size: 22px !important; line-height: 1.3 !important; }
            .mobile-heading-medium { font-size: 18px !important; line-height: 1.4 !important; }
            .mobile-heading-small { font-size: 16px !important; line-height: 1.4 !important; }
            .mobile-text { font-size: 14px !important; }

            /* Keep header logo and text side-by-side on mobile */
            .header-logo { padding-left: 10px !important; }
            .header-logo img { width: 80px !important; height: auto !important; }

            .quarter-grid { display: block !important; width: 100% !important; }
            .quarter-card { display: block !important; width: 100% !important; margin-bottom: 15px !important; }
        }

        /* Base styles */
        body { margin: 0; padding: 0; direction: rtl; }
        table { border-collapse: collapse; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    </style>

</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; direction: rtl;">

    <!-- Email Container -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" class="mobile-padding-outer" style="padding: 20px 0;">

                <!-- Main Content Table -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="800" class="mobile-full-width-container" style="max-width: 800px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); padding: 40px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td width="130" valign="middle" class="header-logo" style="padding-left: 20px;">
                                        <img src="https://www.aikidz.club/New.logov2.gif" alt="רובוט מועדון AI" width="120" height="120" style="display: block; border-radius: 12px; width: 120px !important; height: auto !important;" />
                                    </td>
                                    <td valign="middle" class="header-text" style="text-align: right;">
                                        <h1 class="mobile-heading-xl" style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                            מועדון AI לילדים
                                        </h1>
                                        <p style="margin: 0 0 4px 0; font-size: 18px; color: rgba(255,255,255,0.95); font-weight: 600;">
                                            תוכנית ממציאים צעירים
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                                            מדריך תוכנית לימודים מלאה של 48 שבועות • גילאי 8-10
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Hero Section -->
                    <tr>
                        <td class="mobile-padding" style="padding: 40px 30px; background: linear-gradient(to bottom, #f0fdfa, #ffffff);">
                            <h2 class="mobile-heading-large" style="margin: 0 0 16px 0; font-size: 28px; font-weight: bold; color: #0f172a; text-align: center;">
                                ברוכים הבאים למסע הממציאים הצעירים
                            </h2>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #475569; text-align: center;">
                                הילד שלכם עומד לצאת להרפתקה של שנה שלמה עם AI. תוכנית מקיפה זו בונה כישורי יצירתיות וחשיבה דרך פעילויות מעשיות המותאמות במיוחד ללומדים צעירים.
                            </p>
                        </td>
                    </tr>

                    <!-- Program Philosophy -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 100%); border: 2px solid #06b6d4; border-radius: 12px; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 class="mobile-heading-medium" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                                            פילוסופיית התוכנית
                                        </h3>
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 8px;">
                                            <tr>
                                                <td width="35%" style="padding: 8px 0 8px 12px; vertical-align: top;">
                                                    <strong style="color: #0891b2; font-size: 14px;">למידה דרך משחק</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">
                                                    כל מושג נלמד דרך משחקים ופעילויות חזותיות
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 0 8px 12px; vertical-align: top;">
                                                    <strong style="color: #0891b2; font-size: 14px;">תוצאות מיידיות</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">
                                                    רואים תוצאות מרגשות בכל מפגש
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 0 8px 12px; vertical-align: top;">
                                                    <strong style="color: #0891b2; font-size: 14px;">בניית בסיס</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">
                                                    כישורים שגדלים עם הילד שלכם
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 0 8px 12px; vertical-align: top;">
                                                    <strong style="color: #0891b2; font-size: 14px;">ביטחון קודם כל</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">
                                                    בניית נוחות עם טכנולוגיה בקצב שלהם
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- What Makes Our Program Special -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 class="mobile-heading-medium" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a; text-align: center;">
                                מה הופך את התוכנית שלנו למיוחדת
                            </h3>
                            <table role="presentation" cellpadding="6" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ מפגשים עצמאיים - לעולם לא נופלים אחורה
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ פרויקטי תערוכה רבעוניים
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ יישומים מהעולם האמיתי
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ כלי AI מותאמים לגיל
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ כיתות קטנות (עד 12 תלמידים)
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Year-at-a-Glance Table -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 class="mobile-heading-medium" style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0f172a; text-align: center;">
                                <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #06b6d4, #14b8a6); border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold; margin-left: 8px; vertical-align: middle;">◆</span>מבט על השנה
                            </h3>
                            <table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                <tr style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%);">
                                    <th style="padding: 12px; font-size: 14px; font-weight: 600; color: white; text-align: right; border-bottom: 2px solid white;">רבעון</th>
                                    <th style="padding: 12px; font-size: 14px; font-weight: 600; color: white; text-align: right; border-bottom: 2px solid white;">נושא</th>
                                    <th style="padding: 12px; font-size: 14px; font-weight: 600; color: white; text-align: right; border-bottom: 2px solid white;">שבועות</th>
                                </tr>
                                <tr style="background-color: #f0fdfa;">
                                    <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #0891b2; border-bottom: 1px solid #e2e8f0;">Q1</td>
                                    <td style="padding: 12px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">ארגון וניהול זמן</td>
                                    <td style="padding: 12px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">1-12</td>
                                </tr>
                                <tr style="background-color: white;">
                                    <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #0891b2; border-bottom: 1px solid #e2e8f0;">Q2</td>
                                    <td style="padding: 12px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">תקשורת ויצירתיות</td>
                                    <td style="padding: 12px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">13-24</td>
                                </tr>
                                <tr style="background-color: #f0fdfa;">
                                    <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #0891b2; border-bottom: 1px solid #e2e8f0;">Q3</td>
                                    <td style="padding: 12px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">למידה וכישורי לימוד</td>
                                    <td style="padding: 12px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">25-36</td>
                                </tr>
                                <tr style="background-color: white;">
                                    <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #0891b2;">Q4</td>
                                    <td style="padding: 12px; font-size: 14px; color: #0f172a;">צמיחה אישית ומיומנויות חיים</td>
                                    <td style="padding: 12px; font-size: 14px; color: #64748b;">37-48</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="height: 2px; background: linear-gradient(to right, #06b6d4, #14b8a6); margin: 20px 0;"></div>
                        </td>
                    </tr>

                    <!-- Quarter 1 Header -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 class="mobile-heading-large" style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
                                            רבעון 1: ארגון וניהול זמן
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            שבועות 1-12 • בניית כישורי יסוד
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Q1 Learning Objectives -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #f0fdfa; border-right: 4px solid #06b6d4; padding: 16px 20px; border-radius: 8px; overflow: hidden;">
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">מטרות למידה</h4>
                                <ul style="margin: 0; padding: 0 20px 0 0; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>להבין מה עוזרי AI יכולים לעשות</li>
                                    <li>לפרק משימות גדולות לצעדים ניתנים לביצוע</li>
                                    <li>ליצור ולעקוב אחר לוחות זמנים</li>
                                    <li>לארגן עבודות בית ומרחבים אישיים</li>
                                    <li>להציב ולעקוב אחר יעדים ברי השגה</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Q1 Week-by-Week Highlights -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #0f172a;">דגשים שבוע אחר שבוע</h4>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; overflow: hidden; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 1: העוזר הדיגיטלי שלי</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">היכרות עם עוזרי AI - למידה על מה AI יכול לעשות בחיי היומיום</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> יצירת שיחת AI ראשונה על נושאים אהובים</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; overflow: hidden; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 2: מאסטר המשימות</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">פירוק עבודות גדולות לשלבים קטנים עם סיוע AI</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> תכנון פרויקט סוף שבוע שלב אחר שלב</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; overflow: hidden; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 3: ילדי היומן</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">הבנת זמן ולוחות זמנים עם יומנים דיגיטליים</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> יצירת לוח שבועי צבעוני</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; overflow: hidden; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 5: בונה שגרת הבוקר</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">עיצוב הבוקר המושלם עם סיוע AI</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> בניית רשימת משימות חזותית לבוקר</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; overflow: hidden; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 7: חבר הקריאה</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">עקוב אחר הספרים שאתה רוצה לקרוא</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> יצירת רשימת קריאה אישית עם סיכומי AI</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; overflow: hidden; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 9: מעצב מרחב הלימוד</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">תכנון אזור השיעורים המושלם</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> יצירת תוכנית מרחב לימוד עם AI</p>
                            </div>

                            <p style="margin: 16px 0 0 0; font-size: 14px; color: #64748b; text-align: center; font-style: italic;">
                                ...ועוד 6 מפגשים מרגשים המובילים לפרויקט הגמר!
                            </p>
                        </td>
                    </tr>

                    <!-- Q1 Week 12 Capstone -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px;">
                                <h4 class="mobile-heading-small" style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
                                    <span style="display: inline-block; width: 28px; height: 28px; background: rgba(255,255,255,0.3); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-left: 8px; vertical-align: middle;">★</span>שבוע 12 פרויקט גמר: עיצוב אפליקציית עוזר אישי
                                </h4>
                                <p style="margin: 0 0 12px 0; font-size: 14px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                    עצב את עוזר ה-AI החלומי שלך המשלב את כל כישורי הארגון שנלמדו! צור מודלים חזותיים, רשימת תכונות, והצג לכיתה.
                                </p>
                                <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.9);">
                                    <strong>תוצרים:</strong> סקיצות עיצוב אפליקציה, רשימת תכונות, מצגת כיתה
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="height: 2px; background: linear-gradient(to right, #14b8a6, #0891b2); margin: 20px 0;"></div>
                        </td>
                    </tr>

                    <!-- Quarter 2 Header -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 class="mobile-heading-large" style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
                                            רבעון 2: תקשורת ויצירתיות
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            שבועות 13-24 • ביטוי רעיונות ביעילות
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Q2 Learning Objectives -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #f0fdfa; border-right: 4px solid #14b8a6; padding: 16px 20px; border-radius: 8px; overflow: hidden;">
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">מטרות למידה</h4>
                                <ul style="margin: 0; padding: 0 20px 0 0; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>לכתוב הודעות ברורות ויעילות</li>
                                    <li>ליצור תוכן חזותי ועיצובים</li>
                                    <li>לארגן אירועים ופעילויות</li>
                                    <li>לבטא יצירתיות דרך כלי AI</li>
                                    <li>לתרגל אדיבות והכרת תודה</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Q2 Summary -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                התלמידים חוקרים <strong>יסודות אימייל</strong>, <strong>מכתבי תודה</strong>, <strong>תכנון מסיבות</strong>, <strong>כתיבת סיפורים</strong>, <strong>מצגות</strong>, <strong>הקלטת קול</strong>, <strong>אמנות דיגיטלית</strong>, ועוד!
                            </p>
                        </td>
                    </tr>

                    <!-- Q2 Week 24 Capstone -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px;">
                                <h4 class="mobile-heading-small" style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
                                    <span style="display: inline-block; width: 28px; height: 28px; background: rgba(255,255,255,0.3); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-left: 8px; vertical-align: middle;">★</span>שבוע 24 פרויקט גמר: ניוזלטר כיתתי
                                </h4>
                                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                    צור ניוזלטר דיגיטלי עם חדשות, סיפורים, יצירות אמנות, יומן, וראיונות עם חברים לכיתה. שתף עם חברים למחלקה ומשפחות!
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="height: 2px; background: linear-gradient(to right, #0891b2, #06b6d4); margin: 20px 0;"></div>
                        </td>
                    </tr>

                    <!-- Quarter 3 Header -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 class="mobile-heading-large" style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
                                            רבעון 3: למידה וכישורי לימוד
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            שבועות 25-36 • כלים להצלחה אקדמית
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Q3 Learning Objectives -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #f0fdfa; border-right: 4px solid #0891b2; padding: 16px 20px; border-radius: 8px; overflow: hidden;">
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">מטרות למידה</h4>
                                <ul style="margin: 0; padding: 0 20px 0 0; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>לפתח אסטרטגיות לימוד יעילות</li>
                                    <li>ליצור כלים למקצועות שונים</li>
                                    <li>לשפר זיכרון וזכירה</li>
                                    <li>לבנות ביטחון בלמידה</li>
                                    <li>לארגן מחקר ומידע</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Q3 Summary -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                שליטה ב<strong>פתרון בעיות במתמטיקה</strong>, <strong>בניית אוצר מילים</strong>, <strong>ניסויים במדעים</strong>, <strong>כרטיסי זיכרון</strong>, <strong>הכנה למבחנים</strong>, <strong>רישום הערות</strong>, והפיכה ללומד בטוח!
                            </p>
                        </td>
                    </tr>

                    <!-- Q3 Week 36 Capstone -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px;">
                                <h4 class="mobile-heading-small" style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
                                    <span style="display: inline-block; width: 28px; height: 28px; background: rgba(255,255,255,0.3); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-left: 8px; vertical-align: middle;">★</span>שבוע 36 פרויקט גמר: ערכת כלי למידה
                                </h4>
                                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                    שלב את כל כלי הלימוד למערכת מקיפה אחת! צור כרטיסי זיכרון, מדריכי לימוד, והדגם את ערכת הלמידה המלאה שלך.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="height: 2px; background: linear-gradient(to right, #10b981, #059669); margin: 20px 0;"></div>
                        </td>
                    </tr>

                    <!-- Quarter 4 Header -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 class="mobile-heading-large" style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
                                            רבעון 4: צמיחה אישית ומיומנויות חיים
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            שבועות 37-48 • בניית אופי ועצמאות
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Q4 Learning Objectives -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #f0fdf4; border-right: 4px solid #10b981; padding: 16px 20px; border-radius: 8px; overflow: hidden;">
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">מטרות למידה</h4>
                                <ul style="margin: 0; padding: 0 20px 0 0; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>לפתח אחריות אישית</li>
                                    <li>לבנות הרגלים ושגרות בריאות</li>
                                    <li>לתרגל הכרת תודה והתבוננות עצמית</li>
                                    <li>לנהל משאבים אישיים</li>
                                    <li>לתכנן יעדים עתידיים</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Q4 Summary -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                למד <strong>ניהול כסף</strong>, <strong>ארגון מטלות</strong>, <strong>מודעות רגשית</strong>, <strong>בניית הרגלים</strong>, <strong>תרגול הכרת תודה</strong>, ו<strong>תכנון יעדים</strong>!
                            </p>
                        </td>
                    </tr>

                    <!-- Q4 Week 48 Capstone -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px;">
                                <h4 class="mobile-heading-small" style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
                                    <span style="display: inline-block; width: 28px; height: 28px; background: rgba(255,255,255,0.3); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-left: 8px; vertical-align: middle;">★</span>שבוע 48 פרויקט גמר: תיק עבודות סקירת שנה
                                </h4>
                                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                    צור תערוכה מקיפה של השנה כולה! כלול את הפרויקטים הטובים ביותר, ציר זמן צמיחה, הישגים, והצג את מסע הלמידה שלך למשפחות.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="height: 2px; background: linear-gradient(to right, #06b6d4, #14b8a6); margin: 20px 0;"></div>
                        </td>
                    </tr>

                    <!-- Session Structure -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 class="mobile-heading-medium" style="margin: 0 0 20px 0; font-size: 22px; font-weight: bold; color: #0f172a; text-align: center;">
                                <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #06b6d4, #14b8a6); border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold; margin-left: 8px; vertical-align: middle; font-size: 18px;">◷</span>כל מפגש בן 90 דקות כולל
                            </h3>

                            <table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 100%); border-radius: 8px; overflow: hidden; padding: 16px; margin-bottom: 10px;">
                                        <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">1. קבלת פנים וזכיות מהירות (5-10 דק')</p>
                                        <p style="margin: 0; font-size: 14px; color: #475569;">שיתוף הצלחות מהשבוע הקודם, בניית ביטחון והתרגשות</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 10px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="background-color: #f8fafc; border-right: 4px solid #06b6d4; padding: 12px; border-radius: 4px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">2. הוראת מושג מרכזי (15-20 דק')</p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569;">הדגמות אינטראקטיביות, למידה חזותית, הסברים מותאמים לגיל</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 10px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="background-color: #f8fafc; border-right: 4px solid #14b8a6; padding: 12px; border-radius: 4px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">3. תרגול מעשי (20-25 דק')</p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569;">זמן עבודה אישית, יישום מיומנויות מיידי, תמיכת המדריך</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 10px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="background-color: #f8fafc; border-right: 4px solid #06b6d4; padding: 12px; border-radius: 4px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">4. יצירה ובנייה (20-25 דק')</p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569;">יצירת משהו מוחשי, לראות תוצאות מיידיות, יצירתיות אישית</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 10px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="background-color: #f8fafc; border-right: 4px solid #14b8a6; padding: 12px; border-radius: 4px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">5. הרהור וצעדים הבאים (5-10 דק')</p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569;">מה למדנו? מה מרגש בשבוע הבא?</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="height: 2px; background: linear-gradient(to right, #06b6d4, #14b8a6); margin: 20px 0;"></div>
                        </td>
                    </tr>

                    <!-- What Your Child Will Achieve -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px; background-color: #f8fafc;">
                            <h3 class="mobile-heading-large" style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0f172a; text-align: center;">
                                מה הילד שלכם ישיג
                            </h3>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.8;">
                                            ✓ <strong>כישורי ארגון</strong> - ניהול עצמאי של עבודות בית ומשימות
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.8;">
                                            ✓ <strong>ביטחון יצירתי</strong> - נוח ליצור תוכן דיגיטלי
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.8;">
                                            ✓ <strong>כישורי לימוד</strong> - אסטרטגיות למידה יעילות לכל המקצועות
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.8;">
                                            ✓ <strong>מודעות עצמית</strong> - הבנת רגשות ובניית הרגלים
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.8;">
                                            ✓ <strong>אוריינות טכנולוגית</strong> - שימוש בטוח בכלי AI
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.8;">
                                            ✓ <strong>תקשורת</strong> - ביטוי ברור של רעיונות בכתב ובמצגות
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.8;">
                                            ✓ <strong>קביעת יעדים</strong> - יכולת להציב ולהשיג מטרות אישיות
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.8;">
                                            ✓ <strong>תיק עבודות</strong> - אוסף פרויקטים מרשימים להצגה
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- CTA Section -->
                    <tr>
                        <td class="mobile-padding" style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%);">
                            <h3 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: white;">
                                מוכנים להתחיל?
                            </h3>
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                הירשמו עכשיו ותנו לילד שלכם את היתרון ב-AI
                            </p>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                    <td style="border-radius: 50px; background: white; text-align: center;">
                                        <a href="https://www.aikidz.club/pricing-he-desktop.html" style="background: white; border: 2px solid white; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 1; text-align: center; text-decoration: none; display: inline-block; border-radius: 50px; padding: 16px 40px; color: #06b6d4;">
                                            צפו במחירים והירשמו ←
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Questions Section -->
                    <tr>
                        <td style="padding: 0 30px 40px 30px; text-align: center;">
                            <div style="background-color: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 24px;">
                                <h4 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
                                    <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-left: 8px; vertical-align: middle; font-size: 18px;">?</span>יש שאלות?
                                </h4>
                                <p style="margin: 0 0 16px 0; font-size: 15px; color: #475569;">
                                    נשמח לשוחח! צרו איתנו קשר בכל עת:
                                </p>
                                <p style="margin: 0 0 8px 0;">
                                    <a href="https://wa.me/972543159025?text=שלום!%20אני%20מעוניין%20בתוכנית%20הממציאים%20הצעירים" style="color: #10b981; text-decoration: none; font-weight: 600; font-size: 16px;">
                                        WhatsApp: ‎054-315-9025
                                    </a>
                                </p>
                                <p style="margin: 0;">
                                    <a href="mailto:raphael@aikidz.club" style="color: #0891b2; text-decoration: none; font-weight: 600; font-size: 16px;">
                                        raphael@aikidz.club
                                    </a>
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px; background-color: #f8fafc; text-align: center;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 0 0 15px 0; text-align: center;">
                                        <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #0f172a;">צרו קשר</p>
                                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
                                            WhatsApp: <a href="https://wa.me/972543159025" style="color: #06b6d4; text-decoration: none;">‎054-315-9025</a>
                                        </p>
                                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
                                            אימייל: <a href="mailto:raphael@aikidz.club" style="color: #06b6d4; text-decoration: none;">raphael@aikidz.club</a>
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #64748b;">
                                            אתר: <a href="https://www.aikidz.club/index-he.html" style="color: #06b6d4; text-decoration: none;">www.aikidz.club</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                                © 2025 מועדון AI לילדים. כל הזכויות שמורות.<br>
                                רעננה, ישראל
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>`;
}

/**
 * Returns the complete Teen Champions curriculum HTML (Ages 11-13) - HEBREW
 */
function getTeenChampionsHTMLHebrew() {
  // Similar structure to Young Explorers but with Teen-specific content
  const html = getYoungExplorersHTMLHebrew();
  return html
    .replace(/ממציאים צעירים/g, 'חוקרי טכנולוגיה')
    .replace(/Young Explorers/g, 'Teen Champions')
    .replace(/גילאי 8-10/g, 'גילאי 11-13')
    .replace(/Ages 8-10/g, 'Ages 11-13')
    .replace(/#06b6d4/g, '#14b8a6')
    .replace(/#0891b2/g, '#0d9488');
}

/**
 * Returns the complete Future Leaders curriculum HTML (Ages 14-18) - HEBREW
 */
function getFutureLeadersHTMLHebrew() {
  // Similar structure to Young Explorers but with Leadership-specific content
  const html = getYoungExplorersHTMLHebrew();
  return html
    .replace(/ממציאים צעירים/g, 'מנהיגי העתיד')
    .replace(/Young Explorers/g, 'Future Leaders')
    .replace(/גילאי 8-10/g, 'גילאי 14-18')
    .replace(/Ages 8-10/g, 'Ages 14-18')
    .replace(/#06b6d4/g, '#fbbf24')
    .replace(/#14b8a6/g, '#f59e0b')
    .replace(/#0891b2/g, '#d97706')
    .replace(/#e0f2fe/g, '#fef3c7')
    .replace(/#ccfbf1/g, '#fde68a');
}
