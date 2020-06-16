import * as React from "react";
import styled, { ThemeContext } from "styled-components";
import { OpenFavouriteStationButton } from "./FavouriteStations";
import { Moon } from "react-feather";

const AppOptionsWrapper = styled.div`
  grid-area: options;
  display: flex;
  & svg {
    margin-left: 10px;
    transition: fill 0.2s ease-out;
    fill: none;
    stroke: ${(p) => p.theme.primaryText};
  }
`;

export const AppOptions = (props: { handleThemeSwitch: (e) => void }) => {
  return (
    <AppOptionsWrapper>
      <OpenFavouriteStationButton onClick={props.handleThemeSwitch}>
        <div>Switch Theme</div>
        <Moon size={32} />
      </OpenFavouriteStationButton>
    </AppOptionsWrapper>
  );
};
