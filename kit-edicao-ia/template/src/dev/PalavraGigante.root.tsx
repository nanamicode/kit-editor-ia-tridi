import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { PalavraGigante, type PalavraGiganteProps } from "../kit/palavra-gigante";
import { DevFundo, DevPessoa } from "./Legendas.root";

/**
 * V02 aprovado: palavra acima da cabeca (baseline 900), 3 ecos em contorno empilhados para cima.
 *  DIFERENCA entra 8.80 (fala 8.90) sai 9.40, cheia | GARANTA entra 10.62 (fala 10.70) sai 11.24, contorno
 *  (o titulo do CTA ja mostra GARANTA limpo). Deriva de camera do Presenter: z -2.2, t0 7.8.
 */
export const V02_GIGANTE: PalavraGiganteProps = {
  items: [
    { text: "DIFERENÇA", inSec: 8.8, outSec: 9.4, outline: false, fontSize: 236, baseline: 900, spacing: 2 },
    { text: "GARANTA", inSec: 10.62, outSec: 11.24, outline: true, fontSize: 250, baseline: 900, spacing: 3 },
  ],
  echoes: 3,
  echoStep: 46,
  echoOpacity: 0.62,
  echoFalloff: 0.14,
  parallax: { z: -2.2, t0Sec: 7.8 },
};

/** ordem de camadas obrigatoria: fundo -> palavra gigante -> pessoa recortada (oclui a base das letras) */
const Dev: React.FC<PalavraGiganteProps> = (props) => (
  <AbsoluteFill>
    <DevFundo />
    <PalavraGigante {...props} />
    <DevPessoa />
  </AbsoluteFill>
);

export const PalavraGiganteRoot: React.FC = () => (
  <Composition id="PalavraGigante" component={Dev} defaultProps={V02_GIGANTE} width={1080} height={1920} fps={30} durationInFrames={363} />
);
