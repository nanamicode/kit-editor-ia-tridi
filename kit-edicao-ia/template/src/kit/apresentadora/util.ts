/**
 * APRESENTADORA — tipos e funcoes puras (tempo do matte, paralaxe, socos de camera, tons derivados da marca).
 * Sem React aqui: tudo testavel e reutilizavel por outros modulos.
 */
import { clamp, H } from "../theme";

/** O matte.json que scripts/recorte_rvm.py grava (importar no video.config). */
export type MatteInfo = {
  /** tempo (s do ARQUIVO de origem) do quadro m0001 */
  firstFileTime: number;
  fps: number;
  count: number;
  w: number;
  h: number;
  /** 1o quadro nitido (1-based). Antes dele o recorte fica congelado nesse quadro */
  sharpFrom?: number;
  /** curva de exposicao por quadro (1-based -> indice 0). Ausente = 1 */
  exposure?: { gain: number[]; gamma: number[]; sat: number[] };
};

/** Soco de camera: t (s de composicao), a (fracao de escala, 0.02 = +2%), rot (graus, opcional). */
export type Punch = { t: number; a: number; rot?: number };

/* ------------------------------------------------------------------ matte ---- */

/** tempo do arquivo -> indice 1-based do quadro do matte, travado em [sharpFrom, count]. */
export const matteIndexAt = (fileSec: number, m: MatteInfo) => {
  const i = Math.round((fileSec - m.firstFileTime) * m.fps) + 1;
  return clamp(i, m.sharpFrom ?? 1, m.count);
};

/** tempo (s do arquivo) em que o 1o quadro nitido acontece */
export const sharpFileSec = (m: MatteInfo) => m.firstFileTime + ((m.sharpFrom ?? 1) - 1) / m.fps;

export const pad4 = (n: number) => String(n).padStart(4, "0");

/** exposicao do quadro i (1-based), com o ganho LIMITADO (o resto vai para a curva de sombras/gamma). */
export const exposureAt = (m: MatteInfo, i: number, maxGain: number) => {
  const e = m.exposure;
  if (!e) return { gain: 1, gamma: 1, sat: 1 };
  const g = e.gain[i - 1] ?? 1;
  const gain = Math.min(g, maxGain);
  // ganho cortado pelo teto: compensa um pouco com gamma (sombras), nunca com ganho linear
  const extra = g > maxGain ? Math.max(0.8, 1 - 0.3 * Math.log(g / maxGain)) : 1;
  return { gain, gamma: Math.max(0.75, (e.gamma[i - 1] ?? 1) * extra), sat: e.sat[i - 1] ?? 1 };
};

/* --------------------------------------------------------------- paralaxe ---- */

const CAM_Z = 9.4;
const K = H / (2 * CAM_Z * Math.tan((15 * Math.PI) / 180));

/**
 * Deslocamento (px) de um plano na profundidade z (camera 3D virtual fov 30, z 9.4) no tempo t.
 * Mesma formula do deslocamentoParalaxe da palavra-gigante: camadas com z diferentes andam coerentes.
 * z > 0 = mais perto (anda mais). t0Sec = inicio da deriva.
 */
export const paralaxe = (t: number, z: number, t0Sec: number) => {
  const ppu = (K * CAM_Z) / (CAM_Z - z);
  const u = t - t0Sec;
  const cx = 0.055 * Math.sin((u / 6.5) * Math.PI * 2) + 0.012 * u;
  const cy = 0.03 * Math.sin((u / 8.2) * Math.PI * 2 + 1);
  return { x: -cx * ppu, y: cy * ppu };
};

/* ------------------------------------------------------------------ socos ---- */

/**
 * Soma dos socos no tempo t. Cada soco sobe em `attack` s comecando `lead` s antes do pico e decai
 * exponencialmente (k = decay). Retorna { s: escala extra, rot: graus }.
 */
export const punchAt = (t: number, punches: readonly Punch[], attack = 0.06, lead = 0.03, decay = 8) => {
  let s = 0;
  let rot = 0;
  for (const p of punches) {
    if (t < p.t - lead) continue;
    const k = clamp((t - (p.t - lead)) / attack, 0, 1) * Math.exp(-Math.max(0, t - p.t) * decay);
    s += p.a * k;
    rot += (p.rot ?? 0) * k;
  }
  return { s, rot };
};

/* ------------------------------------------------------------ tons da marca ---- */

const hex = (c: string) => {
  const h = c.replace("#", "");
  const v = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
};

/** mistura duas cores hex (t=0 -> a, t=1 -> b). Usado para tons DERIVADOS da marca (documentado no CONTRATO). */
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

/** cor hex com alfa -> rgba() */
export const rgba = (c: string, a: number) => {
  const [r, g, b] = hex(c);
  return `rgba(${r},${g},${b},${a})`;
};

/** clareia (t>0, para o branco) ou escurece (t<0, para o preto) — tons derivados */
export const tone = (c: string, t: number) => (t >= 0 ? mix(c, "#ffffff", t) : mix(c, "#000000", -t));
