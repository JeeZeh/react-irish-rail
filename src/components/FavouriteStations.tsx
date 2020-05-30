import * as React from "react";
import { ItemList, ListItem } from "./FuzzyOverlay";
import { SearchHeading } from "./App";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Heart } from "react-feather";
import styled from "styled-components";

const FavouriteHeartWrapper = styled.div<{ gridColumn: number }>`
  cursor: pointer;
  grid-column: ${(p) => p.gridColumn};
  ${(p) => (p.gridColumn ? "grid-row: 1" : null)};
  opacity: 0.7;
  fill: none;
  transition: all 0.2s ease-out;
  background-color: white;
  border: 2px solid #444;
  height: 60px;
  width: 60px;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;

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
        size={32}
        fill={favourites.includes(stationName) ? "pink" : null}
        opacity={favourites.includes(stationName) ? "pink" : null}
      />
    </FavouriteHeartWrapper>
  );
};

export const FavouriteStations = (props: { handleClick: (e) => void }) => {
  const [favourites, _] = useLocalStorage<string[]>("favourites", []);

  const { handleClick } = props;
  if (favourites.length === 0) return null;

  return (
    <div>
      <SearchHeading>Favourites</SearchHeading>
      <ItemList>
        {favourites.map((f, i) => (
          <ListItem key={i} onClick={handleClick} children={f} />
        ))}
      </ItemList>
    </div>
  );
};
