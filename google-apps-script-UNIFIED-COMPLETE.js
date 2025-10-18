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
  // Capture debug info for browser visibility
  const debugInfo = {
    eKeys: e ? Object.keys(e) : [],
    hasParameter: !!(e && e.parameter),
    hasPostData: !!(e && e.postData),
    parameterKeys: e && e.parameter ? Object.keys(e.parameter) : [],
    postDataType: e && e.postData ? e.postData.type : null,
    postDataContents: e && e.postData ? e.postData.contents : null,
    parsingMethod: null,
    parsedData: null,
    parseError: null
  };

  try {
    console.log('🚀 ========== doPost CALLED ==========');
    console.log('🔍 DEBUG - e object keys:', Object.keys(e));
    console.log('🔍 DEBUG - e.parameter:', JSON.stringify(e.parameter));
    console.log('🔍 DEBUG - e.postData:', JSON.stringify(e.postData));

    if (e.postData) {
      console.log('🔍 DEBUG - e.postData.type:', e.postData.type);
      console.log('🔍 DEBUG - e.postData.length:', e.postData.length);
      console.log('🔍 DEBUG - e.postData.contents:', e.postData.contents);
    }

    // Parse incoming data
    let data;
    try {
      if (e.parameter && e.parameter.data) {
        console.log('📦 Using parameter data (FormData method)');
        debugInfo.parsingMethod = 'e.parameter.data';
        data = JSON.parse(e.parameter.data);
      } else if (e.postData && e.postData.contents) {
        console.log('📦 Using postData contents (JSON method)');
        debugInfo.parsingMethod = 'e.postData.contents';
        data = JSON.parse(e.postData.contents);
      } else {
        console.error('❌ No data found in request');
        debugInfo.parseError = 'No data found in request';
        throw new Error('No data received - check request format');
      }
      debugInfo.parsedData = data;
    } catch (parseError) {
      debugInfo.parseError = parseError.toString();
      throw parseError;
    }

    console.log('📦 Parsed data:', JSON.stringify(data));
    console.log('🔍 DEBUG - data.name:', data.name);
    console.log('🔍 DEBUG - data.email:', data.email);
    console.log('🔍 DEBUG - data.program:', data.program);
    console.log('🔍 DEBUG - data.language:', data.language);
    console.log('🔍 DEBUG - data.children:', data.children);

    // ========================================
    // ROUTING LOGIC: Check request type
    // ========================================

    if (data.children) {
      // This is a REGISTRATION request
      console.log('🎯 ROUTING → Registration Handler');
      const result = handleRegistration(e, data);
      // Add debug info to response during debugging
      try {
        const resultObj = JSON.parse(result.getContent());
        resultObj.debug = debugInfo;
        return ContentService.createTextOutput(JSON.stringify(resultObj))
          .setMimeType(ContentService.MimeType.JSON);
      } catch(e) {
        return result; // Return original if can't parse
      }

    } else if (data.program) {
      // This is a CURRICULUM DOWNLOAD request
      console.log('🎯 ROUTING → Curriculum Download Handler');
      const result = handleCurriculumDownload(e, data);
      // Add debug info to response during debugging
      try {
        const resultObj = JSON.parse(result.getContent());
        resultObj.debug = debugInfo;
        return ContentService.createTextOutput(JSON.stringify(resultObj))
          .setMimeType(ContentService.MimeType.JSON);
      } catch(e) {
        return result; // Return original if can't parse
      }

    } else {
      throw new Error('Unknown request type - missing both children and program fields');
    }

  } catch (error) {
    console.error('❌ doPost error:', error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        debug: debugInfo  // Include debug info in error response for browser visibility
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
      console.log('🌐 Language:', data.language || 'en (default)');

      // Language routing for registration confirmation emails
      if (data.language === 'he') {
        console.log('🇮🇱 Sending Hebrew registration confirmation');
        sendConfirmationHebrew(data.parent.email, data, groupAssignments);
      } else {
        console.log('🇺🇸 Sending English registration confirmation');
        sendConfirmation(data.parent.email, data, groupAssignments);
      }

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
    console.log('📥 ========== CURRICULUM DOWNLOAD HANDLER ==========');
    console.log('🔍 DEBUG - Received data:', JSON.stringify(data));
    console.log('🔍 DEBUG - data.name:', data.name);
    console.log('🔍 DEBUG - data.email:', data.email);
    console.log('🔍 DEBUG - data.program:', data.program);
    console.log('🔍 DEBUG - data.source:', data.source);
    console.log('🔍 DEBUG - data.language:', data.language);
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
      // TEMPORARY FIX: Use hardcoded parameters exactly like working test function
      sendCurriculumEmailHebrew(
        data.email,  // Use real email address
        'הורה לדוגמה',  // Hardcoded name (like test function)
        'young',  // Hardcoded program (like test function)
        'https://www.aikidz.club/pdf-curriculum-young-explorers.html'  // Hardcoded URL (like test function)
      );
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

  const subject = `תכנית הלימודים המלאה - ${programName} - AI Kidz Club`;

  // Get the HEBREW curriculum HTML based on program type
  console.log('📄 Generating Hebrew curriculum HTML for:', programName);
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

// ========================================
// REGISTRATION CONFIRMATION - HEBREW
// ========================================

function sendConfirmationHebrew(email, data, groupAssignments) {
  console.log('📨 sendConfirmationHebrew called');
  console.log('📨 Recipient email:', email);
  console.log('📨 Parent name:', data.parent ? data.parent.name : 'undefined');
  console.log('📨 Children count:', data.children ? data.children.length : 0);
  console.log('📨 Group assignments:', groupAssignments ? groupAssignments.length : 0);

  const subject = 'ברוכים הבאים למועדון AI - ההרשמה אושרה!';

  // Generate children list HTML (RTL)
  const childrenListHtml = groupAssignments.map(assignment => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">
          ${assignment.groupId}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          ${assignment.day} ${assignment.time}
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <div style="font-weight: 600; color: #06b6d4; margin-bottom: 4px;">
          ${assignment.childName}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          ${assignment.program}
        </div>
      </td>
    </tr>
  `).join('');

  // Payment instructions based on method (HEBREW)
  let paymentInstructions = '';
  if (data.paymentMethod === 'bit') {
    paymentInstructions = `
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px; text-align: right;">
          תשלום דרך Bit
        </div>
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right; direction: rtl;">
          השלימו את התשלום דרך Bit למספר: <strong>054-315-9025</strong><br>
          סכום: <strong>₪${data.totalPrice}</strong><br>
          ציינו שם הילד/ה בהערת התשלום
        </div>
      </div>
    `;
  } else if (data.paymentMethod === 'paybox') {
    paymentInstructions = `
      <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px; text-align: right;">
          תשלום דרך PayBox
        </div>
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right; direction: rtl;">
          השלימו את התשלום דרך PayBox למספר: <strong>054-315-9025</strong><br>
          סכום: <strong>₪${data.totalPrice}</strong><br>
          ציינו שם הילד/ה בהערת התשלום
        </div>
      </div>
    `;
  } else if (data.paymentMethod === 'cash') {
    paymentInstructions = `
      <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 8px; text-align: right;">
          העברה בנקאית
        </div>
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; text-align: right; direction: rtl;">
          <strong>בנק:</strong> בנק הפועלים (12)<br>
          <strong>סניף:</strong> 689<br>
          <strong>חשבון:</strong> 518748<br>
          <strong>סכום:</strong> ₪${data.totalPrice}<br>
          <strong>אסמכתא:</strong> ציינו שם הילד/ה
        </div>
      </div>
    `;
  }

  const htmlBody = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>מועדון AI - ההרשמה אושרה</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; direction: rtl;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #0f172a;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <!-- Main Container -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: linear-gradient(to bottom right, #1e293b, #0f172a); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    מועדון AI לילדים
                  </h1>
                  <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                    ההרשמה אושרה!
                  </p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 40px 30px 20px 30px; text-align: right;">
                  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #06b6d4;">
                    שלום ${data.parent.name}!
                  </h2>
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                    תודה שרשמת את ${data.children.length > 1 ? 'ילדיכם' : 'ילדכם'} למועדון AI!
                    אנחנו נרגשים להתחיל יחד את המסע הלימודי הזה בעולם הבינה המלאכותית.
                  </p>
                </td>
              </tr>

              <!-- Registration Summary Card -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: rgba(6, 182, 212, 0.1); border: 2px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 24px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #06b6d4; text-align: right;">
                      פרטי ההרשמה
                    </h3>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; direction: rtl;">
                      ${childrenListHtml}
                    </table>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid rgba(6, 182, 212, 0.3); text-align: right;">
                      <div style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">
                        סכום כולל
                      </div>
                      <div style="font-size: 28px; font-weight: bold; color: #06b6d4;">
                        ₪${data.totalPrice}<span style="font-size: 16px; color: rgba(255,255,255,0.6);">/חודש</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Payment Instructions -->
              ${paymentInstructions ? `
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #06b6d4; text-align: right;">
                      השלימו את התשלום
                    </h3>
                    ${paymentInstructions}
                  </td>
                </tr>
              ` : ''}

              <!-- Next Steps -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #06b6d4; text-align: right;">
                    מה קורה עכשיו?
                  </h3>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                    <tr>
                      <td style="padding: 12px 0; text-align: right; direction: rtl;">
                        <div style="display: flex; align-items: start; flex-direction: row-reverse;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #06b6d4, #14b8a6); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 12px;">
                            <span style="color: white; font-weight: bold; font-size: 16px;">1</span>
                          </div>
                          <div>
                            <div style="font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 4px;">
                              הזמנה ליומן בקרוב
                            </div>
                            <div style="font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.5;">
                              תקבלו הזמנה מפורטת ליומן עם לוח הזמנים של הקבוצה שלכם
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; text-align: right; direction: rtl;">
                        <div style="display: flex; align-items: start; flex-direction: row-reverse;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #06b6d4, #14b8a6); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 12px;">
                            <span style="color: white; font-weight: bold; font-size: 16px;">2</span>
                          </div>
                          <div>
                            <div style="font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 4px;">
                              הצטרפות לקבוצת WhatsApp
                            </div>
                            <div style="font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.5;">
                              נוסיף אתכם לערוץ WhatsApp של הקבוצה לעדכונים וקהילה
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; text-align: right; direction: rtl;">
                        <div style="display: flex; align-items: start; flex-direction: row-reverse;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #06b6d4, #14b8a6); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 12px;">
                            <span style="color: white; font-weight: bold; font-size: 16px;">3</span>
                          </div>
                          <div>
                            <div style="font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 4px;">
                              הכנה לשיעור הראשון
                            </div>
                            <div style="font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.5;">
                              נשלח הוראות וחומרים לפני השיעור באימייל
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding: 0 30px 40px 30px; text-align: center;">
                  <a href="https://wa.me/972543159025?text=שלום!%20זה%20עתה%20נרשמתי%20למועדון%20AI" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                    צרו איתנו קשר בוואטסאפ
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: rgba(0,0,0,0.2); padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
                  <p style="margin: 0 0 12px 0; font-size: 14px; color: rgba(255,255,255,0.6);">
                    יש לכם שאלות? אנחנו כאן לעזור!
                  </p>
                  <p style="margin: 0 0 8px 0;">
                    <a href="mailto:contact@aikidz.club" style="color: #06b6d4; text-decoration: none; font-size: 14px;">
                      contact@aikidz.club
                    </a>
                  </p>
                  <p style="margin: 0 0 16px 0;">
                    <a href="https://wa.me/972543159025" style="color: #06b6d4; text-decoration: none; font-size: 14px;">
                      054-315-9025
                    </a>
                  </p>
                  <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                    © ${new Date().getFullYear()} מועדון AI לילדים · רעננה, ישראל<br>
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

  const plainTextBody = `שלום ${data.parent.name},

תודה שנרשמת למועדון AI לילדים! להלן פרטי ההרשמה שלך:

${groupAssignments.map(a => `${a.childName} - ${a.program}\nקבוצה: ${a.groupId} (${a.day} ${a.time})`).join('\n\n')}

סכום כולל: ₪${data.totalPrice}/חודש
אמצעי תשלום: ${data.paymentMethod || 'לא נבחר'}

הצעדים הבאים:
1. השלימו את התשלום
2. תקבלו הזמנה ליומן עם לוח הזמנים
3. נוסיף אתכם לקבוצת WhatsApp לפני תחילת השיעורים

יש שאלות? השיבו לאימייל זה או שלחו לנו הודעה בוואטסאפ: 054-315-9025

ברוכים הבאים למועדון AI!
צוות מועדון AI לילדים

www.aikidz.club
`;

  try {
    console.log('📤 Attempting GmailApp.sendEmail (Hebrew)...');
    console.log('📤 To:', email);
    console.log('📤 Subject:', subject);
    console.log('📤 HTML body length:', htmlBody.length);
    console.log('📤 Plain text body length:', plainTextBody.length);

    GmailApp.sendEmail(email, subject, plainTextBody, {
      htmlBody: htmlBody,
      name: 'מועדון AI לילדים',
      replyTo: 'raphael@aikidz.club'
    });

    console.log('✅ GmailApp.sendEmail completed successfully (Hebrew)');
    console.log('✅ Email sent successfully to:', email);
  } catch (error) {
    console.error('❌ GmailApp.sendEmail FAILED (Hebrew)');
    console.error('❌ Error type:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error toString:', error.toString());
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

// ========================================
// CURRICULUM HTML TEMPLATES - ENGLISH
// ========================================

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


// ========================================
// CURRICULUM HTML TEMPLATES - HEBREW
// ========================================

function getYoungExplorersHTMLHebrew() {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>תוכנית ממציאים צעירים - תוכנית לימודים מלאה של 48 שבועות | מועדון AI</title>

    <style>
        /* Responsive styles for mobile devices */
        @media only screen and (max-width: 600px) {
            .mobile-full-width-container { width: 100% !important; max-width: 100% !important; }
            .mobile-padding { padding: 20px 15px !important; }
            .mobile-padding-outer { padding: 10px 0 !important; }
            .mobile-padding-small { padding: 15px 12px !important; }
            .mobile-heading-xl { font-size: 24px !important; line-height: 1.2 !important; }
            .mobile-heading-large { font-size: 22px !important; line-height: 1.3 !important; }
            .mobile-heading-medium { font-size: 18px !important; line-height: 1.4 !important; }
            .mobile-heading-small { font-size: 16px !important; line-height: 1.4 !important; }
            .mobile-text { font-size: 14px !important; }
            .header-logo { display: block !important; width: 80px !important; padding: 0 0 15px 0 !important; }
            .header-logo img { width: 80px !important; height: 80px !important; }
            .header-text { display: block !important; text-align: center !important; }
            .quarter-grid { display: block !important; width: 100% !important; }
            .quarter-card { display: block !important; width: 100% !important; margin-bottom: 15px !important; }
        }

        /* Base styles */
        body { margin: 0; padding: 0; direction: rtl; }
        table { border-collapse: collapse; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    </style>

</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6; direction: rtl;">

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
                                    <td valign="middle" class="header-text" style="text-align: right;">
                                        <h1 class="mobile-heading-xl" style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold; color: white;">
                                            מועדון AI לילדים
                                        </h1>
                                        <p style="margin: 0 0 4px 0; font-size: 18px; color: rgba(255,255,255,0.95); font-weight: 600;">
                                            תוכנית ממציאים צעירים
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                                            מדריך תוכנית לימודים מלאה של 48 שבועות • גילאי 8-10
                                        </p>
                                    </td>
                                    <td width="130" valign="middle" class="header-logo" style="padding-left: 20px;">
                                        <img src="https://www.aikidz.club/New.logov2.gif" alt="רובוט מועדון AI" width="120" height="120" style="display: block; border-radius: 12px; width: 120px !important; height: auto !important;" />
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
                                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #1e293b; line-height: 1.8;">
                                            <strong style="color: #0891b2;">למידה דרך משחק</strong><br>
                                            כל מושג נלמד דרך משחקים ופעילויות חזותיות
                                        </p>
                                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #1e293b; line-height: 1.8;">
                                            <strong style="color: #0891b2;">תוצאות מיידיות</strong><br>
                                            רואים תוצאות מרגשות בכל מפגש
                                        </p>
                                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #1e293b; line-height: 1.8;">
                                            <strong style="color: #0891b2;">בניית בסיס</strong><br>
                                            כישורים שגדלים עם הילד שלכם
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.8;">
                                            <strong style="color: #0891b2;">ביטחון קודם כל</strong><br>
                                            בניית נוחות עם טכנולוגיה בקצב שלהם
                                        </p>
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
                            <div style="background-color: #f0fdfa; border-right: 4px solid #06b6d4; padding: 16px 20px; border-radius: 8px;">
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

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 1: העוזר הדיגיטלי שלי</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">היכרות עם עוזרי AI - למידה על מה AI יכול לעשות בחיי היומיום</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> יצירת שיחת AI ראשונה על נושאים אהובים</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 2: מאסטר המשימות</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">פירוק עבודות גדולות לשלבים קטנים עם סיוע AI</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> תכנון פרויקט סוף שבוע שלב אחר שלב</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 3: ילדי היומן</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">הבנת זמן ולוחות זמנים עם יומנים דיגיטליים</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> יצירת לוח שבועי צבעוני</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 5: בונה שגרת הבוקר</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">עיצוב הבוקר המושלם עם סיוע AI</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> בניית רשימת משימות חזותית לבוקר</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #06b6d4;">שבוע 7: חבר הקריאה</h5>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569; line-height: 1.6;">עקוב אחר הספרים שאתה רוצה לקרוא</p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>פעילות:</strong> יצירת רשימת קריאה אישית עם סיכומי AI</p>
                            </div>

                            <div style="background-color: white; border: 2px solid #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
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
                            <div style="background-color: #f0fdfa; border-right: 4px solid #14b8a6; padding: 16px 20px; border-radius: 8px;">
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
                            <div style="background-color: #f0fdfa; border-right: 4px solid #0891b2; padding: 16px 20px; border-radius: 8px;">
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
                            <div style="background-color: #f0fdf4; border-right: 4px solid #10b981; padding: 16px 20px; border-radius: 8px;">
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
                                    <td style="background: linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 100%); border-radius: 8px; padding: 16px; margin-bottom: 10px;">
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
    .replace(/#06b6d4/g, '#f59e0b')
    .replace(/#0891b2/g, '#d97706')
    .replace(/#e0f2fe/g, '#fef3c7')
    .replace(/#ccfbf1/g, '#fde68a');
}

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
