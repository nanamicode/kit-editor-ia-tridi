/**
 * Modulo de AUDIO do kit.
 *  - <SoundMix voiceSrc voiceVolume bedSrc bedVolume />  voz original + bed sintetizado (@remotion/media)
 *  - parseCues / cueTimes / cueInfo / useCuePulse / lastCue / nextCue / secSinceCue / isSpeaking / gridTime
 *    para sincronizar animacoes aos SFX (punch-in no "relevo", flash no "corte", pop no "ui"...)
 *  - CUES_EXEMPLO: cues resolvidos do V02 (criativo de carimbos)
 * Gerar bed + cues: scripts/audio_trilha_sfx.py (ver metodos/12-audio-sfx.md).
 */
export { SoundMix, type SoundMixProps } from "./SoundMix";
export {
  parseCues,
  cueInfo,
  cueTimes,
  lastCue,
  nextCue,
  secSinceCue,
  gridTime,
  useTimeSec,
  useCuePulse,
  isSpeaking,
  type Cue,
  type CueTipo,
  type CueInfo,
  type RawCue,
} from "./cues";
export { CUES as CUES_EXEMPLO } from "./cues.exemplo";
