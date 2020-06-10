import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { JourneyKey } from "./JourneyKey";
import { About } from "./About";
import { XCircle } from "react-feather";
import { Card } from "./Schedule";
import { Divider } from "./MobileTrainCard";
import { FavouriteStations } from "./FavouriteStations";
import { H1A } from "./SharedStyles";

const Overlay = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  top: 0;
  left: 0;
  overflow-y: scroll;
  background-color: #fffffffa;
  z-index: 10;

  opacity: 0;

  &.visible {
    transition: opacity 0.1s ease-in;
    opacity: 1;
  }
`;

const Info = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media only screen and (max-width: 330px) {
    padding: 20px 0;
  }
`;

const InfoCard = styled(Card)`
  width: 300px;
  padding: 20px;
  background-color: #fff;
  margin: 15px 0 !important;
  display: flex;
  flex-direction: column;

  & > ul {
    margin: 0;
  }

  @media only screen and (max-width: 330px) {
    transform: scale(0.9);
  }
`;

const CloseModal = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px 0 10px 0;
  user-select: none;
  cursor: pointer;
`;

const CloseItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseText = styled(CloseItem)`
  margin-right: 10px;
  font-weight: 700;
  font-size: 1.5em;
`;

interface ModalMenuProps {
  handleCloseModal: () => void;
  onFavouriteSelect: (e) => void;
}

export const ModalMenu = (props: ModalMenuProps) => {
  const [fade, setFade] = useState(false);
  useEffect(() => setFade(true), []);

  return (
    <Overlay className={fade ? "visible" : null}>
      <Info>
        <CloseModal onClick={props.handleCloseModal}>
          <CloseText>Close</CloseText>
          <CloseItem>
            <XCircle size={32} />
          </CloseItem>
        </CloseModal>
        <InfoCard>
          <H1A margin="0 0 10px 0">Map Key</H1A>
          <JourneyKey />
        </InfoCard>
        <InfoCard>
          <H1A margin="0 0 10px 0">About</H1A>
          <About />
        </InfoCard>
      </Info>
    </Overlay>
  );
};
