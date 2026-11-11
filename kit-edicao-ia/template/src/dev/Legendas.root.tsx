import React from "react";
import { AbsoluteFill, Composition, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useBrand } from "../kit/theme";
import { Legendas, type Enfase, type LegendasProps, type PaginaLegenda, type PalavraTempo } from "../kit/legendas";

/* ----------------------------------------------------- dados reais do V02 --
 * Tempos de FALA REAL (s de composicao), corrigidos contra o audio: o Whisper marcava "Faz"
 * em 8.28 s (inicio do ruido de sala); a voz entra em 8.62 s. Ver metodos/02-legendas.md. */
export const V02_WORDS: PalavraTempo[] = [
  { text: "FAZ", s: 8.6, e: 8.9 },
  { text: "DIFERENÇA,", s: 8.9, e: 9.4 },
  { text: "NÉ?", s: 9.4, e: 9.64 },
  { text: "CLIQUE", s: 9.64, e: 9.88 },
  { text: "EM", s: 9.88, e: 10.0 },
  { text: "SAIBA", s: 10.0, e: 10.3 },
  { text: "MAIS", s: 10.3, e: 10.58 },
  { text: "E", s: 10.58, e: 10.7 },
  { text: "GARANTA", s: 10.7, e: 11.02 },
  { text: "O", s: 11.02, e: 11.14 },
  { text: "SEU!", s: 11.14, e: 11.46 },
];

/** paginas ajustadas a mao (queixo em ~y1300 no "NE?", mao do gesto em x140-290 no "CLIQUE EM") */
export const V02_PAGES: PaginaLegenda[] = [
  { lines: [[0, 1]], size: 136 },
  { lines: [[2]], size: 160, dy: 50 },
  { lines: [[3, 4]], size: 130, dx: 70, dy: 24 },
  { lines: [[5, 6]], size: 144, dx: -24, dy: 22 },
  { lines: [[7, 8]], size: 168 },
  { lines: [[9, 10]], size: 196 },
];

export const V02_EMPHASIS: Enfase[] = [
  { word: "DIFERENCA", kind: "onda" },
  { word: "SAIBA", kind: "etiqueta" },
  { word: "MAIS", kind: "etiqueta" },
  { word: "GARANTA", kind: "faisca" },
  { word: "SEU", kind: "final" },
];

/** exatamente como o V02 montou: sem desenhos de enfase, corte seco em 9.995 s ("SAIBA MAIS" vira o botao) */
export const V02_LEGENDAS: LegendasProps = {
  words: V02_WORDS,
  pages: V02_PAGES,
  emphasis: V02_EMPHASIS,
  showEmphasis: false,
  yCenter: 1330,
  yNudge: 80,
  stopBeforeSec: 10.5,
  cutAtSec: 9.995,
};

/* -------------------------------------------- contexto de teste (fundo) -- */

/** quadro do matte de exemplo (23.976 fps a partir de 7.6 s; trava no 26 = 1o quadro nitido) */
const matteIdx = (t: number) => Math.min(107, Math.max(26, Math.round(((t - 7.6) * 24000) / 1001) + 1));
const pad4 = (n: number) => ("000" + n).slice(-4);

/** fundo tinta + cartao da marca (aprox. do Presenter do V02) */
export const DevFundo: React.FC = () => {
  const b = useBrand();
  return (
    <AbsoluteFill style={{ background: b.colors.ink }}>
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          top: 960,
          bottom: -40,
          borderTopLeftRadius: 150,
          background: b.colors.primaryLight,
          opacity: 0.75,
        }}
      />
    </AbsoluteFill>
  );
};

/** apresentadora recortada (mesma escala/ancora do Presenter: 1080x1080 na base, 1.1 -> 1.166) */
export const DevPessoa: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const p = interpolate(t, [7.8, 12.074], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  return (
    <div style={{ position: "absolute", left: 0, top: 840, width: 1080, height: 1080, transformOrigin: "50% 100%", scale: 1.1 * (1 + 0.06 * p) }}>
      <Img src={staticFile(`exemplo/matte/m${pad4(matteIdx(t))}.png`)} style={{ width: 1080, height: 1080, display: "block" }} />
    </div>
  );
};

const Dev: React.FC<LegendasProps> = (props) => (
  <AbsoluteFill>
    <DevFundo />
    <DevPessoa />
    <Legendas {...props} />
  </AbsoluteFill>
);

export const LegendasRoot: React.FC = () => (
  <>
    <Composition id="Legendas" component={Dev} defaultProps={V02_LEGENDAS} width={1080} height={1920} fps={30} durationInFrames={363} />
    {/* fala inteira com desenhos de enfase (etiqueta, faiscas, final) para conferir o modo completo */}
    <Composition
      id="LegendasCompleta"
      component={Dev}
      defaultProps={{ ...V02_LEGENDAS, showEmphasis: true, stopBeforeSec: 9999, cutAtSec: 9999 }}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={363}
    />
    {/* paginacao automatica (sem pages) */}
    <Composition
      id="LegendasAuto"
      component={Dev}
      defaultProps={{ words: V02_WORDS, emphasis: V02_EMPHASIS }}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={363}
    />
  </>
);
