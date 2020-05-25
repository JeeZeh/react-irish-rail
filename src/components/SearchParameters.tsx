import * as React from "react";
import styled from "styled-components";
import { SearchHeading } from "./App";

interface SearchParamerersProps {
  lookaheadOptions: number[];
  lookahead: number;
  onLookaheadChange: (lookahead: number) => void;
}

const RadioSelect = styled.div`
  display: inline-flex;
  flex-direction: row;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  background-color: whitesmoke;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  grid-area: paramsbar;
  overflow: hidden;
  user-select: none;
`;

const RadioButton = styled.button<{ selected?: boolean }>`
  font-size: 1em;
  display: flex;
  align-items: center;
  font-weight: bold;
  overflow: hidden;
  color: ${(p) => (p.selected ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.6)")};
  background-color: ${(p) => (p.selected ? "#fff" : "inherit")};
  padding: 8px;
  cursor: pointer;
  border: none;
  outline: none;
`;

export const SearchParameters = (props: SearchParamerersProps) => {
  const { lookaheadOptions } = props;

  const handleClick = (e) => {
    const newValue = parseInt(e.target.getAttribute("data-value"));
    if (props.lookahead !== newValue) {
      props.onLookaheadChange(newValue);
    }
  };

  return (
    <div>
      <SearchHeading>In the next</SearchHeading>
      <RadioSelect>
        {lookaheadOptions.map((o, i) => {
          return (
            <RadioButton
              key={i}
              selected={props.lookahead === o}
              onClick={handleClick}
              data-value={o}
            >
              {o} mins
            </RadioButton>
          );
        })}
      </RadioSelect>
    </div>
  );
};
