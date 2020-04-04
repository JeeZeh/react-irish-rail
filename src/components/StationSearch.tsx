import * as React from "react";
import * as Fuse from "fuse.js/dist/fuse";
import IrishRailApi, { Station } from "../api/IrishRailApi";
import { FuzzyOverlay } from "./FuzzyOverlay";

export interface StationSearchState {
  isLoaded: boolean;
  stationList: Station[];
  fuseMatch: Fuse.FuseResult<Station>[];
  input: string;
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
    threshold: 0.6,
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

  handleChange = (e) => {
    const pattern = e.target.value;
    this.setState({ input: pattern, fuseMatch: this.fuse.search(pattern) });
  };

  handleFuzzySelect = (refIndex: number) => {
    this.setState({ input: "", fuseMatch: this.fuse.search("") });
    this.props.onStationChange(this.state.stationList[refIndex]);
  };

  render() {
    const { isLoaded, error } = this.state;
    if (!isLoaded) return <div>loading station select</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <div>
        <input
          onChange={this.handleChange}
          value={this.state.input}
          placeholder="Type a station name"
        />
        <FuzzyOverlay
          onFuzzySelect={this.handleFuzzySelect}
          fuzzyList={this.state.fuseMatch}
        />
      </div>
    );
  }
}
