// ========================================
// AI KIDZ CLUB - UNIFIED GOOGLE APPS SCRIPT
// ========================================
// Handles BOTH:
// 1. Registration requests (English & Hebrew)
// 2. Curriculum downloads (English & Hebrew)
//
// Spreadsheet ID: 1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M
// Deploy as: Web App (Anyone can access)
// ========================================

// ========================================
// MAIN ENTRY POINT - ROUTING LOGIC
// ========================================

function doPost(e) {
  try {
    console.log('🚀 doPost called with:', e.postData);

    // Parse incoming data
    let data;
    if (e.parameter && e.parameter.data) {
      console.log('📦 Using parameter data (FormData method)');
      data = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      console.log('📦 Using postData contents (JSON method)');
      data = JSON.parse(e.postData.contents);
    } else {
      console.error('❌ No data found in request');
      throw new Error('No data received - check request format');
    }

    console.log('📦 Parsed data:', JSON.stringify(data));

    // ========================================
    // ROUTING LOGIC: Check request type
    // ========================================

    if (data.children) {
      // This is a REGISTRATION request
      console.log('🎯 ROUTING → Registration Handler');
      return handleRegistration(e, data);

    } else if (data.program) {
      // This is a CURRICULUM DOWNLOAD request
      console.log('🎯 ROUTING → Curriculum Download Handler');
      return handleCurriculumDownload(e, data);

    } else {
      throw new Error('Unknown request type - missing both children and program fields');
    }

  } catch (error) {
    console.error('❌ doPost error:', error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// REGISTRATION HANDLER
// ========================================

function handleRegistration(e, data) {
  try {
    console.log('📝 Processing REGISTRATION request');

    // Target your specific AI Club spreadsheet
    const spreadsheetId = '1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M';
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('📊 Spreadsheet found:', sheet.getName());

    const registrations = sheet.getSheetByName('Registrations');
    const groups = sheet.getSheetByName('Groups');

    console.log('📝 Registrations sheet found:', !!registrations);
    console.log('👥 Groups sheet found:', !!groups);

    // Process each child registration and collect group assignments
    console.log('👥 Processing children:', data.children.length);
    const groupAssignments = [];

    data.children.forEach((child, index) => {
      console.log(`👶 Processing child ${index + 1}:`, child.name, 'Program:', child.program);

      try {
        const group = assignToGroup(child.program, groups);
        console.log('🏫 Assigned to group:', group ? group.groupId : 'NULL');

        if (!group) {
          throw new Error('Failed to assign child to group');
        }

        // Store group assignment for email
        groupAssignments.push({
          childName: child.name,
          program: child.program,
          groupId: group.groupId,
          day: group.day,
          time: group.time
        });

        // Add registration with enhanced payment tracking
        const rowData = [
          new Date(), // A: Date
          data.parent.name, // B: Parent Name
          data.parent.email, // C: Parent Email
          data.parent.phone, // D: Parent Phone
          child.name, // E: Child Name
          child.program, // F: Program
          child.price, // G: Price
          group.groupId, // H: Group ID
          'Confirmed', // I: Registration Status
          data.paymentStatus || 'Pending', // J: Payment Status
          data.totalPrice, // K: Total Price
          data.paymentMethod || 'Not Selected', // L: Payment Method
          data.timestamp || new Date().toISOString() // M: Timestamp
        ];

        console.log('📝 Writing row:', rowData);
        registrations.appendRow(rowData);
        console.log('✅ Row written successfully');

        // Update group capacity
        updateGroupCapacity(group.groupId, groups);

      } catch (childError) {
        console.error(`❌ Error processing child ${child.name}:`, childError.toString());
        throw childError;
      }
    });

    // Check if we need to open new groups
    checkAndOpenNewGroups(groups);

    // Send confirmation email with group details
    try {
      console.log('🔵 About to call sendConfirmation...');
      console.log('📧 Email recipient:', data.parent.email);
      console.log('👥 Group assignments count:', groupAssignments.length);

      sendConfirmation(data.parent.email, data, groupAssignments);

      console.log('✅ Confirmation email sent to:', data.parent.email);
    } catch (emailError) {
      console.error('❌ Email sending FAILED:', emailError.toString());
      // Don't fail the registration if email fails
    }

    console.log('✅ Registration completed successfully');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Registration processed'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('❌ Registration error:', error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// CURRICULUM DOWNLOAD HANDLER
// ========================================

function handleCurriculumDownload(e, data) {
  try {
    console.log('📥 Processing CURRICULUM DOWNLOAD request');
    console.log('📥 Language:', data.language || 'en (default)');
    console.log('📥 Program:', data.program);

    // Target your specific AI Club spreadsheet
    const spreadsheetId = '1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M';
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    const downloadsSheet = sheet.getSheetByName('Curriculum Downloads');

    if (!downloadsSheet) {
      throw new Error('Curriculum Downloads sheet not found. Please create it first.');
    }

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
      data.language || 'en', // F: Language
      'TRUE' // G: PDF Downloaded
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

    // ========================================
    // LANGUAGE ROUTING: Send email in correct language
    // ========================================

    console.log('📧 Sending curriculum email...');

    if (data.language === 'he') {
      // Send HEBREW curriculum email
      console.log('🇮🇱 Sending Hebrew curriculum email');
      sendCurriculumEmailHebrew(data.email, data.name, data.program, curriculumUrl);
    } else {
      // Send ENGLISH curriculum email (default)
      console.log('🇺🇸 Sending English curriculum email');
      sendCurriculumEmail(data.email, data.name, data.program, curriculumUrl);
    }

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

// ========================================
// CURRICULUM EMAIL - ENGLISH
// ========================================

function sendCurriculumEmail(email, name, program, curriculumUrl) {
  console.log('📧 Sending ENGLISH curriculum email to:', email);
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
    console.log('📤 Attempting to send English email via GmailApp...');

    GmailApp.sendEmail(email, subject, plainTextBody, {
      htmlBody: htmlBody,
      name: 'AI Kidz Club',
      replyTo: 'raphael@aikidz.club'
    });

    console.log('✅ English email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Email sending failed:', error.toString());
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

// ========================================
// CURRICULUM EMAIL - HEBREW
// ========================================

function sendCurriculumEmailHebrew(email, name, program, curriculumUrl) {
  console.log('📧 Sending HEBREW curriculum email to:', email);
  console.log('📧 Program:', program);

  const programNames = {
    'young': 'חוקרים צעירים (גילאי 8-10)',
    'tech': 'אלופי טכנולוגיה (גילאי 11-13)',
    'future': 'מנהיגי העתיד (גילאי 14-18)'
  };

  const programName = programNames[program] || 'AI Kidz Club';

  const subject = `🤖 תכנית הלימודים המלאה - ${programName} - AI Kidz Club`;

  // Get the HEBREW curriculum HTML based on program type
  console.log('📄 Generating Hebrew curriculum HTML for:', programName);
  let htmlBody;

  try {
    if (program === 'young') {
      htmlBody = getYoungExplorersHebrewHTML();
    } else if (program === 'tech') {
      htmlBody = getTeenChampionsHebrewHTML();
    } else if (program === 'future') {
      htmlBody = getFutureLeadersHebrewHTML();
    } else {
      throw new Error('Invalid program type');
    }
    console.log('✅ Hebrew curriculum HTML generated successfully, length:', htmlBody.length);
  } catch (error) {
    console.error('❌ Failed to generate Hebrew curriculum HTML:', error.toString());
    // Fallback to a simple message if generation fails
    htmlBody = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="utf-8">
        <title>תכנית לימודים - AI Kidz Club</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; direction: rtl;">
        <h1 style="color: #06b6d4;">תודה שהורדת את תכנית הלימודים של ${programName}!</h1>
        <p>שאלות? צרו קשר: <a href="mailto:raphael@aikidz.club">raphael@aikidz.club</a></p>
      </body>
      </html>
    `;
  }

  const plainTextBody = `שלום ${name},

תודה על ההתעניינות ב-AI Kidz Club!

תכנית הלימודים המלאה - 48 שבועות - ${programName}

האימייל מכיל את תכנית הלימודים המלאה עם:
• מסע למידה שנתי מלא (48 שבועות)
• 4 רבעונים מפורטים עם פעילויות
• פרויקטי גמר מרכזיים לכל רבעון
• מפת התקדמות מיומנויות
• תכנית לימודים שבוע אחר שבוע

צפייה בתכנית הלימודים: ${curriculumUrl}

מוכנים להירשם?
צפייה במחירים ורישום: https://www.aikidz.club/pricing-he.html

יש שאלות? צרו איתנו קשר:
WhatsApp: ‎054-315-9025
אימייל: raphael@aikidz.club

נשמח לראות את הילד שלכם משגשג בתוכניות ה-AI שלנו!

בברכה,
רפאל
AI Kidz Club
www.aikidz.club
`;

  try {
    console.log('📤 Attempting to send Hebrew email via GmailApp...');

    GmailApp.sendEmail(email, subject, plainTextBody, {
      htmlBody: htmlBody,
      name: 'AI Kidz Club',
      replyTo: 'raphael@aikidz.club'
    });

    console.log('✅ Hebrew email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Hebrew email sending failed:', error.toString());
    throw error;
  }
}

// ========================================
// REGISTRATION HELPER FUNCTIONS
// ========================================

function assignToGroup(ageGroup, groupsSheet) {
  console.log('🔍 assignToGroup called with ageGroup:', ageGroup);

  const groups = groupsSheet.getDataRange().getValues();
  console.log('📊 Total groups found:', groups.length - 1);

  const expectedAgeRange = getAgeRange(ageGroup);
  console.log('🎯 Looking for age range:', expectedAgeRange);

  // Find available group for this age range
  for (let i = 1; i < groups.length; i++) {
    const [groupId, day, time, ageRange, startDate, endDate, currentCount, maxCapacity, status] = groups[i];

    if (ageRange === expectedAgeRange && currentCount < maxCapacity && status === 'Open') {
      console.log('✅ Found matching group:', groupId);
      return {
        groupId: groupId,
        day: day,
        time: time,
        row: i + 1
      };
    }
  }

  console.log('❌ No available groups found, creating new one...');
  return createNewGroup(ageGroup, groupsSheet);
}

function getAgeRange(program) {
  switch(program) {
    case 'young': return '8-10';
    case 'tech': return '11-13';
    case 'future': return '14-18';
    default: return '8-10';
  }
}

function updateGroupCapacity(groupId, groupsSheet) {
  const groups = groupsSheet.getDataRange().getValues();

  for (let i = 1; i < groups.length; i++) {
    if (groups[i][0] === groupId) {
      const currentCount = groups[i][6] + 1;
      groupsSheet.getRange(i + 1, 7).setValue(currentCount);

      // Mark as filling fast if 80% full
      if (currentCount >= groups[i][7] * 0.8) {
        groupsSheet.getRange(i + 1, 9).setValue('Filling Fast');
      }

      // Mark as full if at capacity
      if (currentCount >= groups[i][7]) {
        groupsSheet.getRange(i + 1, 9).setValue('Full');
      }

      break;
    }
  }
}

function checkAndOpenNewGroups(groupsSheet) {
  const groups = groupsSheet.getDataRange().getValues();

  // Check if Sunday groups are 80% full
  const sundayGroups = groups.filter(g => g[1] === 'Sunday' && g[8] === 'Open');
  const sundayFilling = sundayGroups.filter(g => g[6] >= g[7] * 0.8).length;

  if (sundayFilling >= 2) {
    createNewDayGroups('Monday', groupsSheet);
  }
}

function createNewDayGroups(day, groupsSheet) {
  const timeSlots = {
    'Monday': ['15:00-16:15', '16:30-17:45', '18:00-19:15'],
    'Tuesday': ['15:00-16:15', '16:30-17:45', '18:00-19:15']
  };

  const ageGroups = ['8-10', '11-13', '14-18'];
  const cohortNumber = getCurrentCohortNumber();

  timeSlots[day].forEach((time, index) => {
    const dayPrefix = day.substring(0,3).toUpperCase();
    const ageCode = ageGroups[index].replace('-','');
    const groupId = dayPrefix + '-' + ageCode + '-' + cohortNumber;

    groupsSheet.appendRow([
      groupId,
      day,
      time,
      ageGroups[index],
      new Date('2025-01-05'),
      new Date('2025-03-23'),
      0,
      10,
      'Open',
      cohortNumber
    ]);
  });
}

function getCurrentCohortNumber() {
  return 1;
}

function createNewGroup(ageGroup, groupsSheet) {
  const ageRange = getAgeRange(ageGroup);
  const cohortNumber = getCurrentCohortNumber();

  const groups = groupsSheet.getDataRange().getValues();
  let day = 'Monday';

  const dayPrefix = day.substring(0,3).toUpperCase();
  const ageCode = ageRange.replace('-','');
  const groupId = dayPrefix + '-' + ageCode + '-' + cohortNumber;

  const time = ageRange === '8-10' ? '15:00-16:15' :
               ageRange === '11-13' ? '16:30-17:45' : '18:00-19:15';

  groupsSheet.appendRow([
    groupId,
    day,
    time,
    ageRange,
    new Date('2025-01-05'),
    new Date('2025-03-23'),
    0,
    10,
    'Open',
    cohortNumber
  ]);

  return {
    groupId: groupId,
    day: day,
    time: time,
    row: groupsSheet.getLastRow()
  };
}

function sendConfirmation(email, data, groupAssignments) {
  console.log('📨 sendConfirmation called');
  console.log('📨 Recipient email:', email);

  const subject = 'Welcome to AI Kids Club - Registration Confirmed!';

  // Generate children list HTML
  const childrenListHtml = groupAssignments.map(assignment => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 600; color: #06b6d4; margin-bottom: 4px;">
          ${assignment.childName}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          ${assignment.program}
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">
          ${assignment.groupId}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          ${assignment.day} ${assignment.time}
        </div>
      </td>
    </tr>
  `).join('');

  // Payment instructions based on method
  let paymentInstructions = '';
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
      <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
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
  } else if (data.paymentMethod === 'cash') {
    paymentInstructions = `
      <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px;">
          Bank Transfer
        </div>
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
          <strong>Bank:</strong> Bank Hapoalim (12)<br>
          <strong>Branch:</strong> 689<br>
          <strong>Account:</strong> 518748<br>
          <strong>Amount:</strong> ₪${data.totalPrice}<br>
          <strong>Reference:</strong> Include child name(s)
        </div>
      </div>
    `;
  }

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Kids Club - Registration Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #0f172a;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: linear-gradient(to bottom right, #1e293b, #0f172a); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
              <tr>
                <td style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: white;">AI Kids Club</h1>
                  <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.95);">Registration Confirmed!</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px 20px 30px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #06b6d4;">Welcome, ${data.parent.name}!</h2>
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                    Thank you for registering your ${data.children.length > 1 ? 'children' : 'child'} for AI Kids Club!
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: rgba(6, 182, 212, 0.1); border: 2px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 24px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #06b6d4;">Registration Details</h3>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                      ${childrenListHtml}
                    </table>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid rgba(6, 182, 212, 0.3); text-align: right;">
                      <div style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Total Amount</div>
                      <div style="font-size: 28px; font-weight: bold; color: #06b6d4;">₪${data.totalPrice}</div>
                    </div>
                  </div>
                </td>
              </tr>
              ${paymentInstructions ? `<tr><td style="padding: 0 30px 30px 30px;"><h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #06b6d4;">Complete Your Payment</h3>${paymentInstructions}</td></tr>` : ''}
              <tr>
                <td style="background: rgba(0,0,0,0.2); padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
                  <p style="margin: 0 0 12px 0; font-size: 14px; color: rgba(255,255,255,0.6);">Questions? We're here to help!</p>
                  <p style="margin: 0;"><a href="mailto:raphael@aikidz.club" style="color: #06b6d4; text-decoration: none;">raphael@aikidz.club</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const plainTextBody = `Hi ${data.parent.name},

Thank you for registering for AI Kids Club!

${groupAssignments.map(a => `${a.childName} - ${a.program}\nGroup: ${a.groupId} (${a.day} ${a.time})`).join('\n\n')}

Total: ₪${data.totalPrice}

Questions? Contact us at raphael@aikidz.club or +972-54-315-9025

Welcome to AI Kids Club!
`;

  try {
    GmailApp.sendEmail(email, subject, plainTextBody, {
      htmlBody: htmlBody,
      name: 'AI Kids Club',
      replyTo: 'raphael@aikidz.club'
    });

    console.log('✅ Registration confirmation email sent successfully');
  } catch (error) {
    console.error('❌ Registration email failed:', error.toString());
    throw error;
  }
}

// ========================================
// GET REQUESTS - For fetching group data
// ========================================

function doGet(e) {
  try {
    console.log('🔍 doGet called, fetching group data...');

    const spreadsheetId = '1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M';
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    const groups = sheet.getSheetByName('Groups');

    if (!groups) {
      throw new Error('Groups sheet not found');
    }

    const data = groups.getDataRange().getValues();

    const groupData = data.slice(1).map(row => ({
      groupId: row[0],
      day: row[1],
      time: row[2],
      ageRange: row[3],
      startDate: row[4],
      endDate: row[5],
      currentCount: row[6],
      maxCapacity: row[7],
      status: row[8]
    }));

    return ContentService
      .createTextOutput(JSON.stringify({success: true, groups: groupData}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('❌ doGet error:', error.toString());

    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// CURRICULUM HTML TEMPLATES - ENGLISH
// ========================================

/**
 * Returns the complete Young Explorers curriculum HTML (ENGLISH)
 * IMPORTANT: Copy the full HTML from your email template here
 */
function getYoungExplorersHTML() {
  // TODO: Insert the complete Young Explorers English HTML email template here
  return `<!-- INSERT YOUNG EXPLORERS ENGLISH HTML HERE -->`;
}

/**
 * Returns the complete Teen Champions curriculum HTML (ENGLISH)
 */
function getTeenChampionsHTML() {
  // TODO: Insert the complete Teen Champions English HTML email template here
  return `<!-- INSERT TEEN CHAMPIONS ENGLISH HTML HERE -->`;
}

/**
 * Returns the complete Future Leaders curriculum HTML (ENGLISH)
 */
function getFutureLeadersHTML() {
  // TODO: Insert the complete Future Leaders English HTML email template here
  return `<!-- INSERT FUTURE LEADERS ENGLISH HTML HERE -->`;
}

// ========================================
// CURRICULUM HTML TEMPLATES - HEBREW
// ========================================

/**
 * Returns the complete Young Explorers curriculum HTML (HEBREW)
 * IMPORTANT: Copy the full Hebrew HTML from google-apps-script-curriculum-HEBREW.js
 */
function getYoungExplorersHebrewHTML() {
  // TODO: Insert the complete Young Explorers Hebrew HTML email template here
  return `<!-- INSERT YOUNG EXPLORERS HEBREW HTML HERE -->`;
}

/**
 * Returns the complete Teen Champions curriculum HTML (HEBREW)
 */
function getTeenChampionsHebrewHTML() {
  // TODO: Insert the complete Teen Champions Hebrew HTML email template here
  return `<!-- INSERT TEEN CHAMPIONS HEBREW HTML HERE -->`;
}

/**
 * Returns the complete Future Leaders curriculum HTML (HEBREW)
 */
function getFutureLeadersHebrewHTML() {
  // TODO: Insert the complete Future Leaders Hebrew HTML email template here
  return `<!-- INSERT FUTURE LEADERS HEBREW HTML HERE -->`;
}

// ========================================
// TEST FUNCTIONS
// ========================================

/**
 * Test registration email
 */
function testRegistrationEmail() {
  console.log('🧪 Testing registration email...');

  const testData = {
    parent: {
      name: 'Test Parent',
      email: 'raphael.berrebi.1@gmail.com'
    },
    children: [{
      name: 'Test Child',
      program: 'Young Innovators (8-10)',
      price: 599
    }],
    totalPrice: 599,
    paymentMethod: 'bit'
  };

  const testAssignments = [{
    childName: 'Test Child',
    program: 'Young Innovators (8-10)',
    groupId: 'SUN-810-1',
    day: 'Sunday',
    time: '16:00-17:30'
  }];

  try {
    sendConfirmation('raphael.berrebi.1@gmail.com', testData, testAssignments);
    return 'Success! Check email.';
  } catch (error) {
    return 'Failed: ' + error.toString();
  }
}

/**
 * Test English curriculum email
 */
function testEnglishCurriculumEmail() {
  console.log('🧪 Testing English curriculum email...');

  try {
    sendCurriculumEmail(
      'raphael.berrebi.1@gmail.com',
      'Test Parent',
      'young',
      'https://www.aikidz.club/pdf-curriculum-young-explorers.html'
    );
    return 'Success! Check email.';
  } catch (error) {
    return 'Failed: ' + error.toString();
  }
}

/**
 * Test Hebrew curriculum email
 */
function testHebrewCurriculumEmail() {
  console.log('🧪 Testing Hebrew curriculum email...');

  try {
    sendCurriculumEmailHebrew(
      'raphael.berrebi.1@gmail.com',
      'הורה לדוגמה',
      'young',
      'https://www.aikidz.club/pdf-curriculum-young-explorers.html'
    );
    return 'Success! Check email.';
  } catch (error) {
    return 'Failed: ' + error.toString();
  }
}
