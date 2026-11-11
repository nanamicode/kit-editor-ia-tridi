import { Easing, interpolate } from "remotion";

/**
 * Linha do tempo (segundos de composicao = segundos do arquivo) da transicao-estrela.
 * Tudo aqui e funcao pura do frame. Nenhum estado, nenhum useFrame.
 */
export const FPS = 30;

export const TL = {
  // o clipe 6 (cartao) roda LIVRE de 6.833 ate 7.30: o selo so entra depois, e o relevo do cartao (7.467)
  // aparece antes de o selo pousar (7.50)
  windowFrom: 7.25,
  windowTo: 8.15,
  /** o selo entra e cai (queda curta de 6 quadros, como uma batida de carimbo) */
  fall0: 7.3,
  /** IMPACTO: carimbo toca a tela (logo apos o 'relevo' do cartao, cue 7.48) */
  impact: 7.5,
  /** camera mergulha no selo */
  dive0: 7.56,
  /** a partir daqui o selo cobre 100% do quadro (opaco) */
  dive1: 7.71,
  /** setores comecam a abrir (rachaduras + luz) */
  open0: 7.821,
  /** setores fora de quadro, apresentadora livre */
  open1: 8.06,
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (
  t: number,
  a: number,
  b: number,
  from: number,
  to: number,
  easing?: (n: number) => number,
) =>
  interpolate(t, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

// mergulho acelera ate o fim (soco para dentro do selo): a cobertura total so comeca ~2 quadros antes da rachadura
const EASE_DIVE = Easing.in(Easing.poly(2.5));
// abre devagar no 1o quadro e acelera: ~3 quadros legiveis de estilhacos antes de sairem do quadro
const EASE_OPEN = Easing.inOut(Easing.quad);

export type SealState = {
  t: number;
  /** segundos desde o impacto (0 antes) */
  dt: number;
  seal: {
    pos: [number, number, number];
    /** escala uniforme (selo em repouso um pouco menor e mais alto: nao cobre o rotulo do B-roll) */
    scale: number;
    rot: [number, number, number];
    squash: number;
    split: number;
    heat: number;
    envRot: number;
  };
  cam: { pos: [number, number, number]; fov: number; roll: number };
  /** altura do selo acima da superficie (para sombra de contato) */
  height: number;
  dim: number;
  /** 0..1: opacidade da sombra de contato (some quando o selo cobre o quadro) */
  shadow: number;
  /** clarao aditivo de 2 quadros no impacto, 0..1 */
  flash: number;
  /** clarao aditivo de 2-3 quadros na rachadura, 0..1 */
  flashOpen: number;
  rays: number;
  /** 0..1: rachaduras desenhadas no ouro cheio, antes de as fatias abrirem */
  crack: number;
  dive: number;
  /** luz de brilho que varre o metal (reflexo de folha de ouro) */
  sweep: { x: number; y: number; z: number; intensity: number };
};

export function sealState(frame: number): SealState {
  const t = frame / FPS;
  const p = clamp((t - TL.fall0) / (TL.impact - TL.fall0));
  const dt = Math.max(0, t - TL.impact);
  const landed = t >= TL.impact;

  // queda: o selo entra pela direita ja com a FACE para a camera (inclinacao maxima ~28 graus)
  // e desce em arco ate o ponto do carimbo; nunca mostra o verso nem fica de lado.
  const sweep = Easing.out(Easing.cubic)(clamp(p / 0.72));
  const q = Math.pow(p, 2.0);
  const fx = 2.6 * (1 - sweep);
  const fy = 0.5 * Math.pow(1 - p, 2);
  const fz = 2.4 * (1 - q);
  const rx = 0.3 * Math.pow(1 - p, 1.5);
  const ry = -0.46 * Math.pow(1 - p, 1.3);
  const rz = -0.28 * (1 - p);

  // impacto: amassa, estica no rebote, assenta
  const sq = landed ? Math.exp(-dt * 10) * Math.cos(dt * 24) : 0;
  const bounceZ = landed ? 0.09 * Math.max(0, -sq) : 0;
  // balanco de assentamento (faz os reflexos varrerem a face enquanto le o selo)
  const settle = Math.exp(-dt * 1.1);
  const wobX = landed ? 0.1 * Math.sin(dt * 8.5) * settle : 0;
  const wobY = landed ? 0.2 * Math.sin(dt * 7.4 + 0.8) * settle : 0;

  // mergulho
  const d = ramp(t, TL.dive0, TL.dive1, 0, 1, EASE_DIVE);
  const o = ramp(t, TL.open0, TL.open1, 0, 1, EASE_OPEN);
  // a camera recua rapido logo que o selo racha, para os setores ficarem legiveis girando para fora
  const oc = ramp(t, TL.open0 - 0.005, TL.open0 + 0.1, 0, 1, Easing.out(Easing.cubic));

  // em repouso o selo fica ~15% menor e 0.2 un. acima do centro, para nao cobrir o rotulo do B-roll;
  // no mergulho ele volta ao centro e a escala cheia
  const rest = 1 - d;
  const sealScale = 0.64 + 0.36 * d;
  const pos: [number, number, number] = [
    (landed ? 0 : fx) + 0.12 * rest,
    (landed ? 0 : fy) + 0.62 * rest,
    landed ? bounceZ : fz,
  ];
  const rot: [number, number, number] = [
    (landed ? wobX : rx) + 0.22 * Math.sin(t * 11 + 0.6) * d * (1 - o),
    (landed ? wobY : ry) + 0.3 * Math.cos(t * 9) * d * (1 - o),
    (landed ? 0 : rz) + d * 0.4 + o * 0.5,
  ];

  // camera: shake no impacto, dolly + fov no mergulho, continua empurrando na abertura
  const A = landed ? 0.075 * Math.exp(-dt * 9) : 0;
  const shakeX = A * Math.sin(dt * 83 + 1.3);
  const shakeY = A * Math.cos(dt * 71);
  const hold = ramp(t, TL.dive1, TL.open0, 0, 1);
  // mergulho termina com o selo cobrindo o quadro mas com RELEVO legivel (aneis, perolas, sunburst, estrela)
  const camZ = 9.4 + (2.65 - 9.4) * d - 0.3 * hold + 1.1 * oc;
  const fov = 30 + 2 * d;
  const roll = (landed ? 0.012 * (A / 0.075) * Math.sin(dt * 60) : 0) + d * 0.05 - o * 0.03;

  const heatImpact = landed ? Math.exp(-dt * 7) * 0.8 : 0;
  const heatOpen = ramp(t, TL.open0 - 0.03, TL.open0 + 0.03, 0, 0.5) * (1 - ramp(t, TL.open0 + 0.03, TL.open1, 0, 1));
  // ouro cheio (3-4 quadros): o brilho oscila em vez de ficar chapado, escondendo a emenda de cena
  const holdShimmer = ramp(t, TL.dive1 - 0.02, TL.dive1 + 0.01, 0, 1) * (1 - o) * (0.1 + 0.1 * Math.sin(t * 150));

  return {
    t,
    dt,
    seal: {
      pos,
      scale: sealScale,
      rot,
      squash: sq,
      split: o,
      heat: Math.max(heatImpact, heatOpen, holdShimmer),
      envRot: 0,
    },
    cam: { pos: [shakeX, shakeY, camZ], fov, roll },
    height: landed ? 0 : Math.max(0, fz),
    shadow: 1 - ramp(t, TL.dive0, TL.dive0 + 0.08, 0, 1),
    dim:
      ramp(t, TL.fall0, TL.impact, 0, 0.3) *
      (1 - ramp(t, TL.dive1, TL.dive1 + 0.02, 0, 1)),
    // clarao aditivo (blend screen), 2 quadros: 1.0 no quadro do impacto, ~0.35 no seguinte, 0 no terceiro
    flash: t >= TL.impact - 0.005 ? Math.pow(Math.max(0, 1 - (t - (TL.impact - 0.005)) / (2 / FPS)), 1.5) : 0,
    flashOpen: t >= TL.open0 - 0.01 ? Math.pow(Math.max(0, 1 - (t - (TL.open0 - 0.01)) / (2.5 / FPS)), 1.5) : 0,
    rays: ramp(t, TL.open0, TL.open0 + 0.012, 0, 1) * (1 - ramp(t, TL.open0 + 0.02, TL.open0 + 0.07, 0, 1)),
    crack: ramp(t, TL.open0 - 0.07, TL.open0 - 0.01, 0, 1) * (1 - ramp(t, TL.open0, TL.open0 + 0.02, 0, 1)),
    dive: d,
    sweep: (() => {
      // dois brilhos de folha de ouro: no "relevo" (7.48) e no impacto grave (7.82)
      const pass = (a: number, b: number) => ramp(t, a, b, 0, 1, Easing.inOut(Easing.quad));
      const pA = pass(7.5, 7.66);
      const pB = pass(7.72, 7.9);
      const inA = t >= 7.5 && t <= 7.66;
      const inB = t >= 7.72 && t <= 7.9;
      const prog = inB ? 1 - pB : pA;
      const env = inA || inB ? Math.sin(Math.PI * clamp(inB ? pB : pA)) : 0;
      return { x: -2.4 + 4.8 * prog, y: 1.1 - 2.0 * prog, z: 1.9, intensity: (inB ? 1.8 : 2.4) * env };
    })(),
  };
}
