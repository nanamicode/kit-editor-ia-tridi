/**
 * Fundo "mesa de edicao" (tinta + malha fina/grossa + marcas de registro + fibra de papel),
 * com paralaxe pelo deslocamento do mundo (`world`, vindo do whip-pan). Grain: grao de filme.
 * Ruido por SVG feTurbulence (deterministico), deslocado por quadro com hash().
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { hash, useBrand } from "../theme";
import { alpha } from "./color";

const noiseSvg = (freq: number, seed: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.1 0 0 0 -0.35'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>`,
  )}")`;

const PAPER = noiseSvg(0.9, 4);
const FIBER = noiseSvg(0.035, 11);

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.14 }) => {
  const frame = useCurrentFrame();
  const ox = Math.floor(hash(frame, 5) * 320);
  const oy = Math.floor(hash(frame, 6) * 320);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: PAPER,
        backgroundSize: "320px 320px",
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const Backdrop: React.FC<{ world?: number; solid?: boolean; grid?: boolean }> = ({
  world = 0,
  solid = true,
  grid = true,
}) => {
  const frame = useCurrentFrame();
  const { colors } = useBrand();
  const drift = frame * 0.5;
  const px = -(world * 0.45) - drift;
  const py = -drift * 0.35;
  const lines = (w: number, size: number, color: string) => ({
    position: "absolute" as const,
    inset: 0,
    backgroundImage: `linear-gradient(to right, ${color} ${w}px, transparent ${w}px), linear-gradient(to bottom, ${color} ${w}px, transparent ${w}px)`,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `${px}px ${py}px`,
  });
  const reg = 270;
  const rx = ((px % reg) + reg) % reg;
  const ry = ((py % reg) + reg) % reg;
  const marks: React.ReactNode[] = [];
  if (grid) {
    for (let i = -1; i < 5; i++) {
      for (let j = -1; j < 8; j++) {
        marks.push(
          <div
            key={`${i}-${j}`}
            style={{
              position: "absolute",
              left: rx + i * reg - 9,
              top: ry + j * reg - 9,
              width: 19,
              height: 19,
              backgroundImage: `linear-gradient(${colors.accentLight}, ${colors.accentLight}), linear-gradient(${colors.accentLight}, ${colors.accentLight})`,
              backgroundSize: "19px 2px, 2px 19px",
              backgroundPosition: "0 9px, 9px 0",
              backgroundRepeat: "no-repeat",
              opacity: 0.38,
            }}
          />,
        );
      }
    }
  }
  return (
    <AbsoluteFill style={{ backgroundColor: solid ? colors.ink : undefined, overflow: "hidden" }}>
      {grid ? <div style={lines(1, 54, alpha(colors.primaryLight, 0.07))} /> : null}
      {grid ? <div style={lines(2, 270, alpha(colors.accent, 0.16))} /> : null}
      {marks}
      <AbsoluteFill
        style={{ backgroundImage: FIBER, backgroundSize: "320px 320px", mixBlendMode: "soft-light", opacity: 0.5 }}
      />
    </AbsoluteFill>
  );
};
