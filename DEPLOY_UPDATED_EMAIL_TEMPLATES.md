# Deploy Updated Email Templates to Google Apps Script

## 🎯 Objective
Replace the OLD email templates with the NEW updated design that includes:
- ✅ Registration ID section
- ✅ Program start date (November 2nd, 2025)
- ✅ Required items section (laptop, charged, water/snack)
- ✅ "First Lesson FREE" banner (conditional for new users)
- ✅ Clean white background design

## 📋 Files to Deploy

### English Version
**Source File:** `google-apps-script-registration-ENGLISH-UPDATED.js`
**Destination:** Google Apps Script English Registration Project

### Hebrew Version
**Source File:** `google-apps-script-registration-hebrew-UPDATED.js`
**Destination:** Google Apps Script Hebrew Registration Project

---

## 🚀 Deployment Steps

### Step 1: Open Google Apps Script Console
1. Go to: https://script.google.com
2. Sign in with your Google account
3. You should see your list of projects

### Step 2: Deploy English Version

#### 2.1 Open English Registration Project
- Look for project named something like:
  - "AI Kids Club - English Registration"
  - "Registration Script - English"
  - Or similar

#### 2.2 Replace the Code
1. Click on the project to open it
2. You'll see the code editor
3. **Select ALL existing code** (Cmd+A / Ctrl+A)
4. **Delete** the old code
5. Open `google-apps-script-registration-ENGLISH-UPDATED.js` in a text editor
6. **Copy ALL code** from the file
7. **Paste** into Google Apps Script editor
8. **Save** (Cmd+S / Ctrl+S or click Save icon)

#### 2.3 Deploy the Update
1. Click **Deploy** button (top right)
2. Select **Manage deployments**
3. Click the **pencil/edit icon** on your active deployment
4. Under "Version", select **"New version"**
5. Add a description: "Updated email template with registration ID, program start date, required items"
6. Click **Deploy**
7. **IMPORTANT:** Copy the new Web App URL if it changed (you may need to update your website)

### Step 3: Deploy Hebrew Version

#### 3.1 Open Hebrew Registration Project
- Look for project named something like:
  - "AI Kids Club - Hebrew Registration"
  - "Registration Script - Hebrew"
  - Or similar

#### 3.2 Replace the Code
1. Click on the project to open it
2. **Select ALL existing code** (Cmd+A / Ctrl+A)
3. **Delete** the old code
4. Open `google-apps-script-registration-hebrew-UPDATED.js` in a text editor
5. **Copy ALL code** from the file
6. **Paste** into Google Apps Script editor
7. **Save** (Cmd+S / Ctrl+S)

#### 3.3 Deploy the Update
1. Click **Deploy** button (top right)
2. Select **Manage deployments**
3. Click the **pencil/edit icon** on your active deployment
4. Under "Version", select **"New version"**
5. Add a description: "תבנית אימייל מעודכנת עם מזהה רישום, תאריך התחלה, פריטים נדרשים"
6. Click **Deploy**
7. **IMPORTANT:** Copy the new Web App URL if it changed

---

## ✅ Testing the New Email Design

### Test in Google Apps Script Editor

#### English Tests:
1. In the Google Apps Script editor, open the **English project**
2. At the top, change function dropdown to `testConfirmationEmail`
3. Click **Run** button
4. Check your email inbox (raphael@aikidz.club)
5. Verify the email has:
   - ✅ Registration ID: REG-TEST-12345ABC
   - ✅ Program Start Date: November 2nd, 2025
   - ✅ Required items section (orange box)
   - ✅ "First Lesson FREE" banner (green box)
   - ✅ Child information cards
   - ✅ Payment instructions

#### Other English Tests:
- Run `testFreeTrialEmail` - Tests free trial email (₪0)
- Run `testExistingUserEmail` - Tests existing user email (NO "First Lesson FREE" banner)

#### Hebrew Tests:
1. Open the **Hebrew project**
2. Run `testConfirmationEmailHebrew`
3. Check your email inbox
4. Verify same sections as English but in Hebrew with RTL layout

#### Other Hebrew Tests:
- Run `testFreeTrialEmailHebrew` - Tests free trial
- Run `testExistingUserEmailHebrew` - Tests existing user (no banner)

### Test from Website
1. Go to your registration page (English or Hebrew)
2. Fill out a **test registration**
3. Submit the form
4. Check your email
5. Verify the email has the **NEW design** with all sections

---

## 📊 Key Changes in New Email Template

### What's NEW:
1. **Registration ID Section** (lines 220-232 English, 220-232 Hebrew)
   - Light blue gradient box
   - Displays unique registration ID
   - "Save this ID for your records" message

2. **Program Start Notice** (lines 235-247 English, 235-247 Hebrew)
   - Cyan gradient box
   - "First lesson: November 2nd, 2025"
   - "Exact location will be confirmed shortly"

