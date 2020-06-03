import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Journey, Train } from "../api/IrishRailApi";
import { JourneyStop } from "./JourneyStop";
import { JourneyInfo } from "./JourneyInfo";
import { LoadingSpinner } from "./LoadingSpinner";
import { testJourney } from "../api/JourneyLoader";
import { useWindowSize } from "../hooks/useWindowSize";

const Wrapper = styled.div<{ isPortable?: boolean; margin?: string }>`
  margin: ${(p) => (!p.isPortable ? "10px" : 0)};
  display: ${(p) => (p.isPortable ? "flex" : "grid")};
  grid-template-areas: "map info";
  grid-template-columns: 890px auto;
  position: relative;
  align-content: center;
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

const Map = styled.div<{ isPortable?: boolean }>`
  grid-area: map;
  display: flex;
  flex-direction: ${(p) => (p.isPortable ? "column" : "row")};
  cursor: grab;
  padding-left: ${(p) => (!p.isPortable ? "140px" : 0)};
  width: 100%;
  height: ${(p) => (!p.isPortable ? "300px" : "auto")};
  ${(p) => (p.isPortable ? "overflow-y: scroll" : "overflow-x: scroll")};

  & > div {
    margin: ${(p) => (p.isPortable ? "5px" : "0")};
  }

  opacity: 0;
  transition: opacity 0.1s ease-out;

  &.visible {
    opacity: 1;
  }
`;

const StationList = styled.div`
  display: flex;
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
}

const Stop = styled.div<{ isPortable?: boolean }>`
  display: flex;
  padding: 10px;
  align-items: center;
`;

export const JourneyMap = (props: JoruneyMapProps) => {
  const { train, backgroundColor, getJourney, journeyProp } = props;
  const isPortable = useWindowSize().width < 900;
  const scrollerMargin = isPortable ? 0 : 30;
  const itemSize = 30;
  const [journey, setJourney] = useState<Journey>(journeyProp);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (journey) setFade(true);
  }, [journey]);

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

  useEffect(() => {
    if (!journeyProp) {
      getJourney(train.Traincode)
        .then((j) => {
          setTrainPosition(calcTrainPosition(j));
          return j;
        })
        .then((j) => setTimeout(() => setJourney(j), 2000));
    }
  }, []);

  const renderStop = (stop, index) => {
    return (
      <Stop key={index} data-index={index}>
        <JourneyStop
          station={stop}
          stopNumber={index}
          trainPosition={trainPosition}
          journeyLength={journey.stops.length}
          train={train}
          key={index}
        />
        {stop}
      </Stop>
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
    <Wrapper isPortable={isPortable} margin={`${scrollerMargin}px 0`}>
      {journey ? (
        <>
          {" "}
          {renderInfo()}
          <Fade
            side={isPortable ? "top" : "left"}
            size={`${itemSize / 3}px`}
            backgroundColor={backgroundColor}
            offset={`${scrollerMargin}px`}
          />
          <Map isPortable={isPortable} className={fade ? "visible" : null}>
            {journey.stops.map((s, i) => renderStop(s, i))}
          </Map>
          <Fade
            side={isPortable ? "bottom" : "right"}
            size={`${itemSize / 3}px`}
            backgroundColor={backgroundColor}
            offset={`${scrollerMargin}px`}
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
