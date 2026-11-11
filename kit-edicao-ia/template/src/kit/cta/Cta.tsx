import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../theme";
import { chave, type PalavraTempo } from "../legendas/dados";

export type CtaPill = { cx: number; cy: number; w: number; h: number };

export type CtaProps = {
  /** texto do botao (curto: 1-2 palavras) */
  label?: string;
  labelSize?: number;
  /** botao nasce (s) — junto da fala/pop de UI que o anuncia */
  pillInSec: number;
  /** clique do cursor (s): botao afunda, acende e passa a pulsar */
  clickSec: number;
  /** pulsos extras do brilho no mesmo botao (s), ex.: a ultima palavra da fala */
  pulseSecs?: number[];
  pill?: CtaPill;
  /** encaixe circular escuro a esquerda (onde cai um selo/icone). x absoluto; null = sem encaixe */
  socket?: { x: number; r: number; fillSec?: number } | null;
  /** cursor que entra e clica no botao-seta. null = sem cursor */
  cursor?: { from: [number, number]; showSec: number } | null;
  /** titulo abaixo do botao, palavra a palavra na fala real. null = sem titulo */
  headline?: {
    words: PalavraTempo[];
    /** palavras na cor de destaque (comparadas sem acento/pontuacao) */
    highlight?: string[];
    /** topo da linha (px) */
    top?: number;
    size?: number;
    gap?: number;
  } | null;
};

export const PILL_V02: CtaPill = { cx: 540, cy: 410, w: 860, h: 168 };

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** hex da marca -> rgba (tom derivado para brilho) */
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const geo = (pill: CtaPill) => ({
  x0: pill.cx - pill.w / 2,
  y0: pill.cy - pill.h / 2,
  arrow: { x: pill.cx + pill.w / 2 - 84, y: pill.cy, r: 56 },
});

/** 0..1: botao afundado entre click-0.05 e click+0.14 */
const pressAt = (t: number, click: number) => interpolate(t, [click - 0.05, click, click + 0.14], [0, 1, 0], clampOpts);

/* ----------------------------------------------------------------- botao -- */

