import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  needsVisa,
  getVisaRequirement,
  getVisaFreeDestinations,
  getVisaRequiredDestinations,
} from "../src/index.js";

// ─── needsVisa ───────────────────────────────────────────────────────────────

describe("needsVisa()", () => {
  describe("returns true (visa required)", () => {
    test("IN → FR requires a visa", () => {
      assert.equal(needsVisa({ from: "IN", to: "FR" }), true);
    });

    test("IN → US requires a visa", () => {
      assert.equal(needsVisa({ from: "IN", to: "US" }), true);
    });

    test("IN → DE requires a visa", () => {
      assert.equal(needsVisa({ from: "IN", to: "DE" }), true);
    });

    test("CN → US requires a visa", () => {
      assert.equal(needsVisa({ from: "CN", to: "US" }), true);
    });

    test("NG → US requires a visa", () => {
      assert.equal(needsVisa({ from: "NG", to: "US" }), true);
    });

    test("e-visa counts as visa required (IN → AU)", () => {
      assert.equal(needsVisa({ from: "IN", to: "AU" }), true);
    });

    test("e-visa counts as visa required (US → IN)", () => {
      assert.equal(needsVisa({ from: "US", to: "IN" }), true);
    });
  });

  describe("returns false (no visa needed)", () => {
    test("US → FR is visa-free", () => {
      assert.equal(needsVisa({ from: "US", to: "FR" }), false);
    });

    test("GB → US is visa-free", () => {
      assert.equal(needsVisa({ from: "GB", to: "US" }), false);
    });

    test("JP → US is visa-free", () => {
      assert.equal(needsVisa({ from: "JP", to: "US" }), false);
    });

    test("visa on arrival counts as no visa (IN → TH)", () => {
      assert.equal(needsVisa({ from: "IN", to: "TH" }), false);
    });

    test("visa on arrival counts as no visa (IN → MV)", () => {
      assert.equal(needsVisa({ from: "IN", to: "MV" }), false);
    });

    test("eTA counts as no visa (US → AU)", () => {
      assert.equal(needsVisa({ from: "US", to: "AU" }), false);
    });

    test("eTA counts as no visa (GB → AU)", () => {
      assert.equal(needsVisa({ from: "GB", to: "AU" }), false);
    });

    test("same country always returns false (IN → IN)", () => {
      assert.equal(needsVisa({ from: "IN", to: "IN" }), false);
    });

    test("same country always returns false (US → US)", () => {
      assert.equal(needsVisa({ from: "US", to: "US" }), false);
    });

    test("same country returns false even if not in dataset (DK → DK)", () => {
      assert.equal(needsVisa({ from: "DK", to: "DK" }), false);
    });
  });

  describe("returns null for no_admission pairs", () => {
    test("IL → BN returns null (entry not permitted)", () => {
      // no_admission is distinct from visa_required — it means the country
      // does not recognize the passport or explicitly bars entry entirely
      assert.equal(needsVisa({ from: "IL", to: "BN" }), null);
    });

    test("no_admission is not the same as visa_required", () => {
      // visa_required returns true, no_admission returns null
      assert.equal(needsVisa({ from: "BN", to: "DZ" }), true); // visa_required
      assert.equal(needsVisa({ from: "IL", to: "BN" }), null); // no_admission
      assert.notEqual(
        needsVisa({ from: "BN", to: "DZ" }),
        needsVisa({ from: "IL", to: "BN" }),
      );
    });

    test("no_admission is not the same as an unknown/missing pair", () => {
      // Both return null but for different reasons:
      // no_admission is a known explicit value, missing pair means no data at all.
      // getVisaRequirement() can distinguish them — no_admission has a result object,
      // missing pair returns null entirely.
      const noAdmissionDetail = getVisaRequirement({ from: "IL", to: "BN" });
      const missingPairDetail = getVisaRequirement({ from: "ZZ", to: "FR" });
      assert.equal(noAdmissionDetail.requirement, "no_admission");
      assert.equal(missingPairDetail, null);
    });

    test("no_admission with lowercase input still returns null", () => {
      assert.equal(needsVisa({ from: "il", to: "bn" }), null);
    });

    test("no_admission with mixed case input still returns null", () => {
      assert.equal(needsVisa({ from: "Il", to: "Bn" }), null);
    });
  });

  describe("returns null for unknown pairs", () => {
    test("returns null for unknown passport country", () => {
      assert.equal(needsVisa({ from: "ZZ", to: "FR" }), null);
    });

    test("returns null when destination is not in dataset", () => {
      assert.equal(needsVisa({ from: "US", to: "ZZ" }), null);
    });

    test("returns null when both countries are unknown", () => {
      assert.equal(needsVisa({ from: "ZZ", to: "XX" }), null);
    });
  });

  describe("case-insensitive input", () => {
    test("lowercase codes work (in → fr)", () => {
      assert.equal(needsVisa({ from: "in", to: "fr" }), true);
    });

    test("mixed case works (In → Fr)", () => {
      assert.equal(needsVisa({ from: "In", to: "Fr" }), true);
    });

    test("lowercase visa-free pair works (us → fr)", () => {
      assert.equal(needsVisa({ from: "us", to: "fr" }), false);
    });
  });

  describe("input validation errors", () => {
    test('throws TypeError when "from" is missing', () => {
      assert.throws(() => needsVisa({ to: "FR" }), { name: "TypeError" });
    });

    test('throws TypeError when "to" is missing', () => {
      assert.throws(() => needsVisa({ from: "IN" }), { name: "TypeError" });
    });

    test("throws TypeError when options object is missing", () => {
      assert.throws(() => needsVisa(), { name: "TypeError" });
    });

    test('throws TypeError for non-string "from"', () => {
      assert.throws(() => needsVisa({ from: 42, to: "FR" }), {
        name: "TypeError",
      });
    });

    test('throws TypeError for empty string "from"', () => {
      assert.throws(() => needsVisa({ from: "", to: "FR" }), {
        name: "TypeError",
      });
    });

    test('throws TypeError for invalid country code "from" (too long)', () => {
      assert.throws(() => needsVisa({ from: "IND", to: "FR" }), {
        name: "TypeError",
      });
    });

    test("throws TypeError for numeric string code", () => {
      assert.throws(() => needsVisa({ from: "12", to: "FR" }), {
        name: "TypeError",
      });
    });
  });
});

