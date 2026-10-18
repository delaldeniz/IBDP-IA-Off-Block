import { riskTone } from "../data/riskTone.js";

export default function HistoryStub({ item, departed, index, onDelete }) {
  const percent = Math.round((item.probability || 0) * 100);
  const tone = riskTone(percent);

  return (
    <article className={departed ? "stub is-departed" : "stub"} style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}>
      <div className="stub-main">
        <p className="stub-route">IST <span className="stub-arrow">→</span> {item.destination_airport_iata}</p>
        <p className="stub-line">{item.airline_iata} · {item.aircraft_model}</p>
        <p className="stub-line">
          {item.flight_date} · {item.time}
          {departed && <span className="stub-flag">Departed</span>}
        </p>
      </div>
      <div className="stub-side">
        <span className={`stub-score tone-${tone.key}`}>{percent}%</span>
        <span className="stub-tone">{tone.label}</span>
        <button type="button" className="stub-delete" onClick={() => onDelete(item.id)} aria-label="Delete">×</button>
      </div>
    </article>
  );
}
