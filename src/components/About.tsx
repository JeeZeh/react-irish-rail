import * as React from "react";
import styled from "styled-components";

const AboutList = styled.ul`
  width: 100%;
  padding-left: 0;
  list-style-position: inside;
  color: ${(p) => p.theme.secondaryText};
  opacity: 0.9;
  @media only screen and (max-width: 1200px) {
    list-style-type: none;
    & li {
      margin-top: 10px;
    }
  }
`;

export const About = () => {
  return (
    <AboutList>
      <li>
        This app allows you to view all trains passing through a given station.
      </li>
      <li>
        You can explore each train, its journey information, and live location
        map.
      </li>
      <li>
        This is not a commercial product, nor is it linked in any way to Iarnród
        Éireann.
      </li>
      <li>
        It was originally created as a learning project for React, feel free to
        read the{" "}
        <a href="https://github.com/JeeZeh/React-Irish-Rail">source code.</a>
      </li>
    </AboutList>
  );
};
