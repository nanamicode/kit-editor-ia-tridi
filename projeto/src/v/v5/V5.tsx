// v5 · Carimbos Tridi · Estilo FCA 5 "Dossie" (mural de investigacao) + visual V43 "Letra a Mao".
// A mensagem vira um caso no quadro de cortica: o video original e a polaroid-evidencia
// (recorte que exclui a faixa da legenda queimada), a fala e datilografada numa tira de papel,
// fichas com tachinha e fio ligam as ideias, e o carimbo (o proprio produto) fecha o caso.
// Movimento so por useCurrentFrame/interpolate. Cores da marca: roxo #8B00FF, lilas #B48CFF, branco.
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { loadFont as loadCourier } from "@remotion/google-fonts/CourierPrime";
import { loadFont as loadElite } from "@remotion/google-fonts/SpecialElite";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadDirt } from "@remotion/google-fonts/RubikDirt";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import WORDS_RAW from "./words.json";

const courier = loadCourier("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const elite = loadElite("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
const marker = loadMarker("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const dirt = loadDirt("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;

const ROXO = "#8B00FF";
const LILAS = "#B48CFF";
const PAPEL = "#F4EFE4";
const TINTA = "#231F1C";
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);

// ---------- Fala real (faster-whisper small pt, tempos por palavra) ----------
// Correcao: o Whisper ouviu "carinho"; a legenda do anunciante e o "com ele" seguinte confirmam "carimbo".
type W = { w: string; s: number; e: number };
const WORDS: W[] = (WORDS_RAW as W[]).map((x) =>
  x.w.toLowerCase().startsWith("carinho") ? { ...x, w: "carimbo." } : x,
);
// Blocos da tira datilografada (<=2 linhas), por indice de palavra
const CHUNKS: [number, number][] = [
  [0, 3], // Enquanto outros pagam graficas,
  [4, 8], // voce pode personalizar com carimbo.
  [9, 14], // Com ele voce marca sua logo
  [15, 17], // em qualquer embalagem.
  [18, 20], // A cada entrega,
  [21, 25], // seu cliente lembra de voce.
  [26, 31], // E isso que faz o cliente
  [32, 35], // lembrar da sua marca.
];
// a tira sai quando comeca "lembrar da sua marca": a ficha 5 traz a frase inteira (sem palavra repetida nas duas)
const CAPTION_END = 12.0;

// ---------- Geometria (1080x1920; essencial entre y 285 e 1635) ----------
const POL = { x: 74, y: 290, w: 932, h: 888, pad: 26 };
const PHOTO = { w: 880, h: 770 }; // mostra so as linhas 0-630 do quadro 720 (legenda queimada esta em ~660-695)
const STRIP = { x: 80, y: 1196, w: 920, h: 146 };
const CARD_Y = 1360;
const CARD_H = 252;
// palavras que a ficha mostra: na tira viram lacuna de formulario (linha lilas), sem repetir a palavra.
// valor = ultimo quadro em que a ficha mostra a palavra (depois disso a tira volta a escrever)
const KEYS = new Map<number, number>([
  [3, 99999], [6, 119], [8, 99999], [16, 99999], [17, 99999],
  [23, 99999], [24, 99999], [25, 99999], [33, 99999], [34, 99999], [35, 99999],
]);
const DUR = 493; // audio do original vai ate 16,42 s

// Rotacao da polaroid principal (tremor quando chega nova evidencia + giro lento no congelamento final)
const wob = (frame: number, f0: number) => {
  const d = frame - f0;
  if (d < 0 || d > 20) return 0;
  return Math.sin(d * 0.75) * ((20 - d) / 20);
};
const polRot = (frame: number) =>
  -1.1 + (wob(frame, 76) + wob(frame, 140) + wob(frame, 327)) * 1.5 + interpolate(frame, [427, DUR], [0, 0.7], CL);
// flash de foto: pico branco curto, saida rapida (3-4 quadros)
const flashAt = (frame: number) =>
  interpolate(frame, [73, 75, 78], [0, 0.85, 0], CL) +
  interpolate(frame, [137, 139, 142], [0, 1, 0], CL) +
  interpolate(frame, [324, 326, 329], [0, 1, 0], CL);

// Evidencias anteriores: a cada corte a foto antiga fica na pilha ATRAS da polaroid (as bordas aparecem),
// o caso se acumula sem ocupar o rodape (y > 1640 fica sob a interface do Reels).
const EVID = [
  { T: 76, img: "v/v5/f060.jpg", rot: -4.4, dx: -8, dy: 4 },
  { T: 140, img: "v/v5/f132.jpg", rot: 3.6, dx: 8, dy: 2 },
  { T: 327, img: "v/v5/f317.jpg", rot: -2.2, dx: -2, dy: 10 },
];

// ---------- Pecas do mural ----------
const Cork: React.FC = () => (
  <AbsoluteFill>
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <defs>
        <filter id="v5cork" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="3" seed="11" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.24  0 0 0 0 0.13  0 0 0 0 0.05  6 0 0 0 -2.75"
          />
        </filter>
        <filter id="v5cork2" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.88  0 0 0 0 0.68  0 0 0 0 0.46  0 6 0 0 -3.15"
          />
        </filter>
        <radialGradient id="v5vig" cx="50%" cy="46%" r="75%">
          <stop offset="0.45" stopColor="#140802" stopOpacity="0" />
          <stop offset="1" stopColor="#140802" stopOpacity="0.78" />
        </radialGradient>
        <radialGradient id="v5warm" cx="50%" cy="38%" r="55%">
          <stop offset="0" stopColor="#FFD9A8" stopOpacity="0.22" />
          <stop offset="1" stopColor="#FFD9A8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#93623A" />
      <rect width={1080} height={1920} filter="url(#v5cork)" />
      <rect width={1080} height={1920} filter="url(#v5cork2)" opacity={0.55} />
      <rect width={1080} height={1920} fill="url(#v5warm)" />
      <rect width={1080} height={1920} fill="url(#v5vig)" />
    </svg>
  </AbsoluteFill>
);

const Pin: React.FC<{ x: number; y: number; size?: number; s?: number; z?: number }> = ({
  x,
  y,
  size = 34,
  s = 1,
  z = 5,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 32%, #E9D6FF 0%, ${LILAS} 18%, ${ROXO} 52%, #3F007A 100%)`,
      boxShadow: "4px 7px 6px rgba(0,0,0,0.55)",
      scale: s,
      opacity: s > 0 ? 1 : 0,
      zIndex: z,
    }}
  />
);

