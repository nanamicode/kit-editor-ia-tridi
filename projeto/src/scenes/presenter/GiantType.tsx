import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Anton";
import { C, FPS, T, shiftPx } from "./layout";

/**
 * Camada 2: palavras-chave gigantes ATRAS da silhueta (entre o cartao e a pessoa), cada uma
 * sincronizada com a fala e com troca-fecha (entra, fica enquanto e dita, sai):
 *   DIFERENCA  entra 8.80 -> dita em 8.90 -> sai 9.40  (fonte cheia marfim, relevo seco)
 *   GARANTA    entra 10.62 -> dita em 10.70 -> sai 11.24 (so contorno: o titulo do CTA e o texto limpo)
 * Fica na altura da cabeca/ombros: cabelo e rosto da apresentadora ocluem a base das letras de
 * verdade (a pessoa esta numa camada acima e o alfa recorta o tipo).
 */

const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });

type WordSpec = {
  text: string;
  fontSize: number;
  baseline: number;
  spacing: number;
  inSec: number;
  outSec: number;
  outline: boolean;
};

export const WORDS: WordSpec[] = [
  { text: "DIFERENÇA", fontSize: 236, baseline: 900, spacing: 2, inSec: T.difIn, outSec: T.difOut, outline: false },
  { text: "GARANTA", fontSize: 250, baseline: 900, spacing: 3, inSec: T.garIn, outSec: T.garOut, outline: true },
];

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Letter: React.FC<{
  w: WordSpec;
  ch: string;
  idx: number;
  n: number;
  kind: "shadow" | "echo" | "main";
}> = ({ w, ch, idx, n, kind }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inF = w.inSec * FPS + idx * 1.4;
  const outF = w.outSec * FPS + (n - 1 - idx) * 0.5; // sai na ordem inversa (fecha)
  const up = spring({ frame: frame - inF, fps, config: { damping: 14, stiffness: 210, mass: 0.7 } });
  const down = interpolate(frame, [outF, outF + 6], [0, 1], {
    ...clampOpts,
    easing: Easing.in(Easing.cubic),
  });
  const vis = interpolate(frame - inF, [0, 2], [0, 1], clampOpts) * (1 - down);
  const y = (1 - up) * 70 + down * 90;
  const sc = (1.18 - 0.18 * up) * (1 - 0.1 * down);
  const tilt = (1 - up) * (idx % 2 ? 5 : -5);
  const common: React.CSSProperties = {
    display: "inline-block",
    whiteSpace: "pre",
    translate: `0 ${y}px`,
    scale: sc,
    rotate: `${tilt}deg`,
    opacity: vis,
    transformOrigin: "50% 80%",
  };
  if (kind === "shadow") {
    return <span style={{ ...common, color: w.outline ? "rgba(42,11,102,0.62)" : "#2A0B66" }}>{ch}</span>;
  }
  if (kind === "echo") {
    return <span style={{ ...common, color: "transparent", WebkitTextStroke: `3px ${C.ivory}` }}>{ch}</span>;
  }
  return (
    <span
      style={{
        ...common,
        color: w.outline ? "transparent" : C.ivory,
        WebkitTextStroke: w.outline ? `6px ${C.ivory}` : undefined,
      }}
    >
      {ch}
    </span>
  );
};

const Row: React.FC<{
  w: WordSpec;
  kind: "shadow" | "echo" | "main";
  dx?: number;
  dy?: number;
  opacity?: number;
}> = ({ w, kind, dx = 0, dy = 0, opacity = 1 }) => {
  const chars = Array.from(w.text);
  return (
    <div
      style={{
        position: "absolute",
        left: dx,
        width: 1080,
        top: w.baseline - w.fontSize * 0.98 + dy,
        height: w.fontSize,
        lineHeight: 1,
        fontFamily,
        fontSize: w.fontSize,
        letterSpacing: w.spacing,
        textAlign: "center",
        whiteSpace: "nowrap",
        opacity,
      }}
    >
      {chars.map((ch, i) => (
        <Letter key={i} w={w} ch={ch} idx={i} n={chars.length} kind={kind} />
      ))}
    </div>
  );
};

const GiantWord: React.FC<{ w: WordSpec }> = ({ w }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < w.inSec - 0.1 || t > w.outSec + 0.5) return null;
  const sh = shiftPx(t, -2.2);
  return (
    <div style={{ position: "absolute", inset: 0, translate: `${sh.x}px ${sh.y}px` }}>
      {/* sombra dura violeta (relevo seco: luz de cima-esquerda) */}
      <Row w={w} kind="shadow" dx={w.outline ? 0 : 7} dy={w.outline ? 0 : 9} />
      {/* ecos em contorno empilhados para cima (trilha de movimento) */}
      {[3, 2, 1].map((k) => (
        <Row key={k} w={w} kind="echo" dy={-k * 46} opacity={0.62 - k * 0.14} />
      ))}
      <Row w={w} kind="main" />
    </div>
  );
};

export const GiantType: React.FC = () => (
  <>
    {WORDS.map((w) => (
      <GiantWord key={w.text} w={w} />
    ))}
  </>
);
