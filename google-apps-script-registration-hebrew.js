function doPost(e) {
  try {
    console.log('🚀 doPost called with:', e.postData);

    // Target your specific AI Club spreadsheet
    const spreadsheetId = '1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M';
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('📊 Spreadsheet found:', sheet.getName());

    const registrations = sheet.getSheetByName('Registrations');
    const groups = sheet.getSheetByName('Groups');

    console.log('📝 Registrations sheet found:', !!registrations);
    console.log('👥 Groups sheet found:', !!groups);

    // Handle both FormData and direct JSON submissions
    let data;

    console.log('🔍 Debug - e.postData:', e.postData);
    console.log('🔍 Debug - e.parameter:', e.parameter);

    // First try to get data from parameters (FormData method)
    if (e.parameter && e.parameter.data) {
      console.log('📦 Using parameter data (FormData method)');
      data = JSON.parse(e.parameter.data);
    }
    // Then try postData contents (direct JSON method)
    else if (e.postData && e.postData.contents) {
      console.log('📦 Using postData contents (JSON method)');
      data = JSON.parse(e.postData.contents);
    }
    // Final fallback
    else {
      console.error('❌ No data found in request');
      console.log('Available keys in e:', Object.keys(e));
      throw new Error('No data received - check request format');
    }

    console.log('📦 Parsed data:', JSON.stringify(data));

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
            data.paymentStatus || 'Pending', // J: Payment Status (Pending/Completed/Failed)
            data.totalPrice, // K: Total Price
            data.paymentMethod || 'Not Selected', // L: Payment Method (bit/paybox/cash)
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

    // Send confirmation email with group details (HEBREW VERSION)
    try {
      console.log('🔵 About to call sendConfirmationHebrew...');
      console.log('📧 Email recipient:', data.parent.email);
      console.log('👥 Group assignments count:', groupAssignments.length);
      console.log('👥 Group assignments:', JSON.stringify(groupAssignments));

      sendConfirmationHebrew(data.parent.email, data, groupAssignments);

      console.log('✅ sendConfirmationHebrew returned successfully');
      console.log('✅ Confirmation email sent to:', data.parent.email);
    } catch (emailError) {
      console.error('❌ Email sending FAILED with error:', emailError.toString());
      console.error('❌ Error message:', emailError.message);
      console.error('❌ Error stack:', emailError.stack);
      // Don't fail the registration if email fails
    }

    console.log('✅ Registration completed successfully');

    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Registration processed'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function assignToGroup(ageGroup, groupsSheet) {
  console.log('🔍 assignToGroup called with ageGroup:', ageGroup);

  const groups = groupsSheet.getDataRange().getValues();
  console.log('📊 Groups data:', groups);
  console.log('📊 Total groups found:', groups.length - 1);

  const expectedAgeRange = getAgeRange(ageGroup);
  console.log('🎯 Looking for age range:', expectedAgeRange);

  // Find available group for this age range
  for (let i = 1; i < groups.length; i++) {
    const [groupId, day, time, ageRange, startDate, endDate, currentCount, maxCapacity, status] = groups[i];

    console.log(`🔍 Checking group ${i}:`, {
      groupId, day, time, ageRange, currentCount, maxCapacity, status,
      ageRangeMatch: ageRange === expectedAgeRange,
      hasCapacity: currentCount < maxCapacity,
      isOpen: status === 'Open'
    });

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
  // If no group available, create new one
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
      new Date('2025-01-05'), // Start date
      new Date('2025-03-23'), // End date
      0, // Current count
      10, // Max capacity
      'Open', // Status
      cohortNumber
    ]);
  });
}

function getCurrentCohortNumber() {
  return 1; // You can make this dynamic later
}

function updateCalendar(data) {
  // Create calendar events for each group
  // This requires setting up a Google Calendar and getting its ID
  const calendarId = 'c_a04462f6072fb9013027f317edb973752ed1811c7e6e8ee85f8591398a52870b@group.calendar.google.com'; // Replace with your calendar ID

  try {
    const calendar = CalendarApp.getCalendarById(calendarId);

    data.children.forEach(child => {
      // Create recurring event for this child's group
      const eventTitle = 'מועדון AI - ' + child.program + ' - ' + child.name;

      // This is a simplified version - you'd want to create proper recurring events
      calendar.createEvent(
        eventTitle,
        new Date('2025-01-05 16:00:00'), // Adjust based on group time
        new Date('2025-01-05 17:00:00'),
        {description: 'תלמיד: ' + child.name + '\nהורה: ' + data.parent.name + '\nאימייל: ' + data.parent.email}
      );
    });

  } catch (error) {
    console.log('Calendar update failed:', error);
  }
}

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

// Function to get current group data (called from website)
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
    console.log('📊 Raw group data rows:', data.length);

    // Remove header row and format for website
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

    console.log('✅ Group data formatted:', groupData.length, 'groups');

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

function createNewGroup(ageGroup, groupsSheet) {
  // This function creates a new group when all existing ones are full
  const ageRange = getAgeRange(ageGroup);
  const cohortNumber = getCurrentCohortNumber();

  // Find the next available day
  const groups = groupsSheet.getDataRange().getValues();
  let day = 'Monday'; // Start with Monday as Sunday is likely full

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

// ========================================
// TEST FUNCTIONS - Run these manually to debug email issues
// ========================================

/**
 * Test 1: Simple email test - Just sends a plain test email in Hebrew
 * Run this first to verify MailApp works at all
 */
function testEmailSimpleHebrew() {
  console.log('🧪 Starting simple email test (Hebrew)...');
  try {
    GmailApp.sendEmail('raphael.berrebi.1@gmail.com',
      'אימייל בדיקה מסקריפט מועדון AI',
      'זהו אימייל בדיקה פשוט. אם קיבלת את זה, GmailApp עובד!', {
        name: 'מועדון AI לילדים',
        replyTo: 'raphael@aikidz.club'
      });
    console.log('✅ Simple test email sent successfully (Hebrew)');
    return 'Success! Check your email: raphael.berrebi.1@gmail.com';
  } catch (error) {
    console.error('❌ Simple test email failed (Hebrew):', error.toString());
    console.error('❌ Error details:', error.message);
    return 'Failed: ' + error.toString();
  }
}

/**
 * Test 2: Full confirmation email test - Tests the complete sendConfirmationHebrew function
 * Run this to test the actual confirmation email with HTML in Hebrew
 */
function testConfirmationEmailHebrew() {
  console.log('🧪 Starting confirmation email test (Hebrew)...');

  const testData = {
    parent: {
      name: 'הורה לבדיקה',
      email: 'raphael.berrebi.1@gmail.com'
    },
    children: [{
      name: 'ילד לבדיקה',
      program: 'חדשנים צעירים (גילאי 8-10)',
      price: 599
    }],
    totalPrice: 599,
    paymentMethod: 'bit',
    paymentPlan: 'monthly'
  };

  const testAssignments = [{
    childName: 'ילד לבדיקה',
    program: 'חדשנים צעירים (גילאי 8-10)',
    groupId: 'SUN-810-1',
    day: 'ראשון',
    time: '15:00-16:15'
  }];

  try {
    sendConfirmationHebrew('raphael.berrebi.1@gmail.com', testData, testAssignments);
    console.log('✅ Confirmation email test completed (Hebrew)');
    return 'Success! Check your email: raphael.berrebi.1@gmail.com';
  } catch (error) {
    console.error('❌ Confirmation email test failed (Hebrew):', error.toString());
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack:', error.stack);
    return 'Failed: ' + error.toString();
  }
}
