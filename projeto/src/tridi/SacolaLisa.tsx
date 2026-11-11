import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { TEX } from "./theme";
import { DUR, IMPACTO, MUSIC_TRIM, REVELA_DUR, T } from "./sl/tempo";
import { CTA, Fundo, Grade, NaoTemLogo, Prova, Selos, TextosCinza, TextosRiso } from "./sl/cenas";
import { Brigadeiros, CarimboCena, CarimboEspreita, Cascata, Protagonista } from "./sl/personagem";
import { EO, Mundo, iv } from "./sl/ui";

/**
 * "A SACOLA LISA" — Carimbos Tridi, Meta Ads 9:16, 1080x1920, 30 fps, 644 frames (21,5 s), SEM narracao.
 * Estetica "Tridi Impresso": mundo sem marca (papel + reticula cinza, trilha abafada) ate o TUM (frame 245),
 * depois risografia roxa (trilha cheia). A troca e uma reticula de pontos que cresce a partir do ponto de impacto
 * em 10 frames. O ultimo quadro tem a composicao do primeiro (sacola no centro), sem fade, para o loop.
 */
export const SACOLA_LISA = { width: 1080, height: 1920, fps: 30, durationInFrames: DUR };

// mascara de reticula: pontos crescem a partir do impacto (clip-path com a uniao dos circulos)
const caminhoReticula = (p: number) => {
  const passo = 38;
  const lin = passo * 0.866;
  const frente = p * 1650;
  const suave = 300;
  let d = "";
  for (let j = 0, y = 0; y < 1920 + lin; j++, y = j * lin) {
    for (let x = j % 2 ? passo / 2 : 0; x < 1080 + passo; x += passo) {
      const t = (frente - Math.hypot(x - IMPACTO.x, y - IMPACTO.y)) / suave;
      if (t <= 0) continue;
      const r = Math.min(1, t) * passo * 0.72;
      d += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0Z`;
    }
  }
  return d || "M0 0Z";
};

const MundoCena: React.FC<{ mundo: Mundo }> = ({ mundo }) => (
  <AbsoluteFill>
    <Fundo mundo={mundo} />
    {mundo === "cinza" ? <CarimboEspreita /> : null}
    <Cascata mundo={mundo} />
    <Protagonista mundo={mundo} />
    {mundo === "cinza" ? <Brigadeiros /> : null}
    <CarimboCena />
    {mundo === "cinza" ? <TextosCinza /> : <TextosRiso />}
    {mundo === "riso" ? (
      <>
        <Prova />
        <Grade />
        <NaoTemLogo />
        <CTA />
      </>
    ) : null}
  </AbsoluteFill>
);

const TREME: Record<number, [number, number]> = { [T.tum]: [-14, 10], [T.tum + 1]: [11, -8], [T.tum + 2]: [-6, 5] };

const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  let s = 1;
  let ox = 540;
  let oy = 1000;
  if (f < T.levei) s = iv(f, [0, T.levei], [1, 1.04]);
  else if (f >= T.lisa && f < T.ninguem) {
    s = 1.08; // corte seco (punch-in) na pausa comica
    oy = 620;
  } else if (f >= T.tum && f < T.prova) {
    s = 1 + iv(f, [T.tum, T.tum + 24], [0.07, 0], EO); // cobre a tremida (sem borda preta)
    ox = IMPACTO.x;
    oy = IMPACTO.y;
  }
  const [tx, ty] = TREME[f] ?? [0, 0];
  return (
    <AbsoluteFill style={{ transformOrigin: `${ox}px ${oy}px`, scale: s, translate: `${tx}px ${ty}px` }}>{children}</AbsoluteFill>
  );
};

const Grao: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2); // grao "em stop-motion" a 15 qps
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${TEX.grao})`,
        backgroundSize: "512px 512px",
        backgroundPosition: `${(k * 137) % 512}px ${(k * 293) % 512}px`,
        mixBlendMode: "overlay",
        opacity: f >= T.tum ? 0.34 : 0.2, // grao de riso mais visivel no mundo roxo
        pointerEvents: "none",
      }}
    />
  );
};

// ---------- audio ----------
const SFX = (n: string) => staticFile(`tridi/sfx/${n}`);
const GANHO = 1; // mix sai ~-17 LUFS; master final: +3,2 dB + limitador (ffmpeg) -> -14 LUFS, < -1 dBTP

const Trilha: React.FC = () => {
  const f = useCurrentFrame();
  // abafada ate o TUM, com dois buracos de silencio (LISA. e o respiro antes do TUM)
  const abafada =
    f >= T.tum
      ? 0
      : iv(f, [T.lisa - 1, T.lisa, T.lisa + 12, T.lisa + 14, T.silencio - 1, T.silencio], [1, 0, 0, 1, 1, 0]);
  const cheia = f < T.tum ? 0 : iv(f, [DUR - 4, DUR - 1], [0.92, 0]);
  return (
    <>
      <Audio src={SFX("trilha-abafada.wav")} trimBefore={MUSIC_TRIM} durationInFrames={T.tum + 1} volume={abafada * 1.05 * GANHO} />
      <Sequence from={T.tum} layout="none">
        <Audio src={SFX("trilha-cheia.wav")} trimBefore={MUSIC_TRIM + T.tum} volume={cheia * GANHO} />
      </Sequence>
    </>
  );
};

