/**
 * Cena de UM clipe por modo:
 *  full  tela cheia (corte vertical do quadro de origem), camera segue o carimbo
 *  card  cartao inclinado com moldura de acento, mola de entrada, fundo = clipe borrado + grade
 *  strip faixa sangrada na largura toda (filetes de acento), fundo = clipe borrado + grade
 * CamLayer: tudo que vive no espaco da camera (filmagem, vinheta, anel, colchetes) recebe
 * o tremor do impacto.
 */
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../theme";
import { Backdrop } from "./Backdrop";
import { CARD, STRIP, getCam, toView } from "./Camera";
import { alpha } from "./color";
import { BgFill, Footage, type ReliefProps } from "./Footage";
import { Brackets, ImpactRing, Spotlight } from "./Fx";
import { KineticLabel } from "./Label";
import { fr } from "./plan";
import { reliefP } from "./Transitions";
import type { ClipPlan, SrcInfo } from "./types";

export type SceneCommon = {
  d: ClipPlan;
  src: string;
  info: SrcInfo;
  id: string;
  imgFilter?: string;
  supportSize?: number;
};

const CamLayer: React.FC<SceneCommon & { frame: number }> = ({ d, frame, src, info, id, imgFilter }) => {
  const { fps } = useVideoConfig();
  const cam = getCam(d, frame, info, fps);
  const sh = cam.shake;
  // no ultimo clipe o palco fica limpo no fim (algo pode entrar por cima)
  const fadeAt = d.last ? d.exit - fr(5, fps) : undefined;
  const camP = d.P !== null ? getCam(d, d.P, info, fps, false) : null;
  const stamp = camP ? toView(camP, d.focus[0], d.focus[1], info) : null;
  const emb = toView(cam, d.relief.u, d.relief.v, info);
  const ew = d.relief.w * info.dw * cam.s;
  const eh = d.relief.h * info.dw * cam.s;
  const relief: ReliefProps | null = d.hasRelief
    ? {
        filterId: `${id}-relief-${d.i}`,
        p: reliefP(d, frame),
        amount: 0.95,
        cx: d.relief.u * info.dw,
        cy: d.relief.v * info.dh,
        rx: d.relief.w * info.dw * 0.9,
        ry: d.relief.h * info.dw * 0.9,
      }
    : null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: cam.vw,
        height: cam.vh,
        translate: `${sh.x}px ${sh.y}px`,
        rotate: `${sh.r}deg`,
        transformOrigin: "50% 50%",
        filter: imgFilter,
      }}
    >
      <Footage d={d} frame={frame} cam={cam} relief={relief} src={src} info={info} />
      {d.R !== null ? (
        <Spotlight cx={emb.x} cy={emb.y} rx={ew * 1.15} ry={eh * 1.15} f0={d.R} strength={d.spot} fadeAt={fadeAt} />
      ) : null}
      {stamp && d.P !== null ? <ImpactRing cx={stamp.x} cy={stamp.y} f0={d.P} /> : null}
      {d.R !== null ? (
        <Brackets
          cx={emb.x}
          cy={emb.y}
          w={ew * 1.02}
          h={eh * 1.02}
          rot={d.relief.rot}
          f0={d.R + 1}
          fadeAt={fadeAt}
        />
      ) : null}
    </div>
  );
};

/** rotulo do clipe (desenhado aqui so se a camada for "clip") */
export const ClipLabel: React.FC<{ d: ClipPlan; supportSize?: number }> = ({ d, supportSize }) => (
  <KineticLabel
    lines={d.lines}
    size={d.titleSize}
    support={d.support}
    supportSize={supportSize}
    f0={d.labelIn}
    out={d.labelOut}
    side={d.side}
    y={d.labelY}
  />
);

const FullScene: React.FC<SceneCommon> = (p) => {
  const frame = useCurrentFrame();
  const { colors } = useBrand();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: colors.ink }}>
      <CamLayer {...p} frame={frame} />
      {p.d.labelTop ? null : <ClipLabel d={p.d} supportSize={p.supportSize} />}
    </AbsoluteFill>
  );
};

const FramedScene: React.FC<SceneCommon & { world: number }> = (p) => {
  const { d, world } = p;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useBrand();
  const strip = d.mode === "strip";
  const s = spring({
    frame: frame - d.enter,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.9 },
    durationInFrames: fr(26, fps),
  });
  const rot = strip ? 0 : d.tilt + (1 - s) * 4;
  const box = strip ? STRIP : CARD;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <BgFill d={d} frame={frame} src={p.src} info={p.info} />
      <Backdrop world={world} solid={false} />
      <div
        style={{
          position: "absolute",
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          rotate: `${rot}deg`,
          scale: strip ? 1 : 0.9 + 0.1 * s,
        }}
      >
        {strip ? null : (
          <div style={{ position: "absolute", inset: -18, border: `2px solid ${alpha(colors.accent, 0.75)}` }} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            backgroundColor: colors.graphite,
            boxShadow: strip
              ? `0 -4px 0 ${colors.accent}, 0 4px 0 ${colors.accent}, 0 40px 80px rgba(0,0,0,0.55)`
              : `0 0 0 4px ${colors.text}, 0 46px 90px rgba(0,0,0,0.6)`,
          }}
        >
          <CamLayer {...p} frame={frame} />
        </div>
      </div>
      {d.labelTop ? null : <ClipLabel d={d} supportSize={p.supportSize} />}
    </AbsoluteFill>
  );
};

export const ClipScene: React.FC<SceneCommon & { world: number }> = (p) =>
  p.d.mode === "full" ? <FullScene {...p} /> : <FramedScene {...p} />;
