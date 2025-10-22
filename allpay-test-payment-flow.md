# AllPay Test Payment Flow Guide

## Overview
This document provides step-by-step instructions for testing the AllPay payment integration using test cards. Complete all test scenarios before going to production.

---

## Enable Test Mode

### Step 1: Access AllPay Dashboard
1. Log in to https://allpay.to
2. Navigate to **Settings → API Integrations**
3. Toggle **Test Mode** to ON
4. Keep same API login and key (works for both test and production)

### Visual Indicator:
When test mode is enabled, you'll see a banner on AllPay payment pages indicating "TEST MODE".

---

## Test Card Numbers

Use these test cards for different scenarios:

### ✅ Successful Payments:

| Card Brand | Number | Notes |
|------------|--------|-------|
| **Visa** | `4557430402053431` | Most common, test all scenarios with this |
| **MasterCard** | `5326105300985846` | Test MasterCard processing |
| **AmEx** | `375516193000090` | Test American Express |

### ❌ Failed Payment:

| Card Brand | Number | Notes |
|------------|--------|-------|
| **Declined Card** | `4000000000000002` | Simulates payment failure |

### Card Details for All Test Cards:
- **Expiry Date:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)
- **Cardholder Name:** Any name

---

## Test Scenarios

### Scenario 1: Monthly Plan - Young Innovators (₪599)

#### Setup:
```
Age Group: Young Innovators (8-10)
Plan: Monthly
Amount: ₪599
```

#### Steps:
1. Navigate to `register-mobile-he.html?plan=monthly&age=young-innovators`
2. Fill registration form:
   ```
   Parent Name: ישראל ישראלי
   Parent Email: test-parent@example.com
   Parent Phone: 0501234567
   Child Name: דניאל
   Child Age: 9
   Age Group: חדשנים צעירים (8-10)
   ```
3. Click "המשך לתשלום"
4. Wait for redirect to AllPay payment page
5. Verify page shows:
   - ✅ Amount: ₪599
   - ✅ Description: "תוכנית חודשית - AI Kidz Club - Young Innovators (8-10) - דניאל"
   - ✅ "TEST MODE" banner visible
6. Enter test Visa card:
   ```
   Card Number: 4557430402053431
   Expiry: 12/25
   CVV: 123
   Name: Israel Israeli
   ```
7. Click "שלם עכשיו"
8. Should redirect to `success_url` with successful payment message

#### Verification:
- [ ] Webhook received (check server logs)
- [ ] Signature verified successfully
- [ ] Order status updated to 'completed' in database
- [ ] Enrollment created with status 'active'
- [ ] Confirmation email sent
- [ ] WhatsApp invitation sent
- [ ] Receipt URL stored

#### Expected Webhook Data:
```json
{
  "order_id": "AIKIDZ-...",
  "amount": "599",
  "status": "1",
  "client_name": "ישראל ישראלי",
  "client_email": "test-parent@example.com",
  "card_mask": "4557****3431",
  "card_brand": "Visa"
}
```

---

### Scenario 2: Quarterly Plan - Tech Explorers (₪1,557)

#### Setup:
```
Age Group: Tech Explorers (11-13)
Plan: Quarterly
Amount: ₪1,557 (₪519/month × 3)
```

#### Steps:
1. Navigate to `register-mobile-he.html?plan=quarterly&age=tech-explorers`
2. Fill registration form:
   ```
   Parent Name: שרה כהן
   Parent Email: test-quarterly@example.com
   Parent Phone: 0521112233
   Child Name: נועה
   Child Age: 12
   Age Group: חוקרי טכנולוגיה (11-13)
   ```
3. Complete payment with MasterCard test card:
   ```
   Card Number: 5326105300985846
   Expiry: 03/26
   CVV: 456
   ```

#### Verification:
- [ ] Payment amount is ₪1,557
- [ ] Subscription created with 3-month billing cycle
- [ ] Webhook received with correct amount
- [ ] Plan stored as 'quarterly' in database
- [ ] Age group is 'tech-explorers'

#### Subscription Check:
- Verify subscription is set to bill ₪1,557 every 3 months
- Check subscription status in AllPay dashboard: Settings → Subscriptions

---

### Scenario 3: Annual Plan - Future Leaders (₪5,748)

#### Setup:
```
Age Group: Future Leaders (14-18)
Plan: Annual
Amount: ₪5,748 (₪479/month × 12)
```

#### Steps:
1. Navigate to `register-mobile-he.html?plan=annual&age=future-leaders`
2. Fill registration form:
   ```
   Parent Name: דוד לוי
   Parent Email: test-annual@example.com
   Parent Phone: 0541234567
   Child Name: יונתן
   Child Age: 16
   Age Group: מנהיגי העתיד (14-18)
   ```
3. Complete payment with AmEx test card:
   ```
   Card Number: 375516193000090
   Expiry: 08/27
   CVV: 789
   ```