const Tape: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 120, rot = -8 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: 40,
      background: "rgba(200,170,255,0.62)",
      rotate: `${rot}deg`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
      zIndex: 4,
    }}
  />
);

// Fio (roxo) entre duas tachinhas, desenhado ao longo de [f0, f0+dur]
const Thread: React.FC<{
  a: [number, number];
  b: [number, number];
  f0: number;
  f1?: number;
  sag?: number;
  c?: [number, number];
  z?: number;
}> = ({ a, b, f0, f1 = 99999, sag = 60, c, z = 3 }) => {
  const frame = useCurrentFrame();
  if (frame < f0 || frame > f1 + 8) return null;
  const mx = c ? c[0] : (a[0] + b[0]) / 2;
  const my = c ? c[1] : (a[1] + b[1]) / 2 + sag;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, zIndex: z, pointerEvents: "none" }}>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={6} transform="translate(4 7)" pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={interpolate(frame, [f0, f0 + 12], [1, 0], { ...CL, easing: OUT })}
        opacity={interpolate(frame, [f1, f1 + 8], [1, 0], CL)} />
      <path d={d} fill="none" stroke={ROXO} strokeWidth={6} strokeLinecap="round" pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={interpolate(frame, [f0, f0 + 12], [1, 0], { ...CL, easing: OUT })}
        opacity={interpolate(frame, [f1, f1 + 8], [1, 0], CL)} />
    </svg>
  );
};

