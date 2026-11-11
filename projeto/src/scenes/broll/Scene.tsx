import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp } from "./theme";
import type { ClipDef } from "./timeline";
import { CARD, STRIP, getCam, toView } from "./camera";
import { Footage, type ReliefProps } from "./Footage";
import { Backdrop } from "./Backdrop";
import { LabelBlock } from "./Kinetic";
import { Brackets, ImpactRing, Spotlight } from "./Fx";
import { reliefP } from "./transitions";

const TILT: Record<number, number> = { 2: -2.2, 4: 1.9 };
/** forca da vinheta de foco por clipe (fundos brancos pedem menos) */
const SPOT: Record<number, number> = { 1: 0.3, 2: 0.14, 3: 0.3, 4: 0.26, 5: 0.3, 6: 0.1 };

/** Elementos que vivem no espaco da camera (seguem o movimento e o tremor). */
const CamLayer: React.FC<{ def: ClipDef; frame: number; imgFilter?: string }> = ({
  def,
  frame,
  imgFilter,
}) => {
  const cam = getCam(def, frame);
  const sh = cam.shake;
  const camP = getCam(def, def.P, false);
  // no ultimo clipe o palco fica limpo para o selo 3D entrar
  const fadeAt = def.n === 6 ? def.exit - 5 : undefined;
  const stamp = toView(camP, def.stamp[0], def.stamp[1]);
  const emb = toView(cam, def.emb.u, def.emb.v);
  const pxPerSrc = 1080 * cam.s;
  const ew = def.emb.w * pxPerSrc;
  const eh = def.emb.h * pxPerSrc;
  const relief: ReliefProps = {
    filterId: `bl-relief-${def.n}`,
    p: reliefP(def, frame),
    amount: 0.95,
    cx: def.emb.u * 1080,
    cy: def.emb.v * 1080,
    rx: def.emb.w * 1080 * 0.9,
    ry: def.emb.h * 1080 * 0.9,
  };
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
      <Footage def={def} frame={frame} cam={cam} relief={relief} />
      <Spotlight
        cx={emb.x}
        cy={emb.y}
        rx={ew * 1.15}
        ry={eh * 1.15}
        f0={def.R}
        strength={SPOT[def.n]}
        fadeAt={fadeAt}
      />
      <ImpactRing cx={stamp.x} cy={stamp.y} f0={def.P} />
      <Brackets
        cx={emb.x}
        cy={emb.y}
        w={ew * 1.02}
        h={eh * 1.02}
        rot={def.emb.rot}
        f0={def.R + 1}
        fadeAt={fadeAt}
      />
    </div>
  );
};

/**
 * Fundo dos clipes em caixa: o PROPRIO clipe ampliado, borrado e escurecido (em vez de preto
 * vazio acima/abaixo da caixa). Mantem a cor do produto na tela vertical inteira e deriva
 * devagar. Sem blend de quadros e sem relevo: so 1 decodificador por trecho.
 */
const BgFill: React.FC<{ def: ClipDef; frame: number }> = ({ def, frame }) => {
  const s = 1.9;
  const PAD = 90; // sobra p/ a borda do blur nao clarear
  const span = 1080 * s;
  const tx = clamp(540 - def.emb.u * span, 1080 - span, 0) - (frame - def.enter) * 0.6;
  const ty = clamp(960 - def.emb.v * span, 1920 - span, 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.ink }}>
      <div
        style={{
          position: "absolute",
          left: -PAD,
          top: -PAD,
          width: 1080 + 2 * PAD,
          height: 1920 + 2 * PAD,
          filter: "blur(30px) brightness(0.8) saturate(1.15)",
        }}
      >
        <Footage def={def} frame={frame} cam={{ s, tx: tx + PAD, ty: ty + PAD }} bg />
      </div>
      <AbsoluteFill style={{ backgroundColor: "rgba(18,10,36,0.4)" }} />
    </AbsoluteFill>
  );
};

/** Clipe em tela cheia (corte vertical do quadrado): camera segue o carimbo. */
const FullScene: React.FC<{ def: ClipDef; imgFilter?: string }> = ({
  def,
  imgFilter,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.ink }}>
      <CamLayer def={def} frame={frame} imgFilter={imgFilter} />
      {def.labelPos.top ? null : <LabelBlock def={def} />}
    </AbsoluteFill>
  );
};

/** Clipe em cartao (moldura fina + sombra) ou faixa "sangrada" na largura toda. */
const FramedScene: React.FC<{
  def: ClipDef;
  world: number;
  imgFilter?: string;
}> = ({ def, world, imgFilter }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strip = def.mode === "strip";
  const s = spring({
    frame: frame - def.enter,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.9 },
    durationInFrames: 26,
  });
  const tilt0 = TILT[def.n] ?? 0;
  const rot = strip ? 0 : tilt0 + (1 - s) * 4;
  const box = strip ? STRIP : CARD;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <BgFill def={def} frame={frame} />
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
          <div
            style={{
              position: "absolute",
              inset: -18,
              border: `2px solid rgba(245,197,66,0.75)`,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            backgroundColor: C.graphite,
            boxShadow: strip
              ? `0 -4px 0 ${C.gold}, 0 4px 0 ${C.gold}, 0 40px 80px rgba(0,0,0,0.55)`
              : `0 0 0 4px ${C.ivory}, 0 46px 90px rgba(0,0,0,0.6)`,
          }}
        >
          <CamLayer def={def} frame={frame} imgFilter={imgFilter} />
        </div>
      </div>
      {/* rotulo (lado/topo/base/vertical por clipe); o do clipe 6 vive na camada de topo */}
      {def.labelPos.top ? null : <LabelBlock def={def} />}
    </AbsoluteFill>
  );
};

export const ClipScene: React.FC<{
  def: ClipDef;
  world: number;
  imgFilter?: string;
}> = ({ def, world, imgFilter }) =>
  def.mode === "full" ? (
    <FullScene def={def} imgFilter={imgFilter} />
  ) : (
    <FramedScene def={def} world={world} imgFilter={imgFilter} />
  );
