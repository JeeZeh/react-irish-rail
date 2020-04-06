import * as React from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import ScheduleContainer from "./ScheduleContainer";
import StationSearch from "./StationSearch";
import { Station } from "../api/IrishRailApi";
import { SearchParameters } from "./SearchParameters";

interface AppState {
  station: Station;
  lookahead: number;
}

class App extends React.Component<{}, AppState> {
  private lookaheadOptions = [30, 60, 90, 120, 240];

  constructor(props) {
    super(props);
    this.state = {
      station: null,
      lookahead: 90,
    };
  }

  onStationChange = (station: Station) => {
    console.log(station);
    this.setState({ station });
  };

  onLookaheadChange = (lookahead: number) => {
    console.log(lookahead)
    this.setState({ lookahead });
  };

  render() {
    const { lookahead } = this.state;

    return (
      <div className="rail">
        <h1>React - Irish Rail Times</h1>
        <blockquote className="blockquote">
          <p>The train times for Irish Rail staions</p>
          <footer className="blockquote-footer">
            This app was created using React as a personal learning experience,
            as a result, it's probably more complicated than it needs to be!
            <br />
            If the times never load or if the data displayed is gibberish, there
            may be either no trains available or the API proxy cannot be
            reached.
          </footer>
        </blockquote>
        <StationSearch
          station={this.state.station}
          onStationChange={this.onStationChange}
        />
        <SearchParameters
          lookaheadOptions={this.lookaheadOptions}
          lookahead={lookahead}
          onLookaheadChange={this.onLookaheadChange}
        />

        <ScheduleContainer station={this.state.station} />
      </div>
    );
  }
}

declare let module: object;

export default hot(module)(App);
