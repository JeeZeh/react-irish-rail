import * as React from "react";
import { render } from "react-dom";
require("./favicon.ico");
import App from "./components/App";
import { polyfill as smoothScrollPolyfill } from "smoothscroll-polyfill";

// kick off the polyfill!
smoothScrollPolyfill();

const rootEl = document.getElementById("root");

const isDev =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

if (!isDev && location.protocol !== "https:") {
  location.replace(
    `https:${location.href.substring(location.protocol.length)}`
  );
}

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
