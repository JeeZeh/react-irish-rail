import * as React from "react";
import styled from "styled-components";
import { Movement, Train } from "../api/IrishRailApi";
import moment = require("moment");

interface JourneyStopProps {
  station: Movement | any;
  stopNumber: number;
  trainPosition: number;
  journeyLength: number;
  forceShowTime?: boolean;
  train: Train;
}

export const Dot = styled.div`
  height: 10px;
  width: 10px;
  border-radius: 5px;
  border: 2px solid #444;
  font-size: 1em;
  font-weight: 900;

  &.departed,
  &.arrived {
    background-color: #444;
  }

  &.future {
    border-width: 1px;
  }

  &.delayed {
    writing-mode: vertical-lr;
    border: none;
    color: darkorange;
    align-self: end;
  }

  &.early {
    writing-mode: vertical-lr;
    align-self: end;
    border: none;
    color: darkblue;
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

  &.relevant {
    font-weight: 800;
  }
`;

export const OffSchedule = styled.div`
  position: absolute;
  font-weight: 700;
  transform: translateX(-85%);
  height: 250%;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 5px;
  padding: 5px;
  opacity: 0;
  transition: opacity 0.08s ease-out;

  &:hover {
    opacity: 1;
  }
`;

export const Time = styled.div`
  position: relative;
  display: inline-flex;
  font-weight: 800;
  writing-mode: vertical-lr;
  transition: opacity 0.1s ease-out;
  opacity: 0;

  &.show-time {
    opacity: 1;
  }

  &::before {
    content: "·  ";
    margin: 5px 0;
  }

  &.delayed {
    color: darkorange;
  }

  &.early {
    color: darkblue;
  }
`;

export const StationDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  padding: 0 8px;
  transform: rotate(225deg);

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
    train,
  } = props;

  let time: string | React.ReactElement = "";
  let classes = "";

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

  const getClasses = () => {
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

    if (!station.Arrival && station.LocationFullName == train.Stationfullname) {
      classNames.push("relevant");
      classNames.push("show-time");
      const diff = moment(station.ExpectedArrival, "HH:mm:SS").diff(
        moment(station.ScheduledArrival, "HH:mm:SS"),
        "minutes"
      );

      let unaccountedDelay = 0;

      if (trainPosition !== -1) {
        unaccountedDelay = moment(train.Querytime, "HH:mm:SS").diff(
          moment(station.ExpectedArrival, "HH:mm:SS"),
          "minutes"
        );
      }

      if (diff > 2 || unaccountedDelay > 2) {
        classNames.push("delayed");
        time = `${time} (${station.ScheduledArrival})`;
        // time = (<div>{time} <OffSchedule>Scheduled {station.ScheduledArrival}</OffSchedule></div>)
      } else if (diff < -2) {
        classNames.push("early");
        time = `${time} (${station.ScheduledArrival})`;
      }
    }

    return classNames.join(" ");
  };

  time = getTime();
  classes = getClasses();

  return (
    <StationDiv className={classes}>
      <Dot className={classes}>
        {classes.includes("early") || classes.includes("delayed") ? "!" : null}
      </Dot>
      <Name className={classes}>{station.LocationFullName}</Name>
      <Time className={classes}>{time}</Time>
    </StationDiv>
  );
};
