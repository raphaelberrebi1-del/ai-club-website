# Google Apps Script - Curriculum Email Setup Instructions

## 📋 Overview

This script sends the complete curriculum HTML files directly in emails when visitors download them from your website.

**✅ All curriculum HTMLs are pre-embedded and optimized for email delivery!**

## 🚀 Quick Setup (Recommended)

### Use the Pre-Built Script

**The easiest way:** Use `google-apps-script-curriculum-MINIFIED.js` - it's ready to copy-paste!

1. **Open Google Apps Script:**
   - Go to https://script.google.com
   - Open your existing "AI Kidz Club - Curriculum Download" project (or create new)

2. **Copy the Complete Script:**
   - Open `google-apps-script-curriculum-MINIFIED.js`
   - Select All (Cmd/Ctrl + A)
   - Copy (Cmd/Ctrl + C)

3. **Paste into Google Apps Script:**
   - Delete any existing code in the editor
   - Paste the copied script
   - Save (Cmd/Ctrl + S)

4. **Deploy as Web App:**
   - Click **Deploy** → **New deployment**
   - Select type: **Web app**
   - Settings:
     - **Execute as:** Me
     - **Who has access:** Anyone
   - Click **Deploy**
   - Copy the deployment URL

5. **Test It:**
   - Run `testAllCurricula()` function
   - Check your email (raphael.berrebi.1@gmail.com)
   - All 3 curricula should arrive complete!

**Done! ✨ No manual HTML insertion needed!**

---

## 📊 What's Included

The pre-built script (`google-apps-script-curriculum-MINIFIED.js`) contains:

- ✅ **Young Explorers (Ages 8-10)** - 47 KB (original)
- ✅ **Teen Champions (Ages 11-13)** - 57 KB (minified)
- ✅ **Future Leaders (Ages 14-18)** - 58 KB (minified)

**All three are fully embedded and optimized for Gmail's email size limits!**

### Why Minified?

Gmail has a ~100 KB limit for HTML email content. The original Teen Champions (108 KB) and Future Leaders (109 KB) files exceeded this limit, causing emails to truncate at the "Family Discounts" section.

**Minification removed whitespace and comments, reducing file size by 47% while preserving all content and visual appearance.**

---

## 🔄 Updating Curriculum Files

If you edit the curriculum HTML files and need to rebuild the script:

### Automatic Method (Recommended)

Run the automation script:

```bash
cd "/Users/raphaelberrebi/AI for Kids"
./minify-and-build.sh
```

This script will:
1. Minify Teen Champions HTML
2. Minify Future Leaders HTML
3. Build new `google-apps-script-curriculum-MINIFIED.js`
4. Report all file sizes

Then copy the new script to Google Apps Script as described above.

### Manual Method

If you need to manually rebuild:

1. **Minify the HTMLs:**
   ```bash
   node minify-html.js pdf-curriculum-teen-champions.html pdf-curriculum-teen-champions-minified.html
   node minify-html.js pdf-curriculum-future-leaders.html pdf-curriculum-future-leaders-minified.html
   ```

2. **Build the Script:**
   ```bash
   node build-google-script-minified.js
   ```

3. **Copy to Google Apps Script** (as described in Quick Setup)

---

## 🧪 Testing

Run these test functions from the Apps Script editor:

### Test Single Curriculum
```javascript
testCurriculumEmail()
```
Sends Young Explorers curriculum to raphael.berrebi.1@gmail.com

### Test All Three Curricula ⭐ Recommended
```javascript
testAllCurricula()
```
Sends all three curricula with 2-second delays between each

**Expected Results:**
- ✅ Young Explorers: Complete email (47 KB)
- ✅ Teen Champions: Complete email (57 KB, minified)
- ✅ Future Leaders: Complete email (58 KB, minified)
- ✅ All emails reach the footer without truncation

### Test Full Flow
```javascript
testCurriculumDownload()
```
Simulates the complete download → logging → email process

