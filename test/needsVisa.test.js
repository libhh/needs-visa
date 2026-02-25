import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  needsVisa,
  getVisaRequirement,
  getVisaFreeDestinations,
  getVisaRequiredDestinations,
  getSupportedPassports,
} from '../src/index.js';

// ─── needsVisa ───────────────────────────────────────────────────────────────

describe('needsVisa()', () => {
  describe('returns true (visa required)', () => {
    test('IN → FR requires a visa', () => {
      assert.equal(needsVisa({ from: 'IN', to: 'FR' }), true);
    });

    test('IN → US requires a visa', () => {
      assert.equal(needsVisa({ from: 'IN', to: 'US' }), true);
    });

    test('IN → DE requires a visa', () => {
      assert.equal(needsVisa({ from: 'IN', to: 'DE' }), true);
    });

    test('CN → US requires a visa', () => {
      assert.equal(needsVisa({ from: 'CN', to: 'US' }), true);
    });

    test('NG → US requires a visa', () => {
      assert.equal(needsVisa({ from: 'NG', to: 'US' }), true);
    });

    test('e-visa counts as visa required (IN → AU)', () => {
      assert.equal(needsVisa({ from: 'IN', to: 'AU' }), true);
    });

    test('e-visa counts as visa required (US → IN)', () => {
      assert.equal(needsVisa({ from: 'US', to: 'IN' }), true);
    });
  });

  describe('returns false (no visa needed)', () => {
    test('US → FR is visa-free', () => {
      assert.equal(needsVisa({ from: 'US', to: 'FR' }), false);
    });

    test('GB → US is visa-free', () => {
      assert.equal(needsVisa({ from: 'GB', to: 'US' }), false);
    });

    test('JP → US is visa-free', () => {
      assert.equal(needsVisa({ from: 'JP', to: 'US' }), false);
    });

    test('visa on arrival counts as no visa (IN → TH)', () => {
      assert.equal(needsVisa({ from: 'IN', to: 'TH' }), false);
    });

    test('visa on arrival counts as no visa (IN → MV)', () => {
      assert.equal(needsVisa({ from: 'IN', to: 'MV' }), false);
    });

    test('eTA counts as no visa (US → AU)', () => {
      assert.equal(needsVisa({ from: 'US', to: 'AU' }), false);
    });

    test('eTA counts as no visa (GB → AU)', () => {
      assert.equal(needsVisa({ from: 'GB', to: 'AU' }), false);
    });

    test('same country always returns false (IN → IN)', () => {
      assert.equal(needsVisa({ from: 'IN', to: 'IN' }), false);
    });

    test('same country always returns false (US → US)', () => {
      assert.equal(needsVisa({ from: 'US', to: 'US' }), false);
    });
  });

  describe('case-insensitive input', () => {
    test('lowercase codes work (in → fr)', () => {
      assert.equal(needsVisa({ from: 'in', to: 'fr' }), true);
    });

    test('mixed case works (In → Fr)', () => {
      assert.equal(needsVisa({ from: 'In', to: 'Fr' }), true);
    });

    test('uppercase visa-free pair works (US → FR)', () => {
      assert.equal(needsVisa({ from: 'us', to: 'fr' }), false);
    });
  });

  describe('returns null for unknown pairs', () => {
    test('returns null for unknown country pair', () => {
      assert.equal(needsVisa({ from: 'ZZ', to: 'FR' }), null);
    });

    test('returns null when destination is missing from data', () => {
      assert.equal(needsVisa({ from: 'US', to: 'ZZ' }), null);
    });
  });

  describe('input validation errors', () => {
    test('throws TypeError when "from" is missing', () => {
      assert.throws(() => needsVisa({ to: 'FR' }), { name: 'TypeError' });
    });

    test('throws TypeError when "to" is missing', () => {
      assert.throws(() => needsVisa({ from: 'IN' }), { name: 'TypeError' });
    });

    test('throws TypeError when options object is missing', () => {
      assert.throws(() => needsVisa(), { name: 'TypeError' });
    });

    test('throws TypeError for non-string "from"', () => {
      assert.throws(() => needsVisa({ from: 42, to: 'FR' }), { name: 'TypeError' });
    });

    test('throws TypeError for empty string "from"', () => {
      assert.throws(() => needsVisa({ from: '', to: 'FR' }), { name: 'TypeError' });
    });

    test('throws TypeError for invalid country code "from" (too long)', () => {
      assert.throws(() => needsVisa({ from: 'IND', to: 'FR' }), { name: 'TypeError' });
    });

    test('throws TypeError for numeric string code', () => {
      assert.throws(() => needsVisa({ from: '12', to: 'FR' }), { name: 'TypeError' });
    });
  });
});

// ─── getVisaRequirement ──────────────────────────────────────────────────────