// Carimbo de borracha (tinta roxa), batida com escala e leve tremor.
// Texto em SVG com textLength fixo: a largura nunca estoura o cartao/foto.
const Stamp: React.FC<{
  at: number;
  lines: string[];
  size: number;
  textW: number;
  rot: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ at, lines, size, textW, rot, color = ROXO, style }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const lh = size * 1.0;
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 8,
        border: `7px double ${color}`,
        borderRadius: 14,
        padding: "8px 18px 6px",
        rotate: `${rot}deg`,
        scale: interpolate(frame, [at, at + 4, at + 7], [1.9, 0.96, 1], { ...CL, easing: OUT }),
        opacity: interpolate(frame, [at, at + 3], [0, 0.94], CL),
        ...style,
      }}
    >
      <svg width={textW} height={lh * lines.length} style={{ display: "block" }}>
        {lines.map((l, i) => (
          <text
            key={l}
            x={textW / 2}
            y={lh * i + size * 0.86}
            textAnchor="middle"
            textLength={textW}
            lengthAdjust="spacingAndGlyphs"
            fontFamily={dirt}
            fontSize={size}
            fill={color}
          >
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
};

// Texto que aparece letra a letra (maquina de escrever) a partir de f0
const Typed: React.FC<{ text: string; f0: number; cps?: number }> = ({
  text,
  f0,
  cps = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - f0) / fps) * cps)));
  return (
    <span>
      <span>{text.slice(0, n)}</span>
      <span style={{ color: "transparent" }}>{text.slice(n)}</span>
    </span>
  );
};

// ---------- Polaroid-evidencia com o video ----------
const Polaroid: React.FC = () => {
  const frame = useCurrentFrame();
  const rot = polRot(frame);
  const labels: [number, string][] = [
    [0, "EVIDÊNCIA 01 · SACOLA"],
    [76, "EVIDÊNCIA 02 · COPO E SACOLA"],
    [140, "EVIDÊNCIA 03 · EMBALAGEM"],
    [327, "CONCLUSÃO DO CASO"],
  ];
  const cur = [...labels].reverse().find(([f]) => frame >= f)!;
  const flash = flashAt(frame);
  // gancho: a polaroid bate na cortica (escala 1,08 -> 1) e a tachinha entra
  const slam = interpolate(frame, [0, 4, 7], [1.08, 0.985, 1], { ...CL, easing: OUT });
  const pinS = interpolate(frame, [0, 3, 6], [1.8, 0.88, 1], { ...CL, easing: OUT });
  // congelamento final (o original escurece): zoom lento e continuo ate o ultimo quadro
  const freezeZoom = interpolate(frame, [424, DUR], [1, 1.09], { ...CL, easing: Easing.inOut(Easing.sin) });

  return (
    <div
      style={{
        position: "absolute",
        left: POL.x,
        top: POL.y,
        width: POL.w,
        height: POL.h,
        background: "#F7F3EA",
        boxShadow: "0 22px 40px rgba(0,0,0,0.55), 0 3px 6px rgba(0,0,0,0.35)",
        rotate: `${rot}deg`,
        scale: slam,
        transformOrigin: "50% 2%",
        zIndex: 2,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: POL.pad,
          top: POL.pad,
          width: PHOTO.w,
          height: PHOTO.h,
          overflow: "hidden",
          background: "#120c08",
        }}
      >
        <Video
          src={staticFile("v/v5/v5.mp4")}
          objectFit="fill"
          style={{ position: "absolute", left: 0, top: 0, width: PHOTO.w, height: PHOTO.w }}
        />
        {/* trechos com glitch do original: segura o ultimo quadro limpo e troca com flash de foto */}
        {frame >= 133 && frame <= 139 ? (
          <Img src={staticFile("v/v5/f132.jpg")} style={{ position: "absolute", left: 0, top: 0, width: PHOTO.w, height: PHOTO.h }} />
        ) : null}
        {frame >= 140 && frame <= 145 ? (
          <Img src={staticFile("v/v5/f146.jpg")} style={{ position: "absolute", left: 0, top: 0, width: PHOTO.w, height: PHOTO.h }} />
        ) : null}
        {/* o video tem start_time 0,105 s: o quadro-fonte n aparece no quadro n+4 da composicao.
            glitch-fonte 318-326 -> composicao 322-330: segura 317 ate o flash e entra limpo (328) no corte */}
        {frame >= 318 && frame <= 326 ? (
          <Img src={staticFile("v/v5/f317.jpg")} style={{ position: "absolute", left: 0, top: 0, width: PHOTO.w, height: PHOTO.h }} />
        ) : null}
        {frame >= 327 && frame <= 331 ? (
          <Img src={staticFile("v/v5/f328.jpg")} style={{ position: "absolute", left: 0, top: 0, width: PHOTO.w, height: PHOTO.h }} />
        ) : null}
        {/* o original escurece ate o preto no fim: a evidencia fica congelada no ultimo sorriso */}
        {frame >= 427 ? (
          <Img
            src={staticFile("v/v5/f426.jpg")}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PHOTO.w,
              height: PHOTO.h,
              scale: freezeZoom,
              transformOrigin: "60% 35%",
            }}
          />
        ) : null}
        <LogoArrow />
        <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
        <AbsoluteFill style={{ boxShadow: "inset 0 0 60px rgba(40,20,5,0.45)" }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: POL.w,
          top: POL.pad + PHOTO.h,
          height: POL.h - POL.pad - PHOTO.h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: courier,
          fontSize: 46,
          letterSpacing: 3,
          color: TINTA,
        }}
      >
        <Typed key={cur[0]} text={cur[1]} f0={cur[0] === 0 ? -60 : cur[0]} cps={60} />
      </div>
      <Pin x={POL.w / 2} y={6} size={38} s={pinS} />
      {/* CASO ENCERRADO: menor, batido na parede roxa vazia acima do ombro (rosto e mao livres no CTA) */}
      <Stamp
        at={386}
        lines={["CASO", "ENCERRADO"]}
        size={54}
        textW={290}
        rot={-9}
        color="#FFFFFF"
        style={{ left: 50, top: 74, background: "rgba(139,0,255,0.82)" }}
      />
    </div>
  );
};

