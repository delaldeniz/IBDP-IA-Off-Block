import { useEffect, useRef, useState } from "react";
import { usePopover, keepInView } from "./usePopover.js";
import "../../styles/controls.css";

// destination search: the big IATA code is the text input itself
export default function Combobox({ id, label, items, value, onChange }) {
  const { open, up, rootRef, show, hide } = usePopover(300);
  const [query, setQuery] = useState(null); // null = not typing
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const selected = items.find((d) => d.code === value) || items[0];

  // matches that start with the query (code or city) come first
  const q = (query || "").trim().toLowerCase();
  const found = q ? items.filter((d) => `${d.code} ${d.city} ${d.airport}`.toLowerCase().includes(q)) : items;
  const starts = (d) => d.code.toLowerCase().startsWith(q) || d.city.toLowerCase().startsWith(q);
  const matches = [...found.filter(starts), ...found.filter((d) => !starts(d))];

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    if (open) keepInView(listRef.current, active);
  }, [open, active]);

  const close = () => {
    setQuery(null);
    hide();
  };
  const choose = (d) => {
    onChange(d.code);
    close();
  };

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open ? setActive(Math.min(matches.length - 1, active + 1)) : show();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(0, active - 1));
    } else if (e.key === "Enter" && open && matches[active]) {
      e.preventDefault();
      choose(matches[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  }

  return (
    <div className="dest" ref={rootRef}>
      <div className="dest-label-row">
        <label className="field-label" htmlFor={id}>{label}</label>
        <button type="button" className="dest-change" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => inputRef.current.focus()}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          Change
        </button>
      </div>
      <input
        ref={inputRef}
        id={id}
        className={query === null ? "dest-input" : "dest-input is-typing"}
        placeholder="City or code"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && matches[active] ? `${id}-${active}` : undefined}
        aria-describedby={`${id}-hint`}
        autoComplete="off"
        spellCheck="false"
        value={query ?? selected.code}
        onFocus={(e) => {
          e.target.select();
          show();
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) show();
        }}
        onBlur={close}
        onKeyDown={onKeyDown}
      />
      <p className="dest-city">
        {selected.city}
        {selected.airport && <span className="dest-airport"> · {selected.airport}</span>}
      </p>
      <p className="dest-hint" id={`${id}-hint`}>Click the code or type a city to change</p>

      {open && (
        <ul ref={listRef} id={`${id}-list`} role="listbox" className={`popup popup-list popup-wide ${up ? "is-up" : ""}`} data-lenis-prevent>
          {!matches.length && <li className="option-empty">No airport matches "{query}"</li>}
          {matches.map((d, i) => (
            <li
              key={d.code}
              id={`${id}-${i}`}
              role="option"
              aria-selected={d.code === value}
              className={i === active ? "option option-dest is-active" : "option option-dest"}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(d)}
            >
              <span className="option-code">{d.code}</span>
              <span className="option-city">{d.city}</span>
              <span className="option-airport">{d.airport}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
