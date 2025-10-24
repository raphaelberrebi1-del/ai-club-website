# Google Apps Script Email Template Deployment Guide

## Overview

This guide explains how to deploy the updated email confirmation templates for AI Kids Club registration system. The updated templates include program start date, location notice, required items, and free trial handling.

---

## What's New

### 7 Major Updates to Email Templates:

1. **Program Start Date Notice**
   - First lesson: November 2nd, 2025
   - Location will be confirmed shortly
   - Prominent cyan gradient banner

2. **Required Items Section**
   - Laptop or tablet (laptop recommended)
   - Device charged (minimum 2-hour battery)
   - Water bottle and snack (optional)
   - Prominent orange gradient banner

3. **First Lesson FREE Highlight**
   - Only shown for paid plans (not free trials)
   - Green gradient banner
   - Emphasizes no-cost first lesson

4. **Check Payment Option**
   - Added check payment instructions
   - Make check payable to: AI Kids Club
   - Can be delivered at first lesson or mailed

5. **Free Trial Handling**
   - Different subject line for free trials
   - No payment instructions section
   - All other information still included

6. **Updated Subject Lines**
   - Free Trial: "Welcome to AI Kids Club - Free Trial Confirmed!"
   - Paid Plans: "Welcome to AI Kids Club - Registration Confirmed!"
   - Hebrew versions included

7. **Plain Text Versions**
   - All updates applied to plain text emails too
   - Ensures compatibility with all email clients

---

## Files Created

### English Script
**File:** `google-apps-script-registration-ENGLISH-UPDATED.js`
- Updated `sendConfirmation()` function
- Test functions: `testConfirmationEmail()`, `testFreeTrialEmail()`

### Hebrew Script
**File:** `google-apps-script-registration-hebrew-UPDATED.js`
- Updated `sendConfirmationHebrew()` function
- RTL layout with proper Hebrew formatting
- Test functions: `testConfirmationEmailHebrew()`, `testFreeTrialEmailHebrew()`

---

## Deployment Instructions

### Step 1: Access Google Apps Script

1. Go to: https://script.google.com
2. Open your existing AI Kids Club registration script
3. **IMPORTANT:** Create a backup first!

### Step 2: Backup Current Script

**Option A: Manual Backup (Recommended)**
1. In Apps Script editor, click **File** → **Make a copy**
2. Rename the copy to: `AI Kids Club Registration - BACKUP [DATE]`
3. Close the backup copy

**Option B: Version History**
1. In Apps Script editor, click **File** → **Version history**
2. Note the current version number
3. You can revert to this version if needed

### Step 3: Update English Email Function

1. Open `google-apps-script-registration-ENGLISH-UPDATED.js` from your local files
2. Copy the **entire `sendConfirmation()` function** (lines 50-262)
3. In Apps Script editor, find your existing `sendConfirmation()` function
4. **Select and replace** the entire function with the new version
5. Make sure NOT to delete other functions like `doPost()` or test functions

### Step 4: Update Hebrew Email Function

1. Open `google-apps-script-registration-hebrew-UPDATED.js` from your local files
2. Copy the **entire `sendConfirmationHebrew()` function** (lines 50-262)
3. In Apps Script editor, find your existing `sendConfirmationHebrew()` function
4. **Select and replace** the entire function with the new version
5. Make sure NOT to delete other functions

### Step 5: Save and Deploy

1. Click **Save project** button (💾 icon)
2. If prompted, authorize the script again
3. Click **Deploy** → **Manage deployments**
4. Click **New deployment** if needed, or **Edit** existing deployment
5. Ensure Web App settings are:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**
7. Copy the new web app URL (it should be the same as before)

---

## Testing Instructions

### Test English Paid Plan Email

1. In Apps Script editor, select function: `testConfirmationEmail`
2. Click **Run** (▶️ button)
3. Check your inbox at: raphael@aikidz.club
4. Verify all 7 new sections appear correctly:
   - ✅ Program start date (November 2nd, 2025)
   - ✅ Location TBD notice
   - ✅ Required items list
   - ✅ "First Lesson FREE" banner
   - ✅ Payment instructions (Bit)
   - ✅ Child information
   - ✅ Contact section

### Test English Free Trial Email