3. **Required Items Section** (lines 250-261 English, 250-261 Hebrew)
   - Orange gradient box
   - "Students MUST Bring:"
   - Laptop/tablet, charged device, water/snack

4. **First Lesson FREE Banner** (lines 264-273 English, 264-273 Hebrew)
   - Green gradient box
   - Only shows for NEW users
   - Conditional: `showFirstLessonFree` parameter

5. **Clean Design**
   - White background instead of dark
   - Modern gradient boxes
   - Professional layout
   - Mobile-responsive

### What's REMOVED from OLD design:
- ❌ Dark background (`#0f172a`)
- ❌ Group assignment table (replaced with simpler cards)
- ❌ "What Happens Next" numbered steps section

---

## 🔧 Troubleshooting

### "Script not found" Error
- **Cause:** Wrong project selected
- **Solution:** Make sure you're in the correct project (English or Hebrew)

### "Authorization required" Error
- **Cause:** Script needs permission to send emails
- **Solution:** Click "Review Permissions" → Select your account → Allow

### "Deployment failed" Error
- **Cause:** Syntax error in code
- **Solution:** Check that you copied the ENTIRE file correctly

### Email Still Shows Old Design
- **Cause:** Old deployment still active or cached
- **Solutions:**
  1. Verify you clicked "New version" in deployment
  2. Check Web App URLs are correct in your website code
  3. Clear browser cache
  4. Wait 1-2 minutes for Google to propagate changes

### Test Email Not Received
- **Cause:** Gmail might have filtered it
- **Solutions:**
  1. Check Spam folder
  2. Check Logs in Google Apps Script: View → Executions
  3. Look for error messages in execution log

---

## 📝 Verification Checklist

After deployment, verify these items:

### English Email ✅
- [ ] Email subject: "Welcome to AI Kids Club - Registration Confirmed!"
- [ ] White background (not dark)
- [ ] Registration ID section visible
- [ ] Program start date: "November 2nd, 2025"
- [ ] Required items section (orange box)
- [ ] "First Lesson FREE" banner (for new users)
- [ ] Child information cards
- [ ] Payment instructions based on method
- [ ] Contact information box
- [ ] Footer: "Empowering the next generation with AI education"

### Hebrew Email ✅
- [ ] Email subject: "ברוכים הבאים למועדון AI לילדים - ההרשמה אושרה!"
- [ ] White background (not dark)
- [ ] RTL layout (right-to-left)
- [ ] Registration ID section (Hebrew text)
- [ ] Program start date: "2 בנובמבר, 2025"
- [ ] Required items section (Hebrew text)
- [ ] "שיעור ראשון בחינם" banner (for new users)
- [ ] Child information cards (RTL)
- [ ] Payment instructions (Hebrew text)
- [ ] Contact information box (RTL)
- [ ] Footer: "מעצימים את הדור הבא עם חינוך AI"

---

## 💡 Important Notes

1. **Web App URLs:** If the deployment creates new URLs, you MUST update them in your website code:
   - `public/index.html` (English desktop)
   - `public/index-he.html` (Hebrew desktop)
   - `public/mobile.html` (English mobile)
   - `public/mobile-he.html` (Hebrew mobile)

2. **BCC to Admin:** All emails automatically BCC raphael@aikidz.club for records

3. **Multiple Children:** The email supports multiple children registrations

4. **Payment Methods:** Supports Bit, PayBox, Bank Transfer, Cash, Check

5. **Free Trial Detection:** Automatically detects free trial registrations (₪0) and adjusts messaging

6. **Existing User Detection:** `showFirstLessonFree` flag prevents showing "First Lesson FREE" banner to existing users

---

## 🆘 Need Help?

If you encounter any issues during deployment:

1. **Check Logs:**
   - Google Apps Script → View → Executions
   - Look for red error messages

2. **Verify Code:**
   - Make sure you copied the ENTIRE file
   - No missing characters or truncated code

3. **Test Functions:**
   - Run the test functions first
   - They send to raphael@aikidz.club
   - Easier to debug than full registration flow

4. **Common Issues:**
   - Authorization errors: Click "Review Permissions" and allow
   - Deployment URL changed: Update website code with new URL
   - Old email still showing: Wait 1-2 minutes, clear cache

---

## ✨ Success Criteria

You'll know the deployment is successful when:

1. ✅ Test functions send emails with NEW design
2. ✅ Registration ID appears in email
3. ✅ "November 2nd, 2025" start date visible
4. ✅ Required items section (orange box) shows
5. ✅ "First Lesson FREE" banner appears for new users
6. ✅ Website registrations send NEW design emails
7. ✅ Both English and Hebrew versions working

---

**Last Updated:** 2025-10-26
**Files Version:** google-apps-script-registration-ENGLISH-UPDATED.js v2.0
**Files Version:** google-apps-script-registration-hebrew-UPDATED.js v2.0
