/**
 * MONTADOR — le o VideoConfig e empilha os modulos que estiverem presentes.
 * Nao editar por video: o que muda por video e src/video.config.ts.
 *
 * Camadas (de tras para a frente):
 *   PresenterCamera > Presenter
 *        behind : PalavraGigante -> moedas "back"      (atras da pessoa: oclusao real pelo alfa)
 *        pessoa recortada
 *        front  : moedas "front" -> CTA botao/titulo -> selo que estampa o encaixe + onda -> cursor -> Legendas
 *   FaixaTopo (fora da camera)
 *   BRollSequence (opaco ate acabar; NENHUM ancestral com transform/opacity: o rotulo "top" do ultimo
 *                  clipe precisa ficar acima do selo 3D)
 *   SealTransition (overlay transparente; cobre 100% em atSec e racha revelando a apresentadora)
 *   SoundMix (voz original + bed)
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import type { Brand } from "./kit/theme";
import { BrandProvider } from "./kit/theme";
import { BRollSequence, type BRollSequenceProps } from "./kit/broll";
import { SealTransition, type SealTransitionProps } from "./kit/selo3d";
import { Presenter, PresenterCamera, type PresenterCameraProps, type PresenterProps } from "./kit/apresentadora";
import { PalavraGigante, type PalavraGiganteProps } from "./kit/palavra-gigante";
import { FloatingCoins, StampWave, type FloatingCoinsProps, type StampSpec } from "./kit/moedas3d";
import { Legendas, type LegendasProps } from "./kit/legendas";
import { FaixaTopo, type FaixaTopoProps } from "./kit/faixa-topo";
import { CtaBotao, CtaCursor, CtaTitulo, type CtaProps } from "./kit/cta";
import { SoundMix, type SoundMixProps } from "./kit/audio";

export type VideoConfig = {
  id: string;
  brand: Brand;
  width: number;
  height: number;
  fps: number;
  durationSec: number;
  /** cor de fundo atras de tudo (default brand.colors.ink) */
  background?: string;
  broll?: BRollSequenceProps;
  selo3d?: SealTransitionProps;
  apresentadora?: PresenterProps;
  camera?: Omit<PresenterCameraProps, "children">;
  palavraGigante?: PalavraGiganteProps;
  moedas?: { back?: FloatingCoinsProps; front?: FloatingCoinsProps };
  legendas?: LegendasProps;
  faixaTopo?: FaixaTopoProps;
  cta?: CtaProps & { stamp?: StampSpec };
  audio?: SoundMixProps;
};

const PresenterBlock: React.FC<{ c: VideoConfig }> = ({ c }) => {
  if (!c.apresentadora) return null;
  const stamp = c.cta?.stamp;
  const front = (
    <>
      {c.moedas?.front ? <FloatingCoins layer="front" {...c.moedas.front} /> : null}
      {c.cta ? <CtaBotao {...c.cta} /> : null}
      {c.cta ? <CtaTitulo headline={c.cta.headline} /> : null}
      {/* selo que estampa o encaixe do botao: canvas proprio ACIMA do botao (senao o encaixe o cobre) */}
      {stamp ? (
        <FloatingCoins layer="front" coins={[]} fromSec={stamp.hitSec - (stamp.dropSec ?? 0.2) - 0.1} toSec={c.durationSec} stamp={stamp} parallax={0} />
      ) : null}
      {stamp ? <StampWave x={stamp.x} y={stamp.y} r={stamp.size / 2} hitSec={stamp.hitSec} /> : null}
      {c.cta ? <CtaCursor {...c.cta} /> : null}
      {c.legendas ? <Legendas {...c.legendas} /> : null}
    </>
  );
  const scene = (
    <Presenter {...c.apresentadora} front={front}>
      {c.palavraGigante ? <PalavraGigante {...c.palavraGigante} /> : null}
      {c.moedas?.back ? <FloatingCoins layer="back" {...c.moedas.back} /> : null}
    </Presenter>
  );
  return c.camera ? <PresenterCamera {...c.camera}>{scene}</PresenterCamera> : scene;
};

export const Video: React.FC<{ config: VideoConfig }> = ({ config: c }) => (
  <BrandProvider brand={c.brand}>
    <AbsoluteFill style={{ backgroundColor: c.background ?? c.brand.colors.ink }}>
      <PresenterBlock c={c} />
      {c.faixaTopo ? <FaixaTopo {...c.faixaTopo} /> : null}
      {c.broll ? <BRollSequence {...c.broll} /> : null}
      {c.selo3d ? <SealTransition {...c.selo3d} /> : null}
      {c.audio ? <SoundMix {...c.audio} /> : null}
    </AbsoluteFill>
  </BrandProvider>
);
