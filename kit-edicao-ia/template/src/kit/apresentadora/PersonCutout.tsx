import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { H, W, useBrand } from "../theme";
import { exposureAt, matteIndexAt, pad4, paralaxe, sharpFileSec, tone, type MatteInfo } from "./util";

/**
 * <PersonCutout> — a pessoa recortada: sequencia de PNG RGBA (scripts/recorte_rvm.py) sincronizada pelo TEMPO DO
 * ARQUIVO (nao pelo quadro da composicao), congelada no 1o quadro nitido ate liveSec, com:
 *  - borda: alfa suavizado (edge) — o V02 contraia demais (slope 1.7) e virava "adesivo"; default mais macio;
 *  - exposicao por quadro do matte.json com ganho LIMITADO (maxGain 1.4) + gamma, e grao fino;
 *  - rim light opcional e SUTIL (accent em cima/esquerda, frio a direita) — 0 desliga;
 *  - contraluz difuso atras e sombra projetada (profundidade sobre cartao/letras).
 * Armadilhas: o PNG precisa ser alfa RETO (nao pre-multiplicado); o filtro SVG precisa de id unico por instancia.
 */

export type PersonEdge = {
  /** desfoque do alfa (px) antes da curva */
  blur: number;
  /** curva do alfa: a' = slope*a + intercept. 1/0 = alfa original; V02 = 1.7/-0.32 (duro) */
  slope: number;
  intercept: number;
};

export type PersonLook = {
  /** escala base do quadro do matte (1080 de largura -> 1.1 = 1188 px) */
  baseScale: number;
  /** zoom lento durante a cena: escala * (1 + zoomGain * progresso) */
  zoomGain: number;
  /** profundidade para paralaxe (z>0 anda mais que o fundo) */
  z: number;
  edge: PersonEdge;
  /** rim light: opacidade do lado claro (accentLight) e do lado frio (primaryLight). 0 = desliga */
  rim: { accent: number; cool: number; width: number };
  /** contraluz difuso atras do recorte (0 desliga) */
  glow: number;
  /** sombra projetada para baixo/direita (0 desliga) */
  shadow: number;
  /** teto do ganho de exposicao (a fonte escurece? sobe ate aqui; o resto e gamma) */
  maxGain: number;
  /** grao fino de luminancia (0..0.3); sobe um pouco onde a exposicao foi recomposta */
  grain: number;
};

export const PERSON_LOOK_DEFAULT: PersonLook = {
  baseScale: 1.1,
  zoomGain: 0.06,
  z: 0.6,
  edge: { blur: 0.8, slope: 1.25, intercept: -0.1 },
  rim: { accent: 0.16, cool: 0.12, width: 1.6 },
  glow: 0.36,
  shadow: 0.5,
  maxGain: 1.4,
  grain: 0.08,
};

export type PersonCutoutProps = {
  matte: MatteInfo;
  /** pasta em public/ com m0001.png.. (ex.: "exemplo/matte") */
  matteDir: string;
  /** janela da cena (s de composicao) */
  fromSec: number;
  toSec: number;
  /** ate aqui o recorte respira congelado no 1o quadro nitido. Default: tempo do sharpFrom */
  liveSec?: number;
  /** entrada (mola de baixo para cima). Default fromSec + 0.28 */
  inSec?: number;
  /** tempo de composicao - tempo do arquivo de origem (0 se a cena usa o mesmo relogio do arquivo) */
  fileOffsetSec?: number;
  /** inicio da deriva de camera (paralaxe). Default fromSec + 0.2 */
  driftT0Sec?: number;
  look?: Partial<PersonLook>;
  /** caixa do quadro do matte na tela. Default: largura W, ancorado na base, centralizado */
  box?: { left: number; top: number; width: number };
  /** id unico do filtro (2 instancias na mesma tela = ids diferentes) */
  filterId?: string;
};

