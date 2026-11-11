import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { H, W, useBrand } from "../theme";
import { paralaxe, rgba, tone, type Punch } from "./util";

/**
 * <EditorialBackdrop> — cenario atras da apresentadora (2 camadas, use as duas ou so uma):
 *  - <BackdropInk>: tinta (ink) + luz de contraluz (primary) que respira e PULSA nos socos de fala,
 *    aneis finos concentricos + tiques girando lentamente, grao de papel, vinheta (escurece no fim se pedido);
 *  - <EditorialCard>: cartao roxo assimetrico (canto sup-esq arredondado, sup-dir chanfrado, base sangra),
 *    entra de baixo com easing, aneis em relevo seco girando, luz de palco atras do tronco, eco de registro
 *    (accentLight) que se desenha.
 * Tons derivados (relevo claro/escuro, luz) saem de primary/ink via tone(); nenhuma cor chumbada.
 * Armadilha: o cartao e a "mesa" da pessoa: o topo dele deve ficar na altura do peito/ombros (~960 px no V02).
 */

export type CardShape = { x0: number; x1: number; top: number; rTL: number; chamfer: number; bottom: number };
export const CARD_DEFAULT: CardShape = { x0: 64, x1: 1016, top: 960, rTL: 150, chamfer: 118, bottom: 1990 };