1. In Apps Script editor, select function: `testFreeTrialEmail`
2. Click **Run** (▶️ button)
3. Check your inbox
4. Verify:
   - ✅ Subject says "Free Trial Confirmed!"
   - ✅ Program start date shows
   - ✅ Required items show
   - ✅ NO "First Lesson FREE" banner (since it's already free)
   - ✅ NO payment instructions
   - ✅ Child information shows

### Test Hebrew Paid Plan Email

1. In Apps Script editor, select function: `testConfirmationEmailHebrew`
2. Click **Run** (▶️ button)
3. Check your inbox
4. Verify:
   - ✅ Hebrew subject line: "ברוכים הבאים למועדון AI לילדים - ההרשמה אושרה!"
   - ✅ RTL layout (right-to-left)
   - ✅ Program start date in Hebrew
   - ✅ Required items in Hebrew
   - ✅ "שיעור ראשון בחינם" banner
   - ✅ Payment instructions in Hebrew

### Test Hebrew Free Trial Email

1. In Apps Script editor, select function: `testFreeTrialEmailHebrew`
2. Click **Run** (▶️ button)
3. Check your inbox
4. Verify same as English free trial but in Hebrew

---

## Test Data Used

### English Paid Plan Test
```javascript
{
  parentName: 'Test Parent',
  email: 'raphael@aikidz.club',
  phone: '054-315-9025',
  children: [
    { name: 'Test Child 1', age: 10, program: 'Tech Explorers' },
    { name: 'Test Child 2', age: 8, program: 'Young Innovators' }
  ],
  paymentPlan: 'Monthly',
  paymentMethod: 'bit',
  totalPrice: 450
}
```

### English Free Trial Test
```javascript
{
  parentName: 'Free Trial Parent',
  email: 'raphael@aikidz.club',
  children: [
    { name: 'Trial Child', age: 9, program: 'Young Innovators' }
  ],
  paymentPlan: 'Free Trial',
  paymentMethod: '',
  totalPrice: 0
}
```

---

## Verification Checklist

Before going live, verify these items:

### Visual Appearance
- [ ] All gradient banners display correctly
- [ ] Colors match website design (cyan, orange, green)
- [ ] Hebrew text is right-aligned (RTL)
- [ ] Fonts are readable and properly sized
- [ ] Mobile responsive (test on phone)

### Content Accuracy
- [ ] Date shows: November 2nd, 2025
- [ ] Location notice: "will be confirmed shortly"
- [ ] Required items list has all 3 items
- [ ] Payment methods include all 5 options (Bit, PayBox, Bank Transfer, Cash, Check)
- [ ] Bank details correct: Hapoalim, Branch 689, Account 518748
- [ ] Contact info: raphael@aikidz.club, 054-315-9025
- [ ] No emojis anywhere in the email

### Logic Testing
- [ ] Free trial emails have NO payment section
- [ ] Free trial emails have NO "First Lesson FREE" banner
- [ ] Paid plan emails HAVE payment section
- [ ] Paid plan emails HAVE "First Lesson FREE" banner
- [ ] Subject lines change based on registration type
- [ ] Plain text version includes all info

### All Payment Methods
Test each payment method by temporarily changing `paymentMethod` in test functions:
- [ ] Bit: Shows 054-315-9025 with green gradient
- [ ] PayBox: Shows 054-315-9025 with blue gradient
- [ ] Bank Transfer: Shows Hapoalim 689/518748 with purple gradient
- [ ] Cash: Shows coordination message with orange gradient
- [ ] Check: Shows "AI Kids Club" payable with cyan gradient

---

## Rollback Instructions

If anything goes wrong, you can quickly revert:

### Option 1: Restore from Backup Copy
1. Open your backup script from Step 2
2. Copy the old `sendConfirmation()` function
3. Paste it back into your main script
4. Save and redeploy

### Option 2: Use Version History
1. Click **File** → **Version history**
2. Select the version from before your update
3. Click **Restore this version**
4. Redeploy

---

## Common Issues and Solutions

### Issue 1: Authorization Error
**Symptom:** "Authorization required" when running test
**Solution:**
1. Click **Review permissions**
2. Choose your Google account
3. Click **Advanced** → **Go to [Your Project]**
4. Click **Allow**

### Issue 2: Email Not Received
**Symptom:** Test runs but no email arrives
**Solution:**
1. Check Gmail spam folder
2. Check Apps Script execution log: **View** → **Execution log**
3. Look for error messages
4. Verify email address in test function

### Issue 3: HTML Not Rendering
**Symptom:** Email shows HTML code instead of formatted content
**Solution:**
1. Verify `htmlBody` parameter is set in `GmailApp.sendEmail()`
2. Check for syntax errors in HTML (missing quotes, unclosed tags)
3. Test with plain text version first

### Issue 4: Hebrew Text Shows as Boxes
**Symptom:** Hebrew characters don't display
**Solution:**
1. Verify `<html dir="rtl" lang="he">` in HTML
2. Check encoding: `<meta charset="UTF-8">`
3. Test email client supports UTF-8

---

## Contact for Issues

If you encounter any problems during deployment:

**Email:** raphael@aikidz.club
**Phone/WhatsApp:** +972-54-315-9025

---

## Summary of Changes Made

| Component | Before | After |
|-----------|--------|-------|
| **Program Info** | No start date shown | November 2nd, 2025 + location TBD |
| **Required Items** | Not included | 3-item list with laptop, battery, water |
| **Free Lesson** | Not mentioned | "First Lesson FREE" banner for paid plans |
| **Payment Options** | 4 methods | 5 methods (added checks) |
| **Free Trial Logic** | Same as paid | Different subject + no payment section |
| **Subject Lines** | Generic | Specific to registration type |
| **Plain Text** | Basic | Full feature parity with HTML |

---

## Next Steps After Deployment

1. **Test live registration:**
   - Submit a test registration through website
   - Verify email arrives correctly
   - Test both free trial and paid plan flows

2. **Monitor for issues:**
   - Check Google Sheets for new registrations
   - Verify emails are sending successfully
   - Check Apps Script execution logs daily

3. **Update documentation:**
   - Share this guide with team members
   - Document any customizations made
   - Keep backup scripts updated

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Version:** 2.0 (Email Template Update)
