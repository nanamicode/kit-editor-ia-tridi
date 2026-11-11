/**
 * FAIXA DE TOPO / kicker (metodo: metodos/11-cta.md, secao Faixa de topo).
 * <FaixaTopo text="SEU LOGO EM RELEVO" highlight={["EM","RELEVO"]} inSec outSec y? h? fontSize? headroom? />
 * Ocupa o topo vazio retomando o tema da abertura; SAI antes do botao do CTA entrar no mesmo lugar.
 * Armadilha: til/acento (Õ, Ã, É) cortado pela mascara -> headroom "auto" (0.26 do corpo) resolve.
 */
export { FaixaTopo, type FaixaTopoProps } from "./FaixaTopo";
