import * as React from "react";
import { ItemList, ListItem } from "./FuzzyOverlay";
import { JourneyButton } from "./MobileTrainCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Heart } from "react-feather";
import { FixedSizeList as List } from "react-window";
import styled from "styled-components";
import { Fade } from "./JourneyMap";

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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

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

const MobileWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const MobileListItem = styled(JourneyButton)`
  grid-area: none;
  display: flex;
  width: auto;
  box-shadow: none;
  margin: 5px;
  height: 40px;
  transition: box-shadow 0.2s ease-out, opacity 0.2s ease-out;
  opacity: 1;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    opacity: 0.8;
  }
`;

export const FavouriteStations = (props: {
  handleClick: (e) => void;
  asGrid?: boolean;
}) => {
  const [favourites, _] = useLocalStorage<string[]>("favourites", []);
  const itemSize = 50;
  const { handleClick } = props;
  if (favourites.length === 0) return null;

  const Item = ({ index, style }) => {
    const favourite = favourites[index];

    if (props.asGrid) {
      return (
        <MobileListItem onClick={handleClick} style={style} key={index}>
          {favourite}
        </MobileListItem>
      );
    }

    return (
      <ListItem onClick={handleClick} style={style} key={index}>
        {favourite}
      </ListItem>
    );
  };

  if (props.asGrid) {
    return (
      <MobileWrap>
        {favourites.map((f, i) => (
          <MobileListItem key={i} onClick={handleClick} children={f} />
        ))}
      </MobileWrap>
    );
  }

  return (
    <ItemList>
      <Fade side="top" size={favourites.length < 3 ? "0px" : "20px"} />
      <List
        height={Math.min(5 * itemSize, favourites.length * itemSize)}
        itemCount={favourites.length}
        itemSize={itemSize}
        width={"100%"}
      >
        {Item}
      </List>
      <Fade side="bottom" size={favourites.length < 3 ? "0px" : "20px"} />
    </ItemList>
  );
};
