# 🚀 Unified Google Apps Script Deployment Instructions

## Overview

This unified script handles **ALL** requests to your AI Kidz Club system:
- ✅ Registration requests (English & Hebrew)
- ✅ Curriculum downloads (English)
- ✅ Curriculum downloads (Hebrew)
- ✅ Group capacity data (for website)

**Single deployment URL for everything!**

---

## 📋 Prerequisites

Before deploying, make sure you have:

1. **Google Sheets** with these sheets:
   - `Registrations` (for student registrations)
   - `Groups` (for class groups)
   - `Curriculum Downloads` (for tracking downloads)

2. **Email HTML templates** (you'll paste these into the script):
   - English: Young Explorers, Teen Champions, Future Leaders
   - Hebrew: Young Explorers, Teen Champions, Future Leaders

---

## 🔧 Step 1: Open Google Apps Script Editor

1. Go to [https://script.google.com](https://script.google.com)
2. Open your existing project OR create a new one
3. If you have multiple `.gs` files, you can:
   - **Option A:** Delete old files and create one new file
   - **Option B:** Keep old files but deploy from the new unified file

---

## 📝 Step 2: Copy the Unified Script

1. Open the file: `google-apps-script-UNIFIED.js`
2. **Copy the ENTIRE contents** (all ~900+ lines)
3. Paste into a new `.gs` file in Google Apps Script editor
4. Name it something like: `UnifiedHandler.gs`

---

## 🎨 Step 3: Add HTML Email Templates

You need to add 6 HTML email templates to the script. Look for these functions at the bottom of the script:

### English Templates (lines ~850-880):

```javascript
function getYoungExplorersHTML() {
  return `<!-- INSERT YOUNG EXPLORERS ENGLISH HTML HERE -->`;
}

function getTeenChampionsHTML() {
  return `<!-- INSERT TEEN CHAMPIONS ENGLISH HTML HERE -->`;
}

function getFutureLeadersHTML() {
  return `<!-- INSERT FUTURE LEADERS ENGLISH HTML HERE -->`;
}
```

**Where to get the HTML:**
- Open: `google-apps-script-curriculum-RESPONSIVE.js`
- Find the functions: `getYoungExplorersHTML()`, `getTeenChampionsHTML()`, `getFutureLeadersHTML()`
- Copy the FULL HTML from inside each function
- Paste into the corresponding function in your unified script

### Hebrew Templates (lines ~890-920):

```javascript
function getYoungExplorersHebrewHTML() {
  return `<!-- INSERT YOUNG EXPLORERS HEBREW HTML HERE -->`;
}

function getTeenChampionsHebrewHTML() {
  return `<!-- INSERT TEEN CHAMPIONS HEBREW HTML HERE -->`;
}

function getFutureLeadersHebrewHTML() {
  return `<!-- INSERT FUTURE LEADERS HEBREW HTML HERE -->`;
}
```

**Where to get the HTML:**
- Open: `google-apps-script-curriculum-HEBREW.js`
- Find the Hebrew HTML template functions
- Copy the FULL HTML from inside each function
- Paste into the corresponding function in your unified script

---

## 🧪 Step 4: Test Individual Functions

Before deploying, test each function works:

### Test 1: Registration Email
```javascript
// In Google Apps Script editor, select this function and click "Run"
testRegistrationEmail()
```
✅ Check your email: raphael.berrebi.1@gmail.com

### Test 2: English Curriculum
```javascript
// Select and run this function
testEnglishCurriculumEmail()
```
✅ Check your email for English curriculum

### Test 3: Hebrew Curriculum
```javascript
// Select and run this function
testHebrewCurriculumEmail()
```
✅ Check your email for Hebrew curriculum (should be RTL)

**If any test fails:** Check the logs (View → Logs) to see the error

---

## 🌐 Step 5: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Fill in:
   - **Description:** "Unified handler for registration and curriculum downloads"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. Click **Deploy**
5. **IMPORTANT:** Copy the deployment URL

The URL will look like:
```
https://script.google.com/macros/s/AKfycb.../exec
```

---

## 🔄 Step 6: Update Website Files

You've already done this! Your website files already point to:
```
AKfycbyd2JQh1w7_TjO2In9KJFt_U3lReXLv2ITJMyEoSrDiUQ3w6se0DtiOYo7_W_chgwNM5g
```

**If your new deployment has a different ID:**
1. Update all 6 HTML files again with the new deployment ID:
   - `public/index.html`
   - `public/index-he.html`
   - `public/mobile.html`
   - `public/mobile-he.html`
   - `public/curriculum.html`
   - `public/curriculum-he-desktop.html`

---

## ✅ Step 7: Test End-to-End

### Test Registration (English):
1. Go to: `https://www.aikidz.club`
2. Fill out registration form
3. Submit
4. ✅ Check Google Sheets → `Registrations` tab
5. ✅ Check email for confirmation

### Test Registration (Hebrew):
1. Go to: `https://www.aikidz.club/index-he.html`
2. Fill out registration form
3. Submit
4. ✅ Check Google Sheets
5. ✅ Check email

### Test Curriculum Download (English):
1. Go to: `https://www.aikidz.club/curriculum.html`
2. Fill out form for any program
3. Submit
4. ✅ Check Google Sheets → `Curriculum Downloads` tab
5. ✅ Check email for English curriculum

### Test Curriculum Download (Hebrew):
1. Go to: `https://www.aikidz.club/curriculum-he-desktop.html`
2. Fill out form for any program
3. Submit
4. ✅ Check Google Sheets
5. ✅ Check email for **Hebrew** curriculum (RTL text)

---

## 🐛 Troubleshooting

### Issue: "Cannot read properties of undefined (reading 'length')"
**Cause:** Script doesn't have routing logic
**Fix:** Make sure you deployed the UNIFIED script, not the old registration-only script

### Issue: Hebrew form sends English email
**Cause:** Missing `data.language` check or Hebrew functions
**Fix:** Verify lines 270-285 in unified script have language routing

### Issue: HTML templates return `<!-- INSERT ... -->`
**Cause:** Forgot to paste actual HTML
**Fix:** Go back to Step 3 and paste the full HTML templates

### Issue: Emails not sending
**Cause:** Gmail API permissions
**Fix:** Run test functions manually to authorize Gmail access

---

## 📊 How the Routing Works

```
User submits form
    ↓
doPost() receives request
    ↓
Parses JSON data
    ↓
    ├─→ Has `children` field? → handleRegistration()
    │                             ↓
    │                          Save to Registrations sheet
    │                             ↓
    │                          Send confirmation email
    │
    └─→ Has `program` field?  → handleCurriculumDownload()
                                  ↓
                               Save to Curriculum Downloads sheet
                                  ↓
                               Check `language` field
                                  ↓
                    ├─→ language === 'he'? → sendCurriculumEmailHebrew()
                    │
                    └─→ else → sendCurriculumEmail() (English)
```

---

## 📁 Files Reference

**Your new unified file:**
- `google-apps-script-UNIFIED.js` (use this for deployment)

**Source files for HTML templates:**
- `google-apps-script-curriculum-RESPONSIVE.js` (English templates)
- `google-apps-script-curriculum-HEBREW.js` (Hebrew templates)

**You can now ignore these old files:**
- `google-apps-script.js` (registration only)
- `google-apps-script-curriculum.js` (curriculum only, no Hebrew)

---

## 🎉 Success Checklist

- [ ] Copied unified script to Google Apps Script editor
- [ ] Added all 6 HTML email templates
- [ ] Tested registration email (testRegistrationEmail)
- [ ] Tested English curriculum (testEnglishCurriculumEmail)
- [ ] Tested Hebrew curriculum (testHebrewCurriculumEmail)
- [ ] Deployed as Web App
- [ ] Tested registration from website (English)
- [ ] Tested registration from website (Hebrew)
- [ ] Tested curriculum download (English) - received English email ✅
- [ ] Tested curriculum download (Hebrew) - received HEBREW email ✅

---

## 📞 Need Help?

If you encounter issues:

1. Check Google Apps Script logs: **View → Logs**
2. Check browser console: F12 → Console tab
3. Verify Google Sheets has the correct sheet names
4. Make sure email permissions are granted

**Common log messages:**
- `🎯 ROUTING → Registration Handler` = Registration request detected
- `🎯 ROUTING → Curriculum Download Handler` = Curriculum request detected
- `🇮🇱 Sending Hebrew curriculum email` = Hebrew email being sent
- `🇺🇸 Sending English curriculum email` = English email being sent

---

Good luck! 🚀
