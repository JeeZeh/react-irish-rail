import * as React from "react";
import styled from "styled-components";
import { Time, StationDiv, Name, JourneyStop } from "./JourneyStop";

const Header = styled.h5`
  font-weight: 700;
`;

const Key = styled.div`
  grid-area: key;
  justify-self: center;
  align-self: center;
  display: flex;
  flex-direction: column;
  width: 250px;
  cursor: default;
  user-select: none;
  transition: opacity 0.1s ease-out;

  ${Header} {
    padding-top: 5px;
  }

  ${StationDiv} {
    padding: 0;
    transform: none;
    flex-direction: row;
  }

  ${Name} {
    writing-mode: horizontal-tb;
    margin: 0 0 0 5px;
  }

  ${Time} {
    writing-mode: horizontal-tb;
    margin: 0 0 0 5px;
  }
`;

export const JourneyKey = () => {
  return (
    <Key>
      <Header>Map Key</Header>
      <JourneyStop
        station={{ Departure: "Departed Time", LocationFullName: "Departed" }}
        stopNumber={0}
        trainPosition={2}
        journeyLength={4}
        forceShowTime={true}
      />
      <JourneyStop
        station={{
          Arrival: "foo",
          ExpectedDeparture: "Departing Time",
          LocationFullName: "Arrived",
        }}
        stopNumber={1}
        trainPosition={1}
        journeyLength={4}
        forceShowTime={true}
      />
      <JourneyStop
        station={{
          ExpectedArrival: "Arriving Time",
          LocationFullName: "Approaching",
        }}
        stopNumber={2}
        trainPosition={2}
        journeyLength={4}
        forceShowTime={true}
      />
      <JourneyStop
        station={{
          ExpectedArrival: "Arriving Time",
          LocationFullName: "Future Stop",
        }}
        stopNumber={3}
        trainPosition={1}
        journeyLength={4}
        forceShowTime={true}
      />
      <p>Hover over a station to show the relevant time, try it below!</p>
      <JourneyStop
        station={{
          ExpectedArrival: "Hidden Time",
          LocationFullName: "Station Name",
        }}
        stopNumber={3}
        trainPosition={1}
        journeyLength={5}
      />
    </Key>
  );
};
