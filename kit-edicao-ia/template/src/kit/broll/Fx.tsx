/**
 * Efeitos no espaco da camera (seguem punch-in e tremor):
 * ImpactRing (onda de pressao no quadro P), Brackets (colchetes que fecham no relevo em R),
 * Spotlight (vinheta de foco em volta do relevo).
 */
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, prog, useBrand } from "../theme";
import { alpha } from "./color";
import { fr } from "./plan";

export const ImpactRing: React.FC<{ cx: number; cy: number; f0: number }> = ({ cx, cy, f0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useBrand();
  const rings = [0, fr(3, fps)].map((dl, i) => {
    const p = prog(frame, f0 + dl, f0 + dl + fr(13, fps), EASE.out);
    if (frame < f0 + dl || p >= 1) return null;
    const r = 40 + (i === 0 ? 330 : 230) * p;
    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={i === 0 ? colors.accentLight : colors.text}
        strokeWidth={Math.max(1.5, (i === 0 ? 9 : 5) * (1 - p))}
        opacity={(1 - p) * (i === 0 ? 0.95 : 0.7)}
      />
    );
  });
  const fp = prog(frame, f0, f0 + fr(4, fps), EASE.out);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {frame >= f0 && fp < 1 ? (
        <circle cx={cx} cy={cy} r={90 + 80 * fp} fill={colors.accentLight} opacity={0.32 * (1 - fp)} />
      ) : null}
      {rings}
    </svg>
  );
};

export const Brackets: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  rot: number;
  f0: number;
  fadeAt?: number;
}> = ({ cx, cy, w, h, rot, f0, fadeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useBrand();
  const s = spring({
    frame: frame - f0,
    fps,
    config: { damping: 15, stiffness: 150, mass: 0.8 },
    durationInFrames: fr(22, fps),
  });
  if (frame < f0) return null;
  const k = 1 + (1 - s) * 0.55;
  const bw = w * k;
  const bh = h * k;
  const L = Math.min(54, Math.min(bw, bh) * 0.28);
  const x0 = -bw / 2;
  const y0 = -bh / 2;
  const x1 = bw / 2;
  const y1 = bh / 2;
  const d = [
    `M ${x0} ${y0 + L} V ${y0} H ${x0 + L}`,
    `M ${x1 - L} ${y0} H ${x1} V ${y0 + L}`,
    `M ${x1} ${y1 - L} V ${y1} H ${x1 - L}`,
    `M ${x0 + L} ${y1} H ${x0} V ${y1 - L}`,
  ].join(" ");
  const op =
    Math.min(1, s * 1.4) * (fadeAt === undefined ? 1 : 1 - prog(frame, fadeAt, fadeAt + fr(4, fps)));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g transform={`translate(${cx} ${cy}) rotate(${rot})`} opacity={op}>
        <path d={d} fill="none" stroke={colors.ink} strokeWidth={10} strokeLinecap="square" opacity={0.55} />
        <path d={d} fill="none" stroke={colors.accentLight} strokeWidth={5} strokeLinecap="square" />
      </g>
    </svg>
  );
};

export const Spotlight: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  f0: number;
  strength?: number;
  fadeAt?: number;
}> = ({ cx, cy, rx, ry, f0, strength = 0.3, fadeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useBrand();
  const p =
    prog(frame, f0, f0 + fr(8, fps), EASE.out) *
    (fadeAt === undefined ? 1 : 1 - prog(frame, fadeAt, fadeAt + fr(4, fps)));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px, ${alpha(colors.ink, 0)} 0%, ${alpha(colors.ink, 0)} 58%, ${alpha(colors.ink, strength * p)} 100%)`,
      }}
    />
  );
};