/** Botao (pilula dourada com sombra dura que colapsa no clique, halos, brilho varrendo, encaixe e seta). */
export const CtaBotao: React.FC<CtaProps> = ({
  label = "SAIBA MAIS",
  labelSize = 92,
  pillInSec,
  clickSec,
  pulseSecs = [],
  pill = PILL_V02,
  socket,
}) => {
  const brand = useBrand();
  const C = brand.colors;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const clipId = "ctaClip" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const t = frame / fps;
  if (t < pillInSec - 0.05) return null;
  const { x0, y0, arrow: A } = geo(pill);
  const sock = socket === undefined ? { x: x0 + 88, r: 60 } : socket;

  const p = spring({ frame: frame - pillInSec * fps, fps, config: { damping: 18, stiffness: 340, mass: 0.7 } });
  const press = pressAt(t, clickSec);
  const sinceClick = t - clickSec;
  const idle = sinceClick > 0.3 ? Math.sin(sinceClick * 2.6) : 0;
  const nudge = sinceClick > 0.2 ? 7 * Math.sin(sinceClick * 5.2) * 0.5 + 3.5 : 0;
  const fillSec = sock && sock.fillSec !== undefined ? sock.fillSec : Infinity;
  const dockP = interpolate(t, [fillSec - 0.03, fillSec + 0.05], [0, 1], { ...clampOpts, easing: Easing.out(Easing.cubic) });
  const hoverArrow = interpolate(t, [clickSec - 0.3, clickSec], [0, 1], clampOpts);
  const dx = 12 * (1 - press * 0.85);
  const dy = 14 * (1 - press * 0.85);
  const pillScale = (0.62 + 0.38 * p) * (1 + 0.012 * idle);
  const op = interpolate(t, [pillInSec - 0.01, pillInSec + 0.05], [0, 1], clampOpts);
  // foco unico: acende no clique e depois pulsa (halos + brilho varrendo); pulsos extras sem novo elemento
  const clickGlow = sinceClick >= 0 ? Math.exp(-sinceClick * 4.5) : 0;
  const idleGlow = sinceClick > 0.35 ? 0.5 + 0.5 * Math.sin((sinceClick - 0.35) * 7) : 0;
  let pulse = 0;
  for (const s of pulseSecs) if (t >= s) pulse += Math.exp(-(t - s) * 5);
  const glowPx = 10 + 34 * clickGlow + 14 * idleGlow + 18 * pulse;
  const glowA = 0.18 + 0.7 * clickGlow + 0.28 * idleGlow + 0.4 * pulse;
  const halo = (k: number) => {
    if (sinceClick < 0.3) return null;
    const ph = ((((sinceClick - 0.3) / 0.95 + k * 0.5) % 1) + 1) % 1;
    const grow = 12 + 46 * Easing.out(Easing.cubic)(ph);
    return (
      <rect
        key={k}
        x={x0 - grow}
        y={y0 - grow}
        width={pill.w + grow * 2}
        height={pill.h + grow * 2}
        rx={pill.h / 2 + grow}
        fill="none"
        stroke={C.accentLight}
        strokeWidth={6 * (1 - ph) + 1}
        opacity={0.55 * (1 - ph)}
      />
    );
  };
  const glintPh = sinceClick > 0.6 ? ((sinceClick - 0.6) % 1.5) / 1.5 : 2;
  const glintX = x0 - 120 + (pill.w + 240) * Easing.inOut(Easing.quad)(Math.min(1, glintPh / 0.5));
  const lift = (12 - dx) * 0.8;
  const liftY = (14 - dy) * 0.8;
  const labelInset = 172;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${pill.cx}px ${pill.cy}px`,
        scale: pillScale,
        opacity: op,
        filter: `drop-shadow(0 0 ${glowPx}px ${rgba(C.accentLight, glowA)})`,
      }}
    >
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <clipPath id={clipId}>
            <rect x={x0} y={y0} width={pill.w} height={pill.h} rx={pill.h / 2} />
          </clipPath>
        </defs>
        {halo(0)}
        {halo(1)}
        {/* sombra dura que colapsa ao pressionar */}
        <rect x={x0 + dx} y={y0 + dy} width={pill.w} height={pill.h} rx={pill.h / 2} fill={C.primary} />
        <g transform={`translate(${lift} ${liftY})`}>
          <rect x={x0} y={y0} width={pill.w} height={pill.h} rx={pill.h / 2} fill={C.accentLight} />
          <rect x={x0} y={y0} width={pill.w} height={pill.h} rx={pill.h / 2} fill="none" stroke={C.ink} strokeWidth={5} />
          {glintPh <= 0.5 ? (
            <g clipPath={`url(#${clipId})`}>
              <path d={`M ${glintX} ${y0 - 10} l 46 0 l -40 ${pill.h + 20} l -46 0 Z`} fill={C.text} opacity={0.55} />
            </g>
          ) : null}
          <path d={`M ${x0 + 90} ${y0 + 18} H ${x0 + pill.w - 90}`} stroke={C.text} strokeOpacity={0.7} strokeWidth={6} strokeLinecap="round" />
          {sock ? <circle cx={sock.x} cy={pill.cy} r={(sock.r + 9) * (0.9 + 0.1 * dockP)} fill={C.ink} /> : null}
          <circle cx={A.x} cy={A.y} r={A.r * (1 + 0.08 * hoverArrow)} fill={C.ink} />
          <g transform={`translate(${nudge} 0)`}>
            <path
              d={`M ${A.x - 22} ${A.y} H ${A.x + 20} M ${A.x + 4} ${A.y - 18} L ${A.x + 22} ${A.y} L ${A.x + 4} ${A.y + 18}`}
              fill="none"
              stroke={C.accentLight}
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
          left: x0 + labelInset,
          width: pill.w - labelInset * 2,
          top: y0 + liftY + (pill.h - 112) / 2 + 2,
          height: 112,
          fontFamily: brand.fonts.display,
          fontSize: labelSize,
          lineHeight: "112px",
          letterSpacing: 3,
          color: C.ink,
          textAlign: "center",
          whiteSpace: "nowrap",
          translate: `${lift}px 0`,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- titulo -- */

const Word: React.FC<{ text: string; inSec: number; color: string; gap: number }> = ({ text, inSec, color, gap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - inSec * fps, fps, config: { damping: 22, stiffness: 260, mass: 0.7 } });
  const op = interpolate(frame - inSec * fps, [0, 1.5], [0, 1], clampOpts);
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

