import * as React from "react";
import { hot } from "react-hot-loader";
import styled from "styled-components";

import Schedule from "./Schedule";
import StationSearch from "./StationSearch";
import IrishRailApi, { Station } from "../api/IrishRailApi";
import { SearchParameters } from "./SearchParameters";
import { JourneyKey } from "./JourneyKey";

interface AppState {
  station: Station;
  stationList: Station[];
  lookahead: number;
}

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
  grid-template-rows: 3fr 1fr auto;
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
    margin-bottom: 30px;
    margin-top: auto;
    padding-left: 0;
    list-style-position: inside;
    opacity: 0.9;
  }
`;

export const SearchHeading = styled.h3`
  font-weight: 500;
  margin: 10px 0;
`;

class App extends React.Component<{}, AppState> {
  private lookaheadOptions = [30, 60, 90, 120];

  constructor(props) {
    super(props);
    this.state = {
      station: null,
      stationList: null,
      lookahead: 90,
    };
  }

  componentDidMount = () => {
    IrishRailApi.getStations()
      .then((stationList) =>
        this.setState({
          stationList,
        })
      )
      .catch(console.error);
  };

  onStationChange = (station: Station) => {
    this.setState({ station });
  };

  onLookaheadChange = (lookahead: number) => {
    this.setState({ lookahead });
  };

  render() {
    const { lookahead, station, stationList } = this.state;

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
              station={this.state.station}
              onStationChange={this.onStationChange}
            />
            <SearchParameters
              lookaheadOptions={this.lookaheadOptions}
              lookahead={lookahead}
              onLookaheadChange={this.onLookaheadChange}
            />
          </SearchWrapper>
        ) : null}
        <ScheduleWrapper>
          <Schedule station={station} lookahead={lookahead} />
        </ScheduleWrapper>
      </Body>
    );
  }
}

declare let module: object;

export default hot(module)(App);
