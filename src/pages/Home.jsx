import { useEffect, useRef, useState } from "react";
import { getPrediction } from "../data.js";
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
    time: "18:30"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState("");
  // automatic lookup: idle | searching | found | error (flight doesn't exist) | unavailable (database unreachable, so manual entry)
  const [lookup, setLookup] = useState({ state: "idle" });
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

    // the database says this flight doesn't exist: no result
    if (!check.ok && check.final) {
      setLoading("");
      return setNotice({ type: "error", text: check.message });
    }
    // the database couldn't be reached: the first time, show the manual fields; the second time, go on unverified
    if (!check.ok && lookup.state !== "unavailable") {
      setLoading("");
      return setLookup({ state: "unavailable", text: check.message });
    }

    // the real schedule wins over whatever was typed in
    const verified = check.ok;
    let current = form;
    if (verified) {
      const real = check.flight;
      current = { ...form, flightNumber: real.number, airline: real.airline, destination: real.destination, aircraft: real.aircraft, time: real.time || form.time };
      setForm(current);
    }

    // flight times are Istanbul times (UTC+3 all year), so compare in Istanbul time, wherever the visitor is
    if (new Date(`${current.date}T${current.time}:00+03:00`) < new Date()) {
      setLoading("");
      return setNotice({ type: "error", text: `Flight ${current.flightNumber} has already departed. Choose an upcoming flight.` });
    }

    const input = {
      airline_iata: current.airline,
      destination_airport_iata: current.destination,
      aircraft_model: current.aircraft,
      flight_date: current.date,
      time: current.time,
      weather: "auto"
    };
    setLoading("Calculating…");
    const [result] = await Promise.all([getPrediction(input), wait(700)]); // short wait so the loading line is visible
    setLoading("");
    addToHistory(input, result.probability);
    setOutput({ input, result, verified, flightNumber: number, playKey: Date.now() });
  }

  // when the flight number and date are filled in, wait for a short pause in typing, then look the flight up
  useEffect(() => {
    const number = cleanFlightNumber(form.flightNumber);
    if (!number || !form.date) return setLookup({ state: "idle" });

    let stale = false;
    setNotice(null); // old messages belong to the previous flight number
    setLookup({ state: "searching" });
    const timer = setTimeout(async () => {
      const check = await verifyFlight(number, form.date);
      if (stale) return;
      if (!check.ok) return setLookup({ state: check.final ? "error" : "unavailable", text: check.message });

      const f = check.flight;
      // partial data: only overwrite what the schedule actually gave us
      setForm((old) => ({ ...old, airline: f.airline, destination: f.destination, aircraft: f.aircraft, time: f.time || old.time }));
      setLookup({ state: "found", destination: f.destinationCode });
    }, 700);

    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [form.flightNumber, form.date]);

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
        <BoardingPass form={form} setForm={setForm} errors={errors} notice={notice} lookup={lookup} loading={loading} onSubmit={handlePredict} />
      </Hero>
      {output && <DepartureBoard {...output} boardRef={boardRef} />}
      <HourChart time={form.time} />
    </>
  );
}
