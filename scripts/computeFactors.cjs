// Calculates every number the prediction uses from the real IST dataset (one CSV per day).
// Usage:  node scripts/computeFactors.cjs "<path to the data folder>"
// Output: src/data/factors.json
//
// A "factor" = delay rate of that group / overall delay rate.
// 1.20 means 20% more delays than an average IST departure, 0.80 means 20% fewer.
const fs = require("fs");
const path = require("path");

const dataDir = process.argv[2];
if (!dataDir) throw new Error('Give the data folder, e.g. node scripts/computeFactors.cjs "C:/.../data"');

const LATE = 15; // minutes; a flight 15+ minutes late counts as delayed
const SMOOTH = 300; // small groups are pulled towards 1.0, as if they had 300 extra "average" flights

// codes the website offers in its lists
const airlines = [...fs.readFileSync("src/data.js", "utf8").matchAll(/"?([A-Z0-9]{2})"?: "/g)].map((m) => m[1]);
const routes = [...fs.readFileSync("src/data/destinations.js", "utf8").matchAll(/\["([A-Z]{3})"/g)].map((m) => m[1]);

// same mapping the flight lookup uses, so the factors match what the site sends
const aircraftRules = [
  [/A321.*NEO/, "Airbus A321 NEO"], [/A321/, "Airbus A321"],
  [/A320.*NEO/, "Airbus A320 NEO"], [/A320/, "Airbus A320"], [/A319/, "Airbus A319"],
  [/A330-2/, "Airbus A330-200"], [/A330-3/, "Airbus A330-300"], [/A330/, "Airbus A330"], [/A350/, "Airbus A350-900"],
  [/MAX/, "Boeing 737"], [/737-8/, "Boeing 737-800"], [/737-9/, "Boeing 737-900"], [/737/, "Boeing 737"],
  [/777/, "Boeing 777-300ER"], [/787/, "Boeing 787-9"]
];
const aircraftGroup = (m) => aircraftRules.find(([re]) => re.test(m.toUpperCase()))?.[1] || "OTHER";

// turn the airport weather report (METAR) into the same 7 groups the forecast uses
function weatherGroup(r) {
  const codes = r.wx_weather_codes === "M" ? "" : r.wx_weather_codes;
  const vis = parseFloat(r.wx_visibility_mi);
  const wind = parseFloat(r.wx_wind_speed_kt) || 0;
  const gust = parseFloat(r.wx_wind_gust_kt) || 0;
  if (codes.includes("TS")) return "storm";
  if (codes.includes("SN")) return "snow";
  if (codes.includes("FG") || vis < 0.62) return "fog"; // under 1 km visibility
  if (wind >= 22 || gust >= 30) return "wind"; // about 40 km/h
  if (/RA|DZ|SH/.test(codes)) return "rain";
  if (/BKN|OVC/.test(r.wx_sky_cover_1)) return "cloudy";
  return "clear";
}

function parseLine(line) {
  const out = [];
  let cell = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cell);
      cell = "";
    } else cell += ch;
  }
  out.push(cell);
  return out;
}

// counters: [flights, delayed]
const make = () => ({});
const add = (table, key, late) => {
  table[key] = table[key] || [0, 0];
  table[key][0]++;
  table[key][1] += late;
};
const hour = make(), month = make(), day = make(), airline = make(), route = make(), aircraft = make(), weather = make();
let flights = 0, delayed = 0;
const rows = []; // kept for the strength test below

