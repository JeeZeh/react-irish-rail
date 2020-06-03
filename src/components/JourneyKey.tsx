import * as React from "react";
import styled from "styled-components";
import { Time, StationDiv, Name, Dot } from "./JourneyStop";
import { Divider } from "./MobileTrainCard";

const Key = styled.div`
  grid-area: key;
  display: flex;
  flex-direction: column;
  cursor: default;
  user-select: none;
  transition: opacity 0.1s ease-out;
  writing-mode: horizontal-tb;

  hr {
    width: 100%;
    margin: 15px 0;
  }

  & p {
    margin: 10px 0;
    margin-top: 0;
  }

  & ${Dot} {
    writing-mode: horizontal-tb;
  }

  & ${StationDiv} {
    padding: 0;
    width: 100%;
    transform: none;
    height: 20px;
  }

  & ${Name} {
    writing-mode: horizontal-tb;
    margin: 0 0 0 5px;
  }

  & ${Time} {
    writing-mode: horizontal-tb;
    &::before {
      margin: 0 5px;
    }
  }
`;

export const JourneyKey = () => {
  return (
    <Key>
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
      <StationDiv className="">
        <Dot className="" />
        <Name className="">Approaching</Name>
        <Time className="show-time">Arriving Time</Time>
      </StationDiv>
      <StationDiv className="future">
        <Dot className="future" />
        <Name className="future">Future Stop</Name>
        <Time className="future show-time">Arriving Time</Time>
      </StationDiv>
      <Divider className="fade" margin="5px 0" />
      <p>
        If a train defers from schedule, the new arrival time along with the
        original schedule are shown:
      </p>

      <StationDiv>
        <Dot className="delayed show-time">!</Dot>
        <Name className="delayed">Delayed</Name>
        <Time className="delayed show-time">New Time (old)</Time>
      </StationDiv>
      <StationDiv>
        <Dot className="early show-time">!</Dot>
        <Name className="early">Early</Name>
        <Time className="early show-time">New Time (old)</Time>
      </StationDiv>
    </Key>
  );
};
