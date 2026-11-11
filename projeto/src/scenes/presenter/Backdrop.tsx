import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C, CARD, FPS, H, T, W, shiftPx } from "./layout";

/**
 * Camada 1 (mais ao fundo): cenario de tinta com luz de contraluz que respira, malha fina de
 * "mesa de carimbo" (aneis em relevo) e grao de papel. Camada 1b: o cartao editorial roxo.
 */

const grain = (id: string, freq: number, alpha: number) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={7} result="n" />
    <feColorMatrix
      in="n"
      type="matrix"
      values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.9 0.9 0.9 0 ${-0.9 + alpha}`}
    />
  </filter>
);

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sh = shiftPx(t, -6);
  const breathe = 0.82 + 0.18 * Math.sin((t / 3.4) * Math.PI * 2);
  const fadeIn = interpolate(t, [7.6, 8.1], [0.0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // pulso de luz nas palavras (a luz atras da cabeca "responde" a fala)
  const pulse = T.punches.reduce(
    (s, p) => s + (t >= p.t ? Math.exp(-(t - p.t) * 6) * p.a * 14 : 0),
    0,
  );
  // vinheta final (respiro): a fonte escurece, o cenario acompanha de leve
  const vig = interpolate(t, [11.3, 12.07], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.ink }}>
      <div
        style={{
          position: "absolute",
          inset: -80,
          translate: `${sh.x}px ${sh.y}px`,
          opacity: fadeIn,
        }}
      >
        {/* luz de contraluz atras da cabeca */}
        <div
          style={{
            position: "absolute",
            left: 640 - 760,
            top: 1080 - 760,
            width: 1520,
            height: 1520,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, rgba(123,47,240,${
              0.62 * breathe + pulse
            }) 0%, rgba(123,47,240,${0.34 * breathe}) 42%, rgba(123,47,240,0) 100%)`,
            translate: "80px 80px",
          }}
        />
        {/* malha de relevo: aneis finos concentricos (ref. do selo) */}
        <svg
          width={W + 160}
          height={H + 160}
          viewBox={`-80 -80 ${W + 160} ${H + 160}`}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <g fill="none" stroke={C.violet} strokeOpacity={0.14} strokeWidth={1.5}>
            {[260, 340, 420, 500, 580, 660, 740, 820].map((r) => (
              <circle key={r} cx={540} cy={1230} r={r} />
            ))}
          </g>
          <g fill="none" stroke={C.violet} strokeOpacity={0.22} strokeWidth={1.5}>
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2 + (frame * 0.05 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={540 + Math.cos(a) * 820}
                  y1={1230 + Math.sin(a) * 820}
                  x2={540 + Math.cos(a) * 860}
                  y2={1230 + Math.sin(a) * 860}
                />
              );
            })}
          </g>
        </svg>
      </div>
      {/* grao de papel */}
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.55 }}
      >
        <defs>{grain("prGrainBg", 0.85, 0.16)}</defs>
        <rect width={W} height={H} filter="url(#prGrainBg)" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 85% 70% at 50% 52%, rgba(10,4,24,0) 40%, rgba(10,4,24,${
            0.55 + vig
          }) 100%)`,
        }}
      />
    </div>
  );
};

/** Caminho do cartao assimetrico. dx/dy deslocam (usado no eco de registro dourado). */
export const cardPath = (dx = 0, dy = 0, grow = 0) => {
  const { x0, x1, top, rTL, chamfer, bottom } = CARD;
  const L = x0 - grow + dx;
  const R = x1 + grow + dx;
  const Tp = top - grow + dy;
  const B = bottom + dy;
  const r = rTL + grow;
  const ch = chamfer + grow;
  return `M ${L} ${Tp + r} A ${r} ${r} 0 0 1 ${L + r} ${Tp} L ${R - ch} ${Tp} L ${R} ${Tp + ch} L ${R} ${B} L ${L} ${B} Z`;
};

/** O cartao roxo: entra de baixo com mola; aneis em relevo (alto/baixo-relevo) e eco dourado de registro. */
export const Card: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const rise = interpolate(t, [T.cardIn0, T.cardIn1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const draw = interpolate(t, [T.cardIn0 + 0.08, T.cardIn1 + 0.28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });
  const sh = shiftPx(t, -1.6);
  const ringsRot = (frame * 0.22) % 360;
  const cx = 540;
  const cy = 1360;
  const rings = [210, 290, 360, 410, 470];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        translate: `${sh.x}px ${sh.y + rise * 420}px`,
        opacity: interpolate(t, [T.cardIn0, T.cardIn0 + 0.1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <clipPath id="prCardClip">
            <path d={cardPath()} />
          </clipPath>
          {grain("prGrainCard", 0.7, 0.2)}
          <radialGradient id="prCardLight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E9DCFF" stopOpacity={0.46} />
            <stop offset="55%" stopColor="#CDB4FF" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#CDB4FF" stopOpacity={0} />
          </radialGradient>
        </defs>
        <path d={cardPath()} fill={C.purple} />
        <g clipPath="url(#prCardClip)">
          {/* relevo seco: luz de cima-esquerda (clara) e sombra de baixo-direita (escura) */}
          <g fill="none" transform={`rotate(${ringsRot} ${cx} ${cy})`}>
            {rings.map((r, i) => (
              <g key={r}>
                <circle cx={cx + 3} cy={cy + 3} r={r} stroke="#2A0B66" strokeOpacity={0.55} strokeWidth={4} />
                <circle cx={cx - 2} cy={cy - 2} r={r} stroke="#E4D3FF" strokeOpacity={0.42} strokeWidth={3} strokeDasharray={i === 4 ? "3 11" : undefined} />
              </g>
            ))}
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i / 36) * Math.PI * 2;
              const r0 = 480;
              const r1 = 520;
              return (
                <g key={i}>
                  <line x1={cx + Math.cos(a) * r0 + 2} y1={cy + Math.sin(a) * r0 + 2} x2={cx + Math.cos(a) * r1 + 2} y2={cy + Math.sin(a) * r1 + 2} stroke="#2A0B66" strokeOpacity={0.5} strokeWidth={4} />
                  <line x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * r1} y2={cy + Math.sin(a) * r1} stroke="#E4D3FF" strokeOpacity={0.4} strokeWidth={3} />
                </g>
              );
            })}
          </g>
          {/* luz de palco atras do tronco: o polo escuro se destaca do cartao */}
          <ellipse cx={470} cy={1500} rx={470} ry={640} fill="url(#prCardLight)" />
          <rect x={0} y={CARD.top} width={W} height={H} filter="url(#prGrainCard)" style={{ mixBlendMode: "overlay" }} opacity={0.6} />
          {/* sombra interna do topo: o cartao e uma "pagina" mais baixa que a mesa */}
          <rect x={0} y={CARD.top} width={W} height={26} fill="#120A24" opacity={0.28} />
          {/* a fonte escurece no fim: o cartao acompanha (em vez de clarear a pele ate ficar chapada) */}
          <rect x={0} y={CARD.top} width={W} height={H} fill="#120A24" opacity={interpolate(t, [11.1, 12.07], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        </g>
        {/* eco dourado deslocado (desregistro de impressao) que se desenha */}
        <path
          d={cardPath(-14, -14)}
          fill="none"
          stroke={C.goldLight}
          strokeWidth={3}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={`${draw} 1`}
          opacity={0.9}
        />
      </svg>
    </div>
  );
};
