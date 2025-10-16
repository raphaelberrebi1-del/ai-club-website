# Curriculum Lead Capture Setup Instructions

This guide will help you set up the curriculum download lead capture system using Google Apps Script.

## 📋 Overview

The system consists of:
1. **Google Apps Script** - Handles form submissions and sends emails
2. **Google Sheet** - Stores lead data
3. **Google Drive** - Hosts PDF curriculum files
4. **Website Forms** - Capture visitor information

---

## Step 1: Set Up Google Sheet

### 1.1 Open Your Existing Spreadsheet
- Go to Google Sheets
- Open your AI Club spreadsheet (ID: `1Am1YhWuQLFq7u0jIVG-JGD3r00NB2n8Mqnm7-lQ2X_M`)

### 1.2 Create "Curriculum Downloads" Sheet
1. Click the `+` button at the bottom to add a new sheet
2. Rename it to: `Curriculum Downloads`
3. Add the following headers in Row 1:
   - **A1**: Timestamp
   - **B1**: Parent Name
   - **C1**: Email
   - **D1**: Program
   - **E1**: Source
   - **F1**: PDF Downloaded

---

## Step 2: Create PDF Curriculum Files

You need to create 3 PDF files (one for each age group):

### 2.1 PDF Structure (12-15 pages each)

**Page 1: Cover Page**
- AI Kidz Club branding
- Program name (e.g., "AI Explorers - Ages 8-10")
- Beautiful design with brand colors

**Page 2: Welcome & Program Overview**
- Welcome message from you (Raphael)
- Program philosophy
- How the 4 quarters build on each other
- Key outcomes by the end of 48 weeks

**Pages 3-5: Quarter 1 (Weeks 1-12)**
- Detailed week-by-week breakdown
- What kids will learn each week
- Activities and projects
- Skills developed

**Pages 6-8: Quarter 2 (Weeks 13-24)**
- Theme/focus for Q2
- Major projects
- Skills progression
- Week-by-week overview

**Pages 9-11: Quarter 3 (Weeks 25-36)**
- Theme/focus for Q3
- Portfolio building activities
- Advanced projects
- Skills mastery

**Pages 12-14: Quarter 4 (Weeks 37-48)**
- Capstone project details
- Showcase event information
- Final achievements
- Skills certification

**Page 15: Next Steps & Call to Action**
- "Ready to enroll?"
- Pricing overview (or link to pricing page)
- Registration link
- Contact information
- Limited spots available (create urgency)

### 2.2 Design Tips
- Use brand colors (cyan, teal, amber)
- Include some visual elements/illustrations
- Make it look professional and valuable
- Use clear headings and structure
- Include the AI Kidz Club logo

### 2.3 Tools for PDF Creation
- **Canva** (easiest, free) - Use templates
- **Google Slides** - Export as PDF
- **Microsoft Word/PowerPoint** - Export as PDF
- **Adobe InDesign** (professional)

---

## Step 3: Upload PDFs to Google Drive

### 3.1 Upload Files
1. Go to Google Drive (drive.google.com)
2. Create a folder called "AI Club Curriculum PDFs"
3. Upload your 3 PDF files:
   - `ai-explorers-curriculum.pdf` (Ages 8-10)
   - `ai-mastery-curriculum.pdf` (Ages 11-13)
   - `ai-leadership-curriculum.pdf` (Ages 14-18)

### 3.2 Get Shareable Links
For each PDF:
1. Right-click the file → "Get link"
2. Change to "Anyone with the link" can view
3. Copy the link
4. Extract the FILE ID from the URL

**Example:**
```
URL: https://drive.google.com/file/d/1ABC123xyz456/view?usp=sharing
FILE ID: 1ABC123xyz456
```

### 3.3 Save the File IDs
You'll need these in the next step:
- Young (8-10): `YOUR_FILE_ID_1`
- Tech (11-13): `YOUR_FILE_ID_2`
- Future (14-18): `YOUR_FILE_ID_3`

---

## Step 4: Set Up Google Apps Script

### 4.1 Open Apps Script Editor
1. Go to script.google.com
2. Click "New Project"
3. Name it: "AI Club Curriculum Downloads"

### 4.2 Copy the Code
1. Open `/Users/raphaelberrebi/AI for Kids/google-apps-script-curriculum.js`
2. Copy all the code
3. Paste it into the Apps Script editor
4. **Replace the placeholder PDF URLs** (lines 48-50):

```javascript
const pdfUrls = {
  'young': 'https://drive.google.com/file/d/YOUR_YOUNG_PDF_ID/view?usp=sharing',
  'tech': 'https://drive.google.com/file/d/YOUR_TECH_PDF_ID/view?usp=sharing',
  'future': 'https://drive.google.com/file/d/YOUR_FUTURE_PDF_ID/view?usp=sharing'
};
```

