# AllPay Webhook Handler Implementation Guide

## Overview
This document details how to implement the webhook handler that processes payment notifications from AllPay after successful transactions. The webhook activates enrollments, sends confirmations, and manages subscriptions.

---

## Webhook Flow

```
AllPay Payment Success
    ↓
AllPay sends POST to notifications_url
    ↓
Your webhook endpoint receives data
    ↓
Verify SHA256 signature (CRITICAL!)
    ↓
Check payment status
    ↓
Process enrollment (if status = 1)
    ↓
Send confirmations (email + WhatsApp)
    ↓
Return 200 OK to AllPay
```

---

## Webhook Endpoint Setup

### Endpoint: `POST /api/payment-webhook`

**URL to provide to AllPay:**
```
https://your-domain.com/api/payment-webhook
```

**Set in AllPay payment request:**
```javascript
notifications_url: `${process.env.BASE_URL}/api/payment-webhook`
```

---

## Webhook Payload Structure

AllPay sends the following data via POST:

### Complete Payload Fields:

```json
{
  "order_id": "AIKIDZ-1234567890-abc123",
  "amount": "599",
  "status": "1",
  "currency": "ILS",
  "client_name": "שם הורה",
  "client_email": "parent@example.com",
  "client_phone": "0501234567",
  "client_tehudat": "",
  "card_mask": "4580****1234",
  "card_brand": "Visa",
  "foreign_card": "0",
  "receipt": "https://allpay.to/receipt/xyz123",
  "add_field_1": "young-innovators",
  "add_field_2": "שם ילד",
  "sign": "abc123def456..."
}
```

### Payment Status Values:
- **0** = Unpaid (ignore)
- **1** = Paid (process enrollment)
- **3** = Refunded (handle refund)
- **4** = Partially refunded (handle partial refund)

---

## Signature Verification (CRITICAL!)

**⚠️ SECURITY WARNING:** Always verify the signature before processing any payment. This prevents fraudulent webhook calls.

### Verification Algorithm:

```javascript
function verifySignature(webhookData, apiKey) {
  // Step 1: Remove 'sign' parameter
  const dataWithoutSign = { ...webhookData };
  const receivedSign = dataWithoutSign.sign;
  delete dataWithoutSign.sign;

  // Step 2: Remove empty values
  const filteredData = Object.fromEntries(
    Object.entries(dataWithoutSign).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  );

  // Step 3: Sort keys alphabetically
  const sortedKeys = Object.keys(filteredData).sort();

  // Step 4: Extract values and join with colons
  const values = sortedKeys.map(key => filteredData[key]);

  // Step 5: Append API key
  const signString = values.join(':') + ':' + apiKey;

  // Step 6: SHA256 hash
  const calculatedSign = crypto.createHash('sha256').update(signString).digest('hex');

  // Step 7: Compare
  return calculatedSign === receivedSign;
}
```

---

## Complete Webhook Handler Implementation

### Node.js/Express Example:

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // AllPay sends form data

const ALLPAY_API_KEY = process.env.ALLPAY_API_KEY;

// Import email/database services
// const { sendEnrollmentEmail } = require('./services/email');
// const { sendWhatsAppInvite } = require('./services/whatsapp');
// const db = require('./database');

app.post('/api/payment-webhook', async (req, res) => {
  console.log('Webhook received:', req.body);

  try {
    const webhookData = req.body;

    // STEP 1: Verify signature
    if (!verifySignature(webhookData, ALLPAY_API_KEY)) {
      console.error('Invalid signature! Possible fraud attempt.');
      return res.status(400).send('Invalid signature');
    }

    // STEP 2: Check payment status
    const status = parseInt(webhookData.status);

    if (status === 1) {
      // ✅ PAYMENT SUCCESSFUL - Process enrollment
      await processSuccessfulPayment(webhookData);
    } else if (status === 0) {
      // ⏳ UNPAID - Log and ignore
      console.log('Unpaid transaction:', webhookData.order_id);
    } else if (status === 3 || status === 4) {
      // 💰 REFUNDED - Handle refund
      await processRefund(webhookData);
    }

    // STEP 3: Always return 200 OK to AllPay
    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent AllPay retries
    res.status(200).send('Error logged');
  }
});

