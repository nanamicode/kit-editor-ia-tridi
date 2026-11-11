/**
 * Transicoes nos cortes, dirigidas pela lista de clipes (cada clipe diz como ENTRA):
 *  whip   whip-pan horizontal com motion blur direcional (-4..+5 q do corte)
 *  flash  clarao de acento 3 q + split RGB + soco de escala (corte "de impacto")
 *  iris   circulo que abre a partir do relevo pronto do clipe anterior + 1 anel de acento
 *  glitch rasgo (displacement por faixas + split RGB) mascarando o corte seco (+-1 q)
 *  wipe   aresta diagonal de acento varre a tela da esquerda p/ a direita
 *  cut    corte seco
 * Filtros SVG com ids prefixados (`id`), atributos recalculados por quadro.
 */
import React from "react";
import { EASE, prog, useBrand } from "../theme";
import { reliefOnScreen } from "./Camera";
import { tint } from "./color";
import { fr } from "./plan";
import type { ClipPlan, SrcInfo } from "./types";

const W = 1080;
const H = 1920;
const DIAG_LEAN = 420;

export type TxCtx = { plans: ClipPlan[]; fps: number; src: SrcInfo; id: string };

const win = (d: ClipPlan, fps: number) => {
  const C = d.cut;
  switch (d.tIn) {
    case "whip":
      return { a: C - fr(4, fps), b: C + fr(5, fps) };
    case "iris":
      return { a: C - fr(4, fps), b: C + fr(5, fps) };
    case "wipe":
      return { a: C - fr(4, fps), b: C + fr(3, fps) };
    case "glitch":
      return { a: C - fr(2, fps), b: C + fr(2, fps) };
    default:
      return { a: C - fr(2, fps), b: C + fr(2, fps) };
  }
};

const whipP = (d: ClipPlan, f: number, fps: number) => {
  const { a, b } = win(d, fps);
  return prog(f, a, b, EASE.whip);
};
const irisR = (d: ClipPlan, f: number, fps: number) => {
  const { a, b } = win(d, fps);
  return prog(f, a, b, EASE.inOut) * 1700;
};
const diagX = (d: ClipPlan, f: number, fps: number) => {
  const { a, b } = win(d, fps);
  return prog(f, a, b, EASE.inOut) * (W + DIAG_LEAN);
};
const rgbDx = (f: number, c: number, spread: number, peak: number) =>
  peak * Math.max(0, 1 - Math.abs(f - c) / spread);

export type LayerFx = { style: React.CSSProperties; world: number; visible: boolean };

/** estilo da camada do clipe i no quadro f (transicao de entrada e de saida) */
export const layerFx = (i: number, f: number, ctx: TxCtx): LayerFx => {
  const { plans, fps, src, id } = ctx;
  const d = plans[i];
  const nx = plans[i + 1];
  const style: React.CSSProperties = {};
  let world = 0;
  let visible = true;
  const scales: number[] = [];

  // ---- saida (transicao do proximo clipe) ----
  if (nx) {
    const C = nx.cut;
    if (nx.tIn === "whip" && f >= win(nx, fps).a) {
      const x = -whipP(nx, f, fps) * W;
      style.translate = `${x}px 0`;
      style.filter = `url(#${id}-whip)`;
      world = x;
    }
    if (nx.tIn === "flash" && f >= C - fr(4, fps)) {
      scales.push(1 + 0.12 * prog(f, C - fr(4, fps), C, EASE.in));
    }
  }
  // ---- entrada ----
  if (i > 0) {
    const C = d.cut;
    const { b } = win(d, fps);
    if (d.tIn === "whip" && f <= b) {
      const x = (1 - whipP(d, f, fps)) * W;
      style.translate = `${x}px 0`;
      style.filter = `url(#${id}-whip)`;
      world = x;
    }
    if (d.tIn === "flash") scales.push(1 + 0.16 * (1 - prog(f, C, C + fr(10, fps), EASE.out)));
    if (d.tIn === "glitch") scales.push(1 + 0.07 * (1 - prog(f, C, C + fr(7, fps), EASE.out)));
    if (d.tIn === "iris" && f < b + 1) {
      const R = irisR(d, f, fps);
      if (R < 4) visible = false;
      else {
        const c = reliefOnScreen(plans[i - 1], C, src, fps);
        style.clipPath = `circle(${R.toFixed(1)}px at ${c.x.toFixed(1)}px ${c.y.toFixed(1)}px)`;
      }
    }
    if (d.tIn === "wipe" && f <= b) {
      const x = diagX(d, f, fps);
      if (x < 1) visible = false;
      else
        style.clipPath = `polygon(0px 0px, ${x.toFixed(1)}px 0px, ${(x - DIAG_LEAN).toFixed(1)}px ${H}px, 0px ${H}px)`;
    }
  }
  if (scales.length) style.scale = scales.reduce((a, s) => a * s, 1);
  return { style, world, visible };
};

/** filtro aplicado so na IMAGEM dos clipes (CamLayer) nos quadros de glitch/RGB (max 3 q por corte) */
export const stackFilter = (f: number, ctx: TxCtx): string | undefined => {
  for (const d of ctx.plans) {
    if (Math.abs(f - d.cut) > 1) continue;
    if (d.tIn === "flash") return `url(#${ctx.id}-rgb)`;
    if (d.tIn === "glitch") return `url(#${ctx.id}-tear)`;
  }
  return undefined;
};

