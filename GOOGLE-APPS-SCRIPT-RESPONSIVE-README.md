# Google Apps Script - Responsive Curriculum Emails

## 📋 Overview

This script sends complete, mobile-optimized curriculum HTML files in emails when visitors download them from your website.

**✅ All curriculum HTMLs are responsive and optimized for both desktop and mobile!**

---

## 🚀 Quick Setup (5 Minutes)

### Use the Pre-Built Responsive Script

**File to use:** `google-apps-script-curriculum-RESPONSIVE.js`

1. **Open Google Apps Script:**
   - Go to https://script.google.com
   - Open your "AI Kidz Club - Curriculum Download" project

2. **Copy the Complete Script:**
   - Open `google-apps-script-curriculum-RESPONSIVE.js`
   - Select All (Cmd/Ctrl + A)
   - Copy (Cmd/Ctrl + C)

3. **Paste into Google Apps Script:**
   - Delete any existing code in the editor
   - Paste the copied script
   - Save (Cmd/Ctrl + S)

4. **Deploy (if not already deployed):**
   - Click **Deploy** → **New deployment**
   - Select type: **Web app**
   - Settings:
     - **Execute as:** Me
     - **Who has access:** Anyone
   - Click **Deploy**

5. **Test It:**
   - Run `testAllCurricula()` function
   - Check your email (raphael.berrebi.1@gmail.com)
   - Test on mobile device (iOS Mail, Gmail app)

**Done! ✨**

---

## 📊 What's Included

The script (`google-apps-script-curriculum-RESPONSIVE.js`) contains:

| Program | Size | Optimization | Mobile Features |
|---------|------|--------------|-----------------|
| **Young Explorers** | 50 KB | Responsive | ✅ Stacked layout, smaller fonts |
| **Teen Champions** | 60 KB | Responsive + Minified | ✅ Stacked layout, smaller fonts |
| **Future Leaders** | 60 KB | Responsive + Minified | ✅ Stacked layout, smaller fonts |

**All three are under Gmail's 100 KB email limit!**

---

## 📱 Mobile vs Desktop Experience

### **Desktop (Screens > 480px)**
```
┌─────────────────────────────────────┐
│  [Logo] AI Kidz Club                │
│         Teen Champions Program       │
├─────────────────────────────────────┤
│  ┌────────┐ ┌──────────┐ ┌────────┐ │
│  │Monthly │ │Quarterly │ │ Annual │ │  ← Side by side
│  │ ₪699  │ │ ₪1,797  │ │ ₪6,588│ │
│  └────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────┘
```

### **Mobile (Screens ≤ 480px)**
```
┌─────────────┐
│   [Logo]    │  ← Centered
│ AI Kidz Club│
│Teen Champions│
├─────────────┤
│ ┌─────────┐ │
│ │ Monthly │ │  ← Stacked
│ │  ₪699   │ │
│ └─────────┘ │
│ ┌─────────┐ │
│ │Quarterly│ │  ← Stacked
│ │ ₪1,797  │ │
│ └─────────┘ │
│ ┌─────────┐ │
│ │ Annual  │ │  ← Stacked
│ │ ₪6,588  │ │
│ └─────────┘ │
└─────────────┘
```

---

## ✨ Responsive Features

### Desktop Experience (Unchanged)
- ✅ Pricing cards: **Side-by-side** (32%, 36%, 32%)
- ✅ Font sizes: **Large** (32px headings, 28px subheadings)
- ✅ Padding: **Generous** (40px, 30px)
- ✅ Header: **Logo + text side-by-side**
- ✅ Layout: **Exactly as before** (0% change)

### Mobile Experience (Optimized)
- ✨ Pricing cards: **Stacked vertically** (100% width)
- ✨ Font sizes: **Readable** (24px headings, 20px subheadings)
- ✨ Padding: **Compact** (20px, 15px)
- ✨ Header: **Logo above text (centered)**
- ✨ Layout: **Mobile-optimized**
- ✨ No horizontal scrolling

---

## 🔄 Updating Curriculum Files

If you edit the curriculum HTML files:

### Automatic Method (Recommended)

Run the complete automation script:

```bash
cd "/Users/raphaelberrebi/AI for Kids"
./build-responsive-complete.sh
```

This script will:
1. ✅ Add responsive CSS to all three curriculum files
2. ✅ Minify Teen Champions and Future Leaders
3. ✅ Build new `google-apps-script-curriculum-RESPONSIVE.js`
4. ✅ Report all file sizes

Then copy the new script to Google Apps Script.

### Manual Method

If you need to manually rebuild:

1. **Add Responsive CSS:**
   ```bash
   node add-responsive-css.js
   ```

2. **Minify Large Files:**
   ```bash
   node minify-html.js pdf-curriculum-teen-champions-responsive.html pdf-curriculum-teen-champions-responsive-minified.html
   node minify-html.js pdf-curriculum-future-leaders-responsive.html pdf-curriculum-future-leaders-responsive-minified.html
   ```

3. **Build Script:**
   ```bash
   node build-google-script-responsive.js
   ```

4. **Copy to Google Apps Script** (as described in Quick Setup)

---

## 🧪 Testing

### Test All Three Curricula ⭐ Recommended
```javascript
testAllCurricula()
```

**Expected Results:**
- ✅ Young Explorers: Complete email
- ✅ Teen Champions: Complete email
- ✅ Future Leaders: Complete email
- ✅ All emails render correctly on desktop
- ✅ All emails render correctly on mobile

### Test on Mobile Devices

1. **iPhone (iOS Mail):**
   - Open email in iOS Mail app
   - Verify pricing cards stack vertically
   - Check fonts are readable
   - Ensure no horizontal scrolling

