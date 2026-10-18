import { useLayoutEffect, useRef } from "react";
import { gsap, reducedMotion } from "./motion.js";

// each line of a headline rises out of a hidden strip when it scrolls into view
export default function RevealLines({ as: Tag = "h2", className, lines }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const tween = gsap.from(ref.current.querySelectorAll(".reveal-line > span"), {
      yPercent: 110,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ref.current, start: "top 88%", once: true }
    });
    return () => tween.revert();
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span className="reveal-line" key={i}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
