import { FPS } from "./theme";

/**
 * Linha do tempo do B-roll. Tempo de composicao = tempo de arquivo para os CORTES
 * (medidos), mas dentro de cada clipe o tempo de origem e remapeado (speed-ramp):
 * aproximacao rapida -> antecipacao lenta -> slow-mo no impacto -> acelera -> hold.
 *
 * Impactos (pressao = pico de forca; relevo = relevo aparece) seguem cues.json (AUDIO).
 */

export const SRC_FPS = 24000 / 1001;
const q = (s: number) => Math.round(s * FPS) / FPS;

export type PlaySeg = {
  kind: "play";
  start: number;
  frames: number;
  src0: number;
  src1: number;
  rate: number;
  blend: boolean;
};
export type HoldSeg = {
  kind: "hold";
  start: number;
  frames: number;
  src: number;
};
export type Seg = PlaySeg | HoldSeg;

export type Mode = "full" | "card" | "strip";

/** Posicao do rotulo (varia por clipe: lado, topo/base, vertical em um deles). */
export type LabelPos = {
  side: "left" | "right";
  /** y = TOPO do bloco (anchor "top") ou BASE do bloco (anchor "bottom"), em px de tela */
  anchor: "top" | "bottom";
  y: number;
  /** rotulo principal girado -90 graus (le de baixo p/ cima); a linha de apoio segue horizontal */
  vertical?: { x: number; yBottom: number };
  /** o rotulo e desenhado na camada de topo do BRoll (acima do overlay Seal3D) */
  top?: boolean;
};

export type ClipDef = {
  n: number;
  mode: Mode;
  /** primeiro quadro em que a camada existe (pre-roll da transicao) */
  enter: number;
  /** quadro do corte medido */
  cut: number;
  /** primeiro quadro em que a camada ja nao existe */
  exit: number;
  /** quadro do pico de forca (cues.json: impacto "pressao") */
  P: number;
  /** quadro em que o relevo aparece (cues.json: impacto "relevo") */
  R: number;
  holdStart: number;
  segs: Seg[];
  cam: { keys: number[]; u: number[]; v: number[]; z: number[] };
  /** posicao do carimbo (u,v em coordenadas do quadro de origem) */
  stamp: readonly [number, number];
  /** caixa do relevo no quadro de origem */
  emb: { u: number; v: number; w: number; h: number; rot: number };
  label: { lines: string[]; size: number };
  support: string;
  /** quadro em que o rotulo comeca a sair */
  labelOut: number;
  /** quadro em que o rotulo comeca a entrar */
  labelIn: number;
  labelPos: LabelPos;
};

type Wp = readonly [frame: number, src: number];

const build = (
  enter: number,
  waypoints: Wp[],
  holdSrc: number,
  exit: number,
): { segs: Seg[]; holdStart: number } => {
  const segs: Seg[] = [];
  const [f0, s0] = waypoints[0];
  if (enter < f0) {
    segs.push({ kind: "hold", start: enter, frames: f0 - enter, src: q(s0) });
  }
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [fa, sa] = waypoints[i];
    const [fb, sb] = waypoints[i + 1];
    const a = q(sa);
    const b = q(sb);
    const frames = fb - fa;
    const rate = ((b - a) * FPS) / frames;
    segs.push({
      kind: "play",
      start: fa,
      frames,
      src0: a,
      src1: b,
      rate,
      // sem dupla exposicao: blend so em camera lenta extrema (nao ha trecho assim hoje)
      blend: rate < 0.3,
    });
  }
  const [fl, sl] = waypoints[waypoints.length - 1];
  void sl;
  segs.push({ kind: "hold", start: fl, frames: exit - fl, src: q(holdSrc) });
  return { segs, holdStart: fl };
};

const mkCam = (
  keys: number[],
  pts: ReadonlyArray<readonly [number, number, number]>,
) => ({
  keys,
  u: pts.map((p) => p[0]),
  v: pts.map((p) => p[1]),
  z: pts.map((p) => p[2]),
});

