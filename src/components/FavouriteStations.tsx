import * as React from "react";
import { useState } from "react";
import { JourneyButton } from "./MobileTrainCard";
import { Heart, ChevronsDown } from "react-feather";
import styled from "styled-components";
import { smallify } from "./JourneyStop";
import Collapsible from "react-collapsible";
import { H3A } from "./SharedStyles";
import { useWindowSize } from "../hooks/useWindowSize";

export const Prompt = styled.p<{ isPortable?: boolean }>`
  max-width: 320px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: ${(p) => p.theme.subtle};
  margin: ${(p) => (p.isPortable ? "auto" : "0")};

  & svg {
    margin: 0 5px;
  }
`;

const ListWrap = styled.div<{ isPortable?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  padding: ${(p) => (p.isPortable ? "0 15px 15px 15px" : "5px 0")};
`;

export const OpenFavouriteStationButton = styled(JourneyButton)<{
  isPortable?: boolean;
}>`
  grid-area: none;
  display: flex;
  width: auto;
  box-shadow: none;
  margin: 5px;
  height: 40px;
  background-color: ${(p) => p.theme.nearlyBg};
  transition: box-shadow 0.2s ease-out, opacity 0.2s ease-out;
  box-shadow: ${(p) => (!p.isPortable ? `0 2px 0 ${p.theme.button};` : null)};
  opacity: 1;

  &:hover {
    opacity: ${(p) => (!p.isPortable ? 0.8 : 1)};
  }
`;

const CollapseWrap = styled.div<{ isPortable?: boolean }>`
  justify-self: ${(p) => (p.isPortable ? "center" : "flex-start")};
  border: ${(p) => (p.isPortable ? `1px solid ${p.theme.faint}` : null)};
  background-color: ${(p) => (p.isPortable ? p.theme.offMax : "inherit")};
  outline: none;
  border-radius: 5px;
  width: ${(p) => (p.isPortable ? "100%" : "330px")};
  box-shadow: ${(p) => (p.isPortable ? `0 2px 2px ${p.theme.shadow}` : null)};
`;

const CollapseHeader = styled.div<{ open?: boolean; isPortable?: boolean }>`
  display: flex;
  cursor: ${(p) => (p.isPortable ? "pointer" : "default")};
  justify-content: space-between;
  padding: ${(p) => (p.isPortable ? "15px 20px" : 0)};
  align-items: center;
  color: ${(p) => p.theme.primaryText};
  height: ${(p) => (p.isPortable ? "60px" : "auto")};
  & > div {
    display: flex;
    align-items: center;
    transform: ${(p) => (p.open ? "rotate(180deg)" : null)};
    transition: transform 0.18s ease-out;
    margin-left: 10px;
  }
`;

const FavouritesCollapseHeader = styled(H3A)`
  @media only screen and (max-width: 400px) {
    font-size: 1.2em;
  }
`;

export const FavouriteStations = (props: {
  onFavouriteSelect: (e) => void;
  forceOpen?: boolean;
  favourites: string[];
}) => {
  const { onFavouriteSelect, forceOpen, favourites } = props;
  const isPortable = useWindowSize().width <= 1000;
  const [open, setOpen] = useState(forceOpen ?? false);
  const handleClick = (e) => {
    onFavouriteSelect(e);
    setOpen(false);
  };

  return (
    <CollapseWrap isPortable={isPortable}>
      <Collapsible
        open={isPortable ? open : true}
        triggerDisabled={forceOpen ?? false}
        onOpening={() => setOpen(true)}
        onClosing={() => setOpen(false)}
        trigger={
          <CollapseHeader open={open} isPortable={isPortable}>
            <FavouritesCollapseHeader weight={700}>
              Favourite Stations
            </FavouritesCollapseHeader>
            {!forceOpen && (
              <div>
                <ChevronsDown size={30} />
              </div>
            )}
          </CollapseHeader>
        }
        transitionTime={180}
        easing={"ease-out"}
      >
        <ListWrap isPortable={isPortable}>
          {favourites.map((f, i) => (
            <OpenFavouriteStationButton
              key={i}
              onClick={handleClick}
              children={smallify(f)}
            />
          ))}
          {favourites.length === 0 && (
            <Prompt isPortable={isPortable}>
              Favourite <Heart size={16} /> a station to see it here
            </Prompt>
          )}
        </ListWrap>
      </Collapsible>
    </CollapseWrap>
  );
};
