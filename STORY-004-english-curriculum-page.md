# STORY-004: Create English Curriculum Page

## 📋 Story Information

**Story ID:** STORY-004
**Priority:** MEDIUM
**Status:** To Do
**Type:** Feature
**Estimated Effort:** 10-14 hours

---

## 🎯 User Story

**As a** parent researching the AI Club program
**I want** a detailed curriculum page showing what my child will learn
**So that** I can understand the educational value and make an informed enrollment decision

---

## 📝 Feature Description

Create a standalone English curriculum page that showcases the complete 12-week program structure with detailed breakdowns of skills, projects, and learning objectives for each age group. This page will port content from the mobile version while using the desktop layout and styling from the main site.

---

## 📍 Files to Create

**New File:** `public/curriculum.html`

---

## ✅ Acceptance Criteria

1. Create `public/curriculum.html` with standalone curriculum page
2. Port all curriculum content from `public/mobile.html`
3. Use desktop layout/styling consistent with `public/index.html`
4. Include detailed breakdown of all 12 weeks
5. Display skills covered in each session
6. Show age-specific tracks for all three age groups
7. List learning objectives clearly
8. Include project examples for each week
9. Add fade-in animations consistent with main site
10. Ensure fully responsive design (mobile, tablet, desktop)
11. Include navigation header and footer
12. Implement proper SEO metadata

---

## 🔧 Technical Requirements

### Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags, title, styles -->
  <title>Curriculum - AI Club Raanana</title>
</head>
<body>
  <!-- Navigation header -->
  <!-- Hero section with curriculum overview -->
  <!-- Age group selector/tabs -->
  <!-- 12-week breakdown section -->
  <!-- Skills matrix section -->
  <!-- Learning outcomes section -->
  <!-- Sample projects gallery -->
  <!-- CTA section -->
  <!-- Footer -->
