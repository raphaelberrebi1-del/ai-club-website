// ========================================
// AI KIDZ CLUB - CURRICULUM DOWNLOAD HANDLER
// ========================================
// This script handles curriculum download requests and sends emails
// Use the same spreadsheet as registration: 1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M
// Deploy as: Web App (Anyone can access)

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

    // Get PDF URL based on program
    const pdfUrls = {
      'young': 'https://drive.google.com/file/d/YOUR_YOUNG_PDF_ID/view?usp=sharing',
      'tech': 'https://drive.google.com/file/d/YOUR_TECH_PDF_ID/view?usp=sharing',
      'future': 'https://drive.google.com/file/d/YOUR_FUTURE_PDF_ID/view?usp=sharing'
    };

    const pdfUrl = pdfUrls[data.program];

    if (!pdfUrl) {
      throw new Error('Invalid program type: ' + data.program);
    }

    // Send email with PDF
    console.log('📧 Sending curriculum email...');
    sendCurriculumEmail(data.email, data.name, data.program, pdfUrl);
    console.log('✅ Email sent successfully');

    console.log('✅ Curriculum download processed successfully');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        pdfUrl: pdfUrl,
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

function sendCurriculumEmail(email, name, program, pdfUrl) {
  console.log('📧 Sending curriculum email to:', email);
  console.log('📧 Program:', program);
  console.log('📧 PDF URL:', pdfUrl);

  const programNames = {
    'young': 'AI Explorers (Ages 8-10)',
    'tech': 'AI Mastery (Ages 11-13)',
    'future': 'AI Leadership Academy (Ages 14-18)'
  };

  const programName = programNames[program] || 'AI Club';

  const subject = '🤖 Your Complete 48-Week AI Club Curriculum';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your AI Kidz Club Curriculum</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #0f172a;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <!-- Main Container -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: linear-gradient(to bottom right, #1e293b, #0f172a); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    🤖 AI Kidz Club
                  </h1>
                  <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                    Your Complete Curriculum is Ready!
                  </p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 40px 30px 20px 30px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #06b6d4;">
                    Hi ${name}! 👋
                  </h2>
                  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                    Thank you for your interest in AI Kidz Club! Here's the complete 48-week curriculum for the <strong style="color: #06b6d4;">${programName}</strong> program.
                  </p>
                </td>
              </tr>

              <!-- Download Button -->
              <tr>
                <td style="padding: 0 30px 30px 30px; text-align: center;">
                  <a href="${pdfUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 20px 40px; border-radius: 12px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);">
                    📥 Download Your Curriculum PDF
                  </a>
                  <p style="margin: 16px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.5);">
                    Or copy this link:<br>
                    <a href="${pdfUrl}" style="color: #06b6d4; word-break: break-all;">${pdfUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- What's Inside -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: rgba(6, 182, 212, 0.1); border: 2px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #06b6d4;">
                      📚 What's Inside:
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: rgba(255,255,255,0.8); line-height: 1.8; font-size: 15px;">
                      <li>Complete year-long learning journey (48 weeks)</li>
                      <li>All 4 quarterly breakdowns with detailed activities</li>
                      <li>Major capstone projects for each quarter</li>
                      <li>Skills progression roadmap</li>
                      <li>Week-by-week curriculum outline</li>
                    </ul>
                  </div>
                </td>
              </tr>

              <!-- Next Steps -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #06b6d4;">
                    🚀 Ready to Enroll?
                  </h3>
                  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                    We have limited spots available for the upcoming session. Secure your child's place today!
                  </p>
                  <a href="https://www.aikidz.club/pricing.html" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                    View Pricing & Register →
                  </a>
                </td>
              </tr>

              <!-- Questions CTA -->
              <tr>
                <td style="padding: 0 30px 40px 30px; text-align: center;">
                  <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.9);">
                      Have Questions?
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: rgba(255,255,255,0.7);">
                      We'd love to chat! Contact us anytime:
                    </p>
                    <p style="margin: 0;">
                      <a href="https://wa.me/972543159025?text=Hi!%20I%20downloaded%20the%20curriculum" style="color: #10b981; text-decoration: none; font-weight: 600; font-size: 15px;">
                        💬 WhatsApp: +972-54-315-9025
                      </a>
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: rgba(0,0,0,0.2); padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
                  <p style="margin: 0 0 12px 0; font-size: 14px; color: rgba(255,255,255,0.6);">
                    Questions? We're here to help!
                  </p>
                  <p style="margin: 0 0 8px 0;">
                    <a href="mailto:raphael@aikidz.club" style="color: #06b6d4; text-decoration: none; font-size: 14px;">
                      raphael@aikidz.club
                    </a>
                  </p>
                  <p style="margin: 0 0 16px 0;">
                    <a href="https://wa.me/972543159025" style="color: #06b6d4; text-decoration: none; font-size: 14px;">
                      +972-54-315-9025
                    </a>
                  </p>
                  <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                    © ${new Date().getFullYear()} AI Kidz Club · Raanana, Israel<br>
                    <a href="https://www.aikidz.club" style="color: rgba(6, 182, 212, 0.6); text-decoration: none;">www.aikidz.club</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const plainTextBody = `Hi ${name},

Thank you for downloading the AI Kidz Club curriculum!

Your Complete 48-Week Curriculum for ${programName}

Download here: ${pdfUrl}

What's Inside:
• Complete year-long learning journey (48 weeks)
• All 4 quarterly breakdowns with detailed activities
• Major capstone projects for each quarter
• Skills progression roadmap
• Week-by-week curriculum outline

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
      'https://drive.google.com/file/d/YOUR_PDF_ID/view'
    );

    console.log('✅ Test email sent successfully');
    return 'Success! Check raphael.berrebi.1@gmail.com';
  } catch (error) {
    console.error('❌ Test failed:', error.toString());
    return 'Failed: ' + error.toString();
  }
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