// ---- clipe 1: envelope azul (tela cheia) ------------------------------------
const c1 = build(
  0,
  [
    [0, 0.1],
    [7, 0.41],
    [11, 0.47],
    [18, 0.6],
    [22, 0.7],
    [28, 1.18],
  ],
  1.18,
  44,
);
// ---- clipe 2: adesivo (cartao) ----------------------------------------------
const c2 = build(
  35,
  [
    [39, 1.34],
    [42, 1.54],
    [46, 1.6],
    [53, 1.77],
    [57, 1.9],
    [69, 2.7],
  ],
  2.7,
  87,
);
// ---- clipe 3: guardanapo (tela cheia) -----------------------------------------
const c3 = build(
  85,
  [
    [85, 2.9],
    [93, 3.22],
    [97, 3.28],
    [104, 3.4],
    [108, 3.52],
    [117, 4.12],
  ],
  4.12,
  134,
);
// ---- clipe 4: selos dourados (cartao) -----------------------------------------
const c4 = build(
  122,
  [
    [126, 4.3],
    [131, 4.64],
    [135, 4.7],
    [142, 4.78],
    [146, 4.9],
    [155, 5.4],
  ],
  5.4,
  169,
);
// ---- clipe 5: envelope verde-agua (tela cheia) --------------------------------
const c5 = build(
  168,
  [
    [168, 5.64],
    [174, 5.99],
    [178, 6.05],
    [185, 6.15],
    [189, 6.27],
    [196, 6.78],
  ],
  6.78,
  212,
);
// ---- clipe 6: cartao branco (cartao) ------------------------------------------
const c6 = build(
  201,
  [
    [205, 6.9],
    [213, 7.34],
    [217, 7.4],
    [224, 7.48],
    [226, 7.54],
  ],
  7.54,
  234,
);

