import * as React from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Station } from "../api/IrishRailApi";
import styled from "styled-components";
import ScheduleTable from "./ScheduleTable";

export interface SearchParamerersProps {
  lookaheadIndex: number;
  lookahead: number[];
  onLookaheadChange: (lookahead: number) => void;
}

export const SearchParameters = (props: SearchParamerersProps) => {
    return (
        <div>Params</div>
    )
}