export const reliefP = (d: ClipPlan, f: number) =>
  prog(f, d.holdStart, Math.max(d.holdStart + 1, d.exit - 2), EASE.inOut);

/** overlays por cima de tudo durante as transicoes (clarao, anel da iris, aresta do wipe) */
export const TransitionOverlays: React.FC<{ frame: number; ctx: TxCtx }> = ({ frame, ctx }) => {
  const { colors } = useBrand();
  const { plans, fps, src } = ctx;
  const els: React.ReactNode[] = [];
  plans.forEach((d, i) => {
    if (i === 0) return;
    const { a, b } = win(d, fps);
    if (d.tIn === "flash") {
      const k = Math.round(((frame - d.cut) * 30) / fps);
      if (k >= -2 && k <= 2) {
        const fa = [0, 0.3, 0.5, 0.22, 0][k + 2];
        if (fa > 0)
          els.push(
            <div
              key={`flash${i}`}
              style={{ position: "absolute", inset: 0, backgroundColor: tint(colors.accentLight, 0.55), opacity: fa * 0.8 }}
            />,
          );
      }
    }
    if (d.tIn === "iris" && frame >= a && frame <= b + fr(2, fps)) {
      const R = irisR(d, frame, fps);
      if (R > 4) {
        const c = reliefOnScreen(plans[i - 1], d.cut, src, fps);
        const p = prog(frame, a, b);
        const fade = 1 - prog(frame, b - fr(3, fps), b + fr(1, fps));
        els.push(
          <svg key={`iris${i}`} width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: fade }}>
            <circle cx={c.x} cy={c.y} r={R} fill="none" stroke={colors.accentLight} strokeWidth={Math.max(3, 12 * (1 - p))} />
          </svg>,
        );
      }
    }
    if (d.tIn === "wipe" && frame >= a && frame <= b) {
      const x = diagX(d, frame, fps);
      const fade = 1 - prog(frame, b - fr(1, fps), b + 0.5);
      els.push(
        <svg key={`wipe${i}`} width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: fade }}>
          <line x1={x} y1={0} x2={x - DIAG_LEAN} y2={H} stroke={colors.accentLight} strokeWidth={14} />
          <line x1={x - 26} y1={0} x2={x - 26 - DIAG_LEAN} y2={H} stroke={colors.text} strokeWidth={4} opacity={0.8} />
        </svg>,
      );
    }
  });
  return <>{els}</>;
};

/** definicoes SVG (filtros) dirigidas por quadro */
export const FilterDefs: React.FC<{ frame: number; ctx: TxCtx }> = ({ frame, ctx }) => {
  const { colors } = useBrand();
  const { plans, fps, id } = ctx;
  let bx = 0;
  let dx = 0;
  let tearS = 0;
  let tdx = 0;
  for (const d of plans) {
    if (d.tIn === "whip") {
      const v = Math.abs(whipP(d, frame + 0.5, fps) - whipP(d, frame - 0.5, fps));
      bx = Math.max(bx, Math.min(90, v * W * 0.2));
    }
    if (d.tIn === "flash") dx = Math.max(dx, rgbDx(frame, d.cut, 3.2, 26));
    if (d.tIn === "glitch") {
      const { a, b } = win(d, fps);
      if (frame >= a && frame <= b) {
        const k = Math.abs(frame - (d.cut - 0.5));
        tearS = Math.max(tearS, 40 * Math.exp(-k * 0.5));
      }
      tdx = Math.max(tdx, rgbDx(frame, d.cut - 0.5, 3, 9));
    }
  }
  const split = (fid: string, ox: number, extra: React.ReactNode, input: string) => (
    <filter id={fid} x="-4%" y="-3%" width="108%" height="106%" colorInterpolationFilters="sRGB">
      {extra}
      <feColorMatrix in={input} type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
      <feColorMatrix in={input} type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
      <feColorMatrix in={input} type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
      <feOffset in="r" dx={ox} dy={-ox * 0.18} result="r2" />
      <feOffset in="b" dx={-ox} dy={ox * 0.18} result="b2" />
      <feBlend in="r2" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="b2" mode="screen" />
    </filter>
  );
  return (
    <svg width={0} height={0} style={{ position: "absolute", left: 0, top: 0 }} aria-hidden>
      <defs>
        <filter id={`${id}-whip`} x="-15%" y="-2%" width="130%" height="104%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} 0`} />
        </filter>
        {split(`${id}-rgb`, dx, null, "SourceGraphic")}
        {split(
          `${id}-tear`,
          tdx,
          <>
            <feTurbulence type="fractalNoise" baseFrequency="0.0006 0.03" numOctaves={2} seed={frame} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={tearS} xChannelSelector="R" yChannelSelector="B" result="d" />
          </>,
          "d",
        )}
        {plans.map((d) => (
          <filter
            key={d.i}
            id={`${id}-relief-${d.i}`}
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.5 0.17 0 0" result="lum" />
            <feGaussianBlur in="lum" stdDeviation="1.2" result="h" />
            <feSpecularLighting
              in="h"
              surfaceScale={7}
              specularConstant={1.6}
              specularExponent={24}
              lightingColor={tint(colors.accentLight, 0.35)}
              result="spec"
            >
              <feDistantLight azimuth={190 + 160 * reliefP(d, frame)} elevation={15} />
            </feSpecularLighting>
            <feComposite in="spec" in2="spec" operator="over" />
          </filter>
        ))}
      </defs>
    </svg>
  );
};
