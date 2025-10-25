# AI Kids Club - Registration System v2.0 Deployment & Testing Guide

## 📋 Overview

This guide walks you through deploying the upgraded registration system with duplicate detection, lead tracking, and smart email features.

**All code is complete and committed!** You just need to:
1. Deploy 3 Google Apps Scripts
2. Update URLs in HTML files
3. Update Google Sheets structure
4. Test all scenarios

---

## 🚀 STEP 1: Deploy Google Apps Scripts

### Script 1: English Registration Handler

1. **Open Google Apps Script**
   - Go to: https://script.google.com
   - Click "New Project"

2. **Name the project**
   - Click "Untitled project" at top
   - Rename to: `AI Kids Club - English Registration`

3. **Paste the code**
   - Delete all existing code
   - Open: `/Users/raphaelberrebi/AI for Kids/google-apps-script-registration-ENGLISH-UPDATED.js`
   - Copy ALL contents
   - Paste into Google Apps Script

4. **Deploy as Web App**
   - Click "Deploy" → "New deployment"
   - Click gear icon ⚙️ → Select "Web app"
   - Settings:
     - Description: `Registration Handler v2.0`
     - Execute as: `Me (your-email@gmail.com)`
     - Who has access: `Anyone`
   - Click "Deploy"
   - **COPY THE WEB APP URL** - You'll need this!
   - Should look like: `https://script.google.com/macros/s/AKfycby.../exec`

5. **Save the URL**
   ```
   English Registration URL: ________________________________
   ```

---

### Script 2: Hebrew Registration Handler

1. **Create new project**
   - Return to https://script.google.com
   - Click "New Project"

2. **Name the project**
   - Rename to: `AI Kids Club - Hebrew Registration`

3. **Paste the code**
   - Delete all existing code
   - Open: `/Users/raphaelberrebi/AI for Kids/google-apps-script-registration-hebrew-UPDATED.js`
   - Copy ALL contents
   - Paste into Google Apps Script

4. **Deploy as Web App**
   - Same settings as English version
   - Description: `Hebrew Registration Handler v2.0`
   - Execute as: `Me`
   - Who has access: `Anyone`
   - Click "Deploy"
   - **COPY THE WEB APP URL**

5. **Save the URL**
   ```
   Hebrew Registration URL: ________________________________
   ```

---

### Script 3: Lead Tracking Handler

1. **Create new project**
   - Return to https://script.google.com
   - Click "New Project"

2. **Name the project**
   - Rename to: `AI Kids Club - Lead Tracking`

3. **Create the tracking script**
   - Delete all existing code
   - Paste this code:

