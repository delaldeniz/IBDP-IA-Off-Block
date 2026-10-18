import { airlineNames } from "../data.js";

export const airlineOptions = Object.keys(airlineNames).map((code) => ({
  value: code,
  label: airlineNames[code]
}));

const aircraftList = [
  "Airbus A319", "Airbus A320", "Airbus A320 NEO", "Airbus A321", "Airbus A321 NEO",
  "Airbus A330", "Airbus A330-200", "Airbus A330-300", "Airbus A350-900", "Boeing 737",
  "Boeing 737-800", "Boeing 737-900", "Boeing 777-300ER", "Boeing 787-9", "OTHER"
];

export const aircraftOptions = aircraftList.map((name) => ({ value: name, label: name }));

export const weatherOptions = [
  { value: "auto", label: "Auto (forecast)" },
  { value: "clear", label: "Clear sky" },
  { value: "cloudy", label: "Cloudy" },
  { value: "rain", label: "Rain" },
  { value: "fog", label: "Fog" },
  { value: "wind", label: "Strong wind" },
  { value: "snow", label: "Snow" },
  { value: "storm", label: "Thunderstorm" }
];