Replace `YOUR_YOUNG_PDF_ID`, `YOUR_TECH_PDF_ID`, and `YOUR_FUTURE_PDF_ID` with your actual file IDs from Step 3.2.

### 4.3 Test the Email Function
1. In the Apps Script editor, select the function: `testCurriculumEmail`
2. Click "Run"
3. Authorize the script when prompted
4. Check your email (raphael.berrebi.1@gmail.com) to see if the test email arrived

### 4.4 Deploy as Web App
1. Click "Deploy" → "New deployment"
2. Click the gear icon → Select "Web app"
3. Fill in the settings:
   - **Description**: "Curriculum Download Handler"
   - **Execute as**: Me (raphael.berrebi.1@gmail.com)
   - **Who has access**: Anyone
4. Click "Deploy"
5. **COPY THE DEPLOYMENT URL** - It will look like:
   ```
   https://script.google.com/macros/s/ABC123xyz.../exec
   ```

---

## Step 5: Update Website Code

### 5.1 Update curriculum.html
1. Open `/Users/raphaelberrebi/AI for Kids/public/curriculum.html`
2. Find line 1162 (search for `YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL_HERE`)
3. Replace with your actual deployment URL from Step 4.4:

```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec';
```

### 5.2 Update curriculum-mobile.html (when ready)
Same process as above - find and replace the placeholder URL.

---

## Step 6: Test the Complete System

### 6.1 Test on Your Local/Staging Site
1. Open the curriculum page
2. Select an age group
3. Scroll down to the lead capture form
4. Fill in your email address
5. Submit the form
6. Check that:
   - ✅ You see the success message
   - ✅ You receive the email
   - ✅ The PDF link in the email works
   - ✅ The PDF auto-downloads
   - ✅ Data appears in your Google Sheet

### 6.2 Test All Three Age Groups
- Test Young Innovators (8-10) form
- Test Tech Explorers (11-13) form
- Test Future Leaders (14-18) form

---

## Step 7: Monitor & Optimize

### 7.1 Check Your Google Sheet Regularly
- View new leads in the "Curriculum Downloads" sheet
- Export to CSV for email marketing tools (Mailchimp, etc.)

### 7.2 Email Follow-Up Sequence
Set up automated follow-up emails:
- **Day 0**: Curriculum PDF (automatic)
- **Day 3**: FAQ email or "Questions?" check-in
- **Day 7**: Parent testimonial or student success story
- **Day 14**: Registration CTA with special offer

### 7.3 Track Metrics
Monitor:
- Download conversion rate (% of page visitors who download)
- Which age group gets the most downloads
- Email-to-registration conversion rate

---

## 📊 Expected Results

**Conservative estimates:**
- 20-30% of curriculum page visitors will download
- 10-15% of downloaders will eventually register
- Average 50-100 leads per month initially

**Example:**
- 500 curriculum page visits/month
- = 100-150 downloads (20-30%)
- = 10-22 registrations (10-15% of downloads)

---

## 🔧 Troubleshooting

### Forms not submitting?
- Check browser console for JavaScript errors
- Verify the Google Apps Script URL is correct
- Make sure the script is deployed as "Anyone" can access

### Emails not sending?
- Run the `testCurriculumEmail()` function in Apps Script
- Check your Gmail quota (100 emails/day for free accounts)
- Verify the email address in the script

### PDFs not downloading?
- Check that the Google Drive links are set to "Anyone with the link"
- Verify the file IDs are correct in the script
- Test the PDF URLs directly in your browser

### Data not appearing in Google Sheet?
- Check the sheet name is exactly "Curriculum Downloads"
- Verify the spreadsheet ID in the script
- Run `testCurriculumDownload()` in Apps Script

---

## 🎯 Next Steps

1. ✅ Complete Steps 1-6 above
2. Create the PDF curriculum files (can use AI to help!)
3. Test thoroughly before launching
4. Consider A/B testing different CTA copy
5. Set up email nurture sequence
6. Monitor and optimize based on data

---

## 📞 Need Help?

If you get stuck:
1. Check the Apps Script execution logs (View → Executions)
2. Test the individual functions in Apps Script
3. Verify all URLs and IDs are correct
4. Make sure all permissions are granted

---

## ✨ Bonus: Mobile Version

Once the desktop version is working, apply the same changes to `curriculum-mobile.html`:
- Same forms
- Same JavaScript
- Mobile-optimized layout (already planned)

The mobile version will work identically - same Google Apps Script, same sheet, same PDFs!

---

**Good luck! This system will generate high-quality leads for your AI Club.** 🚀
