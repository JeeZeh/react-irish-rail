import React from "react";
import { useState, useEffect } from "react";
import IrishRailApi, { ITrain, IJourney } from "../api/IrishRailApi";
import styled from "styled-components";
import { ArrowDown, ArrowUp } from "react-feather";
import { MobileTrainCard } from "./MobileTrainCard";
import { useWindowSize } from "../hooks/useWindowSize";
import { DesktopTrainCard } from "./DesktopTrainCard";

const Table = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  padding: 15px;
  font-family: "Lato", sans-serif;
  transition: border 0.08s ease-out;

  @media only screen and (max-width: 1000px) {
    padding: 0;
  }
`;

export const DesktopTrainRow = styled.div<{ header?: boolean }>`
  display: grid;
  grid-template-areas: "pin due dep from to term last";
  grid-template-columns: 0.5fr 1fr 1.5fr 2.5fr 2.5fr 1fr 2.5fr;

  &:not(.header):hover {
    opacity: 0.8;
  }

  color: ${(p) => p.theme.secondaryText};
  font-weight: ${(p) => (p.header ? 700 : 500)};
  user-select: none;
  cursor: pointer;
`;

const Body = styled.div`
  ${DesktopTrainRow} {
    cursor: pointer;
  }

  & > div:last-child {
    border-bottom: none;
  }
`;

const ColumnHeader = styled.div`
  display: flex;
  height: 30px;
  & > svg {
    margin-left: 5px;
  }
`;

interface JourneyCache {
  journey: IJourney;
  time: number;
}

interface ScheduleTableProps {
  trains: ITrain[];
  pinTrain: (train: ITrain) => void;
  unpinTrain: (train: ITrain) => void;
}

const ScheduleTable = (props: ScheduleTableProps) => {
  const isPortable = useWindowSize().width <= 1000;
  const { trains } = props;
  const defaultSort = "Exparrival";
  const [sort, setSort] = useState({ col: defaultSort, dir: 1 }); // 1 = Ascending, -1 Descending
  const [journeyCache, setJourneyCache] = useState(
    new Map<string, JourneyCache>()
  );
  const [sortedTrainData, setSortedTrainData] = useState<ITrain[]>();

  // Re-sort the train data when the user updates the sorting params or trains change
  useEffect(() => {
    const { col, dir } = sort;
    if (col && dir !== 0) {
      const before = trains;
      const after = [...trains].sort((a, b) => {
        const [t1, t2] = [a[col], b[col]];
        const order = (t1.valueOf() >= t2.valueOf() ? 1 : -1) * dir;
        return order;
      });
      setSortedTrainData(after);
    } else {
      setSortedTrainData([...trains]);
    }
  }, [sort, trains]);

  // Updates the sorting direction based on the selected heading
  const handleSort = (e) => {
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
  };

  const getJourney = async (journeyCode: string): Promise<IJourney> => {
    const invalidateCacheAfter = 30000; // Invalidate after 30s
    let time = Date.now();
    let cachedJourney = journeyCache.get(journeyCode) ?? null;
    if (!cachedJourney || time - cachedJourney.time > invalidateCacheAfter) {
      const journey = await IrishRailApi.getTrainJourney(journeyCode);
      setJourneyCache(
        new Map(journeyCache.set(journeyCode, { journey, time }))
      );
      return journey;
    }

    return cachedJourney.journey;
  };

  const renderTrain = (train: ITrain) => {
    if (isPortable)
      return <MobileTrainCard train={train} getJourney={getJourney} />;

    return <DesktopTrainCard train={train} getJourney={getJourney} />;
  };

  const renderHeader = () => {
    return (
      <DesktopTrainRow header={true}>
        {scheduleColumns.map((c, i) => (
          <ColumnHeader
            onClick={(e) => handleSort(e)}
            key={i}
            data-col={c.propName}
          >
            <div>{c.dispName}</div>
            {sort.col === c.propName && sort.dir !== 0 && !isPortable ? (
              sort.dir === -1 ? (
                <ArrowUp />
              ) : (
                <ArrowDown />
              )
            ) : null}
          </ColumnHeader>
        ))}
      </DesktopTrainRow>
    );
  };

  return (
    <Table>
      {!isPortable ? renderHeader() : null}
      <Body>{sortedTrainData && sortedTrainData?.map(renderTrain)}</Body>
      {/* <Body>{[testTrain, testTrain, testTrain].map(renderTrain)}</Body> */}
    </Table>
  );
};

export default ScheduleTable;

// const testTrain: Train = {
//   Servertime: null,
//   Traincode: null,
//   Stationfullname: null,
//   Stationcode: null,
//   Querytime: null,
//   Traindate: null,
//   Origin: "Dublin Connolly",
//   Destination: "Limerick Junction",
//   Origintime: "13:42",
//   Destinationtime: "15:55",
//   Status: null,
//   Lastlocation: null,
//   Duein: null,
//   Late: null,
//   Exparrival: "14:26",
//   Expdepart: "14:30",
//   Scharrival: null,
//   Schdepart: null,
//   Direction: null,
//   Traintype: null,
//   Locationtype: null,
// };

export const scheduleColumns: Array<{
  dispName: string;
  propName: string;
}> = [
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
