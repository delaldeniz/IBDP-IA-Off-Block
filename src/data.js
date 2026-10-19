// The prediction. Every number comes from factors.json, which scripts/computeFactors.cjs
// calculates from the real IST dataset (490,920 departures, Jul 2025 – Jun 2026).
import factors from "./data/factors.json";

const IST_AVG_DELAY = factors.average;
const HOUR_RATES = factors.hourRates;

const airlineNames = {
  TK: "Turkish Airlines", AT: "Royal Air Maroc", MS: "EgyptAir", SU: "Aeroflot", J2: "Azerbaijan Airlines",
  GF: "Gulf Air", RJ: "Royal Jordanian", HY: "Uzbekistan Airways", "6E": "IndiGo", "3U": "Sichuan Airlines",
  AH: "Air Algerie", B6: "JetBlue", FI: "Icelandair", LO: "LOT Polish Airlines", MH: "Malaysia Airlines",
  NH: "ANA", OM: "MIAT Mongolian", OZ: "Asiana Airlines", PK: "Pakistan International", SQ: "Singapore Airlines",
  TG: "Thai Airways", TP: "TAP Air Portugal", UA: "United Airlines", WB: "RwandAir", OTHER: "Another airline"
};

const weatherNames = {
  clear: "Clear sky", cloudy: "Cloudy", rain: "Rain", fog: "Fog",
  wind: "Strong wind", snow: "Snow", storm: "Thunderstorm", unknown: "Unknown"
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Open-Meteo weather code -> one of our 7 weather groups (same groups as the dataset)
function codeToWeather(code, wind) {
  if (code == null) return "unknown";
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code === 45 || code === 48) return "fog";
  if (wind > 40) return "wind";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code === 2 || code === 3) return "cloudy";
  return "clear";
}

// forecast for Istanbul Airport at the departure hour (only exists about 16 days ahead)
async function getWeather(date, hour) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=41.27&longitude=28.75&hourly=weather_code,wind_speed_10m&timezone=Europe%2FIstanbul&start_date=${date}&end_date=${date}`;
    const data = await (await fetch(url)).json();
    if (!data.hourly) return { type: "unknown", source: "forecast not out yet" };
    return { type: codeToWeather(data.hourly.weather_code[hour], data.hourly.wind_speed_10m[hour]), source: "IST forecast" };
  } catch {
    return { type: "unknown", source: "forecast not available" };
  }
}

// Start from the delay rate of the departure hour, then multiply by how much each other
// thing (month, airline, route, aircraft, weekday, weather) raised or lowered delays in the data.
async function getPrediction(input) {
  const hour = parseInt(input.time, 10);
  const hourRate = HOUR_RATES[hour];
  const date = new Date(input.flight_date + "T00:00");
  const month = date.getMonth();
  const day = date.getDay();
  const weather = await getWeather(input.flight_date, hour);

  const list = [
    { name: "Month", text: `${MONTHS[month]} flights were delayed ${factors.monthRates[month]}% of the time`, value: factors.monthRates[month] / IST_AVG_DELAY },
    { name: "Airline", text: airlineNames[input.airline_iata] || input.airline_iata, value: factors.airlineFactors[input.airline_iata] ?? factors.airlineFactors.OTHER },
    { name: "Route", text: "IST to " + input.destination_airport_iata, value: factors.routeFactors[input.destination_airport_iata] ?? factors.routeFactors.OTHER },
    { name: "Aircraft", text: input.aircraft_model, value: factors.aircraftFactors[input.aircraft_model] ?? factors.aircraftFactors.OTHER },
    { name: "Day of week", text: DAYS[day], value: factors.dayFactors[day] },
    { name: "Weather", text: `${weatherNames[weather.type]} (${weather.source})`, value: factors.weatherFactors[weather.type] ?? 1 }
  ];

  // factors partly overlap (e.g. JFK flights are mostly 777s), so each is softened by the "strength"
  // that matched the real flights best (see scripts/computeFactors.cjs)
  for (const f of list) f.value = Math.pow(f.value, factors.strength);

  let percent = hourRate;
  for (const f of list) percent *= f.value;
  percent = Math.min(95, Math.max(2, percent));

  return { probability: percent / 100, hourRate, hour, weather: weather.type, factors: list };
}

// today's date in Istanbul (not on the visitor's computer clock), as YYYY-MM-DD
function getTodayString() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
}

function getRiskLabel(percent) {
  if (percent < 10) return "Low";
  if (percent < 25) return "Typical";
  if (percent < 45) return "Raised";
  return "High";
}

export { IST_AVG_DELAY, airlineNames, HOUR_RATES, weatherNames, getPrediction, getTodayString, getRiskLabel };
