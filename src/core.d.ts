/**
 * Visa requirement type union.
 */
export type Requirement =
  | "visa_free"
  | "visa_on_arrival"
  | "eta"
  | "e_visa"
  | "visa_required"
  | "no_admission"
  | "unknown";

/**
 * Options for visa check queries.
 */
export interface VisaOptions {
  /** ISO 3166-1 alpha-2 code of the passport country (e.g. "IN") */
  from: string;
  /** ISO 3166-1 alpha-2 code of the destination country (e.g. "FR") */
  to: string;
}

/**
 * Detailed visa requirement result.
 */
export interface VisaResult {
  /** Normalized passport country code */
  from: string;
  /** Normalized destination country code */
  to: string;
  /** true if a visa is needed before or upon travel, false if not needed, null if unknown */
  required: boolean | null;
  /** Detailed requirement type */
  requirement: Requirement;
  /** Human-readable description of the requirement */
  description: string;
}

/**
 * Checks whether a passport holder needs a visa to travel to a destination country.
 *
 * Returns `true` if a visa of any kind is required (including e-visa).
 * Returns `false` if entry is visa-free, via visa-on-arrival, or via eTA only.
 * Returns `null` if no data is available for the given country pair.
 *
 * @param options - Visa check options with 'from' and 'to' country codes
 * @returns `true` = visa needed, `false` = no visa needed, `null` = unknown
 *
 * @throws {TypeError} If `from` or `to` are missing or not valid ISO 3166-1 alpha-2 codes.
 *
 * @example
 * needsVisa({ from: 'IN', to: 'FR' }) // true
 * needsVisa({ from: 'US', to: 'FR' }) // false
 * needsVisa({ from: 'in', to: 'fr' }) // true — case-insensitive
 */
export function needsVisa(options: VisaOptions): boolean | null;

/**
 * Returns detailed visa requirement information for a given country pair.
 *
 * @param options - Visa check options with 'from' and 'to' country codes
 * @returns Detailed result object, or `null` if no data found.
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
export function getVisaRequirement(options: VisaOptions): VisaResult | null;

/**
 * Returns all destinations a passport holder can travel to without a visa
 * (visa-free, visa on arrival, or eTA only).
 *
 * @param passportCountry - ISO 3166-1 alpha-2 code (e.g. "US")
 * @returns Array of destination country codes sorted alphabetically
 *
 * @throws {TypeError} If passportCountry is not a valid code.
 *
 * @example
 * getVisaFreeDestinations('US') // ['FR', 'DE', 'GB', ...]
 */
export function getVisaFreeDestinations(passportCountry: string): string[];

/**
 * Returns all destinations where a passport holder requires a visa.
 *
 * @param passportCountry - ISO 3166-1 alpha-2 code (e.g. "IN")
 * @returns Array of destination country codes sorted alphabetically
 *
 * @throws {TypeError} If passportCountry is not a valid code.
 *
 * @example
 * getVisaRequiredDestinations('IN') // ['FR', 'DE', 'US', ...]
 */
export function getVisaRequiredDestinations(passportCountry: string): string[];
