const rays = [
  [12, 1.5, 12, 4], [12, 20, 12, 22.5], [1.5, 12, 4, 12], [20, 12, 22.5, 12],
  [4.6, 4.6, 6.3, 6.3], [17.7, 17.7, 19.4, 19.4], [4.6, 19.4, 6.3, 17.7], [17.7, 6.3, 19.4, 4.6]
];

export default function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      className={dark ? "theme-toggle is-dark" : "theme-toggle"}
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <mask id="moonMask">
          <rect width="24" height="24" fill="white" />
          <circle className="moon-bite" cx="17" cy="7" r="6" fill="black" />
        </mask>
        <circle cx="12" cy="12" r="5.2" fill="currentColor" mask="url(#moonMask)" />
        <g className="sun-rays" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          {rays.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
        </g>
      </svg>
    </button>
  );
}
