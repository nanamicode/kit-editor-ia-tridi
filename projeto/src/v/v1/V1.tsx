// V1 · Carimbos Tridi · Estilo FCA nº 3 "Letreiro / tipografia gigante" + visual V11 Brutalismo.
// Cena humana sobria em P&B (frio), palavra-chave gigante em Anton, legenda curta sincronizada
// pela fala real (faster-whisper small pt, word timestamps), bloco preto de corte duro e uma
// passagem "muro de texto com frase marcada" no argumento de custo. Cor so volta no CTA.
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont as loadBask } from "@remotion/google-fonts/LibreBaskerville";
import { anton } from "../../tridi/theme";

const bask = loadBask("normal", { weights: ["400", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;

const FPS = 30;
export const V1_DURATION = 571; // 19,03 s (audio original 19,048 s)

const C = {
  preto: "#0B0B0B",
  branco: "#FFFFFF",
  lilas: "#B48CFF",
  roxo: "#8B00FF",
  papel: "#E9E6E0",
  tinta: "#2B2B2B",
};

const SRC = staticFile("v/v1/v1.mp4");
const GRAO = staticFile("v/v1/grao_tile_512.png");
const PAPEL = staticFile("v/v1/papel_fundo_tile_1024.png");

// ---------- fala real (s) ----------
const WT: number[] = [
  0.0, 0.5, 1.38, 1.48, // 0 Voce 1 capricha 2 no 3 produto
  2.02, 2.22, 2.78, 2.94, // 4 para 5 entregar 6 numa 7 embalagem
  3.52, 3.94, 4.12, 4.3, // 8 sem 9 a 10 sua 11 marca
  4.88, 4.98, 5.12, 5.5, // 12 Com 13 um 14 carimbo 15 personalizado
  6.78, 6.9, 7.38, // 16 sua 17 propria 18 logo
  7.78, 8.42, 8.8, // 19 acompanha 20 cada 21 pedido
  9.54, 9.88, 10.26, // 22 Voce 23 mesmo 24 personaliza
  11.36, 11.66, 12.04, 12.22, // 25 sem 26 depender 27 de 28 grafica
  13.04, 13.16, 13.58, 14.42, 14.54, // 29 e 30 gastando 31 centavos 32 por 33 aplicacao
  15.32, 15.56, 16.22, // 34 Faz 35 diferenca 36 ne
  16.46, 16.68, 16.8, 17.04, 17.34, 17.52, 17.84, 17.92, // 37 Clique 38 em 39 Saiba 40 Mais 41 e 42 garanta 43 o 44 seu
];
const wf = (i: number) => Math.max(0, Math.round(WT[i] * FPS) - 1);

// ---------- cortes do original (pts) e enquadramento do painel ----------
// Painel = video em escala 1,5 (720->1080). A legenda queimada fica em y_orig 1120-1185;
// com BLOCO_TOPO=1160 e ty >= -500 ela cai sempre embaixo do bloco preto opaco.
const BLOCO_TOPO = 1160;
const CENAS: { from: number; ty: number; cor: boolean }[] = [
  { from: 0, ty: -330, cor: false }, // sacola kraft (Made to Keep)
  { from: 96, ty: -420, cor: false }, // sacola branca (True Cost)
  { from: 203, ty: -300, cor: false }, // papel (Sigma) + copo vermelho
  { from: 360, ty: -400, cor: false }, // caixa kraft
  { from: 460, ty: -150, cor: true }, // apresentadora (CTA)
];

// ---------- letreiro ----------
type Tok = { t: string; i: number; strike?: boolean; stamp?: boolean; ghost?: boolean };
type Linha = { toks: Tok[]; size: number; cor?: string; estilo?: "outline" | "box" };
type Beat = { from: number; to: number; linhas: Linha[] };

const L = (size: number, toks: Tok[], cor?: string, estilo?: Linha["estilo"]): Linha => ({ toks, size, cor, estilo });

const BEATS_RAW: { linhas: Linha[] }[] = [
  {
    linhas: [
      L(140, [{ t: "VOCÊ", i: 0 }]),
      L(220, [{ t: "CAPRICHA", i: 1, ghost: true }], C.lilas),
      L(104, [{ t: "NO", i: 2 }, { t: "PRODUTO", i: 3 }]),
    ],
  },
  {
    linhas: [
      L(100, [{ t: "PRA", i: 4 }, { t: "ENTREGAR", i: 5 }, { t: "NUMA", i: 6 }]),
      L(196, [{ t: "EMBALAGEM", i: 7 }]),
    ],
  },
  {
    linhas: [
      L(120, [{ t: "SEM", i: 8 }, { t: "A", i: 9 }, { t: "SUA", i: 10 }]),
      L(250, [{ t: "MARCA.", i: 11 }], C.branco, "outline"),
    ],
  },
  {
    linhas: [
      L(96, [{ t: "COM", i: 12 }, { t: "UM", i: 13 }]),
      L(210, [{ t: "CARIMBO", i: 14 }]),
      L(124, [{ t: "PERSONALIZADO", i: 15 }], C.lilas),
    ],
  },
  {
    linhas: [
      L(118, [{ t: "SUA", i: 16 }, { t: "PRÓPRIA", i: 17 }]),
      L(230, [{ t: "LOGO", i: 18, stamp: true }], C.lilas),
    ],
  },
  {
    linhas: [
      L(120, [{ t: "ACOMPANHA", i: 19 }]),
      L(172, [{ t: "CADA", i: 20 }, { t: "PEDIDO", i: 21 }], C.lilas),
    ],
  },
  {
    linhas: [
      L(120, [{ t: "VOCÊ", i: 22 }, { t: "MESMO", i: 23 }]),
      L(168, [{ t: "PERSONALIZA", i: 24 }], C.lilas),
    ],
  },
  {
    linhas: [
      L(120, [{ t: "SEM", i: 25 }, { t: "DEPENDER", i: 26 }]),
      L(184, [{ t: "DE", i: 27 }, { t: "GRÁFICA", i: 28, strike: true }]),
    ],
  },
  { linhas: [] }, // 8 = muro de texto (gastando centavos por aplicacao)
  {
    linhas: [
      L(110, [{ t: "FAZ", i: 34 }]),
      L(196, [{ t: "DIFERENÇA,", i: 35 }], C.lilas),
      L(110, [{ t: "NÉ?", i: 36 }]),
    ],
  },
  {
    linhas: [
      L(104, [{ t: "CLIQUE", i: 37 }, { t: "EM", i: 38 }]),
      L(168, [{ t: "SAIBA", i: 39 }, { t: "MAIS", i: 40 }], C.branco, "box"),
      L(96, [{ t: "E", i: 41 }, { t: "GARANTA", i: 42 }, { t: "O", i: 43 }, { t: "SEU!", i: 44 }], C.lilas),
    ],
  },
];

const MURO_FROM = wf(29);
const MURO_TO = 460; // corte para a apresentadora
const firstIdx = [0, 4, 8, 12, 16, 19, 22, 25, 29, 34, 37];
const BEATS: Beat[] = BEATS_RAW.map((b, k) => ({
  linhas: b.linhas,
  from: k === 9 ? MURO_TO : wf(firstIdx[k]),
  to: k === 7 ? MURO_FROM : k === 8 ? MURO_TO : k < 10 ? wf(firstIdx[k + 1]) : V1_DURATION,
}));

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// palavra entra no tempo da fala: corte seco + escala curta (Hard Copy)
// box: o bloco roxo e o fundo da PROPRIA palavra (mesmo span), entao a escala de entrada vale
// para bloco+texto juntos e o bloco nunca aparece antes da palavra nem fica mais estreito que ela.
// ghost: a palavra-chave ja existe como contorno desde o frame 0 e "enche" quando e falada.
const Palavra: React.FC<{
  tok: Tok;
  frame: number;
  cor: string;
  size: number;
  outline?: boolean;
  box?: boolean;
}> = ({ tok, frame, cor, size, outline, box }) => {
  const sf = wf(tok.i);
  const vis = frame >= sf;
  const fantasma = !vis && tok.ghost;
  const k = interpolate(frame, [sf, sf + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const escala = tok.stamp
    ? interpolate(frame, [sf, sf + 4, sf + 7], [1.22, 0.96, 1], clamp)
    : fantasma
      ? 1
      : interpolate(k, [0, 1], [1.08, 1]);
  const boxK = interpolate(frame, [sf, sf + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const strikeK = interpolate(frame, [sf + 6, sf + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        opacity: vis || fantasma ? 1 : 0,
        transform: `translateY(${fantasma ? 0 : (1 - k) * 10}px) scale(${escala}) rotate(${tok.stamp ? -4 : 0}deg)`,
        color: outline || fantasma ? "transparent" : cor,
        WebkitTextStroke: fantasma ? `4px rgba(180,140,255,0.9)` : outline ? `6px ${cor}` : undefined,
        border: tok.stamp ? `12px solid ${cor}` : undefined,
        padding: tok.stamp
          ? `${size * 0.04}px ${size * 0.14}px 0`
          : box
            ? `${size * 0.03}px ${size * 0.11}px 0`
            : undefined,
      }}
    >
      {box ? (
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: C.roxo,
            transform: `scaleX(${boxK})`,
            transformOrigin: "left center",
            zIndex: -1,
          }}
        />
      ) : null}
      <span style={{ position: "relative" }}>{tok.t}</span>
      {tok.strike ? (
        <span
          style={{
            position: "absolute",
            left: -10,
            right: -10,
            top: "50%",
            height: size * 0.12,
            marginTop: -size * 0.03,
            background: C.lilas,
            transform: `scaleX(${strikeK})`,
            transformOrigin: "left center",
          }}
        />
      ) : null}
    </span>
  );
};

const GAP_LINHA = 10;
const STAMP_MT = 36; // LOGO desce para a moldura nao cruzar a linha de cima
const alturaLinha = (ln: Linha) => {
  const stamp = ln.toks.some((t) => t.stamp);
  return (
    ln.size * 1.04 +
    (ln.estilo === "box" ? ln.size * 0.03 : 0) +
    (stamp ? 24 + ln.size * 0.04 + STAMP_MT : 0)
  );
};

const Letreiro: React.FC<{ beat: Beat; frame: number }> = ({ beat, frame }) => {
  // so as linhas ja faladas ocupam espaco: o grupo fica sempre centrado no bloco;
  // quando entra uma linha nova o grupo sobe meio passo com deslocamento curto
  const vis = beat.linhas.filter((ln) => ln.toks.some((t) => t.ghost) || frame >= wf(ln.toks[0].i));
  let offset = 0;
  vis.forEach((ln, j) => {
    if (j === 0 || ln.toks.some((t) => t.ghost)) return;
    const sf = wf(ln.toks[0].i);
    const k = interpolate(frame, [sf, sf + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    offset += ((alturaLinha(ln) + GAP_LINHA) / 2) * (1 - k);
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: BLOCO_TOPO + 34,
        height: 1625 - (BLOCO_TOPO + 34),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: GAP_LINHA,
        fontFamily: anton,
        textTransform: "uppercase",
        transform: `translateY(${offset}px)`,
      }}
    >
      {vis.map((ln, j) => {
        const boxOn = ln.estilo === "box";
        const stamp = ln.toks.some((t) => t.stamp);
        return (
          <div
            key={j}
            style={{
              position: "relative",
              display: "flex",
              gap: boxOn ? 0 : ln.size * 0.22,
              fontSize: ln.size,
              lineHeight: 1.04,
              whiteSpace: "nowrap",
              marginTop: stamp ? STAMP_MT : 0,
              letterSpacing: ln.size > 150 ? -1 : 0,
            }}
          >
            {ln.toks.map((tok) => (
              <Palavra
                key={tok.i}
                tok={tok}
                frame={frame}
                cor={ln.cor ?? C.branco}
                size={ln.size}
                outline={ln.estilo === "outline"}
                box={boxOn}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ---------- muro de texto com frase marcada ----------
// A frase falada e uma linha do PROPRIO muro (mesma serifa, maior e em negrito). O marca-texto
// lilas passa por cima de cada palavra no tempo da fala, da esquerda para a direita, preso a
// largura da palavra. Nenhuma linha de fundo ocupa a faixa da frase (sem texto sobre texto).
const MURO_ANTES = [
  "você capricha no produto",
  "com um carimbo personalizado",
  "sua própria logo acompanha",
  "pra entregar numa embalagem",
  "você mesmo personaliza",
];
const MURO_DEPOIS = [
  "sem depender de gráfica",
  "sua própria logo",
  "com um carimbo personalizado",
  "acompanha cada pedido",
  "você capricha no produto",
  "sem depender de gráfica",
];
const MARCA: { t: string; i: number }[][] = [
  [
    { t: "e", i: 29 },
    { t: "gastando", i: 30 },
  ],
  [{ t: "centavos", i: 31 }],
  [
    { t: "por", i: 32 },
    { t: "aplicação.", i: 33 },
  ],
];
const PASSO_FUNDO = 136;
const PASSO_FRASE = 150;
const FRASE_SIZE = 104;
const MURO_TOPO = 960 - (MURO_ANTES.length * PASSO_FUNDO + (MARCA.length * PASSO_FRASE) / 2);

const LinhaFundo: React.FC<{ s: string; j: number; top: number }> = ({ s, j, top }) => {
  const blur = j % 3 === 1 ? 5 : j % 4 === 3 ? 2.5 : 0;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: j % 2 === 0 ? 70 : 40,
        fontFamily: bask,
        fontWeight: j % 5 === 0 ? 700 : 400,
        fontSize: j % 5 === 0 ? 74 : 62,
        lineHeight: 1.2,
        color: C.tinta,
        opacity: blur > 0 ? 0.42 : 0.62,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </div>
  );
};

const PalavraMarcada: React.FC<{ t: string; i: number; frame: number }> = ({ t, i, frame }) => {
  const sf = wf(i);
  const prox = i < 33 ? wf(i + 1) : sf + 10;
  const fim = Math.max(sf + 4, Math.min(prox, sf + 9));
  const m = interpolate(frame, [sf, fim], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const on = frame >= sf;
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 14px" }}>
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "14%",
          bottom: "4%",
          background: C.lilas,
          transform: `skewX(-8deg) scaleX(${m})`,
          transformOrigin: "left center",
          borderRadius: 6,
        }}
      />
      <span
        style={{
          position: "relative",
          color: on ? C.preto : C.tinta,
          opacity: on ? 1 : 0.62,
        }}
      >
        {t}
      </span>
    </span>
  );
};

const Muro: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame - MURO_FROM;
  const dur = MURO_TO - MURO_FROM;
  const drift = interpolate(t, [0, dur], [0, -70], clamp);
  const zoom = interpolate(t, [0, dur], [1.0, 1.07], clamp);
  const topoFrase = MURO_TOPO + MURO_ANTES.length * PASSO_FUNDO;
  const topoDepois = topoFrase + MARCA.length * PASSO_FRASE;
  return (
    <AbsoluteFill style={{ backgroundColor: C.papel, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ backgroundImage: `url(${PAPEL})`, backgroundSize: "1024px 1024px", opacity: 0.55 }}
      />
      <AbsoluteFill style={{ transform: `translateY(${drift}px) scale(${zoom})`, transformOrigin: "50% 50%" }}>
        {MURO_ANTES.map((s, j) => (
          <LinhaFundo key={`a${j}`} s={s} j={j} top={MURO_TOPO + j * PASSO_FUNDO} />
        ))}
        {MARCA.map((toks, j) => (
          <div
            key={`m${j}`}
            style={{
              position: "absolute",
              top: topoFrase + j * PASSO_FRASE,
              left: 56,
              fontFamily: bask,
              fontWeight: 700,
              fontSize: FRASE_SIZE,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              display: "flex",
              gap: 6,
            }}
          >
            {toks.map((tok) => (
              <PalavraMarcada key={tok.i} t={tok.t} i={tok.i} frame={frame} />
            ))}
          </div>
        ))}
        {MURO_DEPOIS.map((s, j) => (
          <LinhaFundo key={`d${j}`} s={s} j={j + 1} top={topoDepois + 14 + j * PASSO_FUNDO} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- composicao ----------
export const V1: React.FC = () => {
  const frame = useCurrentFrame();

  let ci = 0;
  for (let k = 0; k < CENAS.length; k++) if (frame >= CENAS[k].from) ci = k;
  const cena = CENAS[ci];
  const cenaFim = ci < CENAS.length - 1 ? CENAS[ci + 1].from : V1_DURATION;
  // push-in lento por cena (unico movimento continuo do painel)
  const zoom = interpolate(frame, [cena.from, cenaFim], [1.0, 1.05], clamp);
  // tranco curto no carimbo da palavra LOGO (a logo "carimba")
  const hit = interpolate(frame, [wf(18) + 3, wf(18) + 5, wf(18) + 10], [0, 1, 0], clamp);
  // centro visivel do painel em coordenadas do video
  const origemY = (BLOCO_TOPO / 2 - cena.ty);

  const beat = BEATS.find((b) => frame >= b.from && frame < b.to);
  const muro = frame >= MURO_FROM && frame < MURO_TO;

  // cor volta por ~0,5 s quando a marca carimbada aparece (LOGO, PERSONALIZA)
  const flash = (s: number) => interpolate(frame, [s, s + 3, s + 14, s + 20], [0, 1, 1, 0], clamp);
  const corK = Math.max(flash(wf(18) + 2), flash(wf(24)));
  const g = 1 - corK;
  const filtro = cena.cor
    ? "saturate(1.08) contrast(1.06)"
    : `grayscale(${g}) contrast(${1.32 - 0.24 * corK}) brightness(0.96)`;
  // punch-in curto no frame 0 (gancho)
  const punch = interpolate(frame, [0, 9], [0.09, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ backgroundColor: C.preto }}>
      <Audio src={SRC} />
      {/* painel de video (cena humana sobria) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: BLOCO_TOPO,
          overflow: "hidden",
          backgroundColor: C.preto,
        }}
      >
        <Video
          src={SRC}
          muted
          style={{
            position: "absolute",
            left: 0,
            top: cena.ty,
            width: 1080,
            height: 1920,
            transform: `scale(${zoom + hit * 0.025 + punch}) translateY(${hit * 8}px)`,
            transformOrigin: `540px ${origemY}px`,
            filter: filtro,
          }}
        />
        {/* vinheta dura */}
        <AbsoluteFill
          style={{
            background: "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      {/* bloco brutalista: cobre a faixa da legenda queimada */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: BLOCO_TOPO,
          width: 1080,
          height: 1920 - BLOCO_TOPO,
          backgroundColor: C.preto,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 12, backgroundColor: C.lilas }} />
      </div>

      {beat && beat.linhas.length > 0 ? <Letreiro beat={beat} frame={frame} /> : null}

      {muro ? <Muro frame={frame} /> : null}

      {/* grao de impressao */}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${GRAO})`,
          backgroundSize: "512px 512px",
          backgroundPosition: `${Math.floor(random(`gx${frame}`) * 512)}px ${Math.floor(random(`gy${frame}`) * 512)}px`,
          mixBlendMode: "overlay",
          opacity: 0.22,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
