// V6 · Totem Maindx · estilo 21 (Lancamento tech)
// Tempos por palavra: faster_whisper small pt (analise/validados/v6/words.json), em segundos.

export const FPS = 30;
export const DURATION = 986; // 32,866 s do original
export const SRC = "v/v6/v6.mp4";

export type W = { t: string; s: number; hi?: boolean; br?: boolean };
// br = quebra de linha ANTES desta palavra
export type Phrase = { words: W[] };

export const PHRASES: Phrase[] = [
  { words: [{ t: "Seu", s: 0.0 }, { t: "negócio", s: 0.52 }, { t: "ainda", s: 0.84, br: true }, { t: "depende", s: 1.32 }] },
  { words: [{ t: "de", s: 1.66 }, { t: "processos", s: 1.9 }, { t: "manuais.", s: 2.32, hi: true, br: true }] },
  { words: [{ t: "Nós", s: 5.56 }, { t: "trazemos", s: 6.24 }, { t: "a", s: 6.66, br: true }, { t: "solução.", s: 6.86, hi: true }] },
  { words: [{ t: "O", s: 7.82 }, { t: "Totem", s: 7.86 }, { t: "da", s: 8.18 }, { t: "Maindx.", s: 8.36, hi: true, br: true }] },
  { words: [{ t: "O", s: 9.54 }, { t: "Totem", s: 9.64 }, { t: "conta", s: 10.04 }, { t: "com", s: 10.3, br: true }, { t: "uma", s: 10.56 }, { t: "tela", s: 10.66 }] },
  { words: [{ t: "de", s: 10.86 }, { t: "alta", s: 11.1 }, { t: "resolução", s: 11.3 }, { t: "de", s: 11.82, br: true }, { t: "7", s: 12.3, hi: true }, { t: "polegadas.", s: 12.62, hi: true }] },
  { words: [{ t: "E", s: 13.56 }, { t: "conta", s: 13.62 }, { t: "com", s: 13.98 }, { t: "3", s: 14.18, hi: true, br: true }, { t: "sistemas", s: 14.48, hi: true }, { t: "padrões.", s: 15.14 }] },
  { words: [{ t: "Tirar", s: 16.14 }, { t: "senha,", s: 16.44, hi: true }, { t: "bater", s: 17.52, br: true }, { t: "ponto", s: 17.82, hi: true }] },
  { words: [{ t: "e", s: 18.58 }, { t: "pesquisa", s: 18.7 }, { t: "de", s: 19.14 }, { t: "satisfação.", s: 19.36, hi: true, br: true }] },
  { words: [{ t: "E", s: 20.56 }, { t: "contém", s: 20.6 }, { t: "também", s: 20.94 }, { t: "um", s: 21.28, br: true }, { t: "display", s: 21.64 }, { t: "LED", s: 21.98, hi: true }] },
  { words: [{ t: "e", s: 22.9 }, { t: "a", s: 23.02 }, { t: "impressora", s: 23.14 }, { t: "integrada.", s: 23.62, hi: true, br: true }] },
  { words: [{ t: "De", s: 24.64 }, { t: "acordo", s: 24.78 }, { t: "com", s: 25.0 }, { t: "a", s: 25.24 }, { t: "necessidade", s: 25.24, hi: true, br: true }] },
  { words: [{ t: "do", s: 25.72 }, { t: "seu", s: 26.02 }, { t: "negócio.", s: 26.22 }] },
  { words: [{ t: "E", s: 26.78 }, { t: "você", s: 27.14 }, { t: "quer", s: 27.32 }, { t: "saber", s: 27.48 }, { t: "como", s: 27.7, br: true }, { t: "funciona?", s: 27.98, hi: true }] },
  { words: [{ t: "Clique", s: 28.72 }, { t: "em", s: 28.94 }, { t: "Saiba", s: 29.06, hi: true, br: true }, { t: "Mais.", s: 29.28, hi: true }] },
];

// Janelas de recorte do video original dentro do cartao (frames absolutos).
// s = escala; cx = centro x na fonte; y0 = topo da janela na fonte.
// Todas ficam acima de y~1440 da fonte, onde mora a legenda queimada.
export type Shot = { from: number; s: number; cx: number; y0: number };
export const CARD_SHOTS: Shot[] = [
  { from: 0, s: 0.92, cx: 540, y0: 420 }, // apresentadora (cor / P&B)
  { from: 178, s: 1.0, cx: 590, y0: 560 }, // totem no fundo roxo
  { from: 224, s: 1.0, cx: 540, y0: 140 }, // contra-plongee
  { from: 252, s: 1.0, cx: 540, y0: 150 }, // totem inteiro
  { from: 277, s: 0.92, cx: 540, y0: 330 }, // apresentadora com totem
  { from: 360, s: 0.86, cx: 540, y0: 500 }, // tela de perto (legenda no topo)
  { from: 404, s: 0.92, cx: 540, y0: 330 }, // "3 sistemas"
  { from: 600, s: 0.92, cx: 540, y0: 380 }, // apresentadora + totem
  { from: 644, s: 0.92, cx: 540, y0: 420 }, // display LED
  { from: 689, s: 0.92, cx: 540, y0: 380 }, // impressora integrada
  { from: 735, s: 0.92, cx: 540, y0: 420 }, // parede branca
  { from: 808, s: 0.94, cx: 540, y0: 470 }, // CTA, segunda apresentadora (legenda queimada comeca ~1460)
];

export const shotAt = (f: number): Shot => {
  let cur = CARD_SHOTS[0];
  for (const sh of CARD_SHOTS) if (f >= sh.from) cur = sh;
  return cur;
};
