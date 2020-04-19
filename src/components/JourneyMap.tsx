import * as React from "react";
import styled from "styled-components";
import { Journey } from "../api/IrishRailApi";
import ScrollContainer from "react-indiana-drag-scroll";

interface JourneyMapProps {
  journey: Journey;
}

const Map = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 200px;
  transform: rotate(-90deg);
  cursor: grab;
`;

const Dot = styled.div`
  grid-area: dot;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  border: 2px solid #444;
  align-self: center;
  justify-self: center;

  &.current {
    background-color: #444;
    font-weight: 900;
  }
`;

const StationName = styled.div`
  grid-area: name;
  font-weight: 600;
  transform: translateY(35px) rotate(20deg);
  user-select: none; 

  &.current {
    font-weight: 700;
  }
`;

const Station = styled.div`
  display: grid;
  grid-template-areas: "dot name";
  grid-template-columns: 1fr 9fr;
  padding: 5px;

  &.passed {
    opacity: 0.3;
  }
`;

export const JourneyMap = (props: JourneyMapProps) => {
  const { stops } = props.journey;

  const a = [
    "Dublin Connolly",
    "Maynooth",
    "Portmarnock",
    "Malahide",
    "Enfield",
    "Portmarnock",
    "Malahide",
    "Maynooth",
    "Enfield",
    "Portmarnock",
    "Malahide",
    "Limerick Junction",
    "Malahide",
    "Enfield",
    "Portmarnock",
    "Malahide",
    "Maynooth",
    "Enfield",
    "Portmarnock",
    "Malahide",
    "Limerick Junction",
    "Malahide",
    "Enfield",
    "Portmarnock",
    "Malahide",
    "Maynooth",
    "Enfield",
    "Portmarnock",
    "Malahide",
    "Limerick Junction",
    "Portmarnock",
    "Malahide",
    "Enfield",
    "Portmarnock",
    "Malahide",
    "Maynooth",
    "Enfield",
    "Portmarnock",
    "Malahide",
    "Limerick Junction",
  ];

  const current = 4;

  return (
    <ScrollContainer>
      <Map>
        {a.map((s, i) => (
          <Station className={i < current ? "passed" : null} key={i}>
            <StationName className={i === current ? "current" : null}>
              {s}
            </StationName>
            <Dot className={i <= current ? "current" : null} />
          </Station>
        ))}
      </Map>
    </ScrollContainer>
  );
};
