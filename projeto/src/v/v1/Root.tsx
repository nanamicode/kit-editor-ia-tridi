import React from "react";
import { Composition } from "remotion";
import { V1, V1_DURATION } from "./V1";

export const RootV1: React.FC = () => {
  return (
    <Composition
      id="V1"
      component={V1}
      durationInFrames={V1_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
