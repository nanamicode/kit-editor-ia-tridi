import React from "react";
import { useCurrentFrame } from "remotion";
import { C, EASE, FONT_DISPLAY, prog } from "./theme";
import { CUT_FRAMES, END_FRAME } from "./timeline";

const X0 = 80;
const BAR_W = 920;
const GAP = 12;
const SEG_W = (BAR_W - GAP * 5) / 6;
const BAR_Y = 252;

const clipIndexAt = (frame: number) => {
  let k = 0;
  for (let i = 0; i < CUT_FRAMES.length; i++) if (frame >= CUT_FRAMES[i]) k = i;
  return k;
};

/**
 * HUD funcional: barra segmentada (1 segmento por clipe, enche com o tempo do clipe) e
 * contador 01/06 com troca "slot" no corte. Some no fim para o palco ficar livre.
 */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const k = clipIndexAt(frame);
  const cutF = CUT_FRAMES[k];
  const roll = prog(frame, cutF + 1, cutF + 7, EASE.out); // 0..1 (so depois do 1o corte)
  const rolling = k > 0 ? roll : 1;
  const out = prog(frame, 223, 231, EASE.inOut);
  // ja visivel no quadro 0 (o gancho precisa de HUD desde o primeiro frame); so a barra "enche"
  const intro = 1;
  const num = (n: number) => String(n).padStart(2, "0");
  const segs = [];
  for (let i = 0; i < 6; i++) {
    const a = CUT_FRAMES[i];
    const b = i < 5 ? CUT_FRAMES[i + 1] : END_FRAME - 6;
    const p = prog(frame, i === 0 ? -10 : a, b); // 1o segmento ja nasce com um pouco de enchimento
    segs.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: X0 + i * (SEG_W + GAP),
          top: BAR_Y,
          width: SEG_W,
          height: 8,
          backgroundColor: "rgba(18,10,36,0.62)",
          boxShadow: "0 0 0 2px rgba(255,248,231,0.14)",
        }}
      >
        <div
          style={{
            width: `${p * 100}%`,
            height: "100%",
            backgroundColor: i === k ? C.goldLight : C.gold,
          }}
        />
      </div>,
    );
  }
  const numStyle: React.CSSProperties = {
    fontFamily: FONT_DISPLAY,
    fontSize: 64,
    lineHeight: "72px",
    letterSpacing: 2,
  };
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // camada de topo: fica ACIMA do overlay Seal3D (dim/flash nao lava o contador 06/06)
        zIndex: 40,
        opacity: (1 - out) * intro,
      }}
    >
      {segs}
      <div
        style={{
          position: "absolute",
          left: X0,
          top: BAR_Y + 24,
          height: 72,
          display: "flex",
          alignItems: "center",
          backgroundColor: C.ink,
          padding: "0 22px",
          boxShadow: `inset 6px 0 0 ${C.gold}`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 66,
            height: 72,
            overflow: "hidden",
            marginLeft: 8,
          }}
        >
          <div
            style={{
              ...numStyle,
              position: "absolute",
              left: 0,
              top: 0,
              color: C.ivory,
              translate: `0 ${-rolling * 72}px`,
              opacity: 1 - rolling,
            }}
          >
            {num(Math.max(1, k))}
          </div>
          <div
            style={{
              ...numStyle,
              position: "absolute",
              left: 0,
              top: 0,
              color: C.goldLight,
              translate: `0 ${(1 - rolling) * 72}px`,
            }}
          >
            {num(k + 1)}
          </div>
        </div>
        <div style={{ ...numStyle, color: C.violetLight, marginLeft: 6 }}>/06</div>
      </div>
    </div>
  );
};
