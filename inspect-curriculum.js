const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to curriculum page...');
  await page.goto('https://www.aikidz.club/curriculum.html', { waitUntil: 'networkidle' });

  // Check for glassmorphism elements
  console.log('\n=== CHECKING FOR GLASSMORPHISM ELEMENTS ===\n');

  // 1. Check for background glow effects
  const glowEffects = await page.locator('div:has-text("Enhanced Background glow")').count();
  console.log(`Background glow comment found: ${glowEffects > 0 ? 'YES' : 'NO'}`);

  // 2. Check for backdrop-blur-lg classes
  const backdropBlurElements = await page.locator('[class*="backdrop-blur-lg"]').count();
  console.log(`Elements with backdrop-blur-lg: ${backdropBlurElements}`);

  // 3. Check hero container styling
  const heroContainer = page.locator('.max-w-3xl.mx-auto .rounded-3xl').first();
  const heroClasses = await heroContainer.getAttribute('class');
  console.log(`\nHero container classes: ${heroClasses}`);

  // 4. Check main program container
  const programContainer = page.locator('#program-12 > div').first();
  const programClasses = await programContainer.getAttribute('class');
  console.log(`Main program container classes: ${programClasses}`);

  // 5. Check if radial gradients exist
  const radialGradients = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div[style*="radial-gradient"]'));
    return divs.length;
  });
  console.log(`\nRadial gradient divs found: ${radialGradients}`);

  // 6. Check computed styles
  const heroComputedStyle = await heroContainer.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      backgroundColor: style.backgroundColor,
      backdropFilter: style.backdropFilter,
      opacity: style.opacity
    };
  });
  console.log('\nHero container computed styles:', heroComputedStyle);

  // 7. Take screenshot
  console.log('\nTaking screenshot...');
  await page.screenshot({ path: 'curriculum-screenshot.png', fullPage: false });
  console.log('Screenshot saved to: curriculum-screenshot.png');

  // 8. Check for specific weekly boxes
  const weeklyBoxes = await page.locator('.bg-black\\/40.backdrop-blur-lg.border.border-white\\/20').count();
  console.log(`\nWeekly boxes with glassmorphism: ${weeklyBoxes}`);

  await browser.close();
  console.log('\n✅ Inspection complete!');
})();
