const dns = require("dns").promises;

// This list is intentionally short and focused on common throwaway domains.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "sharklasers.com",
  "maildrop.cc",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmailExistsForSignup = async (email) => {
  if (!email || !EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      reason: "Email format is invalid",
    };
  }

  const domain = String(email).split("@")[1].toLowerCase();

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      reason: "Disposable email addresses are not allowed",
    };
  }

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!Array.isArray(mxRecords) || mxRecords.length === 0) {
      return {
        isValid: false,
        reason: "Email domain cannot receive emails",
      };
    }

    return {
      isValid: true,
      reason: null,
    };
  } catch (error) {
    return {
      isValid: false,
      reason: "Email domain does not appear to accept mail",
    };
  }
};

module.exports = {
  validateEmailExistsForSignup,
};