// Seta feita a mao (V43) apontando a marca carimbada na sacola + etiqueta datilografada (8,9-10,7 s)
const LogoArrow: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 266 || frame > 322) return null;
  const out = interpolate(frame, [314, 322], [1, 0], CL);
  const draw = interpolate(frame, [272, 284], [1, 0], { ...CL, easing: Easing.inOut(Easing.quad) });
  const head = interpolate(frame, [283, 287], [1, 0], CL);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 430,
          top: 372,
          padding: "10px 20px 8px",
          background: PAPEL,
          boxShadow: "0 6px 12px rgba(0,0,0,0.45)",
          rotate: "3deg",
          fontFamily: courier,
          fontSize: 44,
          letterSpacing: 2,
          color: TINTA,
          whiteSpace: "nowrap",
          opacity: interpolate(frame, [266, 270], [0, 1], CL) * out,
          translate: interpolate(frame, [266, 272], ["0px -16px", "0px 0px"], { ...CL, easing: OUT }),
        }}
      >
        <Typed text="SUA LOGO AQUI" f0={266} cps={50} />
      </div>
      <svg width={PHOTO.w} height={PHOTO.h} style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
        {/* tinta escura (caneta), nao o roxo da Tridi: aponta o resultado do carimbo sem associar a marca alheia */}
        <path d="M 650 452 C 645 500 620 535 580 560" fill="none" stroke={TINTA} strokeWidth={10} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
        <path d="M 620 563 L 580 561 L 595 524" fill="none" stroke={TINTA} strokeWidth={10} strokeLinecap="round"
          strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={head} />
      </svg>
    </>
  );
};

