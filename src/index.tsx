import * as React from "react";
import { render } from "react-dom";
require("./favicon.ico");
import App from "./components/App";

const rootEl = document.getElementById("root");

render(<App />, rootEl);
