import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EXPOSURE_GAIN, EXPOSURE_GAMMA, EXPOSURE_SAT } from "./exposure";
import { FPS, H, PERSON, T, W, matteIndex, shiftPx } from "./layout";

/**
 * Camada 4: a apresentadora recortada (alfa real dos mattes do PLATE), por cima do cartao, da
 * tipografia e dos selos de tras. Zoom lento 1.00 -> 1.06, micro-paralaxe e:
 *  - rim light dourado (cima/esquerda) e violeta (direita), gerados do PROPRIO alfa por
 *    SVG feOffset/feComposite (so contorno, nunca por dentro do rosto);
 *  - sombra projetada do recorte sobre o cartao/letras (profundidade);
 *  - exposicao recomposta por quadro: ganho <= 1.5x + curva de sombras (a fonte escurece no fim) e grao fino.
 */

export const PERSON_FILTER_ID = "prPersonFx";

const FxDefs: React.FC<{ gain: number; gamma: number; sat: number }> = ({ gain, gamma, sat }) => {
  // quanto a exposicao foi recomposta neste quadro (0..1): mais grao onde a fonte escureceu
  const lift = Math.min(1, Math.max(0, (gain - 1) / 0.5));
  // grao leve: so devolve um pouco de textura; mais que isso vira ruido visivel na pele
  const grain = 0.1 + 0.12 * lift;
  // o gamma que levanta as sombras dessatura: devolve cor (pele rosada, nao bege) onde a fonte escureceu
  const satOut = sat + 0.2 * lift;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <defs>
        <filter
          id={PERSON_FILTER_ID}
          x="-8%"
          y="-8%"
          width="116%"
          height="116%"
          colorInterpolationFilters="sRGB"
        >
          {/* alfa suavizado (tira o serrilhado do recorte) e levemente contraido (come o fio de halo) */}
          <feGaussianBlur in="SourceAlpha" stdDeviation={1.0} result="aBlur" />
          <feComponentTransfer in="aBlur" result="aSoft">
            <feFuncA type="linear" slope={1.7} intercept={-0.32} />
          </feComponentTransfer>
          {/* exposicao: ganho LIMITADO (<=1.5x) + curva de sombras, nunca ganho linear alto */}
          <feColorMatrix in="SourceGraphic" type="saturate" values={String(satOut)} result="bodySat" />
          <feComponentTransfer in="bodySat" result="bodyEx">
            <feFuncR type="gamma" amplitude={gain} exponent={gamma} offset={0} />
            <feFuncG type="gamma" amplitude={gain} exponent={gamma} offset={0} />
            <feFuncB type="gamma" amplitude={gain} exponent={gamma} offset={0} />
          </feComponentTransfer>
          {/* grao fino de luminancia: devolve textura a pele (a fonte comprimida fica lisa) */}
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={1} seed={5} result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"
            result="gnoise"
          />
          <feComposite in="bodyEx" in2="gnoise" operator="arithmetic" k1={0} k2={1} k3={grain} k4={-grain / 2} result="bodyG" />
          <feComposite in="bodyG" in2="aSoft" operator="in" result="body" />
          {/* rim light: so o lado esquerdo/topo (luz dourada da cena), fino e discreto */}
          <feOffset in="SourceAlpha" dx={2.5} dy={1.5} result="offA" />
          <feComposite in="SourceAlpha" in2="offA" operator="out" result="edgeA" />
          <feGaussianBlur in="edgeA" stdDeviation={1.1} result="edgeAb" />
          <feFlood floodColor="#FFD86B" floodOpacity={0.38} result="gold" />
          <feComposite in="gold" in2="edgeAb" operator="in" result="goldRim0" />
          <feComposite in="goldRim0" in2="aSoft" operator="in" result="goldRim" />
          {/* rebatida violeta bem fraca no lado direito (separa o cabelo escuro do cartao) */}
          <feOffset in="SourceAlpha" dx={-3} dy={0} result="offB" />
          <feComposite in="SourceAlpha" in2="offB" operator="out" result="edgeB" />
          <feGaussianBlur in="edgeB" stdDeviation={1.5} result="edgeBb" />
          <feFlood floodColor="#C9B0FF" floodOpacity={0.3} result="vio" />
          <feComposite in="vio" in2="edgeBb" operator="in" result="vioRim0" />
          <feComposite in="vioRim0" in2="aSoft" operator="in" result="vioRim" />
          {/* contraluz difuso atras do recorte: separa o polo escuro do cartao */}
          <feGaussianBlur in="SourceAlpha" stdDeviation={22} result="glowB" />
          <feFlood floodColor="#D9C8FF" floodOpacity={0.4} result="glowC" />
          <feComposite in="glowC" in2="glowB" operator="in" result="glow" />
          {/* sombra projetada coerente com a luz (cai para baixo/direita) */}
          <feGaussianBlur in="SourceAlpha" stdDeviation={24} result="shBlur" />
          <feOffset in="shBlur" dx={22} dy={16} result="shOff" />
          <feFlood floodColor="#0A0418" floodOpacity={0.5} result="shCol" />
          <feComposite in="shCol" in2="shOff" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="shadow" />
            <feMergeNode in="body" />
            <feMergeNode in="goldRim" />
            <feMergeNode in="vioRim" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

export const personScale = (t: number) => {
  const p = interpolate(t, [7.8, 12.074], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  return PERSON.baseScale * (1 + PERSON.zoomGain * p);
};

export const Person: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = matteIndex(t);
  const n = String(idx).padStart(4, "0");
  const S = personScale(t);
  const sh = shiftPx(t, PERSON.z);
  const gain = EXPOSURE_GAIN[idx - 1] ?? 1;
  const gamma = EXPOSURE_GAMMA[idx - 1] ?? 1;
  const sat = EXPOSURE_SAT[idx - 1] ?? 1;
  const { fps } = useVideoConfig();
  // entrada nitida (sem desfoque): sobe do cartao com mola e ja esta opaca antes de 8.1 s.
  // Ate 8.64 s o recorte e o 1o quadro nitido (matteIndex trava em 26); respira de leve para nao parecer parado.
  const inP = spring({
    frame: frame - T.personIn0 * FPS,
    fps,
    config: { damping: 15, stiffness: 150, mass: 0.8 },
  });
  const sw = interpolate(t, [T.personIn0, T.personIn0 + 0.12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterY = (1 - inP) * 340;
  const enterS = 0.92 + 0.08 * inP;
  const hold = interpolate(t, [T.personLive - 0.24, T.personLive], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breath = hold * 0.006 * Math.sin((t - T.personIn0) * 5.5);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: H - W,
        width: W,
        height: W,
        transformOrigin: "50% 100%",
        scale: S * enterS * (1 + breath),
        translate: `${sh.x}px ${sh.y + enterY}px`,
        filter: `url(#${PERSON_FILTER_ID})`,
        opacity: sw,
      }}
    >
      <FxDefs gain={gain} gamma={gamma} sat={sat} />
      <Img src={staticFile(`matte/m${n}.png`)} style={{ width: W, height: W, display: "block" }} />
    </div>
  );
};
