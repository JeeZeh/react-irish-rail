import * as React from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Station } from "./IrishRailApi";

class StationSearch extends React.Component<
  {},
  {
    isLoaded: boolean;
    stationList: Station[];
    error: any;
  }
> {
  
  constructor(props) {
    super(props);
    this.state = {
        isLoaded: false,
        stationList: null,
        error: null
    };
  }
    componentDidMount() {
    IrishRailApi.getStations()
      .then((stationList) => this.setState({ isLoaded: true, stationList }))
      .catch((error) => this.setState({ isLoaded: true, error }));
  }

  render() {
    const { isLoaded, stationList, error } = this.state;
    if (!isLoaded) return <div>loading station select</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <select>
        {stationList.map((s) => (
          <option key={s.StationCode}>{s.StationDesc}</option>
        ))}
      </select>
    );
  }
}

export default hot(module)(StationSearch);
