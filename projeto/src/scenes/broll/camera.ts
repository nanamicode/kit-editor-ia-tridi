import { Easing } from "remotion";
import { clamp, hash } from "./theme";
import { piece, type ClipDef } from "./timeline";

export const S_FULL = 1.86; // 1080 -> cobre 1920 de altura (minimo fisico ~1.78) com folga p/ tremor
// Rodada 2: o cartao sangra nas laterais (x -20..1100, cortado pela tela, inclinado) e ocupa
// y 372-1712; o resto da tela vertical e preenchido pelo proprio clipe borrado (BgFill).
export const CARD = { x: -20, y: 372, w: 1120, h: 1340 } as const;
export const STRIP = { x: 0, y: 400, w: 1080, h: 1260 } as const;
export const S_CARD = 1.34; // cobre 1340 de altura (+folga de tremor/inclinacao) no zoom 1.0
export const S_STRIP = 1.22; // cobre 1260 de altura (+folga de tremor) no zoom 1.0

const EASINGS = [
  Easing.bezier(0.4, 0, 0.3, 1), // aproximacao
  Easing.bezier(0.6, 0, 0.95, 0.35), // acelera ate o soco
  Easing.bezier(0.1, 0.8, 0.2, 1), // solta
  Easing.bezier(0.45, 0, 0.25, 1), // rumo ao relevo
  Easing.bezier(0.3, 0, 0.5, 1), // push lento
];

export type Shake = { x: number; y: number; r: number };

/** tremor curto no impacto: decaimento exponencial, ruido deterministico */
export const shakeAt = (frame: number, impact: number, amp: number): Shake => {
  const t = frame - impact;
  if (t < 0 || t > 13) return { x: 0, y: 0, r: 0 };
  const env = Math.exp(-t * 0.34);
  return {
    x: (hash(t, 1) - 0.5) * 2 * amp * env,
    y: (hash(t, 2) - 0.5) * 2 * amp * env,
    r: (hash(t, 3) - 0.5) * 2 * 0.9 * env,
  };
};

export type Cam = {
  u: number;
  v: number;
  z: number;
  s: number;
  tx: number;
  ty: number;
  vw: number;
  vh: number;
  shake: Shake;
};

export const getCam = (def: ClipDef, frame: number, withShake = true): Cam => {
  const full = def.mode === "full";
  const vw = full ? 1080 : def.mode === "strip" ? STRIP.w : CARD.w;
  const vh = full ? 1920 : def.mode === "strip" ? STRIP.h : CARD.h;
  const base = full ? S_FULL : def.mode === "strip" ? S_STRIP : S_CARD;
  const { keys, u, v, z } = def.cam;
  // em caixa o punch-in e mais contido (mostra mais produto ao redor do relevo)
  const zRaw = piece(frame, keys, z, EASINGS);
  // tela cheia ja parte de ~1.86x sobre a fonte 1080: punch-in mais contido (menos "mole")
  const zz = full ? 1 + (zRaw - 1) * 0.6 : 1 + (zRaw - 1) * 0.82;
  const s = base * zz;
  const m = full ? 36 : 24; // folga p/ tremor nao revelar borda
  const halfW = (vw / 2 + m) / (1080 * s);
  const halfH = (vh / 2 + m) / (1080 * s);
  const uu = clamp(piece(frame, keys, u, EASINGS), halfW, 1 - halfW);
  const vv = clamp(piece(frame, keys, v, EASINGS), halfH, 1 - halfH);
  const shake = withShake
    ? shakeAt(frame, def.P, full ? 18 : 12)
    : { x: 0, y: 0, r: 0 };
  return {
    u: uu,
    v: vv,
    z: zz,
    s,
    tx: vw / 2 - uu * 1080 * s,
    ty: vh / 2 - vv * 1080 * s,
    vw,
    vh,
    shake,
  };
};

/** posicao (px) de um ponto (u,v) do quadro de origem dentro da viewport da camera */
export const toView = (cam: Cam, u: number, v: number) => ({
  x: cam.tx + u * 1080 * cam.s,
  y: cam.ty + v * 1080 * cam.s,
});

/**
 * Camera do fundo borrado: preenche 1080x1920 com o proprio clipe (sem zoom de punch, sem
 * tremor), seguindo so a posicao horizontal/vertical da camera principal.
 */
export const getBgCam = (def: ClipDef, frame: number): Cam => {
  const { keys, u, v } = def.cam;
  const s = 1.9;
  const halfW = 540 / (1080 * s);
  const halfH = 960 / (1080 * s);
  const uu = clamp(piece(frame, keys, u, EASINGS), halfW, 1 - halfW);
  const vv = clamp(piece(frame, keys, v, EASINGS), halfH, 1 - halfH);
  return {
    u: uu,
    v: vv,
    z: 1,
    s,
    tx: 540 - uu * 1080 * s,
    ty: 960 - vv * 1080 * s,
    vw: 1080,
    vh: 1920,
    shake: { x: 0, y: 0, r: 0 },
  };
};
