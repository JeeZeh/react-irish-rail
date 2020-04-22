import * as React from "react";
import { useEffect, useRef, MutableRefObject } from "react";
import styled from "styled-components";
import { Journey } from "../api/IrishRailApi";
import ScrollContainer from "react-indiana-drag-scroll";
import { Time, StationDiv, Name, JourneyStop } from "./JourneyStop";

const Wrapper = styled.div`
  margin: 10px;
  display: grid;
  grid-template-areas: "key map";
  grid-template-columns: 1fr 3fr;
  position: relative;
`;

const Fade = styled.div`
  position: absolute;
  grid-area: map;
  display: block;
  width: 50px;
  height: 100%;

  z-index: 1;

  &.left {
    background-image: linear-gradient(
    to left,
    rgba(251, 251, 251,00),
    rgba(251, 251, 251,1) 100%
  );
  }
  &.right {
    right:0px;
    background-image: linear-gradient(
    to right,
    rgba(251, 251, 251,00),
    rgba(251, 251, 251, 1) 100%
  );
  }
`;

const Map = styled.div`
  grid-area: map;
  display: flex;
  flex-direction: row;
  cursor: grab;
  padding: 0 100px;
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
  cursor: default;
  user-select: none;
  opacity: 0.7;
  transition: opacity 0.1s ease-out;

  &:hover {
    opacity: 1;
  }

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

export const JourneyMap = (props: { journey: Journey }) => {
  const { stops } = props.journey;
  const scroller: MutableRefObject<ScrollContainer> = useRef();
  const trainPosition = stops.findIndex((s) => !s.Departure);

  // Move to the train's point in the map
  useEffect(() => {
    const scrollDiv = scroller.current
      .getElement()
      .children.item(0) as HTMLElement;

    const trainDiv = scrollDiv.children.item(trainPosition) as HTMLElement;
    const scrollTo =
      trainDiv.offsetLeft - trainDiv.parentElement.offsetLeft - 100;
    console.log(
      trainDiv.offsetLeft - trainDiv.parentElement.offsetLeft,
      scrollDiv.scrollWidth
    );
    scroller.current.getElement().scrollTo(scrollTo, 0);
  });

  const renderKey = () => {
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

  return (
    <Wrapper>
      {renderKey()}
      <Fade className="left"/>
      <ScrollContainer ref={scroller}>
        <Map>
          {stops.map((s, i) => (
            <JourneyStop
              station={s}
              stopNumber={i}
              trainPosition={trainPosition}
              journeyLength={stops.length}
              key={i}
            />
          ))}
        </Map>
      </ScrollContainer>
      <Fade className="right"/>
    </Wrapper>
  );
};
