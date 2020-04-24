import * as React from "react";
import { render } from "react-dom";
require("./favicon.ico");
import App from "./components/App";
import styled from "styled-components";

const rootEl = document.getElementById("root");

const Root = styled.div`
  @import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Nunito:wght@300;600;700;800;900&display=swap");

  background-color: #fbfbfb;
  font-family: "Nunito", sans-serif;
  width: 100%;
  padding-bottom: 150px;
  min-height: 100vh;

  * {
    box-sizing: border-box;
    border-collapse: collapse;
    font-family: "Nunito", sans-serif;
  }
`;

render(<Root children={<App />} />, rootEl);
