import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import {
  PersonCutout,
  Presenter,
  PresenterCamera,
  type CameraPush,
  type MatteInfo,
  type PersonLook,
  type PresenterProps,
  type Punch,
} from "../kit/apresentadora";
import { PalavraGigante } from "../kit/palavra-gigante";
import { useBrand } from "../kit/theme";
import { V02_GIGANTE } from "./PalavraGigante.root";

/**
 * Estande da APRESENTADORA com os dados do V02 (public/exemplo/matte = mattes aprovados).
 *  Apresentadora      : cena completa com os defaults SEGUROS do kit (rim sutil, borda macia, ganho <= 1.4)
 *                       + palavra gigante ATRAS da pessoa (oclusao real) + camera externa (push + socos)
 *  ApresentadoraV02   : mesma cena com o visual exato do V02 (rim forte, borda dura, ganho 1.5) para A/B
 *  RecorteClaro/Escuro: so o recorte sobre fundo claro / escuro (checklist de halo e fiapos)
 */

const n1 = (n: number) => Array.from({ length: n }, () => 1);
/** curva de exposicao do V02 (a fonte escurece de ~11.5 s ao fim); quadros 95..107 */
export const V02_MATTE: MatteInfo = {
  firstFileTime: 7.6,
  fps: 23.976,
  count: 107,
  w: 1080,
  h: 1080,
  sharpFrom: 26,
  exposure: {
    gain: [...n1(94), 1.001, 1.007, 1.019, 1.037, 1.06, 1.092, 1.132, 1.18, 1.241, 1.31, 1.382, 1.455, 1.5],
    gamma: [...n1(94), 0.999, 0.997, 0.992, 0.984, 0.974, 0.96, 0.942, 0.921, 0.894, 0.863, 0.832, 0.8, 0.78],
    sat: [...n1(94), 1.0, 1.001, 1.002, 1.003, 1.005, 1.007, 1.011, 1.014, 1.019, 1.025, 1.031, 1.036, 1.04],
  },
};

/** picos de fala (camera interna) */
export const V02_PUNCHES: Punch[] = [
  { t: 8.9, a: 0.022 },
  { t: 10.0, a: 0.016 },
  { t: 10.4, a: 0.03 },
  { t: 10.7, a: 0.02 },
  { t: 11.14, a: 0.026 },
];

/** camera externa: push 1.00->1.05 ate 10.45 s e volta a 1.00 ate 11.1 s; socos com rotacao nos cortes de frase */
export const V02_PUSH: CameraPush = { in0: 8.15, in1: 10.45, out0: 10.45, out1: 11.1, amount: 0.05 };
export const V02_CAM_PUNCHES: Punch[] = [
  { t: 9.42, a: 0.03, rot: -0.55 },
  { t: 9.68, a: 0.034, rot: 0.6 },
];

export const V02_APRESENTADORA: PresenterProps = {
  matte: V02_MATTE,
  matteDir: "exemplo/matte",
  plateDir: "exemplo/plate",
  fromSec: 7.6,
  toSec: 12.074,
  liveSec: 8.64,
  personInSec: 7.88,
  cardInSec: [7.78, 8.22],
  punches: V02_PUNCHES,
  darkenSec: [11.3, 12.07],
};

/** o visual exato do V02 (para comparar; os revisores apontaram "adesivo" com fio dourado) */
export const V02_LOOK_ORIGINAL: Partial<PersonLook> = {
  edge: { blur: 1.0, slope: 1.7, intercept: -0.32 },
  rim: { accent: 0.38, cool: 0.3, width: 1.5 },
  glow: 0.4,
  maxGain: 1.5,
  grain: 0.1,
};

type DevProps = PresenterProps & { camera?: boolean };

const Dev: React.FC<DevProps> = ({ camera = true, ...p }) => {
  const scene = (
    <Presenter {...p}>
      <PalavraGigante {...V02_GIGANTE} />
    </Presenter>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      {camera ? (
        <PresenterCamera push={V02_PUSH} punches={V02_CAM_PUNCHES}>
          {scene}
        </PresenterCamera>
      ) : (
        scene
      )}
    </AbsoluteFill>
  );
};

const Fundo: React.FC<{ claro: boolean }> = ({ claro }) => {
  const b = useBrand().colors;
  return (
    <AbsoluteFill style={{ backgroundColor: claro ? b.text : b.ink }}>
      <PersonCutout matte={V02_MATTE} matteDir="exemplo/matte" fromSec={7.6} toSec={12.074} liveSec={8.64} inSec={7.7} look={{ glow: 0, shadow: 0 }} />
    </AbsoluteFill>
  );
};

export const ApresentadoraRoot: React.FC = () => (
  <>
    <Composition id="Apresentadora" component={Dev} defaultProps={V02_APRESENTADORA} width={1080} height={1920} fps={30} durationInFrames={363} />
    <Composition
      id="ApresentadoraV02"
      component={Dev}
      defaultProps={{ ...V02_APRESENTADORA, person: V02_LOOK_ORIGINAL }}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={363}
    />
    <Composition id="RecorteClaro" component={Fundo} defaultProps={{ claro: true }} width={1080} height={1920} fps={30} durationInFrames={363} />
    <Composition id="RecorteEscuro" component={Fundo} defaultProps={{ claro: false }} width={1080} height={1920} fps={30} durationInFrames={363} />
  </>
);
