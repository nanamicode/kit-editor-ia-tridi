import React from "react";
import { Composition } from "remotion";
import { V4 } from "./V4";
import { DURACAO_ORIGINAL_S } from "./dados";

const FPS = 30;

export const RootV4: React.FC = () => (
  <Composition
    id="V4"
    component={V4}
    durationInFrames={Math.round(DURACAO_ORIGINAL_S * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
