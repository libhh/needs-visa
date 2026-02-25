/**
 * Valid ISO 3166-1 alpha-2 country code pattern.
 * Two uppercase letters.
 */
const ISO2_PATTERN = /^[A-Z]{2}$/;

/**
 * All possible visa requirement values.
 * @typedef {'visa_free'|'visa_on_arrival'|'eta'|'e_visa'|'visa_required'|'no_admission'|'unknown'} Requirement
 */

/**
 * Requirements that do NOT require obtaining a visa before travel.
 */
export const VISA_FREE_REQUIREMENTS = new Set([
  "visa_free",
  "visa_on_arrival",
  "eta",
]);

/**
 * Requirements that DO require obtaining a visa before or upon travel.
 */
export const VISA_REQUIRED_REQUIREMENTS = new Set(["visa_required", "e_visa"]);

/**
 * Normalizes and validates a country code.
 *
 * @param {string} code - Raw country code input
 * @param {string} fieldName - Field name for error messages ('from' or 'to')
 * @returns {string} Normalized uppercase ISO2 code
 * @throws {TypeError} If the code is not a valid ISO 3166-1 alpha-2 code
 */
export function normalizeCountryCode(code, fieldName) {
  if (typeof code !== "string" || !code.trim()) {
    throw new TypeError(
      `"${fieldName}" must be a non-empty string. Received: ${JSON.stringify(code)}`,
    );
  }

  const normalized = code.trim().toUpperCase();

  if (!ISO2_PATTERN.test(normalized)) {
    throw new TypeError(
      `"${fieldName}" must be a valid ISO 3166-1 alpha-2 country code (e.g. "US", "FR", "IN"). Received: "${code}"`,
    );
  }

  return normalized;
}
