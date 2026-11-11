/**
 * Linha do tempo da transicao-estrela, DERIVADA de atSec (instante em que o selo cobre 100%).
 * Offsets medidos no V02 (atSec 7.71). `scale` estica/encolhe tudo em volta de atSec.
 * Funcao pura do frame: nenhum estado, nenhum useFrame.
 */
import { Easing, interpolate } from "remotion";

/** offsets (s) relativos a atSec, V02 */
export const SEAL_OFFSETS = {
  windowFrom: -0.46,
  fall0: -0.41,
  impact: -0.21,
  dive0: -0.15,
  dive1: 0,
  open0: 0.111,
  open1: 0.35,
  windowTo: 0.44,
  sweepA0: -0.21,
  sweepA1: -0.05,
  sweepB0: 0.01,
  sweepB1: 0.19,
} as const;

export type SealTimeline = { -readonly [K in keyof typeof SEAL_OFFSETS]: number } & { at: number };

export const sealTimeline = (atSec: number, scale = 1): SealTimeline => {
  const o = {} as SealTimeline;
  (Object.keys(SEAL_OFFSETS) as Array<keyof typeof SEAL_OFFSETS>).forEach((k) => {
    o[k] = atSec + SEAL_OFFSETS[k] * scale;
  });
  o.at = atSec;
  return o;
};

/** Pouso (unidades de mundo, camera z 9.4 fov 30): centro (x, y) e escala. */
export type SealRest = { x: number; y: number; s: number };
export const V02_REST: SealRest = { x: 0.12, y: 0.62, s: 0.64 };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (t: number, a: number, b: number, from: number, to: number, easing?: (n: number) => number) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

const EASE_DIVE = Easing.in(Easing.poly(2.5));
const EASE_OPEN = Easing.inOut(Easing.quad);

export type SealState = {
  t: number;
  dt: number;
  seal: {
    pos: [number, number, number];
    scale: number;
    rot: [number, number, number];
    squash: number;
    split: number;
    heat: number;
  };
  cam: { pos: [number, number, number]; fov: number; roll: number };
  height: number;
  dim: number;
  shadow: number;
  flash: number;
  flashOpen: number;
  rays: number;
  /** crescimento da rachadura 0..1 */
  crack: number;
  /** opacidade da rachadura (some quando abre) */
  crackFade: number;
  dive: number;
  sweep: { x: number; y: number; z: number; intensity: number };
};

/**
 * @param side +1 = entra pela direita (V02), -1 = pela esquerda
 */
