import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { config } from "./video.config";
import { Amostras } from "./amostras";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id={config.id}
    component={Video}
    defaultProps={{ config }}
    width={config.width}
    height={config.height}
    fps={config.fps}
    durationInFrames={Math.round(config.durationSec * config.fps)}
  />
  <Amostras />
  </>
);
