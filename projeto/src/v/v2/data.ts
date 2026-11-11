// V2 · Carimbos Tridi · estilo FCA 32 Quadrinho Pop Art (visual V10 Pop Art + V40 Retícula)
// Palavras com tempo real (faster_whisper small pt, word_timestamps) de originais/validados/v2.mp4
export const FPS = 30;
export const DURACAO = 536; // 17.875 s

export type Palavra = { w: string; s: number; e: number };

export const PALAVRAS: Palavra[] = [
  { w: "Por", s: 0.0, e: 0.28 },
  { w: "menos", s: 0.28, e: 0.74 },
  { w: "de", s: 0.74, e: 1.02 },
  { w: "30", s: 1.02, e: 1.5 },
  { w: "centavos,", s: 1.5, e: 2.3 },
  { w: "seu", s: 2.32, e: 2.54 },
  { w: "carimbo", s: 2.54, e: 3.0 },
  { w: "personalizado", s: 3.0, e: 4.1 },
  { w: "estampa", s: 4.1, e: 4.66 },
  { w: "sua", s: 4.66, e: 4.96 },
  { w: "marca", s: 4.96, e: 5.32 },
  { w: "em", s: 5.32, e: 5.56 },
  { w: "qualquer", s: 5.56, e: 6.02 },
  { w: "embalagem.", s: 6.02, e: 6.8 },
  { w: "Serve", s: 6.94, e: 7.2 },
  { w: "em", s: 7.2, e: 7.34 },
  { w: "caixa,", s: 7.34, e: 7.84 },
  { w: "sacola,", s: 8.0, e: 8.66 },
  { w: "papel", s: 8.76, e: 8.92 },
  { w: "kraft,", s: 8.92, e: 9.46 },
  { w: "o", s: 9.68, e: 9.76 },
  { w: "que", s: 9.76, e: 10.06 },
  { w: "for", s: 10.06, e: 10.38 },
  { w: "prático,", s: 10.38, e: 11.12 },
  { w: "ágil", s: 11.24, e: 11.68 },
  { w: "e", s: 11.68, e: 11.86 },
  { w: "profissional.", s: 11.86, e: 12.8 },
  { w: "É", s: 13.06, e: 13.2 },
  { w: "isso", s: 13.2, e: 13.4 },
  { w: "que", s: 13.4, e: 13.54 },
  { w: "faz", s: 13.54, e: 13.72 },
  { w: "o", s: 13.72, e: 13.82 },
  { w: "cliente", s: 13.82, e: 14.14 },
  { w: "lembrar", s: 14.14, e: 14.4 },
  { w: "da", s: 14.4, e: 14.52 },
  { w: "sua", s: 14.52, e: 14.64 },
  { w: "marca.", s: 14.64, e: 14.94 },
  { w: "Quer", s: 15.12, e: 15.14 },
  { w: "saber", s: 15.14, e: 15.36 },
  { w: "mais?", s: 15.36, e: 15.68 },
  { w: "Clique", s: 15.86, e: 15.96 },
  { w: "aqui.", s: 15.96, e: 16.24 },
];

// Blocos de legenda: [primeira, ultima] indice de palavra.
// tipo "oculto": a fala ja esta na tela como titulo/pagina (titulo != legenda), entao a legenda some.
export type Bloco = { de: number; ate: number; tipo: "narracao" | "balao" | "oculto" };
export const BLOCOS: Bloco[] = [
  { de: 0, ate: 4, tipo: "oculto" }, // gancho: titulo "POR MENOS DE 30 CENTAVOS!"
  { de: 5, ate: 7, tipo: "narracao" },
  { de: 8, ate: 10, tipo: "narracao" },
  { de: 11, ate: 13, tipo: "narracao" },
  { de: 14, ate: 22, tipo: "oculto" }, // pagina de gibi SERVE EM: CAIXA / SACOLA / PAPEL KRAFT + "O QUE FOR!"
  { de: 23, ate: 26, tipo: "narracao" },
  { de: 27, ate: 32, tipo: "balao" },
  { de: 33, ate: 36, tipo: "balao" },
  { de: 37, ate: 39, tipo: "balao" },
  { de: 40, ate: 41, tipo: "balao" },
];

// Titulos: so o que traz algo a mais (gancho e item final da lista)
export type Titulo = { t: string; de: number; ate: number; check?: boolean; pre?: string };
export const TITULOS: Titulo[] = [
  { pre: "POR MENOS DE", t: "30 CENTAVOS!", de: 0.0, ate: 2.3 },
  { t: "O QUE FOR!", de: 9.68, ate: 10.36, check: true },
];

// Onomatopeias nos contatos do carimbo (frame de inicio, texto, centro x/y, rotacao, tamanho)
export type Ono = { f: number; t: string; x: number; y: number; rot: number; w: number; dur: number };
export const ONOS: Ono[] = [
  { f: 0, t: "TUM!", x: 790, y: 735, rot: 9, w: 500, dur: 26 },
  { f: 72, t: "TUM!", x: 300, y: 800, rot: -8, w: 400, dur: 20 },
  { f: 123, t: "PÁ!", x: 290, y: 1170, rot: 7, w: 380, dur: 20 },
  { f: 296, t: "TUM!", x: 800, y: 1230, rot: -7, w: 400, dur: 20 },
];

// Pagina de gibi da lista (6,93-9,66 s): um quadrinho por item, o ativo com o video ao vivo
export const PAGINA = { de: 208, p2: 240, p3: 263, ate: 290 };

// Splash "ÁGIL!" cobre o quadro enquanto o original mostra o "ÁGIL" queimado gigante (11,1-12,12 s; folga ate 12,27 s)
export const SPLASH = { de: 333, ate: 368 };
// Troca b-roll -> apresentadora
export const APRESENTADORA = 388;
