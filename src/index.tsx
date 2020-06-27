import * as React from "react";
import { render } from "react-dom";
require("./favicon.ico");
import App from "./components/App";

const rootEl = document.getElementById("root");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

render(<App />, rootEl);
