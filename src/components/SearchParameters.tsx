import * as React from "react";
import styled from "styled-components";
import { useWindowSize } from "../hooks/useWindowSize";

interface SearchParamerersProps {
  lookaheadOptions: number[];
  lookahead: number;
  onLookaheadChange: (lookahead: number) => void;
}

const RadioSelect = styled.div<{ isPortable?: boolean }>`
  display: inline-flex;
  flex-direction: row;
  border: 1px solid ${(p) => p.theme.button};
  border-radius: 0 0 5px 5px;
  border-top-color: ${(p) => p.theme.subtle};
  background-color: ${(p) => p.theme.veryFaint};
  grid-area: paramsbar;
  justify-content: space-evenly;
  width: 100%;
  height: 50px;
  max-width: 400px;
  overflow: hidden;
  user-select: none;
  z-index: 1;
  box-shadow: ${(p) => (!p.isPortable ? `0 4px 4px ${p.theme.shadow}` : null)};
  ${(p) => (!p.isPortable ? "position: relative" : null)};
`;

const RadioButton = styled.button<{ selected?: boolean }>`
  font-size: 1em;
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
  font-weight: bold;
  overflow: hidden;
  color: ${(p) => (p.selected ? p.theme.secondaryText : p.theme.lightEmphasis)};
  background-color: ${(p) => (p.selected ? p.theme.offMax : "inherit")};
  padding: 8px;
  cursor: pointer;
  border: none;
  outline: none;

  @media only screen and (max-width: 400px) {
    font-size: 0.8em;
    padding: 5px;
  }
`;

export const SearchParameters = (props: SearchParamerersProps) => {
  const { lookaheadOptions } = props;
  const isPortable = useWindowSize().width <= 1000;

  const handleClick = (e) => {
    const newValue = parseInt(e.target.getAttribute("data-value"));
    if (props.lookahead !== newValue) {
      props.onLookaheadChange(newValue);
    }
  };

  return (
    <RadioSelect isPortable={isPortable}>
      {lookaheadOptions.map((o, i) => {
        return (
          <RadioButton
            key={i}
            selected={props.lookahead === o}
            onClick={handleClick}
            data-value={o}
            name={`Select ${o} minutes lookahead`}
          >
            {o} mins
          </RadioButton>
        );
      })}
    </RadioSelect>
  );
};
