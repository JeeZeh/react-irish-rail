import React from "react";
import styled from "styled-components";
import { IMovement, ITrain } from "../api/IrishRailApi";
import "moment/locale/en-ie";
import { useWindowSize } from "../hooks/useWindowSize";
import moment from "moment";
moment.locale("en-ie");

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

/**
 * Retrieve the time to be displayed with the station on the journey map, formatted HH:MM.
 * Time returned depenends on the status of the train, i.e. if arrived show scheduled departure, etc.
 */
const getTime = ({
  movement,
  stopNumber,
  trainPosition,
}: Pick<
  JourneyStopProps,
  "movement" | "stopNumber" | "trainPosition"
>): string => {
  if (!movement.ExpectedArrival) {
    console.log(movement.LocationFullName, movement);
  }

  // Train left
  if (movement.Departure) {
    return movement.Departure.format("HH:mm");
  }

  // Train arrived at the station. If it's the destination, return the arrival time... it's not going anywhere
  if (movement.Arrival && movement.LocationType === "D") {
    return movement.Arrival.format("HH:mm");
  }

  // If we're stopped at a station, or if it's the origin (O or index 1) station, show the expected departure
  if (
    stopNumber === trainPosition ||
    movement.LocationType === "O" ||
    movement.LocationOrder == 1
  ) {
    return movement.ExpectedDeparture.format("HH:mm");
  }

  // Otherwise we haven't yet arrived at this station, return the expected arrival time
  if (movement.ExpectedArrival) {
    return movement.ExpectedArrival.format("HH:mm");
  }

  // Base case if all else fails
  return "??:??";
};

/**
 * Generates the classes needed to style a the current JourneyStop on the train map.
 */
const getStationStyleClasses = (
  {
    movement,
    stopNumber,
    journeyLength,
    trainPosition,
    forceShowTime,
    train,
  }: JourneyStopProps,
  time: string
) => {
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
    classNames.push(movement.Arrival ? "arrived" : "approaching");
  } else {
    classNames.push("future");
  }

  if (
    !movement.Arrival &&
    movement.LocationFullName == train.Stationfullname &&
    movement.ScheduledArrival &&
    movement.ExpectedArrival
  ) {
    classNames.push("relevant");
    classNames.push("show-time");
    const diff = movement.ExpectedArrival.diff(
      movement.ScheduledArrival,
      "minutes"
    );

    let unaccountedDelay = 0;

    // Only check the unaccounted delay if it's the next station
    if (trainPosition !== -1 && trainPosition + 1 == movement.LocationOrder) {
      unaccountedDelay = moment(train.Querytime, "HH:mm:SS").diff(
        movement.ExpectedArrival,
        "minutes"
      );
    }

    if (movement.ScheduledArrival && (diff > 2 || unaccountedDelay > 2)) {
      classNames.push("delayed");
      time = `${time} (${movement.ScheduledArrival.format("HH:mm")})`;
    } else if (diff < -2) {
      classNames.push("early");
      time = `${time} (${movement.ScheduledArrival.format("HH:mm")})`;
    }
  }

  return classNames.join(" ");
};

interface JourneyStopProps {
  movement: IMovement;
  stopNumber: number;
  trainPosition: number;
  journeyLength: number;
  train: ITrain;
  forceShowTime?: boolean;
}

export const JourneyStop = (props: JourneyStopProps) => {
  const { movement } = props;
  const isPortable = useWindowSize().width <= 1000;

  let time: string | React.ReactElement = "";
  let classes = "";

  time = getTime(props);
  classes = getStationStyleClasses(props, time);

  return (
    <StationDiv className={classes} isPortable={isPortable}>
      <Dot className={classes} isPortable={isPortable}>
        {classes.includes("early") || classes.includes("delayed") ? "!" : null}
      </Dot>
      <Name className={classes} isPortable={isPortable}>
        {smallify(movement.LocationFullName)}
      </Name>
      <Time className={classes} isPortable={isPortable}>
        {time}
      </Time>
    </StationDiv>
  );
};
