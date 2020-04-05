import * as React from "react";
import * as Fuse from "fuse.js/dist/fuse";
import IrishRailApi, { Station } from "../api/IrishRailApi";
import styled from "styled-components";
import { FuzzyOverlay } from "./FuzzyOverlay";

export interface StationSearchState {
  isLoaded: boolean;
  stationList: Station[];
  fuseMatch: Fuse.FuseResult<Station>[];
  input: string;
  cursor: number;
  error: any;
}

export interface StationSearchProps {
  station: Station;
  onStationChange: (station: Station) => void;
}

export default class StationSearch extends React.Component<
  StationSearchProps,
  StationSearchState
> {
  private FUSE_OPTIONS = {
    isCaseSensitive: false,
    findAllMatches: false,
    includeMatches: false,
    includeScore: false,
    useExtendedSearch: false,
    minMatchCharLength: 1,
    shouldSort: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    keys: ["StationDesc", "StationCode"],
  };
  private width = "400px";

  private fuse;

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      stationList: null,
      fuseMatch: null,
      input: "",
      cursor: -1,
      error: null,
    };
  }

  async componentDidMount() {
    await IrishRailApi.getStations()
      .then((stationList) =>
        this.setState({
          isLoaded: true,
          stationList,
        })
      )
      .catch((error) => this.setState({ isLoaded: true, error }));
    this.fuse = new Fuse(this.state.stationList, this.FUSE_OPTIONS);
  }

  handleKeyDown = (e) => {
    const { cursor, fuseMatch } = this.state;
    // arrow up/down button should select next/previous list element
    if (e.keyCode === 38 && cursor > 0) {
      this.setState((prevState) => ({
        cursor: prevState.cursor - 1,
      }));
    } else if (e.keyCode === 13) {
      this.handleFuzzySelect(this.state.fuseMatch[cursor].refIndex)
    }
    else if (e.keyCode === 40 && cursor < fuseMatch.length - 1) {
      this.setState((prevState) => ({
        cursor: prevState.cursor + 1,
      }));
    }
  };


  handleChange = (e) => {
    const pattern = e.target.value;
    this.setState({ input: pattern, fuseMatch: this.fuse.search(pattern), cursor: -1 });
  };

  handleFuzzySelect = (refIndex: number) => {
    this.setState({ input: "", fuseMatch: this.fuse.search(""), cursor: -1 });
    this.props.onStationChange(this.state.stationList[refIndex]);
  };

  private Search = styled.div`
    width: ${this.width};
    margin-bottom: 20px;
  `;

  private Input = styled.input`
    width: 100%;
    background: whitesmoke;
    padding: 10px;
    border: none;
    border-radius: 5px;
    outline: none;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  `;

  render() {
    const { isLoaded, error, fuseMatch, cursor } = this.state;
    if (!isLoaded) return null;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <this.Search>
        <this.Input
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          value={this.state.input}
          placeholder="Type a station name"
        />
        <FuzzyOverlay
          onFuzzySelect={this.handleFuzzySelect}
          fuzzyList={fuseMatch}
          width={this.width}
          cursor={cursor}
        />
      </this.Search>
    );
  }
}
