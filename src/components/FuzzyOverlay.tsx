import * as React from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Station } from "../api/IrishRailApi";
import ScheduleTable from "./ScheduleTable";
import { FuseResult } from "fuse.js";

export interface FuzzyOverlayProps {
  fuzzyList: FuseResult<Station>[];
  onFuzzySelect: (refIndex: number) => void;
}

export const FuzzyOverlay = (props: FuzzyOverlayProps) => {
  const handleClick = (e) => {
    props.onFuzzySelect(e.target.getAttribute("data-index"));
  };

  if (!props.fuzzyList) return <div>empty</div>;
  return (
    <div>
      <ul>
        {props.fuzzyList.map((e) => (
          <li onClick={handleClick} key={e.refIndex} data-index={e.refIndex}>
            {e.item.StationDesc}
          </li>
        ))}
      </ul>
    </div>
  );
};
