# AllPay Registration Form Integration Guide

## Overview
This document details how to integrate AllPay payment processing with the AI Club registration form. The flow: User selects plan → Fills form → Backend creates AllPay payment → User redirected to AllPay → Payment success → Webhook processes enrollment.

---

## Current Implementation

**Existing Button Behavior:**
```javascript
onclick="window.location.href='mobile-he.html#choose-program'"
```

**New Behavior:**
```javascript
onclick="window.location.href='register-mobile-he.html?plan=monthly&age=8-10'"
```

---

## Registration Form Data Collection

### Form Fields Required:

#### 1. Parent Details
- **Parent Name** (text, required)
  - Hebrew: "שם ההורה"
  - Validation: Min 2 characters

- **Parent Email** (email, required)
  - Hebrew: "אימייל"
  - Validation: Valid email format

- **Parent Phone** (tel, required)
  - Hebrew: "טלפון"
  - Format: Israeli phone (e.g., 050-1234567)
  - Validation: 10 digits (0XX-XXXXXXX)

#### 2. Child Details
- **Child Name** (text, required)
  - Hebrew: "שם הילד/ה"
  - Validation: Min 2 characters

- **Child Age** (number, required)
  - Hebrew: "גיל הילד/ה"
  - Range: 8-18
  - Used for age group validation

#### 3. Age Group Selection (auto-selected or dropdown)
- **Young Innovators** (Ages 8-10)
  - Hebrew: "חדשנים צעירים"
- **Tech Explorers** (Ages 11-13)
  - Hebrew: "חוקרי טכנולוגיה"
- **Future Leaders** (Ages 14-18)
  - Hebrew: "מנהיגי העתיד"

#### 4. Plan Selection (pre-selected from URL params or dropdown)
- **Monthly** - ₪599/month
  - Hebrew: "חודשי"
- **Quarterly** - ₪519/month (billed ₪1,557 every 3 months)
  - Hebrew: "רבעוני"
- **Annual** - ₪479/month (billed ₪5,748 annually)
  - Hebrew: "שנתי"

---

## Form Page Structure

### Create New Files:
1. `public/register-mobile.html` (English)
2. `public/register-mobile-he.html` (Hebrew)

### Design Matching:
- Same background: `NEW-background.jpg`
- Same fonts: Fredoka, Nunito, Inter
- Same color scheme: Cyan-Teal gradients
- Same navigation header
- Mobile-optimized layout

### Form Layout Example:

```html
<form id="registration-form" class="max-w-md mx-auto p-6 bg-black/40 backdrop-blur-lg rounded-xl border border-white/20">
    <h2 class="text-2xl font-bold text-cyan-400 mb-6 text-right">טופס הרשמה</h2>

    <!-- Parent Details Section -->
    <div class="mb-6">
        <h3 class="text-lg font-semibold text-white mb-3 text-right">פרטי הורה</h3>

        <div class="mb-4">
            <label class="block text-white/80 mb-2 text-right" for="parent-name">שם ההורה *</label>
            <input type="text" id="parent-name" name="parentName" required
                   class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-right"
                   placeholder="שם מלא">
        </div>

        <div class="mb-4">
            <label class="block text-white/80 mb-2 text-right" for="parent-email">אימייל *</label>
            <input type="email" id="parent-email" name="parentEmail" required
                   class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-right"
                   placeholder="email@example.com">
        </div>

        <div class="mb-4">
            <label class="block text-white/80 mb-2 text-right" for="parent-phone">טלפון *</label>
            <input type="tel" id="parent-phone" name="parentPhone" required
                   pattern="[0-9]{10}"
                   class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-right"
                   placeholder="0501234567">
        </div>
    </div>

    <!-- Child Details Section -->
    <div class="mb-6">
        <h3 class="text-lg font-semibold text-white mb-3 text-right">פרטי ילד/ה</h3>

        <div class="mb-4">
            <label class="block text-white/80 mb-2 text-right" for="child-name">שם הילד/ה *</label>
            <input type="text" id="child-name" name="childName" required
                   class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-right"
                   placeholder="שם מלא">
        </div>

        <div class="mb-4">
            <label class="block text-white/80 mb-2 text-right" for="child-age">גיל הילד/ה *</label>
            <input type="number" id="child-age" name="childAge" required min="8" max="18"
                   class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-right"
                   placeholder="8-18">
        </div>

        <div class="mb-4">
            <label class="block text-white/80 mb-2 text-right" for="age-group">קבוצת גיל *</label>
            <select id="age-group" name="ageGroup" required
                    class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-right">
                <option value="">בחר קבוצת גיל</option>
                <option value="young-innovators">חדשנים צעירים (8-10)</option>
                <option value="tech-explorers">חוקרי טכנולוגיה (11-13)</option>
                <option value="future-leaders">מנהיגי העתיד (14-18)</option>
            </select>
        </div>
    </div>

    <!-- Plan Selection -->
    <div class="mb-6">
        <h3 class="text-lg font-semibold text-white mb-3 text-right">תוכנית נבחרת</h3>
        <div class="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-lg p-4 border border-cyan-400/30">
            <p class="text-white font-semibold text-right" id="selected-plan">חודשי - ₪599/חודש</p>
        </div>
        <input type="hidden" id="plan" name="plan" value="monthly">
    </div>

    <!-- Submit Button -->
    <button type="submit"
            class="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
        המשך לתשלום
    </button>
</form>
```

