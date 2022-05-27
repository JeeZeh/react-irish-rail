import * as React from "react";
import { useRef, useContext, useState, useEffect } from "react";
import { ITrain, IStation, IRoute } from "../api/IrishRailApi";
import styled, { ThemeContext } from "styled-components";
import { X, Heart } from "react-feather";
import ScheduleTable from "./ScheduleTable";
import { smallify } from "./JourneyStop";
import { useWindowSize } from "../hooks/useWindowSize";
import { TrainFilter } from "./TrainFilter";

export interface TrainScheduleProps {
  station: IStation;
  stationTrains: ITrain[];
  lookahead: number;
  handleStationClose: () => void;
  isFavourite: boolean;
  onToggleFavourite: (stationCode: string) => void;
  stationConnections: IRoute[];
}

export const Card = styled.div<{ isPortable?: boolean; fades?: boolean }>`
  background-color: ${(p) => p.theme.offMax};
  display: grid;
  grid-template-areas:
    "toolbar"
    "body";

  padding: ${(p) => (p.isPortable ? 0 : 15)}px;

  box-shadow: 0 5px 8px ${(p) => p.theme.shadow};
  border: 1px solid ${(p) => p.theme.faint};
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
  grid-template-columns: ${(p) =>
    p.isPortable ? "1fr auto auto" : "auto 1fr auto"};
  margin: ${(p) => (p.isPortable ? "15px 20px" : "5px 5px 10px 5px")};

  & > div:last-child {
    margin-left: 15px;
  }
`;

export const CardHeader = styled.div<{
  isPortable: boolean;
  gridColumn?: number;
}>`
  font-weight: 700;
  font-size: 1.8em;
  grid-column: ${(p) => p.gridColumn ?? 2};
  align-self: center;
  user-select: none;
  padding-left: ${(p) => (p.isPortable ? 0 : 15)}px;

  @media only screen and (max-width: 1000px) {
    font-size: 1.6em;
  }
  @media only screen and (max-width: 400px) {
    font-size: 1.2em;
  }
`;

const CardToolbarButton = styled.div<{ gridColumn: number }>`
  grid-column: ${(p) => p.gridColumn};
  justify-self: center;
  cursor: pointer;
  background-color: ${(p) => p.theme.nearlyBg};
  border: 1px solid ${(p) => p.theme.button};
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
  box-shadow: 0 2px 0 ${(p) => p.theme.button};
  fill: none;

  &:hover {
    opacity: 1;
  }

  button:focus {
    outline: 0;
  }

  & svg {
    stroke: ${(p) => p.theme.secondaryText};
  }
`;

const Error = styled.h2`
  font-weight: 700;
  text-align: center;
  margin: 100px;
  color: ${(p) => p.theme.lightEmphasis};
  user-select: none;
`;

export const CardBody = styled.div`
  grid-area: body;
`;

export const Schedule = (props: TrainScheduleProps) => {
  const {
    station,
    lookahead,
    stationTrains,
    handleStationClose,
    isFavourite,
    onToggleFavourite,
    stationConnections,
  } = props;
  const isPortable = useWindowSize().width <= 1000;
  const schedule = useRef<HTMLDivElement>();
  const themeContext = useContext(ThemeContext);
  const [trainFilter, setTrainFilter] = useState<string[]>();
  const [title, setTitle] = useState(station?.StationDesc ?? "");
  const [stationToTrainMap, setStationToTrainMap] = useState(
    new Map<string, Set<string>>()
  );

  const generateStationTrainMap = (stationConnections: IRoute[]) => {
    const connectionMap = new Map<string, Set<string>>();
    const reachableStations = stationConnections?.map((r) => ({
      code: r.trainCode,
      stops: r.stops.slice(
        r.stops.findIndex((s) => s === station.StationDesc) + 1
      ),
    }));
    reachableStations?.forEach(({ code, stops }) => {
      stops.forEach((s) => {
        if (connectionMap.has(s)) {
          connectionMap.set(s, connectionMap.get(s).add(code));
        } else {
          connectionMap.set(s, new Set([code]));
        }
      });
    });
    return connectionMap;
  };

  useEffect(() => {
    const map = generateStationTrainMap(stationConnections);
    setStationToTrainMap(map);
  }, [stationConnections]);

  const handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      handleStationClose();
    }
  };

  useEffect(() => {
    if (!station) return;
    setTitle(smallify(station.StationDesc, !isPortable));
  }, [stationTrains]);

  return (
    <>
      {station && stationTrains && title && (
        <Card
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          ref={schedule}
          isPortable={isPortable}
          fades={true}
        >
          <CardToolbar isPortable={isPortable}>
            <CardToolbarButton
              gridColumn={isPortable ? 2 : 1}
              className={isFavourite ? "on" : null}
              onClick={() => onToggleFavourite(station.StationDesc)}
            >
              <Heart
                size={28}
                fill={isFavourite ? themeContext.favourite : null}
                opacity={isFavourite ? 1 : 0.8}
              />
            </CardToolbarButton>

            <CardHeader isPortable={isPortable} gridColumn={isPortable ? 1 : 2}>
              {title}
            </CardHeader>
            <CardToolbarButton gridColumn={3} onClick={handleStationClose}>
              <X size={32} />
            </CardToolbarButton>
          </CardToolbar>
          <CardBody>
            <TrainFilter
              stationToTrainMap={stationToTrainMap}
              onTrainFilter={setTrainFilter}
              currentStation={station}
            />

            {stationTrains.length === 0 ? (
              <Error>
                No trains due at {station.StationDesc} for the next {lookahead}{" "}
                minutes
              </Error>
            ) : (
              <ScheduleTable
                stationTrains={
                  trainFilter?.length > 0
                    ? stationTrains.filter((t) =>
                        trainFilter.includes(t.Traincode)
                      )
                    : stationTrains
                }
              />
            )}
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default Schedule;
