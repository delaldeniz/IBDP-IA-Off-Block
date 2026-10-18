import { useEffect, useState } from "react";
import { reducedMotion } from "../effects/motion.js";
import "../styles/board.css";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// one cell: flips through a few random chars (or counts up for digits) before landing on `char`
function Flap({ char, pos, delay, count, playKey }) {
  const [shown, setShown] = useState(reducedMotion() ? char : " ");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reducedMotion() || char === " ") return setShown(char);
    const seq = [];
    if (count && /\d/.test(char)) {
      for (let i = 0; i <= +char + (pos ? 20 : 10); i++) seq.push(String(i % 10));
    } else {
      for (let i = 0; i < 5 + (pos % 5); i++) seq.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
      seq.push(char);
    }
    const timers = seq.map((c, i) => setTimeout(() => {
      setShown(c);
      setTick((t) => t + 1);
    }, delay + i * (count ? 55 : 70)));
    return () => timers.forEach(clearTimeout);
  }, [char, playKey]);

  if (char === " ") return <span className="flap flap-space" />;
  return (
    <span className="flap">
      <span className="flap-face" key={tick}>{shown === " " ? " " : shown}</span>
    </span>
  );
}

export default function SplitFlap({ text, delay = 0, count = false, playKey, className = "" }) {
  const chars = String(text).toUpperCase().split("");
  return (
    <span className={`flap-row ${className}`} role="img" aria-label={text}>
      <span className="flap-cells" aria-hidden="true">
        {chars.map((c, i) => <Flap key={i} char={c} pos={i} delay={delay + i * 60} count={count} playKey={playKey} />)}
      </span>
    </span>
  );
}
