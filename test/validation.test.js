import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  needsVisa,
  getVisaRequirement,
  getVisaFreeDestinations,
  getVisaRequiredDestinations,
} from "../src/index.js";

describe("validation edge cases", () => {
  test("throws TypeError when null is passed as option object", () => {
    assert.throws(() => needsVisa(null), { name: "TypeError" });
    assert.throws(() => getVisaRequirement(null), { name: "TypeError" });
  });

  test("throws TypeError for null from/to values", () => {
    assert.throws(() => needsVisa({ from: null, to: "FR" }), {
      name: "TypeError",
    });
    assert.throws(() => needsVisa({ from: "US", to: null }), {
      name: "TypeError",
    });
  });

  test("functions ignore extra fields in options object and validate only required fields", () => {
    // extra fields should be ignored and not cause an error
    assert.equal(needsVisa({ from: "US", to: "FR", extra: 123 }), false);
    const detail = getVisaRequirement({ from: "US", to: "FR", extra: true });
    assert.equal(detail.from, "US");
  });

  test("public helpers throw consistent messages for invalid codes", () => {
    try {
      needsVisa({ from: "USA", to: "FR" });
      throw new Error("expected to throw");
    } catch (err) {
      assert.equal(err.name, "TypeError");
      assert.ok(/must be a valid ISO 3166-1 alpha-2/.test(err.message));
    }
  });

  test("getVisaFreeDestinations throws for null/invalid input", () => {
    assert.throws(() => getVisaFreeDestinations(null), { name: "TypeError" });
    assert.throws(() => getVisaFreeDestinations(123), { name: "TypeError" });
    assert.throws(() => getVisaFreeDestinations("USA"), { name: "TypeError" });
  });

  test("getVisaRequiredDestinations throws for null/invalid input", () => {
    assert.throws(() => getVisaRequiredDestinations(null), {
      name: "TypeError",
    });
    assert.throws(() => getVisaRequiredDestinations(0), { name: "TypeError" });
    assert.throws(() => getVisaRequiredDestinations("ZZZ"), {
      name: "TypeError",
    });
  });
});
