import * as React from "react";
import styled from "styled-components";
import { Journey, Movement } from "../api/IrishRailApi";
import ScrollContainer from "react-indiana-drag-scroll";

interface JourneyMapProps {
  journey: Journey;
}

const Wrapper = styled.div`
  padding: 10px;
  display: grid;
  grid-template-areas: "key map";
  grid-template-columns: 1fr 3fr;
`;

const Map = styled.div`
  grid-area: map;
  display: flex;
  flex-direction: row;
  justify-content: center;
  cursor: grab;
`;

const Dot = styled.div`
  grid-area: dot;
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

const Name = styled.div`
  grid-area: name;
  font-weight: 600;
  user-select: none;
  writing-mode: vertical-lr;
  margin-top: 5px;

  &.arrived {
    font-weight: 700;
  }
`;

const Time = styled.div`
  font-weight: 900;
  writing-mode: vertical-lr;
  margin-top: 5px;
  transition: opacity 0.1s ease-out;
  opacity: 0;

  &.show-time {
    opacity: 1;
  }
`;

const Station = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 5px;
  transform: rotate(195deg);

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
  cursor: auto;
  user-select: none;

  ${Header} {
    padding-top: 5px;
  }

  ${Station} {
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

interface StationState {
  state: string;
  time: string;
}

export const JourneyMap = (props: JourneyMapProps) => {
  const { stops } = props.journey;

  // NEED TO TIDY THIS UP!
  const getStationState = (station: Movement, index: number): StationState => {
    if (station.Departure && stops[index + 1] && !stops[index + 1].Departure) {
      return { state: "departed show-time", time: station.ExpectedArrival };
    }

    if (station.Departure) {
      return { state: "departed", time: station.Departure };
    }

    if (station.Arrival) {
      return { state: "arrived show-time", time: station.ExpectedDeparture };
    }

    if (stops[index - 1] && stops[index - 1].Departure) {
      return { state: "approaching show-time", time: station.ExpectedArrival };
    }

    if (stops[index - 2] && stops[index - 2].Departure) {
      return { state: "future  show-time", time: station.ExpectedArrival };
    }

    return {
      state: `future ${
        index == 0 || index == stops.length - 1 ? "show-time" : ""
      }`,
      time: index == 0 ? station.ExpectedDeparture : station.ExpectedArrival,
    };
  };

  const renderKey = () => {
    return (
      <Key>
        <Header>Map Key</Header>
        <Station className="departed">
          <Dot className="departed" />
          <Name className="departed">Departed</Name>
          <Time className="show-time">· Departed Time</Time>
        </Station>
        <Station className="arrived">
          <Dot className="arrived" />
          <Name className="arrived">Arrived</Name>
          <Time className="show-time">· Departing Time</Time>
        </Station>
        <Station className="approaching">
          <Dot className="approaching" />
          <Name className="approaching">Approaching</Name>
          <Time className="show-time">· Arrival Time</Time>
        </Station>
        <Station className="future">
          <Dot className="future" />
          <Name className="future">Future Station</Name>
          <Time className="show-time">· Arrival Time</Time>
        </Station>
        <p>Hover over a station to show relevant time, try it below!</p>
        <Station className="future">
          <Dot className="future" />
          <Name className="future">Station Name</Name>
          <Time>· Hidden Time</Time>
        </Station>
      </Key>
    );
  };

  return (
    <Wrapper>
      {renderKey()}
      <ScrollContainer>
        
        <Map>
          {stops.map((s, i) => (
            <Station className={getStationState(s, i).state} key={i}>
              <Dot className={getStationState(s, i).state} />
              <Name className={getStationState(s, i).state}>
                {s.LocationFullName}
              </Name>
              <Time className={getStationState(s, i).state}>
                · {getStationState(s, i).time}
              </Time>
            </Station>
          ))}
        </Map>
      </ScrollContainer>
    </Wrapper>
  );
};
