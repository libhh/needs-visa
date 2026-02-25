import { createRequire } from "module";
import {
  normalizeCountryCode,
  VISA_FREE_REQUIREMENTS,
  VISA_REQUIRED_REQUIREMENTS,
} from "./utils.js";

const require = createRequire(import.meta.url);
const { data: visaData, _meta } = require("../data/visa-requirements.json");

/**
 * @typedef {'visa_free'|'visa_on_arrival'|'eta'|'e_visa'|'visa_required'|'no_admission'|'unknown'} Requirement
 */

/**
 * @typedef {Object} VisaOptions
 * @property {string} from - ISO 3166-1 alpha-2 code of the passport country (e.g. "IN")
 * @property {string} to   - ISO 3166-1 alpha-2 code of the destination country (e.g. "FR")
 */

/**
 * @typedef {Object} VisaResult
 * @property {string}      from        - Normalized passport country code
 * @property {string}      to          - Normalized destination country code
 * @property {boolean}     required    - true if a visa is needed before or upon travel
 * @property {Requirement} requirement - Detailed requirement type
 * @property {string}      description - Human-readable description of the requirement
 */

/**
 * Checks whether a passport holder needs a visa to travel to a destination country.
 *
 * Returns `true` if a visa of any kind is required (including e-visa).
 * Returns `false` if entry is visa-free, via visa-on-arrival, or via eTA only.
 * Returns `null` if no data is available for the given country pair.
 *
 * @param {VisaOptions} options
 * @returns {boolean|null} `true` = visa needed, `false` = no visa needed, `null` = unknown
 *
 * @throws {TypeError} If `from` or `to` are missing or not valid ISO 3166-1 alpha-2 codes.
 *
 * @example
 * needsVisa({ from: 'IN', to: 'FR' }) // true
 * needsVisa({ from: 'US', to: 'FR' }) // false
 * needsVisa({ from: 'in', to: 'fr' }) // true — case-insensitive
 */
export function needsVisa({ from, to } = {}) {
  const fromCode = normalizeCountryCode(from, "from");
  const toCode = normalizeCountryCode(to, "to");

  // same-country: no visa required
  if (fromCode === toCode) return false;

  const requirement = visaData[fromCode]?.[toCode];

  if (requirement === undefined) {
    return null;
  }

  if (VISA_FREE_REQUIREMENTS.has(requirement)) {
    return false;
  }

  if (VISA_REQUIRED_REQUIREMENTS.has(requirement)) {
    return true;
  }

  // no_admission and unknown
  return null;
}

/**
 * Returns detailed visa requirement information for a given country pair.
 *
 * @param {VisaOptions} options
 * @returns {VisaResult|null} Detailed result object, or `null` if no data found.
 *
 * @throws {TypeError} If `from` or `to` are invalid.
 *
 * @example
 * getVisaRequirement({ from: 'IN', to: 'TH' })
 * // {
 * //   from: 'IN',
 * //   to: 'TH',
 * //   required: false,
 * //   requirement: 'visa_on_arrival',
 * //   description: 'Visa can be obtained upon arrival. No prior embassy visit needed.'
 * // }
 */
export function getVisaRequirement({ from, to } = {}) {
  const fromCode = normalizeCountryCode(from, "from");
  const toCode = normalizeCountryCode(to, "to");

  const requirement = visaData[fromCode]?.[toCode];

  if (requirement === undefined) {
    return null;
  }

  const description =
    _meta.requirements[requirement] ?? "No description available.";
  const required = VISA_REQUIRED_REQUIREMENTS.has(requirement)
    ? true
    : VISA_FREE_REQUIREMENTS.has(requirement)
      ? false
      : null;

  return {
    from: fromCode,
    to: toCode,
    required,
    requirement,
    description,
  };
}

/**
 * Returns all destinations a passport holder can travel to without a visa
 * (visa-free, visa on arrival, or eTA only).
 *
 * @param {string} passportCountry - ISO 3166-1 alpha-2 code (e.g. "US")
 * @returns {string[]} Array of destination country codes
 *
 * @throws {TypeError} If passportCountry is not a valid code.
 *
 * @example
 * getVisaFreeDestinations('US') // ['FR', 'DE', 'GB', ...]
 */
export function getVisaFreeDestinations(passportCountry) {
  const fromCode = normalizeCountryCode(passportCountry, "passportCountry");
  const destinations = visaData[fromCode];

  if (!destinations) {
    return [];
  }

  return Object.entries(destinations)
    .filter(([, req]) => VISA_FREE_REQUIREMENTS.has(req))
    .map(([code]) => code)
    .sort();
}

/**
 * Returns all destinations where a passport holder requires a visa.
 *
 * @param {string} passportCountry - ISO 3166-1 alpha-2 code (e.g. "IN")
 * @returns {string[]} Array of destination country codes
 *
 * @throws {TypeError} If passportCountry is not a valid code.
 *
 * @example
 * getVisaRequiredDestinations('IN') // ['FR', 'DE', 'US', ...]
 */
export function getVisaRequiredDestinations(passportCountry) {
  const fromCode = normalizeCountryCode(passportCountry, "passportCountry");
  const destinations = visaData[fromCode];

  if (!destinations) {
    return [];
  }

  return Object.entries(destinations)
    .filter(([, req]) => VISA_REQUIRED_REQUIREMENTS.has(req))
    .map(([code]) => code)
    .sort();
}

/**
 * Returns all passport countries available in the data.
 *
 * @returns {string[]} Sorted array of ISO 3166-1 alpha-2 country codes.
 */
export function getSupportedPassports() {
  return Object.keys(visaData).sort();
}
