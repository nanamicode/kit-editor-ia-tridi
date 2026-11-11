import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Anton";
import { C, FPS, T, clamp01 } from "./layout";
import { STAMP } from "./Seals";

/**
 * Camada 7: CTA. O "SAIBA MAIS" gigante some atras do cartao e o selo estampado voa para virar o
 * icone do botao; um cursor entra, e clica em "SEU!" (11.14 s). "GARANTA O SEU!" em sincronia com a fala.
 * Sem preco, prazo ou promocao. Legivel ate o ultimo quadro.
 *
 * CtaBase fica ABAIXO do canvas de selos da frente (o selo-icone precisa ficar por cima do botao);
 * CtaTop (cursor, ondas, faiscas) fica acima.
 */

const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });

export const PILL = { cx: 540, cy: 410, w: 860, h: 168 };
const ARROW = { x: PILL.cx + PILL.w / 2 - 84, y: PILL.cy, r: 56 };
const x0 = PILL.cx - PILL.w / 2;
const y0 = PILL.cy - PILL.h / 2;

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const pressAt = (t: number) => {
  // 0..1: botao afundado entre click-0.04 e click+0.12
  const a = interpolate(t, [T.click - 0.05, T.click, T.click + 0.14], [0, 1, 0], clampOpts);
  return a;
};

const Word: React.FC<{ text: string; inSec: number; color: string; gap?: number }> = ({
  text,
  inSec,
  color,
  gap = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - inSec * FPS, fps, config: { damping: 22, stiffness: 260, mass: 0.7 } });
  const op = interpolate(frame - inSec * FPS, [0, 1.5], [0, 1], clampOpts);
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: gap,
        opacity: op,
        scale: 1.14 - 0.14 * sp,
        translate: `0 ${(1 - sp) * -26}px`,
        color,
        transformOrigin: "50% 60%",
      }}
    >
      {text}
    </span>
  );
};