---

## 📦 Google Sheet Setup

Create or open the spreadsheet with ID: `1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M`

Create a sheet named **"Curriculum Downloads"** with these columns:
- **A:** Timestamp
- **B:** Parent Name
- **C:** Email
- **D:** Program (young/tech/future)
- **E:** Source Page
- **F:** PDF Downloaded

---

## ✅ What Parents Will Receive

When a parent downloads a curriculum, they'll receive:

- ✨ Beautiful, fully-formatted HTML email with the complete curriculum
- 📅 All 48 weeks of curriculum content
- 🎨 Color-coded quarters (Q1, Q2, Q3, Q4)
- 🔗 Clickable WhatsApp and email contact links
- 📱 Mobile-responsive design
- 🎯 Call-to-action button to register
- 📧 **No truncation** - complete curriculum from header to footer!

---

## 🔧 Troubleshooting

### Email not sending?
- Check execution logs in Apps Script (View → Logs)
- Verify GmailApp permissions are granted
- Test with `testCurriculumEmail()` first
- Check spam folder

### Emails truncating at "Family Discounts"?
- Make sure you're using `google-apps-script-curriculum-MINIFIED.js`
- The original curriculum files are too large for email
- The minified versions solve this issue

### HTML looks broken in email?
- The minified HTML is tested and validated
- If issues occur, check execution logs for errors
- Test with `testAllCurricula()` to see all three

### Need to update curriculum content?
- Edit the original HTML files (not the minified ones)
- Run `./minify-and-build.sh` to rebuild everything
- Copy new script to Google Apps Script

---

## 📦 File Structure

```
AI for Kids/
├── google-apps-script-curriculum-MINIFIED.js    # ⭐ USE THIS - Ready to copy-paste
├── minify-and-build.sh                          # Automation script for updates
├── minify-html.js                               # HTML minification utility
├── build-google-script-minified.js              # Script builder utility
│
├── pdf-curriculum-young-explorers.html          # Original HTML (47 KB)
├── pdf-curriculum-teen-champions.html           # Original HTML (108 KB)
├── pdf-curriculum-future-leaders.html           # Original HTML (109 KB)
│
├── pdf-curriculum-teen-champions-minified.html  # Minified (57 KB)
├── pdf-curriculum-future-leaders-minified.html  # Minified (58 KB)
│
└── GOOGLE-APPS-SCRIPT-CURRICULUM-INSTRUCTIONS.md  # This file
```

**Files to edit:** Original HTML files only
**Files to use:** `google-apps-script-curriculum-MINIFIED.js`
**Files to ignore:** All other intermediate files (auto-generated)

---

## 🎯 Next Steps

After setup:
1. ✅ Test all three curriculum emails with `testAllCurricula()`
2. ✅ Verify all emails are complete (check footer appears)
3. ✅ Update your website download buttons to point to the deployment URL
4. ✅ Monitor the "Curriculum Downloads" sheet to see downloads
5. ✅ Follow up with interested parents!

---

## 💡 Technical Details

### Email Size Limits
- Gmail HTML limit: ~100 KB
- Young Explorers: 47 KB ✅ (no minification needed)
- Teen Champions: 108 KB → 57 KB ✅ (47% reduction)
- Future Leaders: 109 KB → 58 KB ✅ (47% reduction)

### Minification Process
- Removes whitespace between tags
- Removes HTML comments
- Preserves all content and inline styles
- Maintains email client compatibility
- Visual appearance unchanged

### Why This Approach?
- **Complete curriculum in email** - No external links required
- **Reliable delivery** - Under Gmail size limits
- **Professional appearance** - Fully formatted HTML
- **Easy maintenance** - Simple rebuild process
- **Automated workflow** - One command updates everything

---

**Need help?** Check the test functions and execution logs in Google Apps Script for debugging.

**Questions?** Contact raphael@aikidz.club