</body>
</html>
```

### Styling Requirements
- Match main site's color scheme and typography
- Use consistent button and card styles
- Implement timeline or accordion layout for 12-week breakdown
- Add interactive elements (tabs/accordions for age groups)
- Ensure visual hierarchy and scannable content

### Animation Requirements
- Fade-in animations on scroll (Intersection Observer)
- Smooth tab/accordion transitions
- Hover effects on interactive elements
- Consistent with main site's animation timing

---

## 📚 Reference Files

### Source Content
- `public/mobile.html` - Contains curriculum section content to port

### Style Reference
- `public/index.html` - Main site styling and layout patterns
- `public/curriculum-he.html` - Hebrew version (structure reference)

### Product Context
- `CLAUDE.md` - PRD with curriculum areas and age group details

---

## 📋 Content Sections Required

### 1. Hero Section
- Main headline: "A Journey Through AI Innovation"
- Subheadline about structured learning approach
- Brief overview: "12 weeks of hands-on AI education"

### 2. Curriculum Overview
- Program duration: 12 weeks
- Session frequency: Once per week
- Session length: 90 minutes
- Group size: Maximum 8 students
- Format: Hands-on, project-based learning

### 3. Age Group Selector (Tabs or Cards)
Three interactive sections for:
- Young Innovators (8-10 years)
- Tech Explorers (11-13 years)
- Future Leaders (14-18 years)

### 4. 12-Week Breakdown (Per Age Group)

#### Week 1: Introduction to AI
- **Topics:** What is AI? AI in daily life
- **Skills:** Basic AI concepts, tool exploration
- **Project:** Personal AI assistant setup
- **Tools:** ChatGPT, age-appropriate AI platforms

#### Week 2: Creative Writing with AI
- **Topics:** Story structure, AI as writing partner
- **Skills:** Prompt engineering, editing, creative thinking
- **Project:** AI-assisted short story
- **Tools:** ChatGPT, Jasper (age-appropriate)

#### Week 3: Digital Art & Design
- **Topics:** AI image generation, visual creativity
- **Skills:** Prompt crafting for images, design principles
- **Project:** AI-generated art portfolio
- **Tools:** DALL-E, Midjourney, Canva AI

#### Week 4: Research & Information Skills
- **Topics:** AI-powered research, fact-checking
- **Skills:** Information literacy, source evaluation
- **Project:** Research presentation on chosen topic
- **Tools:** Perplexity AI, ChatGPT

#### Week 5: Introduction to Programming
- **Topics:** Coding basics, AI-assisted development
- **Skills:** Problem decomposition, debugging with AI
- **Project:** Simple interactive program
- **Tools:** ChatGPT, Replit, Scratch (younger) / Python (older)

#### Week 6: Multimedia Projects
- **Topics:** Video creation, audio projects
- **Skills:** Storyboarding, AI video/audio tools
- **Project:** Short video or podcast episode
- **Tools:** Descript, Runway ML, ElevenLabs

#### Week 7: Problem-Solving with AI
- **Topics:** Real-world problem identification
- **Skills:** Critical thinking, solution design
- **Project:** AI solution proposal for local issue
- **Tools:** Research tools, presentation software

#### Week 8: Data & Analytics (Age-appropriate)
- **Topics:** Understanding data, simple analysis
- **Skills:** Data interpretation, visualization
- **Project:** Data-driven mini-report
- **Tools:** Google Sheets with AI, simple analytics tools

#### Week 9: Game Design & Interactivity
- **Topics:** Game mechanics, interactive experiences
- **Skills:** Game logic, user experience design
- **Project:** Simple AI-assisted game
- **Tools:** Scratch, Python game libraries, AI coding assistants

#### Week 10: Ethics & Responsible AI Use
- **Topics:** AI ethics, bias, privacy, safety
- **Skills:** Critical evaluation, ethical reasoning
- **Project:** Ethics presentation or debate
- **Discussion:** Real-world AI implications

#### Week 11: Capstone Project Development
- **Topics:** Project planning, execution
- **Skills:** All skills learned, project management
- **Project:** Begin personal capstone project
- **Mentorship:** One-on-one guidance

#### Week 12: Showcase & Celebration
- **Topics:** Presentation skills, reflection
- **Skills:** Public speaking, portfolio presentation
- **Project:** Final capstone showcase
- **Event:** Parent showcase, certificate ceremony

### 5. Core Skills Matrix
Visual representation of skills developed:

**Technical Skills:**
- AI tool proficiency
- Basic programming concepts
- Digital creation tools
- Research methodologies

**Cognitive Skills:**
- Critical thinking
- Problem-solving
- Creative thinking
- Information literacy

**Social-Emotional Skills:**
- Collaboration
- Communication
- Ethical reasoning
- Growth mindset

**Future-Ready Skills:**
- Adaptability
- Digital citizenship
- Innovation mindset
- Lifelong learning

### 6. Learning Outcomes Section

#### Young Innovators (8-10)
- Understand basic AI concepts
- Create stories, art, and simple projects with AI
- Develop digital creativity
- Build confidence with technology

#### Tech Explorers (11-13)
- Grasp intermediate AI applications
- Code simple programs with AI assistance
- Conduct research effectively
- Create multimedia projects

#### Future Leaders (14-18)
- Master advanced AI tools
- Develop complex projects independently
- Apply AI to real-world problems
- Build professional portfolio

### 7. Sample Projects Gallery
Visual showcase of:
- Student-created artwork
- Writing samples
- Game screenshots
- Video thumbnails
- Research presentations
- Final capstone projects

### 8. What Makes Our Curriculum Unique
- **Project-Based:** Learning by doing, not just theory
- **Age-Appropriate:** Tailored content for development stages
- **Safe & Supervised:** Guided exploration of AI tools
- **Portfolio Building:** Tangible outcomes every week
- **Ethical Foundation:** Responsibility at the core
- **Local Relevance:** Israeli context and culture

### 9. Curriculum FAQ
- Can my child join mid-program?
- What if my child misses a session?
- Are the tools safe for children?
- Do students need prior experience?
- What happens after the 12 weeks?
- Can students repeat the program?

### 10. Final CTA Section
- "Ready to start your child's AI journey?"
- Prominent enrollment button
- Link to pricing page
- Contact for questions

---

## 🧪 Testing Checklist

### Content
- [ ] All 12 weeks documented clearly
- [ ] Age-appropriate content for each track
- [ ] No spelling or grammar errors
- [ ] Projects align with learning objectives
- [ ] Skills progression logical

### Design
- [ ] Consistent with main site branding
- [ ] Visual hierarchy clear
- [ ] Timeline/accordion easy to navigate
- [ ] Sample projects display well
- [ ] Proper spacing and alignment

### Responsive Design
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (768px, 1024px)
- [ ] Mobile (375px, 414px)
- [ ] Age group tabs/selector works on mobile
- [ ] Content readable on all devices

### Functionality
- [ ] All navigation links work
- [ ] Age group selector/tabs functional
- [ ] Accordions expand/collapse smoothly
- [ ] Animations trigger on scroll
- [ ] CTA buttons link correctly
- [ ] No console errors

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### SEO
- [ ] Meta title and description
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] Alt text for images
- [ ] Semantic HTML structure
- [ ] Schema markup for educational content

---

## 💡 Implementation Notes

### Phase 1: Setup
1. Create `public/curriculum.html`
2. Copy header/footer from `index.html`
3. Set up basic page structure
4. Link stylesheets and scripts

### Phase 2: Content Migration
1. Extract curriculum content from `mobile.html`
2. Organize 12-week breakdown
3. Create age-specific content variations
4. Develop skills matrix

### Phase 3: Interactive Components
1. Build age group selector (tabs or cards)
2. Implement accordion for weekly breakdown
3. Create skills matrix visualization
4. Add project gallery

### Phase 4: Styling
1. Apply main site styles
2. Style timeline/accordion components
3. Design skills matrix
4. Style project gallery
5. Add hover effects and transitions

### Phase 5: Animations
1. Implement Intersection Observer
2. Add fade-in animations
3. Add tab/accordion transitions
4. Test animation timing
5. Ensure smooth performance

### Phase 6: Responsive Design
1. Create mobile layout (stacked, single column)
2. Adjust tablet layout (flexible 2-column)
3. Optimize desktop layout (multi-column)
4. Test all breakpoints
5. Optimize mobile interactions

### Phase 7: Testing & Polish
1. Cross-browser testing
2. Content review and proofreading
3. SEO optimization
4. Performance optimization
5. Accessibility audit

---

## 🔗 Dependencies

- Navigation component from main site
- Footer component from main site
- Sample project images/assets
- Enrollment form integration

---

## ⚠️ Considerations

1. **Content Accuracy:** Verify curriculum details with instructors/program director
2. **Age Appropriateness:** Ensure content appeals to both kids and parents
3. **Tool Updates:** Plan for updating tool names as AI landscape evolves
4. **Sample Projects:** Obtain permissions for any student work showcased
5. **Legal Compliance:** Include disclaimers about project outcomes
6. **Accessibility:** Ensure interactive elements are keyboard navigable

---

## 📊 Success Metrics

- Page load time < 2.5 seconds
- Time spent on page (target: 3+ minutes)
- Click-through rate to enrollment
- Bounce rate
- Age group selector engagement
- Scroll depth (% reaching week 12)

---

## 🚀 Future Enhancements

- Video walkthroughs of sample sessions
- Interactive curriculum explorer tool
- Student testimonial videos
- Downloadable curriculum PDF
- Weekly learning objectives checklist
- Parent resources section
- Integration with blog for curriculum updates
- Live preview of AI tools used in program

---

*Created: 2025-01-07*
*Last Updated: 2025-01-07*
