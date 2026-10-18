import { useEffect, useRef, useState } from "react";
import { usePopover } from "./usePopover.js";
import "../../styles/controls.css";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toISO = (d) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
const fromISO = (s) => new Date(s + "T00:00");
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
function addMonths(d, n) {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last));
}

// calendar popup; days before `min` are disabled. Arrows / PageUp / PageDown / Home / End to move.
export default function DatePicker({ id, label, value, min, onChange }) {
  const { open, up, rootRef, show, hide } = usePopover(380);
  const [cursor, setCursor] = useState(fromISO(value || min));
  const gridRef = useRef(null);
  const minDate = fromISO(min);

  useEffect(() => {
    if (open) setCursor(fromISO(value || min));
  }, [open]);

  // keep keyboard focus on the cursor day
  useEffect(() => {
    if (open) gridRef.current?.querySelector(`[data-iso="${toISO(cursor)}"]`)?.focus();
  }, [cursor, open]);

  const move = (d) => setCursor(d < minDate ? minDate : d);
  const close = () => {
    hide();
    rootRef.current.querySelector(".field-trigger").focus();
  };
  const pick = (d) => {
    onChange(toISO(d));
    close();
  };

  function onKeyDown(e) {
    const dow = (cursor.getDay() + 6) % 7;
    const target = {
      ArrowLeft: addDays(cursor, -1),
      ArrowRight: addDays(cursor, 1),
      ArrowUp: addDays(cursor, -7),
      ArrowDown: addDays(cursor, 7),
      PageUp: addMonths(cursor, -1),
      PageDown: addMonths(cursor, 1),
      Home: addDays(cursor, -dow),
      End: addDays(cursor, 6 - dow)
    }[e.key];
    if (target) {
      e.preventDefault();
      move(target);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const blanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const today = toISO(new Date());

  return (
    <div className="field" ref={rootRef}>
      <span className="field-label" id={`${id}-label`}>{label}</span>
      <button type="button" id={id} className="field-trigger" aria-haspopup="dialog" aria-expanded={open} aria-labelledby={`${id}-label ${id}`} onClick={open ? hide : show}>
        <span className="field-value">{value ? fromISO(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Choose a date"}</span>
        <span className="field-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div role="dialog" aria-label="Choose departure date" className={`popup popup-calendar ${up ? "is-up" : ""}`}>
          <div className="cal-head">
            <button type="button" className="cal-nav" aria-label="Previous month" disabled={year === minDate.getFullYear() && month <= minDate.getMonth()} onClick={() => move(addMonths(cursor, -1))}>‹</button>
            <p className="cal-title" aria-live="polite">{MONTHS[month]} <span className="mono">{year}</span></p>
            <button type="button" className="cal-nav" aria-label="Next month" onClick={() => move(addMonths(cursor, 1))}>›</button>
          </div>
          <div className="cal-weekdays" aria-hidden="true">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => <span key={w}>{w}</span>)}
          </div>
          <div className="cal-grid" ref={gridRef} onKeyDown={onKeyDown}>
            {Array.from({ length: blanks }, (_, i) => <span key={"b" + i} />)}
            {Array.from({ length: days }, (_, i) => {
              const d = new Date(year, month, i + 1);
              const iso = toISO(d);
              return (
                <button
                  type="button"
                  key={iso}
                  data-iso={iso}
                  className={`day ${iso === value ? "is-selected" : ""} ${iso === today ? "is-today" : ""}`}
                  disabled={d < minDate}
                  tabIndex={iso === toISO(cursor) ? 0 : -1}
                  aria-label={`${i + 1} ${MONTHS[month]} ${year}`}
                  aria-pressed={iso === value}
                  onClick={() => pick(d)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