```javascript
/**
 * Lead Tracking Handler
 * Tracks user progression through registration steps for lead nurturing
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.openById('1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M');
    let trackingSheet = ss.getSheetByName('Lead Tracking');

    // Create Lead Tracking sheet if it doesn't exist
    if (!trackingSheet) {
      trackingSheet = ss.insertSheet('Lead Tracking');
      trackingSheet.appendRow([
        'Session ID',
        'Timestamp',
        'Step Completed',
        'Child Names',
        'Age Groups',
        'Payment Plan',
        'Parent Email',
        'Status',
        'Completion Time'
      ]);
    }

    // Check if session already exists
    const trackingData = trackingSheet.getDataRange().getValues();
    let existingRowIndex = -1;

    for (let i = 1; i < trackingData.length; i++) {
      if (trackingData[i][0] === data.sessionId) {
        existingRowIndex = i + 1; // +1 for 1-indexed Google Sheets
        break;
      }
    }

    // Determine status text based on language
    const statusText = data.language === 'hebrew' ? 'בתהליך' : 'In Progress';

    if (existingRowIndex > 0) {
      // Update existing row
      trackingSheet.getRange(existingRowIndex, 2).setValue(new Date()); // Timestamp
      trackingSheet.getRange(existingRowIndex, 3).setValue(data.stepCompleted || ''); // Step
      trackingSheet.getRange(existingRowIndex, 4).setValue(data.childNames || ''); // Child Names
      trackingSheet.getRange(existingRowIndex, 5).setValue(data.ageGroups || ''); // Age Groups
      trackingSheet.getRange(existingRowIndex, 6).setValue(data.paymentPlan || ''); // Payment Plan
      trackingSheet.getRange(existingRowIndex, 7).setValue(data.parentEmail || ''); // Email
      trackingSheet.getRange(existingRowIndex, 8).setValue(statusText); // Status
    } else {
      // Create new row
      trackingSheet.appendRow([
        data.sessionId || '',
        new Date(),
        data.stepCompleted || '',
        data.childNames || '',
        data.ageGroups || '',
        data.paymentPlan || '',
        data.parentEmail || '',
        statusText,
        '' // Completion time (empty until registration completes)
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Tracking updated'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Tracking error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **Deploy as Web App**
   - Description: `Lead Tracking Handler v1.0`
   - Execute as: `Me`
   - Who has access: `Anyone`
   - Click "Deploy"
   - **COPY THE WEB APP URL**

5. **Save the URL**
   ```
   Lead Tracking URL: ________________________________
   ```

---

## 🔧 STEP 2: Update HTML Files with Script URLs

You need to update 4 HTML files with the URLs you just copied.

### Files to Update:
1. `public/index.html` (Desktop English)
2. `public/index-he.html` (Desktop Hebrew)
3. `public/mobile.html` (Mobile English)
4. `public/mobile-he.html` (Mobile Hebrew)

### What to Replace:

#### A. Registration Script URLs

**In index.html and mobile.html (English):**
Find this line (around line 4257 in desktop, 1360 in mobile):
```javascript
const GOOGLE_SHEETS_WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';
```

Replace with:
```javascript
const GOOGLE_SHEETS_WEB_APP_URL = 'YOUR_ENGLISH_REGISTRATION_URL';
```

**In index-he.html and mobile-he.html (Hebrew):**
Find the same line and replace with:
```javascript
const GOOGLE_SHEETS_WEB_APP_URL = 'YOUR_HEBREW_REGISTRATION_URL';
```

#### B. Lead Tracking URLs

**In ALL 4 files:**
Find this line (near the top of script section):
```javascript
const TRACKING_URL = 'https://script.google.com/macros/s/YOUR_TRACKING_SCRIPT_ID/exec';
```

Replace with:
```javascript
const TRACKING_URL = 'YOUR_LEAD_TRACKING_URL';
```

### Quick Replace Commands:

```bash
cd "/Users/raphaelberrebi/AI for Kids/public"

# Update English registration URLs
sed -i '' "s|'YOUR_WEB_APP_URL_HERE'|'YOUR_ENGLISH_URL_HERE'|g" index.html
sed -i '' "s|'YOUR_WEB_APP_URL_HERE'|'YOUR_ENGLISH_URL_HERE'|g" mobile.html

# Update Hebrew registration URLs
sed -i '' "s|'YOUR_WEB_APP_URL_HERE'|'YOUR_HEBREW_URL_HERE'|g" index-he.html
sed -i '' "s|'YOUR_WEB_APP_URL_HERE'|'YOUR_HEBREW_URL_HERE'|g" mobile-he.html

