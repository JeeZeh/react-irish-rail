import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import styled, { ThemeContext, ThemeProvider } from "styled-components";
import { Info } from "react-feather";
import Schedule from "./Schedule";
import { StationSearch } from "./StationSearch";
import IrishRailApi, { Station, Train } from "../api/IrishRailApi";
import { SearchParameters } from "./SearchParameters";
import { JourneyKey } from "./JourneyKey";
import { FavouriteStations } from "./FavouriteStations";
import { useWindowSize } from "../hooks/useWindowSize";
import { ModalMenu } from "./ModalMenu";
import { About } from "./About";
import { ErrorDialogue } from "./ErrorDialogue";
import { H3A, H1A, themes, ThemeType } from "./SharedStyles";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LoadingSpinner } from "./LoadingSpinner";
import { AppOptions } from "./AppOptions";

const Wrapp = styled.div`
  background-color: ${(p) => p.theme.bg};
  width: 100%;
  min-height: 101vh;
  color: ${(p) => p.theme.primaryText};
  * {
    box-sizing: border-box;
    font-family: "Nunito", sans-serif;
  }
`;

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

  opacity: 0;
  transition: opacity 0.2s ease-out;
  &.visible {
    opacity: 1;
  }
`;

const ScheduleSpinnerWrapper = styled.div`
  grid-area: schedule;
`;

const KeyWrapper = styled.div`
  grid-area: key;
  justify-self: center;
`;

const Body = styled.div`
  display: grid;
  grid-template-areas:
    "head key"
    "search options"
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
  background: ${(p) => p.theme.nearlyBg};
  border: 1px solid ${(p) => p.theme.button};
  width: 56px;
  height: 56px;
  border-radius: 10px;
  box-shadow: 0 2px 0px ${(p) => p.theme.button};
  z-index: 9;
  &:focus {
    outline: none;
  }

  & svg {
    color: ${(p) => p.theme.secondaryText};
  }
`;

export const App = () => {
  const timeoutLength = 5000;
  const lookaheadOptions = [30, 60, 90, 120];
  const isPortable = useWindowSize().width <= 1000;
  const [lookahead, setLookahead] = useState(90);
  const [station, setStation] = useState<Station>(null);
  const [stationTrains, setStationTrains] = useState<Train[]>(null);
  const [stationList, setStationList] = useState<Station[]>(null);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("dark");

  const themeContext = useContext(ThemeContext);
  console.log("THEME", themeContext);

  const [localFavourites, setLocalFavourites] = useLocalStorage<string[]>(
    "favourites",
    []
  );
  const [favourites, setFavourites] = useState<string[]>(localFavourites);
  const [modalOpen, setModelOpen] = useState(false);
  const [scheduleFadedOut, setScheduleFadedOut] = useState(false);

  // Query Param and Mount data handling
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const qStation = queryParams.get("station");
    const qLookahead = parseInt(queryParams.get("lookahead"));
    if (!stationList) {
      getStationList().then(() => {
        setLookahead(lookaheadOptions.find((l) => l === qLookahead) ?? 60);
      });
    } else {
      setStation(stationList.find((s) => s.StationDesc === qStation));
    }
  }, [stationList]);

  const getStationList = async () => {
    const timeout = setTimeout(errorTimeout, timeoutLength);
    try {
      const apiStationList = await IrishRailApi.getStations();
      setStationList(apiStationList);
      setError(false);
      clearTimeout(timeout);
    } catch (e) {
      setError(e);
    } finally {
      setWaiting(false);
    }
  };

  // Favourite Handling
  useEffect(() => {
    setLocalFavourites(favourites);
  }, [favourites]);

  const handleToggleFavourite = (stationName: string) => {
    const favSet = new Set(favourites);
    if (favSet.has(stationName)) {
      favSet.delete(stationName);
    } else {
      favSet.add(stationName);
    }

    setFavourites(Array.from(favSet));
  };

  const errorTimeout = () => {
    setWaiting(false);
    setError(
      error
        ? error
        : new Error("Timout from endpoint, showing error dialogue for now")
    );
  };

  // Station Data handling
  useEffect(() => {
    changeStation(station);
  }, [lookahead, station]);

  // Query param change handling
  useEffect(() => {
    if (!station || !lookahead) return;
    const newParams = new URLSearchParams([
      ["station", station.StationDesc],
      ["lookahead", lookahead.toString()],
    ]);
    const newTitle = `${station?.StationDesc} - ${lookahead} mins`;

    history.replaceState({}, newTitle, `?${newParams.toString()}`);
  }, [station, lookahead]);

  const changeStation = (newStation: Station) => {
    Promise.all([
      asyncFadeout(true),
      IrishRailApi.getTrainsForStation(newStation, lookahead),
    ]).then(([_, trains]) => {
      setStation(newStation);
      setStationTrains(trains);
      asyncFadeout(false, 50);
    });
  };

  const asyncFadeout = (
    fadeOut: boolean,
    timeMs: number = 200
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (fadeOut) setScheduleFadedOut(fadeOut);
      setTimeout(() => {
        if (!fadeOut) setScheduleFadedOut(fadeOut);
        resolve(true);
      }, timeMs);
    });
  };

  const onFavouriteSelect = (e) => {
    const station = stationList.find(
      (s) => s.StationDesc === e.target.innerHTML
    );

    setStation(station);
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
            <H3A weight={700} margin="0 0 10px 0" justify="center">
              View upcoming trains at a station
            </H3A>
            <StationSearch
              stationList={stationList}
              station={station}
              onStationChange={changeStation}
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
          <ScheduleSpinnerWrapper>
            <LoadingSpinner size={16} height="270px" width="100%" delay={0} />
          </ScheduleSpinnerWrapper>
        )}
      </>
    );
  };

  const handleThemeSwitch = (e) => {
    setCurrentTheme(currentTheme === "light" ? "dark" : "light");
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
    <ThemeProvider theme={themes[currentTheme]}>
      <Wrapp>
        <Body>
          {renderHeader()}
          {isPortable ? null : (
            <>
              <KeyWrapper>
                <H3A margin={"0 0 10px 0"}>Map Key</H3A>
                <JourneyKey />
              </KeyWrapper>
              <AppOptions handleThemeSwitch={handleThemeSwitch} />
            </>
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
              handleThemeSwitch={handleThemeSwitch}
            />
          ) : null}

          {renderSearch()}

          <ScheduleWrapper className={!scheduleFadedOut ? "visible" : null}>
            <Schedule
              station={station}
              lookahead={lookahead}
              isFavourite={favourites.includes(station?.StationDesc)}
              onToggleFavourite={handleToggleFavourite}
              handleStationClose={() => {
                asyncFadeout(true).then(() => setStation(null));
              }}
              stationTrains={stationTrains}
            />
          </ScheduleWrapper>

          {station && stationTrains === null && (
            <ScheduleSpinnerWrapper>
              <LoadingSpinner
                size={16}
                height="270px"
                width="100%"
                delay={100}
              />
            </ScheduleSpinnerWrapper>
          )}
        </Body>
      </Wrapp>
    </ThemeProvider>
  );
};

declare let module: object;

export default hot(module)(App);
