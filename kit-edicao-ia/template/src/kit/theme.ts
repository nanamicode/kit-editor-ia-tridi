/**
 * KIT EDICAO IA — tema/marca e utilitarios compartilhados por TODOS os modulos.
 * Trocar a marca = trocar o objeto BRAND (ou carregar um JSON de marcas/*.json).
 * Nenhum modulo deve ter cor/fonte "chumbada": sempre ler de useBrand().
 */
import React, { createContext, useContext } from "react";
import { Easing, interpolate } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export type Brand = {
  name: string;
  colors: {
    /** fundo escuro principal */
    ink: string;
    /** fundo secundario / caixas */
    graphite: string;
    /** cor da marca (saturada) */
    primary: string;
    /** variacao clara da cor da marca */
    primaryLight: string;
    /** acento metalico / destaque (palavra falada, regua, selo) */
    accent: string;
    accentLight: string;
    /** texto claro */
    text: string;
  };
  fonts: {
    /** titulos condensados pesados */
    display: string;
    /** apoio */
    text: string;
  };
};

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const mont = loadMontserrat("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] });

/** Padrao aprovado no criativo de carimbos (roxo + dourado + marfim). */
export const BRAND_ROXO_DOURADO: Brand = {
  name: "roxo-dourado",
  colors: {
    ink: "#120A24",
    graphite: "#1B1230",
    primary: "#7B2FF0",
    primaryLight: "#B794FF",
    accent: "#F5C542",
    accentLight: "#FFD86B",
    text: "#FFF8E7",
  },
  fonts: { display: anton.fontFamily, text: mont.fontFamily },
};

const BrandCtx = createContext<Brand>(BRAND_ROXO_DOURADO);
export const BrandProvider: React.FC<{ brand: Brand; children: React.ReactNode }> = ({
  brand,
  children,
}) => React.createElement(BrandCtx.Provider, { value: brand }, children);
export const useBrand = () => useContext(BrandCtx);

/* ---------------------------------------------------------------- tempo ---- */
/** segundos de composicao -> quadro */
export const f = (sec: number, fps = FPS) => Math.round(sec * fps);

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** progresso normalizado de `frame` em [a,b] (em quadros), com easing opcional */
export const prog = (
  frame: number,
  a: number,
  b: number,
  easing: (t: number) => number = (t) => t,
) =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.76, 0, 0.24, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  whip: Easing.bezier(0.85, 0, 0.15, 1),
  snap: Easing.bezier(0.2, 0.9, 0.2, 1),
} as const;

/** ruido deterministico em [0,1) (nunca Math.random em Remotion) */
export const hash = (n: number, seed = 0) => {
  const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/** Zona segura de Reels/TikTok (px no quadro 1080x1920) */
export const SAFE = { top: 230, bottom: 1560, side: 80 } as const;
