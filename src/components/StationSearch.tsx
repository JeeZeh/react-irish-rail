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
  hasFocus: boolean;
  error: any;
}

export interface StationSearchProps {
  station: Station;
  onSearchReady: () => void;
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

  private fuse;

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      stationList: null,
      fuseMatch: null,
      input: "",
      hasFocus: false,
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
    this.props.onSearchReady();
  }

  handleKeyDown = (e) => {
    const { cursor, fuseMatch } = this.state;
    // Up Arrow
    if (e.keyCode === 38 && cursor > 0) {
      this.setState((prevState) => ({
        cursor: prevState.cursor - 1,
      }));
    } // Down Arrow
    else if (e.keyCode === 40 && cursor < fuseMatch.length - 1) {
      this.setState((prevState) => ({
        cursor: prevState.cursor + 1,
      }));
    } else if (e.keyCode === 13) {
      const selection =
        fuseMatch.length === 1
          ? fuseMatch[0].refIndex
          : fuseMatch[cursor].refIndex;
      this.handleFuzzySelect(selection);
    }
  };

  handleChange = (e) => {
    const pattern = e.target.value;
    this.setState({
      input: pattern,
      fuseMatch: this.fuse.search(pattern).slice(0, 10),
      cursor: -1,
    });
  };

  handleFuzzySelect = (refIndex: number) => {
    this.setState({ input: "", fuseMatch: [], cursor: -1 });
    this.props.onStationChange(this.state.stationList[refIndex]);
  };

  private Search = styled.div`
    width: 400px;
    margin-bottom: 20px;
    height: 100%;
  `;

  private Input = styled.input`
    width: 100%;
    height: 100%;
    background: whitesmoke;
    padding: 10px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    outline: none;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
    transition: all 0.1s ease-out;

    &:focus {
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.6);
      transition: all 0.05s ease-out;
    }
  `;

  render() {
    const { isLoaded, error, fuseMatch, cursor, hasFocus } = this.state;
    if (!isLoaded) return null;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <this.Search>
        <this.Input
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          value={this.state.input}
          onFocus={() => this.setState({ hasFocus: true })}
          onBlur={() => this.setState({ hasFocus: false, cursor: 0 })}
          placeholder="Type a station name"
        />
        {hasFocus ? (
          <FuzzyOverlay
            onFuzzySelect={this.handleFuzzySelect}
            fuzzyList={fuseMatch}
            cursor={cursor}
          />
        ) : null}
      </this.Search>
    );
  }
}
