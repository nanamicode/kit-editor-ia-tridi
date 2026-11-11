import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sacola } from "./Sacola";

// Gera os PNGs (fundo transparente) das sacolas figurantes da cascata.
// frame 0 = cinza, frame 1 = riso. Sacola com largura 200, deslocada 20 px (borda branca cabe no quadro).
// Canvas 240x300: base da sacola em y = 20 + 0.926*260 = 260.8 ; centro do corpo em x = 20 + 294/600*200 = 118.
export const SACOLA_FIG = { width: 240, height: 300, fps: 30, durationInFrames: 2 };

export const SacolaFig: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 20, top: 20 }}>
        <Sacola largura={200} modo={frame === 0 ? "cinza" : "riso"} simples semOlhos sombraChao={false} />
      </div>
    </AbsoluteFill>
  );
};
