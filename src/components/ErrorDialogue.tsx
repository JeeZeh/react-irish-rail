import React from "react"
import styled from "styled-components";
import { LifeBuoy } from "react-feather";
import { H1A } from "./SharedStyles";

const Error = styled.div`
  text-align: center;
`;
const Dialogue = styled.div`
  grid-area: schedule;
  margin: auto;
  flex-direction: column;
  align-items: center;
  display: flex;
  padding: 40px;
  max-width: 400px;

  & div {
    padding: 20px 0;
  }
`;

export const ErrorDialogue = () => {
  return (
    <Dialogue>
      <H1A>Sorry.</H1A>
      <LifeBuoy size={64} />
      <Error>The app is unavailable right now</Error>
      <Error>
        The Irish Rail schedule service may be offline or something didn't go as
        planned, try refreshing this page just in case. If the error persists
        for more than a couple minutes please tweet me @JeeZeh! In a rush?{" "}
        <a href="https://www.irishrail.ie/" target="_blank">
          Click here to go straight to the official Irish Rail website
        </a>
      </Error>
    </Dialogue>
  );
};
