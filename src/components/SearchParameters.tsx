import * as React from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Station } from "../api/IrishRailApi";
import styled from "styled-components";
import ScheduleTable from "./ScheduleTable";

interface SearchParamerersProps {
  lookaheadOptions: number[];
  lookahead: number;
  onLookaheadChange: (lookahead: number) => void;
}

const RadioSelect = styled.div`
  display: flex;
  flex-direction: row;

  & div {
    background-color: white;
    border-right: 1px solid rgba(0,0,0,0.4);
  }

  &:nth-child(1) {
    border: none !important ;
  }


  & .minute-selected {
    background-color: rgba(0,0,0,.08);
  }
`;

export const SearchParameters = (props: SearchParamerersProps) => {
  const { lookaheadOptions } = props;

  const handleClick = async (e) => {
    props.onLookaheadChange(parseInt(e.target.getAttribute("data-value")));
  };

  const renderLookaheadOptions = () => {
    return lookaheadOptions.map((o, i) => {
      return (
        <div
          key={i}
          className={props.lookahead === o ? "minute-selected" : ""}
          onClick={handleClick}
          data-value={o}
        >
          {o} mins
        </div>
      );
    });
  };

  return <RadioSelect>{renderLookaheadOptions()}</RadioSelect>;
};
