import * as React from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Station } from "./IrishRailApi";

export interface StationSearchState {
  isLoaded: boolean;
  stationList: Station[];
  error: any;
}

export interface StationSearchProps {
  station: Station,
  onStationChange: (station: Station) => void
}

class StationSearch extends React.Component<StationSearchProps, StationSearchState> {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      stationList: null,
      error: null,
    };
  }

  componentDidMount() {
    IrishRailApi.getStations()
      .then((stationList) => this.setState({ isLoaded: true, stationList }))
      .catch((error) => this.setState({ isLoaded: true, error }));
  }

  handleChange = (e) => {
    const { stationList } = this.state;
    const index = e.target.options.selectedIndex;
    const code = e.target.value;
    let chosenStation = stationList.find((s) => s.StationCode === code);
    if (code) this.props.onStationChange(chosenStation);
  }

  render() {
    const { isLoaded, stationList, error } = this.state;
    if (!isLoaded) return <div>loading station select</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <select
        value={this.props.station?.StationCode}
        onChange={this.handleChange}
      >
        {stationList.map((s) => (
          <option key={s.StationCode} value={s.StationCode}>
            {s.StationDesc}
          </option>
        ))}
      </select>
    );
  }
}

export default hot(module)(StationSearch);
