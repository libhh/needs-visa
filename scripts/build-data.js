/**
 * scripts/build-data.js
 *
 * Fetches the latest passport-index-tidy-iso2.csv from the official
 * imorte/passport-index-data GitHub repository and converts it
 * into an optimized JSON lookup table used by the package at runtime.
 *
 * Run with: node scripts/build-data.js
 *
 * The output file is committed to the repo so the package works
 * without any network access at runtime.
 *
 * Data source: https://github.com/imorte/passport-index-data
 * License: MIT
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CSV_URL =
  "https://raw.githubusercontent.com/imorte/passport-index-data/refs/heads/main/passport-index-tidy-iso2.csv";

const OUTPUT_PATH = resolve(__dirname, "../data/visa-requirements.json");

/**
 * Requirement values from the data and what they map to.
 *
 * Raw values in the CSV:
 *   -1              = no admission / not recognized
 *   "visa free"     = visa free (duration unknown or unlimited, e.g. EU freedom of movement)
 *   <number>        = visa free for N days
 *   "visa on arrival" = visa on arrival
 *   "e-visa"        = electronic visa required
 *   "eta"           = Electronic Travel Authorisation required (new in Jan 2025)
 *   "visa required" = visa required
 */
const REQUIREMENT_MAP = {
  "-1": "no_admission",
  "visa free": "visa_free",
  "visa on arrival": "visa_on_arrival",
  "e-visa": "e_visa",
  eta: "eta",
  "visa required": "visa_required",
};

function normalizeRequirement(raw) {
  const trimmed = raw.trim().toLowerCase();

  // Numeric string = visa free for N days (also maps to visa_free)
  if (/^\d+$/.test(trimmed)) {
    return "visa_free";
  }

  return REQUIREMENT_MAP[trimmed] ?? "unknown";
}

async function fetchCSV(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch CSV file: ${res.status} ${res.statusText}`,
    );
  }

  return res.text();
}

function parseCSV(csv) {
  const lines = csv.trim().split("\n");

  // Skip header row
  const rows = lines.slice(1);

  const data = {};
  const unknownValues = new Set();

  for (const line of rows) {
    // CSV columns: Passport,Destination,Requirement
    const commaIndex = line.indexOf(",");
    const secondCommaIndex = line.indexOf(",", commaIndex + 1);

    const from = line.slice(0, commaIndex).trim().toUpperCase();
    const to = line
      .slice(commaIndex + 1, secondCommaIndex)
      .trim()
      .toUpperCase();
    const rawRequirement = line
      .slice(secondCommaIndex + 1)
      .trim()
      .replace(/^"|"$/g, "");

    const requirement = normalizeRequirement(rawRequirement);

    if (requirement === "unknown") {
      unknownValues.add(rawRequirement);
    }

    if (!data[from]) {
      data[from] = {};
    }

    data[from][to] = requirement;
  }

  if (unknownValues.size > 0) {
    console.warn('⚠️  Unknown requirement values found (mapped to "unknown"):');
    for (const v of unknownValues) {
      console.warn(`   "${v}"`);
    }
  }

  return data;
}

function buildStats(data) {
  const passports = Object.keys(data);
  let totalPairs = 0;
  const counts = {};

  for (const from of passports) {
    for (const to of Object.keys(data[from])) {
      totalPairs++;
      const req = data[from][to];
      counts[req] = (counts[req] ?? 0) + 1;
    }
  }

  return { passports: passports.length, totalPairs, counts };
}

async function main() {
  try {
    const csv = await fetchCSV(CSV_URL);
    const data = parseCSV(csv);
    const stats = buildStats(data);

    const output = {
      _meta: {
        source: "https://github.com/imorte/passport-index-data",
        license: "MIT",
        generatedAt: new Date().toISOString(),
        passportCount: stats.passports,
        totalPairs: stats.totalPairs,
        requirementCounts: stats.counts,
        requirements: {
          visa_free:
            "No visa needed. Entry is free (includes visa-free + limited stays).",
          visa_on_arrival:
            "Visa can be obtained upon arrival. No prior embassy visit needed.",
          eta: "Electronic Travel Authorisation required. Applied online before travel.",
          e_visa:
            "Electronic visa required. Must be obtained online before travel.",
          visa_required:
            "A visa must be obtained from an embassy/consulate before travel.",
          no_admission: "Entry not permitted or passport not recognized.",
          unknown: "Requirement unknown. Check official government sources.",
        },
      },
      data,
    };

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

    console.log("✅  Data built successfully!");
    console.log(`📄  Output: ${OUTPUT_PATH}`);
    console.log(`\n📊  Stats:`);
    console.log(`    Passports : ${stats.passports}`);
    console.log(`    Total pairs: ${stats.totalPairs}`);
    console.log(`\n    Breakdown by requirement:`);
    for (const [key, count] of Object.entries(stats.counts)) {
      console.log(`      ${key.padEnd(20)} ${count}`);
    }
  } catch (err) {
    console.error("❌  Build failed:", err.message);
    process.exit(1);
  }
}

main();
