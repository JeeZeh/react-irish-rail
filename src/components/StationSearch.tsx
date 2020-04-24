import * as React from "react";
import * as Fuse from "fuse.js/dist/fuse";
import { Station } from "../api/IrishRailApi";
import styled from "styled-components";
import { SearchHeading } from "./App";
import { FuzzyOverlay } from "./FuzzyOverlay";

export interface StationSearchState {
  fuseMatch: Fuse.FuseResult<Station>[];
  input: string;
  cursor: number;
  hasFocus: boolean;
  mouseOver: boolean;
}

export interface StationSearchProps {
  stationList: Station[];
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

  private fuse;

  constructor(props) {
    super(props);
    this.state = {
      fuseMatch: null,
      input: "",
      hasFocus: false,
      cursor: -1,
      mouseOver: false,
    };
  }

  componentDidMount() {
    this.fuse = new Fuse(this.props.stationList, this.FUSE_OPTIONS);
  }

  private handleKeyDown = (e) => {
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
          : cursor !== -1
          ? fuseMatch[cursor].refIndex
          : null;
      if (selection) {
        this.handleFuzzySelect(selection);
      }
    }
  };

  private handleChange = (e) => {
    const pattern = e.target.value;
    this.setState({
      input: pattern,
      fuseMatch: this.fuse.search(pattern).slice(0, 10),
      cursor: -1,
    });
  };

  handleFuzzySelect = (refIndex: number) => {
    this.setState({ input: "", fuseMatch: [], cursor: -1 });
    this.props.onStationChange(this.props.stationList[refIndex]);
  };

  private Search = styled.div`
    grid-area: searchbar;
    width: 400px;
    height: 100%;
    position: relative;
  `;

  private Input = styled.input`
    width: 100%;
    background: whitesmoke;
    font-size: 0.95em;
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
    const { fuseMatch, cursor, hasFocus, mouseOver } = this.state;

    return (
      <div>
         <SearchHeading>Trains at</SearchHeading>
        <this.Search
          onFocus={() => this.setState({ hasFocus: true })}
          onBlur={() => {
            if (!mouseOver) this.setState({ hasFocus: false, cursor: 0 });
          }}
          onMouseEnter={() => this.setState({ mouseOver: true })}
          onMouseLeave={() => this.setState({ mouseOver: false })}
        >
          <this.Input
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            value={this.state.input}
            placeholder="Type a station name"
            aria-label="Input box for searching a station"
          />
          {hasFocus ? (
            <FuzzyOverlay
              onFuzzySelect={this.handleFuzzySelect}
              fuzzyList={fuseMatch}
              cursor={cursor}
            />
          ) : null}
        </this.Search>
      </div>
    );
  }
}
