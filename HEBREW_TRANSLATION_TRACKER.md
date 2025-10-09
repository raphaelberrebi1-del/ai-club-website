# Hebrew Translation Tracker

**Project:** AI Club Website Hebrew Version
**Last Updated:** 2025-10-09
**Status:** In Progress

---

## Translation Decisions

### Brand Name
- **English:** AI Kidz Club / AI Club
- **Hebrew:** AI מועדון (AI followed by מועדון)
- **Note:** "AI" stays in English, followed by Hebrew word for "club"

### Terminology
| English | Hebrew | Notes |
|---------|--------|-------|
| Give Your Child the AI Advantage | תנו לילדכם את היתרון של AI | From mobile-he.html |
| Register Now | הירשם | Standard registration CTA |
| View Pricing | צפה במחירים | Pricing CTA |
| Home | בית | Navigation |
| Curriculum | תוכנית לימודים | Navigation |
| Pricing | מחירים | Navigation |
| FAQ | שאלות נפוצות | Navigation |
| Young Innovators (8-10) | ממציאים צעירים (8-10) | Age group |
| Tech Explorers (11-13) | חוקרי טכנולוגיה (11-13) | Age group |
| Future Leaders (14-18) | מנהיגי העתיד (14-18) | Age group |

---

## Contact Information Format

### Phone Numbers
- **English Pages:** +972-54-315-9025 (international format)
- **Hebrew Pages:** 054-315-9025 (local format, no +972 prefix)
- **RTL Fix:** Numbers display correctly in RTL using proper HTML structure

### Email
- **All Pages:** raphael@aikidz.club (same for both languages)

---

## RTL (Right-to-Left) Layout Patterns

### HTML Tag
```html
<html lang="he" dir="rtl">
```

### Meta Tags
```html
<meta property="og:locale" content="he_IL">
```

### Navigation
- English: Left-aligned, left-to-right order
- Hebrew: Right-aligned, right-to-left order (mirrored)

### Flex Direction
- Reverse flex directions where needed for RTL
- Example: `flex-row-reverse` for Hebrew vs `flex-row` for English

### Number Display in RTL
- Use unicode-bidi controls if needed
- Reference: mobile-he.html implementation
- Phone numbers remain left-to-right even in RTL context

---

## Font Usage
- **Font Family:** Inter (Google Fonts)
- **Weights Used:** 300, 400, 500, 600, 700, 800, 900
- **Note:** Inter font supports Hebrew characters well
- **Fallback:** System fonts handle Hebrew if needed

---

## Page Status

### Completed Pages ✅
- [x] mobile-he.html (Hebrew mobile landing page)
- [x] curriculum-he.html (Hebrew curriculum page)
- [x] pricing-he.html (Hebrew pricing page)
- [x] faq-he.html (Hebrew FAQ page)
- [x] privacy-he.html (Hebrew privacy policy)
- [x] terms-he.html (Hebrew terms of service)

### In Progress 🚧
- [ ] index-he.html (Hebrew desktop landing page) - **CREATING NOW**

### Language Switcher Status

**English Pages (need switcher to Hebrew):**
- [ ] index.html → index-he.html
- [ ] curriculum.html → curriculum-he.html
- [ ] pricing.html → pricing-he.html
- [ ] faq.html → faq-he.html
- [ ] privacy.html → privacy-he.html
- [ ] terms.html → terms-he.html

**Hebrew Pages (need switcher to English):**
- [ ] index-he.html → index.html
- [ ] curriculum-he.html → curriculum.html
- [ ] pricing-he.html → pricing.html
- [ ] faq-he.html → faq.html
- [ ] privacy-he.html → privacy.html
- [ ] terms-he.html → terms.html

---

## Language Switcher Implementation

### Design Pattern (from mobile-he.html)
```html
<!-- Language Toggle Button -->
<a href="mobile.html" class="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="English">
    <span class="text-sm font-bold text-white">EN</span>
</a>
```

### Desktop Header Pattern
**English Pages:** Show "עב" button linking to Hebrew version
**Hebrew Pages:** Show "EN" button linking to English version

### Location
- **Desktop:** Top-right corner of header, next to navigation
- **Mobile:** Top-right corner of mobile header (already implemented in mobile-he.html)

