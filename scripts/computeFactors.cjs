// Calculates every number the prediction uses from the real IST dataset (one CSV per day),
// and tests how good the predictions are on flights the method has never seen.
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
const FLAG = 0.25; // the site calls 25%+ "elevated" or "high" risk

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

// ---------- 1. read every flight ----------
const rows = [];
let collected = 0;
for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith(".csv"))) {
  const lines = fs.readFileSync(path.join(dataDir, file), "utf8").split(/\r?\n/).filter(Boolean);
  const head = parseLine(lines[0]);
  for (const line of lines.slice(1)) {
    collected++;
    const cells = parseLine(line);
    const r = Object.fromEntries(head.map((h, i) => [h, cells[i]]));
    if (/Cancel/.test(r.status)) continue; // cancelled flights never departed
    const minutes = parseFloat(r.delay_minutes);
    if (isNaN(minutes)) continue;
    rows.push({
      hour: parseInt(r.scheduled_local.slice(11, 13), 10),
      month: parseInt(r.flight_date.slice(5, 7), 10),
      day: new Date(r.flight_date + "T00:00:00Z").getUTCDay(),
      airline: airlines.includes(r.airline_iata) ? r.airline_iata : "OTHER",
      route: routes.includes(r.destination_airport_iata) ? r.destination_airport_iata : "OTHER",
      aircraft: aircraftGroup(r.aircraft_model || ""),
      weather: weatherGroup(r),
      late: minutes >= LATE ? 1 : 0
    });
  }
}

// ---------- 2. turn a set of flights into factors ----------
function buildFactors(set) {
  const count = (key) => {
    const t = {};
    for (const row of set) {
      t[row[key]] = t[row[key]] || [0, 0];
      t[row[key]][0]++;
      t[row[key]][1] += row.late;
    }
    return t;
  };
  const delayed = set.reduce((s, r) => s + r.late, 0);
  const avg = delayed / set.length;
  const pct = (c) => (c ? Math.round((1000 * c[1]) / c[0]) / 10 : Math.round(1000 * avg) / 10);
  const factor = ([n, d]) => Math.round((100 * (d + SMOOTH * avg)) / (n + SMOOTH) / avg) / 100;
  const factorsOf = (key) => Object.fromEntries(Object.entries(count(key)).map(([k, v]) => [k, factor(v)]));
  const hours = count("hour"), months = count("month"), days = count("day");

  return {
    flights: set.length,
    delayed,
    average: Math.round(1000 * avg) / 10,
    hourRates: Array.from({ length: 24 }, (_, h) => pct(hours[h])),
    monthRates: Array.from({ length: 12 }, (_, m) => pct(months[m + 1])),
    dayFactors: Array.from({ length: 7 }, (_, d) => factor(days[d])),
    airlineFactors: factorsOf("airline"),
    routeFactors: factorsOf("route"),
    aircraftFactors: factorsOf("aircraft"),
    weatherFactors: factorsOf("weather")
  };
}

// exactly the same calculation as getPrediction in src/data.js
function predict(f, row, strength) {
  const parts = [
    f.monthRates[row.month - 1] / f.average,
    f.airlineFactors[row.airline] ?? f.airlineFactors.OTHER,
    f.routeFactors[row.route] ?? f.routeFactors.OTHER,
    f.aircraftFactors[row.aircraft] ?? f.aircraftFactors.OTHER,
    f.dayFactors[row.day],
    f.weatherFactors[row.weather] ?? 1
  ];
  let p = f.hourRates[row.hour] / 100;
  for (const x of parts) p *= Math.pow(x, strength);
  return Math.min(0.95, Math.max(0.02, p));
}

function logLoss(f, set, strength) {
  let sum = 0;
  for (const row of set) {
    const p = predict(f, row, strength);
    sum -= row.late ? Math.log(p) : Math.log(1 - p);
  }
  return sum / set.length;
}

// Multiplying six factors over-counts things that overlap (e.g. JFK flights are mostly 777s),
// so each factor is raised to a power "strength" between 0 and 1. Keep the strength that fits best.
function bestStrength(f, set) {
  let best = { strength: 1, loss: logLoss(f, set, 1) };
  for (let s = 0; s <= 1.0001; s += 0.05) {
    const loss = logLoss(f, set, s);
    if (loss < best.loss) best = { strength: Math.round(s * 100) / 100, loss };
  }
  return best.strength;
}

// AUC: chance that a random delayed flight gets a higher prediction than a random on-time one
function auc(scored) {
  scored.sort((a, b) => a.p - b.p);
  let rankSum = 0, pos = 0, i = 0;
  while (i < scored.length) {
    let j = i;
    while (j < scored.length && scored[j].p === scored[i].p) j++;
    const avgRank = (i + j + 1) / 2; // ties share the average rank
    for (let k = i; k < j; k++) if (scored[k].late) { rankSum += avgRank; pos++; }
    i = j;
  }
  const neg = scored.length - pos;
  return (rankSum - (pos * (pos + 1)) / 2) / (pos * neg);
}

// ---------- 3. fair test: learn from 80% of flights, test on the other 20% ----------
let seed = 2026;
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // fixed seed -> same split every run
const train = [], test = [];
for (const row of rows) (random() < 0.8 ? train : test).push(row);

const trainFactors = buildFactors(train);
const trainStrength = bestStrength(trainFactors, train);
const scored = test.map((row) => ({ p: predict(trainFactors, row, trainStrength), late: row.late }));
const hourOnly = test.map((row) => ({ p: trainFactors.hourRates[row.hour], late: row.late }));

const flagged = scored.filter((x) => x.p >= FLAG);
const caught = flagged.filter((x) => x.late).length;
const allLate = scored.filter((x) => x.late).length;

// calibration: group test flights by what we predicted, then look at what really happened
const bands = [[0, 0.1, "Under 10%"], [0.1, 0.2, "10–20%"], [0.2, 0.3, "20–30%"], [0.3, 1, "30% and more"]];
const calibration = bands.map(([lo, hi, label]) => {
  const g = scored.filter((x) => x.p >= lo && x.p < hi);
  const mean = (arr, k) => Math.round((1000 * arr.reduce((s, x) => s + (k === "p" ? x.p : x.late), 0)) / arr.length) / 10;
  return { label, flights: g.length, predicted: mean(g, "p"), actual: mean(g, "late") };
});

const evaluation = {
  trainFlights: train.length,
  testFlights: test.length,
  auc: Math.round(1000 * auc(scored)) / 1000,
  aucHourOnly: Math.round(1000 * auc(hourOnly)) / 1000,
  flagThreshold: FLAG * 100,
  flaggedShare: Math.round((1000 * flagged.length) / test.length) / 10, // % of flights we warn about
  precision: Math.round((1000 * caught) / flagged.length) / 10, // of warned flights, % really late
  recall: Math.round((1000 * caught) / allLate) / 10, // of late flights, % we warned about
  calibration
};

// ---------- 4. final numbers for the website: use every flight ----------
const result = { source: `IST departures ${LATE}+ minutes late counted as delayed`, collected, cancelled: collected - rows.length, ...buildFactors(rows) };
result.strength = bestStrength(result, rows);
result.evaluation = evaluation;

fs.writeFileSync("src/data/factors.json", JSON.stringify(result, null, 2) + "\n");
console.log(`Done: ${result.flights} flights, ${result.average}% delayed, strength ${result.strength} -> src/data/factors.json`);
console.log("Test on unseen flights:", JSON.stringify(evaluation, null, 1));
