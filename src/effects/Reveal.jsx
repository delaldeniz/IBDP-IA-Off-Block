import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "./motion.js";

export default function Reveal({ as: Tag = "div", className = "", children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(reducedMotion);

  useEffect(() => {
    if (shown) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setShown(true), { threshold: 0.18 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag ref={ref} className={`reveal ${shown ? "is-in" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
