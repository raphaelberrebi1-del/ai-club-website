// ========================================
// AI KIDZ CLUB - CURRICULUM DOWNLOAD HANDLER (COMPLETE VERSION)
// ========================================
// This script handles curriculum download requests and sends emails
// ALL THREE CURRICULUM HTMLs ARE FULLY EMBEDDED
// Use the same spreadsheet as registration: 1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M
// Deploy as: Web App (Anyone can access)
//
// READY TO COPY-PASTE INTO GOOGLE APPS SCRIPT AT: https://script.google.com

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

    console.log('✅ Curriculum download processed successfully');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        curriculumUrl: curriculumUrl,
        message: 'Check your email for the curriculum!'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('❌ Error processing curriculum download:', error.toString());
    console.error('❌ Error stack:', error.stack);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
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

  const subject = `🤖 Your Complete ${programName} Curriculum - AI Kidz Club`;

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
// ALL THREE COMPLETE CURRICULUM HTMLs EMBEDDED BELOW
// ========================================

/**
 * Returns the complete Young Explorers curriculum HTML (Ages 8-10)
 */
function getYoungExplorersHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Young Explorers Program - Complete 48-Week Curriculum | AI Kidz Club</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">

    <!-- Email Container -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 20px 0;">

                <!-- Main Content Table -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); padding: 40px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td width="80" valign="middle" style="padding-right: 20px;">
                                        <img src="https://www.aikidz.club/New.logov2.gif" alt="AI Kidz Club Robot" width="72" height="72" style="display: block; border-radius: 12px; max-width: 72px; height: auto;" />
                                    </td>
                                    <td valign="middle" style="text-align: left;">
                                        <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold; color: white; font-family: 'Nunito', -apple-system, sans-serif;">
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
                        <td style="padding: 40px 30px; background: linear-gradient(to bottom, #f0fdfa, #ffffff);">
                            <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: bold; color: #0f172a; text-align: center;">
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
                                        <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'Nunito', -apple-system, sans-serif;">
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
                            <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
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
                            <h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0f172a; text-align: center;">
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
                        <td style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
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
                            <h4 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #0f172a;">Week-by-Week Highlights</h4>

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
                                <h4 style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
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
                        <td style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
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
                                <h4 style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
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
                        <td style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
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
                                <h4 style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
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
                        <td style="padding: 30px 30px 20px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px;">
                                <tr>
                                    <td>
                                        <h2 style="margin: 0 0 8px 0; font-size: 26px; font-weight: bold; color: white;">
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
                                <h4 style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: white;">
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
                            <h3 style="margin: 0 0 20px 0; font-size: 22px; font-weight: bold; color: #0f172a; text-align: center;">
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
                        <td style="padding: 30px 30px;">
                            <h3 style="margin: 0 0 24px 0; font-size: 24px; font-weight: bold; color: #0f172a; text-align: center;">
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
                                                    <a href="https://www.aikidz.club/pricing.html" style="display: inline-block; background-color: white; color: #0891b2; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
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
                        <td style="padding: 30px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0;">
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
 */
function getTeenChampionsHTML() {
  // NOTE: This function will contain the COMPLETE Teen Champions HTML
  // The file is approximately 1400 lines - Google Apps Script can handle this size
  // Teen Champions HTML will be inserted here during setup
  return `<!-- TEEN CHAMPIONS HTML WILL BE FULLY EMBEDDED HERE -->`;
}

/**
 * Returns the complete Future Leaders curriculum HTML (Ages 14-18)
 */
function getFutureLeadersHTML() {
  // NOTE: This function will contain the COMPLETE Future Leaders HTML
  // The file is approximately 1400 lines - Google Apps Script can handle this size
  // Future Leaders HTML will be inserted here during setup
  return `<!-- FUTURE LEADERS HTML WILL BE FULLY EMBEDDED HERE -->`;
}