2. **Android (Gmail app):**
   - Open email in Gmail app
   - Verify pricing cards stack vertically
   - Check fonts are readable
   - Ensure no horizontal scrolling

3. **Desktop:**
   - Open email in Gmail web
   - Verify layout unchanged from before
   - Check pricing cards are side-by-side

---

## ✅ What Parents Will Receive

**Desktop Users (Laptop/Computer):**
- ✨ Beautiful, spacious layout with side-by-side pricing cards
- 📅 All 48 weeks of curriculum content
- 🎨 Color-coded quarters (Q1, Q2, Q3, Q4)
- 🔗 Clickable WhatsApp and email contact links
- 📱 Large, readable fonts

**Mobile Users (Phone/Tablet):**
- ✨ Optimized stacked layout for mobile screens
- 📅 All 48 weeks of curriculum content (same content)
- 🎨 Color-coded quarters (same design)
- 🔗 Clickable contact links (larger touch targets)
- 📱 Readable fonts optimized for mobile
- ⚡ No horizontal scrolling

**Both get the complete curriculum from header to footer!**

---

## 🔧 Troubleshooting

### Email looks cramped on mobile?
- Make sure you're using `google-apps-script-curriculum-RESPONSIVE.js`
- The responsive version has @media queries that activate on mobile
- Test in Gmail app and iOS Mail (most common)

### Desktop layout changed?
- It shouldn't! Desktop experience is identical to before
- @media queries only activate on screens ≤ 480px
- Check browser console for CSS errors

### Emails still truncating?
- Check file sizes: All should be under 100 KB
- Young Explorers: 50 KB ✅
- Teen Champions: 60 KB ✅
- Future Leaders: 60 KB ✅

### Need to update curriculum content?
- Edit the original HTML files (not the responsive/minified ones)
- Run `./build-responsive-complete.sh` to rebuild everything
- Copy new script to Google Apps Script

---

## 📦 File Structure

```
AI for Kids/
├── google-apps-script-curriculum-RESPONSIVE.js  # ⭐ USE THIS
├── build-responsive-complete.sh                 # All-in-one automation
├── add-responsive-css.js                        # Adds @media queries
├── minify-html.js                               # Minification utility
├── build-google-script-responsive.js            # Script builder
│
├── pdf-curriculum-young-explorers.html          # Original (47 KB)
├── pdf-curriculum-teen-champions.html           # Original (108 KB)
├── pdf-curriculum-future-leaders.html           # Original (109 KB)
│
├── pdf-curriculum-young-explorers-responsive.html           # Responsive (50 KB)
├── pdf-curriculum-teen-champions-responsive.html            # Responsive (111 KB)
├── pdf-curriculum-teen-champions-responsive-minified.html   # Final (60 KB)
├── pdf-curriculum-future-leaders-responsive.html            # Responsive (112 KB)
├── pdf-curriculum-future-leaders-responsive-minified.html   # Final (60 KB)
│
└── GOOGLE-APPS-SCRIPT-RESPONSIVE-README.md      # This file
```

**Files to edit:** Original HTML files only (pdf-curriculum-*.html)
**Files to use:** `google-apps-script-curriculum-RESPONSIVE.js`
**Files to ignore:** All intermediate files (auto-generated)

---

## 💡 Technical Details

### Email Size Limits
- Gmail HTML limit: ~100 KB
- Young Explorers: 47 KB → 50 KB ✅ (responsive only)
- Teen Champions: 108 KB → 111 KB → 60 KB ✅ (responsive + minified)
- Future Leaders: 109 KB → 112 KB → 60 KB ✅ (responsive + minified)

### Responsive CSS
```css
@media only screen and (max-width: 480px) {
  .pricing-card {
    width: 100% !important;      /* Stack vertically */
    display: block !important;
  }

  .mobile-heading-xl {
    font-size: 24px !important;  /* Smaller headings */
  }

  .mobile-padding {
    padding: 20px 15px !important; /* Less padding */
  }
}
```

### How It Works
1. **Desktop (> 480px):** @media queries don't apply, original styles show
2. **Mobile (≤ 480px):** @media queries activate, mobile styles override
3. **Email clients:** Modern clients (Gmail, Apple Mail) support @media
4. **Fallback:** Older clients ignore @media, show desktop version

### Why This Approach?
- **Best of both worlds:** Perfect desktop + mobile experience
- **Single codebase:** No separate versions to maintain
- **Industry standard:** @media queries are standard for responsive emails
- **Wide support:** Works in 90%+ of email clients
- **Graceful degradation:** Older clients show desktop version (still works)

---

## 🎯 Next Steps

After setup:
1. ✅ Test all three curriculum emails with `testAllCurricula()`
2. ✅ Verify desktop: Side-by-side pricing cards, large fonts
3. ✅ Verify mobile: Stacked pricing cards, readable fonts
4. ✅ Test on actual mobile devices (iOS, Android)
5. ✅ Update website download buttons (if needed)
6. ✅ Monitor "Curriculum Downloads" sheet
7. ✅ Follow up with interested parents!

---

## 📱 Mobile Testing Checklist

When you test on mobile, verify:

- [ ] Email opens without horizontal scrolling
- [ ] Pricing cards are stacked vertically
- [ ] Fonts are readable (not tiny)
- [ ] Contact links are tappable
- [ ] Images load correctly
- [ ] All content is visible (no truncation)
- [ ] Footer appears at bottom
- [ ] Colors and styling preserved

---

**Need help?** Check the test functions and execution logs in Google Apps Script for debugging.

**Questions?** Contact raphael@aikidz.club

**Version:** Responsive 1.0 - Mobile-optimized curriculum emails
