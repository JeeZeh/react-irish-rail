import * as React from "react";
import { useState, useEffect } from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import styled from "styled-components";
import { Info } from "react-feather";
import Schedule from "./Schedule";
import { StationSearch } from "./StationSearch";
import IrishRailApi, { Station } from "../api/IrishRailApi";
import { SearchParameters } from "./SearchParameters";
import { JourneyKey } from "./JourneyKey";
import { FavouriteStations } from "./FavouriteStations";
import { useWindowSize } from "../hooks/useWindowSize";
import { ModalMenu } from "./ModalMenu";
import { About } from "./About";
import { ErrorDialogue } from "./ErrorDialogue";
import { lightGrey, H3A, H1A } from "./SharedStyles";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LoadingSpinner } from "./LoadingSpinner";

const SearchWrapper = styled.div`
  grid-area: search;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  opacity: 0;
  transition: opacity 0.1s ease-out;

  &.visible {
    opacity: 1;
  }

  & > div {
    width: 400px;
  }

  @media only screen and (max-width: 1205px) {
    & > div {
      width: 350px;
      margin: 20px 20px 0 0;
    }
  }

  @media only screen and (max-width: 1000px) {
    flex-direction: column;
    margin: auto;
    & > div {
      margin: 10px 0;
    }
  }
  @media only screen and (max-width: 400px) {
    & > div {
      width: 300px;
    }
  }
`;

const ScheduleWrapper = styled.div`
  margin-top: 20px;
  grid-area: schedule;
  margin-bottom: 400px;
`;

const KeyWrapper = styled.div`
  grid-area: key;
  justify-self: center;
`;

const Body = styled.div`
  background-color: #fbfbfb;
  display: grid;
  grid-template-areas:
    "head key"
    "search key"
    "schedule schedule";
  grid-template-columns: 7fr 2fr;
  margin: auto auto;
  padding: 2em;
  max-width: 1200px;
  height: 100%;
  padding-bottom: 150px;

  @media only screen and (max-width: 1205px) {
    grid-template-columns: 5fr 2fr;
  }
  @media only screen and (max-width: 1000px) {
    grid-template-columns: 5fr 3fr;
  }
  @media only screen and (max-width: 1000px) {
    grid-template-columns: auto;
    grid-template-areas:
      "head"
      "key"
      "search"
      "schedule";

    padding: 0;
  }
`;

const Head = styled.div`
  user-select: none;
  grid-area: head;
  padding-right: 50px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;

  @media only screen and (max-width: 1000px) {
    padding: 15px 0;
    text-align: center;
    width: 100%;
    align-items: center;
  }

  @media only screen and (max-width: 1205px) {
    padding-right: 5px;
  }
`;

const ModalButton = styled.button`
  cursor: pointer;
  user-select: none;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 20px;
  bottom: 20px;
  background: #fefefe;
  border: 1px solid #aaa;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  box-shadow: 0 4px 4px ${lightGrey};
  z-index: 9;
  &:focus {
    outline: none;
  }

  & svg {
    color: #444;
  }
`;

export const App = () => {
  const timeoutLength = 5000;
  const lookaheadOptions = [30, 60, 90, 120];
  const isPortable = useWindowSize().width <= 1000;
  const [lookahead, setLookahead] = useState(90);
  const [station, setStation] = useState<Station>(null);
  const [stationList, setStationList] = useState<Station[]>(null);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [favourites, _] = useLocalStorage<string[]>("favourites", []);
  const [modalOpen, setModelOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(errorTimeout, timeoutLength);
    IrishRailApi.getStations()
      .then(setStationList)
      .then(() => {
        setError(false);
        clearTimeout(timeout);
      })
      .catch(setError)
      .finally(() => setWaiting(false));
  }, []);

  const errorTimeout = () => {
    setWaiting(false);
    setError(
      error ?? new Error("Timout from endpoint, showing error dialogue for now")
    );
  };

  const onFavouriteSelect = (e) => {
    const station = stationList.find(
      (s) => s.StationDesc === e.target.innerHTML
    );

    if (station) {
      setStation(station);
    } else {
      console.error("Couldn't find station", e.target.innerHTML);
    }

    if (modalOpen) {
      setModelOpen(false);
    }
  };

  const renderHeader = () => {
    return (
      <Head>
        <div>
          <H1A>Irish Rail Schedule</H1A>
          <H3A>A modern train schedule for Irish Rail</H3A>
        </div>
        {isPortable ? null : <About />}
      </Head>
    );
  };

  const renderSearch = () => {
    return (
      <>
        <SearchWrapper className={stationList ? "visible" : null}>
          <div>
            <H3A weight={700} margin="0 0 10px 0">
              View upcoming trains at a station
            </H3A>
            <StationSearch
              stationList={stationList}
              station={station}
              onStationChange={setStation}
            />
            <SearchParameters
              lookaheadOptions={lookaheadOptions}
              lookahead={lookahead}
              onLookaheadChange={setLookahead}
            />
          </div>
          <div>
            {stationList && (
              <FavouriteStations
                onFavouriteSelect={onFavouriteSelect}
                forceOpen={!station || !isPortable}
                favourites={favourites}
              />
            )}
          </div>
        </SearchWrapper>
        {!stationList && (
          <LoadingSpinner
            color="#515773"
            size={16}
            height="270px"
            width="100%"
            delay={0}
          />
        )}
      </>
    );
  };

  if (error) {
    console.error(error);
    return (
      <Body>
        {renderHeader()}
        <ErrorDialogue />
      </Body>
    );
  }

  if (waiting) return <Body>{renderHeader()}</Body>;

  return (
    <Body>
      {renderHeader()}
      {isPortable ? null : (
        <KeyWrapper>
          <H3A margin={"0 0 10px 0"}>Map Key</H3A>
          <JourneyKey />
        </KeyWrapper>
      )}
      {isPortable ? (
        <ModalButton onClick={() => setModelOpen(true)}>
          <Info size={28} />
        </ModalButton>
      ) : null}
      {modalOpen ? (
        <ModalMenu
          handleCloseModal={() => setModelOpen(false)}
          onFavouriteSelect={onFavouriteSelect}
        />
      ) : null}

      {renderSearch()}

      {station && (
        <ScheduleWrapper>
          <Schedule
            station={station}
            lookahead={lookahead}
            handleStationClose={() => setStation(null)}
          />
        </ScheduleWrapper>
      )}
    </Body>
  );
};

declare let module: object;

export default hot(module)(App);
