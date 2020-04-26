import * as React from "react";
import { createRef } from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Station } from "../api/IrishRailApi";
import styled from "styled-components";
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
}

export const Card = styled.div`
  display: grid;
  grid-template-areas:
    "toolbar"
    "body";

  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px 20px;
  position: relative;
  &:focus {
    outline: none;
  }
`;

export const CardHeader = styled.h2`
  font-weight: 700;
  font-size: 1.8em;
  margin-top: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;

  & > img {
    cursor: pointer;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 8px;
    margin-right: 10px;
    width: 40px;
    height: 40px;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-out;

    &:hover {
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
  }
`;

const Error = styled.h2`
  font-weight: 700;
  text-align: center;
  margin: 100px;
  color: #777;
  user-select: none;
`;

const CardBody = styled.div`
  grid-area: body;
`;

const CardToolbar = styled.div`
  grid-area: toolbar;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const CloseButton = styled.button`
  grid-area: toolbar;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: 900;
  margin-top: 10px;

  font-size: 150%;
  outline: none;
  background: none;
  color: #aaa;

  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 8px;
  width: 40px;
  height: 40px;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-out;

  &:hover {
    color: #444;
    box-shadow: none;
  }
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
    this.schedule.current.focus();
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

  handleKeyDown = (e) => {
    console.log(e.keyCode);
    if (e.keyCode === 27) {
      this.props.handleStationClose();
    }
  };

  render() {
    const { error, isLoaded, stationData } = this.state;
    const { station, lookahead, handleStationClose } = this.props;
    if (!station) return null;
    if (error) return <div>Error: {error.message}</div>;
    if (stationData.length === 0) {
      return (
        <Card onKeyDown={this.handleKeyDown} tabIndex={0} ref={this.schedule}>
          <CardToolbar>
            <CardHeader>
              <FavouriteStar stationName={station.StationDesc} />
              {this.props.station.StationDesc}
            </CardHeader>
            <CloseButton onClick={handleStationClose}>
              <div>X</div>
            </CloseButton>
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
              {isLoaded ? <ScheduleTable trainData={stationData} /> : null}
            </CardBody>
          )}
        </Card>
      );
    }
  }
}

export default hot(module)(Schedule);
