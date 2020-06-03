import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import IrishRailApi, { Journey, Train } from "../api/IrishRailApi";
import { JourneyStop } from "./JourneyStop";
import { JourneyInfo } from "./JourneyInfo";
import { FixedSizeList as List } from "react-window";
import { LoadingSpinner } from "./LoadingSpinner";
import moment = require("moment");
import { testJourney } from "../api/JourneyLoader";

const Wrapper = styled.div<{ isPortable?: boolean; margin?: string }>`
  margin: ${(p) => (!p.isPortable ? "10px" : 0)};
  display: ${(p) => (p.isPortable ? "flex" : "grid")};
  grid-template-areas: "map info";
  grid-template-columns: 3fr 1fr;
  position: relative;
  align-content: center;
  width: 100%;

  & .scroller::-webkit-scrollbar {
    width: 0px;
    background: transparent; /* make scrollbar transparent */
  }

  & .scroller {
    margin: ${(p) => (p.margin ? p.margin : 0)};
  }
`;

export const Fade = styled.div<{
  side: string;
  size: string;
  backgroundColor?: string;
  offset?: string;
}>`
  position: absolute;
  grid-area: map;
  display: block;
  width: ${(p) => (p.side === "bottom" || p.side === "top" ? "100%" : p.size)};
  height: ${(p) => (p.side === "bottom" || p.side === "top" ? p.size : "100%")};
  z-index: 1;
  pointer-events: none;
  background-image: linear-gradient(
    to ${(p) => p.side},
    ${(p) => (p.backgroundColor ? p.backgroundColor : "#fefefe")}00,
    ${(p) => (p.backgroundColor ? p.backgroundColor : "#fefefe")}ff
  );
  ${(p) => p.side}: ${(p) => (p.offset ? p.offset : "0px")};
`;

const Map = styled.div<{ isPortable?: boolean }>`
  grid-area: map;
  display: flex;
  flex-direction: ${(p) => (p.isPortable ? "column" : "row")};
  cursor: grab;
  padding-left: ${(p) => (!p.isPortable ? "140px" : 0)};
  width: 100%;
  height: ${(p) => (!p.isPortable ? "300px" : "auto")};

  & > div {
    margin: ${(p) => (p.isPortable ? "5px" : "0")};
  }

  opacity: 0;
  transition: opacity 0.1s ease-out;

  &.visible {
    opacity: 1;
  }
`;

const InfoWrapper = styled.div`
  grid-area: info;
  margin: 20px 10px 10px 30px;
`;

interface JoruneyMapProps {
  train: Train;
  isPortable?: boolean;
  backgroundColor?: string;
}

const Stop = styled.div<{ isPortable?: boolean }>`
  display: flex;
  padding: 10px;
  align-items: center;
`;

export const JourneyMap = (props: JoruneyMapProps) => {
  const { train, isPortable, backgroundColor } = props;
  const scrollerMargin = isPortable ? 0 : 30;
  const itemSize = 30;
  const [journey, setJourney] = useState<Journey>(null);
  const [trainPosition, setTrainPosition] = useState<number>(-1);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    if (journey) setFade(true);
  }, [journey]);

  useEffect(() => {
    let date = moment().locale("en-gb").format("ll");
    IrishRailApi.getTrainJourney(train.Traincode, date)
      .then((j) => {
        setTrainPosition(
          testJourney().stops.findIndex((s, i) => {
            return (
              (i < j.stops.length - 1 &&
                s.Departure &&
                !j.stops[i + 1].Arrival) ||
              (s.Arrival && !s.Departure)
            );
          })
        );
        return j;
      })
      .then((j) => setTimeout(() => setJourney(testJourney), 2000));
  }, []);

  const StopItem = ({ index, style }) => {
    const stop = journey.stops[index];
    return (
      <Stop style={style} key={index} data-index={index}>
        <JourneyStop
          isPortable={isPortable}
          station={stop}
          stopNumber={index}
          trainPosition={trainPosition}
          journeyLength={journey.stops.length}
          train={train}
          key={index}
        />
      </Stop>
    );
  };

  return (
    <Wrapper isPortable={isPortable} margin={`${scrollerMargin}px 0`}>
      {isPortable ? null : (
        <InfoWrapper>
          <JourneyInfo journey={journey} train={train} />

          <LoadingSpinner
            color="#5e9cd6"
            size={14}
            height="100%"
            width="100%"
          />
        </InfoWrapper>
      )}
      <Fade
        side={isPortable ? "top" : "left"}
        size={`${itemSize / 3}px`}
        backgroundColor={backgroundColor}
        offset={`${scrollerMargin}px`}
      />

      {journey ? (
        <Map isPortable={isPortable} className={fade ? "visible" : null}>
          <List
            height={
              isPortable
                ? Math.min(itemSize * 9, journey.stops.length * itemSize)
                : "100%"
            }
            initialScrollOffset={
              trainPosition > 1 ? (trainPosition - 2) * itemSize : 0
            }
            width={!isPortable ? "100%" : null}
            itemCount={journey.stops.length}
            itemSize={itemSize}
            className="scroller"
          >
            {StopItem}
          </List>
        </Map>
      ) : (
        <LoadingSpinner color="#515773" size={16} height="270px" width="100%" />
      )}

      <Fade
        side={isPortable ? "bottom" : "right"}
        size={`${itemSize / 3}px`}
        backgroundColor={backgroundColor}
        offset={`${scrollerMargin}px`}
      />
    </Wrapper>
  );
};
