import React from "react";
import { C, EASE, H, W, prog } from "./theme";
import { CLIPS, type ClipDef } from "./timeline";
import { STRIP, getCam, toView } from "./camera";

/**
 * Cortes do B-roll — cada um com uma transicao diferente e uma funcao:
 *  T1  1->2  whip-pan horizontal com motion blur direcional (envelope -> cartao: "vira a pagina")
 *  T2  2->3  flash dourado de 3 quadros + RGB-split + soco de escala (corte "de impacto")
 *  T3  3->4  iris circular que nasce no relevo ja pronto + UM anel dourado simples (pulso de impacto)
 *  T4  4->5  glitch de rasgo (displacement por faixas + split RGB) mascarando o corte seco
 *  T5  5->6  wipe diagonal unico (uma aresta dourada varre a tela da esquerda p/ a direita)
 * Cortes coincidem com os cues "corte" de cues.json (39, 85, 126, 168, 205 quadros a 30 fps).
 */

// ---------------- T1 whip-pan ----------------
export const WHIP = { a: 35, b: 44 };
export const whipP = (f: number) => prog(f, WHIP.a, WHIP.b, EASE.whip);
export const whipBlur = (f: number) => {
  const v = Math.abs(whipP(f + 0.5) - whipP(f - 0.5)); // fracao da largura por quadro
  return Math.min(90, v * W * 0.2);
};

// ---------------- T2 flash + rgb ----------------
export const FLASH_AT = 85;
export const flashAlpha = (f: number) => {
  const k = f - FLASH_AT;
  if (k < -2 || k > 2) return 0;
  return [0, 0.3, 0.5, 0.22, 0][k + 2];
};
export const rgbDx = (f: number, c: number, spread: number, peak: number) =>
  peak * Math.max(0, 1 - Math.abs(f - c) / spread);

// ---------------- T3 iris + anel simples ----------------
// Antes era um selo recortado de aro duplo em cima do estampo (ruido, escondia o gesto).
// Agora: um circulo limpo que abre a partir do relevo pronto do clipe 3 (9 quadros), com
// UM anel dourado fino na borda. Nada de dentes, degrade ou segundo aro.
export const SEAL_WIPE = { a: 122, b: 131 };
export const sealR = (f: number) =>
  prog(f, SEAL_WIPE.a, SEAL_WIPE.b, EASE.inOut) * 1700;

let sealCenterCache: { x: number; y: number } | null = null;
export const sealCenter = () => {
  if (!sealCenterCache) {
    // nasce no relevo do clipe 3 (centro da caixa do relevo no quadro do corte), em coords de tela
    const d = CLIPS[2];
    const v = toView(getCam(d, 126, false), d.emb.u, d.emb.v);
    sealCenterCache = { x: v.x + STRIP.x, y: v.y + STRIP.y };
  }
  return sealCenterCache;
};

// ---------------- T4 glitch de rasgo ----------------
export const TEAR = { a: 166, b: 170, cut: 168 };
export const tearAmount = (f: number) => {
  if (f < TEAR.a || f > TEAR.b) return 0;
  const k = Math.abs(f - (TEAR.cut - 0.5));
  return 40 * Math.exp(-k * 0.5);
};

// ---------------- T5 wipe diagonal ----------------
export const BLINDS = { a: 201, b: 208 };
const DIAG_LEAN = 420;
/** x do topo da aresta diagonal (a base fica DIAG_LEAN px mais a esquerda) */
const diagX = (f: number) => prog(f, BLINDS.a, BLINDS.b, EASE.inOut) * (W + DIAG_LEAN);

// ---------------- relevo: varredura de luz rasante ----------------
export const reliefP = (def: ClipDef, f: number) =>
  prog(f, def.holdStart, def.exit - 2, EASE.inOut);

// ---------------- estilo de camada por clipe ----------------
export type LayerFx = {
  style: React.CSSProperties;
  /** deslocamento horizontal do "mundo" (paralaxe do fundo) */
  world: number;
  visible: boolean;
};

export const layerFx = (def: ClipDef, f: number): LayerFx => {
  const style: React.CSSProperties = {};
  let world = 0;
  let visible = true;
  if (def.n === 1 && f >= WHIP.a) {
    const x = -whipP(f) * W;
    style.translate = `${x}px 0`;
    style.filter = "url(#bl-whip)";
    world = x;
  }
  if (def.n === 2) {
    if (f <= WHIP.b) {
      const x = (1 - whipP(f)) * W;
      style.translate = `${x}px 0`;
      style.filter = "url(#bl-whip)";
      world = x;
    }
    if (f >= 81) {
      style.scale = 1 + 0.12 * prog(f, 81, FLASH_AT, EASE.in);
    }
  }
  if (def.n === 3) {
    style.scale = 1 + 0.16 * (1 - prog(f, 85, 95, EASE.out));
  }
  if (def.n === 4 && f < SEAL_WIPE.b + 1) {
    const R = sealR(f);
    if (R < 4) visible = false;
    else {
      const c = sealCenter();
      style.clipPath = `circle(${R.toFixed(1)}px at ${c.x.toFixed(1)}px ${c.y.toFixed(1)}px)`;
    }
  }
  if (def.n === 5) {
    style.scale = 1 + 0.07 * (1 - prog(f, 168, 175, EASE.out));
  }
  if (def.n === 6 && f <= BLINDS.b) {
    const x = diagX(f);
    if (x < 1) visible = false;
    else {
      style.clipPath = `polygon(0px 0px, ${x.toFixed(1)}px 0px, ${(x - DIAG_LEAN).toFixed(1)}px ${H}px, 0px ${H}px)`;
    }
  }
  return { style, world, visible };
};

