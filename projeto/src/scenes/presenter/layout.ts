/**
 * PRESENTER — constantes de layout, tempo e camera compartilhadas pelas camadas.
 * Tempo de composicao = tempo de arquivo (0 s = 0 s do Criativo). Quadro = round(t * 30).
 */

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = {
  ink: "#120A24",
  purple: "#7B2FF0",
  violet: "#B794FF",
  gold: "#F5C542",
  goldLight: "#FFD86B",
  ivory: "#FFF8E7",
  graphite: "#1B1230",
} as const;

/** Janela da cena (s). Antes de ~8.0 s ela pode estar encoberta pelo overlay do selo. */
export const WINDOW = { fromSec: 7.6, toSec: 12.074 };

/** Linha do tempo (s de composicao). Fala = tempos corrigidos de captions-data.ts. */
export const T = {
  cardIn0: 7.78,
  cardIn1: 8.22,
  sealsIn0: 7.95,
  // palavras-chave gigantes atras da silhueta, SINCRONIZADAS com a fala (tempos corrigidos de captions-data.ts):
  // DIFERENCA fala em 8.90 (letras entram a partir de 8.80), GARANTA fala em 10.70 (entram a partir de 10.62).
  // Cada palavra entra e sai (troca-fecha); nada fica parado como decoracao.
  difIn: 8.8,
  difOut: 9.4,
  garIn: 10.62,
  garOut: 11.24,
  // selo estampa DIRETO no icone do botao (sem voar pela tela): botao entra antes, legivel ao fim de "MAIS"
  pillIn: 9.92, // botao nasce no "Saiba" (pop de UI do audio em 9.98 s) e esta inteiro/legivel em ~10.05 s
  stampHit: 10.4,
  // apresentadora entra (recorte congelado no 1o quadro nitido ate o quadro real assumir)
  personIn0: 7.88,
  personLive: 8.64, // quadro 26 do matte = 1o quadro nitido
  // CTA
  garantaIn: 10.7, // "GARANTA" (fala 10.70)
  oIn: 11.02,
  seuIn: 11.14,
  click: 10.22, // clique do cursor junto do "ding" do audio (10.22 s); "SEU!" (11.14) so da um pulso no botao
  captionsOff: 9.995, // "SAIBA MAIS" vira o botao (a frase nao aparece 2x); o titulo do CTA assume "GARANTA O SEU!"
  // picos de fala para o "soco" de camera
  punches: [
    { t: 8.9, a: 0.022 },
    { t: 10.0, a: 0.016 },
    { t: 10.4, a: 0.03 },
    { t: 10.7, a: 0.02 },
    { t: 11.14, a: 0.026 },
  ],
} as const;

/** Cartao editorial: canto sup-esq arredondado grande, sup-dir chanfrado, base sangra. */
export const CARD = { x0: 64, x1: 1016, top: 960, rTL: 150, chamfer: 118, bottom: 1990 };

/** Matte/pessoa: plate 1080x1080 ancorado na base-centro da tela. */
export const PERSON = { baseScale: 1.1, zoomGain: 0.06, z: 0.6 };

/** Camera 3D compartilhada (fov 30, z 9.4): px por unidade de mundo em z=0. */
export const CAM_Z = 9.4;
export const K = H / (2 * CAM_Z * Math.tan((15 * Math.PI) / 180));
export const ppuAt = (z: number) => (K * CAM_Z) / (CAM_Z - z);

/** Deslocamento de camera (unidades de mundo): paralaxe real entre planos de profundidades diferentes. */
export const camOffset = (t: number) => ({
  x: 0.055 * Math.sin(((t - 7.8) / 6.5) * Math.PI * 2) + 0.012 * (t - 7.8),
  y: 0.03 * Math.sin(((t - 7.8) / 8.2) * Math.PI * 2 + 1),
});

/** Deslocamento em px na tela de um plano a profundidade z (camera se move, o plano fica). */
export const shiftPx = (t: number, z: number) => {
  const c = camOffset(t);
  return { x: -c.x * ppuAt(z), y: c.y * ppuAt(z) };
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Indice do quadro de matte/plate para o tempo de arquivo t (1..107). */
export const matteIndex = (t: number) =>
  Math.min(107, Math.max(26, Math.round(((t - 7.6) * 24000) / 1001) + 1));

/** decaimento exponencial desde o instante t0 (0 antes de t0) */
export const decay = (t: number, t0: number, k: number) =>
  t < t0 ? 0 : Math.exp(-(t - t0) * k);

/** soma dos "socos" de camera no tempo t (fracao de escala) */
export const punchAt = (t: number) => {
  let s = 0;
  for (const p of T.punches) {
    if (t < p.t - 0.02) continue;
    const rise = clamp01((t - (p.t - 0.02)) / 0.05);
    s += p.a * rise * Math.exp(-Math.max(0, t - p.t) * 7);
  }
  return s;
};
