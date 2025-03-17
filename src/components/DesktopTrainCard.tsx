import React from "react";
import { DesktopTrainRow, scheduleColumns } from "./ScheduleTable";
import { useState } from "react";
import styled from "styled-components";
import { IJourney, ITrain } from "../api/IrishRailApi";
import Collapsible from "react-collapsible";
import { JourneyMap } from "./JourneyMap";
import moment from "moment";
import { Button, JourneyButton } from "./MobileTrainCard";
import { ItemButton } from "./CollapsibleItemList";

moment.locale("en-ie");

const Row = styled.div`
  padding-top: 15px;
  transition: opacity 0.08s ease-out;
  border-bottom: 2px solid ${(p) => p.theme.veryFaint};
  padding-bottom: 15px;
  transition: all 0.25s ease-in-out;
`;

const Info = styled.div`
  grid-area: info;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  transition: height 0.1s ease-out;
`;

export const DesktopTrainCard = (props: {
  train: ITrain;
  getJourney: (journeyCode: string) => Promise<IJourney>;
}) => {
  const { train, getJourney } = props;
  const [open, setOpen] = useState(false);

  return (
    <Row key={train.Traincode}>
      <Collapsible
        transitionTime={180}
        easing={"ease-out"}
        trigger={
          <DesktopTrainRow
            key={train.Traincode}
            onClick={() => setOpen(!open)}
            data-traincode={train.Traincode}
          >
            <div>
              <Button>📌</Button>
            </div>
            {scheduleColumns.map((c) => (
              <div key={c.propName}>
                {moment.isMoment(train[c.propName])
                  ? (train[c.propName] as moment.Moment).format("HH:mm")
                  : train[c.propName]}
              </div>
            ))}
          </DesktopTrainRow>
        }
      >
        <Info key={train.Traincode + "info"}>
          <JourneyMap getJourney={getJourney} train={train} open={open} />
        </Info>
      </Collapsible>
    </Row>
  );
};