#### Verification:
- [ ] Payment amount is ₪5,748
- [ ] Subscription created with 12-month billing cycle
- [ ] AmEx card processed successfully
- [ ] Plan stored as 'annual'
- [ ] Highest discount applied

---

### Scenario 4: Bit Payment Test

#### Setup:
Use same registration flow, but select Bit payment option on AllPay page.

#### Steps:
1. Complete registration form for any plan
2. On AllPay payment page, click "שלם עם Bit"
3. Follow Bit payment simulation (test mode)
4. Complete payment

#### Verification:
- [ ] Bit payment option visible (`show_bit: 1` in payment request)
- [ ] Payment completed successfully
- [ ] Webhook shows payment method as Bit
- [ ] Same post-payment flow works

---

### Scenario 5: Failed Payment (Declined Card)

#### Setup:
Test error handling with declined payment.

#### Steps:
1. Complete registration form
2. On AllPay payment page, enter declined test card:
   ```
   Card Number: 4000000000000002
   Expiry: 12/25
   CVV: 123
   ```
3. Click "שלם עכשיו"

#### Expected Result:
- ❌ Payment should fail
- Error message displayed to user
- User redirected back to form or error page
- NO webhook sent (payment status remains 0)

#### Verification:
- [ ] Error message shown to user
- [ ] Order status remains 'pending' in database
- [ ] No enrollment created
- [ ] No confirmation email sent
- [ ] User can retry payment

---

### Scenario 6: Refund Test

#### Setup:
Process a successful payment, then issue refund from AllPay dashboard.

#### Steps:
1. Complete successful payment (Scenario 1)
2. Log in to AllPay dashboard
3. Navigate to **Transactions** → Find test transaction
4. Click **Refund** → Full refund
5. Confirm refund

#### Verification:
- [ ] Webhook received with `status: 3` (refunded)
- [ ] Order status updated to 'refunded' in database
- [ ] Enrollment status changed to 'cancelled'
- [ ] Refund notification email sent to parent
- [ ] Refund amount and date stored

---

## Testing with AllPay API Tester Tool

### URL: https://allpay.to/demo/test-api.php

This visual tool helps test API requests without writing code.

#### Steps:
1. Navigate to https://allpay.to/demo/test-api.php
2. Fill in required fields:
   ```
   API Login: [your_test_login]
   Order ID: TEST-001
   Currency: ILS
   Item Name: Test Payment
   Quantity: 1
   Price: 599
   VAT: 0.17
   ```
3. Click "Generate Signature"
4. Copy the generated signature
5. Click "Send Request"
6. Payment page opens with test transaction
7. Complete with test card

#### Use Cases:
- Test signature generation algorithm
- Verify API credentials
- Debug payment request parameters
- Test different payment amounts

---

## Local Webhook Testing with ngrok

### Setup:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   # or
   brew install ngrok
   ```

2. **Start local server:**
   ```bash
   node server.js
   # Server running on http://localhost:3000
   ```

3. **Start ngrok tunnel:**
   ```bash
   ngrok http 3000
   ```

4. **Copy ngrok URL:**
   ```
   Forwarding: https://abc123.ngrok.io → http://localhost:3000
   ```

5. **Update notifications_url in payment request:**
   ```javascript
   notifications_url: 'https://abc123.ngrok.io/api/payment-webhook'
   ```

### Monitoring Webhooks:

1. Open ngrok web interface: http://127.0.0.1:4040
2. See all incoming webhook requests in real-time
3. Inspect request body, headers, response
4. Replay webhooks for testing

### Testing Workflow:
```
User completes payment
    ↓
AllPay sends webhook → https://abc123.ngrok.io/api/payment-webhook
    ↓
ngrok forwards to → http://localhost:3000/api/payment-webhook
    ↓
Your local server processes webhook
    ↓
View webhook data in ngrok dashboard
```

---

## Manual Webhook Testing

### Using curl:

```bash
curl -X POST http://localhost:3000/api/payment-webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "order_id=AIKIDZ-TEST-001" \
  -d "amount=599" \
  -d "status=1" \
  -d "currency=ILS" \
  -d "client_name=Test Parent" \
  -d "client_email=test@example.com" \
  -d "client_phone=0501234567" \
  -d "card_mask=4557****3431" \
  -d "card_brand=Visa" \
  -d "receipt=https://allpay.to/receipt/test" \
  -d "add_field_1=young-innovators" \
  -d "add_field_2=Test Child" \
  -d "sign=[GENERATED_SIGNATURE]"
