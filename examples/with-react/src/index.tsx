import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

export function createRoot(rootEl: HTMLElement) {
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}
