/**
 * <BRollSequence clips src srcFps /> — B-roll com cortes dinamicos movido por DADOS.
 * Empilha, de tras para a frente: filtros SVG, camadas dos clipes ativos (com transicao),
 * HUD (zIndex 40), rotulos de camada "top" (zIndex 40), overlays de transicao, grao.
 * Tempo absoluto: usa o quadro da composicao a partir de startSec e some depois do fim.
 * NAO envolver em <Sequence from>: passe startSec. NAO colocar ancestral com transform/
 * opacity/filter/isolation se outro overlay (ex.: selo 3D) precisa ficar entre o B-roll e o
 * rotulo "top" (stacking context prende o zIndex 40 dentro do ancestral).
 */
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../theme";
import { Grain } from "./Backdrop";
import { Hud } from "./Hud";
import { planClips } from "./plan";
import { ClipLabel, ClipScene } from "./Scene";
import { FilterDefs, TransitionOverlays, layerFx, stackFilter, type TxCtx } from "./Transitions";
import type { BRollClip, SrcInfo } from "./types";

export type BRollSequenceProps = {
  clips: BRollClip[];
  /** caminho em public/ (staticFile), ex.: "exemplo/criativo.mp4" */
  src: string;
  /** fps do arquivo-fonte (ex.: 23.976 = 24000/1001). Default 30 */
  srcFps?: number;
  /** largura/altura do arquivo-fonte (so a proporcao importa). Default 1080x1080 */
  srcWidth?: number;
  srcHeight?: number;
  /** inicio do B-roll na composicao (s). Default 0 */
  startSec?: number;
  /** HUD 01/NN + barra segmentada. Default true */
  hud?: boolean;
  /** topo da barra do HUD (px). Default 252 */
  hudY?: number;
  /** opacidade do grao. Default 0.14 (0 desliga) */
  grain?: number;
  /** corpo da linha de apoio (px, minimo 44). Default 52 */
  supportSize?: number;
  /** prefixo dos ids de filtro SVG (mude se houver 2 B-rolls no mesmo quadro). Default "bl" */
  id?: string;
};

/** fim (s) do B-roll calculado dos dados, para o montador posicionar o que vem depois */
export const brollEndSec = (clips: BRollClip[], startSec = 0) =>
  clips.reduce((a, c) => a + (c.durSec ?? Math.max(0.2, c.toSec - c.fromSec)), startSec);

export const BRollSequence: React.FC<BRollSequenceProps> = ({
  clips,
  src,
  srcFps = 30,
  srcWidth = 1080,
  srcHeight = 1080,
  startSec = 0,
  hud = true,
  hudY,
  grain = 0.14,
  supportSize,
  id = "bl",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useBrand();
  const plan = useMemo(() => planClips(clips, startSec, fps), [clips, startSec, fps]);
  const info: SrcInfo = useMemo(
    () => ({ dw: 1080, dh: (1080 * srcHeight) / srcWidth, srcFps }),
    [srcWidth, srcHeight, srcFps],
  );
  if (!plan.plans.length || frame < plan.start || frame >= plan.end) return null;
  const ctx: TxCtx = { plans: plan.plans, fps, src: info, id };
  const imgFilter = stackFilter(frame, ctx);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, overflow: "hidden" }}>
      <FilterDefs frame={frame} ctx={ctx} />
      <div style={{ position: "absolute", inset: 0 }}>
        {plan.plans.map((d) => {
          if (frame < d.enter || frame >= d.exit) return null;
          const fx = layerFx(d.i, frame, ctx);
          if (!fx.visible) return null;
          return (
            <div key={d.i} style={{ position: "absolute", inset: 0, ...fx.style }}>
              <ClipScene
                d={d}
                world={fx.world}
                src={src}
                info={info}
                id={id}
                imgFilter={imgFilter}
                supportSize={supportSize}
              />
            </div>
          );
        })}
      </div>
      {hud ? <Hud cuts={plan.cuts} end={plan.end} y={hudY} /> : null}
      {plan.plans
        .filter((d) => d.labelTop && frame >= d.labelIn)
        .map((d) => (
          <div key={`top-${d.i}`} style={{ position: "absolute", inset: 0, zIndex: 40 }}>
            <ClipLabel d={d} supportSize={supportSize} />
          </div>
        ))}
      <TransitionOverlays frame={frame} ctx={ctx} />
      {grain > 0 ? <Grain opacity={grain} /> : null}
    </AbsoluteFill>
  );
};
