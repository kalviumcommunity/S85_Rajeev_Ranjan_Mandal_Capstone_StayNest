/**
 * Currency utility functions for StayNest application
 * Handles INR (Indian Rupee) formatting and display
 */

/**
 * Format amount in Indian Rupees
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  const formattedAmount = amount.toLocaleString('en-IN');
  return showSymbol ? `₹${formattedAmount}` : formattedAmount;
};

/**
 * Format amount with currency symbol for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with ₹ symbol
 */
export const displayPrice = (amount) => {
  return formatCurrency(amount, true);
};

/**
 * Get currency symbol
 * @returns {string} The INR currency symbol
 */
export const getCurrencySymbol = () => {
  return '₹';
};

/**
 * Get currency code
 * @returns {string} The INR currency code
 */
export const getCurrencyCode = () => {
  return 'INR';
};

/**
 * Parse currency string to number
 * @param {string} currencyString - String like "₹1,000" or "1000"
 * @returns {number} Parsed number value
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString !== 'string') {
    return 0;
  }
  
  // Remove currency symbol and commas, then parse
  const cleanString = currencyString.replace(/[₹,]/g, '').trim();
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculate price breakdown for bookings
 * @param {number} basePrice - Base price per night
 * @param {number} nights - Number of nights
 * @param {object} options - Additional options
 * @returns {object} Price breakdown object
 */
export const calculatePriceBreakdown = (basePrice, nights, options = {}) => {
  const {
    cleaningFee = 500, // Default cleaning fee in INR
    serviceFeeRate = 0.14, // 14% service fee
    taxRate = 0.12, // 12% tax rate
    discounts = 0
  } = options;

  const subtotal = basePrice * nights;
  const serviceFee = Math.round(subtotal * serviceFeeRate);
  const taxes = Math.round(subtotal * taxRate);
  const total = subtotal + cleaningFee + serviceFee + taxes - discounts;

  return {
    basePrice: subtotal,
    cleaningFee,
    serviceFee,
    taxes,
    discounts,
    total
  };
};