// ─── getVisaRequirement ──────────────────────────────────────────────────────

describe("getVisaRequirement()", () => {
  test("returns full result object for IN → FR", () => {
    const result = getVisaRequirement({ from: "IN", to: "FR" });
    assert.deepEqual(result, {
      from: "IN",
      to: "FR",
      required: true,
      requirement: "visa_required",
      description:
        "A visa must be obtained from an embassy/consulate before travel.",
    });
  });

  test("returns correct result for visa on arrival (IN → TZ)", () => {
    const result = getVisaRequirement({ from: "IN", to: "TZ" });
    assert.equal(result.required, false);
    assert.equal(result.requirement, "visa_on_arrival");
    assert.equal(typeof result.description, "string");
  });

  test("returns correct result for eTA (US → AU)", () => {
    const result = getVisaRequirement({ from: "US", to: "AU" });
    assert.equal(result.required, false);
    assert.equal(result.requirement, "eta");
  });

  test("returns correct result for e-visa (IN → AU)", () => {
    const result = getVisaRequirement({ from: "IN", to: "AU" });
    assert.equal(result.required, true);
    assert.equal(result.requirement, "e_visa");
  });

  test("same country returns visa_free (DK → DK)", () => {
    const result = getVisaRequirement({ from: "DK", to: "DK" });
    assert.equal(result.required, false);
    assert.equal(result.requirement, "visa_free");
  });

  describe("no_admission cases", () => {
    test("returns result object with no_admission requirement (IL → BN)", () => {
      const result = getVisaRequirement({ from: "IL", to: "BN" });
      assert.equal(result.requirement, "no_admission");
    });

    test("no_admission has required set to null", () => {
      // required is null because the question of "do you need a visa" doesn't
      // apply — the issue is entry is not permitted at all
      const result = getVisaRequirement({ from: "IL", to: "BN" });
      assert.equal(result.required, null);
    });

    test("no_admission includes from and to codes", () => {
      const result = getVisaRequirement({ from: "IL", to: "BN" });
      assert.equal(result.from, "IL");
      assert.equal(result.to, "BN");
    });

    test("no_admission includes a non-empty description", () => {
      const result = getVisaRequirement({ from: "IL", to: "BN" });
      assert.equal(typeof result.description, "string");
      assert.ok(result.description.length > 0);
    });

    test("no_admission result object has all expected keys", () => {
      const result = getVisaRequirement({ from: "IL", to: "BN" });
      assert.ok("from" in result);
      assert.ok("to" in result);
      assert.ok("required" in result);
      assert.ok("requirement" in result);
      assert.ok("description" in result);
    });

    test("no_admission is different from a missing pair (which returns null)", () => {
      const noAdmission = getVisaRequirement({ from: "IL", to: "BN" });
      const missingPair = getVisaRequirement({ from: "ZZ", to: "FR" });
      assert.ok(noAdmission !== null); // no_admission has a result object
      assert.equal(missingPair, null); // missing pair has no result at all
      assert.equal(noAdmission.requirement, "no_admission");
    });
  });

  test("returns null for unknown pair", () => {
    const result = getVisaRequirement({ from: "ZZ", to: "FR" });
    assert.equal(result, null);
  });

  test("throws TypeError for invalid input", () => {
    assert.throws(() => getVisaRequirement({ from: "INVALID", to: "FR" }), {
      name: "TypeError",
    });
  });

  test("normalizes country codes in response", () => {
    const result = getVisaRequirement({ from: "in", to: "fr" });
    assert.equal(result.from, "IN");
    assert.equal(result.to, "FR");
  });
});

