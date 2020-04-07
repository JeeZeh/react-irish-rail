import * as React from "react";
import { Station } from "../api/IrishRailApi";
import styled from "styled-components";
import { FuseResult } from "fuse.js";

export interface FuzzyOverlayProps {
  fuzzyList: FuseResult<Station>[];
  cursor: number;
  onFuzzySelect: (refIndex: number) => void;
}


const Fuzzy = styled.div`
  position: relative;
  z-index: 1;
  background: white;
  width: 100%;
  border: 1px rgba(0, 0, 0, 0.2) solid;
  border-top: none;
  border-radius: 0 0 5px 5px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
`;

const FuzzyItem = styled.div`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background: whitesmoke;
  }
`;

export const FuzzyOverlay = (props: FuzzyOverlayProps) => {
  const handleClick = (e) => {
    props.onFuzzySelect(e.target.getAttribute("data-index"));
  };

  if (!props.fuzzyList || props.fuzzyList.length == 0) return null;
  return (
    <Fuzzy>
      {props.fuzzyList.map((e, i) => (
        <FuzzyItem
          onClick={handleClick}
          key={e.refIndex}
          data-index={e.refIndex}
          className={props.cursor === i ? "active" : null}
        >
          {e.item.StationDesc}
        </FuzzyItem>
      ))}
    </Fuzzy>
  );
};
