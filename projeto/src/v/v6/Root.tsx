import React from "react";
import { Composition } from "remotion";
import { V6 } from "./V6";
import { DURATION, FPS } from "./data";

export const V6Root: React.FC = () => (
  <Composition id="V6" component={V6} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
);
