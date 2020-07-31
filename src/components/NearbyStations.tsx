import * as React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { Globe, ChevronsDown } from "react-feather";
import { Station } from "../api/IrishRailApi";
import { useWindowSize } from "../hooks/useWindowSize";
import { LoadingSpinner } from "./LoadingSpinner";
import { JourneyButton } from "./MobileTrainCard";
import { smallify } from "./JourneyStop";
import Collapsible from "react-collapsible";
import {
  CollapseWrap,
  CollapseHeader,
  CollapseHeaderTitle,
  ListWrap,
  CollapsibleItemList,
} from "./CollapsibleItemList";
import { stat } from "fs";

interface NearbyStationsProps {
  stationList: Station[];
  initialOpenState: boolean;
  onStationChange: (stationName: string) => void;
  station: Station;
}

interface Position {
  latitude: number;
  longitude: number;
}

const GeoStation = styled(JourneyButton)`
  margin: 5px 0;
  align-self: start;
  & .distance {
    color: ${(p) => p.theme.emphasis};
    font-weight: 400;
    margin-left: 10px;
  }
`;

export const NearbyStations = (props: NearbyStationsProps) => {
  const [proximityStations, setProximityStations] = useState<
    { station: Station; distance: number }[]
  >();
  const [position, setPosition] = useState<Position>();
  const [error, setError] = useState(null);
  const isPortable = useWindowSize().width <= 1000;
  const { stationList, onStationChange, initialOpenState, station } = props;
  const [open, setOpen] = useState(initialOpenState);

  const onChange = ({ coords }) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };
  const onError = (error) => {
    setError(error.message);
  };
  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) {
      setError("Geolocation is not supported");
      return;
    }
    const watcher = geo.watchPosition(onChange, onError);
    return () => geo.clearWatch(watcher);
  }, []);

  useEffect(() => {
    if (!stationList || stationList.length === 0) return;
    if (error) {
      console.error("Error obtaining position");
    } else if (position) {
      const stationDistances = getDistanceToStations(
        position,
        props.stationList
      )
        .slice(0, 5)
        .filter((s) => s.distance < 100000);
      setProximityStations(stationDistances);
    }
  }, [position, stationList]);

  const getDistanceToStations = (position: Position, stations: Station[]) => {
    const R = 6371e3; // metres
    return stations
      .map((s) => {
        const φ1 = (position.latitude * Math.PI) / 180; // φ, λ in radians
        const φ2 = (s.StationLongitude * Math.PI) / 180;
        const Δφ = ((s.StationLatitude - position.latitude) * Math.PI) / 180;
        const Δλ = ((s.StationLongitude - position.longitude) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return { distance: R * c, station: s }; // in metres
      })
      .sort((a, b) => a.distance - b.distance);
  };

  return proximityStations && proximityStations.length !== 0 ? (
    <CollapsibleItemList
      headerTitle="Nearby Stations"
      initialOpenState={initialOpenState}
      items={proximityStations.map((p) => ({
        label: smallify(p.station.StationDesc),
        sublabel: `${(p.distance / 1000).toFixed(1)}km`,
        key: p.station.StationDesc,
      }))}
      noItemsPrompt=""
      onItemSelect={onStationChange}
      forceState={!isPortable || !station}
      itemIcon={<Globe size={16} />}
    />
  ) : null;
};
