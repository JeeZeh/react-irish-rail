import * as React from "react";
import { useContext } from "react";
import { Station } from "../api/IrishRailApi";
import styled, { ThemeContext } from "styled-components";
import { FuseResult } from "fuse.js";
import { Fade } from "./JourneyMap";
import { FixedSizeList as List } from "react-window";
import { useWindowSize } from "../hooks/useWindowSize";

export interface FuzzyOverlayProps {
  fuzzyList: FuseResult<Station>[];
  cursor: number;
  onFuzzySelect: (refIndex: number) => void;
}

export const ListItem = styled.div<{ active?: boolean }>`
  padding: 10px;
  cursor: pointer;
  background-color: ${(p) => (p.active ? p.theme.veryFaint : "inherit")};

  &:hover {
    background-color: ${(p) => p.theme.faint};
  }
`;

const FuzzyList = styled.div<{ isPortable?: boolean }>`
  position: relative;
  border: 1px solid ${(p) => p.theme.subtle};
  overflow: hidden;
  border-radius: ${(p) => (p.isPortable ? "5px" : "0 0 5px 5px")};
  box-shadow: 0 2px 2px ${(p) => p.theme.shadow};
  position: absolute;
  ${(p) => (p.isPortable ? "bottom" : "top")}: 100%;
  ${(p) => (!p.isPortable ? "border-top: none" : "")};
  background-color: ${(p) => p.theme.nearlyBg};
  z-index: 2;
  width: 100%;

  .scroller {
    overscroll-behavior: contain;
  }
`;

export const FuzzyOverlay = (props: FuzzyOverlayProps) => {
  const isPortable = useWindowSize().width <= 1000;
  const themeContext = useContext(ThemeContext);

  const handleClick = (e) => {
    props.onFuzzySelect(e.target.getAttribute("data-index"));
  };

  const { fuzzyList, cursor } = props;

  const Item = ({ index, style }) => {
    const station: FuseResult<Station> = fuzzyList[index];
    return (
      <ListItem
        active={props.cursor === index}
        onClick={handleClick}
        style={style}
        key={station.refIndex}
        data-index={station.refIndex}
      >
        {station.item.StationDesc}
      </ListItem>
    );
  };

  if (!fuzzyList || fuzzyList.length === 0) return null;

  return (
    <FuzzyList isPortable={isPortable}>
      {isPortable ? (
        <Fade
          side="top"
          size={props.fuzzyList.length < 3 ? "0px" : "20px"}
          backgroundColor={themeContext.nearlyBg}
        />
      ) : null}
      <List
        height={Math.min(isPortable ? 120 : 300, props.fuzzyList.length * 40)}
        itemCount={props.fuzzyList.length}
        itemSize={40}
        width={"100%"}
        className="scroller"
      >
        {Item}
      </List>
      {isPortable ? (
        <Fade
          side="bottom"
          size={props.fuzzyList.length < 3 ? "0px" : "20px"}
          backgroundColor={themeContext.nearlyBg}
        />
      ) : null}
    </FuzzyList>
  );
};
