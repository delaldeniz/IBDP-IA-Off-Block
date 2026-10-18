import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { useSmoothScroll, scrollTo, ScrollTrigger } from "./effects/motion.js";
import Home from "./pages/Home.jsx";
import Statistics from "./pages/Statistics.jsx";
import History from "./pages/History.jsx";
import About from "./pages/About.jsx";

const pages = { home: Home, statistics: Statistics, history: History, about: About };

export default function App() {
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useSmoothScroll();

  useEffect(() => {
    document.body.classList.toggle("dark-mode", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    scrollTo(0, { immediate: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [page]);

  const Page = pages[page];

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header page={page} setPage={setPage} dark={dark} toggleDark={() => setDark(!dark)} />
      <main className="page" key={page}>
        <Page />
      </main>
      <Footer setPage={setPage} />
    </>
  );
}