// Evidencia anterior: no corte (coberto pelo flash) a foto antiga gira para tras da polaroid e fica na pilha.
// So as bordas aparecem: o caso se acumula dentro da area segura, sem nada no rodape.
const PileCard: React.FC<{ T: number; img: string; rot: number; dx: number; dy: number }> = ({ T, img, rot, dx, dy }) => {
  const frame = useCurrentFrame();
  if (frame < T) return null;
  const p = interpolate(frame, [T, T + 14], [0, 1], { ...CL, easing: OUT });
  return (
    <div
      style={{
        position: "absolute",
        left: POL.x,
        top: POL.y,
        width: POL.w,
        height: POL.h,
        background: "#EFE9DC",
        boxShadow: "0 16px 30px rgba(0,0,0,0.5)",
        transformOrigin: "50% 2%",
        rotate: `${interpolate(p, [0, 1], [polRot(T), rot])}deg`,
        translate: `${dx * p}px ${dy * p}px`,
        zIndex: 1,
      }}
    >
      <div style={{ position: "absolute", left: POL.pad, top: POL.pad, width: PHOTO.w, height: PHOTO.h, overflow: "hidden" }}>
        <Img src={staticFile(img)} style={{ width: PHOTO.w, height: PHOTO.h, filter: "brightness(0.82) sepia(0.15)" }} />
      </div>
    </div>
  );
};

const Mural: React.FC = () => (
  <>
    {EVID.map((e) => (
      <PileCard key={e.T} {...e} />
    ))}
  </>
);

// ---------- Cabecalho do dossie ----------
const Header: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 110,
      top: 150,
      width: 860,
      height: 96,
      background: PAPEL,
      rotate: "-1deg",
      boxShadow: "0 8px 16px rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: courier,
      fontSize: 46,
      letterSpacing: 4,
      color: TINTA,
      zIndex: 2,
    }}
  >
    <span>
      DOSSIÊ · <span style={{ color: ROXO }}>CARIMBOS TRIDI</span>
    </span>
    <Tape x={-40} y={-16} w={100} rot={-24} />
    <Tape x={800} y={-16} w={100} rot={24} />
  </div>
);

// ---------- Tira datilografada (legenda sincronizada pela fala) ----------
const CaptionStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + 0.06; // leve avanco: a letra aparece junto com o som, nunca depois
  const exitF = CAPTION_END * fps;
  if (frame > exitF + 10) return null;
  // bloco atual: do inicio da 1a palavra ate o inicio do bloco seguinte
  let ci = -1;
  for (let i = 0; i < CHUNKS.length; i++) {
    // blocos que comecam depois da saida da tira nao entram (a ficha 5 mostra essa frase)
    if (i === 0 || (t >= WORDS[CHUNKS[i][0]].s - 0.02 && WORDS[CHUNKS[i][0]].s < CAPTION_END)) ci = i;
  }
  const [a, b] = CHUNKS[ci];
  const words = WORDS.slice(a, b + 1);
  const blink = Math.floor(frame / 8) % 2 === 0;
  // palavra ativa = ultima que ja comecou
  let active = -1;
  words.forEach((w, i) => {
    if (t >= w.s) active = i;
  });
  return (
    <div
      style={{
        position: "absolute",
        left: STRIP.x,
        top: STRIP.y,
        width: STRIP.w,
        height: STRIP.h,
        background: PAPEL,
        boxShadow: "0 10px 18px rgba(0,0,0,0.5)",
        rotate: "0.6deg",
        padding: "14px 34px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        zIndex: 6,
        opacity: interpolate(frame, [exitF, exitF + 8], [1, 0], CL),
        translate: interpolate(frame, [exitF, exitF + 8], ["0px 0px", "0px 30px"], CL),
      }}
    >
      <div style={{ fontFamily: courier, fontSize: 50, lineHeight: 1.14, color: TINTA, width: "100%" }}>
        {words.map((w, i) => {
          const dur = Math.max(w.e - w.s, 0.12);
          const p = Math.max(0, Math.min(1, ((t - w.s) / dur) * 1.5));
          const n = Math.ceil(p * w.w.length);
          const isActive = i === active;
          const isKey = frame <= (KEYS.get(a + i) ?? -1);
          const showCursor = isActive && (n < w.w.length || blink);
          // palavra-chave: lacuna (linha lilas do tamanho da palavra); a pontuacao continua visivel
          const core = w.w.replace(/[.,?!]+$/, "");
          return (
            <React.Fragment key={`${a}-${i}`}>
              {isKey ? (
                <>
                  <span style={{ color: "transparent", borderBottom: `6px solid ${LILAS}` }}>{core.slice(0, n)}</span>
                  <span>{w.w.slice(core.length, Math.max(core.length, n))}</span>
                </>
              ) : (
                <span style={{ color: isActive ? ROXO : TINTA }}>{w.w.slice(0, n)}</span>
              )}
              {showCursor ? (
                <span style={{ display: "inline-block", width: 0, position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 2,
                      top: -41,
                      width: 24,
                      height: 48,
                      background: TINTA,
                    }}
                  />
                </span>
              ) : null}
              <span style={{ color: "transparent" }}>{w.w.slice(n)}</span>
              {i < words.length - 1 ? " " : ""}
            </React.Fragment>
          );
        })}
      </div>
      <Tape x={-40} y={-14} w={100} rot={-20} />
      <Tape x={STRIP.w - 66} y={STRIP.h - 30} w={100} rot={-18} />
    </div>
  );
};

