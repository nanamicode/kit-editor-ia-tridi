/**
 * LEGENDAS palavra a palavra (metodo: metodos/02-legendas.md).
 * <Legendas words={[{text,s,e}]} pages? emphasis? showEmphasis? yCenter? yNudge? stopBeforeSec? cutAtSec? .../>
 * - words: tempos de FALA REAL (scripts/transcrever.py -> doWhisper()). pages omitido = paginar().
 * - emphasis: [{word:"GARANTA", kind:"faisca"}] ou [{index:3, kind:"onda"}].
 * Armadilhas: legenda nao repete texto que outro elemento ja mostra (use stopBeforeSec/cutAtSec);
 * entrada 0.8 quadro antes da voz (leadFrames); saida sem fade (pop-out com opacidade 1).
 */
export { Legendas, type LegendasProps, type CoresLegenda } from "./Legendas";
export {
  achaPalavra,
  chave,
  corpoPara,
  doWhisper,
  paginar,
  palavraAtiva,
  resolver,
  type Enfase,
  type OpcoesPaginar,
  type PaginaLegenda,
  type PalavraAtiva,
  type PalavraResolvida,
  type PalavraTempo,
  type TipoEnfase,
} from "./dados";
