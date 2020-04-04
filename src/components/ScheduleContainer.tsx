import * as React from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Station } from "./IrishRailApi";
import ScheduleTable from "./ScheduleTable";


export interface TrainScheduleState {
  error: any;
  isLoaded: boolean;
  stationData: Train[];
}

export interface TrainScheduleProps {
  station: Station;
}

class ScheduleContainer extends React.Component<
  TrainScheduleProps,
  TrainScheduleState
> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      stationData: [],
    };
  }

  componentDidMount() {
    this.fetchStationData();
  }

  componentDidUpdate(prevProps: TrainScheduleProps) {
    if (prevProps.station?.StationCode !== this.props.station?.StationCode) {
      this.fetchStationData();
    }
  }

  fetchStationData() {
    if (!this.props.station) return;

    IrishRailApi.getTrainsForStation(this.props.station)
      .then((r) => this.setState({ isLoaded: true, stationData: r }))
      .catch((error) => this.setState({ isLoaded: true, error }));
  }

  cleanData(train: Train) {
    if (train.Destination === train.Stationfullname) {
      train.Expdepart = "";
    }
    if (train.Origin === train.Stationfullname) {
      train.Exparrival = "";
    }
    return train;
  }

  render() {
    const { error, isLoaded, stationData } = this.state;
    const { station } = this.props;
    if (!station) return <div></div>;
    if (!isLoaded) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <div className="card border-secondary mb-4">
        <div className="card-body">
          <div className="card-header">
            {this.props.station.StationDesc} Train Times
          </div>
          <ScheduleTable trainData={stationData} />
        </div>
      </div>
    );
  }
}

export default hot(module)(ScheduleContainer);
