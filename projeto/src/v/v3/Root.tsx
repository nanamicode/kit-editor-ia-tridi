import React from "react";
import { Composition } from "remotion";
import { V3 } from "./V3";

// v3 Tridi · estilo FCA 30 Revista editorial (visual V4 Editorial)
// Duracao = original (23,357 s) -> 701 quadros a 30 fps
export const RootV3: React.FC = () => (
  <Composition
    id="V3"
    component={V3}
    durationInFrames={701}
    fps={30}
    width={1080}
    height={1920}
  />
);