// ---------- Fichas (index cards) ----------
const Card: React.FC<{
  x: number;
  y?: number;
  w: number;
  h?: number;
  rot: number;
  inF: number;
  outF: number;
  dimF?: number;
  children: React.ReactNode;
}> = ({ x, y = CARD_Y, w, h = CARD_H, rot, inF, outF, dimF, children }) => {
  const frame = useCurrentFrame();
  if (frame < inF || frame > outF + 10) return null;
  const dim = dimF === undefined ? 1 : interpolate(frame, [dimF, dimF + 8], [1, 0.42], CL);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        rotate: `${rot}deg`,
        background: `repeating-linear-gradient(180deg, transparent 0px, transparent 55px, rgba(180,140,255,0.55) 55px, rgba(180,140,255,0.55) 57px), ${PAPEL}`,
        boxShadow: "0 12px 20px rgba(0,0,0,0.5)",
        borderTop: `8px solid ${ROXO}`,
        boxSizing: "border-box",
        padding: "16px 22px",
        zIndex: 6,
        opacity: interpolate(frame, [inF, inF + 6, outF, outF + 8], [0, 1, 1, 0], CL) * dim,
        translate: interpolate(frame, [inF, inF + 10, outF, outF + 8], ["0px 50px", "0px 0px", "0px 0px", "0px 40px"], {
          ...CL,
          easing: OUT,
        }),
        scale: interpolate(frame, [inF, inF + 10], [0.94, 1], { ...CL, easing: OUT }),
        filter: dimF !== undefined && frame > dimF ? `saturate(${dim})` : undefined,
      }}
    >
      <Pin x={w / 2} y={-6} />
      {children}
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: courier, fontSize: 44, letterSpacing: 3, color: "#5A4A40", lineHeight: 1.1, textAlign: "center" }}>
    {children}
  </div>
);

const Big: React.FC<{ text: string; f0: number; size?: number; color?: string }> = ({ text, f0, size = 92, color = TINTA }) => {
  const frame = useCurrentFrame();
  if (frame < f0) return null;
  return (
    <div
      style={{
        fontFamily: elite,
        fontSize: size,
        color,
        lineHeight: 0.96,
        textAlign: "center",
        whiteSpace: "pre-line",
        translate: interpolate(frame, [f0, f0 + 6], ["0px 10px", "0px 0px"], { ...CL, easing: OUT }),
      }}
    >
      <Typed text={text} f0={f0} cps={45} />
    </div>
  );
};

