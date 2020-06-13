import * as React from "react";
import { useRef, useState, useEffect, MutableRefObject } from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Station } from "../api/IrishRailApi";
import styled from "styled-components";
import { X } from "react-feather";
import ScheduleTable from "./ScheduleTable";
import { FavouriteHeart, Prompt } from "./FavouriteStations";
import { smallify } from "./JourneyStop";
import { useWindowSize } from "../hooks/useWindowSize";
import { subtleGrey, lightGrey, mediumGrey } from "./SharedStyles";
import { LoadingSpinner } from "./LoadingSpinner";

export interface TrainScheduleProps {
  station: Station;
  stationTrains: Train[];
  lookahead: number;
  handleStationClose: () => void;
  onError: () => void;
}

export const Card = styled.div<{ isPortable?: boolean; fades?: boolean }>`
  background-color: #fefefe;
  display: grid;
  grid-template-areas:
    "toolbar"
    "body";

  padding: ${(p) => (p.isPortable ? 0 : 15)}px;

  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  border-radius: 8px;
  position: relative;

  &:focus {
    outline: none;
  }

  @media only screen and (max-width: 1000px) {
    max-width: 400px;
    margin: auto;
  }
`;

export const CardToolbar = styled.div<{ isPortable?: boolean }>`
  grid-area: toolbar;
  display: grid;
  grid-template-columns: auto 1fr auto;
  margin: ${(p) => (p.isPortable ? "15px 20px" : "5px 5px 10px 5px")};
`;

export const CardHeader = styled.div<{ isPortable: boolean }>`
  font-weight: 700;
  font-size: 1.8em;
  grid-column: 2;
  align-self: center;
  padding-left: ${(p) => (p.isPortable ? 0 : 15)}px;

  @media only screen and (max-width: 1000px) {
    font-size: 1.6em;
  }
  @media only screen and (max-width: 400px) {
    font-size: 1.3em;
  }
`;

const CardToolbarButton = styled.div<{ gridColumn: number }>`
  grid-column: ${(p) => p.gridColumn};
  justify-self: center;
  cursor: pointer;
  background-color: white;
  border: 1px solid ${subtleGrey};
  height: 50px;
  width: 50px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5px;
  align-self: center;
  grid-row: 1;
  opacity: 0.8;
  transition: opacity 0.1s ease-out;
  box-shadow: 0 2px 0 ${subtleGrey};

  &:hover {
    opacity: 1;
  }

  button:focus {
    outline: 0;
  }
`;

const Error = styled.h2`
  font-weight: 700;
  text-align: center;
  margin: 100px;
  color: #777;
  user-select: none;
`;

export const CardBody = styled.div`
  grid-area: body;
`;

export const Schedule = (props: TrainScheduleProps) => {
  const { station, lookahead, stationTrains, handleStationClose } = props;
  const isPortable = useWindowSize().width <= 1000;
  const schedule = useRef<HTMLDivElement>();

  const handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      props.handleStationClose();
    }
  };
  if (!station || !stationTrains) return null;

  return (
    <>
      <Card
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        ref={schedule}
        isPortable={isPortable}
        fades={true}
      >
        <CardToolbar isPortable={isPortable}>
          <FavouriteHeart
            stationName={station.StationDesc}
            gridColumn={isPortable ? 3 : 1}
          />
          <CardHeader isPortable={isPortable}>
            {smallify(station.StationDesc, true)}
          </CardHeader>
          {isPortable ? null : (
            <CardToolbarButton gridColumn={3} onClick={handleStationClose}>
              <X size={32} />
            </CardToolbarButton>
          )}
        </CardToolbar>

        {stationTrains.length === 0 ? (
          <CardBody>
            <Error>
              No trains due at {station.StationDesc} for the next {lookahead}{" "}
              minutes
            </Error>
          </CardBody>
        ) : (
          <CardBody>
            <ScheduleTable stationTrains={stationTrains} />
          </CardBody>
        )}
      </Card>
    </>
  );
};

export default hot(module)(Schedule);
