import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import BeatLoader from "react-spinners/BeatLoader";

interface LoadingSpinnerProps {
  width?: string;
  height?: string;
  color: string;
  size: number;
  loading?: boolean;
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
  const { size, color, loading } = props;
  const [fade, setFade] = useState(false);
  useEffect(() => {
    setFade(true);
    console.log("mounting");

    return () => {
      console.log("unmounting");
      setFade(false);
    };
  }, []);

  return (
    <Spinner props={props} className={fade ? "visible" : null}>
      <BeatLoader
        size={size}
        color={color}
        loading={true}
        css={"margin: 0;"}
      ></BeatLoader>
    </Spinner>
  );
};
