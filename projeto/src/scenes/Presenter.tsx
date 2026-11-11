import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Captions } from "../components/Captions";
import { Backdrop, Card } from "./presenter/Backdrop";
import { GiantType } from "./presenter/GiantType";
import { Person } from "./presenter/Person";
import { SealsBack, SealsFront, STAMP } from "./presenter/Seals";
import { CtaBase, CtaTop } from "./presenter/Cta";
import { C, FPS, H, T, W, WINDOW as WIN, clamp01, punchAt } from "./presenter/layout";
import { Easing } from "remotion";

/**
 * PRESENTER — cena da apresentadora (~7.6-12.07 s). Camadas, de tras para a frente:
 *  1  Backdrop: tinta + luz de contraluz que respira + aneis de relevo + grao
 *  1b Card: cartao editorial assimetrico (canto TL grande, TR chanfrado, base sangrada)
 *  2  GiantType: DIFERENCA (8.80-9.56) e GARANTA (10.62-11.24) gigantes, sincronizadas com a fala,
 *     na altura da cabeca/ombros (cabelo e rosto ocluem as letras)
 *  3  SealsBack: selos 3D de tras, paralaxe de camera
 *  4  Person: recorte (alfa), zoom 1.00->1.06, rim light dourado/violeta do proprio alfa, sombra
 *  7a CtaBase: botao SAIBA MAIS (o selo estampado vira o icone) + GARANTA O SEU!
 *  5  SealsFront: selos pequenos a frente + selo que estampa o SAIBA MAIS
 *  7b CtaTop: cursor, ondas e faiscas do clique
 *  6  Captions (palavra a palavra) ate 10.58 s; dai em diante o titulo do CTA (GARANTA O SEU!) leva as palavras
 * Oclusao REAL: a pessoa esta numa camada acima do tipo; o alfa recorta as letras.
 * Esta cena e uma camada de BASE (opaca em 1080x1920); o overlay Seal3D (6.4-8.3 s) fica por cima.
 */

export const WINDOW = WIN;

const RevealGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const op = interpolate(t, [7.8, 7.9, 8.4], [0, 0.75, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (op <= 0.003) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: op,
        mixBlendMode: "screen",
        background:
          "radial-gradient(closest-side at 50% 52%, rgba(255,225,140,1) 0%, rgba(255,190,60,0.55) 45%, rgba(255,190,60,0) 100%)",
      }}
    />
  );
};

/** Onda de choque achatada no ponto da estampa (10.30 s): so mostra o impacto do selo. */
const StampWave: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = clamp01((t - STAMP.hitSec) / 0.4);
  if (p <= 0 || p >= 1) return null;
  const e = Easing.out(Easing.cubic)(p);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <circle cx={STAMP.at[0]} cy={STAMP.at[1]} r={STAMP.r * 0.8 + 110 * e} fill="none" stroke={C.goldLight} strokeWidth={10 * (1 - p)} opacity={0.9 * (1 - p)} />
      <circle cx={STAMP.at[0]} cy={STAMP.at[1]} r={STAMP.r * 0.8 + 70 * e} fill="none" stroke={C.ivory} strokeWidth={4 * (1 - p)} opacity={0.8 * (1 - p)} />
    </svg>
  );
};

export const Presenter: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < WIN.fromSec - 0.02 || t > WIN.toSec + 0.06) return null;
  const punch = punchAt(t);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: 1 + punch, transformOrigin: "50% 58%" }}>
        <Backdrop />
        <Card />
        <GiantType />
        <SealsBack />
        <Person />
        <CtaBase />
        <SealsFront />
        <CtaTop />
        <StampWave />
      </AbsoluteFill>
      {t < T.captionsOff ? <Captions yCenter={1330} showEmphasis={false} /> : null}
      <RevealGlow />
    </AbsoluteFill>
  );
};

export default Presenter;