function verifySignature(webhookData, apiKey) {
  const dataWithoutSign = { ...webhookData };
  const receivedSign = dataWithoutSign.sign;
  delete dataWithoutSign.sign;

  const filteredData = Object.fromEntries(
    Object.entries(dataWithoutSign).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  );

  const sortedKeys = Object.keys(filteredData).sort();
  const values = sortedKeys.map(key => filteredData[key]);
  const signString = values.join(':') + ':' + apiKey;
  const calculatedSign = crypto.createHash('sha256').update(signString).digest('hex');

  return calculatedSign === receivedSign;
}

async function processSuccessfulPayment(webhookData) {
  const {
    order_id,
    amount,
    client_name,
    client_email,
    client_phone,
    card_mask,
    card_brand,
    receipt,
    add_field_1: ageGroup,
    add_field_2: childName
  } = webhookData;

  console.log(`✅ Processing successful payment: ${order_id}`);

  try {
    // STEP 1: Check for duplicate processing (idempotency)
    // const existingOrder = await db.orders.findOne({ order_id });
    // if (existingOrder && existingOrder.status === 'completed') {
    //   console.log('Order already processed:', order_id);
    //   return;
    // }

    // STEP 2: Determine plan from amount
    const plan = determinePlan(amount);

    // STEP 3: Store transaction in database
    /*
    await db.orders.create({
      order_id,
      parent_name: client_name,
      parent_email: client_email,
      parent_phone: client_phone,
      child_name: childName,
      age_group: ageGroup,
      plan,
      amount: parseFloat(amount),
      card_mask,
      card_brand,
      receipt_url: receipt,
      status: 'completed',
      payment_date: new Date(),
      created_at: new Date()
    });
    */

    // STEP 4: Create enrollment record
    /*
    await db.enrollments.create({
      order_id,
      child_name: childName,
      age_group: ageGroup,
      plan,
      status: 'active',
      start_date: new Date(),
      parent_email: client_email,
      parent_phone: client_phone
    });
    */

    // STEP 5: Send confirmation email
    /*
    await sendEnrollmentEmail({
      to: client_email,
      parentName: client_name,
      childName,
      ageGroup: getAgeGroupDisplay(ageGroup),
      plan: getPlanDisplay(plan),
      amount,
      receiptUrl: receipt,
      startDate: new Date().toLocaleDateString('he-IL')
    });
    */

    // STEP 6: Send WhatsApp group invitation
    /*
    await sendWhatsAppInvite({
      phone: client_phone,
      childName,
      ageGroup,
      groupLink: getWhatsAppGroupLink(ageGroup)
    });
    */

    console.log(`✅ Enrollment completed for ${childName} (${order_id})`);

  } catch (error) {
    console.error('Error processing successful payment:', error);
    // Log to monitoring system
    // await logError('webhook_processing_error', error, webhookData);
  }
}

function determinePlan(amount) {
  const amountNum = parseFloat(amount);

  if (amountNum === 599) return 'monthly';
  if (amountNum === 1557) return 'quarterly';
  if (amountNum === 5748) return 'annual';

  // Fallback for variations
  if (amountNum >= 590 && amountNum <= 610) return 'monthly';
  if (amountNum >= 1500 && amountNum <= 1600) return 'quarterly';
  if (amountNum >= 5700 && amountNum <= 5800) return 'annual';

  return 'unknown';
}

function getAgeGroupDisplay(ageGroup) {
  const groups = {
    'young-innovators': 'חדשנים צעירים (8-10)',
    'tech-explorers': 'חוקרי טכנולוגיה (11-13)',
    'future-leaders': 'מנהיגי העתיד (14-18)'
  };
  return groups[ageGroup] || ageGroup;
}

function getPlanDisplay(plan) {
  const plans = {
    'monthly': 'חודשי - ₪599/חודש',
    'quarterly': 'רבעוני - ₪519/חודש',
    'annual': 'שנתי - ₪479/חודש'
  };
  return plans[plan] || plan;
}

function getWhatsAppGroupLink(ageGroup) {
  // Return appropriate WhatsApp group link based on age group
  const links = {
    'young-innovators': 'https://chat.whatsapp.com/young-innovators',
    'tech-explorers': 'https://chat.whatsapp.com/tech-explorers',
    'future-leaders': 'https://chat.whatsapp.com/future-leaders'
  };
  return links[ageGroup] || 'https://chat.whatsapp.com/ai-kidz-club';
}

