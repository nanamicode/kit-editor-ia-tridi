import React from "react";
import { Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { FPS } from "./theme";
import { SRC_FPS, type ClipDef, type PlaySeg } from "./timeline";
import type { Cam } from "./camera";

const SRC = staticFile("criativo.mp4");

const V: React.FC = () => (
  <Video
    src={SRC}
    muted
    objectFit="fill"
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: 1080,
      height: 1080,
    }}
  />
);

/** um periodo de um quadro de origem em quadros de composicao a 30 fps */
const ONE_SRC_FRAME = FPS / SRC_FPS;

const PlayLayer: React.FC<{ seg: PlaySeg; frame: number; noBlend?: boolean }> = ({
  seg,
  frame,
  noBlend,
}) => {
  const trimA = Math.round(seg.src0 * FPS);
  const doBlend = seg.blend && !noBlend;
  let blendOpacity = 0;
  if (doBlend) {
    const tA = seg.src0 + ((frame - seg.start) * seg.rate) / FPS;
    const x = tA * SRC_FPS;
    blendOpacity = x - Math.floor(x + 1e-6);
  }
  return (
    <>
      <Sequence trimBefore={trimA} playbackRate={seg.rate} layout="none">
        <V />
      </Sequence>
      {doBlend ? (
        <div style={{ position: "absolute", inset: 0, opacity: blendOpacity }}>
          <Sequence
            trimBefore={trimA + ONE_SRC_FRAME}
            playbackRate={seg.rate}
            layout="none"
          >
            <V />
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
  /** opacidade geral da camada */
  amount: number;
  /** centro/raio da regiao do relevo, px no espaco 1080 do quadro de origem */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

const ReliefLayer: React.FC<{ hold: number; r: ReliefProps }> = ({
  hold,
  r,
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
        <V />
      </Sequence>
    </div>
  );
};

/**
 * Camada de filmagem remapeada (speed-ramp). Desenha o quadro 1080x1080 de origem no
 * espaco da camera (translate/scale), com blend de quadros nos trechos em camera lenta
 * e, opcionalmente, a camada de luz rasante sobre o relevo durante o hold.
 */
export const Footage: React.FC<{
  def: ClipDef;
  frame: number;
  cam: Pick<Cam, "tx" | "ty" | "s">;
  relief?: ReliefProps | null;
  /** camada de fundo (borrada): sem blend de quadros, 1 so decodificador por trecho */
  bg?: boolean;
}> = ({ def, frame, cam, relief, bg }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: 1080,
      height: 1080,
      transformOrigin: "0 0",
      translate: `${cam.tx}px ${cam.ty}px`,
      scale: cam.s,
    }}
  >
    {def.segs.map((seg, i) => (
      <Sequence
        key={i}
        from={seg.start}
        durationInFrames={seg.frames}
        layout="none"
        name={`c${def.n}-${seg.kind}${i}`}
      >
        {seg.kind === "play" ? (
          <PlayLayer seg={seg} frame={frame} noBlend={bg} />
        ) : (
          <>
            <Sequence freeze={Math.round(seg.src * FPS)} layout="none">
              <V />
            </Sequence>
            {relief ? (
              <ReliefLayer hold={Math.round(seg.src * FPS)} r={relief} />
            ) : null}
          </>
        )}
      </Sequence>
    ))}
  </div>
);
