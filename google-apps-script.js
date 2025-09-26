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

    // Process each child registration
    console.log('👥 Processing children:', data.children.length);
    data.children.forEach((child, index) => {
      console.log(`👶 Processing child ${index + 1}:`, child.name, 'Program:', child.program);

        try {
          const group = assignToGroup(child.program, groups);
          console.log('🏫 Assigned to group:', group ? group.groupId : 'NULL');

          if (!group) {
            throw new Error('Failed to assign child to group');
          }

          // Add registration
          const rowData = [
            new Date(),
            data.parent.name,
            data.parent.email,
            data.parent.phone,
            child.name,
            child.program,
            child.price,
            group.groupId,
            'Confirmed',
            'Pending',
            data.totalPrice
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

    // TESTING: Disable email and calendar for now
    // updateCalendar(data);
    // sendConfirmation(data.parent.email, data);

    console.log('✅ Registration completed successfully - email/calendar disabled for testing');

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
      const eventTitle = 'AI Club - ' + child.program + ' - ' + child.name;

      // This is a simplified version - you'd want to create proper recurring events
      calendar.createEvent(
        eventTitle,
        new Date('2025-01-05 16:00:00'), // Adjust based on group time
        new Date('2025-01-05 17:00:00'),
        {description: 'Student: ' + child.name + '\nParent: ' + data.parent.name + '\nEmail: ' + data.parent.email}
      );
    });

  } catch (error) {
    console.log('Calendar update failed:', error);
  }
}

function sendConfirmation(email, data) {
  const subject = 'AI Club Registration Confirmed!';
  const childrenList = data.children.map(child => '- ' + child.name + ' (' + child.program + ')').join('\n');
  const body = 'Hi ' + data.parent.name + ',\n\n' +
    'Thank you for registering for AI Club! Here are your registration details:\n\n' +
    'Children registered:\n' + childrenList + '\n\n' +
    'Total: ₪' + data.totalPrice + '\n\n' +
    'Next steps:\n' +
    '1. You will receive a calendar invite with class schedules\n' +
    '2. Payment instructions will follow shortly\n' +
    '3. We will add you to the WhatsApp group before classes start\n\n' +
    'Questions? Reply to this email or WhatsApp us at +972-54-315-9025\n\n' +
    'Welcome to AI Club!\n' +
    'The AI Club Team';

  try {
    MailApp.sendEmail(email, subject, body);
  } catch (error) {
    console.log('Email send failed:', error);
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