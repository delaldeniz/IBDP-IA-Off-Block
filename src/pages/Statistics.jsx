import RevealLines from "../effects/RevealLines.jsx";
import Reveal from "../effects/Reveal.jsx";
import CountUp from "../effects/CountUp.jsx";
import Accordion from "../components/Accordion.jsx";
import Waffle from "../components/Waffle.jsx";
import factors from "../data/factors.json";
import "../styles/statistics.css";

// every number on this page comes from factors.json (made by scripts/computeFactors.cjs)
const ev = factors.evaluation;
const n = (x) => x.toLocaleString("en-US");
const pct = (x) => `${x}%`;

const scores = [
  ["AUC", ev.auc.toFixed(3), ev.auc, `How well it ranks late flights above on-time ones. 0.5 is guessing, 1.0 is perfect. Using only the departure hour gives ${ev.aucHourOnly.toFixed(3)}.`],
  ["Precision", pct(ev.precision), ev.precision / 100, `Of the flights we warn about (${ev.flagThreshold}%+), ${ev.precision}% really were late, about twice the normal ${factors.average}%.`],
  ["Recall", pct(ev.recall), ev.recall / 100, `Of all the flights that really were late, we had warned about ${ev.recall}%. Most delays don't have warning signs in the schedule.`],
  ["Warned", pct(ev.flaggedShare), ev.flaggedShare / 100, `Share of flights we rate ${ev.flagThreshold}% or higher, so warnings stay rare and meaningful.`]
];

// how far each factor can move a prediction: highest factor / lowest factor
const spread = (values) => ({ low: Math.min(...values), high: Math.max(...values) });
const busyHours = factors.hourRates.filter((_, h) => ![3, 4, 5, 23].includes(h)); // same rule as the hour chart
const drivers = [
  ["Departure hour", spread(busyHours.map((r) => r / factors.average))],
  ["Month", spread(factors.monthRates.map((r) => r / factors.average))],
  ["Route", spread(Object.values(factors.routeFactors))],
  ["Airline", spread(Object.values(factors.airlineFactors))],
  ["Weather", spread(Object.values(factors.weatherFactors))],
  ["Aircraft", spread(Object.values(factors.aircraftFactors))],
  ["Day of week", spread(factors.dayFactors)]
]
  .map(([name, s]) => ({ name, ...s, ratio: s.high / s.low }))
  .sort((a, b) => b.ratio - a.ratio);

