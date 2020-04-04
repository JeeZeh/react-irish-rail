import * as React from "react";
import { hot } from "react-hot-loader";
import "./../assets/scss/App.scss";
import ScheduleContainer from "./ScheduleContainer";
import StationSearch from "./StationSearch";
import { Station } from "./IrishRailApi";

interface AppState {
  station: Station;
}

class App extends React.Component<{}, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      station: null,
    };
  }

  onStationChange = (station: Station) => {
    this.setState({ station });
  };

  render() {
    return (
      <div className="rail">
        <h1>React - Irish Rail Times</h1>
        <blockquote className="blockquote">
          <p>The train times for Connolly - and hopefully more soon.</p>
          <footer className="blockquote-footer">
            This app was created using React as a personal learning experience,
            as a result, it's far more complicated than it needs to be!
            <br />
            If the times never load, there may be either no trains available or
            the API proxy cannot be reached.
          </footer>
        </blockquote>
        <StationSearch
          station={this.state.station}
          onStationChange={this.onStationChange}
        />
        <ScheduleContainer station={this.state.station} />
      </div>
    );
  }
}

declare let module: object;

export default hot(module)(App);
