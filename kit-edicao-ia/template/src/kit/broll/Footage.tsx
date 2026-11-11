/**
 * Filmagem remapeada (speed-ramp) de UM clipe: cada trecho play/hold e uma <Sequence> com
 * trimBefore + playbackRate (play) ou freeze (hold). Desenha o quadro de origem (1080 x dh)
 * no espaco da camera. Opcional: luz rasante (specular) sobre o relevo durante o hold.
 * BgFill: o proprio clipe ampliado/borrado preenchendo a tela atras de card/strip.
 */
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { clamp, useBrand } from "../theme";
import type { Cam } from "./Camera";
import { alpha } from "./color";
import type { ClipPlan, PlaySeg, SrcInfo } from "./types";

const V: React.FC<{ src: string; info: SrcInfo }> = ({ src, info }) => (
  <Video
    src={staticFile(src)}
    muted
    objectFit="fill"
    style={{ position: "absolute", left: 0, top: 0, width: info.dw, height: info.dh }}
  />
);

const PlayLayer: React.FC<{
  seg: PlaySeg;
  frame: number;
  noBlend?: boolean;
  src: string;
  info: SrcInfo;
}> = ({ seg, frame, noBlend, src, info }) => {
  const { fps } = useVideoConfig();
  const trimA = Math.round(seg.src0 * fps);
  const doBlend = seg.blend && !noBlend;
  let blendOpacity = 0;
  if (doBlend) {
    const tA = seg.src0 + ((frame - seg.start) * seg.rate) / fps;
    const x = tA * info.srcFps;
    blendOpacity = x - Math.floor(x + 1e-6);
  }
  return (
    <>
      <Sequence trimBefore={trimA} playbackRate={seg.rate} layout="none">
        <V src={src} info={info} />
      </Sequence>
      {doBlend ? (
        <div style={{ position: "absolute", inset: 0, opacity: blendOpacity }}>
          <Sequence trimBefore={trimA + fps / info.srcFps} playbackRate={seg.rate} layout="none">
            <V src={src} info={info} />
          </Sequence>
        </div>
      ) : null}
    </>
  );
};

export type ReliefProps = {
  filterId: string;
  /** progresso 0..1 da varredura de luz */
  p: number;
  amount: number;
  /** centro/raios da regiao do relevo, px no espaco do quadro de origem */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

const ReliefLayer: React.FC<{ hold: number; r: ReliefProps; src: string; info: SrcInfo }> = ({
  hold,
  r,
  src,
  info,
}) => {
  const c = -25 + 150 * r.p;
  const band = `linear-gradient(112deg, transparent ${c - 17}%, #000 ${c}%, transparent ${c + 17}%)`;
  const area = `radial-gradient(ellipse ${r.rx}px ${r.ry}px at ${r.cx}px ${r.cy}px, #000 45%, transparent 100%)`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        mixBlendMode: "screen",
        opacity: r.amount,
        filter: `url(#${r.filterId})`,
        maskImage: `${band}, ${area}`,
        maskComposite: "intersect",
        WebkitMaskImage: `${band}, ${area}`,
        WebkitMaskComposite: "source-in",
      }}
    >
      <Sequence freeze={hold} layout="none">
        <V src={src} info={info} />
      </Sequence>
    </div>
  );
};

export const Footage: React.FC<{
  d: ClipPlan;
  frame: number;
  cam: Pick<Cam, "tx" | "ty" | "s">;
  src: string;
  info: SrcInfo;
  relief?: ReliefProps | null;
  /** camada de fundo (borrada): sem blend de quadros */
  bg?: boolean;
}> = ({ d, frame, cam, src, info, relief, bg }) => {
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: info.dw,
        height: info.dh,
        transformOrigin: "0 0",
        translate: `${cam.tx}px ${cam.ty}px`,
        scale: cam.s,
      }}
    >
      {d.segs.map((seg, k) => (
        <Sequence
          key={k}
          from={seg.start}
          durationInFrames={seg.frames}
          layout="none"
          name={`broll-c${d.i + 1}-${seg.kind}${k}`}
        >
          {seg.kind === "play" ? (
            <PlayLayer seg={seg} frame={frame} noBlend={bg} src={src} info={info} />
          ) : (
            <>
              <Sequence freeze={Math.round(seg.src * fps)} layout="none">
                <V src={src} info={info} />
              </Sequence>
              {relief ? (
                <ReliefLayer hold={Math.round(seg.src * fps)} r={relief} src={src} info={info} />
              ) : null}
            </>
          )}
        </Sequence>
      ))}
    </div>
  );
};

/**
 * Fundo dos clipes em caixa: o PROPRIO clipe ampliado, borrado e escurecido (em vez de
 * vazio acima/abaixo da caixa). Deriva devagar. Sem blend e sem relevo (1 decodificador).
 */
export const BgFill: React.FC<{ d: ClipPlan; frame: number; src: string; info: SrcInfo }> = ({
  d,
  frame,
  src,
  info,
}) => {
  const { colors } = useBrand();
  // 1.9x para fonte quadrada; para outras proporcoes, a mesma folga sobre a cobertura minima
  const s = 1.9 * (Math.max(1080 / info.dw, 1920 / info.dh) / (1920 / 1080));
  const PAD = 90; // sobra p/ a borda do blur nao clarear
  const sw = info.dw * s;
  const sh = info.dh * s;
  const tx = clamp(540 - d.relief.u * sw, 1080 - sw, 0) - (frame - d.enter) * 0.6;
  const ty = clamp(960 - d.relief.v * sh, 1920 - sh, 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: colors.ink }}>
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
        <Footage d={d} frame={frame} cam={{ s, tx: tx + PAD, ty: ty + PAD }} src={src} info={info} bg />
      </div>
      <AbsoluteFill style={{ backgroundColor: alpha(colors.ink, 0.4) }} />
    </AbsoluteFill>
  );
};
