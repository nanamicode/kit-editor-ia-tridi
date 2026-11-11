/**
 * Camera virtual sobre o quadro de origem: enquadramento base por modo, punch-in por
 * keyframes (u,v,z) com easing por trecho e tremor deterministico no quadro da pressao.
 * O quadro de origem e desenhado com 1080 px de largura (altura dh = 1080 * srcH/srcW).
 */
import { Easing } from "remotion";
import { clamp, hash } from "../theme";
import { piece } from "./plan";
import type { BRollMode, ClipPlan, SrcInfo } from "./types";

/** cartao sangra nas laterais (inclinado) e ocupa y 372-1712; faixa ocupa y 400-1660 */
export const CARD = { x: -20, y: 372, w: 1120, h: 1340 } as const;
export const STRIP = { x: 0, y: 400, w: 1080, h: 1260 } as const;
export const VIEW: Record<BRollMode, { x: number; y: number; w: number; h: number }> = {
  full: { x: 0, y: 0, w: 1080, h: 1920 },
  card: CARD,
  strip: STRIP,
};
/** escalas base aprovadas para fonte QUADRADA (cobrem a viewport + folga de tremor) */
const BASE_SQ: Record<BRollMode, number> = { full: 1.86, card: 1.34, strip: 1.22 };
/** folga (px) para o tremor nao revelar borda */
const MARGIN: Record<BRollMode, number> = { full: 36, card: 24, strip: 24 };
/** punch-in efetivo: tela cheia ja parte de ~1.86x, entao o zoom e mais contido */
const ZK: Record<BRollMode, number> = { full: 0.6, card: 0.82, strip: 0.82 };
const SHAKE_AMP: Record<BRollMode, number> = { full: 18, card: 12, strip: 12 };

const EASINGS = [
  Easing.bezier(0.4, 0, 0.3, 1), // aproximacao
  Easing.bezier(0.6, 0, 0.95, 0.35), // acelera ate o soco
  Easing.bezier(0.1, 0.8, 0.2, 1), // solta
  Easing.bezier(0.45, 0, 0.25, 1), // rumo ao relevo
  Easing.bezier(0.3, 0, 0.5, 1), // push lento
];

export type Shake = { x: number; y: number; r: number };

/** tremor curto no impacto: decaimento exponencial, ruido deterministico */
export const shakeAt = (frame: number, impact: number, amp: number, fps: number): Shake => {
  const t = ((frame - impact) * 30) / fps;
  if (t < 0 || t > 13) return { x: 0, y: 0, r: 0 };
  const env = Math.exp(-t * 0.34);
  const k = Math.round(t);
  return {
    x: (hash(k, 1) - 0.5) * 2 * amp * env,
    y: (hash(k, 2) - 0.5) * 2 * amp * env,
    r: (hash(k, 3) - 0.5) * 2 * 0.9 * env,
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

/** escala base que cobre a viewport do modo, para qualquer proporcao de fonte */
export const baseScale = (mode: BRollMode, src: SrcInfo) => {
  const vp = VIEW[mode];
  const m = MARGIN[mode];
  const cover = (dw: number, dh: number) => Math.max((vp.w + 2 * m) / dw, (vp.h + 2 * m) / dh);
  return BASE_SQ[mode] * (cover(src.dw, src.dh) / cover(1080, 1080));
};

export const getCam = (
  d: ClipPlan,
  frame: number,
  src: SrcInfo,
  fps: number,
  withShake = true,
): Cam => {
  const vp = VIEW[d.mode];
  const { keys, u, v, z } = d.cam;
  const zz = 1 + (piece(frame, keys, z, EASINGS) - 1) * ZK[d.mode];
  const s = baseScale(d.mode, src) * zz;
  const m = MARGIN[d.mode];
  const halfW = (vp.w / 2 + m) / (src.dw * s);
  const halfH = (vp.h / 2 + m) / (src.dh * s);
  const uu = clamp(piece(frame, keys, u, EASINGS), Math.min(halfW, 0.5), Math.max(1 - halfW, 0.5));
  const vv = clamp(piece(frame, keys, v, EASINGS), Math.min(halfH, 0.5), Math.max(1 - halfH, 0.5));
  const shake =
    withShake && d.P !== null
      ? shakeAt(frame, d.P, SHAKE_AMP[d.mode], fps)
      : { x: 0, y: 0, r: 0 };
  return {
    u: uu,
    v: vv,
    z: zz,
    s,
    tx: vp.w / 2 - uu * src.dw * s,
    ty: vp.h / 2 - vv * src.dh * s,
    vw: vp.w,
    vh: vp.h,
    shake,
  };
};

/** posicao (px) de um ponto (u,v) do quadro de origem dentro da viewport da camera */
export const toView = (cam: Cam, u: number, v: number, src: SrcInfo) => ({
  x: cam.tx + u * src.dw * cam.s,
  y: cam.ty + v * src.dh * cam.s,
});

/** centro do relevo do clipe em coordenadas de TELA no quadro `frame` (para a iris) */
export const reliefOnScreen = (d: ClipPlan, frame: number, src: SrcInfo, fps: number) => {
  const p = toView(getCam(d, frame, src, fps, false), d.relief.u, d.relief.v, src);
  const vp = VIEW[d.mode];
  return { x: p.x + vp.x, y: p.y + vp.y };
};

