/**
 * Rotulo cinetico: titulo (1-2 linhas, placa escura + barra de acento) + linha de apoio
 * (placa de acento). Placa e texto compartilham UMA mascara (clip-path) com o mesmo
 * progresso: a placa nunca aparece vazia. Letras sobem de dentro da mascara (mola, atraso
 * por letra) ja a ~40% no 1o quadro. `headroom` (26% do corpo) aumenta a caixa PARA CIMA:
 * til de "Õ/Ã" e acento de "É" nao sao cortados. Saida = corte seco por mascara + 70 px.
 * Padrao aprovado: lado esquerdo, ancorado pela BASE (mesma posicao em todos os clipes).
 */
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, prog, useBrand } from "../theme";
import { fr } from "./plan";

const KLine: React.FC<{
  text: string;
  size: number;
  family: string;
  weight?: number;
  color: string;
  plate: string;
  bar: string | null;
  f0: number;
  out: number;
  height: number;
  headroom?: number;
  padX: number;
  tracking?: number;
  dir?: 1 | -1;
}> = ({ text, size, family, weight = 400, color, plate, bar, f0, out, height, headroom = 0, padX, tracking = 0, dir = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pIn = prog(frame, f0, f0 + fr(6, fps), EASE.out);
  const pOut = prog(frame, out, out + fr(5, fps), EASE.in);
  if (frame < f0 || pOut >= 1) return null;
  const chars = Array.from(text);
  const openPct = ((1 - pIn) * 100).toFixed(2);
  const outPct = (pOut * 100).toFixed(2);
  const total = height + headroom;
  return (
    <div
      style={{
        position: "relative",
        height: total,
        display: "inline-flex",
        alignItems: "center",
        padding: `0 ${padX}px`,
        translate: `${dir * pOut * 70}px 0`,
        marginBottom: 10,
        alignSelf: dir === 1 ? "flex-start" : "flex-end",
        clipPath: dir === 1 ? `inset(0 ${openPct}% 0 ${outPct}%)` : `inset(0 ${outPct}% 0 ${openPct}%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: plate,
          boxShadow: bar ? `inset 10px 0 0 ${bar}` : undefined,
        }}
      />
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          whiteSpace: "pre",
          fontFamily: family,
          fontWeight: weight,
          fontSize: size,
          lineHeight: `${height}px`,
          height: total,
          paddingTop: headroom,
          color,
          letterSpacing: tracking,
          paddingLeft: bar ? 10 : 0,
        }}
      >
        {chars.map((ch, i) => {
          const s = spring({
            frame: frame - f0 + fr(5, fps) - Math.min(i * 0.3, 2.5),
            fps,
            config: { damping: 18, stiffness: 220, mass: 0.6 },
            durationInFrames: fr(9, fps),
          });
          return (
            <span key={i} style={{ display: "inline-block", translate: `0 ${(1 - s) * height * 0.9}px` }}>
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** folga acima da capitular p/ til/acento (fracao do corpo do titulo) */
const HEADROOM = 0.26;

export type KineticLabelProps = {
  /** linhas do titulo (1-2) */
  lines: string[];
  /** corpo do titulo px (>= 84) */
  size: number;
  support?: string;
  /** corpo da linha de apoio px. Default 52 (minimo 44) */
  supportSize?: number;
  /** quadros absolutos de entrada e de inicio da saida */
  f0: number;
  out: number;
  side?: "left" | "right";
  /** BASE do bloco em px de tela */
  y: number;
  /** margem lateral px. Default 80 */
  margin?: number;
};

export const KineticLabel: React.FC<KineticLabelProps> = ({
  lines,
  size,
  support,
  supportSize = 52,
  f0,
  out,
  side = "left",
  y,
  margin = 80,
}) => {
  const { colors, fonts } = useBrand();
  const { height: H, fps } = useVideoConfig();
  const fs = Math.max(84, size);
  const ss = Math.max(44, supportSize);
  const lineH = Math.round(fs * 1.12);
  const headroom = Math.round(fs * HEADROOM);
  const dir: 1 | -1 = side === "left" ? 1 : -1;
  return (
    <div
      style={{
        position: "absolute",
        ...(side === "left" ? { left: margin } : { right: margin }),
        bottom: H - y,
        display: "flex",
        flexDirection: "column",
        alignItems: side === "left" ? "flex-start" : "flex-end",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {lines.map((t, i) => (
          <KLine
            key={`${i}-${t}`}
            text={t}
            size={fs}
            family={fonts.display}
            color={colors.text}
            plate={colors.ink}
            bar={colors.accent}
            f0={f0 + i * fr(3, fps)}
            out={out + (lines.length - 1 - i) * fr(2, fps)}
            height={lineH}
            headroom={headroom}
            padX={30}
            tracking={2}
            dir={dir}
          />
        ))}
      </div>
      {support ? (
        <>
          <div style={{ height: 2 }} />
          <KLine
            text={support}
            size={ss}
            family={fonts.text}
            weight={800}
            color={colors.ink}
            plate={colors.accent}
            bar={null}
            f0={f0 + fr(4, fps)}
            out={out - fr(1, fps)}
            height={Math.round(ss * 1.615)}
            padX={26}
            tracking={1.5}
            dir={dir}
          />
        </>
      ) : null}
    </div>
  );
};