```

**Note:** Generate correct signature for testing, or temporarily disable signature verification in development.

---

## Pre-Production Checklist

Before going live with real payments:

### ✅ Test Mode Validation:
- [ ] All 3 pricing plans tested (Monthly, Quarterly, Annual)
- [ ] All 3 age groups tested (8-10, 11-13, 14-18)
- [ ] Successful payments work
- [ ] Failed payments handled correctly
- [ ] Refunds processed correctly
- [ ] Bit payment option works
- [ ] Webhook signature verification works
- [ ] Idempotency checks prevent duplicate processing
- [ ] Email confirmations sent successfully
- [ ] WhatsApp invitations sent
- [ ] Database updates correct

### ✅ Production Setup:
- [ ] Disable test mode in AllPay dashboard
- [ ] Update API credentials to production (if different)
- [ ] Update `notifications_url` to production URL (no ngrok)
- [ ] Verify production URL is HTTPS
- [ ] SSL certificate valid
- [ ] Production database configured
- [ ] Email service configured (not test mode)
- [ ] Monitoring and alerts set up
- [ ] Error logging configured

### ✅ Small Production Test:
- [ ] Test with ₪1 real payment
- [ ] Verify webhook received in production
- [ ] Check all production services work
- [ ] Refund test payment

---

## Testing Best Practices

### 1. Use Unique Order IDs
```javascript
const orderId = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

### 2. Test All Payment Flows
- Success path
- Failure path
- Refund path
- Subscription renewal

### 3. Test Edge Cases
- Very long names (Hebrew + English)
- Special characters in names
- Different phone formats
- Invalid email addresses
- Concurrent payments
- Duplicate webhooks

### 4. Monitor Performance
- Payment request creation time
- Redirect speed to AllPay
- Webhook processing time
- Email delivery time

### 5. Test Error Recovery
- Server down during webhook
- Database connection lost
- Email service unavailable
- Network timeout

---

## Common Testing Issues

### Issue 1: Signature Verification Fails
**Solution:**
- Print calculated signature vs received signature
- Check parameter sorting
- Ensure API key is correct
- Test with AllPay API Tester Tool first

### Issue 2: Webhook Not Received
**Solution:**
- Check `notifications_url` is publicly accessible
- Test with ngrok locally first
- Verify server is running
- Check firewall settings
- Look for errors in AllPay dashboard

### Issue 3: Payment Page Shows Wrong Amount
**Solution:**
- Verify `items` array has correct price
- Check for extra charges (VAT calculated correctly)
- Ensure currency is 'ILS'
- Test signature generation

### Issue 4: Test Card Declined
**Solution:**
- Verify using exact test card numbers
- Check expiry is future date
- Ensure test mode is enabled
- Try different test card

### Issue 5: Subscription Not Created
**Solution:**
- Check `subscription` object in payment request
- Verify JSON formatting is correct
- Test with monthly plan first
- Check subscription in AllPay dashboard

---

## Test Results Log Template

Create a test log file: `test-results.md`

```markdown
# AllPay Integration Test Results

## Test Date: [DATE]
## Tester: [NAME]
## Environment: Test Mode

### Scenario 1: Monthly - Young Innovators
- Status: ✅ Pass / ❌ Fail
- Order ID: AIKIDZ-...
- Payment Status: Successful
- Webhook Received: Yes
- Email Sent: Yes
- Issues: None

### Scenario 2: Quarterly - Tech Explorers
- Status: ✅ Pass / ❌ Fail
- Order ID: AIKIDZ-...
- Payment Status: Successful
- Webhook Received: Yes
- Subscription Created: Yes
- Issues: None

[... continue for all scenarios]

## Issues Found:
1. [Issue description and resolution]
2. [Issue description and resolution]

## Production Readiness: ✅ Ready / ❌ Not Ready
```

---

## Next Steps After Testing

1. ✅ All test scenarios pass
2. ✅ Webhook processing works correctly
3. ✅ Database updates properly
4. ✅ Emails and WhatsApp invitations work
5. ✅ Error handling tested
6. → Switch to production mode
7. → Test with small real payment (₪1)
8. → Monitor first real customer registrations
9. → Set up ongoing monitoring and alerts

---

## Support Resources

- **AllPay Documentation:** https://www.allpay.co.il/en/api-reference
- **AllPay API Tester:** https://allpay.to/demo/test-api.php
- **AllPay Support:** support@allpay.co.il
- **Test Cards Reference:** See this document
- **ngrok Documentation:** https://ngrok.com/docs

---

## Emergency Rollback Plan

If issues occur in production:

1. **Immediate:** Disable payment form (show "maintenance" message)
2. **Switch to WhatsApp:** Temporarily redirect "Join Now" to WhatsApp contact
3. **Manual processing:** Take registrations via email/WhatsApp
4. **Fix issues:** Debug in test mode
5. **Re-test:** Complete all scenarios again
6. **Re-enable:** Restore payment form once stable

---

## Monitoring Production Payments

Once live, monitor:
- Payment success rate (target: >95%)
- Webhook delivery rate (target: 100%)
- Average payment processing time
- Failed payment reasons
- Refund requests
- Customer support inquiries

Set up alerts for:
- Webhook processing failures
- Payment success rate drops below 90%
- Multiple failed payments in short time
- Server errors during payment creation
