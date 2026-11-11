import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../theme";
import { BackdropInk, EditorialCard, type CardShape } from "./EditorialBackdrop";
import { PersonCutout, type PersonLook } from "./PersonCutout";
import { PresenterCamera } from "./PresenterCamera";
import { matteIndexAt, pad4, type MatteInfo, type Punch } from "./util";

/**
 * <Presenter> — cena da apresentadora montada (camada de BASE, opaca). De tras para a frente:
 *   BackdropInk -> EditorialCard -> behind (children: texto/selos ATRAS da pessoa) -> PersonCutout -> front
 *   tudo dentro de uma camera interna (socos de fala `punches`, so escala); `overlay` fica fora da camera.
 * Oclusao REAL: o que vai em `children`/`behind` e recortado pelo alfa da pessoa (cabelo/rosto passam na frente).
 * Para push lento + socos com rotacao, envolva o <Presenter> num <PresenterCamera push punches> por fora.
 * `plateDir` + `plateSec`: mostra o plate limpo em tela cheia nesse intervalo (ex.: volta a tela cheia no CTA).
 */

export type PresenterProps = {
  matte: MatteInfo;
  matteDir: string;
  /** pasta do plate limpo (p0001.jpg..) — so usada com plateSec */
  plateDir?: string;
  /** intervalo [a,b] (s) com o plate em tela cheia por cima do cenario (cross-fade de 0.2 s) */
  plateSec?: [number, number] | null;
  fromSec: number;
  toSec: number;
  /** ate aqui o recorte respira congelado no 1o quadro nitido. Default: tempo do sharpFrom */
  liveSec?: number;
  /** tempo de composicao - tempo do arquivo (0 se a composicao usa o relogio do arquivo) */
  fileOffsetSec?: number;
  /** entrada da pessoa (s). Default fromSec + 0.28 */
  personInSec?: number;
  /** cartao: entrada [a,b] (s) e forma; false = sem cartao */
  cardInSec?: [number, number];
  card?: Partial<CardShape> | false;
  /** socos de fala da camera interna (so escala) + pulso da luz do fundo */
  punches?: readonly Punch[];
  /** a fonte escurece no fim? cenario e cartao acompanham: [a,b] s (null = nao) */
  darkenSec?: [number, number] | null;
  /** aparencia da pessoa (borda, rim, exposicao, sombra...). Ver PERSON_LOOK_DEFAULT */
  person?: Partial<PersonLook>;
  /** cor do fundo (atras de tudo). Default brand ink */
  background?: string;
  /** camadas ATRAS da pessoa (oclusao real). `children` tambem vai aqui */
  behind?: React.ReactNode;
  children?: React.ReactNode;
  /** camadas na FRENTE da pessoa, dentro da camera */
  front?: React.ReactNode;
  /** camadas fora da camera (legenda, flash) */
  overlay?: React.ReactNode;
};

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** plate limpo em tela cheia (cover), sincronizado pelo tempo do arquivo */
export const PlateFrame: React.FC<{ matte: MatteInfo; plateDir: string; fileOffsetSec?: number; opacity?: number }> = ({
  matte,
  plateDir,
  fileOffsetSec = 0,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const i = matteIndexAt(t - fileOffsetSec, { ...matte, sharpFrom: 1 });
  const s = Math.max(width / matte.w, height / matte.h);
  return (
    <Img
      src={staticFile(`${plateDir}/p${pad4(i)}.jpg`)}
      style={{
        position: "absolute",
        left: (width - matte.w * s) / 2,
        top: (height - matte.h * s) / 2,
        width: matte.w * s,
        height: matte.h * s,
        opacity,
      }}
    />
  );
};

export const Presenter: React.FC<PresenterProps> = ({
  matte,
  matteDir,
  plateDir,
  plateSec = null,
  fromSec,
  toSec,
  liveSec,
  fileOffsetSec = 0,
  personInSec,
  cardInSec,
  card,
  punches = [],
  darkenSec = null,
  person,
  background,
  behind,
  children,
  front,
  overlay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBrand().colors;
  const t = frame / fps;
  if (t < fromSec - 0.02 || t > toSec + 0.06) return null;
  const t0 = fromSec + 0.2; // inicio da deriva de camera (paralaxe)
  const cIn = cardInSec ?? [fromSec + 0.18, fromSec + 0.62];
  const plateOp = plateSec && plateDir ? interpolate(t, [plateSec[0], plateSec[0] + 0.2, plateSec[1] - 0.2, plateSec[1]], [0, 1, 1, 0], cl) : 0;
  const cardDark: [number, number] | null = darkenSec ? [darkenSec[0] - 0.2, darkenSec[1]] : null;
  return (
    <AbsoluteFill style={{ backgroundColor: background ?? b.ink, overflow: "hidden" }}>
      <PresenterCamera punches={punches} attack={0.05} lead={0.02} decay={7} drift={0}>
        <BackdropInk fromSec={fromSec} punches={punches} darkenSec={darkenSec} driftT0Sec={t0} />
        {card === false ? null : <EditorialCard inSec={cIn} shape={card || undefined} darkenSec={cardDark} driftT0Sec={t0} />}
        {behind}
        {children}
        <PersonCutout
          matte={matte}
          matteDir={matteDir}
          fromSec={fromSec}
          toSec={toSec}
          liveSec={liveSec}
          inSec={personInSec}
          fileOffsetSec={fileOffsetSec}
          driftT0Sec={t0}
          look={person}
        />
        {front}
      </PresenterCamera>
      {plateOp > 0.001 && plateDir ? <PlateFrame matte={matte} plateDir={plateDir} fileOffsetSec={fileOffsetSec} opacity={plateOp} /> : null}
      {overlay}
    </AbsoluteFill>
  );
};
