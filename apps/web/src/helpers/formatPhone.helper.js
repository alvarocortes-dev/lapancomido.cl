// src/helpers/formatPhone.helper.js

/**
 * Format Chilean phone number for display: "9 1234 5678"
 * Only affects visual display, not stored value
 * @param {string} digits - Raw digits only (e.g., "912345678")
 * @returns {string} Formatted display (e.g., "9 1234 5678")
 */
export const formatChileanPhone = (digits) => {
  if (!digits) return "";
  
  // Remove any non-digits
  const clean = digits.replace(/\D/g, "");
  
  // Format: 9 1234 5678 (Chilean mobile format)
  if (clean.length <= 1) {
    return clean;
  } else if (clean.length <= 5) {
    return `${clean.slice(0, 1)} ${clean.slice(1)}`;
  } else {
    return `${clean.slice(0, 1)} ${clean.slice(1, 5)} ${clean.slice(5, 9)}`;
  }
};

/**
 * Extract raw digits from formatted phone
 * @param {string} formatted - Formatted phone (e.g., "9 1234 5678")
 * @returns {string} Raw digits only (e.g., "912345678")
 */
export const unformatPhone = (formatted) => {
  if (!formatted) return "";
  return formatted.replace(/\D/g, "");
};

/**
 * Validate Chilean phone number (9 digits starting with 9)
 * @param {string} digits - Raw digits
 * @returns {boolean}
 */
export const isValidChileanPhone = (digits) => {
  const clean = digits?.replace(/\D/g, "") || "";
  return clean.length === 9 && clean.startsWith("9");
};

// Common country codes for Chile and surrounding countries
export const countryCodes = [
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+1", country: "USA/Canadá", flag: "🇺🇸" },
  { code: "+34", country: "España", flag: "🇪🇸" },
];
