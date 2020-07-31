import * as React from "react";
import styled, { ThemeContext } from "styled-components";
import { ItemButton } from "./CollapsibleItemList";
import { Moon } from "react-feather";

const AppOptionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  & svg {
    transition: fill 0.2s ease-out;
    fill: none;
  }
`;

export const AppOptions = (props: { handleThemeSwitch: (e) => void }) => {
  return (
    <AppOptionsWrapper>
      <ItemButton onClick={props.handleThemeSwitch}>
        <Moon size={32} />
        <div>Switch Theme</div>
      </ItemButton>
    </AppOptionsWrapper>
  );
};
