import React from "react";
import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import moment from "moment";
import { IJourney, ITrain, IMovement } from "../api/IrishRailApi";
import { JourneyStop } from "./JourneyStop";
import { JourneyInfo } from "./JourneyInfo";
import { LoadingSpinner } from "./LoadingSpinner";
import { useWindowSize } from "../hooks/useWindowSize";

const Wrapper = styled.div<{
  isPortable?: boolean;
  margin?: string;
  loaded?: boolean;
}>`
  margin: ${(p) => (!p.isPortable ? "10px" : "0 0 0 5px")};
  display: ${(p) => (p.isPortable ? "flex" : "grid")};
  grid-template-areas: "map info";
  position: relative;
  align-content: center;
  justify-content: ${(p) => (p.loaded ? "space-between" : "center")};
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
  pointer-events: none;
  overflow: hidden;
  background-image: linear-gradient(
    to ${(p) => p.side},
    ${(p) => (p.backgroundColor ? p.backgroundColor : p.theme.offMax)}00,
    ${(p) => (p.backgroundColor ? p.backgroundColor : p.theme.offMax)}ff
  );
  ${(p) => p.side}: ${(p) => (p.offset ? p.offset : "0px")};
`;

const Map = styled.div<{
  isPortable?: boolean;
  center?: boolean;
  width?: number;
}>`
  grid-area: map;
  font-family: "Lato", Helvetica, sans-serif;
  display: flex;
  flex-direction: ${(p) => (p.isPortable ? "column" : "row")};
  align-items: center;
  justify-content: ${(p) => (p.center ? "center" : "null")};
  padding-left: ${(p) => (!p.isPortable ? "140px" : 0)};
  height: ${(p) => (p.isPortable ? "270px" : "300px")};
  width: ${(p) => (p.width ? p.width + "px" : p.isPortable ? "100%" : "auto")};
  overflow-x: ${(p) => (p.isPortable ? "hidden" : "scroll")};
  overflow-y: ${(p) => (p.isPortable ? "scroll" : "hidden")};
  overscroll-behavior-y: ${(p) => (p.isPortable ? "contain" : "auto")};
  scrollbar-color: ${(p) => `${p.theme.subtle}66`} #00000000;
  scrollbar-width: thin;

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: none;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    width: 5px;
    background-color: none;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: ${(p) => `${p.theme.subtle}66`};
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${(p) => p.theme.lightEmphasis};
  }

  opacity: 0;
  transition: opacity 0.3s ease-out;

  &.visible {
    opacity: 1;
  }
`;

const InfoWrapper = styled.div`
  grid-area: info;
  margin: 20px 10px 10px 30px;
`;

interface JoruneyMapProps {
  train: ITrain;
  backgroundColor?: string;
  getJourney?: (journeyCode: string) => Promise<IJourney>;
  journeyProp?: IJourney;
  open?: boolean;
}

export const calcTrainPosition = (stops: IMovement[]): number => {
  if (!stops) return -1;
  const now = moment.now();
  return stops.findIndex((s, i) => {
    return (
      (!s.Departure &&
        (stops[i + 1] ? !stops[i + 1].Arrival : true) &&
        (s.Arrival ? s.Arrival.diff(now, "minutes") < 10 : true)) ||
      (s.Departure && s.Departure.diff(now, "minutes") > 2) ||
      (s.ExpectedDeparture && s.ExpectedDeparture.diff(now, "minutes") > 10) ||
      (s.ScheduledDeparture && s.ScheduledDeparture.diff(now, "minutes") > 10)
    );
  });
};

export const calcTrainPositionV2 = (stops: IMovement[]): number => {
  if (!stops) return -1;
  return stops.findIndex(
    (s, i) => (s.StopType === "C" && !s.Departure) || s.StopType === "N"
  );
};

export const JourneyMap = (props: JoruneyMapProps) => {
  const { train, backgroundColor, getJourney, journeyProp, open } = props;
  const width = useWindowSize().width;
  const isPortable = width <= 1000;
  const scrollerMargin = isPortable ? 0 : 30;
  const itemSize = 30;
  const [journey, setJourney] = useState<IJourney>(null);
  const [fade, setFade] = useState(false);
  const scroller = useRef(null);

  const scrollToTrainPosition = () => {
    if (scroller.current) {
      const scrollDiv = scroller.current as HTMLElement;
      const trainDiv = scrollDiv.children.item(
        Math.max(journey.trainPosition, 0)
      ) as HTMLElement;
      const scrollOffset =
        (isPortable ? trainDiv.offsetTop : trainDiv.offsetLeft) -
        (isPortable
          ? trainDiv.parentElement.offsetTop
          : trainDiv.parentElement.offsetLeft) -
        60;

      if (isPortable) scrollDiv.scrollTo(0, scrollOffset);
      else scrollDiv.scrollTo(scrollOffset - 80, 0);
    }
  };

  useEffect(() => {
    scrollToTrainPosition();
    if (journey) setFade(true);
    return () => setFade(false);
  }, [journey]);

  useEffect(() => {
    if (open) {
      setJourney(journeyProp);
      if (!journeyProp) {
        getJourney(train.Traincode).then((j) => {
          setJourney(j);
        });
        // .then((j) => setTimeout(() => setJourney(j), 2000));
      }
    }
  }, [open]);

  const renderStops = (journey: IJourney) => {
    return journey.stops.map((stop, i) => (
      <JourneyStop
        movement={stop}
        stopNumber={i}
        trainPosition={journey.trainPosition}
        journeyLength={journey.stops.length}
        train={train}
        key={i}
      />
    ));
  };

  return (
    <Wrapper
      isPortable={isPortable}
      margin={`${scrollerMargin}px 0`}
      loaded={!!journey}
    >
      {journey ? (
        <>
          {!isPortable && (
            <InfoWrapper>
              <JourneyInfo journey={journey} train={train} />
            </InfoWrapper>
          )}
          <Map
            isPortable={isPortable}
            center={journey.stops.length < 10 && isPortable}
            className={fade ? "visible" : null}
            ref={scroller}
            width={!isPortable ? Math.min(800, width - 500) : null}
          >
            {renderStops(journey)}
          </Map>
          <Fade
            side={isPortable ? "top" : "left"}
            size={`${itemSize / 3}px`}
            offset={isPortable ? `${scrollerMargin}px` : "0px"}
            backgroundColor={backgroundColor}
          />
          <Fade
            side={isPortable ? "bottom" : "right"}
            size={`${itemSize / 3}px`}
            offset={isPortable ? `${scrollerMargin}px` : "0px"}
            backgroundColor={backgroundColor}
          />
        </>
      ) : (
        open && (
          <LoadingSpinner
            size={16}
            height={isPortable ? "270px" : "300px"}
            width="100%"
            delay={500}
          />
        )
      )}
    </Wrapper>
  );
};
