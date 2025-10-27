// ========================================
// AI KIDZ CLUB - CURRICULUM DOWNLOAD HANDLER
// ========================================
// RESPONSIVE + MINIFIED VERSION - Mobile-optimized emails
// Use the same spreadsheet as registration: 1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M
// Deploy as: Web App (Anyone can access)
//
// READY TO COPY-PASTE INTO GOOGLE APPS SCRIPT AT: https://script.google.com

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
    console.log('📥 Curriculum download request received');
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
      data.source || 'desktop', // E: Source Page
      'TRUE' // F: PDF Downloaded
    ];

    console.log('📝 Writing row to sheet:', rowData);
    downloadsSheet.appendRow(rowData);
    console.log('✅ Row written successfully');

    // Get curriculum HTML URL based on program
    const curriculumUrls = {
      'young': 'https://www.aikidz.club/pdf-curriculum-young-explorers.html',
      'tech': 'https://www.aikidz.club/pdf-curriculum-teen-champions.html',
      'future': 'https://www.aikidz.club/pdf-curriculum-future-leaders.html'
    };

    const curriculumUrl = curriculumUrls[data.program];

    if (!curriculumUrl) {
      throw new Error('Invalid program type: ' + data.program);
    }

    // Send email with curriculum HTML
    console.log('📧 Sending curriculum email...');
    sendCurriculumEmail(data.email, data.name, data.program, curriculumUrl);
    console.log('✅ Email sent successfully');

    // Send admin notification to both emails
    try {
      MailApp.sendEmail({
        to: 'raphaelberrebi@gmail.com, raphael@aikidz.club',
        subject: `📄 New Curriculum Download - ${data.program.toUpperCase()}`,
        replyTo: 'noreply@aikidz.club',
        noReply: true,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px;">
              <h2 style="color: #0891b2;">✅ New Curriculum Download</h2>
              <p><strong>Parent Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Program:</strong> ${data.program}</p>
              <p><strong>Source:</strong> ${data.source || 'desktop'}</p>
              <p><strong>Language:</strong> English</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString('en-IL', { timeZone: 'Asia/Jerusalem' })}</p>
              <hr>
              <p style="color: #666; font-size: 12px;">This is an automated notification from AI Club.</p>
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
        message: 'Check your email for the curriculum!'
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

function sendCurriculumEmail(email, name, program, curriculumUrl) {
  console.log('📧 Sending curriculum email to:', email);
  console.log('📧 Program:', program);

  const programNames = {
    'young': 'Young Explorers (Ages 8-10)',
    'tech': 'Teen Champions (Ages 11-13)',
    'future': 'Future Leaders (Ages 14-18)'
  };

  const programName = programNames[program] || 'AI Club';

  const subject = `Your Complete ${programName} Curriculum - AI Kidz Club`;

  // Get the curriculum HTML based on program type
  console.log('📄 Generating curriculum HTML for:', programName);
  let htmlBody;

  try {
    if (program === 'young') {
      htmlBody = getYoungExplorersHTML();
    } else if (program === 'tech') {
      htmlBody = getTeenChampionsHTML();
    } else if (program === 'future') {
      htmlBody = getFutureLeadersHTML();
    } else {
      throw new Error('Invalid program type');
    }
    console.log('✅ Curriculum HTML generated successfully, length:', htmlBody.length);
  } catch (error) {
    console.error('❌ Failed to generate curriculum HTML:', error.toString());
    // Fallback to a simple message if generation fails
    htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>AI Kidz Club Curriculum</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #06b6d4;">Thank you for downloading the ${programName} curriculum!</h1>
        <p>Questions? Contact us at <a href="mailto:raphael@aikidz.club">raphael@aikidz.club</a></p>
      </body>
      </html>
    `;
  }

  const plainTextBody = `Hi ${name},

Thank you for your interest in AI Kidz Club!

Your Complete 48-Week Curriculum for ${programName}

This email contains the complete curriculum with:
• Complete year-long learning journey (48 weeks)
• All 4 quarterly breakdowns with detailed activities
• Major capstone projects for each quarter
• Skills progression roadmap
• Week-by-week curriculum outline

View the curriculum online: ${curriculumUrl}

Ready to Enroll?
View our pricing and register: https://www.aikidz.club/pricing.html

Have questions? Contact us:
WhatsApp: +972-54-315-9025
Email: raphael@aikidz.club

We look forward to seeing your child thrive in our AI programs!

Best regards,
Raphael
AI Kidz Club
www.aikidz.club
`;

  try {
    console.log('📤 Attempting to send email via GmailApp...');

    GmailApp.sendEmail(email, subject, plainTextBody, {
      htmlBody: htmlBody,
      name: 'AI Kidz Club',
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
function testCurriculumEmail() {
  console.log('🧪 Testing curriculum email...');

  try {
    sendCurriculumEmail(
      'raphael.berrebi.1@gmail.com',
      'Test Parent',
      'young',
      'https://www.aikidz.club/pdf-curriculum-young-explorers.html'
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
function testAllCurricula() {
  console.log('🧪 Testing all curriculum emails...');

  const programs = [
    { code: 'young', name: 'Young Explorers' },
    { code: 'tech', name: 'Teen Champions' },
    { code: 'future', name: 'Future Leaders' }
  ];

  const results = [];

  programs.forEach(function(program) {
    try {
      const curriculumUrls = {
        'young': 'https://www.aikidz.club/pdf-curriculum-young-explorers.html',
        'tech': 'https://www.aikidz.club/pdf-curriculum-teen-champions.html',
        'future': 'https://www.aikidz.club/pdf-curriculum-future-leaders.html'
      };

      sendCurriculumEmail(
        'raphael.berrebi.1@gmail.com',
        'Test Parent',
        program.code,
        curriculumUrls[program.code]
      );

      results.push('✅ ' + program.name + ': Success');
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
function testCurriculumDownload() {
  console.log('🧪 Testing full curriculum download flow...');

  const testEvent = {
    postData: {
      contents: JSON.stringify({
        name: 'Test Parent',
        email: 'raphael.berrebi.1@gmail.com',
        program: 'young',
        source: 'test'
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
// CURRICULUM HTML TEMPLATES
// ========================================
// Young Explorers: Responsive (50 KB)
// Teen Champions: Responsive + Minified (60 KB)
// Future Leaders: Responsive + Minified (60 KB)
// ========================================

/**
 * Returns the complete Young Explorers curriculum HTML (Ages 8-10)
 * RESPONSIVE VERSION - Mobile-optimized with @media queries
 */
function getYoungExplorersHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Young Explorers Program - Complete 48-Week Curriculum | AI Kidz Club</title>

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

            /* Keep header logo and text side-by-side on mobile */
            .header-logo {
                padding-right: 10px !important;
            }

            .header-logo img {
                width: 80px !important;
                height: auto !important;
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

            /* Mobile-specific button visibility */
            .desktop-only-button { display: none !important; }
            .mobile-only-button { display: inline-block !important; }
        }

        /* Desktop button visibility (default) */
        .desktop-only-button { display: inline-block !important; }
        .mobile-only-button { display: none !important; }
    </style>

</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">

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
                                    <td width="130" valign="middle" class="header-logo" style="padding-right: 20px;">
                                        <img src="https://www.aikidz.club/New.logov2.gif" alt="AI Kidz Club Robot" width="120" height="120" style="display: block; border-radius: 12px; width: 120px !important; height: auto !important;" />
                                    </td>
                                    <td valign="middle" class="header-text" style="text-align: left;">
                                        <h1 class="mobile-heading-xl" style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold; color: white; font-family: 'Nunito', -apple-system, sans-serif;">
                                            AI Kidz Club
                                        </h1>
                                        <p style="margin: 0 0 4px 0; font-size: 18px; color: rgba(255,255,255,0.95); font-weight: 600;">
                                            Young Explorers Program
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                                            Complete 48-Week Curriculum Guide • Ages 8-10
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
                                Welcome to the Young Explorers Journey
                            </h2>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #475569; text-align: center;">
                                Your child is about to embark on a year-long adventure with AI. This comprehensive program builds essential productivity skills through creative, hands-on activities designed specifically for young learners.
                            </p>
                        </td>
                    </tr>

                    <!-- Program Philosophy -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 100%); border: 2px solid #06b6d4; border-radius: 12px; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 class="mobile-heading-medium" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">
                                            Program Philosophy
                                        </h3>
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 8px;">
                                            <tr>
                                                <td width="35%" style="padding: 8px 12px 8px 0; vertical-align: top;">
                                                    <strong style="color: #0891b2; font-size: 14px;">Learning through play</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">
                                                    Every concept taught through games and visual activities
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 12px 8px 0; vertical-align: top;">
                                                    <strong style="color: #0891b2; font-size: 14px;">Immediate results</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">
                                                    See exciting outcomes in every session
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 12px 8px 0; vertical-align: top;">
                                                    <strong style="color: #0891b2; font-size: 14px;">Foundation building</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">
                                                    Skills that grow with your child
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 12px 8px 0; vertical-align: top;">
                                                    <strong style="color: #0891b2; font-size: 14px;">Confidence first</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">
                                                    Building comfort with technology at their own pace
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- What Makes Us Special -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 class="mobile-heading-medium" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
                                What Makes Our Program Special
                            </h3>
                            <table role="presentation" cellpadding="6" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ Standalone sessions - never fall behind
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ Quarterly showcase projects
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ Real-world applications
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ Age-appropriate AI tools
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 15px; color: #475569;">
                                        ✓ Small class sizes (max 12 students)
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Year at a Glance -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 class="mobile-heading-medium" style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0f172a; text-align: center;">
                                <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #06b6d4, #14b8a6); border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold; margin-right: 8px; vertical-align: middle;">◆</span>Year-at-a-Glance
                            </h3>
                            <table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                <tr style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%);">
                                    <th style="padding: 12px; font-size: 14px; font-weight: 600; color: white; text-align: left; border-bottom: 2px solid white;">Quarter</th>
                                    <th style="padding: 12px; font-size: 14px; font-weight: 600; color: white; text-align: left; border-bottom: 2px solid white;">Theme</th>
                                    <th style="padding: 12px; font-size: 14px; font-weight: 600; color: white; text-align: left; border-bottom: 2px solid white;">Weeks</th>
                                </tr>
                                <tr style="background-color: #f0fdfa;">
                                    <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #0891b2; border-bottom: 1px solid #e2e8f0;">Q1</td>
                                    <td style="padding: 12px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">Organization & Time Management</td>
                                    <td style="padding: 12px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">1-12</td>
                                </tr>
                                <tr style="background-color: white;">
                                    <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #0891b2; border-bottom: 1px solid #e2e8f0;">Q2</td>
                                    <td style="padding: 12px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">Communication & Creativity</td>
                                    <td style="padding: 12px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">13-24</td>
                                </tr>
                                <tr style="background-color: #f0fdfa;">
                                    <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #0891b2; border-bottom: 1px solid #e2e8f0;">Q3</td>
                                    <td style="padding: 12px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">Learning & Study Skills</td>
                                    <td style="padding: 12px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">25-36</td>
                                </tr>
                                <tr style="background-color: white;">
                                    <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #0891b2;">Q4</td>
                                    <td style="padding: 12px; font-size: 14px; color: #0f172a;">Personal Growth & Life Skills</td>
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

                    <!-- Quarter 1 -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 class="mobile-heading-large" style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
                                            Quarter 1: Organization & Time Management
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            Weeks 1-12 • Building Foundation Skills
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #f0fdfa; border-left: 4px solid #06b6d4; padding: 16px 20px; border-radius: 8px;">
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Learning Objectives</h4>
                                <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>Understand what AI assistants can do</li>
                                    <li>Break big tasks into manageable steps</li>
                                    <li>Create and follow schedules</li>
                                    <li>Organize schoolwork and personal spaces</li>
                                    <li>Set and track achievable goals</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #0f172a;">Week-by-Week Highlights</h4>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">Week 1: My Digital Helper</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">Introduction to AI Assistants - Learn what AI can do in daily life</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Activity:</strong> Create your first AI conversation about favorite topics</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">Week 2: Task Master</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">Breaking big jobs into small steps with AI assistance</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Activity:</strong> Plan a weekend project step-by-step</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">Week 3: Calendar Kids</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">Understanding time and schedules with digital calendars</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Activity:</strong> Create a colorful weekly schedule</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">Week 5: Morning Routine Builder</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">Design the perfect morning with AI assistance</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Activity:</strong> Build a visual morning checklist</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">Week 7: Reading Buddy</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">Keep track of books you want to read</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Activity:</strong> Create a personal reading list with AI summaries</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">Week 9: Study Space Designer</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">Plan the perfect homework area</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Activity:</strong> Create a study space blueprint with AI</p>
                            </div>

                            <p style="margin: 16px 0 0 0; font-size: 14px; color: #64748b; text-align: center; font-style: italic;">
                                ...and 6 more exciting sessions building to the capstone project!
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px;">
                                <h4 class="mobile-heading-small" style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
                                    <span style="display: inline-block; width: 28px; height: 28px; background: rgba(255,255,255,0.3); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 12 Capstone: Personal Assistant App Design
                                </h4>
                                <p style="margin: 0 0 12px 0; font-size: 14px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                    Design your dream AI helper combining all organizational skills learned! Create visual mockups, features list, and present to class.
                                </p>
                                <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.9);">
                                    <strong>Deliverables:</strong> App design sketches, feature list, class presentation
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

                    <!-- Similar structure for Q2, Q3, Q4 - abbreviated for length -->
                    <!-- I'll include complete Q2 and then note that Q3/Q4 follow same pattern -->

                    <!-- Quarter 2 -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 class="mobile-heading-large" style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
                                            Quarter 2: Communication & Creativity
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            Weeks 13-24 • Expressing Ideas Effectively
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 16px 20px; border-radius: 8px;">
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Learning Objectives</h4>
                                <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>Write clear, effective messages</li>
                                    <li>Create visual content and designs</li>
                                    <li>Organize events and activities</li>
                                    <li>Express creativity through AI tools</li>
                                    <li>Practice kindness and gratitude</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                Students explore <strong>email basics</strong>, <strong>thank you notes</strong>, <strong>party planning</strong>, <strong>story writing</strong>, <strong>presentations</strong>, <strong>voice recording</strong>, <strong>digital art</strong>, and more!
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px;">
                                <h4 class="mobile-heading-small" style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
                                    <span style="display: inline-block; width: 28px; height: 28px; background: rgba(255,255,255,0.3); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 24 Capstone: Class Newsletter
                                </h4>
                                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                    Create a digital newsletter with news, stories, artwork, calendar, and peer interviews. Share with classmates and families!
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

                    <!-- Quarter 3 -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 class="mobile-heading-large" style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
                                            Quarter 3: Learning & Study Skills
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            Weeks 25-36 • Academic Success Tools
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #f0fdfa; border-left: 4px solid #0891b2; padding: 16px 20px; border-radius: 8px;">
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Learning Objectives</h4>
                                <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>Develop effective study strategies</li>
                                    <li>Create tools for different subjects</li>
                                    <li>Improve memory and recall</li>
                                    <li>Build confidence in learning</li>
                                    <li>Organize research and information</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                Master <strong>math problem-solving</strong>, <strong>vocabulary building</strong>, <strong>science experiments</strong>, <strong>flashcards</strong>, <strong>test prep</strong>, <strong>note-taking</strong>, and become a confident learner!
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px;">
                                <h4 class="mobile-heading-small" style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
                                    <span style="display: inline-block; width: 28px; height: 28px; background: rgba(255,255,255,0.3); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 36 Capstone: Learning Toolkit
                                </h4>
                                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                    Combine all study tools into one comprehensive system! Create flashcards, study guides, and demonstrate your complete learning toolkit.
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

                    <!-- Quarter 4 -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 class="mobile-heading-large" style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
                                            Quarter 4: Personal Growth & Life Skills
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            Weeks 37-48 • Building Character & Independence
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 8px;">
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Learning Objectives</h4>
                                <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>Develop personal responsibility</li>
                                    <li>Build healthy habits and routines</li>
                                    <li>Practice gratitude and self-reflection</li>
                                    <li>Manage personal resources</li>
                                    <li>Plan for future goals</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                Learn <strong>money management</strong>, <strong>chore organization</strong>, <strong>emotional awareness</strong>, <strong>habit building</strong>, <strong>gratitude practice</strong>, and <strong>goal planning</strong>!
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px;">
                                <h4 class="mobile-heading-small" style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
                                    <span style="display: inline-block; width: 28px; height: 28px; background: rgba(255,255,255,0.3); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 48 Capstone: Year in Review Portfolio
                                </h4>
                                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                    Create a comprehensive showcase of the entire year! Include best projects, growth timeline, achievements, and present your learning journey to families.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="height: 2px; background: linear-gradient(to right, #06b6d4, #14b8a6); margin: 30px 0;"></div>
                        </td>
                    </tr>

                    <!-- Session Structure -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 class="mobile-heading-medium" style="margin: 0 0 20px 0; font-size: 22px; font-weight: bold; color: #0f172a; text-align: center;">
                                <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #06b6d4, #14b8a6); border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold; margin-right: 8px; vertical-align: middle; font-size: 18px;">◷</span>Every 90-Minute Session Includes
                            </h3>

                            <table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 100%); border-radius: 8px; padding: 16px; margin-bottom: 10px;">
                                        <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">1. Welcome & Quick Wins (5-10 min)</p>
                                        <p style="margin: 0; font-size: 14px; color: #475569;">Share successes from previous week, build confidence and excitement</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 10px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="background-color: #f8fafc; border-left: 4px solid #06b6d4; padding: 12px; border-radius: 4px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">2. Main Concept Teaching (15-20 min)</p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569;">Interactive demonstrations, visual learning, age-appropriate explanations</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 10px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="background-color: #f8fafc; border-left: 4px solid #14b8a6; padding: 12px; border-radius: 4px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">3. Hands-On Practice (20-25 min)</p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569;">Individual work time, immediate skill application, instructor support</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 10px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="background-color: #f8fafc; border-left: 4px solid #06b6d4; padding: 12px; border-radius: 4px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">4. Creation & Building (20-25 min)</p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569;">Making something tangible, seeing immediate results, personal creativity</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 10px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="background-color: #f8fafc; border-left: 4px solid #14b8a6; padding: 12px; border-radius: 4px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0891b2;">5. Reflection & Next Steps (5-10 min)</p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569;">What did we learn? What's exciting about next week?</p>
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
                        <td class="mobile-padding" style="padding: 30px 30px;">
                            <h3 class="mobile-heading-medium" style="margin: 0 0 24px 0; font-size: 24px; font-weight: bold; color: #0f172a; text-align: center;">
                                <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>What Your Child Will Achieve
                            </h3>

                            <table role="presentation" cellpadding="8" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">
                                        ✓ <strong style="color: #06b6d4;">Organization Skills</strong> - Independent homework and task management
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">
                                        ✓ <strong style="color: #06b6d4;">Creative Confidence</strong> - Comfortable creating digital content
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">
                                        ✓ <strong style="color: #06b6d4;">Study Skills</strong> - Effective learning strategies for all subjects
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">
                                        ✓ <strong style="color: #06b6d4;">Self-Awareness</strong> - Understanding emotions and building habits
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">
                                        ✓ <strong style="color: #06b6d4;">Technology Literacy</strong> - Confident using AI tools appropriately
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">
                                        ✓ <strong style="color: #06b6d4;">Communication</strong> - Clear expression of ideas in writing and presentations
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">
                                        ✓ <strong style="color: #06b6d4;">Goal Setting</strong> - Ability to set and achieve personal goals
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">
                                        ✓ <strong style="color: #06b6d4;">Portfolio</strong> - Collection of impressive projects to showcase
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- CTA Section -->
                    <tr>
                        <td style="padding: 0 30px 40px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); border-radius: 12px; padding: 32px; text-align: center;">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 16px 0; font-size: 26px; font-weight: bold; color: white;">
                                            Ready to Enroll Your Child?
                                        </h3>
                                        <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                            Limited spots available for the upcoming session. Secure your child's place today!
                                        </p>
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td align="center">
                                                    <!-- Desktop Button -->
                                                    <a href="https://www.aikidz.club/pricing.html" class="desktop-only-button" style="display: inline-block; background-color: white; color: #0891b2; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                                                        View Pricing & Register
                                                    </a>
                                                    <!-- Mobile Button -->
                                                    <a href="https://www.aikidz.club/pricing-mobile.html" class="mobile-button mobile-only-button" style="display: inline-block; background-color: white; color: #0891b2; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                                                        View Pricing & Register
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 24px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                                            Sundays 16:00-17:30 • Max 12 students • All materials included
                                        </p>
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
                                    <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-weight: bold; margin-right: 8px; vertical-align: middle; font-size: 18px;">?</span>Have Questions?
                                </h4>
                                <p style="margin: 0 0 16px 0; font-size: 15px; color: #475569;">
                                    We'd love to chat! Contact us anytime:
                                </p>
                                <p style="margin: 0 0 8px 0;">
                                    <a href="https://wa.me/972543159025?text=Hi!%20I'm%20interested%20in%20the%20Young%20Explorers%20program" style="color: #10b981; text-decoration: none; font-weight: 600; font-size: 16px;">
                                        WhatsApp: +972-54-315-9025
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
                        <td class="mobile-padding" style="padding: 30px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">
                                AI Kidz Club • www.aikidz.club • raphael@aikidz.club • +972-54-315-9025
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
 * Returns the complete Teen Champions curriculum HTML (Ages 11-13)
 * RESPONSIVE + MINIFIED VERSION - Mobile-optimized
 */
function getTeenChampionsHTML() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Teen Champions Program - Complete 48-Week Curriculum | AI Kidz Club</title><style>/* Responsive styles for mobile devices */@media only screen and (max-width: 480px) {/* Force 100% width on mobile regardless of desktop width */.mobile-full-width-container { max-width: 100% !important; width: 100% !important; }/* Reduce outer padding on mobile */.mobile-padding-outer { padding: 10px 0 !important; }/* Reduce content padding on mobile */.mobile-padding { padding: 20px 15px !important; }.mobile-padding-small { padding: 15px 12px !important; }.mobile-padding-tiny { padding: 12px 10px !important; }/* Stack pricing cards vertically */.pricing-card {width: 100% !important;display: block !important;padding: 0 0 12px 0 !important;}/* Reduce font sizes on mobile */.mobile-heading-xl { font-size: 24px !important; }.mobile-heading-large { font-size: 22px !important; }.mobile-heading-medium { font-size: 18px !important; }.mobile-heading-small { font-size: 16px !important; }.mobile-text { font-size: 14px !important; }.mobile-text-small { font-size: 13px !important; }/* Keep header logo and text side-by-side on mobile */.header-logo {padding-right: 10px !important;}.header-logo img {width: 80px !important;height: auto !important;}/* Make images responsive */.mobile-img { max-width: 100% !important; height: auto !important; }/* Improve button sizing on mobile */.mobile-button {padding: 14px 28px !important;font-size: 16px !important;}/* Reduce table cell widths on mobile */.mobile-full-width { width: 100% !important; }/* Better spacing for mobile */.mobile-margin-bottom { margin-bottom: 16px !important; }}</style></head><body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;"><tr><td align="center" class="mobile-padding-outer" style="padding: 20px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="800" class="mobile-full-width-container" style="max-width: 800px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);"><tr><td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 40px 30px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="130" valign="middle" class="header-logo" style="padding-right: 20px;"><img src="https://www.aikidz.club/New.logov2.gif" alt="AI Kidz Club Robot" width="120" height="120" style="display: block; border-radius: 12px; width: 120px !important; height: auto !important;" /></td><td valign="middle" class="header-text" style="text-align: left;"><h1 class="mobile-heading-xl" style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold; color: white; font-family: 'Nunito', -apple-system, sans-serif;">AI Kidz Club</h1><p style="margin: 0 0 4px 0; font-size: 18px; color: rgba(255,255,255,0.95); font-weight: 600;">Teen Champions Program</p><p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.85);">Complete 48-Week Curriculum Guide • Ages 11-13</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px 30px 30px; text-align: center;"><h2 class="mobile-heading-large" style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Welcome to Teen Champions</h2><p style="margin: 0; font-size: 16px; line-height: 1.6; color: #475569;">This comprehensive program transforms middle schoolers into productivity masters. Through real-world applications and professional-grade tools, your teen will develop systems that deliver immediate academic results and lifelong success skills.</p></td></tr><tr><td style="padding: 0 30px 30px 30px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #ccfbf1 0%, #e0f2fe 100%); border: 2px solid #14b8a6; border-radius: 12px; padding: 20px;"><tr><td><h3 class="mobile-heading-medium" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Program Philosophy</h3><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 8px;"><tr><td width="35%" style="padding: 8px 12px 8px 0; vertical-align: top;"><strong style="color: #0891b2; font-size: 14px;">Real-world relevance</strong></td><td style="padding: 8px 0; font-size: 14px; color: #1e293b;">Every skill applies immediately to school and life</td></tr><tr><td width="35%" style="padding: 8px 12px 8px 0; vertical-align: top;"><strong style="color: #0891b2; font-size: 14px;">Systems over tactics</strong></td><td style="padding: 8px 0; font-size: 14px; color: #1e293b;">Build comprehensive approaches, not quick fixes</td></tr><tr><td width="35%" style="padding: 8px 12px 8px 0; vertical-align: top;"><strong style="color: #0891b2; font-size: 14px;">Professional tools</strong></td><td style="padding: 8px 0; font-size: 14px; color: #1e293b;">Use the same productivity systems as top performers</td></tr><tr><td width="35%" style="padding: 8px 12px 8px 0; vertical-align: top;"><strong style="color: #0891b2; font-size: 14px;">Measurable results</strong></td><td style="padding: 8px 0; font-size: 14px; color: #1e293b;">See concrete improvements in grades and organization</td></tr></table></td></tr></table></td></tr><tr><td style="padding: 0 30px 40px 30px;"><h3 class="mobile-heading-medium" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">What Makes Our Program Special</h3><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span>Academic excellence focus</td></tr><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span>Professional productivity systems</td></tr><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span>1-on-1 coaching sessions included</td></tr><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span>Portfolio development</td></tr><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span>Small class sizes (max 12 students)</td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 30px; background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%); border-top: 4px solid #14b8a6;"><h2 class="mobile-heading-large" style="margin: 0 0 24px 0; font-size: 26px; font-weight: 700; color: #0f172a; text-align: center; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #14b8a6, #0891b2); border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: bold; margin-right: 10px; vertical-align: middle; font-size: 20px;">◆</span>Year-at-a-Glance</h2><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 24px;"><tr style="background: linear-gradient(135deg, #14b8a6, #0891b2);"><th style="color: white; font-weight: 700; font-size: 13px; text-align: left; padding: 12px;">Quarter</th><th style="color: white; font-weight: 700; font-size: 13px; text-align: left; padding: 12px;">Theme</th><th style="color: white; font-weight: 700; font-size: 13px; text-align: left; padding: 12px;">Weeks</th><th style="color: white; font-weight: 700; font-size: 13px; text-align: left; padding: 12px;">Major Project</th></tr><tr style="background: #ffffff;"><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #14b8a6;">Q1</strong></td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">Academic Excellence Systems</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">1-12</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">Academic Success Portfolio</td></tr><tr style="background: #f8fafc;"><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #14b8a6;">Q2</strong></td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">Personal Productivity & Life Management</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">13-24</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">Personal Life Operating System</td></tr><tr style="background: #ffffff;"><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #14b8a6;">Q3</strong></td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">Creative & Career Development</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">25-36</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">Career Launch Kit</td></tr><tr style="background: #f8fafc;"><td style="padding: 12px;"><strong style="color: #14b8a6;">Q4</strong></td><td style="padding: 12px; font-size: 14px; color: #1e293b;">Advanced Productivity & Leadership</td><td style="padding: 12px; font-size: 14px; color: #64748b;">37-48</td><td style="padding: 12px; font-size: 14px; color: #1e293b;">Productivity Mastery Showcase</td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #ccfbf1 0%, #e0f2fe 100%); border: 2px solid #14b8a6; border-radius: 12px; padding: 20px; margin-bottom: 20px;"><tr><td><h3 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">How the Program Works</h3><p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #1e293b;"><strong>Progressive Mastery:</strong>Each quarter introduces professional-grade systems that build on previous knowledge, creating comprehensive productivity infrastructure.</p><p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #1e293b;"><strong>Real-World Application:</strong>Every skill is immediately applicable to schoolwork, with measurable improvements in grades and efficiency.</p><p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #1e293b;"><strong>Portfolio Development:</strong>Teens create impressive projects that can be showcased for high school applications and future opportunities.</p><p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;"><strong>1-on-1 Coaching:</strong>Quarterly and annual plans include personalized coaching sessions to optimize individual systems.</p></td></tr></table><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-radius: 8px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Program Details</h4><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="40%" style="padding: 6px 0; font-size: 14px;"><strong>Duration:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">48 weeks (12 weeks per quarter)</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Session Length:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">90 minutes per week</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Class Size:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Maximum 12 students</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Location:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Raanana, Israel</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Schedule:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Sundays 17:30-18:45</td></tr></table></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #14b8a6;"><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #14b8a6, #0891b2); border-radius: 12px; margin-bottom: 20px;"><tr><td><h2 class="mobile-heading-medium" style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: white; font-family: 'Nunito', -apple-system, sans-serif;">Quarter 1: Academic Excellence Systems</h2><p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.95);">Weeks 1-12 • Mastering School Success</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: #f0fdfa; border-left: 4px solid #14b8a6; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Learning Objectives</h4><ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;"><li>Build integrated productivity infrastructure</li><li>Master research and note-taking strategies</li><li>Optimize study schedules and test preparation</li><li>Enhance writing and presentation skills</li><li>Excel at group project management</li></ul></td></tr></table><h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Week-by-Week Highlights</h4><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 1: Digital Command Center Setup</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Create a centralized productivity hub with calendar, tasks, and notes integration</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Set up integrated productivity stack (Notion/Obsidian + AI)</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 2: Advanced Assignment Management</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Multi-project tracking and prioritization mastery</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Build comprehensive assignment tracker system</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 3: Smart Note-Taking Strategies</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Cornell method, mind mapping, and AI-enhanced note systems</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create subject-specific note templates</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 5: Research Mastery</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Advanced search techniques and source evaluation with AI assistance</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Complete research project with citation system</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 7: Writing Excellence</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Essay structure, argumentation, and AI-powered editing</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Write polished academic paper with AI feedback</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 9: Presentation Pro</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Professional slide design and public speaking with AI support</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create and deliver compelling presentation</p></td></tr></table><p style="margin: 0 0 20px 0; text-align: center; font-size: 14px; font-style: italic; color: #64748b;">...and 6 more powerful sessions building to the capstone project!</p><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #92400e; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(251, 191, 36, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #92400e; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 12 Capstone: Academic Success Portfolio</h4><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Complete digital portfolio showcasing best work, study systems, and self-assessment of academic growth. Professional presentation to peers and parents.</p><p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">This project uses skills from:</p><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Week 1: Productivity infrastructure</li><li>Week 2: Assignment management</li><li>Week 3: Note-taking systems</li><li>Week 5: Research methodology</li><li>Week 7: Professional writing</li><li>Week 9: Presentation design</li></ul><p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Deliverables:</p><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Portfolio website, work samples, study documentation, grade comparisons, professional presentation</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #0891b2;"><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #0891b2, #06b6d4); border-radius: 12px; margin-bottom: 20px;"><tr><td><h2 class="mobile-heading-medium" style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: white; font-family: 'Nunito', -apple-system, sans-serif;">Quarter 2: Personal Productivity & Life Management</h2><p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.95);">Weeks 13-24 • Mastering Life Beyond School</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: #f0fdfa; border-left: 4px solid #0891b2; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Learning Objectives</h4><ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;"><li>Set and achieve meaningful goals</li><li>Build sustainable habits and routines</li><li>Master time and energy management</li><li>Develop financial literacy basics</li><li>Balance multiple life areas effectively</li></ul></td></tr></table><h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Week-by-Week Highlights</h4><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 13: SMART Goals Framework</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Setting specific, measurable, achievable goals with AI tracking</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create quarterly goal system with milestones</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 15: Habit Formation Science</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Build lasting positive habits using proven frameworks</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Design 30-day habit tracking and accountability system</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 17: Time Audit & Optimization</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Analyze how time is spent and eliminate waste</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Complete time audit and redesign weekly schedule</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 19: Energy Management</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Work with natural energy patterns for peak performance</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create personalized energy-based schedule</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 21: Financial Literacy Basics</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Understanding money, budgeting, and saving for goals</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Build personal budget and savings plan with AI</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 23: Digital Organization</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Master email, files, and digital workspace management</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Organize complete digital ecosystem</p></td></tr></table><p style="margin: 0 0 20px 0; text-align: center; font-size: 14px; font-style: italic; color: #64748b;">...and 6 more transformative sessions building to the capstone project!</p><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #92400e; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(251, 191, 36, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #92400e; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 24 Capstone: Personal Life Operating System</h4><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Comprehensive life management system integrating all productivity tools. Includes dashboard, routines, tracking mechanisms, and complete system demonstration.</p><p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">This project uses skills from:</p><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Week 13: Goal setting framework</li><li>Week 15: Habit tracking systems</li><li>Week 17: Time optimization</li><li>Week 19: Energy management</li><li>Week 21: Financial planning</li><li>Week 23: Digital organization</li></ul><p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Deliverables:</p><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Comprehensive dashboard, integrated systems, documentation, demonstration presentation</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #06b6d4;"><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #06b6d4, #14b8a6); border-radius: 12px; margin-bottom: 20px;"><tr><td><h2 class="mobile-heading-medium" style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: white; font-family: 'Nunito', -apple-system, sans-serif;">Quarter 3: Creative & Career Development</h2><p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.95);">Weeks 25-36 • Building Your Future</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: #f0fdfa; border-left: 4px solid #06b6d4; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Learning Objectives</h4><ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;"><li>Launch content creation projects</li><li>Develop professional portfolio</li><li>Explore career possibilities</li><li>Build networking and communication skills</li><li>Create value through skills</li></ul></td></tr></table><h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Week-by-Week Highlights</h4><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 25: Content Platform Launch</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Start blog, YouTube channel, or social media presence</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Launch content platform with first 3 posts</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 27: Professional Portfolio Development</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Showcase skills and projects professionally</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Build portfolio website with AI assistance</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 29: Resume & CV Mastery</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Create professional resume for opportunities and applications</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Design resume with AI optimization</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 31: Networking Fundamentals</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Build relationships and professional connections</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create networking strategy and outreach plan</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 33: Side Hustle Starter</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Turn skills into value for others</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Launch small service business or project</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 35: Personal Branding</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Define and communicate your unique value</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Develop complete personal brand with AI</p></td></tr></table><p style="margin: 0 0 20px 0; text-align: center; font-size: 14px; font-style: italic; color: #64748b;">...and 6 more career-building sessions culminating in the capstone project!</p><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #92400e; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(251, 191, 36, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #92400e; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 36 Capstone: Career Launch Kit</h4><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Complete professional package with resume, portfolio, and pitch. Present to mentors demonstrating career readiness and professional skills.</p><p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">This project uses skills from:</p><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Week 25: Content platform</li><li>Week 27: Portfolio website</li><li>Week 29: Professional resume</li><li>Week 31: Networking strategy</li><li>Week 33: Business experience</li><li>Week 35: Personal branding</li></ul><p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Deliverables:</p><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Complete career package, mentor presentation, professional pitch deck</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #10b981;"><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; margin-bottom: 20px;"><tr><td><h2 class="mobile-heading-medium" style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: white; font-family: 'Nunito', -apple-system, sans-serif;">Quarter 4: Advanced Productivity & Leadership</h2><p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.95);">Weeks 37-48 • Mastery and Teaching Others</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Learning Objectives</h4><ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;"><li>Master advanced AI techniques</li><li>Build sophisticated automation systems</li><li>Develop teaching and mentoring skills</li><li>Create comprehensive review processes</li><li>Plan long-term success</li></ul></td></tr></table><h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Week-by-Week Highlights</h4><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 37: Prompt Engineering Mastery</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Advanced prompting techniques for professional results</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Build custom AI assistant for specific workflow</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 39: Automation Workflows</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Connect tools and create automated processes</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Design and implement automation system</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 41: Decision Frameworks</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Make better choices faster with systematic approaches</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create personal decision-making framework</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 43: Deep Work Mastery</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Achieve flow state and maximize productive time</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Design deep work schedule and environment</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 45: Teaching & Mentoring</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Share knowledge effectively and guide others</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create teaching materials and mentor younger students</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Week 47: Annual Review & Planning</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Reflect on progress and set vision for future</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Complete year review and next year plan</p></td></tr></table><p style="margin: 0 0 20px 0; text-align: center; font-size: 14px; font-style: italic; color: #64748b;">...and 6 more mastery sessions building to the final capstone project!</p><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #92400e; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(251, 191, 36, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #92400e; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 48 Capstone: Productivity Mastery Showcase</h4><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Demonstrate complete productivity system in action. Include case studies, before/after comparisons, and teach others your system through a masterclass presentation.</p><p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">This project uses skills from:</p><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>All Q1 academic systems</li><li>All Q2 life management</li><li>All Q3 career development</li><li>All Q4 advanced techniques</li><li>Complete AI mastery</li><li>Teaching and leadership</li></ul><p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Deliverables:</p><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Case study documentation, before/after analysis, masterclass presentation, mentoring plan</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%); border-top: 4px solid #14b8a6;"><h2 class="mobile-heading-large" style="margin: 0 0 24px 0; font-size: 26px; font-weight: 700; color: #0f172a; text-align: center; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #14b8a6, #0891b2); border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: bold; margin-right: 10px; vertical-align: middle; font-size: 20px;">◷</span>Every 90-Minute Session Includes</h2><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #f0fdfa, #e0f2fe); border-radius: 8px; margin-bottom: 12px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0891b2; font-family: 'Nunito', -apple-system, sans-serif;">1. Check-In & Wins (5-10 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">Share productivity wins and challenges, peer learning and support</p></td></tr></table><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-left: 4px solid #14b8a6; border-radius: 6px; margin-bottom: 12px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0891b2; font-family: 'Nunito', -apple-system, sans-serif;">2. Core Teaching (20-25 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">In-depth concepts, professional tools, real-world applications</p></td></tr></table><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-left: 4px solid #0891b2; border-radius: 6px; margin-bottom: 12px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0891b2; font-family: 'Nunito', -apple-system, sans-serif;">3. Guided Practice (25-30 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">Hands-on implementation, building systems, instructor coaching</p></td></tr></table><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-left: 4px solid #14b8a6; border-radius: 6px; margin-bottom: 12px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0891b2; font-family: 'Nunito', -apple-system, sans-serif;">4. Application & Refinement (20-25 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">Personalizing to needs, problem-solving, peer collaboration</p></td></tr></table><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-left: 4px solid #0891b2; border-radius: 6px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0891b2; font-family: 'Nunito', -apple-system, sans-serif;">5. Integration Planning (5-10 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">How to apply this week, connection to existing systems</p></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #ccfbf1 0%, #e0f2fe 100%); border: 2px solid #14b8a6; border-radius: 12px; padding: 20px; margin-bottom: 20px;"><tr><td><h3 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">What Makes Our Sessions Effective</h3><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span><strong>Professional Focus:</strong>Real productivity tools used by executives and entrepreneurs</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span><strong>Immediate Application:</strong>Skills apply directly to schoolwork with measurable results</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span><strong>1-on-1 Coaching:</strong>Personalized sessions for quarterly and annual enrollments</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span><strong>Peer Learning:</strong>Collaborate with motivated teens pursuing excellence</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span><strong>Expert Instruction:</strong>Instructors with professional productivity and AI expertise</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span><strong>Portfolio Building:</strong>Create impressive projects for high school applications</td></tr></table></td></tr></table><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #fbbf24; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #92400e; font-family: 'Nunito', -apple-system, sans-serif;">Parent Involvement</h4><p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #1e293b;">We keep families informed about academic improvements and system development:</p><ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Weekly progress updates and grade improvement tracking</li><li>Monthly parent coaching calls (quarterly/annual plans)</li><li>Quarterly portfolio reviews and demonstrations</li><li>Access to all systems and productivity tools</li><li>Direct instructor communication</li></ul></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #fbbf24;"><h2 class="mobile-heading-large" style="margin: 0 0 24px 0; font-size: 26px; font-weight: 700; color: #0f172a; text-align: center; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: bold; margin-right: 10px; vertical-align: middle; font-size: 20px;">★</span>What Your Teen Will Achieve</h2><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;"><tr><td width="50%" valign="top" style="padding-right: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Academic Excellence</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Top grades through proven systems, research mastery, professional writing</p></td><td width="50%" valign="top" style="padding-left: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Professional Skills</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Tools used by executives and entrepreneurs, real productivity infrastructure</p></td></tr><tr><td width="50%" valign="top" style="padding-right: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Career Clarity</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Understanding of strengths and possibilities, portfolio for opportunities</p></td><td width="50%" valign="top" style="padding-left: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Leadership Experience</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Mentoring and teaching others, guiding younger students</p></td></tr><tr><td width="50%" valign="top" style="padding-right: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Digital Mastery</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Advanced productivity technology fluency, automation expertise</p></td><td width="50%" valign="top" style="padding-left: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Portfolio</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Impressive showcase for high school applications and opportunities</p></td></tr><tr><td width="50%" valign="top" style="padding-right: 12px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Life Systems</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Complete operating system for personal success and goal achievement</p></td><td width="50%" valign="top" style="padding-left: 12px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Confidence</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Self-directed learning and problem-solving ability, independent execution</p></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #ccfbf1 0%, #e0f2fe 100%); border: 2px solid #14b8a6; border-radius: 12px; padding: 20px;"><tr><td><h3 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Measurable Impact</h3><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">The Teen Champions program delivers concrete, measurable results:</p><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #0891b2; font-family: 'Nunito', -apple-system, sans-serif;">Academic Performance:</h4><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Average grade improvement of 10-15% within first quarter</li><li>Reduced homework time through efficient systems</li><li>Better test scores from improved study strategies</li><li>Higher quality assignments and presentations</li></ul><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #0891b2; font-family: 'Nunito', -apple-system, sans-serif;">Personal Development:</h4><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Increased independence and self-direction</li><li>Better time management and organization</li><li>Improved goal setting and achievement</li><li>Enhanced communication and leadership</li></ul><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #0891b2; font-family: 'Nunito', -apple-system, sans-serif;">Future Readiness:</h4><ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Professional portfolio for high school applications</li><li>Career exploration and clarity</li><li>College-level productivity skills</li><li>Competitive advantage for opportunities</li></ul></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%); border-top: 4px solid #14b8a6;"><table role="presentation" cellpadding="20" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #dbeafe 100%); border: 2px solid #14b8a6; border-radius: 12px; margin-bottom: 20px;"><tr><td style="text-align: center;"><h2 class="mobile-heading-medium" style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #14b8a6; font-family: 'Nunito', -apple-system, sans-serif;">Ready to Enroll Your Teen?</h2><p style="margin: 0; font-size: 15px; line-height: 1.6; color: #475569;">Limited spots available. Give your teen the productivity advantage with professional systems and coaching!</p></td></tr></table><h3 class="mobile-heading-medium" style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Pricing Options</h3><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;"><tr><td width="240" valign="top" class="pricing-card" style="padding-right: 12px;"><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px;"><tr><td style="text-align: center;"><h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #64748b; font-family: 'Nunito', -apple-system, sans-serif;">Monthly</h4><div style="font-size: 28px; font-weight: 800; color: #14b8a6; margin: 8px 0;">₪699</div><p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">per month</p><ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.8; color: #475569; text-align: left;"><li>4 sessions per month</li><li>All materials included</li><li>Cancel anytime</li><li>Project showcase access</li></ul></td></tr></table></td><td width="280" valign="top" class="pricing-card" style="padding: 0 6px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 2px solid #14b8a6; border-radius: 8px;"><tr><td style="background: #14b8a6; color: white; text-align: center; padding: 6px; border-radius: 6px 6px 0 0; font-size: 12px; font-weight: 700;">BEST VALUE + COACHING</td></tr><tr><td style="padding: 12px; text-align: center;"><h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #64748b; font-family: 'Nunito', -apple-system, sans-serif;">Quarterly</h4><div style="font-size: 28px; font-weight: 800; color: #14b8a6; margin: 8px 0;">₪1,797</div><p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">per quarter (₪599/mo)</p><ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.8; color: #475569; text-align: left;"><li>12 sessions per quarter</li><li>All materials included</li><li>2 x 1-on-1 coaching sessions</li><li>Priority registration</li></ul></td></tr></table></td><td width="240" valign="top" class="pricing-card" style="padding-left: 12px;"><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px;"><tr><td style="text-align: center;"><h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #64748b; font-family: 'Nunito', -apple-system, sans-serif;">Annual</h4><div style="font-size: 28px; font-weight: 800; color: #14b8a6; margin: 8px 0;">₪6,588</div><p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">per year (₪549/mo)</p><ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.8; color: #475569; text-align: left;"><li>48 sessions (full year)</li><li>All materials included</li><li>4 x 1-on-1 coaching sessions</li><li>Year-end portfolio event</li></ul></td></tr></table></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #ccfbf1 0%, #e0f2fe 100%); border: 2px solid #14b8a6; border-radius: 12px; padding: 20px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Family Discounts</h4><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span><strong>Second child:</strong>10% off</td></tr><tr><td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><span style="color: #14b8a6; font-weight: bold; margin-right: 8px;">✓</span><strong>Third child and beyond:</strong>15% off each</td></tr></table><p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">Discounts apply to the lower-priced program(s) when enrolling multiple children</p></td></tr></table><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Program Details</h4><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="35%" style="padding: 6px 0; font-size: 14px;"><strong>Schedule:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Sundays 17:30-18:45</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Location:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Raanana, Israel</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Class Size:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Maximum 12 students</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Age Range:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">11-13 years old</td></tr></table></td></tr></table><table role="presentation" cellpadding="20" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #fbbf24; border-radius: 12px; text-align: center;"><tr><td><h3 class="mobile-heading-medium" style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #92400e; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(251, 191, 36, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #92400e; font-weight: bold; margin-right: 8px; vertical-align: middle;">?</span>Have Questions?</h3><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">We'd love to chat! Contact us anytime:</p><p style="margin: 0 0 8px 0;"><a href="https://wa.me/972543159025?text=Hi!%20I'm%20interested%20in%20the%20Teen%20Champions%20program" style="color: #10b981; text-decoration: none; font-weight: 600; font-size: 16px;">WhatsApp: +972-54-315-9025</a></p><p style="margin: 0 0 8px 0;"><a href="mailto:raphael@aikidz.club" style="color: #0891b2; text-decoration: none; font-weight: 600; font-size: 16px;">raphael@aikidz.club</a></p><p style="margin: 0;"><a href="https://www.aikidz.club" style="color: #0891b2; text-decoration: none; font-weight: 600; font-size: 16px;">www.aikidz.club</a></p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 30px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0;"><p style="margin: 0; font-size: 12px; color: #64748b;">AI Kidz Club • www.aikidz.club • raphael@aikidz.club • +972-54-315-9025</p></td></tr></table></td></tr></table></body></html>`;
}

/**
 * Returns the complete Future Leaders curriculum HTML (Ages 14-18)
 * RESPONSIVE + MINIFIED VERSION - Mobile-optimized
 */
function getFutureLeadersHTML() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Future Leaders Program - Complete 48-Week Curriculum | AI Kidz Club</title><style>/* Responsive styles for mobile devices */@media only screen and (max-width: 480px) {/* Force 100% width on mobile regardless of desktop width */.mobile-full-width-container { max-width: 100% !important; width: 100% !important; }/* Reduce outer padding on mobile */.mobile-padding-outer { padding: 10px 0 !important; }/* Reduce content padding on mobile */.mobile-padding { padding: 20px 15px !important; }.mobile-padding-small { padding: 15px 12px !important; }.mobile-padding-tiny { padding: 12px 10px !important; }/* Stack pricing cards vertically */.pricing-card {width: 100% !important;display: block !important;padding: 0 0 12px 0 !important;}/* Reduce font sizes on mobile */.mobile-heading-xl { font-size: 24px !important; }.mobile-heading-large { font-size: 22px !important; }.mobile-heading-medium { font-size: 18px !important; }.mobile-heading-small { font-size: 16px !important; }.mobile-text { font-size: 14px !important; }.mobile-text-small { font-size: 13px !important; }/* Keep header logo and text side-by-side on mobile */.header-logo {padding-right: 10px !important;}.header-logo img {width: 80px !important;height: auto !important;}/* Make images responsive */.mobile-img { max-width: 100% !important; height: auto !important; }/* Improve button sizing on mobile */.mobile-button {padding: 14px 28px !important;font-size: 16px !important;}/* Reduce table cell widths on mobile */.mobile-full-width { width: 100% !important; }/* Better spacing for mobile */.mobile-margin-bottom { margin-bottom: 16px !important; }}</style></head><body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;"><tr><td align="center" class="mobile-padding-outer" style="padding: 20px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="800" class="mobile-full-width-container" style="max-width: 800px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);"><tr><td style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px 30px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="130" valign="middle" class="header-logo" style="padding-right: 20px;"><img src="https://www.aikidz.club/New.logov2.gif" alt="AI Kidz Club Robot" width="120" height="120" style="display: block; border-radius: 12px; width: 120px !important; height: auto !important;" /></td><td valign="middle" class="header-text" style="text-align: left;"><h1 class="mobile-heading-xl" style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold; color: white; font-family: 'Nunito', -apple-system, sans-serif;">AI Kidz Club</h1><p style="margin: 0 0 4px 0; font-size: 18px; color: rgba(255,255,255,0.95); font-weight: 600;">Future Leaders Program</p><p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.85);">Complete 48-Week Curriculum Guide • Ages 14-18</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px 30px 30px; text-align: center;"><h2 class="mobile-heading-large" style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">AI Leadership Academy</h2><p style="margin: 0; font-size: 16px; line-height: 1.6; color: #475569;">Designed for high school students ready to become AI leaders and innovators. This intensive program develops entrepreneurial thinking, professional skills, and real-world business applications that prepare students for college and careers.</p></td></tr><tr><td style="padding: 0 30px 30px 30px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px; padding: 20px;"><tr><td><h3 class="mobile-heading-medium" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Program Philosophy</h3><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 8px;"><tr><td width="40%" style="padding: 8px 12px 8px 0; vertical-align: top;"><strong style="color: #d97706; font-size: 14px;">Industry-level execution</strong></td><td style="padding: 8px 0; font-size: 14px; color: #1e293b;">Work with professional-grade tools and real business scenarios</td></tr><tr><td width="40%" style="padding: 8px 12px 8px 0; vertical-align: top;"><strong style="color: #d97706; font-size: 14px;">Entrepreneurial mindset</strong></td><td style="padding: 8px 0; font-size: 14px; color: #1e293b;">See opportunities, create value, and solve problems independently</td></tr><tr><td width="40%" style="padding: 8px 12px 8px 0; vertical-align: top;"><strong style="color: #d97706; font-size: 14px;">Leadership development</strong></td><td style="padding: 8px 0; font-size: 14px; color: #1e293b;">Guide others, mentor younger students, and lead initiatives</td></tr><tr><td width="40%" style="padding: 8px 12px 8px 0; vertical-align: top;"><strong style="color: #d97706; font-size: 14px;">College & career ready</strong></td><td style="padding: 8px 0; font-size: 14px; color: #1e293b;">Build portfolio and skills for competitive university programs</td></tr></table></td></tr></table></td></tr><tr><td style="padding: 0 30px 40px 30px;"><h3 class="mobile-heading-medium" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">What Makes Our Program Special</h3><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span>Industry-level AI applications and tools</td></tr><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span>Entrepreneurship and business development focus</td></tr><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span>Executive coaching and mentorship included</td></tr><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span>Professional portfolio for college applications</td></tr><tr><td style="padding: 6px 0; font-size: 15px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span>Small cohorts (max 12 students) for intensive learning</td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 30px; background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%); border-top: 4px solid #fbbf24;"><h2 class="mobile-heading-large" style="margin: 0 0 24px 0; font-size: 26px; font-weight: 700; color: #0f172a; text-align: center; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: bold; margin-right: 10px; vertical-align: middle; font-size: 20px;">◆</span>Year-at-a-Glance</h2><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 24px;"><tr style="background: linear-gradient(135deg, #fbbf24, #f59e0b);"><th style="color: white; font-weight: 700; font-size: 13px; text-align: left; padding: 12px;">Quarter</th><th style="color: white; font-weight: 700; font-size: 13px; text-align: left; padding: 12px;">Theme</th><th style="color: white; font-weight: 700; font-size: 13px; text-align: left; padding: 12px;">Weeks</th><th style="color: white; font-weight: 700; font-size: 13px; text-align: left; padding: 12px;">Major Project</th></tr><tr style="background: #ffffff;"><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #fbbf24;">Q1</strong></td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">AI Industry & Market Analysis</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">1-12</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">AI Industry Intelligence Report</td></tr><tr style="background: #f8fafc;"><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #fbbf24;">Q2</strong></td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">Professional AI Engineering</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">13-24</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">AI-Powered Business Solution</td></tr><tr style="background: #ffffff;"><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #fbbf24;">Q3</strong></td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">Entrepreneurship & Innovation</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">25-36</td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">Startup Pitch Deck & Prototype</td></tr><tr style="background: #f8fafc;"><td style="padding: 12px;"><strong style="color: #fbbf24;">Q4</strong></td><td style="padding: 12px; font-size: 14px; color: #1e293b;">Leadership & Impact</td><td style="padding: 12px; font-size: 14px; color: #64748b;">37-48</td><td style="padding: 12px; font-size: 14px; color: #1e293b;">Community AI Impact Initiative</td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px; padding: 20px; margin-bottom: 20px;"><tr><td><h3 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">How the Program Works</h3><p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #1e293b;"><strong>Professional Immersion:</strong>Work on real business problems using industry-standard AI tools and methodologies.</p><p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #1e293b;"><strong>Entrepreneurial Projects:</strong>Develop actual products and services, learning business fundamentals through hands-on experience.</p><p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #1e293b;"><strong>College Portfolio:</strong>Create impressive projects that demonstrate leadership, technical skills, and business acumen for university applications.</p><p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;"><strong>Executive Mentorship:</strong>Work with experienced entrepreneurs and business leaders through coaching sessions.</p></td></tr></table><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-radius: 8px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Program Details</h4><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="40%" style="padding: 6px 0; font-size: 14px;"><strong>Duration:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">48 weeks (12 weeks per quarter)</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Session Length:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">120 minutes per week</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Cohort Size:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Maximum 12 students</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Location:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Raanana, Israel</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Schedule:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Sundays 19:00-21:00</td></tr></table></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #fbbf24;"><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 12px; margin-bottom: 20px;"><tr><td><h2 class="mobile-heading-medium" style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: white; font-family: 'Nunito', -apple-system, sans-serif;">Quarter 1: AI Industry & Market Analysis</h2><p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.95);">Weeks 1-12 • Understanding the AI Landscape</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: #fef3c7; border-left: 4px solid #fbbf24; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Learning Objectives</h4><ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;"><li>Analyze AI industry trends and market opportunities</li><li>Understand competitive landscape and business models</li><li>Evaluate emerging technologies and applications</li><li>Develop investment thesis and strategic insights</li><li>Present professional market analysis</li></ul></td></tr></table><h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Week-by-Week Highlights</h4><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 1: AI Industry Pioneer</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Deep dive into AI market analysis, emerging opportunities, and competitive landscape assessment</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create comprehensive AI industry report and investment thesis presentation</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 2: Professional AI Engineer</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Advanced prompt engineering, API integration, and workflow automation for professional environments</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Build and deploy custom AI solution for real client or school challenge</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 3: Business Automation Expert</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Enterprise AI applications, process optimization, cost-benefit analysis, and ROI calculation</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Design automation system for local business with measurable impact</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 5: Competitive Analysis Strategist</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Analyze competitors, identify market gaps, and develop strategic positioning</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create competitive landscape map and opportunity analysis</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 7: Technology Assessment Expert</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Evaluate emerging AI technologies and predict future trends</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Produce technology forecast and recommendation report</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 9: Business Model Innovation</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Design revenue models and pricing strategies for AI products</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Develop business model canvas for AI application</p></td></tr></table><p style="margin: 0 0 20px 0; text-align: center; font-size: 14px; font-style: italic; color: #64748b;">...and 6 more professional sessions building to the capstone project!</p><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #065f46; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(16, 185, 129, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #065f46; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 12 Capstone: AI Industry Intelligence Report</h4><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Comprehensive market analysis report with investment thesis, competitive landscape, technology assessment, and strategic recommendations. Professional presentation to business mentors.</p><p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">This project uses skills from:</p><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Week 1: Industry analysis methods</li><li>Week 2: Technical assessment</li><li>Week 3: Business automation insights</li><li>Week 5: Competitive intelligence</li><li>Week 7: Technology forecasting</li><li>Week 9: Business model design</li></ul><p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Deliverables:</p><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">50-page research report, executive summary, pitch deck, professional presentation to business panel</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #f59e0b;"><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; margin-bottom: 20px;"><tr><td><h2 class="mobile-heading-medium" style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: white; font-family: 'Nunito', -apple-system, sans-serif;">Quarter 2: Professional AI Engineering</h2><p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.95);">Weeks 13-24 • Building Real Solutions</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Learning Objectives</h4><ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;"><li>Master advanced AI integration and API usage</li><li>Build production-ready applications</li><li>Implement quality assurance and testing</li><li>Understand deployment and scaling</li><li>Deliver professional client solutions</li></ul></td></tr></table><h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Week-by-Week Highlights</h4><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 13: Advanced Prompt Engineering</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Master complex prompting strategies for professional-grade results</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Build specialized AI agents for different business functions</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 15: API Integration Mastery</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Connect AI services with business systems and databases</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create automated workflow connecting multiple platforms</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 17: Application Architecture</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Design scalable systems and user interfaces</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Architect complete AI-powered application</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 19: Quality Assurance & Testing</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Implement testing frameworks and ensure reliability</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Build comprehensive testing suite</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 21: Deployment & Operations</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Launch applications and manage production systems</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Deploy live application with monitoring</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 23: Client Delivery Excellence</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Professional project management and stakeholder communication</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Complete client project with documentation</p></td></tr></table><p style="margin: 0 0 20px 0; text-align: center; font-size: 14px; font-style: italic; color: #64748b;">...and 6 more technical sessions building to the capstone project!</p><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #065f46; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(16, 185, 129, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #065f46; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 24 Capstone: AI-Powered Business Solution</h4><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Complete professional application solving real business problem. Includes requirements analysis, system design, implementation, testing, deployment, and client presentation.</p><p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">This project uses skills from:</p><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Week 13: Advanced prompting</li><li>Week 15: API integration</li><li>Week 17: System architecture</li><li>Week 19: Quality testing</li><li>Week 21: Deployment</li><li>Week 23: Client management</li></ul><p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Deliverables:</p><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Working application, technical documentation, user guide, client presentation, ROI analysis</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #d97706;"><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #d97706, #b45309); border-radius: 12px; margin-bottom: 20px;"><tr><td><h2 class="mobile-heading-medium" style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: white; font-family: 'Nunito', -apple-system, sans-serif;">Quarter 3: Entrepreneurship & Innovation</h2><p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.95);">Weeks 25-36 • Building Your Startup</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: #fef3c7; border-left: 4px solid #d97706; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Learning Objectives</h4><ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;"><li>Identify market opportunities and validate ideas</li><li>Develop minimum viable products (MVPs)</li><li>Master startup fundraising and pitch techniques</li><li>Build go-to-market strategies</li><li>Launch and iterate on products</li></ul></td></tr></table><h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Week-by-Week Highlights</h4><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 25: Opportunity Discovery</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Identify problems worth solving and validate market demand</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Conduct market research and customer interviews</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 27: MVP Development</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Build minimum viable product to test core hypothesis</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create functional prototype with AI</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 29: Pitch Deck Mastery</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Craft compelling investor and customer presentations</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Design professional pitch deck</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 31: Go-to-Market Strategy</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Plan customer acquisition and distribution channels</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Develop complete GTM plan</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 33: Product Launch</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Execute launch strategy and acquire first customers</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Launch MVP to target audience</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #f59e0b; font-family: 'Nunito', -apple-system, sans-serif;">Week 35: Iteration & Growth</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Analyze metrics, gather feedback, and improve product</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Implement Version 2 based on user data</p></td></tr></table><p style="margin: 0 0 20px 0; text-align: center; font-size: 14px; font-style: italic; color: #64748b;">...and 6 more entrepreneurial sessions building to the capstone project!</p><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #065f46; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(16, 185, 129, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #065f46; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 36 Capstone: Startup Pitch Deck & Prototype</h4><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Complete startup package including working prototype, pitch deck, market analysis, financial projections, and investor presentation. Present to venture capital panel.</p><p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">This project uses skills from:</p><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Week 25: Market validation</li><li>Week 27: MVP development</li><li>Week 29: Pitch creation</li><li>Week 31: GTM strategy</li><li>Week 33: Launch execution</li><li>Week 35: Growth metrics</li></ul><p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Deliverables:</p><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Working prototype, investor pitch deck, financial model, demo video, VC presentation</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #10b981;"><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; margin-bottom: 20px;"><tr><td><h2 class="mobile-heading-medium" style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: white; font-family: 'Nunito', -apple-system, sans-serif;">Quarter 4: Leadership & Impact</h2><p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.95);">Weeks 37-48 • Creating Positive Change</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Learning Objectives</h4><ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;"><li>Design social impact initiatives using AI</li><li>Lead teams and mentor younger students</li><li>Develop thought leadership and public speaking</li><li>Build sustainable organizations</li><li>Create lasting positive change</li></ul></td></tr></table><h4 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Week-by-Week Highlights</h4><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #10b981; font-family: 'Nunito', -apple-system, sans-serif;">Week 37: Social Impact Design</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Identify community problems and design AI-powered solutions</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Develop social impact project proposal</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #10b981; font-family: 'Nunito', -apple-system, sans-serif;">Week 39: Team Leadership</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Build and manage teams for impact initiatives</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Recruit and lead project team</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #10b981; font-family: 'Nunito', -apple-system, sans-serif;">Week 41: Mentorship Program</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Teach AI skills to younger students</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Design and deliver mentorship curriculum</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #10b981; font-family: 'Nunito', -apple-system, sans-serif;">Week 43: Thought Leadership</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Develop unique perspective and share insights publicly</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create content series and conference talk</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #10b981; font-family: 'Nunito', -apple-system, sans-serif;">Week 45: Sustainable Organizations</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Build systems that continue without constant leadership</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Design organizational structure and processes</p></td></tr></table><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px;"><tr><td><h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #10b981; font-family: 'Nunito', -apple-system, sans-serif;">Week 47: Legacy Planning</h5><p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">Ensure impact continues beyond your direct involvement</p><p style="margin: 0; font-size: 12px; color: #1e293b;"><strong>Activity:</strong>Create succession plan and documentation</p></td></tr></table><p style="margin: 0 0 20px 0; text-align: center; font-size: 14px; font-style: italic; color: #64748b;">...and 6 more leadership sessions building to the final capstone project!</p><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #065f46; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(16, 185, 129, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #065f46; font-weight: bold; margin-right: 8px; vertical-align: middle;">★</span>Week 48 Capstone: Community AI Impact Initiative</h4><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Launch and lead community AI initiative addressing local challenge. Includes team building, implementation, measurement, and presentation to community leaders.</p><p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">This project uses skills from:</p><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>All Q1 industry knowledge</li><li>All Q2 technical expertise</li><li>All Q3 entrepreneurial skills</li><li>All Q4 leadership development</li><li>Complete AI mastery</li><li>Social impact design</li></ul><p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Deliverables:</p><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Launched initiative, measurable impact metrics, team documentation, community presentation, sustainability plan</p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%); border-top: 4px solid #fbbf24;"><h2 class="mobile-heading-large" style="margin: 0 0 24px 0; font-size: 26px; font-weight: 700; color: #0f172a; text-align: center; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: bold; margin-right: 10px; vertical-align: middle; font-size: 20px;">◷</span>Every 120-Minute Session Includes</h2><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 8px; margin-bottom: 12px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #d97706; font-family: 'Nunito', -apple-system, sans-serif;">1. Industry Updates & Discussion (10-15 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">Latest AI news, startup successes, and strategic insights</p></td></tr></table><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-left: 4px solid #fbbf24; border-radius: 6px; margin-bottom: 12px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #d97706; font-family: 'Nunito', -apple-system, sans-serif;">2. Advanced Concept Deep Dive (30-35 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">Professional-level techniques, industry case studies, expert methodologies</p></td></tr></table><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-left: 4px solid #f59e0b; border-radius: 6px; margin-bottom: 12px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #d97706; font-family: 'Nunito', -apple-system, sans-serif;">3. Hands-On Implementation (35-40 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">Build professional solutions, work on real projects, expert guidance</p></td></tr></table><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-left: 4px solid #fbbf24; border-radius: 6px; margin-bottom: 12px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #d97706; font-family: 'Nunito', -apple-system, sans-serif;">4. Peer Collaboration & Feedback (20-25 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">Team projects, code review, strategy sessions, mentoring</p></td></tr></table><table role="presentation" cellpadding="14" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-left: 4px solid #f59e0b; border-radius: 6px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #d97706; font-family: 'Nunito', -apple-system, sans-serif;">5. Strategic Planning & Next Steps (10-15 min)</h4><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">Project roadmap, milestone planning, integration strategies</p></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px; padding: 20px; margin-bottom: 20px;"><tr><td><h3 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">What Makes Our Sessions Effective</h3><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span><strong>Industry-Level Work:</strong>Real projects with measurable business impact</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span><strong>Executive Mentorship:</strong>Access to successful entrepreneurs and business leaders</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span><strong>Professional Network:</strong>Connect with other ambitious high school leaders</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span><strong>College Portfolio:</strong>Build impressive projects for university applications</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span><strong>Startup Support:</strong>Resources and guidance for launching ventures</td></tr><tr><td style="padding: 6px 0; font-size: 13px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span><strong>Career Preparation:</strong>Direct path to industry opportunities and internships</td></tr></table></td></tr></table><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); border: 2px solid #10b981; border-radius: 12px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #065f46; font-family: 'Nunito', -apple-system, sans-serif;">Parent & Student Partnership</h4><p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #1e293b;">We work closely with families to support student success and career development:</p><ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Monthly executive coaching sessions for college planning</li><li>Quarterly business plan reviews with entrepreneurs</li><li>Direct connections to industry internship opportunities</li><li>University application support and portfolio development</li><li>Professional network introductions</li></ul></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; border-top: 4px solid #10b981;"><h2 class="mobile-heading-large" style="margin: 0 0 24px 0; font-size: 26px; font-weight: 700; color: #0f172a; text-align: center; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: bold; margin-right: 10px; vertical-align: middle; font-size: 20px;">★</span>What Your Student Will Achieve</h2><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;"><tr><td width="50%" valign="top" style="padding-right: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">Industry Expertise</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Deep understanding of AI industry, market dynamics, and business opportunities</p></td><td width="50%" valign="top" style="padding-left: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">Technical Mastery</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Professional-grade AI engineering skills, production deployment experience</p></td></tr><tr><td width="50%" valign="top" style="padding-right: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">Entrepreneurial Success</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Launched ventures, fundraising experience, real customer acquisition</p></td><td width="50%" valign="top" style="padding-left: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">Leadership Impact</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Community initiatives led, teams managed, younger students mentored</p></td></tr><tr><td width="50%" valign="top" style="padding-right: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">Professional Portfolio</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Impressive projects demonstrating technical and business skills</p></td><td width="50%" valign="top" style="padding-left: 12px; padding-bottom: 16px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">College Advantage</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Competitive applications to top university programs in CS and business</p></td></tr><tr><td width="50%" valign="top" style="padding-right: 12px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">Industry Network</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Connections with entrepreneurs, investors, and business leaders</p></td><td width="50%" valign="top" style="padding-left: 12px;"><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">Career Readiness</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">Direct paths to internships, startup roles, and business opportunities</p></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px; padding: 20px;"><tr><td><h3 class="mobile-heading-small" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Real-World Impact</h3><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Future Leaders graduates achieve measurable success:</p><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #d97706; font-family: 'Nunito', -apple-system, sans-serif;">Professional Achievements:</h4><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Launched working products with real users and revenue</li><li>Secured internships at leading tech companies</li><li>Published thought leadership content and conference talks</li><li>Led community initiatives with measurable impact</li></ul><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #d97706; font-family: 'Nunito', -apple-system, sans-serif;">College Success:</h4><ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Admitted to competitive CS and business programs</li><li>Scholarship opportunities based on portfolio work</li><li>Advanced placement in university AI courses</li><li>Strong applications demonstrating initiative and impact</li></ul><h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #d97706; font-family: 'Nunito', -apple-system, sans-serif;">Entrepreneurial Outcomes:</h4><ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;"><li>Ongoing ventures generating revenue</li><li>Pitch competition wins and recognition</li><li>Investor connections and funding opportunities</li><li>Professional network for future ventures</li></ul></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 40px 30px; background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%); border-top: 4px solid #fbbf24;"><table role="presentation" cellpadding="20" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px; margin-bottom: 20px;"><tr><td style="text-align: center;"><h2 class="mobile-heading-medium" style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #fbbf24; font-family: 'Nunito', -apple-system, sans-serif;">Ready to Join Future Leaders?</h2><p style="margin: 0; font-size: 15px; line-height: 1.6; color: #475569;">Limited cohort of 12 students. Apply now for the most intensive AI leadership program.</p></td></tr></table><h3 class="mobile-heading-medium" style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Investment Options</h3><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;"><tr><td width="240" valign="top" class="pricing-card" style="padding-right: 12px;"><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px;"><tr><td style="text-align: center;"><h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #64748b; font-family: 'Nunito', -apple-system, sans-serif;">Monthly</h4><div style="font-size: 28px; font-weight: 800; color: #fbbf24; margin: 8px 0;">₪849</div><p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">per month</p><ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.8; color: #475569; text-align: left;"><li>4 sessions per month</li><li>All professional tools</li><li>Industry mentorship</li><li>Project resources</li></ul></td></tr></table></td><td width="280" valign="top" class="pricing-card" style="padding: 0 6px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 2px solid #fbbf24; border-radius: 8px;"><tr><td style="background: #fbbf24; color: white; text-align: center; padding: 6px; border-radius: 6px 6px 0 0; font-size: 12px; font-weight: 700;">EXECUTIVE PROGRAM</td></tr><tr><td style="padding: 12px; text-align: center;"><h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #64748b; font-family: 'Nunito', -apple-system, sans-serif;">Quarterly</h4><div style="font-size: 28px; font-weight: 800; color: #fbbf24; margin: 8px 0;">₪2,187</div><p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">per quarter (₪729/mo)</p><ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.8; color: #475569; text-align: left;"><li>12 intensive sessions</li><li>All professional tools</li><li>3 x executive coaching</li><li>Priority industry access</li></ul></td></tr></table></td><td width="240" valign="top" class="pricing-card" style="padding-left: 12px;"><table role="presentation" cellpadding="12" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px;"><tr><td style="text-align: center;"><h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #64748b; font-family: 'Nunito', -apple-system, sans-serif;">Annual</h4><div style="font-size: 28px; font-weight: 800; color: #fbbf24; margin: 8px 0;">₪7,788</div><p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">per year (₪649/mo)</p><ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.8; color: #475569; text-align: left;"><li>48 sessions (full year)</li><li>All professional tools</li><li>6 x executive coaching</li><li>Internship placement</li></ul></td></tr></table></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px; padding: 20px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Family Discounts</h4><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span><strong>Second student:</strong>10% off</td></tr><tr><td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><span style="color: #fbbf24; font-weight: bold; margin-right: 8px;">✓</span><strong>Third student and beyond:</strong>15% off each</td></tr></table><p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">Discounts apply to the lower-priced program(s) when enrolling multiple students</p></td></tr></table><table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px;"><tr><td><h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">Program Details</h4><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="35%" style="padding: 6px 0; font-size: 14px;"><strong>Schedule:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Sundays 19:00-21:00</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Location:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Raanana, Israel</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Cohort Size:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">Maximum 12 students</td></tr><tr><td style="padding: 6px 0; font-size: 14px;"><strong>Age Range:</strong></td><td style="padding: 6px 0; font-size: 14px; color: #64748b;">14-18 years old</td></tr></table></td></tr></table><table role="presentation" cellpadding="20" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); border: 2px solid #10b981; border-radius: 12px; text-align: center;"><tr><td><h3 class="mobile-heading-medium" style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #065f46; font-family: 'Nunito', -apple-system, sans-serif;"><span style="display: inline-block; width: 28px; height: 28px; background: rgba(16, 185, 129, 0.3); border-radius: 50%; text-align: center; line-height: 28px; color: #065f46; font-weight: bold; margin-right: 8px; vertical-align: middle;">?</span>Ready to Apply?</h3><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">Contact us to discuss your goals and program fit:</p><p style="margin: 0 0 8px 0;"><a href="https://wa.me/972543159025?text=Hi!%20I'm%20interested%20in%20the%20Future%20Leaders%20program" style="color: #10b981; text-decoration: none; font-weight: 600; font-size: 16px;">WhatsApp: +972-54-315-9025</a></p><p style="margin: 0 0 8px 0;"><a href="mailto:raphael@aikidz.club" style="color: #0891b2; text-decoration: none; font-weight: 600; font-size: 16px;">raphael@aikidz.club</a></p><p style="margin: 0;"><a href="https://www.aikidz.club" style="color: #0891b2; text-decoration: none; font-weight: 600; font-size: 16px;">www.aikidz.club</a></p></td></tr></table></td></tr><tr><td class="mobile-padding" style="padding: 30px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0;"><p style="margin: 0; font-size: 12px; color: #64748b;">AI Kidz Club • www.aikidz.club • raphael@aikidz.club • +972-54-315-9025</p></td></tr></table></td></tr></table></body></html>`;
}
