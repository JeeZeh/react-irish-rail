import * as React from "react";
import { render } from "react-dom";
require("./browserconfig.xml");
require("./safari-pinned-tab.svg");
require("./favicon.ico");
import App from "./components/App";
// import { polyfill as smoothScrollPolyfill } from "smoothscroll-polyfill";

// Polyfill disabled for now :/
// smoothScrollPolyfill();

const rootEl = document.getElementById("root");

const isDev =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

if (!isDev && location.protocol !== "https:") {
  location.replace(
    `https:${location.href.substring(location.protocol.length)}`
  );
}

if ("serviceWorker" in navigator && !isDev) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
        registration.update();
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

render(<App />, rootEl);
