import * as React from "react";
import { useEffect, useState, useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import BeatLoader from "react-spinners/BeatLoader";

interface LoadingSpinnerProps {
  width?: string;
  height?: string;
  color?: string;
  size: number;
  loading?: boolean;
  delay?: number;
}

const Spinner = styled.div<{ props: LoadingSpinnerProps }>`
  width: ${(p) => p.props.width ?? "auto"};
  height: ${(p) => p.props.height ?? "auto"};

  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 1s ease-out;

  &.visible {
    opacity: 1;
  }
`;
export const LoadingSpinner = (props: LoadingSpinnerProps) => {
  const { size, color, delay } = props;
  const [fade, setFade] = useState(false);
  const themeContext = useContext(ThemeContext);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fadeInTimeout = setTimeout(() => {
      setReady(true);
      setFade(true);
    }, delay);

    return () => {
      clearTimeout(fadeInTimeout);
      setFade(false);
    };
  }, []);

  return (
    <Spinner props={props} className={fade ? "visible" : null}>
      {ready && (
        <BeatLoader
          size={size}
          color={color ?? themeContext.spinner}
          loading={true}
          css={"margin: 0;"}
        />
      )}
    </Spinner>
  );
};
