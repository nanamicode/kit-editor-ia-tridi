import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { C, FONT_DISPLAY, FONT_TEXT } from "../scenes/broll/theme";
import type { HookId } from "./HookContext";

/**
 * Ganchos (0–3 s) sobre o corpo validado do V01 ("CLAUDE FV 09 V1").
 * Linha do tempo do B-roll (quadros a 30 fps): clipe 1 envelope 0–39 (pressao P=11, relevo R=18),
 * clipe 2 adesivo 39–85 (P=46, R=53; rotulo vertical a direita, y 690–1300), clipe 3 a partir de 85
 * (rotulo no topo). Por isso o gancho vive no bloco y 410–800 (dentro do 4:5) e sai ate o quadro 80.
 * O rotulo original do clipe 1 ("SEU LOGO EM RELEVO") e escondido nas variantes (ver LabelBlock).
 * Regra: o texto ja esta inteiro no quadro 0 (miniatura/autoplay), so assenta com escala.
 */

const OUT = 72; // inicio da saida
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const outExpo = Easing.bezier(0.22, 1, 0.36, 1);

/** Placa de texto no estilo dos rotulos do V01: caixa tinta, barra dourada a esquerda. */
const Plate: React.FC<{
  children: React.ReactNode;
  size: number;
  color?: string;
  bar?: string;
  style?: React.CSSProperties;
}> = ({ children, size, color = C.ivory, bar = C.gold, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      background: C.ink,
      borderLeft: `12px solid ${bar}`,
      padding: `${Math.round(size * 0.1)}px ${Math.round(size * 0.22)}px ${Math.round(size * 0.06)}px`,
      fontFamily: FONT_DISPLAY,
      fontSize: size,
      lineHeight: 1.08,
      color,
      whiteSpace: "nowrap",
      boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Entrada/saida comum: escala que assenta (1.06 -> 1 em 8 quadros) e saida para cima. */
const useBlockMotion = () => {
  const f = useCurrentFrame();
  const settle = 1 + 0.06 * (1 - outExpo(clamp01(f / 8)));
  const outP = Easing.in(Easing.cubic)(clamp01((f - OUT) / 9));
  return { f, scale: settle, x: -outP * 140, opacity: 1 - outP };
};

const Block: React.FC<{ children: React.ReactNode; top?: number; extraTransform?: string }> = ({
  children,
  top = 430,
  extraTransform = "",
}) => {
  const m = useBlockMotion();
  if (m.f > OUT + 10) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 14,
        transformOrigin: "0% 0%",
        transform: `translateX(${m.x.toFixed(1)}px) scale(${m.scale.toFixed(4)}) ${extraTransform}`,
        opacity: m.opacity,
      }}
    >
      {children}
    </div>
  );
};

/* ---------------------------------------------------------- H1 sem tinta ---- */
const H1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = 11;
  const slam = spring({ frame: f - P, fps, config: { damping: 11, stiffness: 260, mass: 0.6 } });
  const shake = f >= P && f < P + 8 ? Math.sin((f - P) * 2.6) * (8 - (f - P)) * 1.6 : 0;
  const flash = f >= P ? Math.max(0, 1 - (f - P) / 5) : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash * 0.55 }} />
      <Block extraTransform={`translateX(${shake.toFixed(1)}px)`}>
        <Plate size={140}>SEM TINTA.</Plate>
        <div style={{ opacity: f < P ? 0 : 1, transform: `scale(${(1.35 - 0.35 * slam).toFixed(4)})`, transformOrigin: "0% 50%" }}>
          <Plate size={140} color={C.ink} bar={C.ink} style={{ background: C.gold }}>
            SÓ PRESSÃO.
          </Plate>
        </div>
      </Block>
      <Sequence from={P - 1} durationInFrames={20} layout="none">
        <Audio src={staticFile("tridi/sfx/hit-madeira-seco-01.wav")} volume={0.55} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------- H2 passa o dedo ---- */