/** Filtro global (aplicado no conjunto) nos quadros de glitch/RGB. */
export const stackFilter = (f: number): string | undefined => {
  // no maximo 3 quadros de glitch por corte, e so na IMAGEM do clipe (ver CamLayer)
  if (f >= 84 && f <= 86) return "url(#bl-rgb)";
  if (f >= TEAR.cut - 1 && f <= TEAR.cut + 1) return "url(#bl-tear)";
  return undefined;
};

/** Elementos desenhados por cima de tudo durante as transicoes. */
export const TransitionOverlays: React.FC<{ frame: number }> = ({ frame }) => {
  const els: React.ReactNode[] = [];
  const fa = flashAlpha(frame);
  if (fa > 0) {
    els.push(
      <div
        key="flash"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFF0BC",
          opacity: fa * 0.8,
        }}
      />,
    );
  }
  if (frame >= SEAL_WIPE.a && frame <= SEAL_WIPE.b + 2) {
    const R = sealR(frame);
    if (R > 4) {
      const c = sealCenter();
      const p = prog(frame, SEAL_WIPE.a, SEAL_WIPE.b);
      const fade = 1 - prog(frame, SEAL_WIPE.b - 3, SEAL_WIPE.b + 1);
      els.push(
        <svg
          key="iris"
          width={W}
          height={H}
          style={{ position: "absolute", left: 0, top: 0, opacity: fade }}
        >
          <circle
            cx={c.x}
            cy={c.y}
            r={R}
            fill="none"
            stroke={C.goldLight}
            strokeWidth={Math.max(3, 12 * (1 - p))}
          />
        </svg>,
      );
    }
  }
  if (frame >= BLINDS.a && frame <= BLINDS.b) {
    const x = diagX(frame);
    const fade = 1 - prog(frame, BLINDS.b - 1, BLINDS.b + 0.5);
    els.push(
      <svg
        key="diag"
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0, opacity: fade }}
      >
        <line x1={x} y1={0} x2={x - DIAG_LEAN} y2={H} stroke={C.goldLight} strokeWidth={14} />
        <line x1={x - 26} y1={0} x2={x - 26 - DIAG_LEAN} y2={H} stroke={C.ivory} strokeWidth={4} opacity={0.8} />
      </svg>,
    );
  }
  return <>{els}</>;
};

/** Definicoes SVG (filtros) — atributos dirigidos por quadro. */
export const FilterDefs: React.FC<{ frame: number }> = ({ frame }) => {
  const bx = whipBlur(frame);
  const dx = rgbDx(frame, FLASH_AT, 3.2, 26);
  const tearS = tearAmount(frame);
  const tdx = rgbDx(frame, TEAR.cut - 0.5, 3, 9);
  const split = (id: string, ox: number, extra: React.ReactNode, input: string) => (
    <filter
      id={id}
      x="-4%"
      y="-3%"
      width="108%"
      height="106%"
      colorInterpolationFilters="sRGB"
    >
      {extra}
      <feColorMatrix
        in={input}
        type="matrix"
        values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
        result="r"
      />
      <feColorMatrix
        in={input}
        type="matrix"
        values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
        result="g"
      />
      <feColorMatrix
        in={input}
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
        result="b"
      />
      <feOffset in="r" dx={ox} dy={-ox * 0.18} result="r2" />
      <feOffset in="b" dx={-ox} dy={ox * 0.18} result="b2" />
      <feBlend in="r2" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="b2" mode="screen" />
    </filter>
  );
  return (
    <svg
      width={0}
      height={0}
      style={{ position: "absolute", left: 0, top: 0 }}
      aria-hidden
    >
      <defs>
        <filter id="bl-whip" x="-15%" y="-2%" width="130%" height="104%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} 0`} />
        </filter>
        {split("bl-rgb", dx, null, "SourceGraphic")}
        {split(
          "bl-tear",
          tdx,
          <>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.0006 0.03"
              numOctaves={2}
              seed={frame}
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale={tearS}
              xChannelSelector="R"
              yChannelSelector="B"
              result="d"
            />
          </>,
          "d",
        )}
        {CLIPS.map((def) => {
          const p = reliefP(def, frame);
          return (
            <filter
              key={def.n}
              id={`bl-relief-${def.n}`}
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.5 0.17 0 0"
                result="lum"
              />
              <feGaussianBlur in="lum" stdDeviation="1.2" result="h" />
              <feSpecularLighting
                in="h"
                surfaceScale={7}
                specularConstant={1.6}
                specularExponent={24}
                lightingColor="#FFE7A0"
                result="spec"
              >
                <feDistantLight azimuth={190 + 160 * p} elevation={15} />
              </feSpecularLighting>
              <feComposite in="spec" in2="spec" operator="over" />
            </filter>
          );
        })}
      </defs>
    </svg>
  );
};
