# 🚀 Complete Unified Google Apps Script - Ready to Deploy!

## ✅ What You Have

**File:** `google-apps-script-UNIFIED-COMPLETE.js`
**Size:** 2,392 lines
**Status:** 100% Complete - Ready to Copy & Paste!

This is a **single, complete file** containing:
- ✅ Registration handler (English & Hebrew)
- ✅ Curriculum download handler (English & Hebrew)
- ✅ Smart routing logic
- ✅ All 6 HTML email templates (fully embedded)
- ✅ Test functions
- ✅ Group data API

## 📋 What's Included

### Core Functions (23 total):
1. `doPost()` - Main entry point with routing logic
2. `handleRegistration()` - Processes registration requests
3. `handleCurriculumDownload()` - Processes curriculum downloads
4. `sendCurriculumEmail()` - Sends English curriculum emails
5. `sendCurriculumEmailHebrew()` - Sends Hebrew curriculum emails
6. Helper functions for groups, assignments, etc.

### HTML Email Templates (6 total):
**English:**
- `getYoungExplorersHTML()` - Complete Young Explorers curriculum
- `getTeenChampionsHTML()` - Complete Teen Champions curriculum
- `getFutureLeadersHTML()` - Complete Future Leaders curriculum

**Hebrew:**
- `getYoungExplorersHTMLHebrew()` - Complete Young Explorers curriculum (עברית)
- `getTeenChampionsHTMLHebrew()` - Complete Teen Champions curriculum (עברית)
- `getFutureLeadersHTMLHebrew()` - Complete Future Leaders curriculum (עברית)

### Test Functions (3):
- `testRegistrationEmail()` - Test registration confirmation
- `testEnglishCurriculumEmail()` - Test English curriculum download
- `testHebrewCurriculumEmail()` - Test Hebrew curriculum download

---

## 🎯 Quick Deployment Steps

### 1. Open Google Apps Script
Go to: https://script.google.com

### 2. Create New Project or Open Existing
- **New:** Click "+ New project"
- **Existing:** Open your current project

### 3. Copy & Paste Complete Script
1. Open `google-apps-script-UNIFIED-COMPLETE.js`
2. Select ALL (Cmd+A / Ctrl+A)
3. Copy (Cmd+C / Ctrl+C)
4. Paste into Google Apps Script editor
5. Save (Cmd+S / Ctrl+S)

### 4. Test Functions (Optional but Recommended)
Run each test function from the editor:
```
1. Select: testRegistrationEmail
   Click: Run ▶️
   Check: Your email for registration confirmation

2. Select: testEnglishCurriculumEmail
   Click: Run ▶️
   Check: Your email for English curriculum

3. Select: testHebrewCurriculumEmail
   Click: Run ▶️
   Check: Your email for Hebrew curriculum (RTL text)
```

### 5. Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Click gear icon ⚙️ → Select **Web app**
3. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Copy the deployment URL**

### 6. Update Website (If Needed)
Your website already points to:
```
AKfycbyd2JQh1w7_TjO2In9KJFt_U3lReXLv2ITJMyEoSrDiUQ3w6se0DtiOYo7_W_chgwNM5g
```

If your new deployment has a different ID, update these 6 files:
- `public/index.html` (line 4083)
- `public/index-he.html` (line 4183)
- `public/mobile.html` (line 1585)
- `public/mobile-he.html` (line 1801)
- `public/curriculum.html` (line 1342)
- `public/curriculum-he-desktop.html` (line 1381)

---

## 🧪 Testing Checklist

After deployment, test all 4 scenarios:

### ✅ Registration (English)
1. Go to: `https://www.aikidz.club`
2. Fill out registration form
3. Submit
4. Verify:
   - ✅ Data appears in Google Sheets → `Registrations`
   - ✅ Confirmation email received (English)

### ✅ Registration (Hebrew)
1. Go to: `https://www.aikidz.club/index-he.html`
2. Fill out registration form
3. Submit
4. Verify:
   - ✅ Data appears in Google Sheets → `Registrations`
   - ✅ Confirmation email received (Hebrew)

### ✅ Curriculum Download (English)
1. Go to: `https://www.aikidz.club/curriculum.html`
2. Fill out form (any program)
3. Submit
4. Verify:
   - ✅ Data appears in Google Sheets → `Curriculum Downloads`
   - ✅ Email received with **English** curriculum
   - ✅ Language column shows: `en`

### ✅ Curriculum Download (Hebrew)
1. Go to: `https://www.aikidz.club/curriculum-he-desktop.html`
2. Fill out form (any program)
3. Submit
4. Verify:
   - ✅ Data appears in Google Sheets → `Curriculum Downloads`
   - ✅ Email received with **Hebrew** curriculum (RTL text)
   - ✅ Language column shows: `he`

---

## 🔍 How It Works

### Request Flow:

