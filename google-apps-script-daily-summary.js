// ========================================
// AI KIDZ CLUB - DAILY SUMMARY REPORT
// ========================================
// Sends a daily summary email of registrations and curriculum downloads
// from the last 24 hours to both admin email addresses
//
// SETUP INSTRUCTIONS:
// 1. Copy this entire script into a NEW Google Apps Script project
// 2. Go to https://script.google.com
// 3. Click "New Project"
// 4. Paste this code
// 5. Save the project as "AI Club Daily Summary"
// 6. Set up a time-driven trigger:
//    - Click the clock icon ⏰ (Triggers) on the left
//    - Click "+ Add Trigger" (bottom right)
//    - Choose which function to run: sendDailySummary
//    - Select event source: Time-driven
//    - Select type of time based trigger: Day timer
//    - Select time of day: 6am to 7am (or your preferred time)
//    - Click Save
//
// This script will now run automatically every day and send a summary
// to raphaelberrebi@gmail.com and raphael@aikidz.club

function sendDailySummary() {
  try {
    // Your AI Club Database spreadsheet ID
    const spreadsheetId = '1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M';
    const ss = SpreadsheetApp.openById(spreadsheetId);

    // Get data from last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    Logger.log('Generating daily summary for: ' + yesterday.toLocaleDateString('en-IL') + ' to ' + now.toLocaleDateString('en-IL'));

    // ========================================
    // COUNT REGISTRATIONS
    // ========================================
    const registrationsSheet = ss.getSheetByName('Registrations');
    if (!registrationsSheet) {
      throw new Error('Registrations sheet not found');
    }

    const regData = registrationsSheet.getDataRange().getValues();
    const newRegistrations = regData.filter(row => {
      const timestamp = new Date(row[0]);
      return timestamp > yesterday && timestamp <= now;
    });

    // ========================================
    // COUNT CURRICULUM DOWNLOADS
    // ========================================
    const downloadsSheet = ss.getSheetByName('Curriculum Downloads');
    if (!downloadsSheet) {
      throw new Error('Curriculum Downloads sheet not found');
    }

    const dlData = downloadsSheet.getDataRange().getValues();
    const newDownloads = dlData.filter(row => {
      const timestamp = new Date(row[0]);
      return timestamp > yesterday && timestamp <= now;
    });

    // ========================================
    // CALCULATE REVENUE
    // ========================================
    // Column 10 (index 10) typically has totalPrice
    const totalRevenue = newRegistrations.reduce((sum, row) => {
      const price = parseFloat(row[10]) || 0;
      return sum + price;
    }, 0);

    // ========================================
    // COUNT BY PROGRAM (Registrations)
    // ========================================
    // Column 5 (index 5) typically has children info with program names
    const regByProgram = {
      young: 0,
      tech: 0,
      future: 0
    };

    newRegistrations.forEach(row => {
      const childrenInfo = row[5] ? row[5].toString() : '';
      if (childrenInfo.toLowerCase().includes('young') || childrenInfo.toLowerCase().includes('8-10')) {
        regByProgram.young++;
      }
      if (childrenInfo.toLowerCase().includes('tech') || childrenInfo.toLowerCase().includes('11-13')) {
        regByProgram.tech++;
      }
      if (childrenInfo.toLowerCase().includes('future') || childrenInfo.toLowerCase().includes('14-18')) {
        regByProgram.future++;
      }
    });

    // ========================================
    // COUNT BY PROGRAM (Downloads)
    // ========================================
    // Column 3 (index 3) has program type (young/tech/future)
    const dlByProgram = {
      young: newDownloads.filter(r => r[3] === 'young').length,
      tech: newDownloads.filter(r => r[3] === 'tech').length,
      future: newDownloads.filter(r => r[3] === 'future').length
    };

    // ========================================
    // SEND EMAIL TO BOTH ADDRESSES
    // ========================================
    const subject = `📊 AI Club Daily Summary - ${now.toLocaleDateString('en-IL', { timeZone: 'Asia/Jerusalem' })}`;

    MailApp.sendEmail({
      to: 'raphaelberrebi@gmail.com, raphael@aikidz.club',
      subject: subject,
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 12px; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0891b2; margin: 0 0 10px 0; font-size: 28px;">📊 Daily Activity Report</h1>
              <p style="color: #666; margin: 0; font-size: 14px;">
                ${yesterday.toLocaleDateString('en-IL', { timeZone: 'Asia/Jerusalem' })} - ${now.toLocaleDateString('en-IL', { timeZone: 'Asia/Jerusalem' })}
              </p>
            </div>

            <!-- Key Metrics -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">

              <!-- Registrations Card -->
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">✅ Registrations</div>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${newRegistrations.length}</div>
                <div style="font-size: 20px; font-weight: 600;">₪${totalRevenue.toFixed(0)}</div>
                <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">Total Revenue</div>
              </div>

              <!-- Downloads Card -->
              <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(8, 145, 178, 0.3);">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">📄 Downloads</div>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${newDownloads.length}</div>
                <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Curriculum Requests</div>
              </div>

            </div>

            <!-- Detailed Breakdown -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">

              <h3 style="color: #0891b2; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                📈 Registrations by Program
              </h3>
              <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                  <span style="color: #334155;"><strong>Young Innovators</strong> (8-10)</span>
                  <span style="color: #0891b2; font-weight: bold;">${regByProgram.young}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                  <span style="color: #334155;"><strong>Tech Explorers</strong> (11-13)</span>
                  <span style="color: #0891b2; font-weight: bold;">${regByProgram.tech}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                  <span style="color: #334155;"><strong>Future Leaders</strong> (14-18)</span>
                  <span style="color: #0891b2; font-weight: bold;">${regByProgram.future}</span>
                </div>
              </div>

            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">

              <h3 style="color: #0891b2; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                📄 Downloads by Program
              </h3>
              <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                  <span style="color: #334155;"><strong>Young Innovators</strong></span>
                  <span style="color: #0891b2; font-weight: bold;">${dlByProgram.young}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                  <span style="color: #334155;"><strong>Tech Explorers</strong></span>
                  <span style="color: #0891b2; font-weight: bold;">${dlByProgram.tech}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                  <span style="color: #334155;"><strong>Future Leaders</strong></span>
                  <span style="color: #0891b2; font-weight: bold;">${dlByProgram.future}</span>
                </div>
              </div>

            </div>

            <!-- Footer -->
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;">
            <div style="text-align: center;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
                This is your automated daily summary from AI Kidz Club
              </p>
              <a href="https://docs.google.com/spreadsheets/d/${spreadsheetId}"
                 style="display: inline-block; background: #0891b2; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                📊 View Full Spreadsheet
              </a>
            </div>

          </div>
        </div>
      `
    });

    Logger.log('✅ Daily summary sent successfully');
    Logger.log('Summary: ' + newRegistrations.length + ' registrations, ' + newDownloads.length + ' downloads, ₪' + totalRevenue.toFixed(0) + ' revenue');

  } catch (error) {
    Logger.log('❌ Failed to send daily summary: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);

    // Send error notification to both addresses
    try {
      MailApp.sendEmail({
        to: 'raphaelberrebi@gmail.com, raphael@aikidz.club',
        subject: '⚠️ AI Club Daily Summary Failed',
        body: 'The daily summary script failed to run.\n\n' +
              'Error: ' + error.toString() + '\n\n' +
              'Stack trace:\n' + error.stack + '\n\n' +
              'Please check the script at: https://script.google.com\n\n' +
              'Spreadsheet: https://docs.google.com/spreadsheets/d/1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M'
      });
      Logger.log('Error notification sent to admins');
    } catch (emailError) {
      Logger.log('Failed to send error notification: ' + emailError.toString());
    }
  }
}

// ========================================
// TEST FUNCTION
// ========================================
// Run this function manually to test the email format
function testDailySummary() {
  Logger.log('🧪 Running test daily summary...');
  sendDailySummary();
  Logger.log('✅ Test complete - check your email!');
}
