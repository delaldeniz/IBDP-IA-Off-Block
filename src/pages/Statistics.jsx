import RevealLines from "../effects/RevealLines.jsx";
import Reveal from "../effects/Reveal.jsx";
import CountUp from "../effects/CountUp.jsx";
import Accordion from "../components/Accordion.jsx";
import Waffle from "../components/Waffle.jsx";
import "../styles/statistics.css";

const metrics = [
  ["Accuracy", 0.6559, "The model gets the right answer 65.59% of the time."],
  ["AUC-ROC", 0.7798, "How well it separates delayed from on-time flights. 0.5 is guessing, 1.0 is perfect. Tested on randomly chosen flights; on a strict test with only future flights (June 2026) it scored 0.66."],
  ["Precision", 0.0717, "Of the flights it flags as delayed, only 7.17% really were: many false alarms."],
  ["Recall", 0.6177, "It catches 61.77% of the flights that really were delayed."],
  ["F1 score", 0.6207, "A balance between precision and recall."],
  ["MCC", 0.6407, "A balanced score that uses all four outcomes: true and false positives and negatives."]
];

// permutation importance of the random-split model (AUC 0.78), read off plots_random/feature_importance.png
const importance = [
  ["Departure hour (sin)", 0.075],
  ["Month (sin)", 0.061],
  ["Schedule density", 0.032],
  ["Departure hour (cos)", 0.021],
  ["Air pressure", 0.018],
  ["Month (cos)", 0.013],
  ["Codeshare flight", 0.013],
  ["Cloud height", 0.011],
  ["Day of week (sin)", 0.011],
  ["Other destinations", 0.011]
];

export default function Statistics() {
  return (
    <div className="stats-page">
      <section className="stat-intro">
        <div className="container">
          <p className="label">Model statistics</p>
          <RevealLines as="h1" className="display stat-intro-title" lines={["What the model", <em key="l">learned.</em>]} />
          <p className="stat-intro-text">
            Four numbers explain where the predictions come from: how much data, how often flights are late, how often
            the model is right and which inputs matter most.
          </p>
        </div>
      </section>

      <section className="stat-section">
        <Reveal className="container stat-grid">
          <p className="label stat-index">01 — The data</p>
          <div>
            <p className="stat-number display"><CountUp to={490920} /> <span className="stat-unit">flights</span></p>
            <p className="stat-sentence">Every departure from Istanbul Airport over 365 consecutive days, to 385 destinations.</p>
            <p className="stat-body">Each flight record includes the airline, destination, aircraft type, scheduled time, the weather at the airport, and whether it was delayed.</p>
            <Accordion summary="More about the dataset">
              <p>
                A flight is counted as "delayed" if it departed 15 or more minutes after its scheduled time. The flights
                (1 July 2025 – 30 June 2026) come from the AeroDataBox flight database and the weather from the airport's
                METAR reports. 512,749 flights were collected; after removing 21,829 cancelled flights, 490,920 remain.
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
            <p className="stat-sentence"><CountUp to={13.8} decimals={1} suffix="%" /> of all departures were late by 15 minutes or more: 67,803 of 490,920 flights.</p>
            <Accordion summary="Why this matters for the model">
              <p>
                When only 13.8% of flights are delayed, the dataset is imbalanced: there are far more on-time flights than
                delayed ones. This makes it harder for the model to learn what a "delayed" flight looks like, and it
                affects metrics like precision.
              </p>
            </Accordion>
          </div>
        </Reveal>
      </section>

      <section className="stat-section">
        <Reveal className="container stat-grid">
          <p className="label stat-index">03 — The accuracy</p>
          <div className="stat-split">
            <div>
              <p className="stat-number display"><CountUp to={66} /> <em>/</em> 100 <span className="stat-unit">correct</span></p>
              <p className="stat-sentence">It correctly identifies 66 out of every 100 flights.</p>
              <p className="stat-body">
                Each dot is one flight. <span className="key key-right">Blue</span> = correct prediction.{" "}
                <span className="key key-wrong">Grey</span> = wrong.
              </p>
            </div>
            <Waffle filled={66} />
          </div>
        </Reveal>
      </section>

      <section className="stat-section">
        <div className="container">
          <Reveal>
            <p className="label stat-index">04 — The scores</p>
            <h2 className="display stat-h2">Six ways to <em>score</em> a model.</h2>
          </Reveal>
          <Reveal className="metrics-table">
            <div className="metrics-head">
              <span>Metric</span>
              <span>Score</span>
              <span>In plain English</span>
            </div>
            {metrics.map(([name, value, note]) => (
              <div className="metrics-row" key={name}>
                <span className="metrics-name">{name}</span>
                <span className="metrics-value">
                  {value.toFixed(4)}
                  <span className="metrics-bar"><span style={{ width: `${value * 100}%` }} /></span>
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
            <p className="label stat-index">05 — The drivers</p>
            <h2 className="display stat-h2">When the flight is scheduled matters more than where it is <em>going.</em></h2>
          </Reveal>
          <Reveal className="importance">
            {importance.map(([name, value]) => (
              <div className="importance-row" key={name}>
                <span className="importance-name">{name}</span>
                <span className="importance-track">
                  <span className="importance-fill" style={{ width: `${(value / importance[0][1]) * 100}%` }} />
                </span>
                <span className="importance-value">≈{value.toFixed(3)}</span>
              </div>
            ))}
          </Reveal>
          <Accordion summary="How feature importance works">
            <p>
              Feature importance shows how much each input contributes to the model's predictions. It was measured by
              shuffling one input at a time and checking how much the model's AUC score drops: the bigger the drop, the
              more the model relies on that input. Hour, month and day of week are each stored as two numbers (sine and
              cosine) so the model understands that they repeat in a cycle, which is why they appear twice.
            </p>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