export default function Statistics() {
  return (
    <div className="stats-page">
      <section className="stat-intro">
        <div className="container">
          <p className="label">Model statistics</p>
          <RevealLines as="h1" className="display stat-intro-title" lines={["How the prediction", <em key="l">works.</em>]} />
          <p className="stat-intro-text">
            Where the numbers come from, how the delay risk is calculated, and how well it did on flights it had never
            seen.
          </p>
        </div>
      </section>

      <section className="stat-section">
        <Reveal className="container stat-grid">
          <p className="label stat-index">01 — The data</p>
          <div>
            <p className="stat-number display"><CountUp to={factors.flights} /> <span className="stat-unit">flights</span></p>
            <p className="stat-sentence">Every departure from Istanbul Airport over 365 consecutive days.</p>
            <p className="stat-body">Each flight record includes the airline, destination, aircraft type, scheduled time, the weather at the airport, and whether it was delayed.</p>
            <Accordion summary="More about the dataset">
              <p>
                A flight is counted as "delayed" if it departed 15 or more minutes after its scheduled time. The flights
                (1 July 2025 – 30 June 2026) come from the AeroDataBox flight database and the weather from the airport's
                METAR reports. {n(factors.collected)} flights were collected; after removing {n(factors.cancelled)} cancelled
                flights, {n(factors.flights)} remain.
              </p>
            </Accordion>
          </div>
        </Reveal>
      </section>

      <section className="stat-section">
        <Reveal className="container stat-grid">
          <p className="label stat-index">02 — The delays</p>
          <div>
            <p className="stat-number display">1 <em>in</em> 7 <span className="stat-unit">delayed</span></p>
            <p className="stat-sentence">
              <CountUp to={factors.average} decimals={1} suffix="%" /> of all departures were late by 15 minutes or more:{" "}
              {n(factors.delayed)} of {n(factors.flights)} flights.
            </p>
            <Accordion summary="Why this matters">
              <p>
                With only {factors.average}% of flights delayed, on-time flights are far more common. So even a "high"
                risk rarely means a delay is likely; it means it is more likely than usual.
              </p>
            </Accordion>
          </div>
        </Reveal>
      </section>

      <section className="stat-section">
        <Reveal className="container stat-grid">
          <p className="label stat-index">03 — The method</p>
          <div>
            <p className="stat-sentence">Start with the departure hour, then adjust for everything else.</p>
            <ol className="method-steps">
              <li><span className="mono">1</span> Take how often flights at that hour were late (for example 17:00 → 21.1%).</li>
              <li><span className="mono">2</span> Multiply by a factor for the month, airline, route, aircraft, weekday and weather forecast. A factor is how much that group's delay rate differs from the average: ×1.20 means 20% more delays.</li>
              <li><span className="mono">3</span> Soften every factor (power {factors.strength}), because they overlap. For example, most JFK flights are 777s, so route and aircraft partly measure the same thing.</li>
            </ol>
            <p className="method-formula mono">risk = hour rate × month × airline × route × aircraft × weekday × weather</p>
            <Accordion summary="How the softening was chosen">
              <p>
                Multiplying six factors at full strength over-counts and exaggerates risky flights. The script tried every
                strength from 0 to 1 on all {n(factors.flights)} flights and kept the one whose predictions matched what
                really happened best ({factors.strength}). Groups with only a few flights are also pulled towards 1.0, so a
                handful of flights can't create an extreme factor.
              </p>
            </Accordion>
          </div>
        </Reveal>
      </section>

      <section className="stat-section">
        <Reveal className="container stat-grid">
          <p className="label stat-index">04 — The test</p>
          <div className="stat-split">
            <div>
              <p className="stat-number display"><CountUp to={Math.round(ev.precision)} /> <em>/</em> 100 <span className="stat-unit">late</span></p>
              <p className="stat-sentence">
                Of every 100 flights we warn about, {Math.round(ev.precision)} were really delayed, twice the usual 14.
              </p>
              <p className="stat-body">
                Tested fairly: the factors were calculated from {n(ev.trainFlights)} flights (80%) and checked on the other{" "}
                {n(ev.testFlights)}, which they had never seen. Each dot is one warned flight.{" "}
                <span className="key key-right">Blue</span> = really delayed.
              </p>
            </div>
            <Waffle filled={Math.round(ev.precision)} label={`${Math.round(ev.precision)} out of 100 warned flights were really delayed`} />
          </div>
        </Reveal>
      </section>

      <section className="stat-section">
        <div className="container">
          <Reveal>
            <p className="label stat-index">05 — The honesty check</p>
            <h2 className="display stat-h2">When we say 24%, about <em>24%</em> are late.</h2>
          </Reveal>
          <Reveal className="metrics-table">
            <div className="metrics-head">
              <span>We predicted</span>
              <span>Average prediction → really late</span>
              <span>Test flights</span>
            </div>
            {ev.calibration.map((b) => (
              <div className="metrics-row" key={b.label}>
                <span className="metrics-name">{b.label}</span>
                <span className="metrics-value">
                  {b.predicted}% → {b.actual}%
                  <span className="metrics-bar"><span style={{ width: `${Math.min(100, b.actual * 2.5)}%` }} /></span>
                </span>
                <span className="metrics-note">{n(b.flights)} flights</span>
              </div>
            ))}
          </Reveal>
          <Reveal className="metrics-table">
            <div className="metrics-head">
              <span>Score</span>
              <span>Result</span>
              <span>In plain English</span>
            </div>
            {scores.map(([name, shown, bar, note]) => (
              <div className="metrics-row" key={name}>
                <span className="metrics-name">{name}</span>
                <span className="metrics-value">
                  {shown}
                  <span className="metrics-bar"><span style={{ width: `${bar * 100}%` }} /></span>
                </span>
                <span className="metrics-note">{note}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="stat-section">
        <div className="container">
          <Reveal>
            <p className="label stat-index">06 — The drivers</p>
            <h2 className="display stat-h2">The hour you leave matters <em>most.</em></h2>
          </Reveal>
          <Reveal className="importance">
            {drivers.map((d) => (
              <div className="importance-row" key={d.name}>
                <span className="importance-name">{d.name}</span>
                <span className="importance-track">
                  <span className="importance-fill" style={{ width: `${((d.ratio - 1) / (drivers[0].ratio - 1)) * 100}%` }} />
                </span>
                <span className="importance-value">×{d.low.toFixed(2)}–{d.high.toFixed(2)}</span>
              </div>
            ))}
          </Reveal>
          <Accordion summary="How to read this">
            <p>
              Each bar shows how far that one thing can move a prediction: from its best value (lowest factor) to its worst
              (highest factor). The departure hour can change the risk by almost four times, while the weekday only moves it a
              little.
            </p>
          </Accordion>
          <Accordion summary="Research phase: the machine-learning model">
            <p>
              Before this website, a machine-learning model (gradient boosting) was trained on the same data. It scored an AUC
              of 0.78 when tested on randomly chosen flights, but only 0.62–0.66 when tested on future flights (June 2026). The
              website uses the factor method instead because it runs in the browser without a server, every number can be
              checked in the data, and its accuracy is close on realistic tests.
            </p>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
