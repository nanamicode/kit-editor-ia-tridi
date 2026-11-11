/**
 * PALAVRA GIGANTE COM ECO (metodo: metodos/08-palavra-gigante-eco.md).
 * <PalavraGigante items={[{text,inSec,outSec,outline?,fontSize?,baseline?,spacing?}]} echoes? echoStep? parallax? />
 * Montar ATRAS da pessoa recortada (oclusao real). Uma palavra por vez, so nas palavras-chave.
 * Armadilhas: tempos pela fala real (gigantePelaFala), nao por roteiro; contorno (outline) quando
 * outro texto limpo ja mostra a mesma palavra (ex.: titulo do CTA).
 */
import { achaPalavra, type PalavraTempo } from "../legendas/dados";
import type { PalavraGiganteItem } from "./PalavraGigante";

export {
  PalavraGigante,
  deslocamentoParalaxe,
  sombraDaMarca,
  type PalavraGiganteItem,
  type PalavraGiganteProps,
  type ParalaxeGigante,
} from "./PalavraGigante";

/**
 * Cria o item a partir da fala: entra leadSec antes da palavra, sai holdSec depois do fim.
 * Retorna null se a palavra nao existir. Ex.: gigantePelaFala(words, "garanta", {outline:true, holdSec:0.22})
 */
export const gigantePelaFala = (
  words: PalavraTempo[],
  word: string,
  o: Partial<Omit<PalavraGiganteItem, "inSec" | "outSec">> & { leadSec?: number; holdSec?: number; aPartirDeSec?: number } = {},
): PalavraGiganteItem | null => {
  const w = achaPalavra(words, word, o.aPartirDeSec ?? 0);
  if (!w) return null;
  const { leadSec = 0.1, holdSec = 0, aPartirDeSec: _a, ...rest } = o;
  return {
    text: rest.text ?? w.text.replace(/[,.?!;:]+$/, ""),
    inSec: +(w.s - leadSec).toFixed(3),
    outSec: +(w.e + holdSec).toFixed(3),
    ...rest,
  };
};
