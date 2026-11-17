/**
 * AMOSTRAS "show de efeitos" com B-roll de varios videos (scripts/montar_broll_multifonte.py).
 * Cada amostra = B-roll novo (0-7.8 s) + o fechamento validado do FV 09 (selo 3D, apresentadora, CTA).
 * Para criar outra: gere public/amostras/<Id>/ com o script e acrescente o Id em AMOSTRAS.
 */
import React from "react";
import { Composition } from "remotion";
import { Video, type VideoConfig } from "./Video";
import { config as base } from "./video.config";
import type { BRollClip } from "./kit/broll";
import ChancelaA from "../public/amostras/ChancelaA/clips.json";
import ChancelaB from "../public/amostras/ChancelaB/clips.json";
import CarimboA from "../public/amostras/CarimboA/clips.json";
import CarimboB from "../public/amostras/CarimboB/clips.json";

const AMOSTRAS: Record<string, unknown> = { ChancelaA, ChancelaB, CarimboA, CarimboB };

/** faixa do topo no fechamento: "relevo" so em chancela; carimbo e tinta */
const FAIXA: Record<string, { text: string; highlight: string[] }> = {
  ChancelaA: { text: "SEU LOGO EM RELEVO", highlight: ["EM", "RELEVO"] },
  ChancelaB: { text: "SEU LOGO EM RELEVO", highlight: ["EM", "RELEVO"] },
  CarimboA: { text: "SUA MARCA EM TUDO", highlight: ["EM", "TUDO"] },
  CarimboB: { text: "COM A SUA CARA", highlight: ["SUA", "CARA"] },
};

const make = (id: string, clips: BRollClip[]): VideoConfig => ({
  ...base,
  id,
  faixaTopo: base.faixaTopo ? { ...base.faixaTopo, ...FAIXA[id] } : undefined,
  broll: { src: `amostras/${id}/bruto.mp4`, srcFps: 30, srcWidth: 1080, srcHeight: 1920, clips },
  audio: { voiceSrc: `amostras/${id}/voz.wav`, voiceVolume: 0.668, bedSrc: `amostras/${id}/bed.wav`, bedVolume: 1 },
});

export const Amostras: React.FC = () => (
  <>
    {Object.entries(AMOSTRAS).map(([id, clips]) => {
      const config = make(id, clips as BRollClip[]);
      return (
        <Composition
          key={id}
          id={id}
          component={Video}
          defaultProps={{ config }}
          width={config.width}
          height={config.height}
          fps={config.fps}
          durationInFrames={Math.round(config.durationSec * config.fps)}
        />
      );
    })}
  </>
);

