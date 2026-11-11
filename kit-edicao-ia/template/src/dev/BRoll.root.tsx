/**
 * Entry de teste do modulo B-roll. Composicoes:
 *  BRoll      = os 6 clipes do V02 (dados explicitos: ramp + camera medidos) -> visual aprovado
 *  BRollAuto  = os mesmos cortes/pressoes SO com dados minimos (defaults automaticos)
 * Still: npx remotion still src/dev/BRoll.ts BRoll --frame=60 ...
 */
import React from "react";
import { Composition } from "remotion";
import { BrandProvider, BRAND_ROXO_DOURADO } from "../kit/theme";
import { BRollSequence, brollEndSec, type BRollClip } from "../kit/broll";

const SRC = "exemplo/criativo.mp4";
const SRC_FPS = 24000 / 1001;

/** V02 aprovado. Cortes do arquivo: 0, 1.3, 2.8333, 4.2, 5.6, 6.8333, fim 7.8. Rotulos: todos esquerda/base. */
export const V02_CLIPS: BRollClip[] = [
  {
    fromSec: 0,
    toSec: 1.3,
    mode: "full",
    title: "SEU LOGO\nEM RELEVO",
    titleSize: 132,
    support: "RELEVO SECO NO ENVELOPE",
    pressSec: 0.47,
    focus: [0.49, 0.42],
    relief: { u: 0.4, v: 0.46, w: 0.34, h: 0.13 },
    ramp: [[0, 0.1], [0.2333, 0.41], [0.3667, 0.47], [0.6, 0.6], [0.7333, 0.7], [0.9333, 1.18]],
    camera: [
      { t: 0, u: 0.52, v: 0.5, z: 1.0 },
      { t: 0.2333, u: 0.5, v: 0.45, z: 1.1 },
      { t: 0.3667, u: 0.49, v: 0.43, z: 1.24 },
      { t: 0.7, u: 0.46, v: 0.45, z: 1.15 },
      { t: 0.9333, u: 0.42, v: 0.46, z: 1.12 },
      { t: 1.4667, u: 0.41, v: 0.46, z: 1.2 },
    ],
    spot: 0.3,
  },
  {
    fromSec: 1.3,
    toSec: 2.8333,
    mode: "card",
    title: "ADESIVOS",
    titleSize: 156,
    support: "RELEVO NO PAPEL ADESIVO",
    pressSec: 1.6,
    focus: [0.48, 0.58],
    relief: { u: 0.375, v: 0.62, w: 0.3, h: 0.17 },
    ramp: [[0, 1.34], [0.1, 1.54], [0.2333, 1.6], [0.4667, 1.77], [0.6, 1.9], [1.0, 2.7]],
    camera: [
      { t: 0, u: 0.5, v: 0.55, z: 1.0 },
      { t: 0.1, u: 0.49, v: 0.57, z: 1.15 },
      { t: 0.2333, u: 0.48, v: 0.58, z: 1.36 },
      { t: 0.5667, u: 0.45, v: 0.58, z: 1.3 },
      { t: 1.0, u: 0.42, v: 0.59, z: 1.36 },
      { t: 1.6, u: 0.41, v: 0.59, z: 1.46 },
    ],
    transitionIn: "whip",
    tilt: -2.2,
    spot: 0.14,
    label: { outSec: -0.2 },
  },
  {
    fromSec: 2.8333,
    toSec: 4.2,
    mode: "strip",
    title: "GUARDANAPOS",
    titleSize: 150,
    support: "ATÉ NO PAPEL MACIO",
    pressSec: 3.28,
    focus: [0.42, 0.55],
    relief: { u: 0.385, v: 0.47, w: 0.3, h: 0.25 },
    ramp: [[0, 2.9], [0.2667, 3.22], [0.4, 3.28], [0.6333, 3.4], [0.7667, 3.52], [1.0667, 4.12]],
    camera: [
      { t: 0, u: 0.5, v: 0.5, z: 1.0 },
      { t: 0.2667, u: 0.46, v: 0.52, z: 1.12 },
      { t: 0.4, u: 0.43, v: 0.53, z: 1.36 },
      { t: 0.7333, u: 0.41, v: 0.5, z: 1.3 },
      { t: 1.0667, u: 0.385, v: 0.47, z: 1.3 },
      { t: 1.6333, u: 0.385, v: 0.47, z: 1.42 },
    ],
    transitionIn: "flash",
    spot: 0.3,
    label: { outSec: -0.1333 },
  },
  {
    fromSec: 4.2,
    toSec: 5.6,
    mode: "card",
    title: "SELOS DOURADOS",
    titleSize: 126,
    support: "DETALHE FINO NO DOURADO",
    pressSec: 4.7,
    focus: [0.42, 0.43],
    relief: { u: 0.37, v: 0.396, w: 0.4, h: 0.4 },
    ramp: [[0, 4.3], [0.1667, 4.64], [0.3, 4.7], [0.5333, 4.78], [0.6667, 4.9], [0.9667, 5.4]],
    camera: [
      { t: 0, u: 0.45, v: 0.45, z: 1.0 },
      { t: 0.1667, u: 0.43, v: 0.44, z: 1.2 },
      { t: 0.3, u: 0.42, v: 0.43, z: 1.42 },
      { t: 0.6333, u: 0.4, v: 0.42, z: 1.36 },
      { t: 0.9667, u: 0.38, v: 0.41, z: 1.3 },
      { t: 1.4333, u: 0.37, v: 0.4, z: 1.4 },
    ],
    transitionIn: "iris",
    tilt: 1.9,
    spot: 0.26,
    label: { outSec: -0.2667 },
  },
  {
    fromSec: 5.6,
    toSec: 6.8333,
    mode: "full",
    title: "ENVELOPES",
    titleSize: 176,
    support: "CADA TRAÇO MARCADO",
    pressSec: 6.05,
    focus: [0.45, 0.5],
    relief: { u: 0.36, v: 0.41, w: 0.3, h: 0.32 },
    ramp: [[0, 5.64], [0.2, 5.99], [0.3333, 6.05], [0.5667, 6.15], [0.7, 6.27], [0.9333, 6.78]],
    camera: [
      { t: 0, u: 0.46, v: 0.5, z: 1.0 },
      { t: 0.2, u: 0.45, v: 0.49, z: 1.08 },
      { t: 0.3333, u: 0.45, v: 0.5, z: 1.22 },
      { t: 0.6667, u: 0.42, v: 0.47, z: 1.15 },
      { t: 0.9333, u: 0.37, v: 0.43, z: 1.12 },
      { t: 1.4667, u: 0.36, v: 0.42, z: 1.2 },
    ],
    transitionIn: "glitch",
    spot: 0.3,
    // V02 tinha este rotulo a direita; o padrao pedido pelo usuario e esquerda em todos
    label: { outSec: -0.2667 },
  },
  {
    fromSec: 6.8333,
    toSec: 7.8,
    mode: "strip",
    title: "CARTÕES",
    titleSize: 132,
    support: "RELEVO NO CARTÃO BRANCO",
    pressSec: 7.4,
    focus: [0.5, 0.58],
    relief: { u: 0.34, v: 0.535, w: 0.3, h: 0.26, rot: -28 },
    ramp: [[0, 6.9], [0.2667, 7.34], [0.4, 7.4], [0.6333, 7.48], [0.7, 7.54]],
    camera: [
      { t: 0, u: 0.5, v: 0.55, z: 1.0 },
      { t: 0.2667, u: 0.5, v: 0.57, z: 1.2 },
      { t: 0.4, u: 0.5, v: 0.58, z: 1.4 },
      { t: 0.5667, u: 0.42, v: 0.56, z: 1.45 },
      { t: 0.7, u: 0.38, v: 0.54, z: 1.5 },
      { t: 0.9667, u: 0.36, v: 0.535, z: 1.6 },
    ],
    transitionIn: "wipe",
    spot: 0.1,
    // camada de topo (acima do overlay do selo 3D); entra 2 q antes do corte
    label: { inSec: -0.0667, layer: "top" },
  },
];

/** mesmos cortes e pressoes, so dados minimos: tudo o mais vem dos defaults */
export const AUTO_CLIPS: BRollClip[] = V02_CLIPS.map((c) => ({
  fromSec: c.fromSec,
  toSec: c.toSec,
  mode: c.mode,
  title: c.title,
  support: c.support,
  pressSec: c.pressSec,
  focus: c.focus,
  relief: c.relief,
}));

const V02: React.FC = () => (
  <BrandProvider brand={BRAND_ROXO_DOURADO}>
    <BRollSequence clips={V02_CLIPS} src={SRC} srcFps={SRC_FPS} />
  </BrandProvider>
);
const Auto: React.FC = () => (
  <BrandProvider brand={BRAND_ROXO_DOURADO}>
    <BRollSequence clips={AUTO_CLIPS} src={SRC} srcFps={SRC_FPS} />
  </BrandProvider>
);

const DUR = Math.round(brollEndSec(V02_CLIPS) * 30);

export const BRollDevRoot: React.FC = () => (
  <>
    <Composition id="BRoll" component={V02} width={1080} height={1920} fps={30} durationInFrames={DUR} />
    <Composition id="BRollAuto" component={Auto} width={1080} height={1920} fps={30} durationInFrames={DUR} />
  </>
);
