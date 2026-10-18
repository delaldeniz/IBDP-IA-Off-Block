import "../styles/footer.css";

export default function Footer({ setPage }) {
  const go = (e, name) => {
    e.preventDefault();
    setPage(name);
  };

  return (
    <footer className="footer">
      <div className="container footer-top">
        <p className="footer-note">Off Block is a flight delay prediction tool built for my IBDP Computer Science IA.</p>
        <nav className="footer-links">
          <a href="#" onClick={(e) => go(e, "home")}>Home</a>
          <a href="#" onClick={(e) => go(e, "statistics")}>Statistics</a>
          <a href="#" onClick={(e) => go(e, "history")}>History</a>
          <a href="#" onClick={(e) => go(e, "about")}>About</a>
          <a href="https://mail.google.com/mail/?view=cm&to=delaldeniz2136@gmail.com&su=Off%20Block%20feedback" target="_blank" rel="noreferrer">Contact</a>
          <a href="https://github.com/delaldeniz" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