### Styling
- Background: `bg-white/10`
- Hover: `bg-white/20`
- Size: `w-10 h-10`
- Border radius: `rounded-lg`
- Text: Bold, white color

---

## Mobile Redirect Logic

### English Pages (index.html)
```javascript
// Redirect mobile users to mobile.html
if (isMobile && !isTablet && window.innerWidth < 768) {
    if (!window.location.pathname.includes('mobile.html')) {
        window.location.href = '/mobile.html';
    }
}
```

### Hebrew Pages (index-he.html)
```javascript
// Redirect mobile users to mobile-he.html
if (isMobile && !isTablet && window.innerWidth < 768) {
    if (!window.location.pathname.includes('mobile-he.html')) {
        window.location.href = '/mobile-he.html';
    }
}
```

---

## URL Structure

### Pattern
- English: `page.html`
- Hebrew: `page-he.html`
- Example: `index.html` → `index-he.html`

### Canonical URLs
- Each page should reference its language alternate
- Use hreflang tags for SEO

---

## SEO Considerations

### Hreflang Tags (to be added)
```html
<!-- On English pages -->
<link rel="alternate" hreflang="he" href="https://www.aikidz.club/index-he.html">
<link rel="alternate" hreflang="en" href="https://www.aikidz.club/index.html">

<!-- On Hebrew pages -->
<link rel="alternate" hreflang="en" href="https://www.aikidz.club/index.html">
<link rel="alternate" hreflang="he" href="https://www.aikidz.club/index-he.html">
```

---

## Context Preservation Strategy

### If Context Runs Out
1. **Read this file first** - HEBREW_TRANSLATION_TRACKER.md
2. **Check existing Hebrew pages** - mobile-he.html, curriculum-he.html for patterns
3. **Reference decisions** - Brand name, phone format, RTL patterns documented here
4. **Continue from Page Status section** - See what's completed/pending

### Key Files to Reference
- `/public/mobile-he.html` - Complete Hebrew implementation example
- `/public/curriculum-he.html` - Hebrew page structure
- `/public/index.html` - English source for index-he.html
- `CLAUDE.md` - Product requirements and brand info
- `TODO.md` - Overall project tasks

---

## Translation Sources

### Primary Source
- **mobile-he.html** - Use as reference for translations
- Most content already translated and tested

### AI Translation
- Use for missing content not in mobile-he.html
- User will review and correct as needed

### User Provided
- User can provide corrections/refinements
- Update this tracker with approved translations

---

## Testing Checklist

### Visual Testing
- [ ] RTL layout displays correctly
- [ ] Numbers display in correct direction
- [ ] Navigation is properly mirrored
- [ ] All animations work in RTL
- [ ] Custom cursor effects work
- [ ] Gradient directions are appropriate

### Functional Testing
- [ ] Language switcher works both directions (EN ↔ HE)
- [ ] Mobile redirect works for Hebrew pages
- [ ] All links point to correct Hebrew/English versions
- [ ] Forms submit correctly with Hebrew input
- [ ] WhatsApp integration works with Hebrew text

### Content Testing
- [ ] All text is properly translated
- [ ] Brand name consistent across all pages
- [ ] Contact info formatted correctly
- [ ] Meta tags and SEO elements in Hebrew
- [ ] No mixed English/Hebrew (except brand name)

---

## Notes

### Number Display in RTL
- Phone numbers, prices, and numeric values need special handling
- Use proper HTML structure to prevent reversal
- Reference mobile-he.html lines with phone numbers for pattern

### Animations and Custom Cursor
- All English page animations must work in Hebrew
- Custom cursor effects (ribbon trail) should work identically
- Intersection Observer animations tested in both languages

### Form Handling
- Registration forms must support Hebrew input
- Google Sheets integration must handle Hebrew characters
- WhatsApp messages formatted properly in Hebrew

---

## Quick Reference Commands

### Find all Hebrew pages
```bash
ls -1 public/*-he.html
```

### Search for brand name usage
```bash
grep -r "מועדון AI\|AI Club" public/*.html
```

### Check phone number format
```bash
grep -r "054-315-9025\|+972-54-315-9025" public/*.html
```

---

**Remember:** This tracker is the single source of truth for Hebrew implementation. Update it when decisions change or new patterns are discovered.
