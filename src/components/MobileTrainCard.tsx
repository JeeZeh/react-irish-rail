import * as React from "react";
import { useState, useRef, useContext } from "react";
import { ArrowRight, Map, X, ChevronUp } from "react-feather";
import styled, { ThemeContext } from "styled-components";
import { Journey, Train } from "../api/IrishRailApi";
import Collapsible from "react-collapsible";
import { JourneyMap } from "./JourneyMap";

const TrainCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: ${(p) => p.theme.nearlyBg};
  font-family: "Nunito", sans-serif;
  font-size: 18px;

  @media only screen and (max-width: 380px) {
    font-size: 16px;
    padding: 10px;
  }
`;

const Header = styled.div`
  grid-area: header;
  display: grid;
  grid-template-areas: "origin arrow destination";
  justify-content: flex-start;
  padding-top: 5px;
  width: 100%;
  margin-bottom: 10px;
`;

export const Divider = styled.div<{ margin?: string }>`
  grid-area: divider;
  height: 2px;
  background-color: ${(p) => p.theme.faint};
  width: 100%;
  align-self: center;
  opacity: 0;
  margin: ${(p) => p.margin ?? 0};
  transition: opacity 0.2s ease-in;

  &.fade {
    opacity: 1;
  }
`;

const Footer = styled.div`
  grid-area: footer;
  display: grid;
  grid-template-areas: "times button";
  grid-template-columns: "50% 50%";
  width: 100%;
  margin-top: 10px;
`;

const Arrow = styled.div`
  grid-area: arrow;
  align-self: flex-start;
  margin: 0 5px;
  transform: scaleY(0.8);
`;

const Station = styled.div<{ area: string }>`
  grid-area: ${(p) => p.area};
  display: flex;
  flex-direction: column;
`;

const StationName = styled.div<{ color: string; weight: number }>`
  font-weight: ${(p) => p.weight};
  color: ${(p) => p.color};
`;

const StationTime = styled.div<{ color: string; weight: number }>`
  font-weight: ${(p) => p.weight};
  color: ${(p) => p.color};
`;

const Times = styled.div`
  grid-area: times;
  display: flex;
  flex-direction: column;
  justify-content: center;
  & > div:first-child {
    margin-bottom: 4px;
  }

  @media only screen and (max-width: 380px) {
    & > div:first-child {
      margin-bottom: 2px;
    }
  }
`;

const TimeEntry = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  & > div:first-child {
    margin-right: 10px;
  }
  @media only screen and (max-width: 380px) {
    & > div:first-child {
      margin-right: 5px;
    }
  }
`;

export const JourneyButton = styled.button`
  grid-area: button;
  background-color: ${(p) => p.theme.bg};
  outline: none;
  border: 1px solid ${(p) => p.theme.button};
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
  color: ${(p) => p.theme.primaryText};
  padding: 6px 10px;
  justify-content: space-between;
  justify-self: flex-end;
  margin-right: 5px;
  align-items: center;
  align-self: center;
  cursor: pointer;
  box-shadow: 0 2px 0 ${(p) => p.theme.button};

  display: flex;
  flex-direction: row;

  & svg {
    stroke: ${(p) => p.theme.secondaryText};
    margin-right: 10px;
  }

  @media only screen and (max-width: 380px) {
    font-size: 1em;
  }

  @media only screen and (max-width: 320px) {
    font-size: 0.85em;
  }
`;

const renderHeader = (train: Train) => {
  const themeContext = useContext(ThemeContext);

  const { Destination, Destinationtime, Origin, Origintime } = train;
  return (
    <Header>
      <Station area="origin">
        <StationName weight={600} color={themeContext.primaryText}>
          {Origin}
        </StationName>
        <StationTime weight={700} color={themeContext.lightEmphasis}>
          {Origintime.format("HH:mm")}
        </StationTime>
      </Station>
      <Arrow>
        <ArrowRight stroke={themeContext.primaryText} size={24} />
      </Arrow>
      <Station area="destination">
        <StationName weight={600} color={themeContext.primaryText}>
          {Destination}
        </StationName>
        <StationTime weight={700} color={themeContext.lightEmphasis}>
          {Destinationtime.format("HH:mm")}
        </StationTime>
      </Station>
    </Header>
  );
};

const renderFooter = (train: Train, onClick, open: boolean) => {
  const { Exparrival, Expdepart } = train;
  const themeContext = useContext(ThemeContext);

  return (
    <Footer>
      <Times>
        {Exparrival ? (
          <TimeEntry>
            <StationName weight={600} color={themeContext.secondaryText}>
              Arriving
            </StationName>
            <StationTime weight={700} color={themeContext.primaryText}>
              {Exparrival.format("HH:mm")}
            </StationTime>
          </TimeEntry>
        ) : null}
        {Expdepart ? (
          <TimeEntry>
            <StationName weight={600} color={themeContext.secondaryText}>
              Departing
            </StationName>
            <StationTime weight={700} color={themeContext.primaryText}>
              {Expdepart.format("HH:mm")}
            </StationTime>
          </TimeEntry>
        ) : null}
      </Times>
      <JourneyButton onClick={onClick} name="Open train journey map">
        {!open ? (
          <Map stroke={themeContext.secondaryText} size={24} />
        ) : (
          <ChevronUp stroke={themeContext.secondaryText} size={24} />
        )}
        <div>{!open ? "Show" : "Hide"} Journey</div>
      </JourneyButton>
    </Footer>
  );
};

interface MobileTrainCardProps {
  train: Train;
  getJourney: (journeyCode: string) => Promise<Journey>;
}

export const MobileTrainCard = (props: MobileTrainCardProps) => {
  const { train, getJourney } = props;
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLHRElement>();
  const themeContext = useContext(ThemeContext);

  const handleMapButtonClick = () => {
    const top = bottomRef.current.getBoundingClientRect().top;
    setTimeout(() => {
      if (!open) {
        // if (top + 450 > window.innerHeight) {
        //   window.scrollBy({
        //     behavior: "smooth",
        //     top: top + 450 - window.innerHeight,
        //   });
        if (top < 350) {
          window.scrollBy({
            behavior: "smooth",
            top: -(350 - top),
          });
        }
      }
    }, 220);

    setOpen(!open);
  };

  return (
    <TrainCard>
      {renderHeader(train)}

      <Collapsible
        trigger={<Divider className={open ? "fade" : null} />}
        open={open}
        transitionTime={220}
        easing={"ease-in-out"}
      >
        <JourneyMap
          train={train}
          getJourney={getJourney}
          backgroundColor={themeContext.veryFaint}
          open={open}
        />
      </Collapsible>
      <Divider className={open ? "fade" : null} ref={bottomRef} />
      {renderFooter(train, handleMapButtonClick, open)}
    </TrainCard>
  );
};
