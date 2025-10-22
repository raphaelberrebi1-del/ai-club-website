/**
 * AllPay Payment Webhook Handler
 * Vercel Serverless Function
 *
 * POST /api/payment-webhook
 * Receives payment notifications from AllPay after successful transactions
 */

const { verifySignature } = require('./allpay-utils');

/**
 * Main handler for Vercel serverless function
 */
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    console.log('🔔 Webhook notification received from AllPay');

    // Get API key from environment
    const ALLPAY_API_KEY = process.env.ALLPAY_API_KEY;

    if (!ALLPAY_API_KEY) {
      console.error('❌ Missing AllPay API key');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Extract webhook data
    const webhookData = req.body;
    console.log('📦 Webhook data received:', {
      order_id: webhookData.order_id,
      status: webhookData.status,
      amount: webhookData.amount,
      client_email: webhookData.client_email
    });

    // CRITICAL: Verify signature before processing
    const isValidSignature = verifySignature(webhookData, ALLPAY_API_KEY);

    if (!isValidSignature) {
      console.error('❌ Invalid signature! Possible fraudulent webhook.');
      return res.status(403).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    console.log('✅ Signature verified');

    // Extract payment data
    const {
      order_id,
      status,
      amount,
      currency,
      client_name,
      client_email,
      client_phone,
      card_mask,
      card_brand,
      receipt,
      add_field_1, // Children data (JSON string)
      add_field_2  // Plan duration
    } = webhookData;

    // Payment status values:
    // 0 = Unpaid (ignore)
    // 1 = Paid (process enrollment)
    // 3 = Refunded (handle refund)
    // 4 = Partially refunded (handle partial refund)

    if (status === '1') {
      console.log('✅ Payment confirmed - Processing enrollment');

      // Parse children data
      let childrenData = [];
      try {
        childrenData = JSON.parse(add_field_1 || '[]');
      } catch (e) {
        console.error('Error parsing children data:', e);
      }

      const planDuration = add_field_2;

      // Prepare enrollment data
      const enrollmentData = {
        orderId: order_id,
        paymentStatus: 'paid',
        paymentAmount: amount,
        currency: currency,
        parentName: client_name,
        parentEmail: client_email,
        parentPhone: client_phone,
        children: childrenData,
        plan: planDuration,
        cardMask: card_mask,
        cardBrand: card_brand,
        receipt: receipt,
        timestamp: new Date().toISOString()
      };

      console.log('📋 Enrollment data prepared:', enrollmentData);

      // TODO: Submit to Google Sheets
      // You can integrate with your existing Google Apps Script endpoint here
      // Example:
      // await submitToGoogleSheets(enrollmentData);

      // TODO: Send confirmation emails
      // Example:
      // await sendConfirmationEmail(client_email, enrollmentData);

      // TODO: Send WhatsApp confirmation
      // Example:
      // await sendWhatsAppConfirmation(client_phone, enrollmentData);

      console.log('✅ Enrollment processed successfully');

      // Return 200 OK to AllPay (required)
      return res.status(200).json({
        success: true,
        message: 'Payment processed',
        order_id: order_id
      });

    } else if (status === '3') {
      console.log('⚠️ Payment refunded');

      // Handle refund logic
      // TODO: Update Google Sheets with refund status
      // TODO: Send refund notification email

      return res.status(200).json({
        success: true,
        message: 'Refund processed',
        order_id: order_id
      });

    } else if (status === '4') {
      console.log('⚠️ Payment partially refunded');

      // Handle partial refund logic
      // TODO: Update Google Sheets with partial refund status

      return res.status(200).json({
        success: true,
        message: 'Partial refund processed',
        order_id: order_id
      });

    } else if (status === '0') {
      console.log('ℹ️ Payment pending - No action needed');

      return res.status(200).json({
        success: true,
        message: 'Payment pending',
        order_id: order_id
      });

    } else {
      console.log('⚠️ Unknown payment status:', status);

      return res.status(200).json({
        success: true,
        message: 'Unknown status',
        order_id: order_id
      });
    }

  } catch (error) {
    console.error('❌ Webhook processing error:', error.message);
    console.error(error.stack);

    // Still return 200 to AllPay to prevent retries
    // But log the error for investigation
    return res.status(200).json({
      success: false,
      error: 'Internal error',
      message: error.message
    });
  }
};

/**
 * Helper function to submit enrollment to Google Sheets
 * (To be implemented with your existing Google Apps Script endpoint)
 *
 * @param {Object} data - Enrollment data
 */
async function submitToGoogleSheets(data) {
  // Example implementation:
  // const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;
  // const response = await fetch(GOOGLE_SHEETS_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
  // return response.json();

  console.log('TODO: Implement Google Sheets submission');
  console.log('Data to submit:', data);
}

/**
 * Helper function to send confirmation email
 * (To be implemented with your email service)
 *
 * @param {string} email - Recipient email
 * @param {Object} data - Enrollment data
 */
async function sendConfirmationEmail(email, data) {
  console.log('TODO: Implement confirmation email');
  console.log('Sending to:', email);
  console.log('Data:', data);
}

/**
 * Helper function to send WhatsApp confirmation
 * (To be implemented with WhatsApp Business API)
 *
 * @param {string} phone - Recipient phone
 * @param {Object} data - Enrollment data
 */
async function sendWhatsAppConfirmation(phone, data) {
  console.log('TODO: Implement WhatsApp confirmation');
  console.log('Sending to:', phone);
  console.log('Data:', data);
}
