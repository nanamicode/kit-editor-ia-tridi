import React from "react";
import { AbsoluteFill, Composition, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandProvider, BRAND_ROXO_DOURADO } from "../kit/theme";
import { FloatingCoins } from "../kit/moedas3d";

/**
 * Teste isolado das moedas3d com os dados do V02: plate (fundo) -> moedas "back" -> recorte (matte RGBA)
 * -> moedas "front". Pessoa ancorada na base, escala 1.1 (como no V02). Quadros: 250 (entrada), 300 (todas).
 */
const T_FROM_BACK = 7.95;
const T_FROM_FRONT = 8.7;
const T_TO = 12.074;
const ORIGIN = 7.8;

const idxAt = (t: number) => Math.min(107, Math.max(26, Math.round(((t - 7.6) * 24000) / 1001) + 1));
const n4 = (i: number) => String(i).padStart(4, "0");
const PERSON_W = 1080 * 1.1;

const Person: React.FC<{ kind: "plate" | "matte" }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = idxAt(frame / fps);
  const src = kind === "plate" ? `exemplo/plate/p${n4(i)}.jpg` : `exemplo/matte/m${n4(i)}.png`;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: (1080 - PERSON_W) / 2,
        bottom: 0,
        width: PERSON_W,
        height: PERSON_W,
        opacity: kind === "plate" ? 0.35 : 1,
      }}
    />
  );
};

const Stand: React.FC = () => (
  <BrandProvider brand={BRAND_ROXO_DOURADO}>
    <AbsoluteFill style={{ backgroundColor: BRAND_ROXO_DOURADO.colors.ink }}>
      <Person kind="plate" />
      <FloatingCoins layer="back" fromSec={T_FROM_BACK} toSec={T_TO} parallaxOriginSec={ORIGIN} />
      <Person kind="matte" />
      <FloatingCoins layer="front" fromSec={T_FROM_FRONT} toSec={T_TO} parallaxOriginSec={ORIGIN} />
    </AbsoluteFill>
  </BrandProvider>
);

export const Moedas3DRoot: React.FC = () => (
  <Composition id="Moedas3D" component={Stand} width={1080} height={1920} fps={30} durationInFrames={363} />
);
