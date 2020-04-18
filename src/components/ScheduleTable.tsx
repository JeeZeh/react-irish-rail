import * as React from "react";
import { hot } from "react-hot-loader";
import { Train } from "../api/IrishRailApi";
import styled from "styled-components";

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

const Body = styled.div`
  & > div > div:first-child {
    cursor: pointer;
  }

  & > div:last-child {
    border-bottom: none;
  }
`;

const Row = styled.div`
  padding-top: 15px;
  display: grid;
  grid-template-areas:
    "train"
    "info";
  transition: opacity 0.08s ease-out;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
`;

const Train = styled.div`
  display: grid;
  grid-template-areas: "due dep from to term last";
  grid-template-columns: 1fr 1fr 2.5fr 2.5fr 1fr 2.5fr;
  grid-area: train;

  &:not(.header):hover {
    opacity: 0.8;
  }
  &.header {
    color: #444;
    font-weight: 700;
  }
`;

const Info = styled.div`
  grid-area: info;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease-in-out;
  width: 100%;

  &.open {
    max-height: 100px;
  }
`;

const ScheduleTable = (props: ScheduleTableProps) => {
  const { trainData } = props;
  const [open, setOpen] = React.useState(new Set<string>());

  const handleTrainClick = (e) => {
    const trainCode = e.currentTarget.getAttribute("data-traincode");
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

    setOpen(newOpen);
  };

  const renderTrain = (train: Train) => {
    return (
      <Row className={open.has(train.Traincode) ? "open" : null}>
        <Train
          onClick={handleTrainClick}
          key={train.Traincode}
          data-traincode={train.Traincode}
        >
          {columns.map((c) => (
            <div key={c.propName}>{train[c.propName]}</div>
          ))}
        </Train>
        <Info className={open.has(train.Traincode) ? "open" : null}>
          <div>MAP</div>
          <div>CURRENT</div>
          <div>AAA</div>
        </Info>
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
