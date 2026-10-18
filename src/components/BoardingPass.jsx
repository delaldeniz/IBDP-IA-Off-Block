import { useRef } from "react";
import { useMagnetic } from "../effects/motion.js";
import Dropdown from "./controls/Dropdown.jsx";
import Combobox from "./controls/Combobox.jsx";
import DatePicker from "./controls/DatePicker.jsx";
import TimePicker from "./controls/TimePicker.jsx";
import RouteMap from "./RouteMap.jsx";
import Barcode from "./Barcode.jsx";
import { destinations, findDestination } from "../data/destinations.js";
import { airlineOptions, aircraftOptions, weatherOptions } from "../data/formOptions.js";
import { getTodayString } from "../data.js";
import "../styles/boarding.css";

// "2026-10-17" -> "17 OCT"
const stubDate = (s) => new Date(s + "T00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();

export default function BoardingPass({ form, setForm, errors, notice, loading, onSubmit }) {
  const button = useRef(null);
  useMagnetic(button);
  const set = (key) => (value) => setForm({ ...form, [key]: value });

  return (
    <div className="pass">
      <div className="pass-paper" />
      <span className="pass-tear" aria-hidden="true" />

      <div className="pass-body">
        <form
          className="pass-main"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="pass-head">
            <span className="pass-label">Boarding pass</span>
            <span className="pass-label">Delay check</span>
          </div>

          <div className="pass-route">
            <div className="pass-end">
              <span className="field-label">From</span>
              <p className="pass-code">IST</p>
              <p className="dest-city">Istanbul</p>
            </div>
            <div className="pass-middle">
              <RouteMap destination={findDestination(form.destination)} />
            </div>
            <Combobox id="destination" label="To" items={destinations} value={form.destination} onChange={set("destination")} />
          </div>

          <div className="pass-fields">
            <div className="field">
              <label className="field-label" htmlFor="flightNumber">Flight no.</label>
              <input
                id="flightNumber"
                className="field-trigger field-input"
                placeholder="e.g. TK1979"
                autoComplete="off"
                maxLength={8}
                value={form.flightNumber}
                aria-invalid={!!errors.flightNumber}
                onChange={(e) => set("flightNumber")(e.target.value.toUpperCase())}
              />
              {errors.flightNumber && <p className="pass-error" role="alert">{errors.flightNumber}</p>}
            </div>
            <Dropdown id="airline" label="Airline" options={airlineOptions} value={form.airline} onChange={set("airline")} />
            <Dropdown id="aircraft" label="Aircraft" options={aircraftOptions} value={form.aircraft} onChange={set("aircraft")} />
            <Dropdown id="weather" label="Weather" options={weatherOptions} value={form.weather} onChange={set("weather")} />
            <div>
              <DatePicker id="date" label="Date" value={form.date} min={getTodayString()} onChange={set("date")} />
              {errors.date && <p className="pass-error" role="alert">{errors.date}</p>}
            </div>
            <div>
              <TimePicker id="time" label="Time" value={form.time} onChange={set("time")} />
              {errors.time && <p className="pass-error" role="alert">{errors.time}</p>}
            </div>
            <div className="pass-action">
              <button ref={button} type="submit" className="btn-accent" disabled={!!loading}>
                {loading || "Check delay risk →"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="pass-progress" role="status">
              <span className="pass-progress-line" />
              <span className="pass-label">{loading}</span>
            </div>
          )}
          {!loading && notice && (
            <p className={`pass-notice is-${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}</p>
          )}
        </form>

        <aside className="pass-stub">
          <div>
            <p className="field-label">Departs</p>
            <p className="stub-big">{form.date ? stubDate(form.date) : "-- ---"}</p>
            <p className="stub-big">{form.time || "--:--"}</p>
          </div>
          <div className="stub-bottom">
            <p className="field-label">IST — {form.destination}</p>
            <Barcode seed={form.destination + form.airline + form.date + form.time} />
          </div>
        </aside>
      </div>
    </div>
  );
}
