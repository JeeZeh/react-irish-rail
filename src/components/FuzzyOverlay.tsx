import * as React from "react";
import { Station } from "../api/IrishRailApi";
import styled from "styled-components";
import { FuseResult } from "fuse.js";

export interface FuzzyOverlayProps {
  fuzzyList: FuseResult<Station>[];
  cursor: number;
  onFuzzySelect: (refIndex: number) => void;
}

export const ItemList = styled.div`
  background: white;
  border: 1px rgba(0, 0, 0, 0.2) solid;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
`;

export const ListItem = styled.div`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background: whitesmoke;
  }

  &.active {
    background-color: #eee;
  }
`;

const FuzzyList = styled(ItemList)`
  position: absolute;
  border-top: none;

  z-index: 2;
  width: 100%;
`;

export const FuzzyOverlay = (props: FuzzyOverlayProps) => {
  const handleClick = (e) => {
    props.onFuzzySelect(e.target.getAttribute("data-index"));
  };

  if (!props.fuzzyList || props.fuzzyList.length === 0) return null;
  return (
    <FuzzyList>
      {props.fuzzyList.map((e, i) => (
        <ListItem
          onClick={handleClick}
          key={e.refIndex}
          data-index={e.refIndex}
          className={props.cursor === i ? "active" : null}
        >
          {e.item.StationDesc}
        </ListItem>
      ))}
    </FuzzyList>
  );
};