# Update tracking URLs in all files
sed -i '' "s|YOUR_TRACKING_SCRIPT_ID|YOUR_TRACKING_ID|g" index.html
sed -i '' "s|YOUR_TRACKING_SCRIPT_ID|YOUR_TRACKING_ID|g" index-he.html
sed -i '' "s|YOUR_TRACKING_SCRIPT_ID|YOUR_TRACKING_ID|g" mobile.html
sed -i '' "s|YOUR_TRACKING_SCRIPT_ID|YOUR_TRACKING_ID|g" mobile-he.html
```

---

## 📊 STEP 3: Update Google Sheets Structure

Open your registration spreadsheet:
https://docs.google.com/spreadsheets/d/1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M

### Add New Columns:

1. **Insert "Registration ID" column**
   - Right-click column B header
   - Select "Insert 1 column left"
   - This will shift all other columns right
   - Set B1 header to: `Registration ID`

2. **Add "Payment Status" column**
   - Go to the last column (after "Additional Info")
   - Add header: `Payment Status`

### Final Column Structure:
```
A: Timestamp
B: Registration ID (NEW!)
C: Parent Name
D: Email
E: Phone
F: Children (JSON)
G: Payment Plan
H: Payment Method
I: Total Price
J: Language
K: Referral Source
L: Preferred Contact
M: Additional Info
N: Payment Status (NEW!)
```

### Lead Tracking Sheet:
This will be created automatically on first tracking event. No action needed!

---

## ✅ STEP 4: Test All Scenarios

### Test 1: New User + Free Trial ✓
**Expected:** Registration succeeds, email shows "First Lesson FREE" banner

1. Open your website (desktop or mobile)
2. Start registration with a NEW email (e.g., `test1@example.com`)
3. Add one child
4. Select "Free Trial" payment plan
5. Complete registration

**Verify:**
- [ ] Registration succeeds
- [ ] Success page shows registration ID (e.g., REG-1234567890-ABC123XYZ)
- [ ] Email received at test email
- [ ] Email shows "First Lesson FREE" banner
- [ ] Email shows ₪0 payment section
- [ ] Email shows registration ID
- [ ] BCC received at raphael@aikidz.club
- [ ] Google Sheet row has:
  - Registration ID in column B
  - "Free Trial" in Payment Status column
- [ ] Lead Tracking sheet has session entry with "Completed" status

---

### Test 2: New User + Paid Plan ✓
**Expected:** Registration succeeds, email shows banner AND payment details

1. Use a DIFFERENT new email (e.g., `test2@example.com`)
2. Add one child
3. Select "Monthly" payment plan
4. Select payment method (Bit/PayBox/etc.)
5. Complete registration

**Verify:**
- [ ] Registration succeeds
- [ ] Success page shows registration ID
- [ ] Email shows "First Lesson FREE" banner
- [ ] Email shows actual price (e.g., ₪599)
- [ ] Email shows payment method instructions
- [ ] BCC received
- [ ] Google Sheet has Registration ID and "Pending" status
- [ ] Lead Tracking shows completion

---

### Test 3: Existing User + Duplicate Free Trial ❌
**Expected:** ERROR - Registration blocked

1. Use the SAME email from Test 1 (e.g., `test1@example.com`)
2. Try to register again
3. Select "Free Trial" again

**Verify:**
- [ ] Error banner appears on webpage
- [ ] Error message: "You have already used your free trial. Please select a paid plan to continue."
- [ ] Registration does NOT proceed
- [ ] NO new row in Google Sheets
- [ ] NO email sent
- [ ] Lead Tracking shows abandoned session

---

### Test 4: Existing User + Paid Plan ✓
**Expected:** Registration succeeds, NO "First Lesson FREE" banner

1. Use the SAME email from Test 1 (e.g., `test1@example.com`)
2. Try to register again
3. Select "Monthly" paid plan this time

**Verify:**
- [ ] Registration succeeds
- [ ] Success page shows NEW registration ID
- [ ] Email does NOT show "First Lesson FREE" banner (IMPORTANT!)
- [ ] Email shows actual price and payment instructions
- [ ] BCC received
- [ ] Google Sheet has new row with new Registration ID
- [ ] Lead Tracking shows completion

---

### Test 5: Email Validation ❌
**Expected:** ERROR - Invalid email rejected

1. Start new registration
2. Enter invalid email (e.g., `notanemail`, `test@`, `@example.com`)
3. Try to submit

**Verify:**
- [ ] Error banner appears
- [ ] Error message: "Please provide a valid email address."
- [ ] Registration does NOT proceed
- [ ] NO row in Google Sheets
- [ ] NO email sent

---

### Test 6: Lead Tracking (Partial Registration)

**Expected:** Abandoned sessions tracked for follow-up

1. Start new registration with new email
2. Complete Step 1 (parent info)
3. Click "Continue" to Step 2
4. **Close the browser tab** (abandon registration)
5. Wait 30 seconds
6. Check Google Sheets

**Verify:**
- [ ] Lead Tracking sheet exists
- [ ] Session entry present with:
  - Unique Session ID
  - Latest timestamp
  - "Step 1" or "Step 2" completed
  - Parent email (if entered)
  - Status: "In Progress" (English) or "בתהליך" (Hebrew)
  - Empty "Completion Time"

---

### Test 7: Multiple Children

**Expected:** Discount applied, all children registered

1. New email (e.g., `test7@example.com`)
2. Add 3 children
3. Select paid plan
4. Complete registration

**Verify:**
- [ ] Total price shows family discount (10% for 2nd, 15% for 3rd+)
- [ ] Email lists all 3 children
- [ ] Google Sheet has all children in JSON format
- [ ] Registration ID generated

---

### Test 8: Hebrew Version

**Expected:** All features work with Hebrew text

1. Open Hebrew website version (`mobile-he.html` or `index-he.html`)
2. Complete registration (any scenario)

**Verify:**
- [ ] Error messages in Hebrew
- [ ] Success page in Hebrew with RTL layout
- [ ] Email subject in Hebrew
- [ ] Email content in Hebrew with RTL
- [ ] Registration ID displayed properly
- [ ] Lead Tracking has Hebrew step names ("שלב 1", "שלב 2")

---

## 🔍 Troubleshooting

### Issue: "Script not found" or 404 error
**Solution:**
- Verify script is deployed as "Web App" not "API Executable"
- Check "Who has access" is set to "Anyone"
- Make sure you copied the `/exec` URL, not the script editor URL

### Issue: No email received
**Solution:**
- Check spam folder
- Verify GmailApp.sendEmail has correct permissions
- Check Google Apps Script execution log for errors
- Verify email address is valid

### Issue: Registration ID not showing
**Solution:**
- Verify Column B exists in Google Sheets
- Check HTML files have updated GOOGLE_SHEETS_WEB_APP_URL
- Clear browser cache and retry
- Check browser console for JavaScript errors

### Issue: Lead Tracking not working
**Solution:**
- Verify Lead Tracking script is deployed
- Check TRACKING_URL is updated in HTML files
- Open browser console to see tracking errors
- Script will auto-create "Lead Tracking" sheet on first use

### Issue: "First Lesson FREE" banner showing for existing users
**Solution:**
- Verify `checkExistingUser()` function in Google Apps Script
- Check email/name/child matching logic
- Verify Google Sheet has previous registrations

---

## 📈 Monitoring & Analytics

### Google Sheets Dashboards

**Registration Summary:**
```
=COUNTIF(N:N, "Free Trial")  // Count free trials
=COUNTIF(N:N, "Pending")      // Count paid registrations
=COUNTA(B:B)-1                // Total registrations
```

**Lead Conversion Rate:**
```
=COUNTIF(H:H, "Completed") / COUNTA(A:A) * 100
// Shows % of started registrations that completed
```

**Duplicate Prevention:**
```
=COUNTIF(D:D, D2)
// Shows if email appears multiple times
```

---

## 🎉 Success Criteria

Your deployment is successful when:

- [x] All 3 Google Apps Scripts deployed and URLs copied
- [x] All 4 HTML files updated with correct URLs
- [x] Google Sheets has Registration ID and Payment Status columns
- [x] Test 1 passes (new user + free trial)
- [x] Test 2 passes (new user + paid plan)
- [x] Test 3 passes (duplicate free trial BLOCKED)
- [x] Test 4 passes (existing user upgrade allowed, NO banner)
- [x] Test 5 passes (email validation working)
- [x] Test 6 passes (lead tracking functional)
- [x] Test 7 passes (multiple children working)
- [x] Test 8 passes (Hebrew version working)
- [x] BCC emails arriving at raphael@aikidz.club
- [x] Registration IDs generated and displayed
- [x] Lead Tracking sheet created and populating

---

## 📞 Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check Google Apps Script execution logs
3. Verify all URLs are updated correctly
4. Test with a fresh incognito window
5. Contact developer if issues persist

---

**Deployment Date:** _________________
**Tested By:** _________________
**All Tests Passed:** ☐ Yes ☐ No
**Production Ready:** ☐ Yes ☐ No

---

*Generated with Claude Code - Registration System v2.0*
