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
  width: 100%;

  & div.scroll-container {
    height: auto;
    display: flex;
    justify-content: center;
    overflow: scroll;
  }
  & div.scroll-container::-webkit-scrollbar {
    width: 0px;
    background: transparent; /* make scrollbar transparent */
  }
`;

export const Fade = styled.div<{ side: string; size: string }>`
  position: absolute;
  grid-area: map;
  display: block;
  width: ${(p) => (p.side === "bottom" || p.side === "top" ? "100%" : p.size)};
  height: ${(p) => (p.side === "bottom" || p.side === "top" ? p.size : "100%")};
  z-index: 1;
  pointer-events: none;
  background-image: linear-gradient(
    to ${(p) => p.side},
    rgba(251, 251, 251, 00),
    rgba(251, 251, 251, 1) 100%
  );
  ${(p) => p.side}: 0px;
`;

const Map = styled.div`
  grid-area: map;
  display: flex;
  flex-direction: row;
  cursor: grab;
  padding: 0 0 0 140px;
  width: 100%;
`;

const InfoWrapper = styled.div`
  grid-area: info;
  margin: 20px 10px 10px 30px;
`;

export const JourneyMap = (props: { journey: Journey; train: Train }) => {
  const { journey, train } = props;
  const scroller: MutableRefObject<ScrollContainer> = useRef();
  const trainPosition = journey.stops.findIndex((s, i) => {
    return (
      (i < journey.stops.length - 1 &&
        s.Departure &&
        !journey.stops[i + 1].Arrival) ||
      (s.Arrival && !s.Departure)
    );
  });

  // Move to the train's point in the map
  useEffect(() => {
    const scrollDiv = scroller.current
      .getElement()
      .children.item(0) as HTMLElement;
    const trainDiv = scrollDiv.children.item(
      Math.max(trainPosition, 0)
    ) as HTMLElement;
    const scrollTo =
      trainDiv.offsetLeft - trainDiv.parentElement.offsetLeft - 120;
    scroller.current.getElement().scrollTo(scrollTo, 0);
  }, [scroller]);

  return (
    <Wrapper>
      <InfoWrapper>
        <JourneyInfo journey={props.journey} train={train} />
      </InfoWrapper>
      <Fade side="left" size="50px" />
      <ScrollContainer
        ref={scroller}
        vertical={false}
        className="scroll-container"
        hideScrollbars={false}
      >
        <Map>
          {journey.stops.map((s, i) => (
            <JourneyStop
              station={s}
              stopNumber={i}
              trainPosition={trainPosition}
              journeyLength={journey.stops.length}
              train={train}
              key={i}
            />
          ))}
        </Map>
      </ScrollContainer>
      <Fade side="right" size="50px" />
    </Wrapper>
  );
};
