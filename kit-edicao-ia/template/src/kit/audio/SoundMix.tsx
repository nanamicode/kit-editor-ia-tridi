/**
 * SoundMix — as duas faixas do mix aprovado: voz (audio original do video bruto, com os cliques reais)
 * + bed.wav (trilha + SFX sintetizados por scripts/audio_trilha_sfx.py, com ducking ja embutido).
 *
 * Props (caminhos relativos a public/, passados por staticFile):
 *   voiceSrc     video/audio com a voz (default "exemplo/criativo.mp4"); null = sem voz
 *   voiceVolume  0.668 (= -3.5 dB; o original passava de 0 dBTP). Use o voz_volume_remotion do script.
 *   bedSrc       "exemplo/audio/bed.wav"; null = sem bed
 *   bedVolume    1.0 (o bed ja sai no nivel certo; mexer aqui desfaz a medicao de -14 LUFS)
 *   voiceTrimBeforeSec / bedOffsetSec  para alinhar quando o video comeca depois do inicio do arquivo
 *
 * Armadilhas: o volume aqui precisa ser o MESMO usado em checar_audio.py (--voz-vol/--bed-vol);
 * nao duplique a voz (se o <Video> do B-roll/apresentadora tambem toca audio, deixe-o muted).
 */
import React from "react";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";

export type SoundMixProps = {
  voiceSrc?: string | null;
  voiceVolume?: number;
  voiceTrimBeforeSec?: number;
  bedSrc?: string | null;
  bedVolume?: number;
  bedOffsetSec?: number;
};

export const SoundMix: React.FC<SoundMixProps> = ({
  voiceSrc = "exemplo/criativo.mp4",
  voiceVolume = 0.668,
  voiceTrimBeforeSec = 0,
  bedSrc = "exemplo/audio/bed.wav",
  bedVolume = 1.0,
  bedOffsetSec = 0,
}) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {voiceSrc ? (
        <Audio
          src={staticFile(voiceSrc)}
          volume={voiceVolume}
          trimBefore={voiceTrimBeforeSec > 0 ? Math.round(voiceTrimBeforeSec * fps) : undefined}
        />
      ) : null}
      {bedSrc ? (
        <Sequence from={Math.round(bedOffsetSec * fps)} layout="none" name="bed">
          <Audio src={staticFile(bedSrc)} volume={bedVolume} />
        </Sequence>
      ) : null}
    </>
  );
};
