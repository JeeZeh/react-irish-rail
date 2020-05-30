import * as React from "react";
import { useState, useEffect } from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import styled from "styled-components";
import { Compass, Search } from "react-feather";
import Schedule from "./Schedule";
import { StationSearch } from "./StationSearch";
import IrishRailApi, { Station } from "../api/IrishRailApi";
import { SearchParameters } from "./SearchParameters";
import { JourneyKey } from "./JourneyKey";
import { FavouriteStations } from "./FavouriteStations";
import { useWindowSize } from "../hooks/useWindowSize";
import { ModalInfo } from "./ModalInfo";
import { About } from "./About";
import { ErrorDialogue } from "./ErrorDialogue";

interface AppState {
  station: Station;
  stationList: Station[];
  waiting: boolean;
  error: any;
}

const FavouritesList = styled.div`
  grid-area: schedule;
  width: 250px;

  @media only screen and (max-width: 900px) {
    align-items: center;
    justify-self: center;
    text-align: center;
  }
`;

const SearchWrapper = styled.div`
  grid-area: search;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  width: 90%;

  & > div {
    width: 40%;
  }

  @media only screen and (max-width: 1205px) {
    flex-direction: column;
    justify-content: flex-start;
    & > div {
      margin: 10px 0;
      width: 100%;
    }
  }

  @media only screen and (max-width: 900px) {
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
  @media only screen and (max-width: 900px) {
    grid-template-columns: auto;
    grid-template-areas:
      "head"
      "key"
      "search"
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

export const H3A = styled.h3<{ margin?: string }>`
  font-weight: 500;
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

  @media only screen and (max-width: 900px) {
    padding: 15px 0;
    text-align: center;
    width: 100%;
    align-items: center;
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
  right: 20px;
  bottom: 20px;
  background: #fefefe;
  border: 1px solid #aaa;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  box-shadow: 0 3px 8px #00000022;
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
  const size = useWindowSize();
  const isPortable = size.width < 900;
  const [lookahead, setLookahead] = useState(90);
  const [state, setState] = useState<AppState>({
    station: null,
    stationList: null,
    waiting: true,
    error: null,
  });

  const [modalOpen, setModelOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(errorTimeout, timeoutLength);
    IrishRailApi.getStations()
      .then((stationList) => {
        setState({
          ...state,
          waiting: false,
          stationList,
        });
        clearTimeout(timeout);
      })
      .catch((error) => {
        setState({
          ...state,
          waiting: false,
          error,
        });
        clearTimeout(timeout);
      });
  }, []);

  const errorTimeout = () => {
    setState({
      ...state,
      waiting: false,
      error: new Error("Timout from endpoint, showing error dialogue for now"),
    });
  };

  const onStationChange = (station: Station) => {
    setState({ ...state, station });
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

  const handleCloseModal = () => {
    setModelOpen(false);
  };

  const handleOpenModal = () => {
    setModelOpen(true);
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

  const { station, stationList, error, waiting } = state;

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
        <ModalButton onClick={handleOpenModal}>
          <Compass size={32} />
        </ModalButton>
      ) : null}

      {modalOpen ? <ModalInfo handleCloseModal={handleCloseModal} /> : null}

      {stationList ? (
        <SearchWrapper>
          <div>
            <SearchHeading>Find trains at</SearchHeading>
            <StationSearch
              stationList={stationList}
              station={state.station}
              onStationChange={onStationChange}
              isPortable={isPortable}
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
        </SearchWrapper>
      ) : null}
      {station ? (
        <ScheduleWrapper>
          <Schedule
            station={station}
            lookahead={lookahead}
            handleStationClose={onStationClose}
            isPortable={isPortable}
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
