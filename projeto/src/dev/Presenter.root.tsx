import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { Presenter } from "../scenes/Presenter";
import { Seal3D } from "../scenes/Seal3D";

/** Estande de dev: a cena sozinha, e a cena com o overlay do selo (transicao) por cima. */
const Alone: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
    <Presenter />
  </AbsoluteFill>
);

const WithSeal: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
    <Presenter />
    <Seal3D />
  </AbsoluteFill>
);

export const PresenterDevRoot: React.FC = () => (
  <>
    <Composition id="Presenter" component={Alone} width={1080} height={1920} fps={30} durationInFrames={363} />
    <Composition id="PresenterSeal" component={WithSeal} width={1080} height={1920} fps={30} durationInFrames={363} />
  </>
);
