/**
 * CTA (metodo: metodos/11-cta.md): botao-pilula + titulo palavra a palavra + cursor que clica.
 * <Cta pillInSec clickSec label? pulseSecs? pill? socket? cursor? headline? />  (tudo junto)
 * ou separado, para um selo/icone ficar ENTRE as camadas: <CtaBotao/> <CtaTitulo/> [selo] <CtaCursor/>.
 * Sem preco, prazo ou promocao inventados. Armadilhas: a legenda nao repete o texto do botao nem do
 * titulo (corte a legenda com cutAtSec/stopBeforeSec); o CTA fica legivel ate o ultimo quadro.
 */
export { Cta, CtaBotao, CtaCursor, CtaTitulo, PILL_V02, type CtaPill, type CtaProps } from "./Cta";