const Arrow: React.FC<{ f: number }> = ({ f }) => {
  const bob = Math.sin(f * 0.45) * 14;
  return (
    <svg width={150} height={190} viewBox="0 0 150 190" style={{ transform: `translateY(${bob.toFixed(1)}px)` }}>
      <path d="M75 8 L75 150" stroke={C.gold} strokeWidth={20} strokeLinecap="round" />
      <path d="M22 104 L75 162 L128 104" stroke={C.gold} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

const Pulse: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const p = clamp01((f - at) / 16);
  if (f < at || p >= 1) return null;
  const r = 60 + 200 * outExpo(p);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `8px solid ${C.goldLight}`,
        opacity: 1 - p,
      }}
    />
  );
};

const H2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* relevo do envelope aparece ~ (300,1000); do adesivo ~ (480,1010) */}
      <Pulse f={f} at={18} x={330} y={1010} />
      <Pulse f={f} at={60} x={440} y={1080} />
      <Block>
        <Plate size={140}>PASSA O DEDO</Plate>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Plate size={140} color={C.ink} bar={C.ink} style={{ background: C.gold }}>
            AQUI
          </Plate>
          <Arrow f={f} />
        </div>
      </Block>
      <Sequence from={17} durationInFrames={20} layout="none">
        <Audio src={staticFile("tridi/sfx/pop-bolha-ui-01.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------- H3 nao precisa ser cara ---- */
const H3: React.FC = () => {
  const f = useCurrentFrame();
  const strike = outExpo(clamp01((f - 12) / 9));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Block top={410}>
        <Plate size={118}>SUA EMBALAGEM</Plate>
        <Plate size={118}>NÃO PRECISA</Plate>
        <Plate size={118}>
          SER&nbsp;
          <span style={{ position: "relative", color: C.gold }}>
            CARA
            <span
              style={{
                position: "absolute",
                left: -10,
                top: "50%",
                height: 16,
                width: `calc((100% + 20px) * ${strike.toFixed(4)})`,
                background: C.ivory,
                transform: "translateY(-30%) rotate(-6deg)",
                transformOrigin: "0% 50%",
                boxShadow: `0 0 0 4px ${C.ink}`,
              }}
            />
          </span>
        </Plate>
      </Block>
      <Sequence from={11} durationInFrames={20} layout="none">
        <Audio src={staticFile("tridi/sfx/whoosh-rapido-curto-01.wav")} volume={0.45} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------- H4 6 lugares ---- */
const H4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 220, mass: 0.7 } });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Block top={410}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 330,
              lineHeight: 0.9,
              color: C.gold,
              textShadow: `0 10px 0 ${C.ink}, 0 0 40px rgba(18,10,36,0.7)`,
              transform: `scale(${interpolate(pop, [0, 1], [1.12, 1]).toFixed(4)})`,
              transformOrigin: "50% 60%",
            }}
          >
            6
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Plate size={96}>LUGARES PRA</Plate>
            <Plate size={96}>CHANCELAR</Plate>
          </div>
        </div>
        <Plate size={96} color={C.ink} bar={C.ink} style={{ background: C.gold }}>
          A SUA MARCA
        </Plate>
        <div
          style={{
            fontFamily: FONT_TEXT,
            fontWeight: 800,
            fontSize: 44,
            color: C.ivory,
            background: "rgba(18,10,36,0.82)",
            padding: "6px 16px",
            letterSpacing: "0.04em",
          }}
        >
          ASSISTE ATÉ O 6º
        </div>
      </Block>
      <Sequence from={0} durationInFrames={20} layout="none">
        <Audio src={staticFile("tridi/sfx/hit-madeira-seco-01.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const HookOverlay: React.FC<{ hook: HookId }> = ({ hook }) => {
  const f = useCurrentFrame();
  if (f > OUT + 12) return null;
  return (
    <AbsoluteFill style={{ zIndex: 60, pointerEvents: "none" }}>
      {hook === "h1" ? <H1 /> : hook === "h2" ? <H2 /> : hook === "h3" ? <H3 /> : <H4 />}
    </AbsoluteFill>
  );
};
