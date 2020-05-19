import * as React from "react";
import { ItemList, ListItem } from "./FuzzyOverlay";
import { SearchHeading } from "./App";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Star } from "react-feather";
import styled from "styled-components";

const FavouriteStarWrapper = styled(Star)`
  cursor: pointer;
  opacity: 0.7;
  fill: none;
  transition: all 0.2s ease-out;

  &.on {
    opacity: 1;
    fill: black;
  }

  &:hover {
    opacity: 1;
  }
`;

export const FavouriteStar = (props: { stationName: string }) => {
  const { stationName } = props;
  const [favourites, setFavourites] = useLocalStorage<string[]>(
    "favourites",
    []
  );

  const handleClick = (e) => {
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
    <FavouriteStarWrapper
      className={favourites.includes(stationName) ? "on" : null}
      size={28}
      onClick={handleClick}
    />
  );
};

export const FavouriteStations = (props: { handleClick: (e) => void }) => {
  const [favourites, _] = useLocalStorage<string[]>("favourites", []);

  const { handleClick } = props;
  if (favourites.length === 0) return null;

  return (
    <div>
      <SearchHeading>Saved Stations</SearchHeading>
      <ItemList>
        {favourites.map((f, i) => (
          <ListItem key={i} onClick={handleClick} children={f} />
        ))}
      </ItemList>
    </div>
  );
};
