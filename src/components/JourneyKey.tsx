import * as React from "react";
import styled from "styled-components";
import { Time, StationDiv, Name, Dot } from "./JourneyStop";

const Header = styled.h5`
  font-weight: 700;
  font-size: 1.3em;
`;

const Key = styled.div`
  grid-area: key;
  display: flex;
  flex-direction: column;
  width: 100%;
  cursor: default;
  user-select: none;
  transition: opacity 0.1s ease-out;
  writing-mode: horizontal-tb;

  hr {
    width: 100%;
    margin: 15px 0;
  }

  & p {
    margin-top: 0;
  }

  ${Header} {
    padding-top: 5px;
  }

  ${Dot} {
    writing-mode: horizontal-tb;
  }

  ${StationDiv} {
    padding: 0;
    width: 100%;
    transform: none;
    flex-direction: row;
  }

  ${Name} {
    writing-mode: horizontal-tb;
    margin: 0 0 0 5px;
  }

  ${Time} {
    writing-mode: horizontal-tb;
    &::before {
      margin: 0 5px;
    }
  }
`;

export const JourneyKey = () => {
  return (
    <Key>
      <Header>Map Key</Header>
      <StationDiv className="departed">
        <Dot className="departed" />
        <Name className="departed">Departed</Name>
        <Time className="departed show-time">Departed Time</Time>
      </StationDiv>
      <StationDiv className="arrived">
        <Dot className="arrived" />
        <Name className="arrived">Arrived</Name>
        <Time className="arrived show-time">Departing Time</Time>
      </StationDiv>
      <StationDiv className="appraoching">
        <Dot className="appraoching" />
        <Name className="appraoching">Appraoching</Name>
        <Time className="appraoching show-time">Arriving Time</Time>
      </StationDiv>
      <StationDiv className="future">
        <Dot className="future" />
        <Name className="future">Future Stop</Name>
        <Time className="future show-time">Arriving Time</Time>
      </StationDiv>
      <hr />
      <p>
        If a train defers from schedule, the new arrival time along with the
        original schedule are shown:
      </p>

      <StationDiv>
        <Dot className="delayed show-time">!</Dot>
        <Name className="approaching">Delayed</Name>
        <Time className="approaching delayed show-time">
          Expected (scheduled)
        </Time>
      </StationDiv>
      <StationDiv>
        <Dot className="early show-time">!</Dot>
        <Name className="approaching">Early</Name>
        <Time className="approaching early show-time">
          Expected (scheduled)
        </Time>
      </StationDiv>
    </Key>
  );
};
