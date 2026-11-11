import React from "react";
import { Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../theme";
import {
  paginar,
  resolver,
  type Enfase,
  type PaginaLegenda,
  type PalavraResolvida,
  type PalavraTempo,
  type TipoEnfase,
} from "./dados";

export type CoresLegenda = {
  /** palavra sendo falada (padrao brand.accentLight) */
  active: string;
  /** palavras ja ditas (padrao brand.text) */
  done: string;
  /** sublinhado / borda da etiqueta (padrao brand.primaryLight) */
  accent: string;
  /** contorno, sombra dura e caixa (padrao brand.ink) */
  ink: string;
  /** faiscas (padrao brand.accent) */
  spark: string;
};

export type LegendasProps = {
  /** palavras com tempo de FALA REAL (s de composicao) */
  words: PalavraTempo[];
  /** paginas manuais; omitido = paginar(words) */
  pages?: PaginaLegenda[];
  /** quais palavras recebem enfase (por texto ou indice) */
  emphasis?: Enfase[];
  /** desenha sublinhado/etiqueta/faiscas (V02: false; escala/cor da enfase continuam) */
  showEmphasis?: boolean;
  /** y do centro do bloco (px no quadro 1920), antes do yNudge */
  yCenter?: number;
  /** descida somada ao yCenter (libera queixo/pescoco) */
  yNudge?: number;
  /** paginas cuja 1a palavra comeca em/depois disto (s) nao sao desenhadas (ex.: o CTA assume a frase) */
  stopBeforeSec?: number;
  /** corte seco: a partir deste instante (s) nada e desenhado (ex.: a frase vira o botao do CTA) */
  cutAtSec?: number;
  /** multiplica todos os corpos */
  scale?: number;
  /** quadros de antecipacao da entrada/pop em relacao a voz */
  leadFrames?: number;
  /** quadros do pop-out da ultima pagina (sempre opacidade 1) */
  exitFrames?: number;
  colors?: Partial<CoresLegenda>;
  /** se montado dentro de um <Sequence from>, o from em segundos */
  timeOffsetSec?: number;
  style?: React.CSSProperties;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ------------------------------------------------------------- enfases ---- */

const Underline: React.FC<{ frame: number; startF: number; color: string; ink: string; thick?: number; wave?: boolean }> = ({
  frame,
  startF,
  color,
  ink,
  thick = 1,
  wave = false,
}) => {
  const p = interpolate(frame, [startF, startF + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (p <= 0) return null;
  const d = wave ? "M4 12 C 34 4, 58 18, 96 9 S 156 3, 196 10" : "M4 11 C 40 7, 100 14, 150 9 S 186 8, 196 10";
  return (
    <svg
      viewBox="0 0 200 20"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: "-3%",
        width: "106%",
        bottom: "-0.2em",
        height: "0.2em",
        overflow: "visible",
        clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`,
      }}
    >
      <path d={d} fill="none" stroke={ink} strokeWidth={17 * thick} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={d} fill="none" stroke={color} strokeWidth={9 * thick} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const SPARK_ANGLES = [-140, -115, -90, -62, -35, -10, 10];
const SPARK_ANGLES_FINAL = [-112, -90, -62, -35, -10, 10];

const Sparks: React.FC<{ frame: number; startF: number; color: string; ink: string; angles: number[] }> = ({
  frame,
  startF,
  color,
  ink,
  angles,
}) => {
  const p = interpolate(frame, [startF, startF + 11], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const tip = Easing.out(Easing.cubic)(p);
  const tail = Easing.out(Easing.cubic)(Math.max(0, p - 0.45) / 0.55);
  const fade = interpolate(p, [0.6, 1], [1, 0], clamp);
  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: fade, pointerEvents: "none" }}
    >
      {angles.map((deg, k) => {
        const a = (deg * Math.PI) / 180;
        const wob = 0.82 + ((k * 37) % 5) * 0.07;
        const x1 = 50 + Math.cos(a) * (56 + 15 * wob * tail);
        const y1 = 50 + Math.sin(a) * (82 + 44 * wob * tail);
        const x2 = 50 + Math.cos(a) * (56 + 15 * wob * tip);
        const y2 = 50 + Math.sin(a) * (82 + 44 * wob * tip);
        return (
          <g key={k}>
            <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={ink} strokeWidth={15} strokeLinecap="round" />
            <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={color} strokeWidth={7} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

/* -------------------------------------------------------------- palavra --- */

type Ctx = { frame: number; fps: number; pal: CoresLegenda; showEmphasis: boolean; lead: number; font: string };

const EMPH_SCALE: Record<TipoEnfase | "none", number> = { none: 1.1, onda: 1.08, etiqueta: 1.12, faisca: 1.1, final: 1.24 };
const EMPH_ROT: Partial<Record<TipoEnfase, [number, number]>> = { onda: [-8, -2.5], faisca: [6, 2] };
/** fatia da etiqueta que cobre so a 1a palavra antes da 2a comecar */
const BOX_FIRST_SHARE = 0.63;

const WordView: React.FC<{ w: PalavraResolvida; size: number; c: Ctx }> = ({ w, size, c }) => {
  const { frame, fps, pal, showEmphasis, lead } = c;
  const startF = w.s * fps - lead;
  const endF = w.e * fps - lead;
  const kind = w.kind ?? "none";
  const isFinal = kind === "final";
  const started = frame >= startF;
  const pop = started ? spring({ frame: frame - startF, fps, config: { damping: 11, stiffness: 240, mass: 0.55 } }) : 0;
  const relax = isFinal ? 0 : interpolate(frame, [endF, endF + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const popScale = started ? interpolate(pop, [0, 1], [0.84, EMPH_SCALE[kind]]) : 0.88;
  const sc = popScale * (1 - relax) + relax;
  const color = !started
    ? pal.done
    : isFinal
      ? pal.active
      : interpolateColors(frame, [endF - 1, endF + 5], [pal.active, pal.done]);
  const rotPair = showEmphasis && kind !== "none" ? EMPH_ROT[kind] : undefined;
  const rot = rotPair && started ? interpolate(pop, [0, 1], rotPair) : rotPair ? rotPair[0] * 0.3 : 0;
  const ty = started ? interpolate(pop, [0, 1], [size * 0.1, 0]) : size * 0.04;
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: c.font,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: size * 0.008,
        whiteSpace: "nowrap",
        color,
        // nao falada: reserva o espaco (layout estavel) mas nao desenha; falada: opacidade 1 desde o 1o quadro
        opacity: started ? 1 : 0,
        transform: `translateY(${ty}px) rotate(${rot}deg) scale(${sc})`,
        transformOrigin: "50% 64%",
        WebkitTextStroke: `${size * 0.125}px ${pal.ink}`,
        paintOrder: "stroke fill",
        textShadow: started
          ? `0 ${size * 0.055}px 0 ${pal.ink}, 0 ${size * 0.09}px ${size * 0.14}px rgba(10,4,24,0.55)`
          : `0 ${size * 0.02}px ${size * 0.06}px rgba(10,4,24,0.6)`,
      }}
    >
      {w.text}
      {showEmphasis && kind === "onda" ? <Underline frame={frame} startF={startF + 3} color={pal.accent} ink={pal.ink} wave /> : null}
      {showEmphasis && kind === "faisca" ? <Underline frame={frame} startF={startF + 4} color={pal.accent} ink={pal.ink} /> : null}
      {showEmphasis && (kind === "faisca" || isFinal) ? (
        <Sparks frame={frame} startF={startF} color={pal.spark} ink={pal.ink} angles={isFinal ? SPARK_ANGLES_FINAL : SPARK_ANGLES} />
      ) : null}
    </span>
  );
};

const LineView: React.FC<{ words: PalavraResolvida[]; size: number; c: Ctx }> = ({ words, size, c }) => {
  const { frame, fps, pal, lead } = c;
  const hasBox = c.showEmphasis && words.some((w) => w.kind === "etiqueta");
  const boxStart = words[0].s * fps - lead;
  const p = interpolate(frame, [boxStart, boxStart + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const second = words.length > 1 ? words[1].s * fps - lead : boxStart;
  const grow = words.length > 1 ? interpolate(frame, [second, second + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 1;
  const reveal = Math.min(p, 1) * (BOX_FIRST_SHARE + (1 - BOX_FIRST_SHARE) * grow);
  const boxRot = interpolate(p, [0, 1], [-4, -1.6]);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        columnGap: size * 0.38,
        whiteSpace: "nowrap",
      }}
    >
      {hasBox ? (
        <div
          style={{
            position: "absolute",
            left: -size * 0.3,
            right: -size * 0.3,
            top: 0,
            bottom: -size * 0.02,
            borderRadius: size * 0.18,
            background: pal.ink,
            boxShadow: `0 0 0 ${size * 0.035}px ${pal.accent}, 0 ${size * 0.1}px ${size * 0.22}px rgba(10,4,24,0.5)`,
            transform: `rotate(${boxRot}deg)`,
            clipPath: `inset(-20% ${(1 - reveal) * 100}% -20% -5%)`,
          }}
        />
      ) : null}
      {words.map((w) => (
        <WordView key={w.i} w={w} size={size} c={c} />
      ))}
    </div>
  );
};

/* --------------------------------------------------------------- pagina --- */

const PageView: React.FC<{
  pi: number;
  pages: PaginaLegenda[];
  all: PalavraResolvida[];
  scale: number;
  stopBeforeSec: number;
  exitFrames: number;
  c: Ctx;
}> = ({ pi, pages, all, scale, stopBeforeSec, exitFrames, c }) => {
  const { frame, fps, lead } = c;
  const page = pages[pi];
  const pageWords = all.filter((w) => w.page === pi);
  if (!pageWords.length || pageWords[0].s >= stopBeforeSec) return null;
  const size = (page.size ?? 140) * scale;
  const lines = page.lines.length;
  const h = size * lines + size * 0.1 * (lines - 1);

  const firstStart = pageWords[0].s * fps - lead;
  const lastEnd = pageWords[pageWords.length - 1].e * fps;
  const nextCandidate = all.filter((w) => w.page === pi + 1)[0];
  const next = nextCandidate && nextCandidate.s < stopBeforeSec ? nextCandidate : undefined;
  // troca de pagina: corte seco no quadro em que a proxima nasce; ultima: pop-out sempre com opacidade 1
  const exitStart = Math.min(lastEnd, stopBeforeSec * fps);
  const exitEnd = exitStart + exitFrames;
  if (frame < firstStart) return null;
  if (next) {
    if (frame >= next.s * fps - lead) return null;
  } else if (frame > exitEnd) {
    return null;
  }
  const enter = spring({ frame: frame - firstStart, fps, config: { damping: 14, stiffness: 280, mass: 0.5 } });
  const out = next ? 0 : interpolate(frame, [exitStart, exitEnd], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const y = interpolate(enter, [0, 1], [26, 0]) - out * 12;
  const s = interpolate(enter, [0, 1], [0.92, 1]) * (1 - out * 0.96);
  const dx = (page.dx ?? 0) * scale;
  return (
    <div style={{ position: "absolute", left: dx, right: -dx, top: -h / 2 + (page.dy ?? 0) * scale, height: h }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: size * 0.1,
          transform: `translateY(${y}px) scale(${s})`,
          transformOrigin: "50% 50%",
        }}
      >
        {page.lines.map((line, li) => (
          <LineView key={li} words={line.map((i) => all[i])} size={size} c={c} />
        ))}
      </div>
    </div>
  );
};

/* ----------------------------------------------------------- componente --- */

/**
 * Legenda palavra a palavra: pagina de 1-2 linhas centrada em yCenter+yNudge, palavra falada
 * pinga (mola) na cor ativa e assenta na cor "dita"; contorno + sombra dura da marca.
 */
export const Legendas: React.FC<LegendasProps> = ({
  words,
  pages,
  emphasis = [],
  showEmphasis = true,
  yCenter = 1330,
  yNudge = 80,
  stopBeforeSec = Infinity,
  cutAtSec = Infinity,
  scale = 1,
  leadFrames = 0.8,
  exitFrames = 4,
  colors,
  timeOffsetSec = 0,
  style,
}) => {
  const brand = useBrand();
  const { fps, width } = useVideoConfig();
  const frame = useCurrentFrame() + timeOffsetSec * fps;
  if (!words.length || frame >= cutAtSec * fps) return null;
  const pg = pages ?? paginar(words);
  const all = resolver(words, pg, emphasis);
  const pal: CoresLegenda = {
    active: brand.colors.accentLight,
    done: brand.colors.text,
    accent: brand.colors.primaryLight,
    ink: brand.colors.ink,
    spark: brand.colors.accent,
    ...colors,
  };
  const c: Ctx = { frame, fps, pal, showEmphasis, lead: leadFrames, font: brand.fonts.display };
  return (
    <div style={{ position: "absolute", left: 0, top: yCenter + yNudge, width, height: 0, pointerEvents: "none", ...style }}>
      {pg.map((_, pi) => (
        <PageView key={pi} pi={pi} pages={pg} all={all} scale={scale} stopBeforeSec={stopBeforeSec} exitFrames={exitFrames} c={c} />
      ))}
    </div>
  );
};