async function processRefund(webhookData) {
  const { order_id, amount, status } = webhookData;

  console.log(`💰 Processing refund: ${order_id} (status: ${status})`);

  try {
    // Update order status
    /*
    await db.orders.update(
      { order_id },
      {
        status: status === 3 ? 'refunded' : 'partially_refunded',
        refund_amount: amount,
        refund_date: new Date()
      }
    );
    */

    // Update enrollment status
    /*
    await db.enrollments.update(
      { order_id },
      { status: 'cancelled', cancelled_date: new Date() }
    );
    */

    // Send refund notification email
    /*
    await sendRefundEmail({
      to: webhookData.client_email,
      parentName: webhookData.client_name,
      amount,
      orderId: order_id
    });
    */

    console.log(`✅ Refund processed: ${order_id}`);

  } catch (error) {
    console.error('Error processing refund:', error);
  }
}

app.listen(3000, () => console.log('Webhook handler running on port 3000'));
```

---

## Database Schema

### Orders Table:
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  child_name VARCHAR(255) NOT NULL,
  age_group VARCHAR(50) NOT NULL,
  plan VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  card_mask VARCHAR(20),
  card_brand VARCHAR(50),
  receipt_url TEXT,
  status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'refunded', 'partially_refunded'
  payment_date TIMESTAMP,
  refund_date TIMESTAMP,
  refund_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enrollments Table:
```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  child_name VARCHAR(255) NOT NULL,
  age_group VARCHAR(50) NOT NULL,
  plan VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'suspended'
  start_date DATE NOT NULL,
  end_date DATE,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  whatsapp_invited BOOLEAN DEFAULT FALSE,
  cancelled_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Idempotency Handling

**Problem:** AllPay may send the same webhook multiple times if it doesn't receive a 200 OK response quickly.

**Solution:** Check if order_id already exists with status 'completed' before processing.

```javascript
async function checkDuplicateProcessing(orderId) {
  const existingOrder = await db.orders.findOne({ order_id: orderId });

  if (existingOrder && existingOrder.status === 'completed') {
    console.log('Order already processed:', orderId);
    return true; // Duplicate
  }

  return false; // Not duplicate
}

// Use in webhook handler:
if (await checkDuplicateProcessing(webhookData.order_id)) {
  return res.status(200).send('Already processed');
}
```

---

## Email Confirmation Template

