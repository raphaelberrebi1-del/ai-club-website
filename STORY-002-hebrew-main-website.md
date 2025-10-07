# STORY-002: Create Hebrew Version of Main Landing Page

## 📋 Story Information

**Story ID:** STORY-002
**Priority:** LOWER
**Status:** To Do
**Type:** Feature
**Estimated Effort:** 16-24 hours

---

## 🎯 User Story

**As a** Hebrew-speaking parent in Israel
**I want** to view the AI Club website in Hebrew with proper RTL layout
**So that** I can comfortably understand the program offerings and register my child

---

## 📝 Feature Description

Create a complete Hebrew translation of the main landing page (index.html) with full right-to-left (RTL) layout support. This will provide Hebrew-speaking users with a native language experience that mirrors the English version's functionality and design.

---

## 📍 Files to Create

**New File:** `public/index-he.html`

---

## ✅ Acceptance Criteria

1. Create `public/index-he.html` with complete Hebrew translation
2. All text content from `public/index.html` translated to Hebrew
3. RTL (right-to-left) layout properly implemented
4. Language toggle between EN/HE versions functional
5. All animations and transitions work identically to English version
6. All styling remains consistent with English version
7. All interactive elements (buttons, forms, links) work properly
8. Responsive design maintained across all screen sizes
9. SEO metadata translated and optimized for Hebrew searches
10. All images and visual assets display correctly in RTL layout

---

## 🔧 Technical Requirements

### RTL Layout Implementation
```html
<html lang="he" dir="rtl">
```

### CSS Adjustments for RTL
- Mirror flex/grid directions
- Adjust text alignment
- Reverse padding/margin directions
- Update animation directions

### Language Toggle Component
```html
<div class="language-toggle">
  <a href="index.html">EN</a>
  <a href="index-he.html" class="active">עב</a>
</div>
```

---

## 📚 Reference Files

### Existing Hebrew Pages (Use as Style Reference)
- `public/mobile-he.html` - Hebrew mobile version
- `public/curriculum-he.html` - Hebrew curriculum page
- `public/pricing-he.html` - Hebrew pricing page

### Source Content
- `public/index.html` - English version to translate

---

## 📋 Content Sections to Translate

1. **Header/Navigation**
   - Logo and tagline
   - Navigation menu items
   - CTA buttons

2. **Hero Section**
   - Main headline
   - Subheadline
   - Call-to-action

3. **About Section**
   - "Give Your Child the AI Advantage"
   - Program description
   - Key benefits

4. **What Your Child Could Create Section**
   - Young Innovators content
   - Teen Entrepreneurs content
   - Project examples

5. **Age Groups Section**
   - Young Innovators (8-10)
   - Tech Explorers (11-13)
   - Future Leaders (14-18)

6. **Why Choose AI Club Section**
   - Safety & Supervision
   - Structured Curriculum
   - Local & Relevant
   - Practical Skills

7. **Testimonials/Social Proof**
   - Parent quotes
   - Student success stories

8. **Pricing Information**
   - Tier descriptions
   - Pricing details
   - Discount information

9. **FAQ Section**
   - Common questions and answers

10. **Footer**
    - Contact information
    - Social media links
    - Legal information

---

## 🧪 Testing Checklist

### Functionality
- [ ] All links navigate correctly
- [ ] Language toggle switches between EN/HE
- [ ] Forms submit properly
- [ ] Payment integration works
- [ ] Animations trigger correctly

### Layout
- [ ] RTL layout displays correctly
- [ ] No overflow or alignment issues
- [ ] Images and icons positioned properly
- [ ] Text flows naturally in Hebrew

### Responsive Design
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (768px, 1024px)
- [ ] Mobile (375px, 414px)

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Content
- [ ] All text translated accurately
- [ ] No English text remaining
- [ ] Grammar and spelling checked
- [ ] Culturally appropriate phrasing

### SEO
- [ ] Meta tags in Hebrew
- [ ] Alt text translated
- [ ] Proper lang and dir attributes
- [ ] Sitemap updated

---

## 💡 Implementation Notes

### Phase 1: Setup
1. Duplicate `public/index.html` to `public/index-he.html`
2. Add `lang="he"` and `dir="rtl"` to html tag
3. Update meta tags for Hebrew

### Phase 2: Content Translation
1. Translate all headings and body text
2. Translate navigation and menus
3. Translate buttons and CTAs
4. Translate form labels and placeholders

### Phase 3: RTL Layout Adjustments
1. Review and adjust CSS for RTL
2. Mirror flex/grid layouts
3. Adjust animations and transitions
4. Test visual hierarchy

### Phase 4: Language Toggle
1. Add language toggle component to both EN and HE versions
2. Ensure toggle persists user preference
3. Update navigation to include toggle

### Phase 5: Testing & QA
1. Test all functionality
2. Validate translations with native speaker
3. Test responsive design
4. Browser compatibility testing

---

## 🔗 Dependencies

- Translation service or native Hebrew speaker for accurate content
- Existing Hebrew pages as style reference
- RTL CSS framework or custom RTL styles

---

## ⚠️ Considerations

1. **Cultural Adaptation:** Ensure content is culturally appropriate for Israeli audience
2. **Price Display:** Ensure shekel (₪) symbols display correctly in RTL
3. **Date/Time Format:** Use Israeli date format (DD/MM/YYYY)
4. **Phone Numbers:** Use Israeli phone number format
5. **Legal Text:** Ensure legal/privacy text is appropriate for Israeli regulations

---

## 📊 Success Metrics

- Hebrew page load time matches English version
- No layout breaking issues
- User engagement metrics similar to English version
- Increased registrations from Hebrew-speaking users

---

*Created: 2025-01-07*
*Last Updated: 2025-01-07*
