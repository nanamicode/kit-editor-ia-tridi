/**
 * MODULO B-ROLL (cortes dinamicos) — API publica.
 *
 * <BRollSequence clips={BRollClip[]} src="exemplo/criativo.mp4" srcFps={24000/1001} />
 *  - cada clipe: fromSec/toSec (arquivo-fonte), mode full|card|strip, title, support,
 *    pressSec (clique do carimbo -> punch-in, tremor, anel), camera/ramp opcionais (defaults
 *    automaticos a partir de pressSec), transitionIn whip|flash|iris|glitch|wipe|cut.
 *  - rotulos: padrao = esquerda, ancorado pela base (mesma posicao no video todo).
 * Metodos: metodos/03-rotulos-hud.md, 04-cortes-dinamicos.md, 05-transicoes.md.
 * Armadilhas: nao envolver em <Sequence from> (use startSec); nenhum ancestral com
 * transform/opacity/filter se um overlay irmao precisa ficar abaixo do rotulo "top".
 */
export { BRollSequence, brollEndSec, type BRollSequenceProps } from "./BRollSequence";
export { KineticLabel, type KineticLabelProps } from "./Label";
export { Hud, type HudProps } from "./Hud";
export { Backdrop, Grain } from "./Backdrop";
export { planClips, TRANSITION_ROLL, DEFAULT_TRANSITIONS } from "./plan";
export type {
  BRollClip,
  BRollLabel,
  BRollMode,
  CamKey,
  RampPoint,
  TransitionKind,
} from "./types";
