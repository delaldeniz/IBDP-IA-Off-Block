import { useLayoutEffect, useRef } from "react";
import { gsap, reducedMotion } from "./motion.js";

export default function CountUp({ to, decimals = 0, suffix = "" }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const show = (v) => (el.textContent = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix);
    show(to);
    if (reducedMotion()) return;

    const n = { v: 0 };
    show(0);
    const tween = gsap.to(n, {
      v: to,
      duration: 2,
      ease: "power3.out",
      onUpdate: () => show(n.v),
      scrollTrigger: { trigger: el, start: "top 85%", once: true }
    });
    return () => tween.kill();
  }, [to]);

  return <span ref={ref} />;
}
