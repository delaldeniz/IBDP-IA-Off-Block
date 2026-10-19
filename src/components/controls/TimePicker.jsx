import { useEffect, useRef } from "react";
import { usePopover } from "./usePopover.js";
import "../../styles/controls.css";

const pad = (n) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

// two columns (hours, 5-minute steps). Up/Down inside a column, Left/Right to switch column.
export default function TimePicker({ id, label, value, onChange, disabled }) {
  const { open, up, rootRef, show, hide } = usePopover(300);
  const cols = useRef([]);
  const [hour, minute] = (value || "18:30").split(":");

  useEffect(() => {
    if (!open) return;
    cols.current.forEach((list) => {
      const sel = list.querySelector(".is-selected");
      if (sel) list.scrollTop = sel.offsetTop - list.clientHeight / 2 + sel.clientHeight / 2;
    });
    cols.current[0].querySelector(".is-selected")?.focus({ preventScroll: true });
  }, [open]);

  const close = () => {
    hide();
    rootRef.current.querySelector(".field-trigger").focus();
  };

  function onKeyDown(e, col) {
    const btn = e.currentTarget;
    const other = cols.current[1 - col];
    const target = {
      ArrowDown: btn.nextElementSibling,
      ArrowUp: btn.previousElementSibling,
      ArrowRight: col === 0 && (other.querySelector(".is-selected") || other.firstChild),
      ArrowLeft: col === 1 && (other.querySelector(".is-selected") || other.firstChild)
    }[e.key];
    if (target) {
      e.preventDefault();
      target.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  const column = (items, current, col, pickFn) => (
    <div className="time-col" role="listbox" aria-label={col ? "Minute" : "Hour"} ref={(el) => (cols.current[col] = el)} data-lenis-prevent>
      {items.map((v) => (
        <button
          type="button"
          key={v}
          role="option"
          aria-selected={v === current}
          tabIndex={v === current ? 0 : -1}
          className={v === current ? "time-item is-selected" : "time-item"}
          onClick={() => pickFn(v)}
          onKeyDown={(e) => onKeyDown(e, col)}
        >
          {v}
        </button>
      ))}
    </div>
  );

  return (
    <div className="field" ref={rootRef}>
      <span className="field-label" id={`${id}-label`}>{label}</span>
      <button type="button" id={id} className="field-trigger" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} aria-labelledby={`${id}-label ${id}`} onClick={open ? hide : show}>
        <span className="field-value mono-value">{value || "--:--"}</span>
        <span className="field-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div role="dialog" aria-label="Choose departure time" className={`popup popup-time ${up ? "is-up" : ""}`}>
          <div className="time-cols">
            {column(HOURS, hour, 0, (h) => onChange(`${h}:${minute}`))}
            {column(MINUTES, minute, 1, (m) => {
              onChange(`${hour}:${m}`);
              close();
            })}
          </div>
        </div>
      )}
    </div>
  );
}
