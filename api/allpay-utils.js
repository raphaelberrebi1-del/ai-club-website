/**
 * AllPay Integration Utilities
 * Contains shared functions for payment processing
 */

const crypto = require('crypto');

// Pricing configuration (in ILS - Israeli Shekels)
const PRICING = {
  monthly: {
    amount: 599,
    description: 'תוכנית חודשית - AI Kidz Club',
    description_en: 'Monthly Plan - AI Kidz Club'
  },
  quarterly: {
    amount: 1557, // 519 * 3
    description: 'תוכנית רבעונית - AI Kidz Club',
    description_en: 'Quarterly Plan - AI Kidz Club'
  },
  yearly: {
    amount: 5748, // 479 * 12
    description: 'תוכנית שנתית - AI Kidz Club',
    description_en: 'Annual Plan - AI Kidz Club'
  }
};

// Age group mappings
const AGE_GROUPS = {
  'young-innovators': {
    he: 'חדשנים צעירים (8-10)',
    en: 'Young Innovators (8-10)',
    ages: '8-10'
  },
  'tech-explorers': {
    he: 'חוקרי טכנולוגיה (11-13)',
    en: 'Tech Explorers (11-13)',
    ages: '11-13'
  },
  'future-leaders': {
    he: 'מנהיגי העתיד (14-18)',
    en: 'Future Leaders (14-18)',
    ages: '14-18'
  }
};

/**
 * Generate SHA256 signature for AllPay API requests
 *
 * Algorithm:
 * 1. Remove 'sign' parameter from params
 * 2. Remove empty values (null, undefined, empty string)
 * 3. Sort keys alphabetically
 * 4. Extract values in sorted order
 * 5. Join values with colons
 * 6. Append API key with colon
 * 7. SHA256 hash the resulting string
 *
 * @param {Object} params - Payment parameters
 * @param {string} apiKey - AllPay API key
 * @returns {string} SHA256 hash signature
 */
function generateSignature(params, apiKey) {
  // Step 1: Remove 'sign' parameter if present
  const paramsWithoutSign = { ...params };
  delete paramsWithoutSign.sign;

  // Step 2: Remove empty values
  const filteredParams = Object.fromEntries(
    Object.entries(paramsWithoutSign).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  );

  // Step 3: Sort keys alphabetically
  const sortedKeys = Object.keys(filteredParams).sort();

  // Step 4: Extract values in sorted order
  const values = sortedKeys.map(key => filteredParams[key]);

  // Step 5: Join values with colons
  const valueString = values.join(':');

  // Step 6: Append API key
  const signString = valueString + ':' + apiKey;

  // Step 7: SHA256 hash
  const hash = crypto.createHash('sha256').update(signString).digest('hex');

  return hash;
}

/**
 * Verify SHA256 signature from AllPay webhook
 *
 * @param {Object} webhookData - Data received from AllPay webhook
 * @param {string} apiKey - AllPay API key
 * @returns {boolean} True if signature is valid
 */
function verifySignature(webhookData, apiKey) {
  // Extract the received signature
  const receivedSign = webhookData.sign;

  if (!receivedSign) {
    console.error('No signature found in webhook data');
    return false;
  }

  // Generate expected signature
  const expectedSign = generateSignature(webhookData, apiKey);

  // Compare signatures
  const isValid = receivedSign === expectedSign;

  if (!isValid) {
    console.error('Signature mismatch!');
    console.error('Received:', receivedSign);
    console.error('Expected:', expectedSign);
  }

  return isValid;
}

/**
 * Generate unique order ID
 * Format: AIKIDZ-{timestamp}-{random}
 *
 * @returns {string} Unique order ID
 */
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `AIKIDZ-${timestamp}-${random}`;
}

/**
 * Get pricing for a specific plan
 *
 * @param {string} plan - Plan type (monthly, quarterly, yearly)
 * @returns {Object|null} Pricing object or null if invalid
 */
function getPricing(plan) {
  return PRICING[plan] || null;
}

/**
 * Get age group details
 *
 * @param {string} ageGroup - Age group identifier
 * @returns {Object|null} Age group object or null if invalid
 */
function getAgeGroup(ageGroup) {
  return AGE_GROUPS[ageGroup] || null;
}

/**
 * Calculate total amount for multiple children
 *
 * @param {Array} children - Array of child objects with plan info
 * @param {string} duration - Payment duration (monthly, quarterly, yearly)
 * @returns {number} Total amount in ILS
 */
function calculateTotalAmount(children, duration) {
  const pricing = getPricing(duration);
  if (!pricing) return 0;

  let total = 0;

  children.forEach((child, index) => {
    let childAmount = pricing.amount;

    // Apply family discounts
    if (index === 1) {
      // 10% discount for second child
      childAmount = Math.round(childAmount * 0.9);
    } else if (index >= 2) {
      // 15% discount for third child and beyond
      childAmount = Math.round(childAmount * 0.85);
    }

    total += childAmount;
  });

  return total;
}

/**
 * Validate payment request data
 *
 * @param {Object} data - Payment request data
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validatePaymentData(data) {
  const errors = [];

  // Required fields
  if (!data.parentName || data.parentName.trim().length < 2) {
    errors.push('Parent name is required (minimum 2 characters)');
  }

  if (!data.parentEmail || !isValidEmail(data.parentEmail)) {
    errors.push('Valid parent email is required');
  }

  if (!data.parentPhone || !isValidIsraeliPhone(data.parentPhone)) {
    errors.push('Valid Israeli phone number is required');
  }

  if (!data.children || !Array.isArray(data.children) || data.children.length === 0) {
    errors.push('At least one child is required');
  }

  if (!data.plan || !PRICING[data.plan]) {
    errors.push('Valid plan selection is required');
  }

  // Validate each child
  if (data.children && Array.isArray(data.children)) {
    data.children.forEach((child, index) => {
      if (!child.name || child.name.trim().length < 2) {
        errors.push(`Child ${index + 1}: Name is required (minimum 2 characters)`);
      }

      if (!child.age || child.age < 8 || child.age > 18) {
        errors.push(`Child ${index + 1}: Age must be between 8 and 18`);
      }

      if (!child.ageGroup || !AGE_GROUPS[child.ageGroup]) {
        errors.push(`Child ${index + 1}: Valid age group is required`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 *
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Israeli phone number
 * Accepts formats: 0501234567, 050-123-4567, 050-1234567
 *
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
function isValidIsraeliPhone(phone) {
  // Remove dashes and spaces
  const cleaned = phone.replace(/[-\s]/g, '');

  // Check if it's 10 digits starting with 0
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Sanitize phone number for AllPay
 * Removes dashes and spaces
 *
 * @param {string} phone - Phone number
 * @returns {string} Sanitized phone number
 */
function sanitizePhone(phone) {
  return phone.replace(/[-\s]/g, '');
}

module.exports = {
  PRICING,
  AGE_GROUPS,
  generateSignature,
  verifySignature,
  generateOrderId,
  getPricing,
  getAgeGroup,
  calculateTotalAmount,
  validatePaymentData,
  isValidEmail,
  isValidIsraeliPhone,
  sanitizePhone
};
