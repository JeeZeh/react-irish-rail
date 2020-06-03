import * as React from "react";
import { useState, useEffect } from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Journey } from "../api/IrishRailApi";
import * as Moment from "moment";
import styled from "styled-components";
import { JourneyMap } from "./JourneyMap";
import Collapsible from "react-collapsible";
import { ArrowDown, ArrowUp } from "react-feather";
import { MobileTrainCard } from "./MobileTrainCard";

interface TrainColumn {
  dispName: string;
  propName: string;
}

export interface ScheduleTableProps {
  trainData: Train[];
  isPortable: boolean;
}

const Table = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  padding: 15px;
  font-family: "Lato", sans-serif;
  transition: border 0.08s ease-out;

  @media only screen and (max-width: 900px) {
    padding: 0;
  }
`;

const Row = styled.div`
  padding-top: 15px;
  transition: opacity 0.08s ease-out;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  transition: all 0.25s ease-in-out;
`;

const Train = styled.div<{ isPortable?: boolean }>`
  display: grid;
  grid-template-areas: ${(p) =>
    p.isPortable ? "due dep from to" : "due dep from to term last"};
  grid-template-columns: ${(p) =>
    p.isPortable ? "1fr 1.5fr 2.5fr 2.5fr" : "1fr 1.5fr 2.5fr 2.5fr 1fr 2.5fr"};

  &:not(.header):hover {
    opacity: 0.8;
  }
  &.header {
    color: #444;
    font-weight: 700;
    user-select: none;
    cursor: pointer;
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
`;

const ScheduleTable = (props: ScheduleTableProps) => {
  const originalTrainData = [...props.trainData];
  const { isPortable, trainData } = props;
  const defaultSort = "Expdepart";
  const [journeys, setJourneys] = useState(new Map<string, Journey>());
  const [sort, setSort] = useState({ col: defaultSort, dir: 1 }); // 1 = Ascending, -1 Descending
  const [sortedTrainData, setSortedTrainData] = useState([
    ...originalTrainData,
  ]);
  const columns = props.isPortable
    ? headings.slice(0, headings.length - 2)
    : headings;

  // Re-sort the train data when the user updates the sorting params
  useEffect(() => {
    const { col, dir } = sort;
    if (col && dir !== 0) {
      console.log("sorting by:", col, dir);
      sortedTrainData.sort((a, b) => {
        return (a[col] >= b[col] ? 1 : -1) * dir;
      });
      setSortedTrainData([...sortedTrainData]);
    } else {
      setSortedTrainData([...originalTrainData]);
    }
  }, [sort]);

  // Updates the sorting direction based on the selected heading
  const handleSort = (e) => {
    if (isPortable) {
      return;
    }
    const col = e.currentTarget.getAttribute("data-col");
    if (sort.col === col) {
      if (sort.dir === -1) {
        setSort({ ...sort, dir: 0 });
      } else {
        setSort({ ...sort, dir: sort.dir > 0 ? -1 : 1 });
      }
    } else {
      setSort({ col, dir: 1 });
    }
    console.log("Updated sorting");
  };

  const renderTrain = (train: Train) => {
    const code = train.Traincode;

    if (isPortable) return <MobileTrainCard train={train} key={code} />;

    // return (
    //   <Row key={code}>
    //     <Collapsible
    //       transitionTime={180}
    //       easing={"ease-out"}
    //       trigger={
    //         <Train
    //           key={code}
    //           onClick={handleTrainClick}
    //           data-traincode={code}
    //           isPortable={isPortable}
    //         >
    //           {columns.map((c) => (
    //             <div key={c.propName}>{train[c.propName]}</div>
    //           ))}
    //         </Train>
    //       }
    //     >
    //       <Info key={code + "info"}>
    //         {journeys.has(code) ? (
    //           <JourneyMap
    //             journey={journeys.get(code)}
    //             isPortable={isPortable}
    //             train={train}
    //           />
    //         ) : (
    //           <div>LOADING</div>
    //         )}
    //       </Info>
    //     </Collapsible>
    //   </Row>
    // );
  };

  const renderHeader = () => {
    return (
      <Train className="header" isPortable={isPortable}>
        {columns.map((c, i) => (
          <div onClick={(e) => handleSort(e)} key={i} data-col={c.propName}>
            {c.dispName}{" "}
            {sort.col === c.propName && sort.dir !== 0 && !isPortable ? (
              sort.dir === -1 ? (
                <ArrowUp />
              ) : (
                <ArrowDown />
              )
            ) : null}
          </div>
        ))}
      </Train>
    );
  };

  return (
    <Table>
      {!props.isPortable ? renderHeader() : null}
      <Body>
        {renderTrain(testTrain)}
        {renderTrain(testTrain)}
        {renderTrain(testTrain)}
        {props.trainData.map((t) => renderTrain(t))}
      </Body>
    </Table>
  );
};

export default hot(module)(ScheduleTable);

const headings: TrainColumn[] = [
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

const testTrain: Train = {
  Servertime: null,
  Traincode: null,
  Stationfullname: null,
  Stationcode: null,
  Querytime: null,
  Traindate: null,
  Origin: "Dublin Connolly",
  Destination: "Limerick Junction",
  Origintime: "13:42",
  Destinationtime: "15:55",
  Status: null,
  Lastlocation: null,
  Duein: null,
  Late: null,
  Exparrival: "14:26",
  Expdepart: "14:30",
  Scharrival: null,
  Schdepart: null,
  Direction: null,
  Traintype: null,
  Locationtype: null,
};
