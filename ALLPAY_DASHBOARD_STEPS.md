# AllPay Dashboard Configuration Steps

## Complete Step-by-Step Guide for Applying Custom CSS

---

## 🔐 Step 1: Login to AllPay Dashboard

1. **Open browser** and navigate to:
   ```
   https://allpay.to/login
   ```

2. **Enter credentials:**
   - Login/Email: [Your AllPay merchant email]
   - Password: [Your AllPay password]

3. **Click "Login"** or press Enter

4. **You should see:** AllPay merchant dashboard homepage

---

## 🎨 Step 2: Navigate to Hosted Fields Settings

### Option A: Via Settings Menu

1. **Look at left sidebar** of AllPay dashboard

2. **Click "Settings"** icon/link
   - Usually has a gear/cog icon ⚙️
   - Or labeled "הגדרות" in Hebrew

3. **Find "Hosted Fields" section**
   - May be under "Payment Methods" or "Integration"
   - May be labeled "שדות מתארחים" in Hebrew

4. **Click "Hosted Fields Settings"** button
   - Or "Hosted Fields Configuration"
   - Or "הגדרות שדות מתארחים" in Hebrew

### Option B: Via Direct URL (if available)

Try navigating directly to:
```
https://allpay.to/dashboard/hosted-fields/settings
```
(URL may vary based on AllPay's current interface)

### What You Should See:

A page with these sections:
- **Allowed Domains** (domain whitelist)
- **Custom CSS** (styling configuration)
- **Webhook URLs** (notifications)
- **API Settings** (integration options)

---

## 🌐 Step 3: Configure Allowed Domains

### Why This Matters:
AllPay only loads custom CSS for whitelisted domains. Without your domain here, styling won't apply!

### What to Do:

1. **Locate "Allowed Domains" section**
   - May be labeled "Permitted Domains" or "Domain Whitelist"
   - Hebrew: "דומיינים מאושרים"

2. **Find the text input field or textarea**
   - Should show existing domains (if any)

3. **Add these domains** (one per line):
   ```
   aikidz.club
   www.aikidz.club
   *.aikidz.club
   localhost
   127.0.0.1
   *.vercel.app
   ```

4. **Format:**
   ```
   aikidz.club
   www.aikidz.club
   *.aikidz.club
   localhost
   127.0.0.1
   *.vercel.app
   ```
   (Each domain on a separate line, no commas, no semicolons)

5. **Why each domain:**
   - `aikidz.club` - Your production domain
   - `www.aikidz.club` - WWW subdomain variant
   - `*.aikidz.club` - Wildcard for all subdomains
   - `localhost` - Local development
   - `127.0.0.1` - Local IP address
   - `*.vercel.app` - Vercel preview deployments

6. **Save this section** (if there's a separate save button)
   - Or continue to next step (may save all together)

---

## 💅 Step 4: Add Custom CSS

### Why This Matters:
This CSS transforms AllPay's black default theme to match your amber/cyan registration form!

### What to Do:

1. **Locate "Custom CSS" section**
   - May be labeled "CSS Customization" or "Style Editor"
   - Hebrew: "CSS מותאם אישית"

2. **Find the large text area**
   - Should be empty or contain default CSS
   - May have placeholder text like "Enter custom CSS here..."

3. **IMPORTANT:** Clear any existing CSS first!
   - Select all (Cmd+A / Ctrl+A)
   - Delete

4. **Open the file:** `allpay-custom-styling.css`
   - Located in your project root: `AI for Kids/allpay-custom-styling.css`

5. **Copy ENTIRE contents** of that file:
   - Open file in text editor
   - Select all (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)

6. **Paste into AllPay Custom CSS field:**
   - Click in the text area
   - Paste (Cmd+V / Ctrl+V)

7. **Verify pasted correctly:**
   - Should start with: `/* ========================================`
   - Should end with: `cursor: not-allowed !important;` and `}`
   - Should be ~180 lines of CSS

8. **Do NOT modify the CSS** (unless you know what you're doing)

---

## 💾 Step 5: Save Configuration

### What to Do:

1. **Look for Save button**
   - Usually at bottom of page
   - May say "Save", "Save Changes", "Apply", or "Update"
   - Hebrew: "שמור" or "עדכן"

2. **Click Save button**

3. **Wait for confirmation**
   - Should see success message
   - May say "Settings saved successfully" or similar
   - Hebrew: "ההגדרות נשמרו בהצלחה"

4. **Do NOT close the page immediately**
   - Some systems need a moment to process

5. **Verify settings saved:**
   - Refresh the page
   - Check if your domains are still there
   - Check if CSS is still there

6. **If settings disappeared:**
   - Browser timeout issue
   - Try saving again
   - Contact AllPay support

---

## ⏳ Step 6: Wait for Propagation

### Why Wait:
AllPay uses CDN (Content Delivery Network) to serve custom CSS. Changes take time to propagate.

### What to Do:

1. **After saving, wait 2-5 minutes**
   - AllPay needs to update their CDN servers
   - CSS needs to propagate globally

2. **Do not test immediately**
   - Won't work yet!
   - Be patient

3. **During this time:**
   - Clear your browser cache (see next step)
   - Prepare test scenario
   - Have screenshots ready for comparison

---

## 🧹 Step 7: Clear Browser Cache

### Why This Matters:
Your browser caches the old (black) AllPay styling. Must clear to see new styling!

### Chrome (Desktop):

1. **Open Chrome**
2. **Press:** Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
3. **Select:**
   - Time range: "Last hour" (minimum) or "All time" (recommended)
   - Check: "Cached images and files"
   - Uncheck: "Browsing history", "Cookies" (optional - keeps you logged in)
4. **Click:** "Clear data"

### Safari (Desktop):

1. **Open Safari**
2. **Menu:** Safari → Settings/Preferences
3. **Click:** "Advanced" tab
4. **Check:** "Show Develop menu in menu bar"
5. **Menu:** Develop → Empty Caches
6. **Or press:** Cmd+Option+E

### Firefox (Desktop):

1. **Open Firefox**
2. **Press:** Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
3. **Select:**
   - Time range: "Everything"
   - Check: "Cache"
4. **Click:** "Clear Now"

### Mobile Safari (iPhone/iPad):

1. **Settings app**
2. **Scroll to:** "Safari"
3. **Tap:** "Clear History and Website Data"
4. **Confirm:** "Clear History and Data"

### Mobile Chrome (Android/iPhone):

1. **Open Chrome app**
2. **Menu (⋮)** → "History"
3. **Tap:** "Clear browsing data"
4. **Select:**
   - Time range: "All time"
   - Check: "Cached images and files"
5. **Tap:** "Clear data"

### Alternative: Use Incognito/Private Window

**Easier method:**
1. Open new incognito/private window
2. Test there (no cache to clear)
3. Cmd+Shift+N (Chrome) or Cmd+Shift+P (Safari/Firefox)

---

## 🧪 Step 8: Test the Payment Form

### What to Do:

1. **Open your website:**
   ```
   https://aikidz.club/mobile.html#choose-program
   ```

2. **Fill Step 1: Child Details**
   - Name: Test Child
   - Age: 10
   - Age Group: Young Innovators

3. **Fill Step 2: Plan Selection**
   - Select any plan (Monthly/Quarterly/Yearly)

4. **Fill Step 3: Parent Info**
   - Name: Test Parent
   - Email: test@example.com
   - Phone: 0501234567

5. **Click "Continue" to Step 4**

6. **Wait for payment iframe to load**
   - Should show loading spinner first
   - Then iframe appears

7. **Inspect the iframe:**
   - Is background transparent? ✅
   - Are inputs amber colored? ✅
   - Does it match Steps 1-3 styling? ✅

---

## ✅ Step 9: Verify Styling

### Visual Checklist:

Compare what you see to the "After" section in `ALLPAY_STYLING_COMPARISON.md`

**Container:**
- [ ] Transparent background (not black)
- [ ] Website background visible through form

**Input Fields:**
- [ ] Amber semi-transparent background
- [ ] Light amber borders
- [ ] White text
- [ ] Rounded corners (12px)

**Placeholders:**
- [ ] Amber colored text
- [ ] Clear and readable

**Focus State:**
- [ ] Click into card number field
- [ ] Cyan blue ring appears
- [ ] Smooth animation

**Overall:**
- [ ] Matches registration form design
- [ ] Professional appearance
- [ ] Seamless integration

### If All Checks Pass: ✅ Success!

Your AllPay payment form is now properly styled!

---

## ❌ Step 10: Troubleshooting (If Not Working)

### Issue: Still Shows Black Background

**Try:**
1. Wait another 5 minutes (CDN propagation)
2. Clear cache again
3. Try different browser
4. Try incognito/private window
5. Check AllPay dashboard - verify CSS still saved
6. Check domains whitelist - verify aikidz.club is there

### Issue: Some Elements Styled, Others Not

**Try:**
1. Re-save CSS in AllPay dashboard
2. Verify you copied entire CSS file (all 180 lines)
3. Check browser console for errors (F12)
4. Inspect iframe in DevTools - see if CSS loaded

### Issue: Preview Works, Live Doesn't

**Possible causes:**
1. Domain not whitelisted
2. API not passing correct parameters
3. AllPay account settings

**Try:**
1. Verify aikidz.club in domain whitelist
2. Contact AllPay support (see Step 11)

---

## 📧 Step 11: Contact AllPay Support (If Needed)

### When to Contact:

If styling still doesn't work after:
- Waiting 10+ minutes
- Clearing cache multiple times
- Trying different browsers
- Trying incognito mode
- Verifying all settings saved

### How to Contact:

**Email:** support@allpay.to

**Subject:** Hosted Fields Custom CSS Not Applying - aikidz.club

**Message Template:**

```
Hello AllPay Support Team,

I am having an issue with Hosted Fields custom CSS not applying on my live website.

Account Details:
- Login/Email: [your AllPay login email]
- Merchant Name: AI Club
- Domain: aikidz.club

Issue Description:
I have configured custom CSS in the Hosted Fields Settings, and it displays
correctly in the preview mode within the AllPay dashboard. However, when the
payment form is loaded via the API on my live website, it shows the default
black styling instead of my custom CSS.

Steps I've Taken:
1. Added aikidz.club to Allowed Domains list
2. Saved custom CSS in Hosted Fields Settings
3. Waited 10+ minutes for CDN propagation
4. Cleared browser cache multiple times
5. Tested in incognito mode and different browsers
6. Verified settings are still saved in dashboard

Screenshots:
[Attach 3 screenshots:]
1. AllPay dashboard showing custom CSS saved
2. AllPay preview showing correct styling
3. Live website showing black/default styling

Questions:
1. Is custom CSS enabled for my account?
2. Are there domain-specific restrictions?
3. Do I need to pass specific parameters in the API call?
4. Why does preview work but live doesn't?

Please help resolve this issue. Thank you!

Best regards,
[Your Name]
```

**Attach Screenshots:**
1. AllPay dashboard Hosted Fields Settings page (showing CSS)
2. AllPay preview mode (showing correct styling)
3. Your live website Step 4 (showing incorrect styling)

---

## 📝 Configuration Summary

### What You Should Have Configured:

**Allowed Domains:**
```
aikidz.club
www.aikidz.club
*.aikidz.club
localhost
127.0.0.1
*.vercel.app
```

**Custom CSS:**
- Complete CSS from `allpay-custom-styling.css`
- 180 lines of CSS code
- Targets all input fields, containers, buttons
- Sets transparent backgrounds and amber styling

**Expected Result:**
- Payment form matches registration form design
- Transparent background
- Amber inputs with cyan focus rings
- Professional, seamless integration

---

## 🎯 Success Criteria

### You'll Know It Worked When:

1. **Step 4 looks identical to Steps 1-3** in terms of styling
2. **No black background** anywhere in payment form
3. **Input fields are amber** colored with glassmorphism effect
4. **Users can't tell** payment form is an iframe
5. **Professional appearance** maintained throughout
6. **Works on all devices** (desktop, mobile, tablet)
7. **Works in all browsers** (Chrome, Safari, Firefox, Edge)

### Congratulations! 🎉

Your AllPay payment integration now has professional, branded styling that matches your website design!

---

## 📚 Related Documentation

- `ALLPAY_STYLING_FIX_GUIDE.md` - Complete troubleshooting guide
- `ALLPAY_STYLING_QUICK_FIX.md` - Quick reference checklist
- `ALLPAY_STYLING_COMPARISON.md` - Before/after visual comparison
- `allpay-custom-styling.css` - CSS code to paste
- `ALLPAY_DASHBOARD_STEPS.md` - This file

---

## 🔄 Maintenance

### When to Update CSS:

- If you change your website's color scheme
- If you redesign your registration form
- If you want to adjust spacing/sizing
- If AllPay updates their HTML structure

### How to Update:

1. Edit `allpay-custom-styling.css` locally
2. Test changes
3. Copy updated CSS
4. Paste into AllPay dashboard
5. Save and wait for propagation
6. Clear cache and test

---

## ⚠️ Important Notes

1. **Never remove `!important` from CSS**
   - Required to override AllPay's default styles
   - Without them, styling won't apply

2. **Always test after changes**
   - Don't assume it works
   - Test on actual devices
   - Test in multiple browsers

3. **Keep backup of CSS**
   - `allpay-custom-styling.css` is your backup
   - Don't edit directly in AllPay dashboard
   - Edit locally, then paste

4. **Domain whitelist is critical**
   - Without it, CSS won't load
   - Double-check spelling
   - Include wildcards for subdomains

5. **Be patient with propagation**
   - CDN updates take time
   - Don't panic if not immediate
   - Wait at least 5 minutes

---

## End of Guide

You should now have successfully configured AllPay's Hosted Fields with custom CSS that matches your AI Club registration form design!

If you followed all steps and it's still not working, contact AllPay support using the template in Step 11.

**Good luck! 🚀**
