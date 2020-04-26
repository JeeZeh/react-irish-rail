import * as React from "react";
import { useState } from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import styled from "styled-components";

import Schedule from "./Schedule";
import StationSearch from "./StationSearch";
import IrishRailApi, { Station } from "../api/IrishRailApi";
import { SearchParameters } from "./SearchParameters";
import { JourneyKey } from "./JourneyKey";
import { FavouriteStations } from "./FavouriteStations";

interface AppState {
  station: Station;
  stationList: Station[];
  lookahead: number;
}

const FavouritesList = styled.div`
  grid-area: schedule;
  width: 250px;
`;

const SearchWrapper = styled.div`
  grid-area: search;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 90%;
`;

const ScheduleWrapper = styled.div`
  margin-top: 20px;
  grid-area: schedule;
`;

const KeyWrapper = styled.div`
  grid-area: key;
`;

const Body = styled.div`
  background-color: #fbfbfb;
  display: grid;
  grid-template-areas:
    "head key"
    "search key"
    "schedule schedule";
  grid-template-columns: 7fr 2fr;
  grid-template-rows: 2fr 1fr auto;
  margin: auto auto;
  padding: 2em;
  max-width: 1200px;
  min-width: 750px;
  height: 100%;
  padding-bottom: 150px;
`;

const Head = styled.div`
  user-select: none;
  grid-area: head;
  padding-right: 50px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;

  & h1 {
    font-weight: 700;
    margin: none;
  }
  & h3 {
    font-weight: 500;
    font-size: 1.3em;
    margin: none;
  }

  & ul {
    width: 80%;
    margin-top: 30px;
    padding-left: 0;
    list-style-position: inside;
    opacity: 0.9;
  }
`;

export const SearchHeading = styled.h3`
  font-weight: 500;
  margin: 10px 0;
`;

export const App = () => {
  const lookaheadOptions = [30, 60, 90, 120];
  const [state, setState] = useState<AppState>({
    station: null,
    stationList: null,
    lookahead: 90,
  });

  React.useEffect(() => {
    IrishRailApi.getStations()
      .then((stationList) =>
        setState({
          ...state,
          stationList,
        })
      )
      .catch(console.error);
  }, []);

  const onStationChange = (station: Station) => {
    setState({ ...state, station });
  };

  const onLookaheadChange = (lookahead: number) => {
    setState({ ...state, lookahead });
  };

  const onFavouriteSelect = (e) => {
    const station = stationList.find(
      (s) => s.StationDesc === e.target.innerHTML
    );

    if (station) {
      setState({ ...state, station });
    } else {
      console.error("Couldn't find station", e.target.innerHTML);
    }
  };

  const onStationClose = () => {
    setState({ ...state, station: null });
  };

  const { lookahead, station, stationList } = state;
  return (
    <Body className="rail">
      <Head>
        <div>
          <h1>Irish Rail Train Schedule</h1>
          <h3>A modern train schedule for Irish Rail</h3>
        </div>
        <ul>
          <li>
            This app allows you to view all trains passing through a given
            station.
          </li>
          <li>
            You can explore each train, its journey information, and live
            location map.
          </li>
          <li>
            This is not a commercial product, nor is it linked in any way to
            Iarnród Éireann.
          </li>
          <li>
            It was created as a learning experience using React, feel free to
            read the{" "}
            <a href="https://github.com/JeeZeh/React-Irish-Rail">
              source code.
            </a>
          </li>
        </ul>
      </Head>
      <KeyWrapper>
        <JourneyKey />
      </KeyWrapper>
      {stationList ? (
        <SearchWrapper>
          <StationSearch
            stationList={stationList}
            station={state.station}
            onStationChange={onStationChange}
          />
          <SearchParameters
            lookaheadOptions={lookaheadOptions}
            lookahead={lookahead}
            onLookaheadChange={onLookaheadChange}
          />
        </SearchWrapper>
      ) : null}
      {station ? (
        <ScheduleWrapper>
          <Schedule
            station={station}
            lookahead={lookahead}
            handleStationClose={onStationClose}
          />
        </ScheduleWrapper>
      ) : (
        <FavouritesList>
          <FavouriteStations handleClick={onFavouriteSelect} />
        </FavouritesList>
      )}
    </Body>
  );
};

declare let module: object;

export default hot(module)(App);

/**
 * Local Storage hook from https://usehooks.com/useLocalStorage/
 */
export const useLocalStorage = <T,>(key, initialValue): [T, (x: T) => void] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue];
};