const FxDefs: React.FC<{ id: string; look: PersonLook; gain: number; gamma: number; sat: number }> = ({
  id,
  look,
  gain,
  gamma,
  sat,
}) => {
  const t = useBrand().colors;
  const lift = Math.min(1, Math.max(0, (gain - 1) / 0.5));
  const grain = look.grain * (1 + 1.2 * lift);
  const satOut = sat + 0.2 * lift;
  const { edge, rim } = look;
  const rw = rim.width;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <defs>
        <filter id={id} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation={edge.blur} result="aBlur" />
          <feComponentTransfer in="aBlur" result="aSoft">
            <feFuncA type="linear" slope={edge.slope} intercept={edge.intercept} />
          </feComponentTransfer>
          <feColorMatrix in="SourceGraphic" type="saturate" values={String(satOut)} result="bodySat" />
          <feComponentTransfer in="bodySat" result="bodyEx">
            <feFuncR type="gamma" amplitude={gain} exponent={gamma} offset={0} />
            <feFuncG type="gamma" amplitude={gain} exponent={gamma} offset={0} />
            <feFuncB type="gamma" amplitude={gain} exponent={gamma} offset={0} />
          </feComponentTransfer>
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={1} seed={5} result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"
            result="gnoise"
          />
          <feComposite in="bodyEx" in2="gnoise" operator="arithmetic" k1={0} k2={1} k3={grain} k4={-grain / 2} result="bodyG" />
          <feComposite in="bodyG" in2="aSoft" operator="in" result="body" />
          {/* rim claro (cima/esquerda) — so contorno, por DENTRO do alfa */}
          <feOffset in="SourceAlpha" dx={rw * 1.6} dy={rw} result="offA" />
          <feComposite in="SourceAlpha" in2="offA" operator="out" result="edgeA" />
          <feGaussianBlur in="edgeA" stdDeviation={rw * 0.7} result="edgeAb" />
          <feFlood floodColor={t.accentLight} floodOpacity={rim.accent} result="gold" />
          <feComposite in="gold" in2="edgeAb" operator="in" result="goldRim0" />
          <feComposite in="goldRim0" in2="aSoft" operator="in" result="goldRim" />
          {/* rebatida fria (direita): separa cabelo escuro do cartao */}
          <feOffset in="SourceAlpha" dx={-rw * 1.9} dy={0} result="offB" />
          <feComposite in="SourceAlpha" in2="offB" operator="out" result="edgeB" />
          <feGaussianBlur in="edgeB" stdDeviation={rw} result="edgeBb" />
          <feFlood floodColor={tone(t.primaryLight, 0.25)} floodOpacity={rim.cool} result="vio" />
          <feComposite in="vio" in2="edgeBb" operator="in" result="vioRim0" />
          <feComposite in="vioRim0" in2="aSoft" operator="in" result="vioRim" />
          <feGaussianBlur in="SourceAlpha" stdDeviation={22} result="glowB" />
          <feFlood floodColor={tone(t.primaryLight, 0.45)} floodOpacity={look.glow} result="glowC" />
          <feComposite in="glowC" in2="glowB" operator="in" result="glow" />
          <feGaussianBlur in="SourceAlpha" stdDeviation={24} result="shBlur" />
          <feOffset in="shBlur" dx={22} dy={16} result="shOff" />
          <feFlood floodColor={tone(t.ink, -0.45)} floodOpacity={look.shadow} result="shCol" />
          <feComposite in="shCol" in2="shOff" operator="in" result="shadow" />
          <feMerge>
            {look.glow > 0 ? <feMergeNode in="glow" /> : null}
            {look.shadow > 0 ? <feMergeNode in="shadow" /> : null}
            <feMergeNode in="body" />
            {rim.accent > 0 ? <feMergeNode in="goldRim" /> : null}
            {rim.cool > 0 ? <feMergeNode in="vioRim" /> : null}
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

export const PersonCutout: React.FC<PersonCutoutProps> = ({
  matte,
  matteDir,
  fromSec,
  toSec,
  liveSec,
  inSec,
  fileOffsetSec = 0,
  driftT0Sec,
  look: lookIn,
  box,
  filterId = "kitPersonFx",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const look: PersonLook = {
    ...PERSON_LOOK_DEFAULT,
    ...lookIn,
    edge: { ...PERSON_LOOK_DEFAULT.edge, ...lookIn?.edge },
    rim: { ...PERSON_LOOK_DEFAULT.rim, ...lookIn?.rim },
  };
  const t0 = driftT0Sec ?? fromSec + 0.2;
  const tin = inSec ?? fromSec + 0.28;
  const live = liveSec ?? sharpFileSec(matte) + fileOffsetSec;
  const idx = matteIndexAt(t - fileOffsetSec, matte);
  const ex = exposureAt(matte, idx, look.maxGain);
  const zoom = interpolate(t, [t0, toSec], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const S = look.baseScale * (1 + look.zoomGain * zoom);
  const sh = paralaxe(t, look.z, t0);
  const inP = spring({ frame: frame - tin * fps, fps, config: { damping: 15, stiffness: 150, mass: 0.8 } });
  const op = interpolate(t, [tin, tin + 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hold = interpolate(t, [live - 0.24, live], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const breath = hold * 0.006 * Math.sin((t - tin) * 5.5);
  const bw = box?.width ?? W;
  const bh = (bw * matte.h) / matte.w;
  return (
    <div
      style={{
        position: "absolute",
        left: box?.left ?? (W - bw) / 2,
        top: box?.top ?? H - bh,
        width: bw,
        height: bh,
        transformOrigin: "50% 100%",
        scale: S * (0.92 + 0.08 * inP) * (1 + breath),
        translate: `${sh.x}px ${sh.y + (1 - inP) * 340}px`,
        filter: `url(#${filterId})`,
        opacity: op,
      }}
    >
      <FxDefs id={filterId} look={look} gain={ex.gain} gamma={ex.gamma} sat={ex.sat} />
      <Img src={staticFile(`${matteDir}/m${pad4(idx)}.png`)} style={{ width: bw, height: bh, display: "block" }} />
    </div>
  );
};
