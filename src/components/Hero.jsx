import { useLayoutEffect, useRef } from "react";
import { gsap } from "../effects/motion.js";
import "../styles/hero.css";

// Desktop only: the stage is pinned while the window zooms into the painting and the form slides in.
// On phones / reduced motion the CSS just stacks everything (see hero.css).
export default function Hero({ children }) {
  const root = useRef(null);
  const pin = useRef(null);

  useLayoutEffect(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(q(".reveal-line > span"), { yPercent: 110, stagger: 0.12, duration: 1.1, ease: "power4.out", delay: 0.2 });
    });

    mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
      const glass = q(".window-glass")[0];
      const panel = q(".hero-panel")[0];
      // big enough that the rounded corners leave the screen
      const cover = () => Math.max(innerWidth / glass.offsetWidth, innerHeight / glass.offsetHeight) * 1.7;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: q(".hero-stage")[0],
          start: "top top",
          end: "+=320%",
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (st) => panel.classList.toggle("is-live", st.progress > 0.66)
        }
      })
        .to(q(".window"), { scale: cover, ease: "power2.in", duration: 0.5 }, 0)
        .fromTo(q(".window-shade"), { yPercent: -50 }, { yPercent: -100, duration: 0.22 }, 0)
        .fromTo(q(".window-painting"), { scale: 1 }, { scale: 1.3, yPercent: -6, duration: 0.5 }, 0)
        .to(q(".hero-copy, .hero-cue"), { opacity: 0, y: -40, duration: 0.2 }, 0)
        // swap to a full-size copy of the painting so it stays sharp
        .to(q(".hero-full"), { opacity: 1, duration: 0.08 }, 0.36)
        .fromTo(q(".hero-full-image"), { scale: 1 }, { scale: 1.18, duration: 0.64 }, 0.36)
        .to(q(".window"), { opacity: 0, duration: 0.04 }, 0.44)
        .to(q(".hero-dim"), { opacity: 1, duration: 0.25 }, 0.55)
        .fromTo(panel, { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.3 }, 0.66);
      pin.current = tl.scrollTrigger;
      return () => (pin.current = null);
    });

    return () => mm.revert();
  }, []);

  // keyboard users can jump straight to the (otherwise scroll-revealed) form
  const skip = (e) => {
    e.preventDefault();
    if (pin.current) window.scrollTo(0, pin.current.end - 20);
    root.current.querySelector("#search input")?.focus({ preventScroll: true });
  };

  return (
    <section className="hero" ref={root}>
      <div className="hero-stage">
        <div className="hero-wall" />

        <div className="hero-copy">
          <p className="label hero-label">IST — Istanbul Airport · Departures</p>
          <div className="hero-bottom">
            <h1 className="display hero-title">
              <span className="reveal-line"><span>Know</span></span>
              <span className="reveal-line"><span>before</span></span>
              <span className="reveal-line"><span>you <em>fly.</em></span></span>
            </h1>
            <p className="hero-side">Delay probability for any departure from Istanbul, trained on 490,920 real flights.</p>
          </div>
        </div>

        <div className="window">
          <div className="window-glass">
            <div className="window-painting" />
            <div className="window-shade"><span className="window-shade-pull" /></div>
            <div className="window-inner-shadow" />
          </div>
        </div>

        <div className="hero-full" aria-hidden="true"><div className="hero-full-image" /></div>
        <div className="hero-dim" />
        <p className="label hero-cue">Scroll</p>
        <a href="#search" className="skip-link" onClick={skip}>Skip to search</a>

        <div className="hero-panel" id="search">{children}</div>
      </div>
    </section>
  );
}
