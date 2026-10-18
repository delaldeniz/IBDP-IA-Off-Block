import { useLayoutEffect, useRef, useState } from "react";
import { HOUR_RATES } from "../data.js";
import { gsap, reducedMotion } from "../effects/motion.js";
import RevealLines from "../effects/RevealLines.jsx";
import "../styles/chart.css";

const THIN = [3, 4, 5, 23]; // too few flights at these hours to call them "best"
const MAX = Math.max(...HOUR_RATES);
const pad = (n) => String(n).padStart(2, "0");
const best = HOUR_RATES.reduce((b, r, h) => (!THIN.includes(h) && r < HOUR_RATES[b] ? h : b), 0);

export default function HourChart({ time }) {
  const plot = useRef(null);
  const [hover, setHover] = useState(null);
  const selected = parseInt(time || "18", 10);

  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const tween = gsap.from(plot.current.querySelectorAll(".runway-bar"), {
      scaleY: 0,
      transformOrigin: "bottom",
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.035,
      scrollTrigger: { trigger: plot.current, start: "top 82%", once: true }
    });
    return () => tween.revert();
  }, []);

  return (
    <section className="runway-section">
      <div className="container">
        <p className="label">Historical pattern · 490,920 IST departures</p>
        <RevealLines className="display runway-title" lines={["The 24-hour", <em key="r">runway.</em>]} />
        <p className="runway-intro">
          Share of flights delayed by 15 minutes or more, for each departure hour. This is the pattern in the past
          data, not a prediction for your flight.
        </p>

        <div className="runway-plot" ref={plot}>
          {hover !== null && (
            <div className="runway-tooltip" style={{ left: `${((hover + 0.5) / 24) * 100}%` }}>
              {pad(hover)}:00 <strong>{HOUR_RATES[hover]}%</strong> delayed
            </div>
          )}
          <div className="runway-cols">
            <div className="runway-avg" style={{ bottom: `${(13.8 / MAX) * 100}%` }}>
              <span className="runway-avg-tag">AVG 13.8%</span>
            </div>
            {HOUR_RATES.map((rate, h) => (
              <div
                key={h}
                className="runway-col"
                tabIndex={0}
                aria-label={`${pad(h)}:00, ${rate}% delayed`}
                onMouseEnter={() => setHover(h)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(h)}
                onBlur={() => setHover(null)}
              >
                <div
                  className={`runway-bar ${h === selected ? "is-selected" : h === best ? "is-best" : ""} ${THIN.includes(h) ? "is-thin" : ""}`}
                  style={{ height: `${(rate / MAX) * 100}%` }}
                />
                <span className={h % 3 ? "runway-hour is-minor" : "runway-hour"}>{pad(h)}</span>
                {h === best && h !== selected && <span className="runway-tag">BEST · {pad(h)}:00</span>}
                {h === selected && <span className="runway-tag is-you">YOUR HOUR · {pad(h)}:00</span>}
              </div>
            ))}
          </div>
        </div>

        <p className="runway-note">
          Few flights leave at 03:00–05:00 and 23:00, so those rates are less reliable and are never chosen as the best hour.
        </p>
      </div>
    </section>
  );
}
