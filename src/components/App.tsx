import * as React from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import styled from "styled-components";

import ScheduleContainer from "./ScheduleContainer";
import StationSearch from "./StationSearch";
import { Station } from "../api/IrishRailApi";
import { SearchParameters } from "./SearchParameters";

interface AppState {
  station: Station;
  searchReady: boolean;
  lookahead: number;
}

const SearchWrapper = styled.div`
  display: inline-flex;
  flex-direction: row;
  height: 40px;
  margin-bottom: 20px;
`;

const Body = styled.div`
margin: auto auto;
  padding: 2em;
  max-width: 1200px;
  min-width: 750px;
  height: 100%;
  padding-bottom: 150px;
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
    console.log(station);
    this.setState({ station });
  };

  onLookaheadChange = (lookahead: number) => {
    console.log(lookahead);
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
        <blockquote className="blockquote">
          <p>The train times for Irish Rail stations</p>
          <footer className="blockquote-footer">
            This app was created using React as a personal learning experience,
            as a result, it's probably more complicated than it needs to be!
            <br />
            If the times never load or if the data displayed is gibberish, there
            may be either no trains available or the API proxy cannot be
            reached.
          </footer>
        </blockquote>
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
        <ScheduleContainer station={station} lookahead={lookahead} />
      </Body>
    );
  }
}

declare let module: object;

export default hot(module)(App);
