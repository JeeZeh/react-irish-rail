import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { Info, Heart } from "react-feather";
import Schedule from "./Schedule";
import { StationSearch } from "./StationSearch";
import IrishRailApi, { Station, Train, Route } from "../api/IrishRailApi";
import { SearchParameters } from "./SearchParameters";
import { JourneyKey } from "./JourneyKey";
import { CollapsibleItemList } from "./CollapsibleItemList";
import { useWindowSize } from "../hooks/useWindowSize";
import { ModalMenu } from "./ModalMenu";
import { About } from "./About";
import { ErrorDialogue } from "./ErrorDialogue";
import { H3A, H1A, themes, ThemeType } from "./SharedStyles";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LoadingSpinner } from "./LoadingSpinner";
import { AppOptions } from "./AppOptions";
import { NearbyStations } from "./NearbyStations";
import { smallify } from "./JourneyStop";

// TODO: Retry loading on opening app if fails

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
  flex-wrap: nowrap;
  opacity: 0;
  transition: opacity 0.1s ease-out;
  margin-top: 20px;
  border-top: 1px solid ${(p) => p.theme.faint};

  &.visible {
    opacity: 1;
  }

  & > div {
    width: 350px;
    margin: 20px 15px;
  }

  & div.last {
    order: 3;
  }

  @media only screen and (max-width: 1200px) {
    flex-wrap: wrap;
    justify-content: flex-start;
    & > div {
      margin: 20px;
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
  /* margin-bottom: 20px; */
`;

const Body = styled.div`
  display: grid;
  grid-template-areas:
    "head key"
    "search search"
    "schedule schedule";
  grid-template-columns: 7fr 2fr;
  margin: auto auto;
  padding: 2em;
  max-width: 1200px;
  height: 100%;
  padding-bottom: 150px;

  @media only screen and (max-width: 1200px) {
    grid-template-columns: 5fr 2fr;
    max-width: 1000px;
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

  @media only screen and (max-width: 1200px) {
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

const ModalPreventScroll = createGlobalStyle<{ modalOpen: boolean }>`
  body {
    overflow: ${(p) => (p.modalOpen ? "hidden" : "inherit")};
  }
`;

export const App = () => {
  const timeoutLength = 5000;
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const lookaheadOptions = [30, 60, 90, 120];
  const isPortable = useWindowSize().width <= 1000;
  const [lookahead, setLookahead] = useState(90);
  const [station, setStation] = useState<Station>(null);
  const [stationTrains, setStationTrains] = useState<Train[]>([]);
  const [stationList, setStationList] = useState<Station[]>([]);
  const [stationConnections, setStationConnections] = useState<Route[]>([]);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [initialised, setInitialised] = useState(false);
  const [error, setError] = useState<any>(null);
  const [themePreference, setThemePreference] = useLocalStorage<
    "dark" | "light"
  >("theme", null);

  const initialTheme = themePreference ?? (prefersDark ? "dark" : "light");
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(initialTheme);

  const [localFavourites, setLocalFavourites] = useLocalStorage<string[]>(
    "favourites",
    []
  );

  const [favourites, setFavourites] = useState<string[]>(localFavourites);
  const [modalOpen, setModelOpen] = useState(false);
  const [scheduleFadedOut, setScheduleFadedOut] = useState(false);

  // Initialisation
  // Query Param and Mount data handling
  useEffect(() => {
    if (!stationList || stationList.length === 0) {
      getStationList();
      setInitialised(true);
      return;
    }
    const queryParams = new URLSearchParams(window.location.search);
    const qStation = queryParams.get("station");
    const qLookahead = parseInt(queryParams.get("lookahead"));
    setStation(stationList.find((s) => s.StationDesc === qStation));
    setLookahead(lookaheadOptions.find((l) => l === qLookahead) ?? 60);
    setInitialised(true);
  }, [stationList]);

  const getStationList = async () => {
    const timeout = setTimeout(errorTimeout, timeoutLength);
    try {
      const apiStationList = await IrishRailApi.getStations();
      if (!apiStationList || apiStationList.length === 0) {
        throw new Error("API returned no stations");
      }
      setStationList(apiStationList);
      setError(false);
      clearTimeout(timeout);
    } catch (e) {
      console.error(e);
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
    if (!initialised) return;
    const newParams = new URLSearchParams(
      station && lookahead
        ? [
            ["station", station.StationDesc],
            ["lookahead", lookahead.toString()],
          ]
        : []
    );
    const newTitle = `${station?.StationDesc} - ${lookahead} mins`;

    history.replaceState({}, newTitle, `?${newParams.toString()}`);
  }, [station, lookahead]);

  useEffect(() => {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const colour = themes[currentTheme] ? themes[currentTheme].bg : "fefefe";
    metaTheme.setAttribute("content", colour);
  }, [currentTheme]);

  const changeStation = async (newStation: Station) => {
    if (newStation && station !== newStation) {
      const [_, trains] = await Promise.all([
        asyncFadeout(true),
        IrishRailApi.getTrainsForStation(newStation, lookahead),
      ]);

      setStation(newStation);
      setStationTrains(trains);
      asyncFadeout(false, 50);

      const connectionCodes = Array.from(
        new Set(trains.map((t) => t.Traincode)).values()
      ).map(IrishRailApi.getRouteInfo);

      const connections = await Promise.all(connectionCodes);
      setStationConnections(connections);
      console.log(connections);
    }
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

  const changeStationByName = (stationName: string) => {
    const station = stationList.find((s) => s.StationDesc === stationName);

    changeStation(station);
  };

  const onStationClose = () => {
    window.scrollBy({ top: -10000, behavior: "smooth" });
    asyncFadeout(true).then(() => setStation(null));
  };

  // Theming behaviours

  window.matchMedia("(prefers-color-scheme: dark)").addListener((e) => {
    if (!themePreference) {
      if (e.matches) setCurrentTheme("dark");
      else setCurrentTheme("light");
    }
  });

  const handleThemeSwitch = (e) => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    setThemePreference(newTheme);
  };

  useEffect(() => {
    console.log(themePreference);
  }, [themePreference]);

  const renderHeader = () => {
    return (
      <Head>
        <div>
          <H1A>React Rail</H1A>
          <H3A>A modern train schedule for Irish Rail</H3A>
        </div>
        {!isPortable && (
          <>
            <About />
            <AppOptions handleThemeSwitch={handleThemeSwitch} />
          </>
        )}
      </Head>
    );
  };

  const renderSearch = () => {
    return (
      <>
        <SearchWrapper className={stationList ? "visible" : null}>
          <div>
            <H3A
              weight={700}
              margin="0 0 10px 0"
              justify={!isPortable ? "left" : "center"}
            >
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
          {stationList &&
            !(station && favourites.length === 0 && innerWidth <= 1200) && (
              <div
                className={
                  favourites.length === 0 && innerWidth > 1200 ? "last" : ""
                }
              >
                <CollapsibleItemList
                  onItemSelect={changeStationByName}
                  forceState={!station || !isPortable}
                  items={favourites.map((f) => ({
                    label: smallify(f),
                    key: f,
                  }))}
                  initialOpenState={isPortable && !station}
                  headerTitle="Favourite Stations"
                  noItemsPrompt={
                    <>
                      Favourite <Heart size={16} /> a station to see it here
                    </>
                  }
                />
              </div>
            )}
          {stationList &&
            !(station && innerWidth < 1200 && favourites.length !== 0) &&
            !(station && innerWidth >= 1000) && (
              <div>
                <NearbyStations
                  stationList={stationList}
                  onStationChange={changeStationByName}
                  initialOpenState={isPortable && !station}
                  station={station}
                />
              </div>
            )}
        </SearchWrapper>
        {!stationList && (
          <ScheduleSpinnerWrapper>
            <LoadingSpinner size={16} height="270px" width="100%" delay={0} />
          </ScheduleSpinnerWrapper>
        )}
      </>
    );
  };

  if (waiting) return <Body>{renderHeader()}</Body>;

  return (
    <ThemeProvider theme={themes[currentTheme]}>
      <ModalPreventScroll modalOpen={modalOpen} />
      <Wrapp>
        <Body>
          {renderHeader()}
          {!isPortable && (
            <>
              <KeyWrapper>
                <H3A margin={"0 0 10px 0"}>Map Key</H3A>
                <JourneyKey />
              </KeyWrapper>
            </>
          )}
          {isPortable ? (
            <ModalButton
              onClick={() => setModelOpen(true)}
              name="Open modal overlay"
            >
              <Info size={28} />
            </ModalButton>
          ) : null}
          {modalOpen ? (
            <ModalMenu
              handleCloseModal={() => setModelOpen(false)}
              handleThemeSwitch={handleThemeSwitch}
            />
          ) : null}
          {error ? (
            <ErrorDialogue />
          ) : (
            <>
              {initialised && renderSearch()}

              <ScheduleWrapper className={!scheduleFadedOut ? "visible" : null}>
                <Schedule
                  station={station}
                  lookahead={lookahead}
                  isFavourite={favourites.includes(station?.StationDesc)}
                  stationConnections={stationConnections}
                  onToggleFavourite={handleToggleFavourite}
                  handleStationClose={onStationClose}
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
            </>
          )}
        </Body>
      </Wrapp>
    </ThemeProvider>
  );
};

declare let module: object;

export default hot(module)(App);
