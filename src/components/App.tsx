import * as React from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import styled from "styled-components";

import Schedule from "./Schedule";
import StationSearch from "./StationSearch";
import { Station } from "../api/IrishRailApi";
import { SearchParameters } from "./SearchParameters";
import { JourneyKey } from "./JourneyKey";

interface AppState {
  station: Station;
  searchReady: boolean;
  lookahead: number;
}

const SearchWrapper = styled.div`
  display: flex;
  grid-area: search;
  flex-direction: row;
  height: 40px;
  margin-bottom: 20px;
  padding-right: 50px;
`;

const ScheduleWrapper = styled.div`
margin-top: 20px;
  grid-area: schedule;
`;

const KeyWrapper = styled.div`
  grid-area: key;
`;

const Body = styled.div`
  display: grid;
  grid-template-areas:
    "title title"
    "head key"
    "search key"
    "schedule schedule";
  grid-template-columns: 4fr 1fr;
  grid-template-rows: 1fr 3fr 1fr auto;
  margin: auto auto;
  padding: 2em;
  max-width: 1200px;
  min-width: 750px;
  height: 100%;
  padding-bottom: 150px;
`;

const Head = styled.div`
  grid-area: head;
  padding-right: 50px;
`;

class App extends React.Component<{}, AppState> {
  private lookaheadOptions = [30, 60, 90, 120, 240];

  constructor(props) {
    super(props);
    this.state = {
      station: null,
      searchReady: false,
      lookahead: 90,
    };
  }

  onStationChange = (station: Station) => {
    this.setState({ station });
  };

  onLookaheadChange = (lookahead: number) => {
    this.setState({ lookahead });
  };

  onSearchReady = () => {
    this.setState({ searchReady: true });
  };

  render() {
    const { lookahead, station, searchReady } = this.state;

    return (
      <Body className="rail">
        <h1>React - Irish Rail Times</h1>
        <Head>
          <blockquote className="blockquote">
            <p>The train times for Irish Rail stations</p>
            <footer className="blockquote-footer">
              This app was created using React as a personal learning
              experience, as a result, it's probably more complicated than it
              needs to be!
              <br />
              If the times never load or if the data displayed is gibberish,
              there may be either no trains available or the API proxy cannot be
              reached.
            </footer>
          </blockquote>
        </Head>
        <KeyWrapper>
          <JourneyKey/>
        </KeyWrapper>
        <SearchWrapper>
          <StationSearch
            onSearchReady={this.onSearchReady}
            station={this.state.station}
            onStationChange={this.onStationChange}
          />
          {searchReady ? (
            <SearchParameters
              lookaheadOptions={this.lookaheadOptions}
              lookahead={lookahead}
              onLookaheadChange={this.onLookaheadChange}
            />
          ) : null}
        </SearchWrapper>
        <ScheduleWrapper>
          <Schedule station={station} lookahead={lookahead} />
        </ScheduleWrapper>
      </Body>
    );
  }
}

declare let module: object;

export default hot(module)(App);
