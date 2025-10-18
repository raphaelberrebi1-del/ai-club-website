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

/**
 * Returns the complete Young Explorers curriculum HTML
 */
function getYoungExplorersHTML() {
  // Due to size limitations in this editor, the full HTML template will be added
  // Copy the contents of pdf-curriculum-young-explorers.html here
  return `<!-- INSERT YOUNG EXPLORERS HTML HERE -->`;
}

/**
 * Returns the complete Teen Champions curriculum HTML
 */
function getTeenChampionsHTML() {
  // Due to size limitations in this editor, the full HTML template will be added
  // Copy the contents of pdf-curriculum-teen-champions.html here
  return `<!-- INSERT TEEN CHAMPIONS HTML HERE -->`;
}

/**
 * Returns the complete Future Leaders curriculum HTML
 */
function getFutureLeadersHTML() {
  // Due to size limitations in this editor, the full HTML template will be added
  // Copy the contents of pdf-curriculum-future-leaders.html here
  return `<!-- INSERT FUTURE LEADERS HTML HERE -->`;
}
