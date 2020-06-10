import * as React from "react";
import { useState, useEffect } from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import styled from "styled-components";
import { Menu } from "react-feather";
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
import { lightGrey } from "./SharedStyles";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LoadingSpinner } from "./LoadingSpinner";

const SearchWrapper = styled.div`
  grid-area: search;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;

  width: 90%;

  & > div {
    width: 45%;
  }

  @media only screen and (max-width: 1205px) {
    flex-direction: column;
    justify-content: flex-start;
    & > div {
      margin: 10px 0;
      width: 100%;
    }
  }

  @media only screen and (max-width: 1000px) {
    align-items: center;
    justify-content: center;
    text-align: center;
    margin: auto;
    & > div {
      width: 320px;
    }
  }
`;

const ScheduleWrapper = styled.div`
  margin-top: 20px;
  grid-area: schedule;
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
    "favourites favourites"
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
      "favourites"
      "schedule";

    padding: 0;
  }
`;

export const H1A = styled.h1<{ margin?: string }>`
  font-weight: 700;
  margin: ${(p) => p.margin ?? 0};
  @media only screen and (max-width: 500px) {
    font-size: 2em;
  }

  @media only screen and (max-width: 400px) {
    font-size: 1.4em;
  }
`;

export const H3A = styled.h3<{ margin?: string; weight?: number }>`
  font-weight: ${(p) => p.weight ?? 500};
  font-size: 1.3em;
  margin: ${(p) => p.margin ?? 0}; /* "10px 0 0 10px" */

  @media only screen and (max-width: 400px) {
    font-size: 1em;
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

export const SearchHeading = styled(H3A)`
  font-weight: 700;
  margin: 10px 0;
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

export const Prompt = styled.p`
  font-style: italic;
  max-width: 320px;
  font-size: 16px;
  font-weight: 600;
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
    if (stationList) {
      return (
        <SearchWrapper>
          <div>
            <SearchHeading>Find trains at</SearchHeading>
            <StationSearch
              stationList={stationList}
              station={station}
              onStationChange={setStation}
            />
          </div>
          <div>
            <SearchHeading>In the next</SearchHeading>
            <SearchParameters
              lookaheadOptions={lookaheadOptions}
              lookahead={lookahead}
              onLookaheadChange={setLookahead}
            />
          </div>
          {stationList && (
            <FavouriteStations
              handleClick={onFavouriteSelect}
              forceOpen={!station || !isPortable}
              favourites={favourites}
            />
          )}
        </SearchWrapper>
      );
    } else {
      return null;
    }
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
          <Menu size={28} />
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
