import React from "react";
import { AbsoluteFill, Composition, OffthreadVideo, staticFile } from "remotion";
import { Seal3D } from "../scenes/Seal3D";
import { BRoll } from "../scenes/BRoll";
import { Presenter } from "../scenes/Presenter";

/** Estande de dev: B-roll/apresentadora (stand-ins do arquivo original) + o overlay do selo por cima. */
const Stand: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#120A24" }}>
    <div style={{ position: "absolute", left: 0, top: 420, width: 1080, height: 1080, overflow: "hidden" }}>
      <OffthreadVideo src={staticFile("criativo.mp4")} style={{ width: 1080, height: 1080 }} muted />
    </div>
    <Seal3D />
  </AbsoluteFill>
);

/** Montagem real (como o Criativo): Presenter por baixo, BRoll no meio, Seal3D por cima. */
const Full: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#120A24" }}>
    <Presenter />
    <BRoll />
    <Seal3D />
  </AbsoluteFill>
);

export const Seal3DDevRoot: React.FC = () => (
  <>
    <Composition id="Seal3D" component={Stand} width={1080} height={1920} fps={30} durationInFrames={363} />
    <Composition id="Seal3DFull" component={Full} width={1080} height={1920} fps={30} durationInFrames={363} />
  </>
);