```
Website Form Submitted
        ↓
    doPost() receives request
        ↓
    Parse JSON data
        ↓
        ├─→ Has `children` field?
        │   → handleRegistration()
        │   → Save to Registrations sheet
        │   → Send confirmation email
        │
        └─→ Has `program` field?
            → handleCurriculumDownload()
            → Save to Curriculum Downloads sheet
            → Check `language` field
                ↓
                ├─→ language === 'he'?
                │   → sendCurriculumEmailHebrew()
                │   → Send Hebrew HTML email
                │
                └─→ else
                    → sendCurriculumEmail()
                    → Send English HTML email
```

### Data Structures:

**Registration Request:**
```javascript
{
  children: [{name, program, price}],
  parent: {name, email, phone},
  totalPrice: 599,
  paymentMethod: "bit"
}
```

**Curriculum Download Request:**
```javascript
{
  name: "Parent Name",
  email: "parent@example.com",
  program: "young" | "tech" | "future",
  source: "desktop" | "mobile",
  language: "en" | "he"  // ← This determines email language!
}
```

---

## 📊 Google Sheets Structure

### Sheet: `Registrations`
Columns:
- A: Timestamp
- B: Parent Name
- C: Parent Email
- D: Parent Phone
- E: Child Name
- F: Program
- G: Price
- H: Group ID
- I: Registration Status
- J: Payment Status
- K: Total Price
- L: Payment Method
- M: Timestamp

### Sheet: `Curriculum Downloads`
Columns:
- A: Timestamp
- B: Parent Name
- C: Email
- D: Program (young/tech/future)
- E: Source (desktop/mobile)
- F: **Language (en/he)** ← NEW COLUMN!
- G: PDF Downloaded (TRUE)

### Sheet: `Groups`
Columns:
- A: Group ID
- B: Day
- C: Time
- D: Age Range
- E: Start Date
- F: End Date
- G: Current Count
- H: Max Capacity
- I: Status
- J: Cohort Number

---

## 🐛 Troubleshooting

### Hebrew form sends English email
**Problem:** `language` field not being sent
**Solution:** Verify these files have `<input type="hidden" name="language" value="he">`:
- `public/curriculum-he-desktop.html` (lines 726, 901, 1077)

### All forms send English email
**Problem:** Script not checking `data.language`
**Solution:** Verify `handleCurriculumDownload()` function has language routing (around line 220)

### "Cannot read properties of undefined (reading 'length')"
**Problem:** Wrong script deployed (registration-only instead of unified)
**Solution:** Deploy `google-apps-script-UNIFIED-COMPLETE.js`

### Emails not sending
**Problem:** Gmail permissions not granted
**Solution:** Run test functions manually to authorize Gmail access

---

## 📁 File Reference

**Use this file for deployment:**
- ✅ `google-apps-script-UNIFIED-COMPLETE.js` (2,392 lines)

**Source files (for reference only):**
- `google-apps-script-UNIFIED.js` (base template with placeholders)
- `google-apps-script-curriculum-RESPONSIVE.js` (English HTML source)
- `google-apps-script-curriculum-HEBREW.js` (Hebrew HTML source)
- `google-apps-script.js` (old registration-only - ignore)
- `google-apps-script-curriculum.js` (old curriculum-only - ignore)

**Documentation:**
- `DEPLOYMENT-INSTRUCTIONS-UNIFIED.md` (detailed deployment guide)
- `README-UNIFIED-SCRIPT.md` (this file)

---

## ✨ What's Different from Before

### Before (Broken):
- ❌ Registration worked, curriculum downloads crashed
- ❌ No language detection
- ❌ Hebrew forms sent English emails
- ❌ Error: "Cannot read properties of undefined (reading 'length')"

### After (Working):
- ✅ Registration works for both languages
- ✅ Curriculum downloads work for both languages
- ✅ Smart language routing
- ✅ Hebrew forms send Hebrew emails
- ✅ English forms send English emails
- ✅ All in ONE deployment URL

---

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ No console errors in browser
2. ✅ Google Sheets logs show:
   - `🎯 ROUTING → Registration Handler` (for registrations)
   - `🎯 ROUTING → Curriculum Download Handler` (for curriculum)
   - `🇮🇱 Sending Hebrew curriculum email` (for Hebrew)
   - `🇺🇸 Sending English curriculum email` (for English)
3. ✅ Emails arrive in correct language
4. ✅ Google Sheets populated with correct data

---

## 📞 Need Help?

**Check logs:**
- Google Apps Script: View → Logs
- Browser: F12 → Console tab
- Google Sheets: Verify sheet names match exactly

**Common issues:**
- Email permissions: Run test functions to grant access
- Sheet names: Must be exact: `Registrations`, `Curriculum Downloads`, `Groups`
- Language field: Verify HTML forms include `<input type="hidden" name="language" value="he">`

---

**You're ready to deploy!** 🚀

Just copy `google-apps-script-UNIFIED-COMPLETE.js` and paste it into Google Apps Script editor.

No manual HTML insertion needed - everything is already included!
