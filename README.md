# AI Club Raanana - Website Documentation

## 🌐 File Structure & Naming Convention

### Naming Pattern
`[page]-[device]-[language].html`

**Components:**
- `[page]`: Page identifier (index, pricing, curriculum, etc.)
- `[device]`: Optional - `desktop` or `mobile` suffix
- `[language]`: Optional - `-he` suffix for Hebrew

---

## 📁 Current File Structure

### English Pages

#### Desktop (index.html serves as desktop home)
- **index.html** - English desktop homepage
- **pricing.html** - English desktop pricing page
- **curriculum.html** - English desktop curriculum page (NEW)

#### Mobile
- **mobile.html** - English mobile homepage
- **pricing-mobile.html** - English mobile pricing page
- **curriculum-mobile.html** - English mobile curriculum page

### Hebrew Pages

#### Mobile
- **mobile-he.html** - Hebrew mobile homepage
- **pricing-he.html** - Hebrew mobile pricing (currently named, should be pricing-mobile-he.html)
- **curriculum-he.html** - Hebrew curriculum page

#### Desktop (not yet created)
- *(index-he.html - Hebrew desktop homepage - if needed)*
- *(pricing-desktop-he.html - Hebrew desktop pricing - if needed)*

---

## ⚠️ PARALLEL DEVELOPMENT RULE

**CRITICAL:** All changes must be made in parallel across language versions!

### When you make changes:

1. **Mobile English** → **Also update Mobile Hebrew**
   - `mobile.html` ↔️ `mobile-he.html`
   - `pricing-mobile.html` ↔️ `pricing-he.html` (pricing-mobile-he.html)

2. **Desktop English** → **Also update Desktop Hebrew (if exists)**
   - `index.html` ↔️ *(index-he.html)*
   - `pricing.html` ↔️ *(pricing-desktop-he.html)*

3. **Content Updates:**
   - Pricing changes
   - Feature additions
   - Layout modifications
   - Navigation updates
   - CTA buttons
   - Forms

### Examples:

✅ **CORRECT:**
```
Change pricing in pricing-mobile.html
→ ALSO change pricing in pricing-he.html
```

✅ **CORRECT:**
```
Add new section to mobile.html
→ ALSO add same section to mobile-he.html (translated)
```

❌ **WRONG:**
```
Update only pricing-mobile.html
→ Forget to update pricing-he.html
```

---

## 📋 Page Descriptions

### Homepage
- **index.html** - Desktop homepage (default, LTR)
- **mobile.html** - Mobile homepage (English, LTR)
- **mobile-he.html** - Mobile homepage (Hebrew, RTL)

### Pricing Pages
- **pricing.html** - Desktop pricing with detailed comparison table
- **pricing-mobile.html** - Mobile-optimized pricing with simple layout (NEW)
- **pricing-he.html** - Hebrew mobile pricing (should be renamed to pricing-mobile-he.html)

### Curriculum Pages
- **curriculum.html** - English desktop curriculum details (NEW)
- **curriculum-mobile.html** - English mobile curriculum details
- **curriculum-he.html** - Hebrew curriculum details

---

## 💰 Current Pricing Structure (Early Bird)

**All pages must reflect these prices:**

- **Monthly:** ₪749 → **₪599/month** (20% off)
- **Quarterly:** ₪649 → **₪519/month** (20% off) - MOST POPULAR
- **Annual:** ₪599 → **₪479/month** (20% off)

**Family Discounts:**
- 2nd child: 10% off
- 3rd child+: 15% off

---

## 🔗 Navigation Links

### Desktop Navigation (index.html)
- Pricing link → `pricing.html`

### Mobile Navigation (mobile.html)
- View Pricing button → `pricing-mobile.html` ✅
- Pricing menu link → `pricing-mobile.html` ✅
- CTA button → `pricing-mobile.html` ✅

### Hebrew Mobile Navigation (mobile-he.html)
- View Pricing button (צפה במחירים) → `pricing-he.html`
- Pricing menu link (מחירים) → `pricing-he.html`

### Cross-Language Links
- English ↔️ Hebrew switcher on all pages

---

## 🎨 Design Consistency

### Mobile Pages
- Simple fixed header with back button
- Centered branding
- Register/CTA button in header
- Mobile-optimized pricing cards
- Countdown timer
- Single-column layout

### Desktop Pages
- Full navigation bar
- Multi-column layouts
- Detailed comparison tables
- More elaborate animations

---

##  📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

---

## 🚀 Deployment Checklist

Before pushing changes:

- [ ] Updated both English and Hebrew versions
- [ ] Verified pricing is correct (₪599, ₪519, ₪479)
- [ ] Tested all navigation links
- [ ] Checked mobile responsiveness
- [ ] Verified countdown timer works
- [ ] Tested form submissions
- [ ] Checked cross-language switchers
- [ ] Verified all CTA buttons link correctly

---

## 📝 Version History

- **2025-10-08:** Created desktop curriculum.html and renamed mobile version to curriculum-mobile.html
- **2025-10-08:** Added Curriculum link to desktop and mobile navigation
- **2025-01-08:** Created README.md and pricing-mobile.html
- **2025-01-08:** Updated navigation links in mobile.html
- **2025-01-08:** Established parallel development rule

---

## 🔄 Future File Naming (Recommended)

To maintain consistency, consider renaming:

**Current → Recommended:**
- `pricing-he.html` → `pricing-mobile-he.html`
- `mobile-he.html` → stays the same ✅
- `mobile.html` → stays the same ✅

**If creating desktop Hebrew:**
- NEW: `index-he.html` (Hebrew desktop homepage)
- NEW: `pricing-desktop-he.html` (Hebrew desktop pricing)

---

## 📞 Support

For questions about the website structure or development:
- Check this README first
- Review existing page structures
- Follow the parallel development rule
- Test on both mobile and desktop

---

**Last Updated:** January 8, 2025
**Maintained By:** AI Club Development Team
