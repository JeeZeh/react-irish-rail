/* Theme Constants */

import styled from "styled-components";

export const black = "#222";
export const lightBlack = "#444";
export const darkGrey = "#666";
export const mediumGrey = "#888";
export const subtleGrey = "#AAA";
export const lightGrey = "#CCC";
export const veryLightGrey = "#F4F4F4";
export const nearlyWhite = "#FAFAFA";

export const H3A = styled.h3<{ margin?: string; weight?: number }>`
  font-weight: ${(p) => p.weight ?? 500};
  font-size: 1.3em;
  margin: ${(p) => p.margin ?? 0}; /* "10px 0 0 10px" */

  @media only screen and (max-width: 400px) {
    font-size: 1em;
  }
`;

export const H1A = styled.h1<{ margin?: string }>`
  font-weight: 700;
  margin: ${(p) => p.margin ?? 0};
  @media only screen and (max-width: 500px) {
    font-size: 2em;
  }

  @media only screen and (max-width: 400px) {
    font-size: 1.4em;
  }
`;
