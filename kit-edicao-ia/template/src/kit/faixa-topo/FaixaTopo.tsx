import React from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../theme";
import { chave } from "../legendas/dados";

export type FaixaTopoProps = {
  /** frase curta (ate ~20 caracteres em 94 px), maiusculas */
  text: string;
  /** palavras na cor de destaque (comparadas sem acento/pontuacao) */
  highlight?: string[];
  /** entra (s) */
  inSec: number;
  /** comeca a sair (s) */
  outSec: number;
  /** topo da faixa de texto (px). Fica dentro da zona segura (>= SAFE.top ~230) */
  y?: number;
  /** altura da mascara do texto (px) */
  h?: number;
  fontSize?: number;
  /** extremos da regua (px) */
  x0?: number;
  x1?: number;
  /**
   * folga ACIMA da mascara, fracao do corpo, para til/acento (Õ, Ã, É).
   * "auto" = 0.26 se o texto tiver acento em maiuscula, senao 0 (V02).
   */
  headroom?: number | "auto";
  /** mostra o tick que percorre a regua marcando o avanco da frase */
  tick?: boolean;
};

const c01 = (v: number) => Math.min(1, Math.max(0, v));
const outExpo = Easing.bezier(0.22, 1, 0.36, 1);
const inCubic = Easing.in(Easing.cubic);

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/**
 * Faixa de topo (kicker): regua da marca desenhada do centro para as pontas, frase que sobe de dentro
 * de uma mascara e tick que anda na regua. Sai inteira antes do proximo elemento do topo (ex.: CTA).
 */
export const FaixaTopo: React.FC<FaixaTopoProps> = ({
  text,
  highlight = [],
  inSec,
  outSec,
  y = 244,
  h = 108,
  fontSize = 94,
  x0 = 80,
  x1 = 1000,
  headroom = "auto",
  tick = true,
}) => {
  const brand = useBrand();
  const C = brand.colors;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  if (t < inSec - 0.02 || t > outSec + 0.3) return null;

  const rule = outExpo(c01((t - inSec) / 0.5));
  const ruleOut = inCubic(c01((t - outSec) / 0.22));
  const cx = (x0 + x1) / 2;
  const half = ((x1 - x0) / 2) * rule * (1 - ruleOut);
  const tickX = x0 + (x1 - x0) * c01((t - inSec) / (outSec - inSec));

  const hr = headroom === "auto" ? (/[ÃÕÁÉÍÓÚÂÊÔÀ]/.test(text.toUpperCase()) ? 0.26 : 0) : headroom;
  const hrPx = Math.round(fontSize * hr);
  const inP = outExpo(c01((t - inSec) / 0.36));
  const outP = inCubic(c01((t - outSec) / 0.2));
  const showText = t >= inSec - 0.01 && t <= outSec + 0.25;
  const ty = (1 - inP) * 120 - outP * 120;
  const hl = highlight.map(chave);
  const parts = text.split(" ");

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <line x1={cx - half} x2={cx + half} y1={y - 14} y2={y - 14} stroke={C.accent} strokeWidth={4} />
        <line x1={cx - half} x2={cx + half} y1={y + h + 18} y2={y + h + 18} stroke={C.primaryLight} strokeWidth={2} opacity={0.7} />
        {tick && rule > 0.6 && ruleOut < 0.4 ? <rect x={tickX - 3} y={y + h + 8} width={6} height={20} fill={C.accentLight} /> : null}
      </svg>
      {showText ? (
        // mascara: overflow hidden; a folga hrPx fica ACIMA para o til/acento nao ser cortado
        <div style={{ position: "absolute", left: 0, right: 0, top: y - hrPx, height: h + hrPx, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: hrPx,
              height: h,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateY(${ty.toFixed(1)}px)`,
            }}
          >
            <div
              style={{
                fontFamily: brand.fonts.display,
                fontSize,
                lineHeight: 1,
                letterSpacing: "0.01em",
                color: C.text,
                whiteSpace: "pre",
                textShadow: `0 4px 0 ${C.ink}, 0 0 28px ${rgba(C.ink, 0.8)}`,
              }}
            >
              {parts.map((p, i) => (
                <span key={i} style={hl.indexOf(chave(p)) >= 0 ? { color: C.accent } : undefined}>
                  {p}
                  {i < parts.length - 1 ? " " : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
