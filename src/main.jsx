import React from "react";
import ReactDOM from "react-dom/client";
// global styles first so component styles can override them
import "./styles/tokens.css";
import "./styles/base.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
