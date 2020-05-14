import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { Time, StationDiv, Name, Dot } from "./JourneyStop";
import { Card, CardHeader } from "./Schedule";
import { PlusCircle, MinusCircle } from "react-feather";
import Collapsible from "react-collapsible";

const Title = styled.h5`
  font-weight: 700;
`;

const KeyCard = styled(Card)`
  width: 300px;
`;

const KeyCardHeader = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
`;

const Key = styled.div`
  grid-area: key;
  display: flex;
  flex-direction: column;
  width: 100%;
  cursor: default;
  user-select: none;
  transition: opacity 0.1s ease-out;
  writing-mode: horizontal-tb;

  hr {
    width: 100%;
    margin: 15px 0;
  }

  & p {
    margin: 10px 0;
    margin-top: 0;
  }

  ${Title} {
    padding-top: 5px;
  }

  ${Dot} {
    writing-mode: horizontal-tb;
  }

  ${StationDiv} {
    padding: 0;
    width: 100%;
    transform: none;
    flex-direction: row;
  }

  ${Name} {
    writing-mode: horizontal-tb;
    margin: 0 0 0 5px;
  }

  ${Time} {
    writing-mode: horizontal-tb;
    &::before {
      margin: 0 5px;
    }
  }
`;

const renderKey = () => {
  return (
    <Key>
      <StationDiv className="departed">
        <Dot className="departed" />
        <Name className="departed">Departed</Name>
        <Time className="departed show-time">Departed Time</Time>
      </StationDiv>
      <StationDiv className="arrived">
        <Dot className="arrived" />
        <Name className="arrived">Arrived</Name>
        <Time className="arrived show-time">Departing Time</Time>
      </StationDiv>
      <StationDiv className="appraoching">
        <Dot className="appraoching" />
        <Name className="appraoching">Appraoching</Name>
        <Time className="appraoching show-time">Arriving Time</Time>
      </StationDiv>
      <StationDiv className="future">
        <Dot className="future" />
        <Name className="future">Future Stop</Name>
        <Time className="future show-time">Arriving Time</Time>
      </StationDiv>
      <hr />
      <p>
        If a train defers from schedule, the new arrival time along with the
        original schedule are shown:
      </p>

      <StationDiv>
        <Dot className="delayed show-time">!</Dot>
        <Name className="approaching">Delayed</Name>
        <Time className="approaching delayed show-time">
          Expected (scheduled)
        </Time>
      </StationDiv>
      <StationDiv>
        <Dot className="early show-time">!</Dot>
        <Name className="approaching">Early</Name>
        <Time className="approaching early show-time">
          Expected (scheduled)
        </Time>
      </StationDiv>
    </Key>
  );
};

export const JourneyKey = (props: { isPortable: boolean }) => {
  const { isPortable } = props;
  const [open, setOpen] = useState(false);

  // Render the key collapsible if on a small screen
  if (isPortable) {
    return (
      <KeyCard>
        <Collapsible
          transitionTime={250}
          easing={"ease-out"}
          trigger={
            <KeyCardHeader>
              <Title>Map Key</Title> {open ? <MinusCircle /> : <PlusCircle />}
            </KeyCardHeader>
          }
          children={renderKey()}
          onOpening={() => setOpen(true)}
          onClosing={() => setOpen(false)}
        />
      </KeyCard>
    );
  }

  return (
    <div>
      <Title>Map Key</Title>
      {renderKey()}
    </div>
  );
};
