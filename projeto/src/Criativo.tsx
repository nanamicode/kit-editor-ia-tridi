import React from "react";
import { AbsoluteFill, Easing, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { BRoll } from "./scenes/BRoll";
import { Presenter } from "./scenes/Presenter";
import { Seal3D } from "./scenes/Seal3D";

/**
 * CRIATIVO — composicao final 1080x1920, 30 fps, 363 frames (12.1 s).
 * Cada cena le o tempo de composicao (frame 0 = 0 s) e se auto-limita a sua janela,
 * entao NAO ha Sequence com offset aqui.
 *
 * Camadas, de tras para a frente:
 *  1. PresenterCam > Presenter (7.6-12.07 s, opaca; ja inclui as legendas palavra a palavra).
 *     PresenterCam e a "camera" do integrador: push lento durante a fala, socos nos cortes de
 *     frase ("ne?" 9.42 s, "Clique" 9.68 s) e volta a escala 1.0 antes do CTA (botao inteiro na tela).
 *  2. TopKicker (8.55-9.8 s): faixa no topo, que ficava vazio, retomando o tema da abertura
 *     ("SEU LOGO EM RELEVO"); sai antes do botao do CTA, que entra a partir de ~10.0 s.
 *  3. BRoll (0-7.8 s, opaco) cobre o Presenter ate acabar em 7.8 s
 *  4. Seal3D (7.25-8.15 s, overlay transparente): o selo cobre 100% do quadro em ~7.70-7.83,
 *     entao o B-roll some e o Presenter aparece por baixo sem emenda; depois o selo racha.
 *
 * NENHUM ancestral de BRoll cria stacking context (opacity/transform/filter/isolation):
 * o rotulo do clipe 6 depende disso para ficar acima do overlay do selo (z-index 40).
 * Por isso a camera so envolve o Presenter, e BRoll/Seal3D sao irmaos diretos.
 *
 * Audio:
 *  - faixa original de criativo.mp4 (voz + cliques reais dos carimbos) a 0.668
 *    (o original passa de 0 dBTP; -3.5 dB mantem o mix sem clipar)
 *  - bed.wav (trilha + SFX sintetizados, ducking ja embutido) a 1.0
 */

export const FPS = 30;
export const DURATION = 363;

export const VOICE_VOLUME = 0.668;
export const BED_VOLUME = 1.0;

const INK = "#120A24";
const GOLD = "#F5C542";
const GOLD_LIGHT = "#FFD86B";
const IVORY = "#FFF8E7";
const VIOLET = "#B794FF";

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const outExpo = Easing.bezier(0.22, 1, 0.36, 1);
const inOutSine = Easing.inOut(Easing.sin);

/* ---------------------------------------------------------------- camera ---- */

/** Socos de camera nos cortes de frase (s de composicao). rot em graus. */
const CAM_PUSHES = [
  { t: 9.42, a: 0.03, rot: -0.55 }, // "ne?"
  { t: 9.68, a: 0.034, rot: 0.6 }, // "Clique"
] as const;

/** escala base: push lento 1.00->1.05 ate 10.45 s e retorno a 1.00 ate 11.1 s (CTA inteiro na tela). */
const camDrive = (t: number) => {
  const up = inOutSine(clamp01((t - 8.15) / 2.3));
  const down = inOutSine(clamp01((t - 10.45) / 0.65));
  return 0.05 * up * (1 - down);
};

const camPush = (t: number, p: (typeof CAM_PUSHES)[number]) => {
  const rise = clamp01((t - (p.t - 0.03)) / 0.06);
  return rise * Math.exp(-Math.max(0, t - p.t) * 8);
};

const PresenterCam: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let extra = 0;
  let rot = 0;
  for (const p of CAM_PUSHES) {
    const k = camPush(t, p);
    extra += p.a * k;
    rot += p.rot * k;
  }
  const s = 1 + camDrive(t) + extra;
  const k = s - 1;
  // paralaxe suave: desloca so quando ha escala sobrando (nunca mostra a borda)
  const tx = k * 260 * Math.sin((t - 8.15) * 1.1);
  const ty = -k * 110;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "50% 58%",
        transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${s.toFixed(5)})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- kicker ---- */

const K = { in: 8.55, out: 9.8, y: 244, h: 108 };

/** Linha de texto com revelacao por mascara (sobe de baixo) — entra em `from`, sai em `to`. */
const MaskLine: React.FC<{
  t: number;
  from: number;
  to: number;
  children: React.ReactNode;
  top: number;
  height: number;
}> = ({ t, from, to, children, top, height }) => {
  const inP = outExpo(clamp01((t - from) / 0.36));
  const outP = Easing.in(Easing.cubic)(clamp01((t - to) / 0.2));
  if (t < from - 0.01 || t > to + 0.25) return null;
  const y = (1 - inP) * 120 - outP * 120;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, height, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${y.toFixed(1)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const TopKicker: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < K.in - 0.02 || t > K.out + 0.3) return null;

  const rule = outExpo(clamp01((t - K.in) / 0.5));
  const ruleOut = Easing.in(Easing.cubic)(clamp01((t - K.out) / 0.22));
  const x0 = 80;
  const x1 = 1000;
  const cx = (x0 + x1) / 2;
  const half = ((x1 - x0) / 2) * rule * (1 - ruleOut);
  // tick que percorre a regua e marca o avanco da frase
  const tickP = clamp01((t - K.in) / (K.out - K.in));
  const tickX = x0 + (x1 - x0) * tickP;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* regua dourada desenhada do centro para as pontas */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={cx - half} x2={cx + half} y1={K.y - 14} y2={K.y - 14} stroke={GOLD} strokeWidth={4} />
        <line x1={cx - half} x2={cx + half} y1={K.y + K.h + 18} y2={K.y + K.h + 18} stroke={VIOLET} strokeWidth={2} opacity={0.7} />
        {rule > 0.6 && ruleOut < 0.4 ? (
          <rect x={tickX - 3} y={K.y + K.h + 8} width={6} height={20} fill={GOLD_LIGHT} />
        ) : null}
      </svg>

      <MaskLine t={t} from={K.in} to={K.out} top={K.y} height={K.h}>
        <div
          style={{
            fontFamily: anton.fontFamily,
            fontSize: 94,
            lineHeight: 1,
            letterSpacing: "0.01em",
            color: IVORY,
            whiteSpace: "nowrap",
            textShadow: `0 4px 0 ${INK}, 0 0 28px rgba(18,10,36,0.8)`,
          }}
        >
          SEU LOGO <span style={{ color: GOLD }}>EM RELEVO</span>
        </div>
      </MaskLine>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------------- root ----- */

export const Criativo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <PresenterCam>
        <Presenter />
      </PresenterCam>
      <TopKicker />
      <BRoll />
      <Seal3D />
      <Audio src={staticFile("criativo.mp4")} volume={VOICE_VOLUME} />
      <Audio src={staticFile("audio/bed.wav")} volume={BED_VOLUME} />
    </AbsoluteFill>
  );
};

export default Criativo;
