import * as React from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Station } from "../api/IrishRailApi";
import styled from "styled-components";
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

  Card = styled.div`box-shadow: 0 5px 5px rgba(0,0,0,0.2);`

  render() {
    const { error, isLoaded, stationData } = this.state;
    const { station } = this.props;
    if (!station) return null;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <this.Card className="card mb-4">
        <div className="card-body">
          <div className="card-header">
            <h5>{this.props.station.StationDesc} Timetable</h5>
          </div>
          {isLoaded ? <ScheduleTable trainData={stationData} /> : null}
        </div>
      </this.Card>
    );
  }
}

export default hot(module)(ScheduleContainer);
