# Deployment Tracker - AI Kidz Club

**Last Updated:** October 8, 2025

This document tracks all changes that have been committed to git but are **waiting for Vercel deployment**.

---

## 🚨 Vercel Deployment Limit Issue

**Status:** Hit free tier limit (100 deployments/day)
**Next Available Deployment:** ~4 hours from last attempt
**Alternative:** Upgrade to Pro ($20/month) for unlimited deployments

---

## ✅ Changes Committed & Ready to Deploy

### **1. Curriculum Page Transparency Fix** (Commit: a8173c8, a077dc7)
**What Changed:**
- Fixed overly transparent containers on curriculum page
- Changed all `bg-black/20` to `bg-black/40` to match pricing page
- Added dark background overlay `rgba(0, 0, 0, 0.6)` for better readability

**Files Modified:**
- `public/curriculum.html`

**Expected Result:** Text containers on curriculum page will be darker and more readable, matching the pricing page design

**Priority:** HIGH - Visual consistency issue

---

### **2. FAQ Page Created** (Commit: 3ff2bbc)
**What Changed:**
- Created comprehensive FAQ page with 25+ questions
- Accordion-style expandable answers
- Covers: General info, age groups, pricing, schedule, safety, outcomes, registration
- Matches pricing page design (dark, blurred containers)

**Files Created:**
- `public/faq.html`

**Files Modified:**
- `public/index.html` - Added FAQ link in footer
- `public/curriculum.html` - Added FAQ link in footer
- `public/pricing.html` - Added FAQ link in footer

**Expected Result:**
- FAQ page accessible at `https://www.aikidz.club/faq.html`
- Footer links on all main pages now work for FAQ

**Priority:** HIGH - Important for parent questions

---

### **3. Removed Old Per-Program Pricing** (Commit: 3ff2bbc)
**What Changed:**
- Removed outdated per-program pricing (₪1,200 / ₪1,500 / ₪1,800)
- Updated to subscription-only model (monthly/quarterly/annual)
- Updated Future Leaders description to "advanced apps & AI assistants (higher level)"

**Files Modified:**
- `CLAUDE.md` - Removed price bullets, updated Future Leaders focus
- `public/mobile.html` - Removed pricing from dropdowns, updated price function
- `public/mobile-he.html` - Removed pricing from dropdowns, updated price function

**Expected Result:** No more confusing old pricing shown in mobile registration forms

**Priority:** MEDIUM - Prevents pricing confusion

---

### **4. Privacy Policy Created** (Commits: 356fcaf, 74d9a7a)
**What Changed:**
- Created comprehensive privacy policy (Version 2.0)
- Amendment 13 compliant (Israeli Privacy Protection Law, effective Aug 14, 2025)
- Two versions created:
  - `PRIVACY_POLICY.md` - Full detailed version (1,414 lines)
  - `PRIVACY_POLICY_SIMPLIFIED.md` - Simplified Israeli-only version (313 lines)

**Files Created:**
- `PRIVACY_POLICY.md`
- `PRIVACY_POLICY_SIMPLIFIED.md`

**Files NOT Yet Created:**
- `public/privacy.html` - **NEEDS TO BE CREATED**

**Expected Result:** Privacy policy accessible on website once HTML version created

**Priority:** CRITICAL - Legally required

---

### **5. Terms of Service Created** (Commit: 18bbe62)
**What Changed:**
- Created simplified, parent-friendly Terms of Service
- Israeli Consumer Protection Law compliant
- Addresses home-based service (no fixed physical address)
- Includes Israel-specific emergency clause (war, security situations)

**Files Created:**
- `TERMS_OF_SERVICE.md`

**Files NOT Yet Created:**
- `public/terms.html` - **NEEDS TO BE CREATED**

**Expected Result:** Terms of Service accessible on website once HTML version created

**Priority:** CRITICAL - Legally required

---

## 🔴 PENDING WORK (Not Yet Committed)

### **6. Privacy & Terms HTML Pages**
**Status:** IN PROGRESS
**What Needs to Happen:**
- Convert `PRIVACY_POLICY_SIMPLIFIED.md` → `public/privacy.html`
- Convert `TERMS_OF_SERVICE.md` → `public/terms.html`
- Match design of existing pages (dark background, backdrop-blur-lg, cyan/teal accents)
- Mobile responsive

**Priority:** CRITICAL

---

### **7. Fix Footer Links**
**Status:** PENDING
**What Needs to Happen:**
Update footer on ALL pages to link to new privacy.html and terms.html:
- `public/index.html`
- `public/curriculum.html`
- `public/pricing.html`
- `public/faq.html`
- `public/mobile.html`
- `public/mobile-he.html`
- `public/pricing-he.html`
- `public/curriculum-he.html`

**Current State:** Links go to `href="#"` (nowhere)
**Target State:** Links go to `href="privacy.html"` and `href="terms.html"`

**Priority:** HIGH

---

### **8. Hebrew Translations**
**Status:** PENDING
**What Needs to Happen:**
Create Hebrew versions of:
- FAQ page → `public/faq-he.html`
- Privacy Policy → `public/privacy-he.html`
- Terms of Service → `public/terms-he.html`
- Homepage (if not exists) → `public/index-he.html`

**Existing Hebrew Pages:**
- ✅ `public/mobile-he.html`
- ✅ `public/pricing-he.html`
- ✅ `public/curriculum-he.html`

**Priority:** MEDIUM (nice to have, not legally required)

---

## 📊 Deployment Checklist

Before next Vercel deployment, ensure:

- [ ] All HTML pages created (privacy.html, terms.html)
- [ ] Footer links updated on all pages
- [ ] Test all pages locally
- [ ] Verify mobile responsiveness
- [ ] Check all internal links work
- [ ] Verify FAQ accordion functionality
- [ ] Test privacy/terms page readability

---

## 🔧 How to Deploy to Vercel

### **Option 1: Automatic (Recommended)**
Vercel auto-deploys when you push to main branch on GitHub:
```bash
git push origin main
```
**Issue:** Currently hit 100 deployments/day limit

### **Option 2: Manual via CLI**
```bash
vercel --prod --yes
```
**Issue:** Also subject to deployment limits

### **Option 3: Upgrade Vercel Plan**
- Pro plan: $20/month
- Unlimited deployments
- Speed Insights: Optional $10/month (can disable)

---

## 📝 Deployment Notes

**Last Successful Deployment:** [Unknown - check Vercel dashboard]
**Next Scheduled Deployment:** When limit resets (~4 hours)
**Deployment URL:** https://www.aikidz.club

**Known Issues:**
- Vercel Speed Insights causing $10/month charge (can be disabled in dashboard)
- Free tier deployment limit reached

**Post-Deployment Verification:**
1. Visit https://www.aikidz.club/curriculum.html - Check transparency fix
2. Visit https://www.aikidz.club/faq.html - Verify FAQ page loads
3. Visit https://www.aikidz.club/privacy.html - Verify privacy policy loads (once created)
4. Visit https://www.aikidz.club/terms.html - Verify ToS loads (once created)
5. Test footer links on all pages
6. Test mobile responsiveness
7. Clear browser cache if changes don't appear

---

## 🐛 Known Issues to Monitor

1. **Curriculum page transparency** - Fixed in git, waiting for deployment
2. **Footer links broken** - Will be fixed once privacy.html and terms.html created
3. **Old pricing removed** - Fixed in git, waiting for deployment
4. **Vercel deployment limit** - Consider upgrading or wait for reset

---

**Last Updated:** October 8, 2025
**Next Review:** After next successful Vercel deployment