type Ev = { f: number; src: string; v: number; rate?: number; trim?: number; dur?: number };
const EVENTOS: Ev[] = [
  // queda no balcao
  { f: 0, src: "foley-303-paper-rustle-short-01.wav", v: 0.32, trim: 2 },
  { f: T.queda - 2, src: "foley-380-table-fist-hits-wood-table-06.wav", v: 0.28, rate: 1.25 },
  // carimbo que espreita sai por cima
  { f: T.espreitaSai - 2, src: "whoosh-rapido-curto-01.wav", v: 0.42 },
  // brigadeiros: pop ao aparecer, papel ao cair dentro
  ...T.brig.map((t, i) => ({ f: t, src: "pop-bolha-ui-01.wav", v: 0.26, rate: 0.72 + i * 0.08 })),
  ...T.brig.map((t) => ({ f: t + 13, src: "foley-303-paper-rustle-short-01.wav", v: 0.16, rate: 1.3, trim: 6, dur: 10 })),
  // balao
  { f: T.onde - 1, src: "pop-bolha-ui-01.wav", v: 0.48, rate: 0.82 },
  // cascata: pops subindo o tom
  ...Array.from({ length: 10 }, (_, k) => ({ f: T.ninguem + 2 + k * 3, src: "pop-bolha-ui-01.wav", v: 0.19, rate: 0.9 + k * 0.1 })),
  // riser: pico (q 82 do arquivo) cai no silencio antes do TUM
  { f: T.ninguem, src: "riser-sintetico-curto-01.wav", v: 0.4, trim: 82 - (T.silencio - T.ninguem), dur: T.silencio - T.ninguem },
  // carimbo descendo
  { f: T.tum - 25, src: "whoosh-rapido-curto-01.wav", v: 0.38, dur: T.silencio - (T.tum - 25) },
  // TUM (pico ~2 frames apos o inicio)
  { f: T.tum - 2, src: "hit-madeira-seco-01.wav", v: 0.55 },
  { f: T.tum - 2, src: "foley-380-table-fist-hits-wood-table-06.wav", v: 0.5 },
  // prova (corte seco com tapa do cartao)
  { f: T.prova - 4, src: "whoosh-rapido-curto-01.wav", v: 0.42 },
  { f: T.borracha, src: "clique-interface-01.wav", v: 0.6 },
  { f: T.gravada, src: "clique-interface-01.wav", v: 0.6 },
  // grade
  { f: T.grade - 4, src: "whoosh-rapido-curto-01.wav", v: 0.34 },
  ...T.celulas.map((c, i) => ({ f: c - 1, src: "pop-bolha-ui-01.wav", v: 0.32, rate: 1 + i * 0.1 })),
  // nao tem logo? eles criam
  { f: T.logo - 4, src: "whoosh-rapido-curto-01.wav", v: 0.38 },
  { f: T.criam - 2, src: "hit-madeira-seco-01.wav", v: 0.42, rate: 1.15 },
  { f: T.criam - 8, src: "ding-notificacao-correta-01.wav", v: 0.5 },
  { f: T.criam + 16, src: "clique-interface-01.wav", v: 0.6 }, // VOCÊ APROVA
  // CTA
  { f: T.cta - 4, src: "whoosh-rapido-curto-01.wav", v: 0.36 },
  { f: T.cta, src: "ding-notificacao-correta-01.wav", v: 0.55 },
];

const Efeitos: React.FC = () => (
  <>
    {EVENTOS.map((e, i) => (
      <Sequence key={i} from={e.f} durationInFrames={e.dur} layout="none">
        <Audio src={SFX(e.src)} volume={e.v * GANHO} playbackRate={e.rate ?? 1} trimBefore={e.trim} />
      </Sequence>
    ))}
  </>
);

export const SacolaLisa: React.FC = () => {
  const f = useCurrentFrame();
  const p = iv(f, [T.tum - 1, T.tum + REVELA_DUR], [0, 1], (t) => 1 - Math.pow(1 - t, 1.6));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Camera>
        {f < T.tum + REVELA_DUR ? <MundoCena mundo="cinza" /> : null}
        {f >= T.tum ? (
          <AbsoluteFill style={{ clipPath: f < T.tum + REVELA_DUR ? `path('${caminhoReticula(p)}')` : undefined }}>
            <MundoCena mundo="riso" />
          </AbsoluteFill>
        ) : null}
      </Camera>
      <Selos />
      <Grao />
      <Trilha />
      <Efeitos />
    </AbsoluteFill>
  );
};
