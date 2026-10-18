import { useEffect, useRef, useState } from "react";
import { getPrediction, airlineNames } from "../data.js";
import { verifyFlight, cleanFlightNumber } from "../data/flightLookup.js";
import { addToHistory } from "../data/history.js";
import { ScrollTrigger, scrollTo } from "../effects/motion.js";
import Hero from "../components/Hero.jsx";
import BoardingPass from "../components/BoardingPass.jsx";
import DepartureBoard from "../components/DepartureBoard.jsx";
import HourChart from "../components/HourChart.jsx";

function inThreeDays() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [form, setForm] = useState({
    flightNumber: "",
    airline: "TK",
    destination: "LHR",
    aircraft: "Airbus A321",
    date: inThreeDays(),
    time: "18:30",
    weather: "auto"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState("");
  const [notice, setNotice] = useState(null);
  const [output, setOutput] = useState(null);
  const boardRef = useRef(null);

  async function handlePredict() {
    const number = cleanFlightNumber(form.flightNumber);
    const errs = {};
    if (!form.flightNumber.trim()) errs.flightNumber = "Please enter the flight number (e.g. TK1979).";
    else if (!number) errs.flightNumber = "That doesn't look like a flight number. Example: TK1979.";
    if (!form.date) errs.date = "Please select a departure date.";
    if (!form.time) errs.time = "Please select a departure time.";
    setErrors(errs);
    setNotice(null);
    if (Object.keys(errs).length) return;

    setLoading("Checking flight…");
    const check = await verifyFlight(number, form.date);
    if (!check.ok) {
      setLoading("");
      return setNotice({ type: "error", text: check.message });
    }

    // the real schedule wins over whatever was typed in
    const real = check.flight;
    const fixed = { ...form, flightNumber: real.number, airline: real.airline, destination: real.destination, aircraft: real.aircraft, time: real.time || form.time };
    setForm(fixed);

    if (new Date(`${fixed.date}T${fixed.time}`) < new Date()) {
      setLoading("");
      return setNotice({ type: "error", text: `Flight ${real.number} has already departed. Choose an upcoming flight.` });
    }

    const changes = [];
    if (fixed.destination !== form.destination) changes.push(`destination ${form.destination} → ${real.destinationCode}`);
    if (fixed.airline !== form.airline) changes.push(`airline → ${airlineNames[fixed.airline]}`);
    if (fixed.time !== form.time) changes.push(`time ${form.time} → ${fixed.time}`);
    if (fixed.aircraft !== form.aircraft) changes.push(`aircraft → ${fixed.aircraft}`);
    setNotice({
      type: "info",
      text: changes.length ? `Updated to match flight ${real.number}: ${changes.join(", ")}.` : `Flight ${real.number} found in the schedule.`
    });

    const input = {
      airline_iata: fixed.airline,
      destination_airport_iata: fixed.destination,
      aircraft_model: fixed.aircraft,
      flight_date: fixed.date,
      time: fixed.time,
      weather: fixed.weather
    };
    setLoading("Calculating…");
    const [result] = await Promise.all([getPrediction(input), wait(700)]); // short wait so the loading line is visible
    setLoading("");
    addToHistory(input, result.probability);
    setOutput({ input, result, flightNumber: real.number, playKey: Date.now() });
  }

  useEffect(() => {
    if (!output) return;
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      scrollTo(boardRef.current, { offset: -24, duration: 1.6 });
    });
  }, [output]);

  return (
    <>
      <Hero>
        <BoardingPass form={form} setForm={setForm} errors={errors} notice={notice} loading={loading} onSubmit={handlePredict} />
      </Hero>
      {output && <DepartureBoard {...output} boardRef={boardRef} />}
      <HourChart time={form.time} />
    </>
  );
}
