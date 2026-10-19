// AeroDataBox via RapidAPI. Key lives in .env.local as VITE_AERODATABOX_KEY.
import { airlineNames } from "../data.js";
import { findDestination } from "./destinations.js";

const HOST = "aerodatabox.p.rapidapi.com";
const KEY = import.meta.env.VITE_AERODATABOX_KEY;

// "tk 1979" -> "TK1979", or "" if it isn't a valid flight number
export function cleanFlightNumber(text) {
  const v = text.toUpperCase().replace(/\s+/g, "");
  return /^[A-Z0-9]{2}\d{1,4}[A-Z]?$/.test(v) ? v : "";
}

// map the API's aircraft name onto one of the models our prediction knows (order matters)
const aircraftRules = [
  [/A321.*NEO/, "Airbus A321 NEO"], [/A321/, "Airbus A321"],
  [/A320.*NEO/, "Airbus A320 NEO"], [/A320/, "Airbus A320"], [/A319/, "Airbus A319"],
  [/A330-2/, "Airbus A330-200"], [/A330-3/, "Airbus A330-300"], [/A330/, "Airbus A330"], [/A350/, "Airbus A350-900"],
  [/MAX/, "Boeing 737"], [/737-8/, "Boeing 737-800"], [/737-9/, "Boeing 737-900"], [/737/, "Boeing 737"],
  [/777/, "Boeing 777-300ER"], [/787/, "Boeing 787-9"]
];
const matchAircraft = (model = "") => aircraftRules.find(([re]) => re.test(model.toUpperCase()))?.[1] || "OTHER";

const errorText = {
  400: "No schedule is published for this flight on that date yet. Try a closer date or check the flight number.",
  401: "The flight database refused the request. The API key may be wrong.",
  403: "The flight database refused the request. The API key may be wrong.",
  429: "Too many flight checks for now. Please try again later."
};

const cache = new Map();

// same as lookup below, but a flight that was already answered is not asked again
export async function verifyFlight(number, date) {
  const key = number + date;
  if (cache.has(key)) return cache.get(key);
  const result = await lookup(number, date);
  if (result.ok || result.final) cache.set(key, result); // don't remember network errors
  return result;
}

async function lookup(number, date) {
  if (!KEY) return { ok: false, message: "Flight check isn't set up: VITE_AERODATABOX_KEY is missing from .env.local." };

  const notFound = { ok: false, final: true, message: `We couldn't find flight ${number} on ${date}. Check the flight number and the date.` };
  let res;
  try {
    res = await fetch(`https://${HOST}/flights/number/${number}/${date}?dateLocalRole=Departure`, {
      headers: { "X-RapidAPI-Key": KEY, "X-RapidAPI-Host": HOST }
    });
  } catch {
    return { ok: false, message: "Couldn't reach the flight database. Check your connection and try again." };
  }
  if (res.status === 204) return notFound;
  if (!res.ok) return { ok: false, message: errorText[res.status] || `The flight database returned an error (${res.status}).` };

  const flights = await res.json().catch(() => []);
  if (!flights.length) return notFound;

  const fromIST = flights.filter((f) => f.departure?.airport?.iata === "IST");
  if (!fromIST.length) return { ok: false, final: true, message: `Flight ${number} doesn't depart from Istanbul Airport (IST) on ${date}.` };

  const f = fromIST.find((x) => x.codeshareStatus === "IsOperator") || fromIST[0];
  const dest = f.arrival?.airport?.iata || "";
  const airline = f.airline?.iata;

  return {
    ok: true,
    flight: {
      number: f.number?.replace(/\s+/g, "") || number,
      airline: airlineNames[airline] ? airline : "OTHER",
      destination: findDestination(dest) ? dest : "OTHER",
      destinationCode: dest,
      time: (f.departure.scheduledTime?.local || "").slice(11, 16), // "2026-10-21 18:55+03:00" -> "18:55"
      aircraft: matchAircraft(f.aircraft?.model)
    }
  };
}
