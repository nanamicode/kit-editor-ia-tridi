import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, FONT_DISPLAY, FONT_TEXT, H, prog } from "./theme";
import type { ClipDef } from "./timeline";

/**
 * Linha de texto cinetica: placa que abre (scaleX por mascara), letras que sobem de
 * dentro da mascara (mola, 1 quadro de atraso por letra) e saida acelerada.
 * `headroom` aumenta a caixa PARA CIMA: o til de "Õ"/"Ã" e o acento agudo de "É" ficam
 * dentro da placa e da mascara (antes eram cortados pelo topo).
 */
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
  /** +1: abre da esquerda p/ a direita; -1: abre da direita p/ a esquerda */
  dir?: 1 | -1;
}> = ({
  text,
  size,
  family,
  weight = 400,
  color,
  plate,
  bar,
  f0,
  out,
  height,
  headroom = 0,
  padX,
  tracking = 0,
  dir = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // placa e texto compartilham UMA mascara (mesmo progresso de entrada/saida): a placa
  // nunca aparece vazia. Saida = corte seco por mascara (opacidade sempre 1).
  const pIn = prog(frame, f0, f0 + 6, EASE.out);
  const pOut = prog(frame, out, out + 5, EASE.in);
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
        clipPath:
          dir === 1
            ? `inset(0 ${openPct}% 0 ${outPct}%)`
            : `inset(0 ${outPct}% 0 ${openPct}%)`,
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
          // as letras ja chegam a ~40% da subida no 1o quadro: nunca ha placa sem texto
          const s = spring({
            frame: frame - f0 + 5 - Math.min(i * 0.3, 2.5),
            fps,
            config: { damping: 18, stiffness: 220, mass: 0.6 },
            durationInFrames: 9,
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                translate: `0 ${(1 - s) * height * 0.9}px`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Corpo da linha de apoio (px). Maiusculas Montserrat 800: altura de capitular ~0.72em. */
export const SUPPORT_SIZE = 52;
const SUPPORT_H = 84;
/** folga acima da capitular p/ til/acento (fracao do corpo do titulo) */
const HEADROOM = 0.26;

/**
 * Rotulo principal (linhas) + linha de apoio, posicionado por `def.labelPos`:
 * lado esquerdo/direito, ancorado no topo ou na base, ou o titulo girado na vertical.
 */
export const LabelBlock: React.FC<{ def: ClipDef }> = ({ def }) => {
  const fs = def.label.size;
  const lineH = Math.round(fs * 1.12);
  const headroom = Math.round(fs * HEADROOM);
  const f0 = def.labelIn;
  const out = def.labelOut;
  const lines = def.label.lines;
  const pos = def.labelPos;
  const dir: 1 | -1 = pos.side === "left" || pos.vertical ? 1 : -1;
  const main = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {lines.map((t, i) => (
        <KLine
          key={t}
          text={t}
          size={fs}
          family={FONT_DISPLAY}
          color={C.ivory}
          plate={C.ink}
          bar={C.gold}
          f0={f0 + i * 3}
          out={out + (lines.length - 1 - i) * 2}
          height={lineH}
          headroom={headroom}
          padX={30}
          tracking={2}
          dir={dir}
        />
      ))}
    </div>
  );
  const support = def.support ? (
    <KLine
      text={def.support}
      size={SUPPORT_SIZE}
      family={FONT_TEXT}
      weight={800}
      color={C.ink}
      plate={C.gold}
      bar={null}
      f0={f0 + 4}
      out={out - 1}
      height={SUPPORT_H}
      headroom={0}
      padX={26}
      tracking={1.5}
      dir={dir}
    />
  ) : null;

  const side: React.CSSProperties =
    pos.side === "left" ? { left: 80 } : { right: 80 };
  const vert = pos.anchor === "bottom" ? { bottom: H - pos.y } : { top: pos.y };

  if (pos.vertical) {
    // titulo na vertical (le de baixo p/ cima) + apoio horizontal separado
    return (
      <>
        <div
          style={{
            position: "absolute",
            left: pos.vertical.x,
            top: pos.vertical.yBottom,
            transformOrigin: "0 0",
            rotate: "-90deg",
          }}
        >
          {main}
        </div>
        <div style={{ position: "absolute", ...side, ...vert }}>{support}</div>
      </>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        ...side,
        ...vert,
        display: "flex",
        flexDirection: "column",
        alignItems: pos.side === "left" ? "flex-start" : "flex-end",
      }}
    >
      {main}
      {support ? <div style={{ height: 2 }} /> : null}
      {support}
    </div>
  );
};
