import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { H, useBrand } from "../theme";

export type PalavraGiganteItem = {
  /** texto (maiusculas, com acento) */
  text: string;
  /** letras comecam a entrar (s). Regra V02: ~0.08-0.10 s antes da fala */
  inSec: number;
  /** letras comecam a sair, em ordem inversa (s). Regra V02: fim da fala (+0 a 0.22 s) */
  outSec: number;
  /** so contorno (true) ou fonte cheia (false). Use contorno quando outro texto limpo repete a palavra */
  outline?: boolean;
  /** corpo px (V02: 236-250) */
  fontSize?: number;
  /** linha de base (px no quadro 1920). V02: 900 = logo acima da cabeca */
  baseline?: number;
  /** espacamento entre letras (px) */
  spacing?: number;
};

export type ParalaxeGigante = {
  /** profundidade do plano (unidades de mundo; negativo = atras). V02: -2.2 */
  z: number;
  /** instante de referencia da camera (s). V02: 7.8 */
  t0Sec: number;
};

export type PalavraGiganteProps = {
  items: PalavraGiganteItem[];
  /** quantidade de ecos em contorno empilhados para cima */
  echoes?: number;
  /** distancia vertical entre ecos (px) */
  echoStep?: number;
  /** opacidade do eco mais proximo (cada eco seguinte perde echoFalloff) */
  echoOpacity?: number;
  echoFalloff?: number;
  /** cor das letras (padrao brand.text) */
  color?: string;
  /** cor da sombra dura (padrao: brand.primary escurecida a L=22%) */
  shadowColor?: string;
  /** deriva de camera em paralaxe (null = parado) */
  parallax?: ParalaxeGigante | null;
};

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** tom derivado documentado: mesma matiz da primary, saturacao x0.94, luminosidade 22% (#7B2FF0 -> ~#2A0B65) */
export const sombraDaMarca = (hex: string, alpha = 1) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l0 = (mx + mn) / 2;
  const d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const s0 = d ? d / (1 - Math.abs(2 * l0 - 1)) : 0;
  const s = s0 * 0.94;
  const l = 0.22;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r1, g1, b1] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255);
  return `rgba(${to(r1)},${to(g1)},${to(b1)},${alpha})`;
};

/** deriva da camera 3D do V02 (fov 30, z 9.4): px na tela de um plano a profundidade z */
export const deslocamentoParalaxe = (tSec: number, p: ParalaxeGigante) => {
  const CAM_Z = 9.4;
  const K = H / (2 * CAM_Z * Math.tan((15 * Math.PI) / 180));
  const ppu = (K * CAM_Z) / (CAM_Z - p.z);
  const u = tSec - p.t0Sec;
  const cx = 0.055 * Math.sin((u / 6.5) * Math.PI * 2) + 0.012 * u;
  const cy = 0.03 * Math.sin((u / 8.2) * Math.PI * 2 + 1);
  return { x: -cx * ppu, y: cy * ppu };
};

type Kind = "shadow" | "echo" | "main";
type Full = Required<Omit<PalavraGiganteItem, "outline">> & { outline: boolean };

