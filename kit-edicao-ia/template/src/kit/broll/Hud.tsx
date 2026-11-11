/**
 * HUD funcional: barra segmentada (1 segmento por clipe, enche com o tempo do clipe) e
 * contador 01/NN com troca "slot" no corte. Ja visivel no 1o quadro (gancho). Some nos
 * ultimos ~0.37 s para liberar o palco. zIndex 40: fica acima de overlays irmaos (selo 3D).
 */
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, prog, useBrand } from "../theme";
import { alpha } from "./color";
import { fr } from "./plan";

export type HudProps = {
  /** quadros absolutos dos cortes (1 por clipe) */
  cuts: number[];
  /** quadro final do B-roll */
  end: number;
  /** topo da barra px. Default 252 (abaixo da zona de UI do Reels) */
  y?: number;
  /** margem esquerda e largura da barra. Default 80 / 920 */
  x?: number;
  width?: number;
};

export const Hud: React.FC<HudProps> = ({ cuts, end, y = 252, x = 80, width = 920 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useBrand();
  const n = cuts.length;
  const GAP = 12;
  const segW = (width - GAP * (n - 1)) / n;
  let k = 0;
  for (let i = 0; i < n; i++) if (frame >= cuts[i]) k = i;
  const cutF = cuts[k];
  const roll = prog(frame, cutF + 1, cutF + fr(7, fps), EASE.out);
  const rolling = k > 0 ? roll : 1;
  const out = prog(frame, end - fr(11, fps), end - fr(3, fps), EASE.inOut);
  const num = (v: number) => String(v).padStart(2, "0");
  const numStyle: React.CSSProperties = {
    fontFamily: fonts.display,
    fontSize: 64,
    lineHeight: "72px",
    letterSpacing: 2,
  };
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, opacity: 1 - out }}>
      {cuts.map((a, i) => {
        const b = i < n - 1 ? cuts[i + 1] : end - fr(6, fps);
        const p = prog(frame, i === 0 ? a - fr(10, fps) : a, b);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + i * (segW + GAP),
              top: y,
              width: segW,
              height: 8,
              backgroundColor: alpha(colors.ink, 0.62),
              boxShadow: `0 0 0 2px ${alpha(colors.text, 0.14)}`,
            }}
          >
            <div
              style={{
                width: `${p * 100}%`,
                height: "100%",
                backgroundColor: i === k ? colors.accentLight : colors.accent,
              }}
            />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y + 24,
          height: 72,
          display: "flex",
          alignItems: "center",
          backgroundColor: colors.ink,
          padding: "0 22px",
          boxShadow: `inset 6px 0 0 ${colors.accent}`,
        }}
      >
        <div style={{ position: "relative", width: 66, height: 72, overflow: "hidden", marginLeft: 8 }}>
          <div
            style={{
              ...numStyle,
              position: "absolute",
              left: 0,
              top: 0,
              color: colors.text,
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
              color: colors.accentLight,
              translate: `0 ${(1 - rolling) * 72}px`,
            }}
          >
            {num(k + 1)}
          </div>
        </div>
        <div style={{ ...numStyle, color: colors.primaryLight, marginLeft: 6 }}>/{num(n)}</div>
      </div>
    </div>
  );
};
