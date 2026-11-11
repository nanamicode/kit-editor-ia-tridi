/**
 * Dados das legendas (sem React): tipos, paginacao automatica, enfases e palavra ativa.
 * Tempos SEMPRE em segundos de composicao. Palavras chegam como [{text,s,e}].
 * Para converter a saida de scripts/transcrever.py ([{w,s,e}]) use doWhisper().
 */

export type PalavraTempo = { text: string; s: number; e: number };

/**
 * Enfase visual de uma palavra:
 *  - onda: sublinhado ondulado + leve giro (V02: DIFERENCA)
 *  - etiqueta: caixa escura atras da LINHA inteira, que cresce com a fala (V02: SAIBA MAIS)
 *  - faisca: sublinhado reto + faiscas radiais + giro (V02: GARANTA)
 *  - final: maior, fica na cor ativa ate sumir, faiscas (V02: SEU!)
 * Mesmo com showEmphasis=false o tipo ainda muda a escala do pop e (final) a cor.
 */
export type TipoEnfase = "onda" | "etiqueta" | "faisca" | "final";

/** Casa por `index` (posicao no array) ou por `word` (comparado sem acento/pontuacao/caixa). */
export type Enfase = { kind: TipoEnfase; word?: string; index?: number };

export type PaginaLegenda = {
  /** palavras por linha (indices do array words). Maximo 2 linhas. */
  lines: number[][];
  /** corpo base em px (largura 1080). Omitido = calculado pelo comprimento */
  size?: number;
  /** deslocamento horizontal (px), p/ fugir de mao/objeto */
  dx?: number;
  /** deslocamento vertical (px), p/ fugir do queixo */
  dy?: number;
};

export type PalavraResolvida = PalavraTempo & { i: number; page: number; kind: TipoEnfase | null };

/** texto -> chave sem acento, sem pontuacao, maiuscula ("diferença," -> "DIFERENCA") */
export const chave = (t: string) =>
  t
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]/g, "");

/** saida do transcrever.py ([{w,s,e}]) -> [{text,s,e}] (maiusculas pt-BR por padrao) */
export const doWhisper = (
  arr: { w: string; s: number; e: number }[],
  maiusculas = true,
): PalavraTempo[] =>
  arr
    .map((x) => ({ text: maiusculas ? x.w.trim().toLocaleUpperCase("pt-BR") : x.w.trim(), s: x.s, e: x.e }))
    .filter((x) => x.text.length > 0);

export type OpcoesPaginar = {
  /** max. palavras por pagina (padrao 2: ritmo do V02) */
  maxWords?: number;
  /** max. caracteres por pagina, contando espacos (padrao 15) */
  maxChars?: number;
  /** pausa (s) entre palavras que forca nova pagina (padrao 0.3) */
  maxGapSec?: number;
  /** largura util (px) para calcular o corpo (padrao 900 = 1080 - 2x90) */
  widthPx?: number;
  minSize?: number;
  maxSize?: number;
};

/** corpo que cabe em widthPx para `chars` caracteres de Anton maiuscula (~0.47 em por caractere com o pop) */
export const corpoPara = (chars: number, widthPx = 900, minSize = 110, maxSize = 196) =>
  Math.round(Math.min(maxSize, Math.max(minSize, widthPx / (Math.max(chars, 1) * 0.47))));

/**
 * Paginacao automatica (1 linha por pagina). Quebra apos pontuacao (, . ? ! ; :),
 * em pausas e nos limites de palavras/caracteres. Depois ajuste dx/dy/size a mao se precisar.
 */
export const paginar = (words: PalavraTempo[], o: OpcoesPaginar = {}): PaginaLegenda[] => {
  const maxWords = o.maxWords ?? 2;
  const maxChars = o.maxChars ?? 15;
  const maxGap = o.maxGapSec ?? 0.3;
  const pages: PaginaLegenda[] = [];
  let cur: number[] = [];
  let chars = 0;
  const flush = () => {
    if (!cur.length) return;
    pages.push({ lines: [cur], size: corpoPara(chars, o.widthPx, o.minSize, o.maxSize) });
    cur = [];
    chars = 0;
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const len = w.text.length;
    const breakPunct = prev ? /[,.?!;:]$/.test(prev.text) : false;
    const gap = prev ? w.s - prev.e : 0;
    if (cur.length && (cur.length >= maxWords || chars + 1 + len > maxChars || breakPunct || gap > maxGap)) flush();
    chars += (cur.length ? 1 : 0) + len;
    cur.push(i);
  });
  flush();
  return pages;
};

const kindOf = (w: PalavraTempo, i: number, emphasis: Enfase[]): TipoEnfase | null => {
  for (const e of emphasis) if (e.index === i) return e.kind;
  const k = chave(w.text);
  for (const e of emphasis) if (e.index === undefined && e.word && chave(e.word) === k) return e.kind;
  return null;
};

/** junta palavras + paginas + enfases (pagina de cada palavra = a pagina que lista o indice) */
export const resolver = (words: PalavraTempo[], pages: PaginaLegenda[], emphasis: Enfase[]): PalavraResolvida[] => {
  const pageOf: number[] = words.map(() => -1);
  pages.forEach((p, pi) => p.lines.forEach((l) => l.forEach((i) => (pageOf[i] = pi))));
  return words.map((w, i) => ({ ...w, i, page: pageOf[i], kind: kindOf(w, i, emphasis) }));
};

export type PalavraAtiva = {
  index: number;
  text: string;
  key: string;
  s: number;
  e: number;
  /** 0..1 dentro da palavra */
  progress: number;
  kind: TipoEnfase | null;
};

/** palavra sendo falada em tSec (intervalo [s,e)), para sincronizar outros modulos (flash, soco, SFX) */
export const palavraAtiva = (words: PalavraTempo[], tSec: number, emphasis: Enfase[] = []): PalavraAtiva | null => {
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (tSec >= w.s && tSec < w.e) {
      return {
        index: i,
        text: w.text,
        key: chave(w.text),
        s: w.s,
        e: w.e,
        progress: (tSec - w.s) / (w.e - w.s),
        kind: kindOf(w, i, emphasis),
      };
    }
  }
  return null;
};

/** primeira palavra cuja chave bate (ex.: achaPalavra(words, "garanta")?.s) */
export const achaPalavra = (words: PalavraTempo[], word: string, aPartirDeSec = 0) => {
  const k = chave(word);
  return words.find((w) => w.s >= aPartirDeSec && chave(w.text) === k);
};
