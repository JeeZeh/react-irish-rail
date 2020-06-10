import * as React from "react";
import { Station } from "../api/IrishRailApi";
import styled from "styled-components";
import { FuseResult } from "fuse.js";
import { Fade } from "./JourneyMap";
import { FixedSizeList as List } from "react-window";
import { useWindowSize } from "../hooks/useWindowSize";
import { lightGrey, lightBlack, darkGrey, subtleGrey } from "./SharedStyles";

export interface FuzzyOverlayProps {
  fuzzyList: FuseResult<Station>[];
  cursor: number;
  onFuzzySelect: (refIndex: number) => void;
}

export const ItemList = styled.div<{ isPortable?: boolean }>`
  background: white;
  position: relative;
  border: 1px solid ${subtleGrey};
  overflow: hidden;
  border-radius: ${(p) => (p.isPortable ? "5px" : "0 0 5px 5px")};
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
`;

export const ListItem = styled.div<{ active?: boolean }>`
  padding: 10px;
  cursor: pointer;
  ${(p) => (p.active ? "background-color: #eee;" : "")};

  &:hover {
    background: whitesmoke;
  }
`;

const FuzzyList = styled(ItemList)<{ isPortable?: boolean }>`
  position: absolute;
  ${(p) => (p.isPortable ? "bottom" : "top")}: 100%;
  ${(p) => (!p.isPortable ? "border-top: none" : "")};

  z-index: 2;
  width: 100%;
`;

export const FuzzyOverlay = (props: FuzzyOverlayProps) => {
  const isPortable = useWindowSize().width <= 1000;

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
        <Fade side="top" size={props.fuzzyList.length < 3 ? "0px" : "20px"} />
      ) : null}
      <List
        height={Math.min(isPortable ? 120 : 300, props.fuzzyList.length * 40)}
        itemCount={props.fuzzyList.length}
        itemSize={40}
        width={"100%"}
      >
        {Item}
      </List>
      {isPortable ? (
        <Fade
          side="bottom"
          size={props.fuzzyList.length < 3 ? "0px" : "20px"}
        />
      ) : null}
    </FuzzyList>
  );
};
