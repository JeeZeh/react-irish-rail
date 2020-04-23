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
  lookahead: number;
}

const Card = styled.div`
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px 20px;
`;

const CardHeader = styled.div`
  font-weight: 700px;
  font-size: 1.8em;
  margin-bottom: 15px;
`;

class Schedule extends React.Component<TrainScheduleProps, TrainScheduleState> {
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
    if (
      prevProps.station?.StationCode !== this.props.station?.StationCode ||
      prevProps.lookahead !== this.props.lookahead
    ) {
      this.fetchStationData();
    }
  }

  fetchStationData() {
    const { station, lookahead } = this.props;
    if (!station) return;

    IrishRailApi.getTrainsForStation(station, lookahead)
      .then((r) => this.setState({ isLoaded: true, stationData: r }))
      .catch((error) => this.setState({ isLoaded: true, error }));
  }

  render() {
    const { error, isLoaded, stationData } = this.state;
    const { station } = this.props;
    if (!station) return null;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <Card>
        <CardHeader>{this.props.station.StationDesc}</CardHeader>
        {isLoaded ? <ScheduleTable trainData={stationData} /> : null}
      </Card>
    );
  }
}

export default hot(module)(Schedule);
