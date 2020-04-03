import * as React from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Station } from "./IrishRailApi";
import ScheduleTable from "./ScheduleTable";

export interface TrainColumn {
  dispName: string;
  propName: string;
}

class TrainSchedule extends React.Component<
  {},
  {
    error: any;
    isLoaded: boolean;
    stationData: Train[];
  }
> {
  private station: Station = {
    StationDesc: "Dublin Connolly",
    StationAlias: "Connolly",
    StationLatitude: 53.3531,
    StationLongitude: -6.24591,
    StationCode: "CNLLY",
    StationId: 10,
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      stationData: [],
    };
  }

  componentDidMount() {
    IrishRailApi.getTrainsForStation(this.station)
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
    if (error) return <div>Error: {error.message}</div>;
    if (!isLoaded) return <div>Loading...</div>;

    return (
      <div className="card border-secondary mb-4">
        <div className="card-body">
          <div className="card-header">
            {this.station.StationDesc} Train Times
          </div>
          <ScheduleTable trainData={stationData} />
        </div>
      </div>
    );
  }
}

export default hot(module)(TrainSchedule);
