# needs-visa

> Instantly check visa requirements between any two countries

[![CI](https://github.com/libhh/needs-visa/actions/workflows/ci.yml/badge.svg)](https://github.com/libhh/needs-visa/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/needs-visa.svg)](https://www.npmjs.com/package/needs-visa)
[![Coverage Status](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](./coverage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero-dependency npm package that instantly checks visa requirements between any two countries from its bundled dataset of 199 nations. Works offline with no API calls or external dependencies.

Data is sourced from the [Passport Index data](https://github.com/imorte/passport-index-data) (MIT).

---

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Data](#data)
- [Error handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🚀 **Zero dependencies** — No external packages or API calls
- 🔌 **Offline-first** — All data bundled, works completely offline
- ⚡ **Sub-millisecond lookups** — Synchronous, pre-bundled visa data
- 🌍 **199 countries** — Comprehensive coverage of visa requirements
- 📦 **Lightweight** — Minimal package size with gzipped distribution
- 🤝 **TypeScript compatible** — Works seamlessly with TypeScript projects

---

## Install

```bash
npm install needs-visa
```

### Runtime

This package is written for **Node.js 18+** with ES modules and works in both CommonJS and ESM environments. It does **not** work in browsers (no DOM dependencies, but the bundled JSON data is optimized for Node.js).

### TypeScript

This package is written in JavaScript but is fully compatible with TypeScript. Import types if needed:

```ts
import { needsVisa } from "needs-visa";

const result = needsVisa({ from: "IN", to: "FR" }); // result is boolean | null
```

---

## Usage

```js
import { needsVisa } from "needs-visa";

needsVisa({ from: "IN", to: "FR" }); // true  — Indian passport needs a visa for France
needsVisa({ from: "US", to: "FR" }); // false — US passport is visa-free for France
needsVisa({ from: "IN", to: "TH" }); // false — visa on arrival counts as no visa needed
needsVisa({ from: "US", to: "AU" }); // false — eTA only, no visa needed
needsVisa({ from: "IN", to: "AU" }); // true  — e-visa required
needsVisa({ from: "in", to: "fr" }); // true  — codes are case-insensitive
```

Country codes must be **ISO 3166-1 alpha-2** (two-letter codes like `US`, `FR`, `IN`).

**Performance:** All lookups are synchronous and complete in under 1ms. The visa data is pre-bundled, so no initialization or loading is required.

### Return values

| Result  | Meaning                                             |
| ------- | --------------------------------------------------- |
| `true`  | A visa is required (including e-visa)               |
| `false` | No visa needed (visa-free, visa on arrival, or eTA) |
| `null`  | No data available for this country pair             |

---

## API

### `needsVisa({ from, to })`

Returns `true`, `false`, or `null`.

```js
needsVisa({ from: "IN", to: "FR" }); // true
needsVisa({ from: "US", to: "FR" }); // false
needsVisa({ from: "ZZ", to: "FR" }); // null — unknown country
```

---

### `getVisaRequirement({ from, to })`

Returns a detailed result object, or `null` if no data is available.

```js
import { getVisaRequirement } from "needs-visa";

// Visa on arrival
getVisaRequirement({ from: "IN", to: "TH" });
// {
//   from: 'IN',
//   to: 'TH',
//   required: false,
//   requirement: 'visa_on_arrival',
//   description: 'Visa can be obtained upon arrival. No prior embassy visit needed.'
// }

// Visa required
getVisaRequirement({ from: "IN", to: "FR" });
// {
//   from: 'IN',
//   to: 'FR',
//   required: true,
//   requirement: 'visa_required',
//   description: 'A visa is required before travel.'
// }

// No admission
getVisaRequirement({ from: "IL", to: "BN" });
// {
//   from: 'IL',
//   to: 'BN',
//   required: null,
//   requirement: 'no_admission',
//   description: 'Entry is not permitted with this passport.'
// }
```

#### Requirement types

| Value             | Meaning                                                      |
| ----------------- | ------------------------------------------------------------ |
| `visa_free`       | No visa needed                                               |
| `visa_on_arrival` | Visa obtainable on arrival, no embassy visit needed          |
| `eta`             | Electronic Travel Authorisation (apply online before travel) |
| `e_visa`          | Electronic visa required (apply online before travel)        |
| `visa_required`   | Visa required from embassy/consulate                         |
| `no_admission`    | Entry not permitted or passport not recognized               |

---

### `getVisaFreeDestinations(passportCountry)`

Returns a sorted array of destination country codes that require no visa.
Includes visa-free, visa-on-arrival, and eTA destinations.

```js
import { getVisaFreeDestinations } from "needs-visa";

getVisaFreeDestinations("US");
// ['AU', 'BR', 'CA', 'FR', 'DE', 'GB', 'JP', ...]
```

---

### `getVisaRequiredDestinations(passportCountry)`

Returns a sorted array of destinations where a visa is required (including e-visa).

```js
import { getVisaRequiredDestinations } from "needs-visa";

getVisaRequiredDestinations("IN");
// ['AU', 'CN', 'DE', 'FR', 'GB', 'NZ', 'SG', 'US', ...]
```

---

## Data

Visa requirements are bundled as a static JSON file — no network calls are made
at runtime. The data is sourced from the
[passport-index-data](https://github.com/imorte/passport-index-data) project (MIT license).

To refresh the data to the latest version:

```bash
npm run build:data
```

The data is also automatically refreshed monthly via a GitHub Actions workflow
that opens a pull request when upstream data changes.

> **⚠️ Important:** Visa requirements change frequently and vary by individual circumstances (employment, length of stay, purpose, etc.). This package provides general guidance only. **Always verify with official government sources** (embassy websites, immigration portals) before travelling.

---

## Error handling

Invalid country codes throw a `TypeError` with a descriptive message:

```js
needsVisa({ from: "INVALID", to: "FR" });
// TypeError: "from" must be a valid ISO 3166-1 alpha-2 country code (e.g. "US", "FR", "IN"). Received: "INVALID"

needsVisa({ to: "FR" });
// TypeError: "from" must be a non-empty string.
```

---

## Contributing

Found a bug or have a feature request? Please [open an issue](https://github.com/libhh/needs-visa/issues).

To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

All tests must pass: `npm run validate`

---

## License

Licensed under [MIT](/LICENSE)

Data from [passport-index-data](https://github.com/imorte/passport-index-data) — also MIT.