/** Titulo do CTA (ex.: "GARANTA O SEU!"): cada palavra cai no instante em que e dita. */
export const CtaTitulo: React.FC<Pick<CtaProps, "headline">> = ({ headline }) => {
  const brand = useBrand();
  const { width } = useVideoConfig();
  if (!headline || !headline.words.length) return null;
  const { words, highlight = [], top = 556, size = 100, gap = 26 } = headline;
  const hl = highlight.map(chave);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width,
        top,
        height: size * 1.2,
        textAlign: "center",
        fontFamily: brand.fonts.display,
        fontSize: size,
        lineHeight: `${size * 1.2}px`,
        letterSpacing: 3,
        whiteSpace: "nowrap",
        textShadow: `0 5px 0 ${brand.colors.ink}`,
      }}
    >
      {words.map((w, i) => (
        <Word
          key={i}
          text={w.text}
          inSec={w.s}
          gap={i < words.length - 1 ? gap : 0}
          color={hl.indexOf(chave(w.text)) >= 0 ? brand.colors.accentLight : brand.colors.text}
        />
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------- cursor -- */

const CURSOR_PATH = "M2 2 L2 70 L19 54 L31 82 L44 76 L32 49 L56 49 Z";

/** Cursor em curva ate a seta, clique (encolhe) + ondas e faiscas. Fica ACIMA de selos/icones. */
export const CtaCursor: React.FC<CtaProps> = ({ clickSec, pill = PILL_V02, cursor }) => {
  const brand = useBrand();
  const C = brand.colors;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const cur = cursor === undefined ? { from: [1010, 640] as [number, number], showSec: clickSec - 0.42 } : cursor;
  if (!cur || t < cur.showSec - 0.1) return null;
  const { arrow: A } = geo(pill);
  const tgt = { x: A.x + 8, y: A.y + 10 };
  const [sx, sy] = cur.from;
  const p = interpolate(t, [cur.showSec + 0.02, clickSec - 0.03], [0, 1], { ...clampOpts, easing: Easing.bezier(0.4, 0, 0.15, 1) });
  const cxp = sx + (tgt.x - sx) * p + 70 * Math.sin(p * Math.PI);
  const cyp = sy + (tgt.y - sy) * p - 40 * Math.sin(p * Math.PI);
  const press = pressAt(t, clickSec);
  const idleY = t > clickSec + 0.2 ? 5 * Math.sin((t - clickSec) * 3.1) : 0;
  const curOp = interpolate(t, [cur.showSec, cur.showSec + 0.1], [0, 1], clampOpts);
  const c01 = (v: number) => Math.min(1, Math.max(0, v));
  const rp = c01((t - clickSec) / 0.5);
  const rp2 = c01((t - clickSec - 0.08) / 0.5);
  const burstP = c01((t - clickSec) / 0.32);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {rp > 0 && rp < 1 ? (
          <>
            <circle cx={A.x} cy={A.y} r={A.r + 160 * Easing.out(Easing.cubic)(rp)} fill="none" stroke={C.accentLight} strokeWidth={8 * (1 - rp)} opacity={1 - rp} />
            <circle cx={A.x} cy={A.y} r={A.r + 110 * Easing.out(Easing.cubic)(rp2)} fill="none" stroke={C.text} strokeWidth={4 * (1 - rp2)} opacity={(1 - rp2) * 0.8} />
          </>
        ) : null}
        {burstP > 0 && burstP < 1
          ? Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2 + 0.2;
              const e = Easing.out(Easing.cubic)(burstP);
              const r0 = A.r + 12 + e * 48 + (i % 3) * 7;
              const r1 = r0 + 12 + 16 * (1 - burstP);
              return (
                <line
                  key={i}
                  x1={A.x + Math.cos(a) * r0}
                  y1={A.y + Math.sin(a) * r0}
                  x2={A.x + Math.cos(a) * r1}
                  y2={A.y + Math.sin(a) * r1}
                  stroke={i % 2 ? C.accentLight : C.text}
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
          <path d={CURSOR_PATH} fill={C.text} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
};

/** Atalho: botao + titulo + cursor numa camada so (use as pecas separadas se um selo/icone precisa ficar entre elas). */
export const Cta: React.FC<CtaProps> = (props) => (
  <>
    <CtaBotao {...props} />
    <CtaTitulo headline={props.headline} />
    <CtaCursor {...props} />
  </>
);
