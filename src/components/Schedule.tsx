import * as React from "react";
import { createRef } from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Station } from "../api/IrishRailApi";
import styled from "styled-components";
import { XCircle } from "react-feather";
import ScheduleTable from "./ScheduleTable";
import { FavouriteStar } from "./FavouriteStations";

export interface TrainScheduleState {
  error: any;
  isLoaded: boolean;
  stationData: Train[];
}

export interface TrainScheduleProps {
  station: Station;
  lookahead: number;
  handleStationClose: () => void;
  isPortable: boolean;
}

export const Card = styled.div`
  display: grid;
  grid-template-areas:
    "toolbar"
    "body";

  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 20px;
  position: relative;
  &:focus {
    outline: none;
  }
`;

export const CardToolbar = styled.div`
  grid-area: toolbar;
  display: grid;
  grid-template-columns: auto 1fr auto;
  margin: 20px 0;
`;

export const CardHeader = styled.div`
  font-weight: 700;
  font-size: 1.8em;
  grid-column: 2;
  align-self: center;
  padding-left: 15px;
`;

const CardFavourite = styled.div`
  grid-column: 1;
  justify-self: center;
  align-self: center;
`;

const CardClose = styled.div`
  grid-column: 3;
  justify-self: center;
  align-self: center;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease-out;

  &:hover {
    opacity: 1;
  }
`;

const Error = styled.h2`
  font-weight: 700;
  text-align: center;
  margin: 100px;
  color: #777;
  user-select: none;
`;

export const CardBody = styled.div`
  grid-area: body;
`;

class Schedule extends React.Component<TrainScheduleProps, TrainScheduleState> {
  private schedule: React.MutableRefObject<HTMLDivElement>;
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      stationData: [],
    };
    this.schedule = createRef();
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
      .catch((error) => this.setState({ isLoaded: true, error }))
      .then((_) => this.schedule.current.focus());
  }

  handleKeyDown = (e) => {
    console.log(e.keyCode);
    if (e.keyCode === 27) {
      this.props.handleStationClose();
    }
  };

  render() {
    const { error, isLoaded, stationData } = this.state;
    const { station, lookahead, handleStationClose, isPortable } = this.props;
    if (!station || !isLoaded) return null;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <Card onKeyDown={this.handleKeyDown} tabIndex={-1} ref={this.schedule}>
        <CardToolbar>
          <CardFavourite>
            <FavouriteStar stationName={station.StationDesc} />
          </CardFavourite>
          <CardHeader>{this.props.station.StationDesc}</CardHeader>
          <CardClose>
            <XCircle onClick={handleStationClose} size={32} />
          </CardClose>
        </CardToolbar>

        {stationData.length === 0 ? (
          <CardBody>
            <Error>
              No trains due at {station.StationDesc} for the next {lookahead}{" "}
              minutes
            </Error>
          </CardBody>
        ) : (
          <CardBody>
            {isLoaded ? (
              <ScheduleTable trainData={stationData} isPortable={isPortable} />
            ) : null}
          </CardBody>
        )}
      </Card>
    );
  }
}

export default hot(module)(Schedule);
