# needs-visa

> Check whether a passport holder needs a visa to travel between two countries.

[![CI](https://github.com/yourusername/needs-visa/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/needs-visa/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/needs-visa.svg)](https://www.npmjs.com/package/needs-visa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, zero-dependency JavaScript package that tells you whether citizens
of one country need a visa to visit another. Covers **199 countries**, works offline,
and includes no API keys or network calls at runtime.

Data is sourced from the [Passport Index data](https://github.com/imorte/passport-index-data) (MIT).

---

## Install

```bash
npm install needs-visa
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

getVisaRequirement({ from: "IN", to: "TH" });
// {
//   from: 'IN',
//   to: 'TH',
//   required: false,
//   requirement: 'visa_on_arrival',
//   description: 'Visa can be obtained upon arrival. No prior embassy visit needed.'
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

### `getSupportedPassports()`

Returns a sorted array of all passport country codes in the data.

```js
import { getSupportedPassports } from "needs-visa";

getSupportedPassports();
// ['AD', 'AE', 'AF', 'AG', ..., 'ZW'] — 199 countries
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

> **Note:** Visa requirements change frequently. Always verify with official
> government sources before travelling.

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

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details,
especially if you want to update or correct visa data.

---

## License

MIT © Ali Behbudov

Data from [passport-index-data](https://github.com/imorte/passport-index-data) — also MIT.
