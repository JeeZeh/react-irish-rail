import * as React from "react";
import styled from "styled-components";
import { lightBlack, lightGrey, mediumGrey, subtleGrey } from "./SharedStyles";
import { useWindowSize } from "../hooks/useWindowSize";

interface SearchParamerersProps {
  lookaheadOptions: number[];
  lookahead: number;
  onLookaheadChange: (lookahead: number) => void;
}

const RadioSelect = styled.div<{ isPortable?: boolean }>`
  display: inline-flex;
  flex-direction: row;
  border: 1px solid ${lightGrey};
  border-radius: 0 0 5px 5px;
  border-top-color: ${subtleGrey};
  background-color: whitesmoke;
  grid-area: paramsbar;
  justify-content: space-evenly;
  width: 100%;
  height: 50px;
  max-width: 400px;
  overflow: hidden;
  user-select: none;
  z-index: 1;
  box-shadow: ${(p) => (!p.isPortable ? `0 4px 4px ${lightGrey}` : null)};
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
  color: ${(p) => (p.selected ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.6)")};
  background-color: ${(p) => (p.selected ? "#fff" : "inherit")};
  padding: 8px;
  cursor: pointer;
  border: none;
  outline: none;
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
          >
            {o} mins
          </RadioButton>
        );
      })}
    </RadioSelect>
  );
};
