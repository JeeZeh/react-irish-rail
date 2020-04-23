import * as React from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Journey } from "../api/IrishRailApi";
import * as Moment from "moment";
import styled from "styled-components";
import { JourneyMap } from "./JourneyMap";
import Collapsible from "react-collapsible";

interface TrainColumn {
  dispName: string;
  propName: string;
}

export interface ScheduleTableProps {
  trainData: Train[];
}

const Table = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  padding: 5px;
  font-family: "Lato", sans-serif;
  transition: border 0.08s ease-out;
`;

const Row = styled.div`
  padding-top: 15px;
  transition: opacity 0.08s ease-out;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  transition: all 0.25s ease-in-out;
`;

const Train = styled.div`
  display: grid;
  grid-template-areas: "due dep from to term last";
  grid-template-columns: 1fr 1fr 2.5fr 2.5fr 1fr 2.5fr;

  &:not(.header):hover {
    opacity: 0.8;
  }
  &.header {
    color: #444;
    font-weight: 700;
  }
`;

const Body = styled.div`
  ${Train} {
    cursor: pointer;
  }

  & > div:last-child {
    border-bottom: none;
  }
`;



const Info = styled.div`
  grid-area: info;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  transition: height 0.1s ease-out;

  & > div {
    width: 100%;
  }
`;

const ScheduleTable = (props: ScheduleTableProps) => {
  const { trainData } = props;
  const [open, setOpen] = React.useState(new Set<string>());
  const [journeys, setJourneys] = React.useState(new Map<string, Journey>());

  const handleTrainClick = (e) => {
    const trainCode = e.currentTarget.getAttribute("data-traincode");
    const t = trainData.find(t => t.Traincode == trainCode);   
    let date = Moment().locale("en-gb").format("ll");
    let newOpen: Set<string>;
    const modif = e.ctrlKey || e.altKey;

    if (open.has(trainCode)) {
      open.delete(trainCode);
      newOpen = new Set<string>(modif ? open : []);
    } else {
      newOpen = new Set<string>(
        modif ? [...Array.from(open), trainCode] : [trainCode]
      );
    }

    if (!journeys.has(trainCode)) {
      IrishRailApi.getTrainJourney(trainCode, date).then((j) => {
        const newJourneys = journeys.set(trainCode, j);
        setJourneys(new Map(newJourneys));
      });
    }

    setOpen(newOpen);
  };

  const renderTrain = (train: Train) => {
    const code = train.Traincode;
    return (
      <Row key={code}>
        <Collapsible
          transitionTime={180}
          easing={"ease-out"}
          trigger={
            <Train onClick={handleTrainClick} key={code} data-traincode={code}>
              {columns.map((c) => (
                <div key={c.propName}>{train[c.propName]}</div>
              ))}
            </Train>
          }
        >
          <Info key={code + "info"}>
            {journeys.has(code) ? (
              <JourneyMap journey={journeys.get(code)} train={train} />
            ) : (
              <div>LOADING</div>
            )}
          </Info>
        </Collapsible>
      </Row>
    );
  };

  const renderHeader = () => {
    return (
      <Train className="header">
        {columns.map((c, i) => (
          <div key={i}>{c.dispName}</div>
        ))}
      </Train>
    );
  };

  return (
    <Table>
      {renderHeader()}
      <Body>{trainData.map(renderTrain)}</Body>
    </Table>
  );
};

export default hot(module)(ScheduleTable);

const columns: TrainColumn[] = [
  {
    dispName: "Due",
    propName: "Exparrival",
  },
  {
    dispName: `Departs`,
    propName: "Expdepart",
  },
  {
    dispName: "From",
    propName: "Origin",
  },
  {
    dispName: "To",
    propName: "Destination",
  },
  {
    dispName: "Ends",
    propName: "Destinationtime",
  },
  {
    dispName: "Last Seen",
    propName: "Lastlocation",
  },
];
