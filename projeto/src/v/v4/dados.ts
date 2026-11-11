// V4 Tridi - dados da fala (faster_whisper small pt, word_timestamps).
// Correcao: o Whisper ouviu "carinho"; a fala real (e a legenda original) e "um carimbo".
export type Palavra = { w: string; s: number; e: number };

export const PALAVRAS: Palavra[] = [
  { w: "Com", s: 0.0, e: 0.28 },
  { w: "um", s: 0.28, e: 0.42 },
  { w: "carimbo", s: 0.42, e: 0.88 },
  { w: "personalizado,", s: 0.88, e: 1.92 },
  { w: "você", s: 2.02, e: 2.24 },
  { w: "coloca", s: 2.24, e: 2.56 },
  { w: "sua", s: 2.56, e: 2.84 },
  { w: "logo", s: 2.84, e: 3.14 },
  { w: "em", s: 3.14, e: 3.3 },
  { w: "qualquer", s: 3.3, e: 3.62 },
  { w: "embalagem", s: 3.62, e: 4.56 },
  { w: "por", s: 4.56, e: 4.78 },
  { w: "menos", s: 4.78, e: 5.04 },
  { w: "de", s: 5.04, e: 5.28 },
  { w: "30", s: 5.28, e: 5.66 },
  { w: "centavos.", s: 5.66, e: 6.52 },
  { w: "Funciona", s: 6.6, e: 7.02 },
  { w: "em", s: 7.02, e: 7.08 },
  { w: "caixa,", s: 7.08, e: 7.62 },
  { w: "saquinho,", s: 7.8, e: 8.28 },
  { w: "papel", s: 8.48, e: 8.64 },
  { w: "craft,", s: 8.64, e: 9.12 },
  { w: "qualquer", s: 9.32, e: 9.56 },
  { w: "coisa", s: 9.56, e: 10.28 },
  { w: "simples,", s: 10.28, e: 10.88 },
  { w: "rápido", s: 11.16, e: 11.56 },
  { w: "e", s: 11.56, e: 11.9 },
  { w: "profissional.", s: 11.9, e: 12.76 },
  { w: "É", s: 13.06, e: 13.22 },
  { w: "isso", s: 13.22, e: 13.42 },
  { w: "que", s: 13.42, e: 13.56 },
  { w: "faz", s: 13.56, e: 13.74 },
  { w: "o", s: 13.74, e: 13.84 },
  { w: "cliente", s: 13.84, e: 14.18 },
  { w: "lembrar", s: 14.18, e: 14.44 },
  { w: "da", s: 14.44, e: 14.56 },
  { w: "sua", s: 14.56, e: 14.66 },
  { w: "marca.", s: 14.66, e: 14.94 },
  { w: "Quer", s: 15.1, e: 15.16 },
  { w: "saber", s: 15.16, e: 15.36 },
  { w: "mais?", s: 15.36, e: 15.68 },
  { w: "Clique", s: 15.84, e: 16.02 },
  { w: "aqui.", s: 16.02, e: 16.22 },
];

// Modos da caixa de dialogo (um bloco de texto por vez), em segundos.
export type Modo = "item" | "fala1" | "custo" | "inventario" | "atributos" | "fala2" | "continue";
export const MODOS: { modo: Modo; de: number; ate: number }[] = [
  { modo: "item", de: 0, ate: 2.0 },
  { modo: "fala1", de: 2.0, ate: 4.5 },
  { modo: "custo", de: 4.5, ate: 6.56 },
  { modo: "inventario", de: 6.56, ate: 10.24 },
  { modo: "atributos", de: 10.24, ate: 12.95 },
  { modo: "fala2", de: 12.95, ate: 15.05 },
  { modo: "continue", de: 15.05, ate: 99 },
];

export const FASES: { rotulo: string; de: number }[] = [
  { rotulo: "FASE 01", de: 0 },
  { rotulo: "FASE 02", de: 6.56 },
  { rotulo: "FASE 03", de: 12.95 },
  { rotulo: "CONTINUE?", de: 15.05 },
];

// Momentos de troca de fase: o video "pixeliza" e volta (transicao 16-bit).
// (15.05 removido: sem corte real ali; a troca para CONTINUE? e so piscar do HUD)
export const TRANSICOES = [6.56, 12.9];

export const CORTE_APRESENTADORA = 12.9; // corte real (ffmpeg scene)
export const ORIGINAL_PRETO = 16.73; // ffmpeg blackdetect: black_start 16.730 (quadro 502) ate o fim
export const DURACAO_ORIGINAL_S = 17.875;
