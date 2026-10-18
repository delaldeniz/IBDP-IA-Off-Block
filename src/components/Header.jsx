import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";
import "../styles/navbar.css";

const links = ["home", "statistics", "history", "about"];

export default function Header({ page, setPage, dark, toggleDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [bar, setBar] = useState({ x: 0, w: 0 });
  const refs = useRef({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[page];
      setBar({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [page]);

  const go = (e, name) => {
    e.preventDefault();
    setPage(name);
  };

  return (
    <header className={scrolled ? "navbar is-scrolled" : "navbar"}>
      <div className="navbar-inner">
        <a href="#" className="wordmark" onClick={(e) => go(e, "home")}>
          <svg className="plane-glyph" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
          </svg>
          Off Block
        </a>
        <nav className="nav-links">
          {links.map((name) => (
            <a
              key={name}
              href="#"
              ref={(el) => (refs.current[name] = el)}
              className={page === name ? "is-active" : ""}
              aria-current={page === name ? "page" : undefined}
              onClick={(e) => go(e, name)}
            >
              {name[0].toUpperCase() + name.slice(1)}
            </a>
          ))}
          <span className="nav-underline" style={{ transform: `translateX(${bar.x}px) scaleX(${bar.w})` }} />
        </nav>
        <ThemeToggle dark={dark} onToggle={toggleDark} />
      </div>
    </header>
  );
}