---

## Backend Integration

### Endpoint: `POST /api/create-payment`

#### Request Body:
```json
{
  "parentName": "שם הורה",
  "parentEmail": "parent@example.com",
  "parentPhone": "0501234567",
  "childName": "שם ילד",
  "childAge": 10,
  "ageGroup": "young-innovators",
  "plan": "monthly"
}
```

#### Backend Logic (Node.js/Express Example):

```javascript
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(express.json());

// AllPay credentials (from Settings → API Integrations)
const ALLPAY_LOGIN = process.env.ALLPAY_LOGIN;
const ALLPAY_API_KEY = process.env.ALLPAY_API_KEY;
const ALLPAY_ENDPOINT = 'https://allpay.to/app/?show=getpayment&mode=api8';

// Pricing mapping
const PRICING = {
  monthly: {
    amount: 599,
    description: 'תוכנית חודשית - AI Kidz Club'
  },
  quarterly: {
    amount: 1557, // 519 * 3
    description: 'תוכנית רבעונית - AI Kidz Club'
  },
  annual: {
    amount: 5748, // 479 * 12
    description: 'תוכנית שנתית - AI Kidz Club'
  }
};

// Age group mapping
const AGE_GROUPS = {
  'young-innovators': 'Young Innovators (8-10)',
  'tech-explorers': 'Tech Explorers (11-13)',
  'future-leaders': 'Future Leaders (14-18)'
};

// Generate SHA256 signature
function generateSignature(params, apiKey) {
  // Step 1: Remove 'sign' parameter
  const paramsWithoutSign = { ...params };
  delete paramsWithoutSign.sign;

  // Step 2: Remove empty values
  const filteredParams = Object.fromEntries(
    Object.entries(paramsWithoutSign).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  );

  // Step 3: Sort keys alphabetically
  const sortedKeys = Object.keys(filteredParams).sort();

  // Step 4: Extract values and join with colons
  const values = sortedKeys.map(key => filteredParams[key]);

  // Step 5: Append API key
  const signString = values.join(':') + ':' + apiKey;

  // Step 6: SHA256 hash
  return crypto.createHash('sha256').update(signString).digest('hex');
}

app.post('/api/create-payment', async (req, res) => {
  try {
    const { parentName, parentEmail, parentPhone, childName, childAge, ageGroup, plan } = req.body;

    // Validate required fields
    if (!parentName || !parentEmail || !parentPhone || !childName || !childAge || !ageGroup || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique order ID
    const orderId = `AIKIDZ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get pricing for selected plan
    const pricing = PRICING[plan];
    if (!pricing) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Build AllPay payment request parameters
    const params = {
      login: ALLPAY_LOGIN,
      order_id: orderId,
      currency: 'ILS',
      lang: 'HE',
      client_name: parentName,
      client_email: parentEmail,
      client_phone: parentPhone,
      items: JSON.stringify([{
        name: `${pricing.description} - ${AGE_GROUPS[ageGroup]} - ${childName}`,
        qty: 1,
        price: pricing.amount,
        vat: 0.17
      }]),
      notifications_url: `${process.env.BASE_URL}/api/payment-webhook`,
      success_url: `${process.env.BASE_URL}/payment-success.html`,
      backlink_url: `${process.env.BASE_URL}/register-mobile-he.html`,
      show_bit: 1, // Enable Bit payment
      add_field_1: ageGroup, // Store age group for webhook
      add_field_2: childName // Store child name for webhook
    };

    // Add subscription parameters for recurring payments
    if (plan === 'monthly') {
      params.subscription = JSON.stringify({
        start_type: 1, // immediately
        end_type: 1    // infinite (until cancelled)
      });
    } else if (plan === 'quarterly') {
      params.subscription = JSON.stringify({
        start_type: 1, // immediately
        end_type: 1    // infinite
      });
    } else if (plan === 'annual') {
      params.subscription = JSON.stringify({
        start_type: 1, // immediately
        end_type: 1    // infinite
      });
    }

    // Generate signature
    params.sign = generateSignature(params, ALLPAY_API_KEY);

    // Send request to AllPay
    const response = await axios.post(ALLPAY_ENDPOINT, new URLSearchParams(params));

    if (response.data.payment_url) {
      // Store order in database (pending payment)
      // await db.orders.create({ orderId, parentEmail, childName, plan, status: 'pending' });

      // Return payment URL to frontend
      res.json({
        success: true,
        paymentUrl: response.data.payment_url,
        orderId: orderId
      });
    } else {
      res.status(500).json({ error: 'Failed to create payment', details: response.data });
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Frontend Form Submission

```javascript
document.getElementById('registration-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'מעבד...';
  submitBtn.disabled = true;

  // Collect form data
  const formData = {
    parentName: document.getElementById('parent-name').value,
    parentEmail: document.getElementById('parent-email').value,
    parentPhone: document.getElementById('parent-phone').value,
    childName: document.getElementById('child-name').value,
    childAge: parseInt(document.getElementById('child-age').value),
    ageGroup: document.getElementById('age-group').value,
    plan: document.getElementById('plan').value
  };

  try {
    // Send to backend
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success && data.paymentUrl) {
      // Redirect to AllPay payment page
      window.location.href = data.paymentUrl;
    } else {
      alert('שגיאה ביצירת תשלום. אנא נסה שנית.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('שגיאה בשרת. אנא נסה שנית.');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});
```

---

## Update Existing "Join Now" Buttons

### In All Pricing Pages:

**Before:**
```javascript
onclick="window.location.href='mobile-he.html#choose-program'"
```

**After (pass plan and age group):**
```javascript
// Young Innovators - Monthly
onclick="window.location.href='register-mobile-he.html?plan=monthly&age=young-innovators'"

// Tech Explorers - Quarterly
onclick="window.location.href='register-mobile-he.html?plan=quarterly&age=tech-explorers'"

// Future Leaders - Annual
onclick="window.location.href='register-mobile-he.html?plan=annual&age=future-leaders'"
```

### URL Parameters Auto-Fill:

```javascript
// On register page load, read URL parameters and pre-fill form
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'monthly';
  const ageGroup = urlParams.get('age') || '';

  // Set plan
  document.getElementById('plan').value = plan;

  // Display plan text
  const planText = {
    'monthly': 'חודשי - ₪599/חודש',
    'quarterly': 'רבעוני - ₪519/חודש (חיוב ₪1,557 כל 3 חודשים)',
    'annual': 'שנתי - ₪479/חודש (חיוב ₪5,748 בשנה)'
  };
  document.getElementById('selected-plan').textContent = planText[plan];

  // Pre-select age group if provided
  if (ageGroup) {
    document.getElementById('age-group').value = ageGroup;
  }
});
```

---

## Environment Variables

Create `.env` file:

```env
# AllPay Credentials
ALLPAY_LOGIN=your_api_login_here
ALLPAY_API_KEY=your_api_key_here

# Base URL for callbacks
BASE_URL=https://your-domain.com

# Test Mode (true/false)
ALLPAY_TEST_MODE=true
```

---

## Error Handling

### Client-Side Validation:
- Required fields check
- Email format validation
- Phone number format (10 digits)
- Age range (8-18)
- Age group matches child age

### Server-Side Validation:
- All required fields present
- Valid plan selection
- Valid age group
- Email format check
- Phone sanitization

### AllPay Errors:
- Invalid signature → Check signature generation
- Invalid login → Check credentials
- Invalid order_id → Ensure uniqueness
- Payment declined → User sees AllPay error page

---

## Security Considerations

1. **Never expose API key on frontend**
2. **Always generate signatures server-side**
3. **Validate all user input**
4. **Use HTTPS for all endpoints**
5. **Store API credentials in environment variables**
6. **Implement rate limiting on payment creation endpoint**
7. **Log all payment requests for debugging**

---

## Testing Checklist

- [ ] Form validates all required fields
- [ ] URL parameters pre-fill correctly
- [ ] Backend generates correct signature
- [ ] AllPay payment page opens with correct amount
- [ ] Plan description shows correctly
- [ ] Test cards work (see allpay-test-payment-flow.md)
- [ ] Webhook receives payment notification (see allpay-webhook-handler.md)
- [ ] Error handling works for declined payments

---

## Next Steps

1. Create registration form pages (register-mobile.html, register-mobile-he.html)
2. Set up backend server with /api/create-payment endpoint
3. Update all "Join Now" buttons to point to registration form
4. Test with AllPay test cards
5. Implement webhook handler (see allpay-webhook-handler.md)