export function sealState(frame: number, fps: number, TL: SealTimeline, rest: SealRest = V02_REST, side = 1): SealState {
  const t = frame / fps;
  // fase "absoluta equivalente ao V02": oscilacoes iguais qualquer que seja atSec
  const tp = t - TL.at + 7.71;
  const p = clamp((t - TL.fall0) / (TL.impact - TL.fall0));
  const dt = Math.max(0, t - TL.impact);
  const landed = t >= TL.impact;

  // queda: entra de lado ja com a FACE para a camera e desce em arco ate o ponto do carimbo
  const sw = Easing.out(Easing.cubic)(clamp(p / 0.72));
  const q = Math.pow(p, 2.0);
  const fx = side * 2.6 * (1 - sw);
  const fy = 0.5 * Math.pow(1 - p, 2);
  const fz = 2.4 * (1 - q);
  const rx = 0.3 * Math.pow(1 - p, 1.5);
  const ry = side * -0.46 * Math.pow(1 - p, 1.3);
  const rz = side * -0.28 * (1 - p);

  const sq = landed ? Math.exp(-dt * 10) * Math.cos(dt * 24) : 0;
  const bounceZ = landed ? 0.09 * Math.max(0, -sq) : 0;
  const settle = Math.exp(-dt * 1.1);
  const wobX = landed ? 0.1 * Math.sin(dt * 8.5) * settle : 0;
  const wobY = landed ? 0.2 * Math.sin(dt * 7.4 + 0.8) * settle : 0;

  const d = ramp(t, TL.dive0, TL.dive1, 0, 1, EASE_DIVE);
  const o = ramp(t, TL.open0, TL.open1, 0, 1, EASE_OPEN);
  const oc = ramp(t, TL.open0 - 0.005, TL.open0 + 0.1, 0, 1, Easing.out(Easing.cubic));

  const r = 1 - d;
  const sealScale = rest.s + (1 - rest.s) * d;
  const pos: [number, number, number] = [(landed ? 0 : fx) + rest.x * r, (landed ? 0 : fy) + rest.y * r, landed ? bounceZ : fz];
  const rot: [number, number, number] = [
    (landed ? wobX : rx) + 0.22 * Math.sin(tp * 11 + 0.6) * d * (1 - o),
    (landed ? wobY : ry) + 0.3 * Math.cos(tp * 9) * d * (1 - o),
    (landed ? 0 : rz) + d * 0.4 + o * 0.5,
  ];

  const A = landed ? 0.075 * Math.exp(-dt * 9) : 0;
  const shakeX = A * Math.sin(dt * 83 + 1.3);
  const shakeY = A * Math.cos(dt * 71);
  const hold = ramp(t, TL.dive1, TL.open0, 0, 1);
  const camZ = 9.4 + (2.65 - 9.4) * d - 0.3 * hold + 1.1 * oc;
  const fov = 30 + 2 * d;
  const roll = (landed ? 0.012 * (A / 0.075) * Math.sin(dt * 60) : 0) + d * 0.05 - o * 0.03;

  const heatImpact = landed ? Math.exp(-dt * 7) * 0.8 : 0;
  const heatOpen = ramp(t, TL.open0 - 0.03, TL.open0 + 0.03, 0, 0.5) * (1 - ramp(t, TL.open0 + 0.03, TL.open1, 0, 1));
  const holdShimmer = ramp(t, TL.dive1 - 0.02, TL.dive1 + 0.01, 0, 1) * (1 - o) * (0.1 + 0.1 * Math.sin(tp * 150));

  const pass = (a: number, b: number) => ramp(t, a, b, 0, 1, Easing.inOut(Easing.quad));
  const pA = pass(TL.sweepA0, TL.sweepA1);
  const pB = pass(TL.sweepB0, TL.sweepB1);
  const inA = t >= TL.sweepA0 && t <= TL.sweepA1;
  const inB = t >= TL.sweepB0 && t <= TL.sweepB1;
  const sp = inB ? 1 - pB : pA;
  const env = inA || inB ? Math.sin(Math.PI * clamp(inB ? pB : pA)) : 0;

  return {
    t,
    dt,
    seal: { pos, scale: sealScale, rot, squash: sq, split: o, heat: Math.max(heatImpact, heatOpen, holdShimmer) },
    cam: { pos: [shakeX, shakeY, camZ], fov, roll },
    height: landed ? 0 : Math.max(0, fz),
    shadow: 1 - ramp(t, TL.dive0, TL.dive0 + 0.08, 0, 1),
    dim: ramp(t, TL.fall0, TL.impact, 0, 0.3) * (1 - ramp(t, TL.dive1, TL.dive1 + 0.02, 0, 1)),
    flash: t >= TL.impact - 0.005 ? Math.pow(Math.max(0, 1 - (t - (TL.impact - 0.005)) / (2 / fps)), 1.5) : 0,
    flashOpen: t >= TL.open0 - 0.01 ? Math.pow(Math.max(0, 1 - (t - (TL.open0 - 0.01)) / (2.5 / fps)), 1.5) : 0,
    rays: ramp(t, TL.open0, TL.open0 + 0.012, 0, 1) * (1 - ramp(t, TL.open0 + 0.02, TL.open0 + 0.07, 0, 1)),
    crack: ramp(t, TL.open0 - 0.07, TL.open0 - 0.01, 0, 1),
    crackFade: 1 - ramp(t, TL.open0, TL.open0 + 0.02, 0, 1),
    dive: d,
    sweep: { x: -2.4 + 4.8 * sp, y: 1.1 - 2.0 * sp, z: 1.9, intensity: (inB ? 1.8 : 2.4) * env },
  };
}
