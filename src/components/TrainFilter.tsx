import * as React from "react";
import Select from "react-select";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useWindowSize } from "../hooks/useWindowSize";
import { Station } from "../api/IrishRailApi";

const FilterSelect = styled(Select)<{ isPortable: boolean }>`
  margin: 10px;
  .select__control {
    background: ${(p) => p.theme.offMax};
    color: ${(p) => p.theme.primaryText};
    font-size: 0.95em;
    border: 1px solid ${(p) => p.theme.button};
    border-radius: 5px;
    outline: none;
    transition: all 0.1s ease-out;
  }

  .select__menu {
    background: ${(p) => p.theme.veryFaint};
    cursor: pointer;
    background-color: ${(p) => p.theme.nearlyBg};
    overscroll-behavior: contain !important;
  }

  .select__option:hover,
  .select__option--is-focused {
    background-color: ${(p) => p.theme.faint};
  }

  .select__multi-value {
    background-color: ${(p) => p.theme.veryFaint};
    color: ${(p) => p.theme.secondaryText};
  }

  .select__multi-value__label {
    color: ${(p) => p.theme.secondaryText};
  }
`;

interface FilterValue {
  label: string;
  value: Set<string>;
}

interface TrainFilterProps {
  currentStation: Station;
  stationToTrainMap: Map<string, Set<string>>;
  onTrainFilter: (trainCodes: string[]) => void;
}

/**
 * Takes a list of reachable trains from the current station, returns a dropdown
 * component to filter them and send the filters back up to the schedule
 */
export const TrainFilter = (props: TrainFilterProps) => {
  const { onTrainFilter, stationToTrainMap, currentStation } = props;
  const isPortable = useWindowSize().width < 1000;
  Select;
  const [filters, setFilters] = useState<FilterValue[]>();
  // Remove duplicate destinations and sort by name

  useEffect(() => {
    if (!filters || !stationToTrainMap) onTrainFilter([]);
    else {
      const filterSet = new Set<string>();

      filters.forEach((stationSet) =>
        stationSet.value.forEach((s) => filterSet.add(s))
      );

      onTrainFilter(Array.from(filterSet));
    }
  }, [filters]);

  useEffect(() => {
    if (currentStation) {
      setFilters([]);
    }
  }, [currentStation]);

  return (
    <FilterSelect
      isPortable={isPortable}
      placeholder="Filter by Destination"
      value={filters}
      onChange={setFilters}
      options={Array.from(stationToTrainMap, ([label, value]) => ({
        label,
        value,
      }))}
      isMulti={true}
      classNamePrefix="select"
    />
  );
};
