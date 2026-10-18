import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis = null;

export function useSmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
    };
  }, []);
}

// button drifts a little towards the mouse (desktop with a real mouse only)
export function useMagnetic(ref, strength = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e) => {
      const b = el.getBoundingClientRect();
      x((e.clientX - b.left - b.width / 2) * strength);
      y((e.clientY - b.top - b.height / 2) * strength);
    };
    const reset = () => {
      x(0);
      y(0);
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);
}

export function scrollTo(target, options = {}) {
  if (lenis) return lenis.scrollTo(target, options);
  if (typeof target === "number") window.scrollTo(0, target);
  else target?.scrollIntoView({ behavior: options.immediate ? "auto" : "smooth" });
}