### HTML Email Example:

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
    .header { background: linear-gradient(to right, #06b6d4, #14b8a6); color: white; padding: 20px; border-radius: 10px; text-align: center; }
    .content { padding: 20px; text-align: right; }
    .details { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(to right, #06b6d4, #14b8a6); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ברוכים הבאים למועדון AI!</h1>
    </div>
    <div class="content">
      <p>שלום {{parentName}},</p>
      <p>תודה שהצטרפת למועדון AI! אנחנו נרגשים לקבל את {{childName}} לתוכנית שלנו.</p>

      <div class="details">
        <h3>פרטי ההרשמה:</h3>
        <p><strong>שם הילד/ה:</strong> {{childName}}</p>
        <p><strong>קבוצת גיל:</strong> {{ageGroup}}</p>
        <p><strong>תוכנית:</strong> {{plan}}</p>
        <p><strong>סכום ששולם:</strong> ₪{{amount}}</p>
        <p><strong>תאריך תחילה:</strong> {{startDate}}</p>
      </div>

      <h3>השלבים הבאים:</h3>
      <ol>
        <li>הצטרף לקבוצת WhatsApp של ההורים לעדכונים שוטפים</li>
        <li>נשלח לך מייל נוסף עם פרטי השיעור הראשון</li>
        <li>וודא שיש ל{{childName}} מחשב נייד/טאבלט לשיעורים</li>
      </ol>

      <a href="{{receiptUrl}}" class="button">הורד קבלה</a>

      <p style="margin-top: 30px;">לשאלות נוספות, פנה אלינו:</p>
      <p>📧 raphael@aikidz.club</p>
      <p>📱 WhatsApp: [מספר טלפון]</p>

      <p style="margin-top: 30px; color: #666;">בברכה,<br>צוות מועדון AI</p>
    </div>
  </div>
</body>
</html>
```

---

## WhatsApp Invitation

### Using WhatsApp Business API:

```javascript
async function sendWhatsAppInvite({ phone, childName, ageGroup, groupLink }) {
  const message = `
שלום! 👋

${childName} הצטרף/ה בהצלחה למועדון AI!

📚 קבוצת גיל: ${getAgeGroupDisplay(ageGroup)}

הצטרף/י לקבוצת WhatsApp של ההורים לעדכונים שוטפים:
${groupLink}

נתראה בשיעור הראשון! 🚀

צוות מועדון AI
  `.trim();

  // Send via WhatsApp Business API or service like Twilio
  // await whatsappService.send(phone, message);

  console.log(`WhatsApp invite sent to ${phone}`);
}
```

---

## Testing Webhook Locally

### Using ngrok:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your local server:**
   ```bash
   node server.js
   # Running on http://localhost:3000
   ```

3. **Expose localhost with ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy ngrok URL:**
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:3000
   ```

5. **Use in AllPay payment request:**
   ```javascript
   notifications_url: 'https://abc123.ngrok.io/api/payment-webhook'
   ```

6. **Monitor webhook calls:**
   - Check ngrok web interface: http://127.0.0.1:4040
   - See all incoming requests and payloads

---

## Error Handling & Monitoring

### Log All Webhook Calls:

```javascript
app.post('/api/payment-webhook', async (req, res) => {
  // Log every webhook call
  await db.webhook_logs.create({
    timestamp: new Date(),
    payload: JSON.stringify(req.body),
    signature_valid: verifySignature(req.body, ALLPAY_API_KEY),
    status: req.body.status,
    order_id: req.body.order_id
  });

  // ... rest of processing
});
```

### Alert on Failures:

```javascript
async function alertOnFailure(error, webhookData) {
  // Send alert to monitoring service (Sentry, Slack, etc.)
  console.error('WEBHOOK PROCESSING FAILED:', error);

  // Email alert to admin
  await sendAlertEmail({
    to: 'admin@aikidz.club',
    subject: `Webhook Processing Failed: ${webhookData.order_id}`,
    body: `Error: ${error.message}\n\nWebhook Data: ${JSON.stringify(webhookData, null, 2)}`
  });
}
```

---

## Subscription Management

For recurring payments (Monthly/Quarterly/Annual), AllPay automatically charges the card each period and sends a new webhook notification.

### Handling Recurring Charges:

```javascript
async function processRecurringPayment(webhookData) {
  const { order_id, amount } = webhookData;

  // Store recurring payment
  await db.recurring_payments.create({
    original_order_id: order_id,
    amount,
    charge_date: new Date(),
    status: 'completed'
  });

  // Send monthly receipt to parent
  await sendMonthlyReceipt(webhookData);

  console.log(`Recurring payment processed: ${order_id}`);
}
```

---

## Security Checklist

- [ ] Signature verification implemented and tested
- [ ] API key stored securely in environment variables
- [ ] HTTPS enabled on webhook endpoint
- [ ] Idempotency checks in place
- [ ] All webhook calls logged
- [ ] Failed webhook alerts configured
- [ ] Database transactions used for critical updates
- [ ] Rate limiting on webhook endpoint
- [ ] IP whitelist for AllPay webhooks (if available)

---

## Troubleshooting

### Common Issues:

1. **Signature Verification Fails:**
   - Check parameter sorting
   - Ensure no extra parameters added
   - Verify API key is correct
   - Check for encoding issues with Hebrew characters

2. **Webhook Not Received:**
   - Check notifications_url is publicly accessible
   - Verify HTTPS certificate is valid
   - Test with ngrok locally
   - Check server logs for errors

3. **Duplicate Processing:**
   - Implement idempotency checks
   - Return 200 OK quickly
   - Use database transactions

4. **Email Not Sent:**
   - Check email service credentials
   - Verify recipient email format
   - Check spam folders
   - Review email service logs

---

## Next Steps

1. Implement webhook endpoint
2. Set up database tables
3. Configure email service
4. Test with AllPay test cards (see allpay-test-payment-flow.md)
5. Monitor webhook logs
6. Set up production monitoring
