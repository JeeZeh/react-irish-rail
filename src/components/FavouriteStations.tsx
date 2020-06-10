import * as React from "react";
import { useState } from "react";
import { JourneyButton } from "./MobileTrainCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Heart, ChevronsDown } from "react-feather";
import styled from "styled-components";
import { smallify } from "./JourneyStop";
import Collapsible from "react-collapsible";
import { Prompt } from "./App";
import { subtleGrey, black, lightGrey, H3A } from "./SharedStyles";
import { useWindowSize } from "../hooks/useWindowSize";

const FavouriteHeartWrapper = styled.div<{ gridColumn: number }>`
  cursor: pointer;
  grid-column: ${(p) => p.gridColumn};
  ${(p) => (p.gridColumn ? "grid-row: 1" : null)};
  opacity: 0.7;
  fill: none;
  transition: all 0.2s ease-out;
  background-color: white;
  border: 1px solid ${subtleGrey};
  height: 50px;
  width: 50px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 0 ${subtleGrey};

  &:hover {
    opacity: 1;
  }
`;

export const FavouriteHeart = (props: {
  stationName: string;
  gridColumn: number;
}) => {
  const { stationName } = props;
  const [favourites, setFavourites] = useLocalStorage<string[]>(
    "favourites",
    []
  );

  const handleFavouriteClick = (stationName: string) => {
    const favSet = new Set(favourites);
    if (favSet.has(stationName)) {
      favSet.delete(stationName);
    } else {
      favSet.add(stationName);
    }
    console.log(favSet, stationName);

    setFavourites(Array.from(favSet));
  };

  return (
    <FavouriteHeartWrapper
      className={favourites.includes(stationName) ? "on" : null}
      gridColumn={props.gridColumn}
      onClick={(_) => handleFavouriteClick(stationName)}
    >
      <Heart
        size={28}
        fill={favourites.includes(stationName) ? "pink" : null}
        opacity={favourites.includes(stationName) ? "pink" : null}
      />
    </FavouriteHeartWrapper>
  );
};

const ListWrap = styled.div<{ isPortable?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  padding: ${(p) => (p.isPortable ? "0 15px 15px 15px" : "5px 0")};
`;

const OpenFavouriteStationButton = styled(JourneyButton)<{
  isPortable?: boolean;
}>`
  grid-area: none;
  display: flex;
  width: auto;
  box-shadow: none;
  margin: 5px;
  height: 40px;
  transition: box-shadow 0.2s ease-out, opacity 0.2s ease-out;
  box-shadow: ${(p) => (!p.isPortable ? `0 2px 0 ${lightGrey}` : null)};

  opacity: 1;

  &:hover {
    opacity: 0.8;
  }
`;

const CollapseWrap = styled.div<{ isPortable?: boolean }>`
  justify-self: ${(p) => (p.isPortable ? "center" : "flex-start")};
  border: ${(p) => (p.isPortable ? `1px solid ${lightGrey}` : null)};
  outline: none;
  border-radius: 5px;
  margin-top: 10px;
  width: ${(p) => (p.isPortable ? "100%" : "330px")};

  box-shadow: ${(p) => (p.isPortable ? `0 4px 0 ${lightGrey}` : null)};
`;

const CollapseHeader = styled.div<{ open?: boolean; isPortable?: boolean }>`
  display: flex;
  cursor: ${(p) => (p.isPortable ? "pointer" : "default")};
  justify-content: space-between;
  padding: ${(p) => (p.isPortable ? "15px 20px" : 0)};

  align-items: center;
  color: ${black};
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
  handleClick: (e) => void;
  forceOpen?: boolean;
  favourites: string[];
}) => {
  const { handleClick, forceOpen, favourites } = props;
  const [favouritesList, _] = useState(favourites);
  if (favourites.length === 0) return null;
  const isPortable = useWindowSize().width <= 1000;
  const [open, setOpen] = useState(forceOpen ?? false);

  return (
    <CollapseWrap isPortable={isPortable}>
      <Collapsible
        open={forceOpen ?? false}
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
          {favouritesList.map((f, i) => (
            <OpenFavouriteStationButton
              key={i}
              onClick={handleClick}
              children={smallify(f)}
            />
          ))}
          {favouritesList.length === 0 && (
            <Prompt>
              Favourited stations will appear here for quick access!
            </Prompt>
          )}
        </ListWrap>
      </Collapsible>
    </CollapseWrap>
  );
};
