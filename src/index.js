/**
 * needs-visa
 *
 * Check whether a passport holder needs a visa to travel between two countries.
 * Based on the Passport Index data covering 199 countries.
 *
 * @example
 * import { needsVisa } from 'needs-visa';
 *
 * needsVisa({ from: 'IN', to: 'FR' }) // true
 * needsVisa({ from: 'US', to: 'FR' }) // false
 * needsVisa({ from: 'IN', to: 'TH' }) // false (visa on arrival)
 *
 * @module needs-visa
 */

export {
  needsVisa,
  getVisaRequirement,
  getVisaFreeDestinations,
  getVisaRequiredDestinations,
} from "./core.js";
