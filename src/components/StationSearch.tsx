import * as React from "react";
import { useEffect, useState } from "react";
import * as Fuse from "fuse.js/dist/fuse";
import { Station } from "../api/IrishRailApi";
import styled from "styled-components";
import { FuzzyOverlay } from "./FuzzyOverlay";
import { useWindowSize } from "../hooks/useWindowSize";

export interface StationSearchState {
  fuseMatch: Fuse.FuseResult<Station>[];
  input: string;
  cursor: number;
  hasFocus: boolean;
  mouseOver: boolean;
  fuse: Fuse<Station, any>;
}

export interface StationSearchProps {
  stationList: Station[];
  station: Station;
  onStationChange: (station: Station) => void;
}

const Search = styled.div`
  grid-area: searchbar;
  max-width: 400px;
  position: relative;
  width: 100%;
`;

const Input = styled.input<{ isPortable?: boolean }>`
  background: ${(p) => p.theme.offMax};
  color: ${(p) => p.theme.primaryText};
  font-size: 0.95em;
  width: 100%;
  height: 50px;
  display: inline-block;
  padding: 10px;
  border: 1px solid ${(p) => p.theme.button};
  border-radius: 5px 5px 0 0;
  border-bottom: none;
  outline: none;
  box-shadow: ${(p) => (!p.isPortable ? `0 4px 4px ${p.theme.shadow}` : null)};
  transition: all 0.1s ease-out;

  &:focus {
    background-color: ${(p) => p.theme.offMax};
    border: 1px solid ${(p) => p.theme.faint};
    border-bottom: none;
    transition: all 0.05s ease-out;
  }
`;

const SearchFlex = styled.div<{ isPortable?: boolean }>`
  display: flex;
  flex-direction: ${(p) => (p.isPortable ? "column-reverse" : "column")};
`;

export const StationSearch = (props: StationSearchProps) => {
  const FUSE_OPTIONS = {
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

  const [state, setState] = useState<StationSearchState>({
    fuseMatch: null,
    fuse: null,
    input: "",
    hasFocus: false,
    cursor: -1,
    mouseOver: false,
  });

  const isPortable = useWindowSize().width <= 1000;

  useEffect(() => {
    if (props.stationList) {
      setState({ ...state, fuse: new Fuse(props.stationList, FUSE_OPTIONS) });
    }
  }, [props.stationList]);

  const handleKeyDown = (e) => {
    const { cursor, fuseMatch } = state;
    // Up Arrow
    if (e.keyCode === 38 && cursor > 0) {
      setState({ ...state, cursor: state.cursor - 1 });
    } // Down Arrow
    else if (e.keyCode === 40 && cursor < fuseMatch.length - 1) {
      setState({ ...state, cursor: state.cursor + 1 });
    } else if (e.keyCode === 13) {
      const selection =
        fuseMatch.length === 1
          ? fuseMatch[0].refIndex
          : cursor !== -1
          ? fuseMatch[cursor].refIndex
          : null;
      if (selection) {
        handleFuzzySelect(selection);
      }
    }
  };

  const handleChange = (e) => {
    const pattern = e.target.value;
    setState({
      ...state,
      input: pattern,
      fuseMatch: state.fuse.search(pattern).slice(0, 10),
      cursor: -1,
    });
  };

  const handleFuzzySelect = (refIndex: number) => {
    setState({ ...state, input: "", fuseMatch: [], cursor: -1 });
    props.onStationChange(props.stationList[refIndex]);
  };

  const { fuseMatch, cursor, hasFocus, mouseOver } = state;

  return (
    <Search
      onFocus={() => setState({ ...state, hasFocus: true })}
      onBlur={() => {
        if (!mouseOver) setState({ ...state, hasFocus: false, cursor: 0 });
      }}
      onMouseEnter={() => setState({ ...state, mouseOver: true })}
      onMouseLeave={() => setState({ ...state, mouseOver: false })}
    >
      <SearchFlex isPortable={isPortable}>
        <Input
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={state.input}
          isPortable={isPortable}
          placeholder="Type a station name"
          aria-label="Input box for searching a station"
        />
        {hasFocus ? (
          <FuzzyOverlay
            onFuzzySelect={handleFuzzySelect}
            fuzzyList={fuseMatch}
            cursor={cursor}
          />
        ) : null}
      </SearchFlex>
    </Search>
  );
};