const Letter: React.FC<{ w: Full; ch: string; idx: number; n: number; kind: Kind; color: string; shadow: string }> = ({
  w,
  ch,
  idx,
  n,
  kind,
  color,
  shadow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inF = w.inSec * fps + idx * 1.4;
  const outF = w.outSec * fps + (n - 1 - idx) * 0.5; // sai na ordem inversa (fecha)
  const up = spring({ frame: frame - inF, fps, config: { damping: 14, stiffness: 210, mass: 0.7 } });
  const down = interpolate(frame, [outF, outF + 6], [0, 1], { ...clampOpts, easing: Easing.in(Easing.cubic) });
  const vis = interpolate(frame - inF, [0, 2], [0, 1], clampOpts) * (1 - down);
  const common: React.CSSProperties = {
    display: "inline-block",
    whiteSpace: "pre",
    translate: `0 ${(1 - up) * 70 + down * 90}px`,
    scale: (1.18 - 0.18 * up) * (1 - 0.1 * down),
    rotate: `${(1 - up) * (idx % 2 ? 5 : -5)}deg`,
    opacity: vis,
    transformOrigin: "50% 80%",
  };
  if (kind === "shadow") return <span style={{ ...common, color: shadow }}>{ch}</span>;
  if (kind === "echo") return <span style={{ ...common, color: "transparent", WebkitTextStroke: `3px ${color}` }}>{ch}</span>;
  return (
    <span style={{ ...common, color: w.outline ? "transparent" : color, WebkitTextStroke: w.outline ? `6px ${color}` : undefined }}>
      {ch}
    </span>
  );
};

const Row: React.FC<{
  w: Full;
  kind: Kind;
  font: string;
  color: string;
  shadow: string;
  dx?: number;
  dy?: number;
  opacity?: number;
}> = ({ w, kind, font, color, shadow, dx = 0, dy = 0, opacity = 1 }) => {
  const { width } = useVideoConfig();
  const chars = Array.from(w.text);
  return (
    <div
      style={{
        position: "absolute",
        left: dx,
        width,
        top: w.baseline - w.fontSize * 0.98 + dy,
        height: w.fontSize,
        lineHeight: 1,
        fontFamily: font,
        fontSize: w.fontSize,
        letterSpacing: w.spacing,
        textAlign: "center",
        whiteSpace: "nowrap",
        opacity,
      }}
    >
      {chars.map((ch, i) => (
        <Letter key={i} w={w} ch={ch} idx={i} n={chars.length} kind={kind} color={color} shadow={shadow} />
      ))}
    </div>
  );
};

/**
 * Palavra-chave gigante com eco: letras sobem uma a uma (mola), ficam enquanto a palavra e dita
 * e fecham em ordem inversa. Sombra dura (relevo seco) + N ecos em contorno empilhados para cima.
 * Montar ATRAS da pessoa recortada: o cabelo/rosto ocluem a base das letras.
 */
export const PalavraGigante: React.FC<PalavraGiganteProps> = ({
  items,
  echoes = 3,
  echoStep = 46,
  echoOpacity = 0.62,
  echoFalloff = 0.14,
  color,
  shadowColor,
  parallax = null,
}) => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const col = color ?? brand.colors.text;
  const font = brand.fonts.display;
  const echoList = Array.from({ length: echoes }, (_, k) => echoes - k);
  return (
    <>
      {items.map((it, ii) => {
        const w: Full = {
          text: it.text,
          inSec: it.inSec,
          outSec: it.outSec,
          outline: it.outline ?? false,
          fontSize: it.fontSize ?? 240,
          baseline: it.baseline ?? 900,
          spacing: it.spacing ?? 2,
        };
        if (t < w.inSec - 0.1 || t > w.outSec + 0.5) return null;
        const sh = parallax ? deslocamentoParalaxe(t, parallax) : { x: 0, y: 0 };
        // contorno: sombra translucida sem deslocamento; cheia: sombra opaca deslocada (7, 9) = luz de cima-esquerda
        const shadow = shadowColor ?? sombraDaMarca(brand.colors.primary, w.outline ? 0.62 : 1);
        const p = { w, font, color: col, shadow };
        return (
          <div key={ii} style={{ position: "absolute", inset: 0, translate: `${sh.x}px ${sh.y}px` }}>
            <Row {...p} kind="shadow" dx={w.outline ? 0 : 7} dy={w.outline ? 0 : 9} />
            {echoList.map((k) => (
              <Row key={k} {...p} kind="echo" dy={-k * echoStep} opacity={echoOpacity - k * echoFalloff} />
            ))}
            <Row {...p} kind="main" />
          </div>
        );
      })}
    </>
  );
};