export const CtaBase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / FPS;
  if (t < T.pillIn - 0.05) return null;
  const p = spring({ frame: frame - T.pillIn * FPS, fps, config: { damping: 18, stiffness: 340, mass: 0.7 } });
  const press = pressAt(t);
  const idle = t > T.click + 0.3 ? Math.sin((t - T.click) * 2.6) : 0;
  const breathe = 1 + 0.012 * idle;
  const nudge = t > T.click + 0.2 ? 7 * Math.sin((t - T.click) * 5.2) * 0.5 + 3.5 : 0;
  const dockP = interpolate(t, [STAMP.hitSec - 0.03, STAMP.hitSec + 0.05], [0, 1], { ...clampOpts, easing: Easing.out(Easing.cubic) });
  const hoverArrow = interpolate(t, [T.click - 0.3, T.click], [0, 1], clampOpts);
  const dx = 12 * (1 - press * 0.85);
  const dy = 14 * (1 - press * 0.85);
  const pillScale = (0.62 + 0.38 * p) * breathe;
  const op = interpolate(t, [T.pillIn - 0.01, T.pillIn + 0.05], [0, 1], clampOpts);
  // foco unico do CTA: o botao acende em dourado no clique e depois pulsa (halos + brilho varrendo)
  const sinceClick = t - T.click;
  const clickGlow = sinceClick >= 0 ? Math.exp(-sinceClick * 4.5) : 0;
  const loopT = Math.max(0, sinceClick - 0.35);
  const idleGlow = sinceClick > 0.35 ? 0.5 + 0.5 * Math.sin(loopT * 7) : 0;
  // "SEU!" (11.14 s): pulso menor no mesmo botao, sem novo elemento
  const seuGlow = t >= T.seuIn ? Math.exp(-(t - T.seuIn) * 5) : 0;
  const glowPx = 10 + 34 * clickGlow + 14 * idleGlow + 18 * seuGlow;
  const glowA = 0.18 + 0.7 * clickGlow + 0.28 * idleGlow + 0.4 * seuGlow;
  const halo = (k: number) => {
    if (sinceClick < 0.3) return null;
    const ph = (((sinceClick - 0.3) / 0.95 + k * 0.5) % 1 + 1) % 1;
    const grow = 12 + 46 * Easing.out(Easing.cubic)(ph);
    return (
      <rect
        key={k}
        x={x0 - grow}
        y={y0 - grow}
        width={PILL.w + grow * 2}
        height={PILL.h + grow * 2}
        rx={PILL.h / 2 + grow}
        fill="none"
        stroke={C.goldLight}
        strokeWidth={6 * (1 - ph) + 1}
        opacity={0.55 * (1 - ph)}
      />
    );
  };
  // brilho que varre o botao de tempos em tempos
  const glintCycle = 1.5;
  const glintPh = sinceClick > 0.6 ? ((sinceClick - 0.6) % glintCycle) / glintCycle : 2;
  const glintX = x0 - 120 + (PILL.w + 240) * Easing.inOut(Easing.quad)(Math.min(1, glintPh / 0.5));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${PILL.cx}px ${PILL.cy}px`,
          scale: pillScale,
          opacity: op,
          filter: `drop-shadow(0 0 ${glowPx}px rgba(255,216,107,${glowA}))`,
        }}
      >
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <clipPath id="prPillClip">
              <rect x={x0} y={y0} width={PILL.w} height={PILL.h} rx={PILL.h / 2} />
            </clipPath>
          </defs>
          {halo(0)}
          {halo(1)}
          {/* sombra dura (violeta) que colapsa ao pressionar */}
          <rect x={x0 + dx} y={y0 + dy} width={PILL.w} height={PILL.h} rx={PILL.h / 2} fill={C.purple} />
          <g transform={`translate(${(12 - dx) * 0.8} ${(14 - dy) * 0.8})`}>
            <rect x={x0} y={y0} width={PILL.w} height={PILL.h} rx={PILL.h / 2} fill={C.goldLight} />
            <rect x={x0} y={y0} width={PILL.w} height={PILL.h} rx={PILL.h / 2} fill="none" stroke={C.ink} strokeWidth={5} />
            {glintPh <= 0.5 ? (
              <g clipPath="url(#prPillClip)">
                <path d={`M ${glintX} ${y0 - 10} l 46 0 l -40 ${PILL.h + 20} l -46 0 Z`} fill="#FFF8E7" opacity={0.55} />
              </g>
            ) : null}
            {/* brilho de relevo no topo */}
            <path
              d={`M ${x0 + 90} ${y0 + 18} H ${x0 + PILL.w - 90}`}
              stroke="#FFF8E7"
              strokeOpacity={0.7}
              strokeWidth={6}
              strokeLinecap="round"
            />
            {/* encaixe do selo: ja existe (vazio) quando o botao nasce; o selo cai nele em hitSec */}
            <circle cx={STAMP.dock[0]} cy={PILL.cy} r={(STAMP.dockR + 9) * (0.9 + 0.1 * dockP)} fill={C.ink} />
            {/* botao-seta */}
            <circle cx={ARROW.x} cy={ARROW.y} r={ARROW.r * (1 + 0.08 * hoverArrow)} fill={C.ink} />
            <g transform={`translate(${nudge} 0)`}>
              <path
                d={`M ${ARROW.x - 22} ${ARROW.y} H ${ARROW.x + 20} M ${ARROW.x + 4} ${ARROW.y - 18} L ${ARROW.x + 22} ${ARROW.y} L ${ARROW.x + 4} ${ARROW.y + 18}`}
                fill="none"
                stroke={C.goldLight}
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </svg>
        <div
          style={{
            position: "absolute",
            left: x0 + 172,
            width: PILL.w - 172 - 172,
            top: y0 + (14 - dy) * 0.8 + 12 * 0 + (PILL.h - 112) / 2 + 2,
            height: 112,
            fontFamily,
            fontSize: 92,
            lineHeight: "112px",
            letterSpacing: 3,
            color: C.ink,
            textAlign: "center",
            whiteSpace: "nowrap",
            translate: `${(12 - dx) * 0.8}px 0`,
          }}
        >
          SAIBA MAIS
        </div>
      </div>
      {/* GARANTA O SEU! */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          top: 556,
          height: 120,
          textAlign: "center",
          fontFamily,
          fontSize: 100,
          lineHeight: "120px",
          letterSpacing: 3,
          whiteSpace: "nowrap",
          textShadow: `0 5px 0 ${C.ink}`,
        }}
      >
        <Word text="GARANTA" inSec={T.garantaIn} color={C.ivory} gap={26} />
        <Word text="O" inSec={T.oIn} color={C.ivory} gap={26} />
        <Word text="SEU!" inSec={T.seuIn} color={C.goldLight} />
      </div>
    </div>
  );
};

const CURSOR_PATH = "M2 2 L2 70 L19 54 L31 82 L44 76 L32 49 L56 49 Z";

export const CtaTop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < 9.7) return null;
  const tgt = { x: ARROW.x + 8, y: ARROW.y + 10 };
  const start = { x: 1010, y: 640 };
  // chega ao botao no "Saiba" e clica em T.click (ding do audio)
  const p = interpolate(t, [9.82, T.click - 0.03], [0, 1], { ...clampOpts, easing: Easing.bezier(0.4, 0, 0.15, 1) });
  // trajetoria curva (controle deslocado)
  const cxp = start.x + (tgt.x - start.x) * p + 70 * Math.sin(p * Math.PI);
  const cyp = start.y + (tgt.y - start.y) * p - 40 * Math.sin(p * Math.PI);
  const press = pressAt(t);
  const idleY = t > T.click + 0.2 ? 5 * Math.sin((t - T.click) * 3.1) : 0;
  const curOp = interpolate(t, [9.8, 9.9], [0, 1], clampOpts);
  const rp = clamp01((t - T.click) / 0.5);
  const rp2 = clamp01((t - T.click - 0.08) / 0.5);
  const burstP = clamp01((t - T.click) / 0.32);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {rp > 0 && rp < 1 ? (
          <>
            <circle cx={ARROW.x} cy={ARROW.y} r={ARROW.r + 160 * Easing.out(Easing.cubic)(rp)} fill="none" stroke={C.goldLight} strokeWidth={8 * (1 - rp)} opacity={1 - rp} />
            <circle cx={ARROW.x} cy={ARROW.y} r={ARROW.r + 110 * Easing.out(Easing.cubic)(rp2)} fill="none" stroke={C.ivory} strokeWidth={4 * (1 - rp2)} opacity={(1 - rp2) * 0.8} />
          </>
        ) : null}
        {burstP > 0 && burstP < 1
          ? Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2 + 0.2;
              const e = Easing.out(Easing.cubic)(burstP);
              const r0 = ARROW.r + 12 + e * 48 + (i % 3) * 7;
              const r1 = r0 + 12 + 16 * (1 - burstP);
              return (
                <line
                  key={i}
                  x1={ARROW.x + Math.cos(a) * r0}
                  y1={ARROW.y + Math.sin(a) * r0}
                  x2={ARROW.x + Math.cos(a) * r1}
                  y2={ARROW.y + Math.sin(a) * r1}
                  stroke={i % 2 ? C.goldLight : C.ivory}
                  strokeWidth={7}
                  strokeLinecap="round"
                  opacity={1 - burstP * 0.7}
                />
              );
            })
          : null}
        <g
          transform={`translate(${cxp} ${cyp + idleY}) scale(${1 - 0.18 * press})`}
          opacity={curOp}
          style={{ filter: "drop-shadow(5px 8px 6px rgba(10,4,24,0.6))" }}
        >
          <path d={CURSOR_PATH} fill={C.ivory} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
};
