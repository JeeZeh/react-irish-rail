import * as React from "react";
import { render } from "react-dom";
require("./favicon.ico");
import App from "./components/App";
import styled from "styled-components";

const rootEl = document.getElementById("root");

const Root = styled.div`
  background-color: #fbfbfb;
  font-family: "Nunito", sans-serif;
  width: 100%;
  padding-bottom: 150px;
  min-height: 100vh;
`;

render(<Root children={<App />} />, rootEl);