for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith(".csv"))) {
  const lines = fs.readFileSync(path.join(dataDir, file), "utf8").split(/\r?\n/).filter(Boolean);
  const head = parseLine(lines[0]);
  for (const line of lines.slice(1)) {
    const cells = parseLine(line);
    const r = Object.fromEntries(head.map((h, i) => [h, cells[i]]));
    if (/Cancel/.test(r.status)) continue; // cancelled flights never departed
    const minutes = parseFloat(r.delay_minutes);
    if (isNaN(minutes)) continue;

    const late = minutes >= LATE ? 1 : 0;
    flights++;
    delayed += late;
    const row = {
      hour: parseInt(r.scheduled_local.slice(11, 13), 10),
      month: parseInt(r.flight_date.slice(5, 7), 10),
      day: new Date(r.flight_date + "T00:00:00Z").getUTCDay(),
      airline: airlines.includes(r.airline_iata) ? r.airline_iata : "OTHER",
      route: routes.includes(r.destination_airport_iata) ? r.destination_airport_iata : "OTHER",
      aircraft: aircraftGroup(r.aircraft_model || ""),
      weather: weatherGroup(r),
      late
    };
    rows.push(row);
    add(hour, row.hour, late);
    add(month, row.month, late);
    add(day, row.day, late);
    add(airline, row.airline, late);
    add(route, row.route, late);
    add(aircraft, row.aircraft, late);
    add(weather, row.weather, late);
  }
}

const avg = delayed / flights;
const pct = ([n, d]) => Math.round((1000 * d) / n) / 10;
const factor = ([n, d]) => Math.round((100 * (d + SMOOTH * avg)) / (n + SMOOTH) / avg) / 100;
const factorsOf = (table) => Object.fromEntries(Object.entries(table).map(([k, v]) => [k, factor(v)]));

const result = {
  source: `${flights} departures from IST, delayed = ${LATE}+ minutes late`,
  flights,
  delayed,
  average: Math.round(1000 * avg) / 10,
  hourRates: Array.from({ length: 24 }, (_, h) => pct(hour[h])),
  monthRates: Array.from({ length: 12 }, (_, m) => pct(month[m + 1])),
  dayFactors: Array.from({ length: 7 }, (_, d) => factor(day[d])),
  airlineFactors: factorsOf(airline),
  routeFactors: factorsOf(route),
  aircraftFactors: factorsOf(aircraft),
  weatherFactors: factorsOf(weather)
};

// Strength test. Multiplying six factors over-counts things that overlap (e.g. JFK flights are mostly 777s),
// so each factor is raised to a power "strength" between 0 and 1. We try every strength on all real flights
// and keep the one whose predictions are closest to what actually happened (lowest log loss).
function predict(row, strength) {
  const parts = [
    result.monthRates[row.month - 1] / result.average,
    result.airlineFactors[row.airline],
    result.routeFactors[row.route],
    result.aircraftFactors[row.aircraft],
    result.dayFactors[row.day],
    result.weatherFactors[row.weather]
  ];
  let p = result.hourRates[row.hour] / 100;
  for (const f of parts) p *= Math.pow(f, strength);
  return Math.min(0.95, Math.max(0.02, p));
}

function logLoss(strength) {
  let sum = 0;
  for (const row of rows) {
    const p = predict(row, strength);
    sum -= row.late ? Math.log(p) : Math.log(1 - p);
  }
  return sum / rows.length;
}

let best = { strength: 1, loss: logLoss(1) };
for (let s = 0; s <= 1.0001; s += 0.05) {
  const loss = logLoss(s);
  if (loss < best.loss) best = { strength: Math.round(s * 100) / 100, loss };
}
result.strength = best.strength;

// sanity check: for the flights we call riskiest, how often were they really late?
const risky = rows.filter((row) => predict(row, best.strength) >= 0.3);
const reallyLate = risky.filter((row) => row.late).length;

fs.writeFileSync("src/data/factors.json", JSON.stringify(result, null, 2) + "\n");
console.log(`Done: ${flights} flights, ${result.average}% delayed -> src/data/factors.json`);
console.log(`Strength: ${best.strength} (log loss ${best.loss.toFixed(4)}; with full strength 1.0 it was ${logLoss(1).toFixed(4)})`);
console.log(`Flights predicted 30%+: ${risky.length}, really delayed: ${((100 * reallyLate) / Math.max(1, risky.length)).toFixed(1)}%`);
