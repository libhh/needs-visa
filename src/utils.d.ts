/**
 * Requirements that do NOT require obtaining a visa before travel.
 */
export declare const VISA_FREE_REQUIREMENTS: Set<string>;

/**
 * Requirements that DO require obtaining a visa before or upon travel.
 */
export declare const VISA_REQUIRED_REQUIREMENTS: Set<string>;

/**
 * Normalizes and validates a country code.
 *
 * @param code - Raw country code input
 * @param fieldName - Field name for error messages ('from' or 'to')
 * @returns Normalized uppercase ISO2 code
 * @throws {TypeError} If the code is not a valid ISO 3166-1 alpha-2 code
 */
export function normalizeCountryCode(code: any, fieldName: string): string;
