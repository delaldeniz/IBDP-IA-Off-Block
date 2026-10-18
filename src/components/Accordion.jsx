import { useState } from "react";

export default function Accordion({ summary, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={open ? "accordion is-open" : "accordion"}>
      <button type="button" className="accordion-button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {summary}
        <span className="accordion-plus" aria-hidden="true" />
      </button>
      <div className="accordion-panel" aria-hidden={!open}>
        <div className="accordion-inner">
          <div className="accordion-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
