import * as React from "react";
import styled from "styled-components";
import { Journey, Train } from "../api/IrishRailApi";

const Header = styled.h5`
  font-weight: 700;
`;

const Info = styled.div`
  grid-area: key;
  display: flex;
  flex-direction: column;
  cursor: default;
  user-select: none;
  padding: 20px;
  border: 1px solid #bbb;
  border-radius: 10px;
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
  font-weight: 500;
`;

export const JourneyInfo = (props: { journey: Journey; train: Train }) => {
  const { journey, train } = props;
  return (
    <Info>
      <Header>Journey Information</Header>
      <Entry>
        <Title>Origin · {train.Origintime}</Title>
        <Value>{train.Origin}</Value>
      </Entry>
      <Entry>
        <Title>Destination · {train.Destinationtime}</Title>
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