export const CLIPS: ClipDef[] = [
  {
    n: 1,
    mode: "full",
    enter: 0,
    cut: 0,
    exit: 44,
    P: 11,
    R: 18,
    ...c1,
    cam: mkCam(
      [0, 7, 11, 21, 28, 44],
      [
        [0.52, 0.5, 1.0],
        [0.5, 0.45, 1.1],
        [0.49, 0.43, 1.24],
        [0.46, 0.45, 1.15],
        [0.42, 0.46, 1.12],
        [0.41, 0.46, 1.2],
      ],
    ),
    stamp: [0.49, 0.42],
    emb: { u: 0.4, v: 0.46, w: 0.34, h: 0.13, rot: 0 },
    label: { lines: ["SEU LOGO", "EM RELEVO"], size: 132 },
    support: "RELEVO SECO NO ENVELOPE",
    labelOut: 32,
    // ja entra pronto no quadro 0 (o gancho precisa de rotulo desde o primeiro frame)
    labelIn: -8,
    labelPos: { side: "left", anchor: "bottom", y: 1500 },
  },
  {
    n: 2,
    mode: "card",
    enter: 35,
    cut: 39,
    exit: 87,
    P: 46,
    R: 53,
    ...c2,
    cam: mkCam(
      [39, 42, 46, 56, 69, 87],
      [
        [0.5, 0.55, 1.0],
        [0.49, 0.57, 1.15],
        [0.48, 0.58, 1.36],
        [0.45, 0.58, 1.3],
        [0.42, 0.59, 1.36],
        [0.41, 0.59, 1.46],
      ],
    ),
    stamp: [0.48, 0.58],
    emb: { u: 0.375, v: 0.62, w: 0.3, h: 0.17, rot: 0 },
    label: { lines: ["ADESIVOS"], size: 156 },
    support: "RELEVO NO PAPEL ADESIVO",
    labelOut: 79,
    labelIn: 42,
    labelPos: { side: "left", anchor: "bottom", y: 1585 },
  },
  {
    n: 3,
    mode: "strip",
    enter: 85,
    cut: 85,
    exit: 134,
    P: 97,
    R: 104,
    ...c3,
    cam: mkCam(
      [85, 93, 97, 107, 117, 134],
      [
        [0.5, 0.5, 1.0],
        [0.46, 0.52, 1.12],
        [0.43, 0.53, 1.36],
        [0.41, 0.5, 1.3],
        [0.385, 0.47, 1.3],
        [0.385, 0.47, 1.42],
      ],
    ),
    stamp: [0.42, 0.55],
    emb: { u: 0.385, v: 0.47, w: 0.3, h: 0.25, rot: 0 },
    label: { lines: ["GUARDANAPOS"], size: 150 },
    support: "ATÉ NO PAPEL MACIO",
    // fica ate o corte (126): a saida acaba junto da abertura da proxima transicao
    labelOut: 122,
    labelIn: 88,
    labelPos: { side: "left", anchor: "bottom", y: 1585 },
  },
  {
    n: 4,
    mode: "card",
    enter: 122,
    cut: 126,
    exit: 169,
    P: 135,
    R: 142,
    ...c4,
    cam: mkCam(
      [126, 131, 135, 145, 155, 169],
      [
        [0.45, 0.45, 1.0],
        [0.43, 0.44, 1.2],
        [0.42, 0.43, 1.42],
        [0.4, 0.42, 1.36],
        [0.38, 0.41, 1.3],
        [0.37, 0.4, 1.4],
      ],
    ),
    stamp: [0.42, 0.43],
    emb: { u: 0.37, v: 0.396, w: 0.4, h: 0.4, rot: 0 },
    label: { lines: ["SELOS DOURADOS"], size: 126 },
    support: "DETALHE FINO NO DOURADO",
    labelOut: 160,
    labelIn: 129,
    labelPos: { side: "left", anchor: "bottom", y: 1585 },
  },
  {
    n: 5,
    mode: "full",
    enter: 168,
    cut: 168,
    exit: 212,
    P: 178,
    R: 185,
    ...c5,
    cam: mkCam(
      [168, 174, 178, 188, 196, 212],
      [
        [0.46, 0.5, 1.0],
        [0.45, 0.49, 1.08],
        [0.45, 0.5, 1.22],
        [0.42, 0.47, 1.15],
        [0.37, 0.43, 1.12],
        [0.36, 0.42, 1.2],
      ],
    ),
    stamp: [0.45, 0.5],
    emb: { u: 0.36, v: 0.41, w: 0.3, h: 0.32, rot: 0 },
    label: { lines: ["ENVELOPES"], size: 176 },
    support: "CADA TRAÇO MARCADO",
    labelOut: 197,
    labelIn: 171,
    labelPos: { side: "right", anchor: "bottom", y: 1500 },
  },
  {
    n: 6,
    mode: "strip",
    enter: 201,
    cut: 205,
    exit: 234,
    P: 217,
    R: 224,
    ...c6,
    cam: mkCam(
      [205, 213, 217, 222, 226, 234],
      [
        [0.5, 0.55, 1.0],
        [0.5, 0.57, 1.2],
        [0.5, 0.58, 1.4],
        [0.42, 0.56, 1.45],
        [0.38, 0.54, 1.5],
        [0.36, 0.535, 1.6],
      ],
    ),
    stamp: [0.5, 0.58],
    emb: { u: 0.34, v: 0.535, w: 0.3, h: 0.26, rot: -28 },
    label: { lines: ["CARTÕES"], size: 132 },
    support: "RELEVO NO CARTÃO BRANCO",
    // marfim pleno de 205 a ~230: desenhado na camada de topo (acima do dim/flash do Seal3D)
    labelOut: 227,
    labelIn: 203, // 6.77 s
    labelPos: { side: "left", anchor: "bottom", y: 1585, top: true },
  },
];

export const CUT_FRAMES = [0, 39, 85, 126, 168, 205];
export const END_FRAME = 234; // 7.8 s

type Ease = (t: number) => number;

/** interpolacao por partes com easing por trecho */
export const piece = (
  frame: number,
  keys: number[],
  vals: number[],
  easing: Ease | Ease[],
) => {
  if (frame <= keys[0]) return vals[0];
  const last = keys.length - 1;
  if (frame >= keys[last]) return vals[last];
  for (let i = 0; i < last; i++) {
    if (frame < keys[i + 1]) {
      const t = (frame - keys[i]) / (keys[i + 1] - keys[i]);
      const e = Array.isArray(easing) ? easing[i] : easing;
      return vals[i] + (vals[i + 1] - vals[i]) * e(t);
    }
  }
  return vals[last];
};
