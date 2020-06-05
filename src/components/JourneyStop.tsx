import * as React from "react";
import styled from "styled-components";
import { Movement, Train } from "../api/IrishRailApi";
import moment = require("moment");
import { useWindowSize } from "../hooks/useWindowSize";

interface JourneyStopProps {
  station: Movement | any;
  stopNumber: number;
  trainPosition: number;
  journeyLength: number;
  train: Train;
  forceShowTime?: boolean;
}

export const Dot = styled.div<{ isPortable?: boolean }>`
  height: 10px;
  width: 10px;
  border-radius: 5px;
  border: 3px solid #444;
  font-size: 1em;
  font-weight: 900;
  writing-mode: inherit;

  &.departed,
  &.arrived {
    background-color: #444;
  }

  &.future {
    border-width: 2px;
  }

  &.delayed,
  &.early {
    align-self: "center";
    border: none;
    ${(p) => (!p.isPortable ? "width: auto" : null)};
    ${(p) => (p.isPortable ? "text-align: center" : null)};
    ${(p) => (p.isPortable ? "height: auto" : null)};
  }

  &.delayed {
    color: darkorange;
  }

  &.early {
    color: darkblue;
  }
`;

export const Name = styled.div<{ isPortable?: boolean }>`
  font-weight: 600;
  user-select: none;
  writing-mode: inherit;
  ${(p) => (!p.isPortable ? "margin-top" : "margin-left")}: 5px;

  &.arrived {
    font-weight: 700;
  }

  &.relevant {
    font-weight: 800;
  }
`;

export const Time = styled.div<{ isPortable?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: ${(p) => (p.isPortable ? "center" : null)};
  font-weight: 800;
  transition: opacity 0.1s ease-out;
  opacity: 0;

  &.show-time {
    opacity: 1;
  }

  &::before {
    content: " · ";
    margin: ${(p) => (p.isPortable ? "0 5px" : "5px 0")};
  }

  &.delayed {
    color: darkorange;
  }

  &.early {
    color: darkblue;
  }
`;

export const StationDiv = styled.div<{ isPortable?: boolean }>`
  display: flex;
  flex-direction: "row";
  align-items: center;
  width: ${(p) => (p.isPortable ? "100%" : null)};
  height: ${(p) => (!p.isPortable ? "100%" : null)};
  margin: ${(p) => (p.isPortable ? "2px" : "0 4px")};
  writing-mode: ${(p) => (p.isPortable ? "horizontal-tb" : "vertical-lr")};
  transform: ${(p) =>
    !p.isPortable ? "rotate(225deg) translateY(-35px)" : null};

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

  const isPortable = useWindowSize().width < 900;

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
      classNames.push(station.Arrival ? "arrived" : null);
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

      // Only check the unaccounted delay if it's the next station
      if (trainPosition !== -1 && trainPosition + 1 == station.LocationOrder) {
        unaccountedDelay = moment(train.Querytime, "HH:mm:SS").diff(
          moment(station.ExpectedArrival, "HH:mm:SS"),
          "minutes"
        );
      }

      if (diff > 2 || unaccountedDelay > 2) {
        classNames.push("delayed");
        time = `${time} (${station.ScheduledArrival})`;
      } else if (diff < -2) {
        classNames.push("early");
        time = `${time} (${station.ScheduledArrival})`;
      }
    }

    return classNames.join(" ");
  };

  const smallify = (name: string): string => {
    return name
      .replace(/\band\b/gi, "&")
      .replace(/\bpark\b/gi, "Pk.")
      .replace(/\bnorth\b/gi, "N.")
      .replace(/\bsouth\b/gi, "S.")
      .replace(/\beast\b/gi, "E.")
      .replace(/\bwest\b/gi, "W.")
      .replace(/\bparkway\b/gi, "Pkway.")
      .replace(/\bjunction\b/gi, "Jnct.")
      .replace(/\bbridge\b/gi, "Brdg.");
  };

  time = getTime();
  classes = getClasses();

  return (
    <StationDiv className={classes} isPortable={isPortable}>
      <Dot className={classes} isPortable={isPortable}>
        {classes.includes("early") || classes.includes("delayed") ? "!" : null}
      </Dot>
      <Name className={classes} isPortable={isPortable}>
        {smallify(station.LocationFullName)}
      </Name>
      <Time className={classes} isPortable={isPortable}>
        {time}
      </Time>
    </StationDiv>
  );
};
