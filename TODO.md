# AI Club Website - TODO List

## Current Issues to Fix

### 1. "What Your Child Could Create" Section - Column Alignment Issue
**Problem:** The two columns (Young Innovators and Teen Entrepreneurs) are not even in height. Some content blocks are larger than others, causing the "Teen Entrepreneurs" card to drop down lower than "Young Innovators".

**Solution Needed:**
- Review the content in both cards
- Ensure equal padding/spacing
- Consider using CSS Grid with `align-items: start` or flexbox alignment
- May need to adjust content length or use min-height to keep cards aligned at top

**Location:** `public/index.html` - Section `id="projects"` around line 1605

---

## Major Features to Implement

### 2. Hebrew (HE) Version of Main Website
**Task:** Create Hebrew version of the main landing page (index.html)

**Requirements:**
- Create `public/index-he.html`
- Mirror all content from `public/index.html`
- Translate all text to Hebrew
- Ensure RTL (right-to-left) layout support
- Add language toggle between EN/HE versions
- Keep all animations and styling consistent

**Reference Files:**
- `public/mobile-he.html` (existing Hebrew mobile version)
- `public/curriculum-he.html` (existing Hebrew curriculum page)
- `public/pricing-he.html` (existing Hebrew pricing page)

---

### 3. Pricing Page (English Version)
**Task:** Create standalone pricing page matching mobile version content

**Requirements:**
- Create `public/pricing.html`
- Port content from `public/mobile.html` pricing section
- Use desktop layout/styling from main site
- Include:
  - Three age group tiers (Young Innovators, Tech Explorers, Future Leaders)
  - Monthly/Quarterly/Yearly pricing options
  - Early Bird discount information
  - Multi-child discount details
  - Clear CTA buttons
- Add fade-in animations consistent with main site
- Ensure responsive design

**Current Status:**
- `public/pricing-he.html` exists (Hebrew version)
- Need English equivalent

---

### 4. Curriculum Page (English Version)
**Task:** Create standalone curriculum page matching mobile version content

**Requirements:**
- Create `public/curriculum.html`
- Port content from `public/mobile.html` curriculum section
- Use desktop layout/styling from main site
- Include:
  - Detailed breakdown of all 12 weeks
  - Skills covered in each session
  - Age-specific tracks
  - Learning objectives
  - Project examples
- Add fade-in animations consistent with main site
- Ensure responsive design

**Current Status:**
- `public/curriculum-he.html` exists (Hebrew version)
- Need English equivalent

---

## Implementation Priority

1. **HIGH PRIORITY:** Fix column alignment in "What Your Child Could Create" section
2. **MEDIUM PRIORITY:** Create English pricing page
3. **MEDIUM PRIORITY:** Create English curriculum page
4. **LOWER PRIORITY:** Create Hebrew version of main landing page (index-he.html)

---

## Notes
- All new pages should maintain consistent styling with main site
- Ensure all scroll animations work (Intersection Observer)
- Keep responsive design for mobile/tablet
- Test all language toggles
- Maintain SEO best practices

---

*Last Updated: 2025-01-06*
