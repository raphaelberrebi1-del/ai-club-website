# AllPay Styling Quick Fix Checklist

## 🚀 Quick Fix Steps (10 minutes)

### Step 1: AllPay Dashboard (5 min)
1. **Login:** https://allpay.to/login
2. **Go to:** Settings → Hosted Fields → Hosted Fields Settings
3. **Verify domains:** Add these if missing:
   - `aikidz.club`
   - `*.aikidz.club`
   - `localhost`
   - `*.vercel.app`

### Step 2: Paste Custom CSS (2 min)
Copy the entire CSS from `ALLPAY_STYLING_FIX_GUIDE.md` Section "Step 2: Configure Custom CSS" into the Custom CSS field in AllPay dashboard.

**Key CSS Properties:**
- `background: transparent !important` (removes black box)
- `background: rgba(69, 26, 3, 0.4) !important` (amber inputs)
- `border: 1px solid rgba(254, 243, 199, 0.3) !important` (light border)
- `box-shadow: 0 0 0 2px rgba(6, 182, 212, 1) !important` (cyan focus ring)

### Step 3: Save & Clear Cache (2 min)
1. Click **Save** in AllPay dashboard
2. Clear browser cache (Cmd+Shift+Delete)
3. Wait 1-2 minutes for propagation

### Step 4: Test (1 min)
1. Go to: https://aikidz.club/mobile.html#choose-program
2. Fill Steps 1-3
3. Check Step 4 - iframe should show transparent with amber inputs

---

## ✅ Verification Checklist

Quick visual checks:

- [ ] ❌ Black background → ✅ Transparent background
- [ ] ❌ Dark grey inputs → ✅ Amber semi-transparent inputs
- [ ] ❌ White borders → ✅ Light amber borders
- [ ] ❌ Blue focus → ✅ Cyan focus ring
- [ ] ✅ Matches registration form design

---

## 🆘 If Still Not Working

### Option 1: Wait & Retry
- Wait 5 minutes for AllPay CDN
- Clear cache again
- Try incognito/private window

### Option 2: Contact AllPay Support
**Email:** support@allpay.to

**Message Template:**
```
Subject: Hosted Fields Custom CSS Not Applying

Hi AllPay Support,

My custom CSS works in preview mode but not on live site.

Account: [your login]
Domain: aikidz.club
Issue: Payment iframe shows default black styling instead of custom CSS

Please verify:
1. Is custom styling enabled for my account?
2. Are there any domain restrictions?
3. Do I need special API parameters?

Screenshots attached showing preview (working) vs live (not working).

Thank you!
```

---

## 📋 Detailed Guide

For comprehensive troubleshooting, see: **ALLPAY_STYLING_FIX_GUIDE.md**

---

## 🎯 Expected Result

**Your payment form should look like your registration form:**
- Transparent background (shows website background image)
- Amber semi-transparent input fields
- Light amber borders
- Cyan blue focus rings
- White text
- Seamless design integration

**No black box. No default AllPay styling.**
