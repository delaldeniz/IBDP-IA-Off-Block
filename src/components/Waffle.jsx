import Reveal from "../effects/Reveal.jsx";

// 10x10 dots, the first `filled` turn blue one by one when scrolled into view
export default function Waffle({ filled }) {
  return (
    <Reveal className="waffle">
      <div className="waffle-grid" role="img" aria-label={`${filled} out of 100 predictions correct`}>
        {Array.from({ length: 100 }, (_, i) => (
          <span className="waffle-dot" key={i}>
            {i < filled && <span className="waffle-fill" style={{ transitionDelay: `${i * 22}ms` }} />}
          </span>
        ))}
      </div>
    </Reveal>
  );
}
