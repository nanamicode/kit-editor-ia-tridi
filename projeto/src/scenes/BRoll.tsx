import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "./broll/theme";
import { CLIPS, END_FRAME } from "./broll/timeline";
import { ClipScene } from "./broll/Scene";
import { Hud } from "./broll/Hud";
import { LabelBlock } from "./broll/Kinetic";
import { Grain } from "./broll/Backdrop";
import {
  FilterDefs,
  TransitionOverlays,
  layerFx,
  stackFilter,
} from "./broll/transitions";

/**
 * B-roll (0.00 – 7.80 s): 6 clipes de carimbos com cortes dinamicos, speed-ramp no
 * impacto, punch-in que acompanha o gesto, tremor de camera, hold com luz rasante.
 * Sincronizado com cues.json (pressao/relevo/corte). 1080x1920, 30 fps.
 *
 * Impactos (comp. 30 fps): pressao P = 0.367, 1.533, 3.233, 4.500, 5.933, 7.233 s;
 * relevo R = 0.600, 1.767, 3.467, 4.733, 6.167, 7.467 s.
 * Cortes: 0, 1.300, 2.833, 4.200, 5.600, 6.833 s. Fim limpo em 7.8 s.
 */
export const WINDOW = { fromSec: 0, toSec: 7.8 };

export const BRoll: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= END_FRAME) return null;
  const layers = CLIPS.filter((d) => frame >= d.enter && frame < d.exit);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      <FilterDefs frame={frame} />
      <div style={{ position: "absolute", inset: 0 }}>
        {layers.map((def) => {
          const fx = layerFx(def, frame);
          if (!fx.visible) return null;
          return (
            <div
              key={def.n}
              style={{ position: "absolute", inset: 0, ...fx.style }}
            >
              <ClipScene def={def} world={fx.world} imgFilter={stackFilter(frame)} />
            </div>
          );
        })}
      </div>
      <Hud />
      {/*
        Rotulo do clipe 6 na CAMADA DE TOPO (z-index acima do overlay Seal3D, que escurece o
        quadro com o dim e o flash): o marfim fica pleno de 205 a ~230. Funciona porque
        nenhum ancestral (BRoll, Criativo) cria stacking context; o Seal3D e irmao posterior.
      */}
      {CLIPS.filter((d) => d.labelPos.top && frame >= d.labelIn).map((d) => (
        <div key={`top-${d.n}`} style={{ position: "absolute", inset: 0, zIndex: 40 }}>
          <LabelBlock def={d} />
        </div>
      ))}
      <TransitionOverlays frame={frame} />
      <Grain opacity={0.14} />
    </AbsoluteFill>
  );
};

export default BRoll;
