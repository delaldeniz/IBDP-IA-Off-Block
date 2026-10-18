import { useEffect, useRef, useState } from "react";
import { usePopover, keepInView } from "./usePopover.js";
import "../../styles/controls.css";

// custom <select>: button + listbox, arrow keys / Enter / Esc / type-ahead
export default function Dropdown({ id, label, options, value, onChange }) {
  const { open, up, rootRef, show, hide } = usePopover(300);
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const typed = useRef("");

  const index = Math.max(0, options.findIndex((o) => o.value === value));

  useEffect(() => {
    if (open) setActive(index);
  }, [open]);

  useEffect(() => {
    if (open) keepInView(listRef.current, active);
  }, [open, active]);

  const choose = (i) => {
    onChange(options[i].value);
    hide();
  };

  function onKeyDown(e) {
    const last = options.length - 1;
    const moves = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: last };
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
    } else if (e.key in moves) {
      e.preventDefault();
      setActive(Math.min(last, Math.max(0, moves[e.key])));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      hide();
    } else if (e.key.length === 1) {
      typed.current += e.key.toLowerCase();
      setTimeout(() => (typed.current = ""), 600);
      const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current));
      if (hit !== -1) setActive(hit);
    }
  }

  return (
    <div className="field" ref={rootRef}>
      <span className="field-label" id={`${id}-label`}>{label}</span>
      <button
        type="button"
        id={id}
        className="field-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label ${id}`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={open ? hide : show}
        onKeyDown={onKeyDown}
      >
        <span className="field-value">{options[index].label}</span>
        <span className="field-chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul ref={listRef} id={`${id}-list`} role="listbox" className={`popup popup-list ${up ? "is-up" : ""}`} data-lenis-prevent>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={i === active ? "option is-active" : "option"}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
