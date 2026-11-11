import { Easing, interpolate } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = {
  ink: "#120A24",
  graphite: "#1B1230",
  violet: "#7B2FF0",
  violetLight: "#B794FF",
  gold: "#F5C542",
  goldLight: "#FFD86B",
  ivory: "#FFF8E7",
} as const;

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const mont = loadMontserrat("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});
export const FONT_DISPLAY = anton.fontFamily;
export const FONT_TEXT = mont.fontFamily;

export const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));

/** Normalised progress of frame inside [a,b] with optional easing. */
export const prog = (
  frame: number,
  a: number,
  b: number,
  easing: (t: number) => number = (t) => t,
) =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.76, 0, 0.24, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  whip: Easing.bezier(0.85, 0, 0.15, 1),
  snap: Easing.bezier(0.2, 0.9, 0.2, 1),
} as const;

/** Deterministic hash noise in [0,1). */
export const hash = (n: number, seed = 0) => {
  const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453123;
  return x - Math.floor(x);
};
