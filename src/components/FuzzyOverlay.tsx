import * as React from "react";
import { Station } from "../api/IrishRailApi";
import styled from "styled-components";
import { FuseResult } from "fuse.js";

export interface FuzzyOverlayProps {
  fuzzyList: FuseResult<Station>[];
  width: string;
  onFuzzySelect: (refIndex: number) => void;
}

export const FuzzyOverlay = (props: FuzzyOverlayProps) => {
  const handleClick = (e) => {
    props.onFuzzySelect(e.target.getAttribute("data-index"));
  };

  const Fuzzy = styled.div`
    position: absolute;
    z-index: 1;
    background: white;
    width: ${props.width};
    padding: 5px;
    border: 1px black solid;
  `;

  console.log(props.fuzzyList)
  if (!props.fuzzyList || props.fuzzyList.length == 0) return <div></div>;
  return (
    <Fuzzy>
      {props.fuzzyList.map((e) => (
        <div onClick={handleClick} key={e.refIndex} data-index={e.refIndex}>
          {e.item.StationDesc}
        </div>
      ))}
    </Fuzzy>
  );
};
