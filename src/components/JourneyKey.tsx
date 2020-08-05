import * as React from "react";
import styled from "styled-components";
import { Time, StationDiv, Name, Dot } from "./JourneyStop";
import { Divider } from "./MobileTrainCard";
import { useWindowSize } from "../hooks/useWindowSize";

const Key = styled.div<{ isPortable?: boolean }>`
  grid-area: key;
  display: flex;
  flex-direction: column;
  cursor: default;
  width: ${(p) => (p.isPortable ? "auto" : "260px")};
  user-select: none;
  transition: opacity 0.1s ease-out;
  writing-mode: horizontal-tb;

  hr {
    width: 100%;
    margin: 15px 0;
  }

  & p {
    margin: 10px;
    margin-top: 0;
    color: ${(p) => p.theme.secondaryText};
  }

  & ${Dot} {
    writing-mode: horizontal-tb;

    &.delayed,
    &.early {
      height: auto;
    }
  }

  & ${StationDiv} {
    padding: 0;
    width: 100%;
    transform: none;
    height: 20px;
    width: 100%;
    flex-direction: column;
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
  const isPortable = useWindowSize().width <= 1000;
  return (
    <Key isPortable={isPortable}>
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
