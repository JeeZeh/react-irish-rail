import * as React from "react";
import { render } from "react-dom";
require("./favicon.ico");
import App from "./components/App";
import styled from "styled-components";

const rootEl = document.getElementById("root");

const Root = styled.div`
  background-color: #fbfbfb;
  width: 100%;
  min-height: 100vh;

  * {
    box-sizing: border-box;
    font-family: "Nunito", sans-serif;
  }
`;

render(<Root children={<App />} />, rootEl);
