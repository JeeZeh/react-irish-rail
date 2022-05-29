import React from "react"
import styled from "styled-components";
import { IMovement, ITrain } from "../api/IrishRailApi";
import "moment/locale/en-ie";
import { useWindowSize } from "../hooks/useWindowSize";
import moment from "moment";
moment.locale("en-ie");

interface JourneyStopProps {
  station: IMovement;
  stopNumber: number;
  trainPosition: number;
  journeyLength: number;
  train: ITrain;
  forceShowTime?: boolean;
}

export const Dot = styled.div<{ isPortable?: boolean }>`
  height: 10px;
  width: 10px;
  border-radius: 5px;
  border: 3px solid ${(p) => p.theme.primaryText};
  background-color: ${(p) => p.theme.primaryText};

  font-size: 1em;
  font-weight: 900;
  writing-mode: inherit;

  &.approaching {
    background: none;
  }

  &.departed {
    background-color: ${(p) => p.theme.departed};
    border: 3px solid ${(p) => p.theme.departed};
  }

  &.future {
    border-width: 2px;
    background: none;
    border: 3px solid ${(p) => p.theme.future};
  }

  &.delayed,
  &.early {
    align-self: "center";
    border: none;
    background: none;
    ${(p) => (!p.isPortable ? "width: auto" : null)};
    ${(p) => (p.isPortable ? "text-align: center" : null)};
    ${(p) => (p.isPortable ? "height: auto" : null)};
  }

  &.delayed {
    color: ${(p) => p.theme.delayed};
  }

  &.early {
    color: ${(p) => p.theme.early};
  }
`;

export const Name = styled.div<{ isPortable?: boolean }>`
  font-weight: 600;
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
    color: ${(p) => p.theme.delayed};
  }

  &.early {
    color: ${(p) => p.theme.early};
  }
`;

export const StationDiv = styled.div<{ isPortable?: boolean }>`
  display: flex;
  flex-direction: "row";
  align-items: center;
  user-select: none;
  color: ${(p) => p.theme.primaryText};

  width: ${(p) => (p.isPortable ? "100%" : null)};
  height: ${(p) => (!p.isPortable ? "100%" : null)};
  margin: ${(p) => (p.isPortable ? "2px" : "0 8px")};
  writing-mode: ${(p) => (p.isPortable ? "horizontal-tb" : "vertical-lr")};
  transform: ${(p) =>
    !p.isPortable ? "rotate(225deg) translateY(-35px)" : null};

  &.departed {
    color: ${(p) => p.theme.departed};
  }

  &.future {
    color: ${(p) => p.theme.future};
  }

  &:hover ${Time} {
    opacity: 1;
  }
`;

export const smallify = (name: string, lite?: boolean): string => {
  name = name
    .replace(/\band\b/gi, "&")
    .replace(/\bnorth\b/gi, "N.")
    .replace(/\bsouth\b/gi, "S.")
    .replace(/\beast\b/gi, "E.")
    .replace(/\bwest\b/gi, "W.");

  if (!lite)
    name = name
      .replace(/\bpark\b/gi, "Pk.")
      .replace(/\bparkway\b/gi, "Pkway.")
      .replace(/\bjunction\b/gi, "Jnct.")
      .replace(/\bbridge\b/gi, "Brdg.");

  return name;
};

export const JourneyStop = (props: JourneyStopProps) => {
  const {
    station,
    stopNumber,
    journeyLength,
    trainPosition,
    forceShowTime,
    train,
  } = props;

  const isPortable = useWindowSize().width <= 1000;

  let time: string | React.ReactElement = "";
  let classes = "";

  const getTime = (): string => {
    if (station.Departure) {
      return station.Departure.format("HH:mm");
    }
    if (station.Arrival) {
      if (station.LocationType === "D") {
        return station.Arrival.format("HH:mm");
      } else if (stopNumber === trainPosition) {
        return station.ExpectedDeparture.format("HH:mm");
      }
    }

    if (station.LocationType === "O") {
      return station.ExpectedDeparture.format("HH:mm");
    }

    return station.ExpectedArrival.format("HH:mm");
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
      classNames.push(station.Arrival ? "arrived" : "approaching");
    } else {
      classNames.push("future");
    }

    if (
      !station.Arrival &&
      station.LocationFullName == train.Stationfullname &&
      station.ScheduledArrival &&
      station.ExpectedArrival
    ) {
      classNames.push("relevant");
      classNames.push("show-time");
      const diff = station.ExpectedArrival.diff(
        station.ScheduledArrival,
        "minutes"
      );

      let unaccountedDelay = 0;

      // Only check the unaccounted delay if it's the next station
      if (trainPosition !== -1 && trainPosition + 1 == station.LocationOrder) {
        unaccountedDelay = moment(train.Querytime, "HH:mm:SS").diff(
          station.ExpectedArrival,
          "minutes"
        );
      }

      if (station.ScheduledArrival && (diff > 2 || unaccountedDelay > 2)) {
        classNames.push("delayed");
        time = `${time} (${station.ScheduledArrival.format("HH:mm")})`;
      } else if (diff < -2) {
        classNames.push("early");
        time = `${time} (${station.ScheduledArrival.format("HH:mm")})`;
      }
    }

    return classNames.join(" ");
  };

  time = getTime();
  classes = getClasses();

  console.log(station);

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