// ─── getVisaFreeDestinations ─────────────────────────────────────────────────

describe("getVisaFreeDestinations()", () => {
  test("returns an array for US passport", () => {
    const destinations = getVisaFreeDestinations("US");
    assert.ok(Array.isArray(destinations));
    assert.ok(destinations.length > 0);
  });

  test("includes visa-free countries for US (FR, DE, GB)", () => {
    const destinations = getVisaFreeDestinations("US");
    assert.ok(destinations.includes("FR"));
    assert.ok(destinations.includes("DE"));
    assert.ok(destinations.includes("GB"));
  });

  test("includes eTA destinations for US (AU)", () => {
    const destinations = getVisaFreeDestinations("US");
    assert.ok(destinations.includes("AU"));
  });

  test("includes visa on arrival destinations for IN (TH, MV)", () => {
    const destinations = getVisaFreeDestinations("IN");
    assert.ok(destinations.includes("TH"));
    assert.ok(destinations.includes("MV"));
  });

  test("does NOT include visa-required destinations", () => {
    const destinations = getVisaFreeDestinations("IN");
    assert.ok(!destinations.includes("FR"));
    assert.ok(!destinations.includes("US"));
  });

  test("does NOT include no_admission destinations (IL → BN)", () => {
    const destinations = getVisaFreeDestinations("IL");
    assert.ok(!destinations.includes("BN"));
  });

  test("returns sorted array", () => {
    const destinations = getVisaFreeDestinations("US");
    const sorted = [...destinations].sort();
    assert.deepEqual(destinations, sorted);
  });

  test("returns empty array for unknown passport", () => {
    const destinations = getVisaFreeDestinations("ZZ");
    assert.deepEqual(destinations, []);
  });

  test("throws TypeError for invalid code", () => {
    assert.throws(() => getVisaFreeDestinations("USA"), { name: "TypeError" });
  });
});

// ─── getVisaRequiredDestinations ─────────────────────────────────────────────

describe("getVisaRequiredDestinations()", () => {
  test("returns an array for IN passport", () => {
    const destinations = getVisaRequiredDestinations("IN");
    assert.ok(Array.isArray(destinations));
    assert.ok(destinations.length > 0);
  });

  test("includes visa-required destinations for IN (FR, US, DE)", () => {
    const destinations = getVisaRequiredDestinations("IN");
    assert.ok(destinations.includes("FR"));
    assert.ok(destinations.includes("US"));
    assert.ok(destinations.includes("DE"));
  });

  test("includes e-visa destinations for IN (AU, MD)", () => {
    const destinations = getVisaRequiredDestinations("IN");
    assert.ok(destinations.includes("AU"));
    assert.ok(destinations.includes("MD"));
  });

  test("does NOT include visa-free destinations", () => {
    const destinations = getVisaRequiredDestinations("IN");
    assert.ok(!destinations.includes("NP"));
  });

  test("does NOT include no_admission destinations (IL → BN)", () => {
    // no_admission is not the same as visa_required — it should not appear here
    const destinations = getVisaRequiredDestinations("IL");
    assert.ok(!destinations.includes("BN"));
  });

  test("returns sorted array", () => {
    const destinations = getVisaRequiredDestinations("IN");
    const sorted = [...destinations].sort();
    assert.deepEqual(destinations, sorted);
  });

  test("returns empty array for unknown passport", () => {
    const destinations = getVisaRequiredDestinations("ZZ");
    assert.deepEqual(destinations, []);
  });
});
