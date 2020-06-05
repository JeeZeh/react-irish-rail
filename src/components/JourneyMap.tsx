import * as React from "react";
import { useEffect, useState, useRef } from "react";
import styled, { isStyledComponent } from "styled-components";
import { Journey, Train, Movement } from "../api/IrishRailApi";
import { JourneyStop } from "./JourneyStop";
import { JourneyInfo } from "./JourneyInfo";
import { LoadingSpinner } from "./LoadingSpinner";
import { testJourney } from "../api/JourneyLoader";
import { useWindowSize } from "../hooks/useWindowSize";

const Wrapper = styled.div<{
  isPortable?: boolean;
  margin?: string;
  loaded?: boolean;
}>`
  margin: ${(p) => (!p.isPortable ? "10px" : 0)};
  display: ${(p) => (p.isPortable ? "flex" : "grid")};
  grid-template-areas: "map info";
  position: relative;
  align-content: center;
  justify-content: ${(p) => (p.loaded ? "space-around" : "center")};
  width: 100%;
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

const Map = styled.div<{
  isPortable?: boolean;
  center?: boolean;
  width?: number;
}>`
  grid-area: map;
  display: flex;
  flex-direction: ${(p) => (p.isPortable ? "column" : "row")};
  align-items: center;
  justify-content: ${(p) => (p.center ? "center" : "null")};
  padding-left: ${(p) => (!p.isPortable ? "140px" : 0)};
  height: ${(p) => (p.isPortable ? "270px" : "300px")};
  width: ${(p) => (p.width ? p.width + "px" : "100%")};
  overflow-x: ${(p) => (p.isPortable ? "hidden" : "scroll")};
  overflow-y: ${(p) => (p.isPortable ? "scroll" : "hidden")};

  /* width */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: none;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    width: 5px;
    background-color: none;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: #8886;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
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
  backgroundColor?: string;
  getJourney?: (journeyCode: string) => Promise<Journey>;
  journeyProp?: Journey;
  load?: boolean;
}

export const JourneyMap = (props: JoruneyMapProps) => {
  const { train, backgroundColor, getJourney, journeyProp, load } = props;
  const width = useWindowSize().width;
  const isPortable = width < 900;
  const scrollerMargin = isPortable ? 0 : 30;
  const itemSize = 30;
  const [journey, setJourney] = useState<Journey>(null);
  const [fade, setFade] = useState(false);
  const scroller = useRef(null);

  const calcTrainPosition = (journey: Journey): number => {
    if (!journey) return -1;
    return journey.stops.findIndex((s, i) => {
      return (
        (i < journey.stops.length - 1 &&
          s.Departure &&
          !journey.stops[i + 1].Arrival) ||
        (s.Arrival && !s.Departure)
      );
    });
  };

  const [trainPosition, setTrainPosition] = useState<number>(
    calcTrainPosition(journeyProp)
  );

  const scrollToTrainPosition = () => {
    console.log(scroller.current);

    if (scroller.current) {
      const scrollDiv = scroller.current as HTMLElement;
      const trainDiv = scrollDiv.children.item(
        Math.max(trainPosition, 0)
      ) as HTMLElement;
      const scrollOffset =
        (isPortable ? trainDiv.offsetTop : trainDiv.offsetLeft) -
        (isPortable
          ? trainDiv.parentElement.offsetTop
          : trainDiv.parentElement.offsetLeft) -
        60;

      if (isPortable) scrollDiv.scrollTo(0, scrollOffset);
      else scrollDiv.scrollTo(scrollOffset, 0);
    }
  };

  useEffect(() => {
    scrollToTrainPosition();
    if (journey) setFade(true);
  }, [journey]);

  useEffect(() => {
    console.log(load);
    if (load) {
      setJourney(journeyProp);
      if (!journeyProp) {
        getJourney(train.Traincode)
          .then((j) => {
            setTrainPosition(calcTrainPosition(j));
            return j;
          })
          .then((j) => setTimeout(() => setJourney(j), 2000));
      }
    }
  }, [load]);

  const renderStop = (stop: Movement, index) => {
    return (
      <JourneyStop
        station={stop}
        stopNumber={index}
        trainPosition={trainPosition}
        journeyLength={journey.stops.length}
        train={train}
        key={index}
      />
    );
  };

  const renderInfo = () => {
    if (isPortable) return null;
    return (
      <InfoWrapper>
        <JourneyInfo journey={journey} train={train} />
      </InfoWrapper>
    );
  };

  return (
    <Wrapper
      isPortable={isPortable}
      margin={`${scrollerMargin}px 0`}
      loaded={!!journey}
    >
      {journey ? (
        <>
          {renderInfo()}
          <Fade
            side={isPortable ? "top" : "left"}
            size={`${itemSize / 3}px`}
            backgroundColor={backgroundColor}
            offset={isPortable ? `${scrollerMargin}px` : "0px"}
          />
          <Map
            isPortable={isPortable}
            center={journey.stops.length < 9 && isPortable}
            className={fade ? "visible" : null}
            ref={scroller}
            width={!isPortable ? Math.min(800, width - 500) : null}
          >
            {journey.stops.map(renderStop)}
          </Map>
          <Fade
            side={isPortable ? "bottom" : "right"}
            size={`${itemSize / 3}px`}
            backgroundColor={backgroundColor}
            offset={isPortable ? `${scrollerMargin}px` : "0px"}
          />
        </>
      ) : (
        <LoadingSpinner
          color="#515773"
          size={16}
          height="270px"
          width="100%"
          delay={300}
        />
      )}
    </Wrapper>
  );
};
