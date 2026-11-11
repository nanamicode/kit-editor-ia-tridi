import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, hash } from "./theme";

const noiseSvg = (freq: number, seed: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.1 0 0 0 -0.35'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>`,
  )}")`;

const PAPER = noiseSvg(0.9, 4);
const FIBER = noiseSvg(0.035, 11);

/** Grao de filme fino, deslocado por quadro (ruido deterministico, sem animacao CSS). */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.16 }) => {
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

/**
 * Fundo "mesa de edicao": tinta lisa + malha fina dourada (3 niveis de leitura), fibra de
 * papel e marcas de registro nos cruzamentos principais. A malha anda em paralaxe com o
 * movimento do mundo (whip-pan), entao o fundo participa dos cortes.
 */
export const Backdrop: React.FC<{ world?: number; solid?: boolean }> = ({
  world = 0,
  solid = true,
}) => {
  const frame = useCurrentFrame();
  const drift = frame * 0.5;
  const px = -(world * 0.45) - drift;
  const py = -drift * 0.35;
  const lines = (alpha: number, size: number, color: string) => ({
    position: "absolute" as const,
    inset: 0,
    backgroundImage: `linear-gradient(to right, ${color} ${alpha}px, transparent ${alpha}px), linear-gradient(to bottom, ${color} ${alpha}px, transparent ${alpha}px)`,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `${px}px ${py}px`,
  });
  // marcas de registro: cruz pequena nos cruzamentos de 270px
  const reg = 270;
  const rx = ((px % reg) + reg) % reg;
  const ry = ((py % reg) + reg) % reg;
  const marks: React.ReactNode[] = [];
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
            backgroundImage: `linear-gradient(${C.goldLight}, ${C.goldLight}), linear-gradient(${C.goldLight}, ${C.goldLight})`,
            backgroundSize: "19px 2px, 2px 19px",
            backgroundPosition: "0 9px, 9px 0",
            backgroundRepeat: "no-repeat",
            opacity: 0.38,
          }}
        />,
      );
    }
  }
  return (
    <AbsoluteFill
      style={{ backgroundColor: solid ? C.ink : undefined, overflow: "hidden" }}
    >
      <div style={lines(1, 54, "rgba(183,148,255,0.07)")} />
      <div style={lines(2, 270, "rgba(245,197,66,0.16)")} />
      {marks}
      <AbsoluteFill
        style={{
          backgroundImage: FIBER,
          backgroundSize: "320px 320px",
          mixBlendMode: "soft-light",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
