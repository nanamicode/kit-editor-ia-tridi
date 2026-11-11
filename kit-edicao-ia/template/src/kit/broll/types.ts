/**
 * Tipos publicos do modulo B-roll. Todos os tempos em SEGUNDOS.
 * - fromSec/toSec/pressSec/ramp[].src: tempo do ARQUIVO-FONTE.
 * - durSec, camera[].t, ramp[].t, label.inSec: tempo de COMPOSICAO relativo ao corte do clipe.
 */

export type BRollMode = "full" | "card" | "strip";

/** transicao que ENTRA no clipe (o corte do clipe anterior para este) */
export type TransitionKind = "cut" | "whip" | "flash" | "iris" | "glitch" | "wipe";

/** ponto da camera virtual. t = s desde o corte do clipe; u,v = 0..1 no quadro de origem; z = zoom (1 = enquadramento base) */
export type CamKey = { t: number; u: number; v: number; z: number };

/** speed-ramp: [t (s desde o corte, composicao), src (s no arquivo-fonte)]. Depois do ultimo ponto o quadro congela (hold). */
export type RampPoint = readonly [t: number, src: number];

export type BRollLabel = {
  /** lado do rotulo. Padrao aprovado: "left" (manter consistente no video todo) */
  side?: "left" | "right";
  /** BASE do bloco em px de tela (anchor bottom). Default: full 1500, card/strip 1585 */
  y?: number;
  /** entrada, s relativo ao corte do clipe. Default 0.1 (1o clipe: -0.267 = ja pronto no quadro 0) */
  inSec?: number;
  /** saida, s relativo ao PROXIMO corte (ou ao fim). Default -0.233 */
  outSec?: number;
  /** "top" = desenhado acima de tudo (zIndex 40), fora das transicoes. Default: "top" no ultimo clipe */
  layer?: "clip" | "top";
};

export type BRollClip = {
  /** inicio do trecho no arquivo-fonte (normalmente um corte do analise.json) */
  fromSec: number;
  /** fim do trecho no arquivo-fonte (o proximo corte) */
  toSec: number;
  /** duracao do clipe na composicao (corte a corte). Default: toSec - fromSec */
  durSec?: number;
  /** full = tela cheia; card = cartao inclinado com moldura; strip = faixa sangrada. Default "full" */
  mode?: BRollMode;
  /** titulo; "\n" quebra linha (maximo 2 linhas) */
  title: string;
  /** corpo do titulo em px. Default automatico pelo numero de letras (96..156) */
  titleSize?: number;
  /** linha de apoio (curta, <= 24 letras) */
  support?: string;
  /** instante da pressao do carimbo no ARQUIVO-FONTE (onset do clique). Liga punch-in, tremor e anel */
  pressSec?: number;
  /** ponto do carimbo (u,v 0..1 no quadro de origem). Default [0.5, 0.5] */
  focus?: readonly [number, number];
  /** caixa do resultado (relevo) no quadro de origem, para colchetes, vinheta e luz rasante. Default: em volta de focus */
  relief?: { u: number; v: number; w: number; h: number; rot?: number };
  /** speed-ramp explicito. Default: automatico a partir de pressSec */
  ramp?: RampPoint[];
  /** keyframes de camera explicitos. Default: automatico a partir de pressSec */
  camera?: CamKey[];
  /** transicao do corte anterior para este clipe. Default: whip, flash, iris, glitch, wipe em ciclo */
  transitionIn?: TransitionKind;
  label?: BRollLabel;
  /** inclinacao do cartao (graus, so mode card). Default alterna -2.2 / 1.9 */
  tilt?: number;
  /** forca da vinheta de foco 0..0.4 (fundo branco pede ~0.1). Default full/strip 0.3, card 0.2 */
  spot?: number;
};

export type PlaySeg = {
  kind: "play";
  start: number;
  frames: number;
  src0: number;
  src1: number;
  rate: number;
  blend: boolean;
};
export type HoldSeg = { kind: "hold"; start: number; frames: number; src: number };
export type Seg = PlaySeg | HoldSeg;

/** clipe resolvido em QUADROS absolutos de composicao (uso interno) */
export type ClipPlan = {
  i: number;
  mode: BRollMode;
  enter: number;
  cut: number;
  /** proximo corte (ou fim) */
  next: number;
  exit: number;
  P: number | null;
  R: number | null;
  holdStart: number;
  segs: Seg[];
  cam: { keys: number[]; u: number[]; v: number[]; z: number[] };
  focus: readonly [number, number];
  relief: { u: number; v: number; w: number; h: number; rot: number };
  hasRelief: boolean;
  lines: string[];
  titleSize: number;
  support: string;
  labelIn: number;
  labelOut: number;
  side: "left" | "right";
  labelY: number;
  labelTop: boolean;
  tilt: number;
  spot: number;
  /** transicao que entra neste clipe ("cut" no primeiro) */
  tIn: TransitionKind;
  last: boolean;
};

export type SrcInfo = {
  /** largura/altura de desenho do quadro de origem: largura sempre 1080 */
  dw: number;
  dh: number;
  srcFps: number;
};
