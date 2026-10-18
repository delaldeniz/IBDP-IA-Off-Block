import { useState } from "react";
import RevealLines from "../effects/RevealLines.jsx";
import HistoryStub from "../components/HistoryStub.jsx";
import { loadHistory, saveHistory, MAX_ITEMS } from "../data/history.js";
import "../styles/history.css";

const departed = (item) => new Date(`${item.flight_date}T${item.time}`) < new Date();

export default function History() {
  const [items, setItems] = useState(loadHistory);
  const [confirming, setConfirming] = useState(false);

  // every change is written to localStorage and shown straight away
  const update = (next) => {
    saveHistory(next);
    setItems(next);
  };

  return (
    <section className="history-page">
      <div className="container">
        <p className="label">Saved on this device</p>
        <RevealLines as="h1" className="display history-title" lines={["Your", <em key="c">checks.</em>]} />

        <div className="history-layout">
          <aside className="privacy">
            <p className="label">Your privacy</p>
            <ul>
              <li>Your checks are saved in this browser only, nothing is sent to a server.</li>
              <li>The data stays on your device and is never shared with anyone.</li>
              <li>Only you can see it, and only in this browser.</li>
              <li>The newest {MAX_ITEMS} checks are kept. Each new check replaces the oldest.</li>
              <li>You can delete one entry or clear everything at any time.</li>
            </ul>
          </aside>

          <div>
            <div className="history-bar">
              <span className="label">Storing {items.length} of {MAX_ITEMS}</span>
              {items.length > 0 && !confirming && (
                <button type="button" className="text-button" onClick={() => setConfirming(true)}>Clear all</button>
              )}
              {confirming && (
                <span className="history-confirm" role="alert">
                  Delete all saved checks?
                  <button type="button" className="text-button" onClick={() => { update([]); setConfirming(false); }}>Yes, delete</button>
                  <button type="button" className="text-button" onClick={() => setConfirming(false)}>Cancel</button>
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="history-empty">
                <p className="display">No checks yet.</p>
                <p>Go to Home and check a flight, it will appear here.</p>
              </div>
            ) : (
              <div className="stub-stack">
                {[...items].reverse().map((item, i) => (
                  <HistoryStub key={item.id} item={item} index={i} departed={departed(item)} onDelete={(id) => update(items.filter((x) => x.id !== id))} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
