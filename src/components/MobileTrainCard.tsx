import * as React from "react";
import { useEffect, useRef, MutableRefObject } from "react";
import { ArrowRight, Map } from "react-feather";
import styled from "styled-components";
import { Journey, Train } from "../api/IrishRailApi";
import ScrollContainer from "react-indiana-drag-scroll";
import { JourneyStop } from "./JourneyStop";
import { JourneyInfo } from "./JourneyInfo";

const black = "#222";
const lightBlack = "#444";
const darkGrey = "#666";
const subtleGrey = "#AAA";
const mediumGrey = "#888";
const lightGrey = "#CCC";
const veryLightGrey = "#F4F4F4";
const nearlyWhite = "#FAFAFA";

const TrainCard = styled.div`
  display: grid;
  grid-template-areas:
    "header"
    "divider"
    "footer";
  width: 100%;
  height: 160px;
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: ${veryLightGrey};
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
`;

const Divider = styled.div`
  grid-area: divider;
  height: 2px;
  background-color: ${lightGrey};
  width: 100%;
  align-self: center;
`;

const Footer = styled.div`
  grid-area: footer;
  display: grid;
  grid-template-areas: "times button";
  grid-template-columns: "50% 50%";
  width: 100%;
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

const JourneyButton = styled.button`
  grid-area: button;
  height: 40px;
  background-color: ${nearlyWhite};
  outline: none;
  border: 2px solid ${mediumGrey};
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  color: ${black};
  padding: 10px;
  justify-content: space-between;
  justify-self: center;
  align-items: center;
  align-self: center;
  cursor: pointer;

  display: flex;
  flex-direction: row;
  & :first-child {
    margin-right: 10px;
  }

  @media only screen and (max-width: 380px) {
    font-size: 14px;
  }
`;

export const MobileTrainCard = (props: { train: Train }) => {
  const {
    Destination,
    Destinationtime,
    Origin,
    Origintime,
    Exparrival,
    Expdepart,
  } = props.train;
  return (
    <TrainCard>
      <Header>
        <Station area="origin">
          <StationName weight={600} color={black}>
            {Origin}
          </StationName>
          <StationTime weight={700} color={mediumGrey}>
            {Origintime}
          </StationTime>
        </Station>
        <Arrow>
          <ArrowRight stroke={black} size={24} />
        </Arrow>
        <Station area="destination">
          <StationName weight={600} color={black}>
            {Destination}
          </StationName>
          <StationTime weight={700} color={mediumGrey}>
            {Destinationtime}
          </StationTime>
        </Station>
      </Header>
      <Divider />
      <Footer>
        <Times>
          {Exparrival ? (
            <TimeEntry>
              <StationTime weight={700} color={lightBlack}>
                {Exparrival}
              </StationTime>
              <StationName weight={400} color={black}>
                Arriving
              </StationName>
            </TimeEntry>
          ) : null}
          {Expdepart ? (
            <TimeEntry>
              <StationTime weight={700} color={lightBlack}>
                {Expdepart}
              </StationTime>
              <StationName weight={400} color={black}>
                Departing
              </StationName>
            </TimeEntry>
          ) : null}
        </Times>
        <JourneyButton>
          <Map stroke={lightBlack} size={24} />
          <div>Live Journey</div>
        </JourneyButton>
      </Footer>
    </TrainCard>
  );
};