const grain = (id: string, freq: number, alpha: number) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={7} result="n" />
    <feColorMatrix in="n" type="matrix" values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.9 0.9 0.9 0 ${-0.9 + alpha}`} />
  </filter>
);

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type BackdropInkProps = {
  fromSec: number;
  /** fade-in do cenario [a,b] s. Default [fromSec, fromSec+0.5] */
  fadeSec?: [number, number];
  /** socos de fala: a luz atras da cabeca pulsa junto */
  punches?: readonly Punch[];
  /** escurecer no fim (fonte que escurece): [a,b] s; null = nao */
  darkenSec?: [number, number] | null;
  /** centro da luz e dos aneis (px) */
  lightAt?: [number, number];
  ringsAt?: [number, number];
  driftT0Sec?: number;
};

export const BackdropInk: React.FC<BackdropInkProps> = ({
  fromSec,
  fadeSec,
  punches = [],
  darkenSec = null,
  lightAt = [720, 1160],
  ringsAt = [540, 1230],
  driftT0Sec,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = useBrand().colors;
  const sh = paralaxe(t, -6, driftT0Sec ?? fromSec + 0.2);
  const breathe = 0.82 + 0.18 * Math.sin((t / 3.4) * Math.PI * 2);
  const [f0, f1] = fadeSec ?? [fromSec, fromSec + 0.5];
  const fadeIn = interpolate(t, [f0, f1], [0, 1], cl);
  const pulse = punches.reduce((s, p) => s + (t >= p.t ? Math.exp(-(t - p.t) * 6) * p.a * 14 : 0), 0);
  const vig = darkenSec ? interpolate(t, darkenSec, [0, 0.4], cl) : 0;
  const shade = tone(b.ink, -0.45);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: b.ink }}>
      <div style={{ position: "absolute", inset: -80, translate: `${sh.x}px ${sh.y}px`, opacity: fadeIn }}>
        <div
          style={{
            position: "absolute",
            left: lightAt[0] - 760,
            top: lightAt[1] - 760,
            width: 1520,
            height: 1520,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${rgba(b.primary, 0.62 * breathe + pulse)} 0%, ${rgba(
              b.primary,
              0.34 * breathe,
            )} 42%, ${rgba(b.primary, 0)} 100%)`,
          }}
        />
        <svg width={W + 160} height={H + 160} viewBox={`-80 -80 ${W + 160} ${H + 160}`} style={{ position: "absolute", left: 0, top: 0 }}>
          <g fill="none" stroke={b.primaryLight} strokeOpacity={0.14} strokeWidth={1.5}>
            {[260, 340, 420, 500, 580, 660, 740, 820].map((r) => (
              <circle key={r} cx={ringsAt[0]} cy={ringsAt[1]} r={r} />
            ))}
          </g>
          <g fill="none" stroke={b.primaryLight} strokeOpacity={0.22} strokeWidth={1.5}>
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2 + (frame * 0.05 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={ringsAt[0] + Math.cos(a) * 820}
                  y1={ringsAt[1] + Math.sin(a) * 820}
                  x2={ringsAt[0] + Math.cos(a) * 860}
                  y2={ringsAt[1] + Math.sin(a) * 860}
                />
              );
            })}
          </g>
        </svg>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.55 }}>
        <defs>{grain("kitGrainBg", 0.85, 0.16)}</defs>
        <rect width={W} height={H} filter="url(#kitGrainBg)" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 85% 70% at 50% 52%, ${rgba(shade, 0)} 40%, ${rgba(shade, 0.55 + vig)} 100%)`,
        }}
      />
    </div>
  );
};

/** caminho SVG do cartao (dx/dy deslocam; grow engorda) */
export const cardPath = (c: CardShape, dx = 0, dy = 0, grow = 0) => {
  const L = c.x0 - grow + dx;
  const R = c.x1 + grow + dx;
  const Tp = c.top - grow + dy;
  const B = c.bottom + dy;
  const r = c.rTL + grow;
  const ch = c.chamfer + grow;
  return `M ${L} ${Tp + r} A ${r} ${r} 0 0 1 ${L + r} ${Tp} L ${R - ch} ${Tp} L ${R} ${Tp + ch} L ${R} ${B} L ${L} ${B} Z`;
};

export type EditorialCardProps = {
  /** entrada: sobe de inSec[0] ate inSec[1] (s) */
  inSec: [number, number];
  shape?: Partial<CardShape>;
  /** centro dos aneis em relevo (px) */
  ringsAt?: [number, number];
  /** eco de registro (linha accentLight deslocada -14,-14 que se desenha). false desliga */
  echo?: boolean;
  /** escurecer junto com a fonte: [a,b] s; null = nao */
  darkenSec?: [number, number] | null;
  driftT0Sec?: number;
  idPrefix?: string;
};

export const EditorialCard: React.FC<EditorialCardProps> = ({
  inSec,
  shape,
  ringsAt = [540, 1360],
  echo = true,
  darkenSec = null,
  driftT0Sec,
  idPrefix = "kitCard",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = useBrand().colors;
  const c: CardShape = { ...CARD_DEFAULT, ...shape };
  const [c0, c1] = inSec;
  const rise = interpolate(t, [c0, c1], [1, 0], { ...cl, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const draw = interpolate(t, [c0 + 0.08, c1 + 0.28], [0, 1], { ...cl, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  const sh = paralaxe(t, -1.6, driftT0Sec ?? c0);
  const rot = (frame * 0.22) % 360;
  const [cx, cy] = ringsAt;
  const dark = tone(b.primary, -0.62);
  const light = tone(b.primary, 0.75);
  const clipId = `${idPrefix}Clip`;
  const lightId = `${idPrefix}Light`;
  const grainId = `${idPrefix}Grain`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        translate: `${sh.x}px ${sh.y + rise * 420}px`,
        opacity: interpolate(t, [c0, c0 + 0.1], [0, 1], cl),
      }}
    >
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <clipPath id={clipId}>
            <path d={cardPath(c)} />
          </clipPath>
          {grain(grainId, 0.7, 0.2)}
          <radialGradient id={lightId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={tone(b.primary, 0.8)} stopOpacity={0.46} />
            <stop offset="55%" stopColor={tone(b.primary, 0.6)} stopOpacity={0.2} />
            <stop offset="100%" stopColor={tone(b.primary, 0.6)} stopOpacity={0} />
          </radialGradient>
        </defs>
        <path d={cardPath(c)} fill={b.primary} />
        <g clipPath={`url(#${clipId})`}>
          <g fill="none" transform={`rotate(${rot} ${cx} ${cy})`}>
            {[210, 290, 360, 410, 470].map((r, i) => (
              <g key={r}>
                <circle cx={cx + 3} cy={cy + 3} r={r} stroke={dark} strokeOpacity={0.55} strokeWidth={4} />
                <circle cx={cx - 2} cy={cy - 2} r={r} stroke={light} strokeOpacity={0.42} strokeWidth={3} strokeDasharray={i === 4 ? "3 11" : undefined} />
              </g>
            ))}
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i / 36) * Math.PI * 2;
              const p = (r: number, d: number) => [cx + Math.cos(a) * r + d, cy + Math.sin(a) * r + d];
              const [ax, ay] = p(480, 2);
              const [bx, by] = p(520, 2);
              const [ax2, ay2] = p(480, 0);
              const [bx2, by2] = p(520, 0);
              return (
                <g key={i}>
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke={dark} strokeOpacity={0.5} strokeWidth={4} />
                  <line x1={ax2} y1={ay2} x2={bx2} y2={by2} stroke={light} strokeOpacity={0.4} strokeWidth={3} />
                </g>
              );
            })}
          </g>
          <ellipse cx={470} cy={c.top + 540} rx={470} ry={640} fill={`url(#${lightId})`} />
          <rect x={0} y={c.top} width={W} height={H} filter={`url(#${grainId})`} style={{ mixBlendMode: "overlay" }} opacity={0.6} />
          <rect x={0} y={c.top} width={W} height={26} fill={b.ink} opacity={0.28} />
          {darkenSec ? (
            <rect x={0} y={c.top} width={W} height={H} fill={b.ink} opacity={interpolate(t, darkenSec, [0, 0.5], cl)} />
          ) : null}
        </g>
        {echo ? (
          <path
            d={cardPath(c, -14, -14)}
            fill="none"
            stroke={b.accentLight}
            strokeWidth={3}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={`${draw} 1`}
            opacity={0.9}
          />
        ) : null}
      </svg>
    </div>
  );
};

/** Tinta + cartao juntos (o caso comum). */
export const EditorialBackdrop: React.FC<
  BackdropInkProps & { cardInSec: [number, number]; card?: Partial<CardShape> | false; cardDarkenSec?: [number, number] | null; cardEcho?: boolean }
> = ({ cardInSec, card, cardDarkenSec, cardEcho, ...ink }) => (
  <>
    <BackdropInk {...ink} />
    {card === false ? null : (
      <EditorialCard inSec={cardInSec} shape={card || undefined} darkenSec={cardDarkenSec ?? null} echo={cardEcho} driftT0Sec={ink.driftT0Sec} />
    )}
  </>
);
