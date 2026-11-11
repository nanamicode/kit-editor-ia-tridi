import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { Cta, type CtaProps } from "../kit/cta";
import { FaixaTopo, type FaixaTopoProps } from "../kit/faixa-topo";
import { DevFundo, DevPessoa, V02_WORDS } from "./Legendas.root";

/**
 * V02 aprovado: botao nasce no "Saiba" (9.92, pop de UI do audio 9.98), clique no "ding" (10.22),
 * selo cai no encaixe em 10.40, pulso extra no "SEU!" (11.14). Titulo = "GARANTA O SEU!" pela fala real.
 */
export const V02_CTA: CtaProps = {
  label: "SAIBA MAIS",
  labelSize: 92,
  pillInSec: 9.92,
  clickSec: 10.22,
  pulseSecs: [11.14],
  pill: { cx: 540, cy: 410, w: 860, h: 168 },
  socket: { x: 198, r: 60, fillSec: 10.4 },
  cursor: { from: [1010, 640], showSec: 9.8 },
  headline: { words: V02_WORDS.slice(8), highlight: ["SEU"], top: 556, size: 100, gap: 26 },
};

/** V02: faixa no topo vazio 8.55-9.80 (sai antes do botao, que entra em 9.92) */
export const V02_FAIXA: FaixaTopoProps = {
  text: "SEU LOGO EM RELEVO",
  highlight: ["EM", "RELEVO"],
  inSec: 8.55,
  outSec: 9.8,
  y: 244,
  h: 108,
  fontSize: 94,
};

const DevCta: React.FC<CtaProps> = (props) => (
  <AbsoluteFill>
    <DevFundo />
    <DevPessoa />
    <Cta {...props} />
  </AbsoluteFill>
);

const DevFaixa: React.FC<FaixaTopoProps> = (props) => (
  <AbsoluteFill>
    <DevFundo />
    <DevPessoa />
    <FaixaTopo {...props} />
  </AbsoluteFill>
);

export const CtaRoot: React.FC = () => (
  <>
    <Composition id="Cta" component={DevCta} defaultProps={V02_CTA} width={1080} height={1920} fps={30} durationInFrames={363} />
    <Composition id="FaixaTopo" component={DevFaixa} defaultProps={V02_FAIXA} width={1080} height={1920} fps={30} durationInFrames={363} />
    {/* teste do til: texto com Õ/Ã sai inteiro da mascara (headroom auto) */}
    <Composition
      id="FaixaTopoTil"
      component={DevFaixa}
      defaultProps={{ ...V02_FAIXA, text: "CARTÕES EM PROMOÇÃO", highlight: ["PROMOÇÃO"] }}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={363}
    />
  </>
);
