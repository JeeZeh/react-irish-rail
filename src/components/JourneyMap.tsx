import * as React from "react";
import { useEffect, useRef, MutableRefObject } from "react";
import styled from "styled-components";
import { Journey, Train } from "../api/IrishRailApi";
import ScrollContainer from "react-indiana-drag-scroll";
import { JourneyStop } from "./JourneyStop";
import { JourneyInfo } from "./JourneyInfo";

const Wrapper = styled.div`
  margin: 10px;
  display: grid;
  grid-template-areas: "map info";
  grid-template-columns: 3fr 1fr;
  position: relative;
  align-content: center;

  & div.scroll-container {
    height: auto;
    display: flex;
    justify-content: center;
  }
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
      rgba(251, 251, 251, 00),
      rgba(251, 251, 251, 1) 100%
    );
  }
  &.right {
    right: 0px;
    background-image: linear-gradient(
      to right,
      rgba(251, 251, 251, 00),
      rgba(251, 251, 251, 1) 100%
    );
  }
`;

const Map = styled.div`
  grid-area: map;
  display: flex;
  flex-direction: row;
  cursor: grab;
  padding: 0 0 0 100px;
  width: 100%;
`;

const InfoWrapper = styled.div`
  grid-area: info;
  margin: 20px 10px 10px 30px;
`;

export const JourneyMap = (props: { journey: Journey; train: Train }) => {
  const { journey, train } = props;
  const scroller: MutableRefObject<ScrollContainer> = useRef();
  const trainPosition = journey.stops.findIndex((s) => !s.Departure);

  // Move to the train's point in the map
  useEffect(() => {
    const scrollDiv = scroller.current
      .getElement()
      .children.item(0) as HTMLElement;
    const trainDiv = scrollDiv.children.item(trainPosition) as HTMLElement;
    const scrollTo =
      trainDiv.offsetLeft - trainDiv.parentElement.offsetLeft - 100;
    scroller.current.getElement().scrollTo(scrollTo, 0);
  });

  return (
    <Wrapper>
      <InfoWrapper>
        <JourneyInfo journey={props.journey} train={train} />
      </InfoWrapper>
      <Fade className="left" />
      <ScrollContainer
        ref={scroller}
        vertical={false}
        className="scroll-container"
      >
        <Map>
          {journey.stops.map((s, i) => (
            <JourneyStop
              station={s}
              stopNumber={i}
              trainPosition={trainPosition}
              journeyLength={journey.stops.length}
              key={i}
            />
          ))}
        </Map>
      </ScrollContainer>
      <Fade className="right" />
    </Wrapper>
  );
};