describe('getVisaRequirement()', () => {
  test('returns full result object for IN → FR', () => {
    const result = getVisaRequirement({ from: 'IN', to: 'FR' });
    assert.deepEqual(result, {
      from: 'IN',
      to: 'FR',
      required: true,
      requirement: 'visa_required',
      description: 'A visa must be obtained from an embassy/consulate before travel.',
    });
  });

  test('returns correct result for eTA (US → AU)', () => {
    const result = getVisaRequirement({ from: 'US', to: 'AU' });
    assert.equal(result.required, false);
    assert.equal(result.requirement, 'eta');
  });

  test('returns correct result for e-visa (IN → AU)', () => {
    const result = getVisaRequirement({ from: 'IN', to: 'AU' });
    assert.equal(result.required, true);
    assert.equal(result.requirement, 'e_visa');
  });

  test('returns null for unknown pair', () => {
    const result = getVisaRequirement({ from: 'ZZ', to: 'FR' });
    assert.equal(result, null);
  });

  test('throws TypeError for invalid input', () => {
    assert.throws(() => getVisaRequirement({ from: 'INVALID', to: 'FR' }), { name: 'TypeError' });
  });

  test('normalizes country codes in response', () => {
    const result = getVisaRequirement({ from: 'in', to: 'fr' });
    assert.equal(result.from, 'IN');
    assert.equal(result.to, 'FR');
  });
});

// ─── getVisaFreeDestinations ─────────────────────────────────────────────────

describe('getVisaFreeDestinations()', () => {
  test('returns an array for US passport', () => {
    const destinations = getVisaFreeDestinations('US');
    assert.ok(Array.isArray(destinations));
    assert.ok(destinations.length > 0);
  });

  test('includes visa-free countries for US (FR, DE, GB)', () => {
    const destinations = getVisaFreeDestinations('US');
    assert.ok(destinations.includes('FR'));
    assert.ok(destinations.includes('DE'));
    assert.ok(destinations.includes('GB'));
  });

  test('includes eTA destinations for US (AU)', () => {
    const destinations = getVisaFreeDestinations('US');
    assert.ok(destinations.includes('AU'));
  });

  test('includes visa on arrival destinations for IN (TH, MV)', () => {
    const destinations = getVisaFreeDestinations('IN');
    assert.ok(destinations.includes('TH'));
    assert.ok(destinations.includes('MV'));
  });

  test('does NOT include visa-required destinations', () => {
    const destinations = getVisaFreeDestinations('IN');
    assert.ok(!destinations.includes('FR'));
    assert.ok(!destinations.includes('US'));
  });

  test('returns sorted array', () => {
    const destinations = getVisaFreeDestinations('US');
    const sorted = [...destinations].sort();
    assert.deepEqual(destinations, sorted);
  });

  test('returns empty array for unknown passport', () => {
    const destinations = getVisaFreeDestinations('ZZ');
    assert.deepEqual(destinations, []);
  });

  test('throws TypeError for invalid code', () => {
    assert.throws(() => getVisaFreeDestinations('USA'), { name: 'TypeError' });
  });
});

// ─── getVisaRequiredDestinations ─────────────────────────────────────────────

describe('getVisaRequiredDestinations()', () => {
  test('returns an array for IN passport', () => {
    const destinations = getVisaRequiredDestinations('IN');
    assert.ok(Array.isArray(destinations));
    assert.ok(destinations.length > 0);
  });

  test('includes visa-required destinations for IN (FR, US, DE)', () => {
    const destinations = getVisaRequiredDestinations('IN');
    assert.ok(destinations.includes('FR'));
    assert.ok(destinations.includes('US'));
    assert.ok(destinations.includes('DE'));
  });

  test('includes e-visa destinations for IN (AU, NZ)', () => {
    const destinations = getVisaRequiredDestinations('IN');
    assert.ok(destinations.includes('AU'));
    assert.ok(destinations.includes('NZ'));
  });

  test('does NOT include visa-free destinations', () => {
    const destinations = getVisaRequiredDestinations('IN');
    assert.ok(!destinations.includes('NP'));
  });

  test('returns empty array for unknown passport', () => {
    const destinations = getVisaRequiredDestinations('ZZ');
    assert.deepEqual(destinations, []);
  });
});

// ─── getSupportedPassports ───────────────────────────────────────────────────

describe('getSupportedPassports()', () => {
  test('returns a non-empty sorted array', () => {
    const passports = getSupportedPassports();
    assert.ok(Array.isArray(passports));
    assert.ok(passports.length > 0);

    const sorted = [...passports].sort();
    assert.deepEqual(passports, sorted);
  });

  test('includes common passports', () => {
    const passports = getSupportedPassports();
    assert.ok(passports.includes('US'));
    assert.ok(passports.includes('IN'));
    assert.ok(passports.includes('GB'));
    assert.ok(passports.includes('DE'));
  });

  test('all entries are valid ISO2 codes', () => {
    const passports = getSupportedPassports();
    for (const code of passports) {
      assert.match(code, /^[A-Z]{2}$/, `Expected ISO2 format, got: ${code}`);
    }
  });
});