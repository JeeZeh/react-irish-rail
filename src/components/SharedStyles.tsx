import styled from "styled-components";

interface Theme {
  primaryText: string;
  secondaryText: string;
  emphasis: string;
  lightEmphasis: string;
  subtle: string;
  faint: string;
  veryFaint: string;
  nearlyBg: string;
  bg: string;
  offMax: string;
  max: string;
  departed: string;
  future: string;
  delayed: string;
  early: string;
  spinner: string;
  button: string;
  shadow: string;
  favourite: string;
}

export type ThemeType = "light" | "dark";

export const themes: Record<ThemeType, Theme> = {
  light: {
    primaryText: "#222222",
    secondaryText: "#444444",
    emphasis: "#666666",
    lightEmphasis: "#888888",
    subtle: "#AAAAAA",
    faint: "#CCCCCC",
    veryFaint: "#F4F4F4",
    nearlyBg: "#F9F9F9",
    bg: "#FBFBFB",
    offMax: "#FEFEFE",
    max: "#FFFFFF",
    departed: "#CC7777AA",
    future: "#555566EE",
    delayed: "#FF8C00",
    early: "#00008B",
    spinner: "#515773",
    button: "#AAAAAA",
    shadow: "#BBBBBB",
    favourite: "#FFAADD",
  },
  dark: {
    primaryText: "#DADADA",
    secondaryText: "#CACACA",
    emphasis: "#BBBBBB",
    lightEmphasis: "#999999",
    subtle: "#666666",
    faint: "#444444",
    veryFaint: "#222222",
    nearlyBg: "#202020",
    bg: "#1A1A1D",
    offMax: "#161616",
    max: "#111111",
    departed: "#DD888866",
    future: "#888899EE",
    delayed: "#EEAA44",
    early: "#6666EE",
    spinner: "#515773",
    button: "#666666",
    shadow: "#161616",
    favourite: "#FF99AA",
  },
};

export const H3A = styled.h3<{
  margin?: string;
  weight?: number;
  justify?: string;
}>`
  font-weight: ${(p) => p.weight ?? 500};
  font-size: 1.3em;
  margin: ${(p) => p.margin ?? 0};
  text-align: ${(p) => p.justify ?? "inherit"};

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
