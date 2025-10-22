/**
 * AllPay Payment Creation API Endpoint
 * Vercel Serverless Function
 *
 * POST /api/create-payment
 * Creates an AllPay payment request and returns payment URL for Hosted Fields iframe
 */

const axios = require('axios');
const {
  generateSignature,
  generateOrderId,
  getPricing,
  getAgeGroup,
  calculateTotalAmount,
  validatePaymentData,
  sanitizePhone
} = require('./allpay-utils');

/**
 * Main handler for Vercel serverless function
 */
module.exports = async (req, res) => {
  // Set CORS headers for frontend requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    console.log('📥 Received payment creation request');

    // Extract data from request body
    const {
      parentName,
      parentEmail,
      parentPhone,
      children,
      plan,
      duration,
      amount,
      language = 'he'
    } = req.body;

    // Validate request data
    const validation = validatePaymentData({
      parentName,
      parentEmail,
      parentPhone,
      children,
      plan: duration || plan
    });

    if (!validation.valid) {
      console.error('❌ Validation failed:', validation.errors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      });
    }

    // Get environment variables
    const ALLPAY_LOGIN = process.env.ALLPAY_LOGIN;
    const ALLPAY_API_KEY = process.env.ALLPAY_API_KEY;
    const BASE_URL = process.env.BASE_URL || 'https://aikidz.club';
    const ALLPAY_ENDPOINT = process.env.ALLPAY_ENDPOINT || 'https://allpay.to/app/?show=getpayment&mode=api8';

    if (!ALLPAY_LOGIN || !ALLPAY_API_KEY) {
      console.error('❌ Missing AllPay credentials');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Generate unique order ID
    const orderId = generateOrderId();
    console.log('🆔 Generated order ID:', orderId);

    // Get pricing information
    const planDuration = duration || plan;
    const pricing = getPricing(planDuration);

    if (!pricing) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan selected'
      });
    }

    // Calculate total amount (with family discounts if applicable)
    const totalAmount = amount || calculateTotalAmount(children, planDuration);
    console.log('💰 Total amount:', totalAmount, 'ILS');

    // Build items array for AllPay
    const items = children.map((child, index) => {
      const ageGroupInfo = getAgeGroup(child.ageGroup);
      const ageGroupName = ageGroupInfo ? ageGroupInfo[language] : child.ageGroup;

      // Calculate individual child amount with discount
      let childAmount = pricing.amount;
      if (index === 1) {
        childAmount = Math.round(childAmount * 0.9); // 10% discount
      } else if (index >= 2) {
        childAmount = Math.round(childAmount * 0.85); // 15% discount
      }

      return {
        name: `${pricing[`description_${language}`] || pricing.description} - ${ageGroupName} - ${child.name}`,
        qty: 1,
        price: childAmount,
        vat: 0.17 // 17% VAT in Israel
      };
    });

    // Sanitize phone number
    const cleanPhone = sanitizePhone(parentPhone);

    // Build AllPay payment request parameters
    const params = {
      login: ALLPAY_LOGIN,
      order_id: orderId,
      currency: 'ILS',
      lang: language.toUpperCase(), // HE or EN
      client_name: parentName,
      client_email: parentEmail,
      client_phone: cleanPhone,
      items: JSON.stringify(items),
      notifications_url: `${BASE_URL}/api/payment-webhook`,
      success_url: `${BASE_URL}/payment-success.html?order=${orderId}`,
      backlink_url: `${BASE_URL}/${language === 'he' ? 'mobile-he.html' : 'mobile.html'}#choose-program`,
      show_bit: 1, // Enable Bit payment option
      show_applepay: 1, // Enable Apple Pay if available
      // Store additional data for webhook processing
      add_field_1: JSON.stringify(children.map(c => ({ name: c.name, age: c.age, ageGroup: c.ageGroup }))),
      add_field_2: planDuration
    };

    // Add subscription parameters for recurring payments
    if (planDuration === 'monthly') {
      params.subscription = JSON.stringify({
        start_type: 1, // Start immediately
        end_type: 1    // Infinite (until cancelled)
      });
    } else if (planDuration === 'quarterly') {
      params.subscription = JSON.stringify({
        start_type: 1,
        end_type: 1
      });
    } else if (planDuration === 'yearly') {
      params.subscription = JSON.stringify({
        start_type: 1,
        end_type: 1
      });
    }

    // Generate signature
    params.sign = generateSignature(params, ALLPAY_API_KEY);
    console.log('🔐 Generated signature');

    // Send request to AllPay
    console.log('📤 Sending request to AllPay...');
    const response = await axios.post(ALLPAY_ENDPOINT, new URLSearchParams(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('📨 AllPay response received');

    // Check if payment URL was returned
    if (response.data && response.data.payment_url) {
      console.log('✅ Payment created successfully');
      console.log('🔗 Payment URL:', response.data.payment_url);

      // Return payment URL to frontend for Hosted Fields iframe
      return res.status(200).json({
        success: true,
        paymentUrl: response.data.payment_url,
        orderId: orderId,
        amount: totalAmount
      });
    } else {
      console.error('❌ AllPay did not return payment URL');
      console.error('Response:', response.data);

      return res.status(500).json({
        success: false,
        error: 'Failed to create payment',
        details: response.data
      });
    }

  } catch (error) {
    console.error('❌ Payment creation error:', error.message);

    if (error.response) {
      console.error('AllPay API error:', error.response.data);
      return res.status(500).json({
        success: false,
        error: 'AllPay API error',
        message: error.message,
        details: error.response.data
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
