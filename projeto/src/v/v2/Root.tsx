import React from "react";
import { Composition } from "remotion";
import { V2 } from "./V2";
import { DURACAO, FPS } from "./data";

export const RootV2: React.FC = () => (
  <Composition id="V2" component={V2} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
