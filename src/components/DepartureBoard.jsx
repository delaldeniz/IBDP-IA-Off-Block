import SplitFlap from "./SplitFlap.jsx";
import { IST_AVG_DELAY, weatherNames } from "../data.js";
import { findDestination } from "../data/destinations.js";
import { riskTone } from "../data/riskTone.js";
import "../styles/board.css";

export default function DepartureBoard({ input, result, flightNumber, playKey, boardRef }) {
  const percent = Math.round(result.probability * 100);
  const tone = riskTone(percent);
  const dest = findDestination(input.destination_airport_iata);
  const destText = dest && dest.code !== "OTHER" ? `${dest.code} ${dest.city}`.slice(0, 14) : "ELSEWHERE";

  const diff = Math.round(percent - IST_AVG_DELAY);
  const pts = Math.abs(diff) === 1 ? "point" : "points";
  const comparison = diff === 0
    ? "Same as the Istanbul average (13.8%)."
    : `${Math.abs(diff)} ${pts} ${diff > 0 ? "above" : "below"} the Istanbul average (13.8%).`;

  // bar from 0 to `scale`
  const scale = Math.max(40, Math.ceil((percent + 5) / 10) * 10);
  const at = (v) => `${(v / scale) * 100}%`;

  const cells = [input.time, flightNumber, destText, input.aircraft_model.slice(0, 16)];

  return (
    <section className="board-section" ref={boardRef}>
      <div className="container">
        <div className="board">
          <div className="board-top">
            <span className="board-title">Departures</span>
            <span className="board-title board-title-muted">Schedule verified · IST — Istanbul Airport</span>
          </div>

          <div className="board-table" role="table">
            <div className="board-cols" role="row">
              {["Time", "Flight", "Destination", "Aircraft", "Status"].map((h) => <span key={h} role="columnheader">{h}</span>)}
            </div>
            <div className="board-line" role="row">
              {cells.map((c, i) => (
                <span key={i} role="cell"><SplitFlap text={c} playKey={playKey} delay={i * 150} /></span>
              ))}
              <span role="cell" className={`tone-text tone-${tone.key}`}>
                <SplitFlap text={tone.label} playKey={playKey} delay={600} />
              </span>
            </div>
          </div>

          <div className="board-score">
            <div>
              <p className="board-label">Delay risk</p>
              <div className="board-percent">
                <SplitFlap text={percent + "%"} count playKey={playKey} delay={500} className="flap-big" />
              </div>
              <span className={`pill pill-${tone.key}`}>{tone.label}</span>
            </div>

            <div className="board-compare">
              <p className="board-sentence">{comparison}</p>
              <div className="compare-bar" aria-hidden="true">
                <span className="compare-fill" style={{ width: at(percent) }} />
                <span className="compare-avg" style={{ left: at(IST_AVG_DELAY) }}>
                  <span className="compare-tag">AVG 13.8%</span>
                </span>
                <span className="compare-dot" style={{ left: at(percent) }} />
              </div>
              <div className="compare-scale" aria-hidden="true">
                <span>0%</span>
                <span>{scale}%</span>
              </div>
              <p className="weather-tag">Weather · {weatherNames[result.weather]}</p>
            </div>
          </div>

          <div className="board-why">
            <p className="board-label">Why this result</p>
            <ul className="why-list">
              <li>
                <span className="why-name">Departure hour</span>
                <span className="why-text">{String(result.hour).padStart(2, "0")}:00 flights were delayed {result.hourRate}% of the time</span>
                <span className="why-value">{result.hourRate}%</span>
              </li>
              {result.factors.map((f) => (
                <li key={f.name}>
                  <span className="why-name">{f.name}</span>
                  <span className="why-text">{f.text}</span>
                  <span className={`why-value ${f.value > 1.001 ? "is-up" : f.value < 0.999 ? "is-down" : ""}`}>×{f.value.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
