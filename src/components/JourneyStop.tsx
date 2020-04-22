import * as React from "react";
import styled from "styled-components";
import { Movement } from "../api/IrishRailApi";

interface JourneyStopProps {
  station: Movement | any;
  stopNumber: number;
  trainPosition: number;
  journeyLength: number;
  forceShowTime?: boolean;
}

export const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  border: 2px solid #444;
  align-self: center;
  justify-self: center;

  &.departed,
  &.arrived {
    background-color: #444;
  }

  &.future {
    border-width: 1px;
  }
`;

export const Name = styled.div`
  font-weight: 600;
  user-select: none;
  writing-mode: vertical-lr;
  margin-top: 5px;

  &.arrived {
    font-weight: 700;
  }
`;

export const Time = styled.div`
  font-weight: 900;
  writing-mode: vertical-lr;
  margin-top: 5px;
  transition: opacity 0.1s ease-out;
  opacity: 0;

  &.show-time {
    opacity: 1;
  }
`;

export const StationDiv = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 5px;
  transform: rotate(215deg);

  &.departed {
    opacity: 0.2;
  }

  &.future {
    opacity: 0.8;
  }

  &:hover ${Time} {
    opacity: 1;
  }
`;

export const JourneyStop = (props: JourneyStopProps) => {
  const {
    station,
    stopNumber,
    journeyLength,
    trainPosition,
    forceShowTime,
  } = props;

  const getTime = () => {
    if (station.Departure) {
      return station.Departure;
    }
    if (station.Arrival) {
      if (station.LocationType === "D") {
        return station.Arrival;
      } else if (stopNumber === trainPosition) {
        return station.ExpectedDeparture;
      }
    }

    if (station.LocationType === "O") {
        return station.ExpectedDeparture;
    }

    return station.ExpectedArrival;
  };

  const getStyle = () => {
    const classNames =
      [
        0,
        journeyLength - 1,
        trainPosition - 1,
        trainPosition + 1,
        trainPosition,
      ].includes(stopNumber) || forceShowTime
        ? ["show-time"]
        : [];

    if (stopNumber < trainPosition) {
      classNames.push("departed");
    } else if (stopNumber == trainPosition) {
      classNames.push(!station.Arrival ? "approaching" : "arrived");
    } else {
      classNames.push("future");
    }

    return classNames.join(" ");
  };

  return (
    <StationDiv className={getStyle()}>
      <Dot className={getStyle()} />
      <Name className={getStyle()}>{station.LocationFullName}</Name>
      <Time className={getStyle()}>· {getTime()}</Time>
    </StationDiv>
  );
};
