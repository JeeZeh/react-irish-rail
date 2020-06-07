import * as React from "react";
import { useState, useEffect } from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Journey } from "../api/IrishRailApi";
import * as Moment from "moment";
import styled from "styled-components";
import { ArrowDown, ArrowUp } from "react-feather";
import { MobileTrainCard } from "./MobileTrainCard";
import { useWindowSize } from "../hooks/useWindowSize";
import { DesktopTrainCard } from "./DesktopTrainCard";
import { testJourney } from "../api/JourneyLoader";

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

export const DesktopTrainRow = styled.div<{ header?: boolean }>`
  display: grid;
  grid-template-areas: "due dep from to term last";
  grid-template-columns: 1fr 1.5fr 2.5fr 2.5fr 1fr 2.5fr;

  &:not(.header):hover {
    opacity: 0.8;
  }

  color: #444;
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
  journey: Journey;
  time: number;
}

const ScheduleTable = (props: { stationTrains: Train[] }) => {
  const isPortable = useWindowSize().width < 900;
  const { stationTrains } = props;
  const defaultSort = "Expdepart";
  console.log("Station set to", props.stationTrains[0].Stationfullname);
  const [sort, setSort] = useState({ col: defaultSort, dir: 1 }); // 1 = Ascending, -1 Descending
  const [journeyCache, setJourneyCache] = useState(
    new Map<string, JourneyCache>()
  );
  const [sortedTrainData, setSortedTrainData] = useState<Train[]>(null);

  useEffect(() => {
    setSortedTrainData(stationTrains);
  }, [stationTrains]);

  // Re-sort the train data when the user updates the sorting params
  useEffect(() => {
    const { col, dir } = sort;
    if (col && dir !== 0) {
      console.log("sorting by:", col, dir);
      setSortedTrainData(
        [...stationTrains].sort((a, b) => {
          return (a[col] >= b[col] ? 1 : -1) * dir;
        })
      );
    } else {
      setSortedTrainData([...stationTrains]);
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

  const getJourney = async (journeyCode: string): Promise<Journey> => {
    // return testJourney();
    const invalidateCacheAfter = 30000; // Invalidate after 30s
    let time = Date.now();
    let cachedJourney = journeyCache.get(journeyCode) ?? null;
    if (!cachedJourney || cachedJourney.time > invalidateCacheAfter) {
      const date = Moment().locale("en-gb").format("ll");
      const journey = await IrishRailApi.getTrainJourney(journeyCode, date);
      setJourneyCache(
        new Map(journeyCache.set(journeyCode, { journey, time }))
      );
      return journey;
    }

    return cachedJourney.journey;
  };

  const renderTrain = (train: Train) => {
    const code = train.Traincode;

    if (isPortable)
      return (
        <MobileTrainCard train={train} getJourney={getJourney} key={code} />
      );

    return (
      <DesktopTrainCard train={train} getJourney={getJourney} key={code} />
    );
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
      <Body>{sortedTrainData && sortedTrainData.map(renderTrain)}</Body>
      {/* <Body>{[testTrain, testTrain, testTrain].map(renderTrain)}</Body> */}
    </Table>
  );
};

export default hot(module)(ScheduleTable);

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