const Cards: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {/* Cena 1-2: OUTROS x VOCE */}
      {/* presa desde o quadro 0 (gancho) */}
      <Card x={80} y={1372} w={400} h={236} rot={-2.2} inF={-30} outF={184} dimF={70}>
        <Label>OUTROS PAGAM</Label>
        <div style={{ height: 34 }} />
        <Big text="GRÁFICA" f0={43} size={84} />
      </Card>
      <Card x={500} y={1368} w={500} h={240} rot={1.6} inF={70} outF={184}>
        <Label>VOCÊ</Label>
        <div style={{ position: "relative", height: 170 }}>
          {frame >= 88 && frame < 120 ? (
            <div
              style={{
                fontFamily: marker,
                fontSize: 58,
                color: ROXO,
                textAlign: "center",
                marginTop: 26,
                rotate: "-4deg",
                opacity: interpolate(frame, [88, 94, 116, 120], [0, 1, 1, 0], CL),
              }}
            >
              personaliza
            </div>
          ) : null}
          <Stamp at={120} lines={["CARIMBO"]} size={90} textW={370} rot={-6} style={{ left: 14, top: 22 }} />
        </div>
      </Card>
      <Thread a={[280, 1368]} b={[750, 1362]} f0={72} f1={180} sag={70} />

      {/* Cena 3: logo em qualquer embalagem (ficha entra ~0,2 s antes da palavra-chave) */}
      <Card x={100} w={880} rot={-1} inF={186} outF={284}>
        <Label>VOCÊ MARCA SUA LOGO</Label>
        <div style={{ height: 4 }} />
        <Big text={"QUALQUER\nEMBALAGEM"} f0={192} size={84} />
      </Card>

      {/* Cena 4: a cada entrega, o cliente lembra */}
      {/* sai antes da ficha 5 entrar (antes as duas se sobrepunham em ~12,1-12,3 s) */}
      <Card x={100} w={880} rot={1.2} inF={285} outF={354}>
        <Label>A CADA ENTREGA,</Label>
        <div style={{ height: 44 }} />
        <Big text="LEMBRA DE VOCÊ" f0={291} size={92} color={ROXO} />
      </Card>

      {/* Cena 5: conclusao */}
      <Card x={100} w={880} rot={-1.2} inF={363} outF={386}>
        <Label>FAZ O CLIENTE LEMBRAR</Label>
        <div style={{ height: 44 }} />
        <Big text="DA SUA MARCA" f0={369} size={92} color={ROXO} />
      </Card>

      {/* Cena 6: CTA */}
      <Card x={90} y={1196} w={900} h={420} rot={0.8} inF={392} outF={600}>
        <div style={{ height: 8 }} />
        <Big text="QUER SABER MAIS?" f0={392} size={86} />
        <div style={{ height: 30 }} />
        <CtaTag />
      </Card>
    </>
  );
};

const CtaTag: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 412) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          background: ROXO,
          color: "#fff",
          fontFamily: anton,
          fontSize: 112,
          letterSpacing: 6,
          lineHeight: 1,
          padding: "16px 46px 20px",
          borderRadius: 8,
          boxShadow: "0 8px 0 #4A0088, 0 14px 18px rgba(0,0,0,0.35)",
          rotate: "-2deg",
          // batida de entrada; depois pulsa de leve (0,98-1,02, 1x por segundo) para o fim nao parecer travado
          scale:
            interpolate(frame, [412, 418, 422], [1.5, 0.97, 1], { ...CL, easing: OUT }) *
            (frame > 430 ? 1 + 0.02 * Math.sin(((frame - 430) / 30) * 2 * Math.PI) : 1),
          opacity: interpolate(frame, [412, 415], [0, 1], CL),
        }}
      >
        CLIQUE AQUI
      </div>
      {/* seta feita a mao apontando para o botao do anuncio */}
      <svg
        width={120}
        height={100}
        style={{
          marginTop: 10,
          translate: `0px ${Math.sin((frame - 412) / 4) * 8}px`,
          opacity: interpolate(frame, [418, 424], [0, 1], CL),
        }}
      >
        <path d="M 62 4 C 56 30 66 54 60 84" fill="none" stroke={ROXO} strokeWidth={10} strokeLinecap="round" />
        <path d="M 30 58 L 60 88 L 92 56" fill="none" stroke={ROXO} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const V5: React.FC = () => {
  const frame = useCurrentFrame();
  const hit = (f0: number) => {
    const d = frame - f0;
    if (d < 0 || d > 10) return 0;
    return Math.sin(d * 2.3) * ((10 - d) / 10);
  };
  const shake = hit(1) * 0.8 + hit(120) + hit(386) + hit(412) * 0.6;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1E1008" }}>
      <AbsoluteFill
        style={{
          translate: `${shake * 8}px ${shake * 5}px`,
          scale: interpolate(frame, [0, DUR], [1, 1.015]),
        }}
      >
        <Cork />
        <Header />
        <Polaroid />
        <Mural />
        <CaptionStrip />
        <Cards />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
