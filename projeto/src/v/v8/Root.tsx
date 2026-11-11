import React from "react";
import { Composition } from "remotion";
import { V8, V8_DURATION, V8_FPS } from "./V8";

export const RootV8: React.FC = () => {
  return (
    <Composition
      id="V8"
      component={V8}
      durationInFrames={V8_DURATION}
      fps={V8_FPS}
      width={1080}
      height={1920}
    />
  );
};
