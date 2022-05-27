import * as React from "react";
import styled from "styled-components";
import { IJourney, ITrain } from "../api/IrishRailApi";
import { Card } from "./Schedule";

const Header = styled.h5`
  font-weight: 700;
  margin: 10px 0 20px 0;
  font-size: 1.2em;
`;

const Info = styled((props) => <Card {...props} />)`
  grid-area: key;
  display: flex;
  flex-direction: column;
  user-select: none;
  padding: 10px;
  box-shadow: none !important;
  background-color: ${(p) => p.theme.nearlyBg} !important;
`;

const Entry = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  width: 100%;
  margin-bottom: 10px;
`;

const Title = styled.div`
  font-weight: 700;
`;

const Value = styled.div`
  font-weight: 400;
`;

export const JourneyInfo = (props: { journey: IJourney; train: ITrain }) => {
  const { journey, train } = props;

  if (!journey) return null;
  return (
    <Info>
      <Header>Journey Information</Header>
      <Entry>
        <Title>Origin · {train.Origintime.format("HH:mm")}</Title>
        <Value>{train.Origin}</Value>
      </Entry>
      <Entry>
        <Title>Destination · {train.Destinationtime.format("HH:mm")}</Title>
        <Value>{train.Destination}</Value>
      </Entry>
      <Entry>
        <Title>Number of Stops</Title>
        <Value>
          {journey.stops.filter((s) => s.LocationType === "S").length}
        </Value>
      </Entry>
      <Entry>
        <Title>Direction</Title>
        <Value>{train.Direction}</Value>
      </Entry>
    </Info>
  );
};
