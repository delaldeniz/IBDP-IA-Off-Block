# Off Block

Flight delay probability for departures from Istanbul Airport (IST).
Built by Delal Deniz as an IBDP Computer Science Internal Assessment.

Enter a flight number and date. The site looks the flight up in the real schedule, then estimates the chance it
leaves 15 or more minutes late, based on a year of real IST departures.

## How it works

1. **Flight check.** The flight number and date are looked up in the AeroDataBox flight database. If the flight
   exists, the destination, airline, aircraft and time are filled in automatically. If the database says the flight
   does not exist, no result is given. If the database can't be reached, the user can enter the details by hand and
   the result is marked "not verified".
2. **Prediction.** Start with how often flights at that departure hour were late, then multiply by a factor for the
   month, airline, route, aircraft, weekday and weather forecast (from Open-Meteo). Each factor is softened because
   they partly overlap.
3. **Where the numbers come from.** `scripts/computeFactors.cjs` reads the dataset (490,920 IST departures,
   July 2025 – June 2026) and writes every number the prediction uses to `src/data/factors.json`. It also tests the
   method on 20% of the flights it never learned from. The results are shown on the Statistics page.

## Run it on your computer

Requires [Node.js](https://nodejs.org).

```
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

### Flight check key

The flight check needs a free AeroDataBox key from RapidAPI (rapid.aerodatabox.com, Basic plan).
Copy `.env.example` to `.env.local` and put the key after the `=`:

```
VITE_AERODATABOX_KEY=your-key
```

Restart `npm run dev` after changing it. `.env.local` is not uploaded to GitHub.

### Recalculate the factors

```
node scripts/computeFactors.cjs "path/to/the/data/folder"
```

## Project structure

| Folder / file | What it is |
| --- | --- |
| `src/pages/` | The four pages: Home, Statistics, History, About |
| `src/components/` | Parts of the pages (boarding pass, departure board, hour chart, route map...) |
| `src/components/controls/` | The custom dropdown, destination search, calendar and time picker |
| `src/data.js` | The prediction |
| `src/data/factors.json` | All numbers the prediction uses (generated, don't edit by hand) |
| `src/data/flightLookup.js` | The flight check (AeroDataBox) |
| `src/data/history.js` | Saved checks (stored only in the browser) |
| `src/effects/` | Animations and smooth scrolling |
| `src/styles/` | The styles; `tokens.css` holds the colours, fonts and spacing |
| `scripts/computeFactors.cjs` | Calculates the factors from the dataset and tests them |

## Built with

React, Vite, GSAP, Lenis, d3-geo. Flight data: AeroDataBox. Weather: Open-Meteo.
