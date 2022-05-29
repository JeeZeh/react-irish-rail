import React from "react"
import styled from "styled-components";
import { ItemButton } from "./CollapsibleItemList";
import { Moon, Coffee } from "react-feather";
import { useWindowSize } from "../hooks/useWindowSize";

const AppOptionsWrapper = styled.div<{ vertical?: boolean }>`
  display: flex;
  flex-direction: ${(p) => (p.vertical ? "column" : "row")};
  justify-content: space-between;
  & svg {
    transition: fill 0.2s ease-out;
    fill: none;
  }
`;

export const AppOptions = (props: { handleThemeSwitch: (e) => void }) => {
  const isPortable = useWindowSize().width <= 1000;

  return (
    <AppOptionsWrapper vertical={isPortable}>
      <ItemButton onClick={props.handleThemeSwitch}>
        <Moon size={28} />
        <div>Switch Theme</div>
      </ItemButton>
      <ItemButton
        onClick={() => window.open("https://ko-fi.com/jesseash", "_blank")}
      >
        <Coffee size={28} />
        <div>Buy me a Ko-Fi</div>
      </ItemButton>
    </AppOptionsWrapper>
  );
};
