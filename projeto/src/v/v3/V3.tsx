// v3 · Carimbos Tridi · estilo FCA 30 "Revista editorial" + visual V4 Editorial.
// Pagina de revista em papel creme: cabecalho (masthead), manchete serifada,
// foto recortada com fio fino, coluna de indice, olho (pull quote) e
// carimbo de tinta roxa como "selo" da materia. Legenda nova sincronizada
// pela fala real (faster_whisper small pt, words.json).
// A legenda original queimada fica em y~1095-1160 do quadro 720x1280:
// a foto NUNCA mostra a origem abaixo de y=1060 (clamp em Photo).
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
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadMono } from "@remotion/google-fonts/DMMono";
import WORDS from "./words.json";

const playfair = loadPlayfair("normal", {
  weights: ["700", "900"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
loadPlayfair("italic", { weights: ["700", "900"], subsets: ["latin", "latin-ext"] });
const oswald = loadOswald("normal", {
  weights: ["700"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
const mono = loadMono("normal", {
  weights: ["500"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;

// Padrao visual (separado dos dados da oferta)
const COR = {
  papel: "#F2EDE3",
  tinta: "#1E1A17",
  roxo: "#8B00FF",
  lilas: "#B48CFF",
  fio: "#1E1A17",
};
const EO = Easing.bezier(0.16, 1, 0.3, 1);
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const SRC_W = 720;
const SRC_MAX_Y = 1060; // abaixo disso aparece a legenda queimada

type Word = { w: string; s: number; e: number };
const words = WORDS as Word[];

// ---------- helpers de movimento (so frame + interpolate) ----------
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const enter = (f: number, a: number, dur = 10) =>
  interpolate(f, [a, a + dur], [0, 1], { ...clamp, easing: EO });
const leave = (f: number, b: number, dur = 6) =>
  interpolate(f, [b - dur, b], [1, 0], { ...clamp, easing: IO });

const Rise: React.FC<{
  a: number;
  b?: number;
  dist?: number;
  out?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ a, b = 99999, dist = 30, out = 6, style, children }) => {
  const f = useCurrentFrame();
  const p = enter(f, a);
  const o = Math.min(p, leave(f, b, out));
  return (
    <div
      style={{
        position: "absolute",
        opacity: o,
        transform: `translateY(${(1 - p) * dist}px) scale(${0.97 + 0.03 * p})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------- Papel (fundo + grao) ----------
// Texturas como <Img> em mosaico (Img segura o render ate carregar; CSS
// background-image pode sair vazio no primeiro quadro).
const Mosaico: React.FC<{ src: string; tile: number; style?: React.CSSProperties }> = ({
  src,
  tile,
  style,
}) => {
  const cols = Math.ceil(1080 / tile);
  const rows = Math.ceil(1920 / tile);
  const cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      cells.push(
        <Img
          key={`${r}-${c}`}
          src={src}
          style={{ position: "absolute", left: c * tile, top: r * tile, width: tile, height: tile }}
        />,
      );
  return <AbsoluteFill style={style}>{cells}</AbsoluteFill>;
};

const Papel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COR.papel }}>
    <Mosaico
      src={staticFile("v/v3/papel_fundo_tile_1024.png")}
      tile={1024}
      style={{ mixBlendMode: "multiply", opacity: 0.55 }}
    />
  </AbsoluteFill>
);

const Grao: React.FC = () => (
  <Mosaico
    src={staticFile("v/v3/grao_tile_512.png")}
    tile={512}
    style={{ mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }}
  />
);

// pre-carrega a mascara de tinta do carimbo (usada via CSS mask)
const Preload: React.FC = () => (
  <Img
    src={staticFile("v/v3/tinta_mascara_tile_1024.png")}
    style={{ position: "absolute", width: 4, height: 4, opacity: 0 }}
  />
);

// ---------- Cabecalho da revista ----------
const Masthead: React.FC = () => {
  const f = useCurrentFrame();
  const p = enter(f, -8, 8);
  return (
    <div style={{ position: "absolute", left: 70, top: 118, width: 940, opacity: p }}>
      <div style={{ height: 4, background: COR.fio }} />
      <div style={{ height: 2, background: COR.fio, marginTop: 4 }} />
      <div
        style={{
          fontFamily: playfair,
          fontWeight: 900,
          fontSize: 118,
          lineHeight: 1.08,
          letterSpacing: "0.06em",
          color: COR.roxo,
          textAlign: "center",
          marginTop: 2,
        }}
      >
        TRIDI
      </div>
      <div style={{ height: 2, background: COR.fio, marginTop: 2 }} />
      <div style={{ height: 4, background: COR.fio, marginTop: 4 }} />
    </div>
  );
};

// ---------- Foto recortada (unico <Video>, leva o audio original) ----------
type Lay = { x: number; y: number; w: number; h: number; s: number; cy: number; kb: number };
// Grade unica da revista: manchete no topo (y 300-560), foto ate y 1450,
// legenda em y 1474-1632, rodape (folio) abaixo. Todas as fotos terminam
// em 1450, entao a troca de pagina nunca cobre a manchete.
const LAYS: Lay[] = [
  { x: 70, y: 606, w: 940, h: 844, s: 1.306, cy: 560, kb: 1.06 }, // capa
  { x: 70, y: 560, w: 560, h: 890, s: 0.86, cy: 540, kb: 1.05 }, // materia + indice
  { x: 70, y: 576, w: 940, h: 874, s: 1.306, cy: 712, kb: 1.06 }, // destaque + olho
  { x: 70, y: 616, w: 940, h: 834, s: 1.306, cy: 492, kb: 1.04 }, // entrevista
];
const STARTS = [0, 176, 407, 556];
const ENDS = [176, 407, 556, 701];
const SECOES = ["Capa", "Matéria", "Destaque", "Fechamento"];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const layAt = (i: number, f: number): Lay => {
  const L = LAYS[i];
  // capa: push-in mais firme nos 3 s do gancho, depois segue lento
  const k =
    i === 0
      ? interpolate(f, [0, 90, ENDS[0]], [1, 1.04, L.kb], clamp)
      : interpolate(f, [STARTS[i], ENDS[i]], [1, L.kb], clamp);
  return { ...L, s: L.s * k };
};

const Photo: React.FC = () => {
  const f = useCurrentFrame();
  let i = 0;
  for (let j = 0; j < STARTS.length; j++) if (f >= STARTS[j]) i = j;
  let g = layAt(i, f);
  if (i > 0) {
    const t = interpolate(f, [STARTS[i], STARTS[i] + 10], [0, 1], { ...clamp, easing: IO });
    const prev = layAt(i - 1, STARTS[i]);
    g = {
      x: lerp(prev.x, g.x, t),
      y: lerp(prev.y, g.y, t),
      w: lerp(prev.w, g.w, t),
      h: lerp(prev.h, g.h, t),
      s: lerp(prev.s, g.s, t),
      cy: lerp(prev.cy, g.cy, t),
      kb: 1,
    };
  }
  const s = Math.max(g.s, g.w / SRC_W);
  const visH = g.h / s;
  const sy = Math.max(0, Math.min(g.cy - visH / 2, SRC_MAX_Y - visH));
  const sx = (SRC_W - g.w / s) / 2;
  // o original escurece para preto a partir do quadro 670: congelamos o
  // ultimo quadro com luz (668) para a pagina nao fechar com foto preta
  const congela = f >= 669;
  const mediaStyle: React.CSSProperties = {
    position: "absolute",
    left: -sx * s,
    top: -sy * s,
    width: SRC_W * s,
    height: 1280 * s,
  };
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: g.x + 10,
          top: g.y + 14,
          width: g.w,
          height: g.h,
          background: "rgba(30,26,23,0.16)",
          filter: "blur(14px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: g.x,
          top: g.y,
          width: g.w,
          height: g.h,
          overflow: "hidden",
          background: COR.tinta,
        }}
      >
        <Video src={staticFile("v/v3/v3.mp4")} objectFit="fill" style={mediaStyle} />
        {congela ? <Img src={staticFile("v/v3/fim.jpg")} style={mediaStyle} /> : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: g.x - 3,
          top: g.y - 3,
          width: g.w + 6,
          height: g.h + 6,
          border: `3px solid ${COR.fio}`,
          boxSizing: "border-box",
        }}
      />
    </>
  );
};

// ---------- Carimbo de tinta roxa (o proprio produto como selo) ----------
const Carimbo: React.FC<{
  a: number;
  b: number;
  x: number;
  y: number;
  rot: number;
  lines: string[];
  size?: number;
}> = ({ a, b, x, y, rot, lines, size = 62 }) => {
  const f = useCurrentFrame();
  if (f < a || f >= b) return null;
  const sc = interpolate(f, [a, a + 5], [1.55, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const o = Math.min(interpolate(f, [a, a + 3], [0, 0.93], clamp), leave(f, b, 5));
  const tinta = staticFile("v/v3/tinta_mascara_tile_1024.png");
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${sc})`,
        opacity: o,
      }}
    >
      <div
        style={{
          border: `12px double ${COR.roxo}`,
          padding: "14px 30px 10px",
          background: "rgba(242,237,227,0.55)",
          textAlign: "center",
          WebkitMaskImage: `url(${tinta})`,
          maskImage: `url(${tinta})`,
          WebkitMaskSize: "700px 700px",
          maskSize: "700px 700px",
        }}
      >
        {lines.map((l, k) => (
          <div
            key={k}
            style={{
              fontFamily: oswald,
              fontWeight: 700,
              fontSize: k === 0 ? size * 0.78 : size,
              lineHeight: 1.08,
              letterSpacing: "0.07em",
              color: COR.roxo,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- tipografia ----------
const kicker: React.CSSProperties = {
  fontFamily: mono,
  fontWeight: 500,
  fontSize: 44,
  letterSpacing: "0.04em",
  color: COR.roxo,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};
const manchete = (size: number, italic = false, cor = COR.tinta): React.CSSProperties => ({
  fontFamily: playfair,
  fontWeight: 900,
  fontStyle: italic ? "italic" : "normal",
  fontSize: size,
  lineHeight: 1.02,
  color: cor,
  whiteSpace: "nowrap",
});

const Sublinha: React.FC<{ a: number; w: number }> = ({ a, w }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        height: 10,
        width: w,
        background: COR.lilas,
        transformOrigin: "left center",
        transform: `scaleX(${enter(f, a, 12)})`,
        marginTop: 2,
      }}
    />
  );
};

// ---------- Cena 1 · CAPA (0-176) ----------
// gancho: a pergunta inteira ja esta na pagina no quadro 0
const Capa: React.FC = () => (
  <>
    <Rise a={-12} b={176} out={4} style={{ left: 70, top: 300, ...kicker }}>
      Capa · Embalagem
    </Rise>
    <Rise a={-11} b={176} out={4} style={{ left: 66, top: 362, ...manchete(112) }}>
      Ainda parece
    </Rise>
    <Rise a={-10} b={176} out={4} style={{ left: 66, top: 476 }}>
      <div style={manchete(112, true, COR.roxo)}>comum?</div>
    </Rise>
    {/* selo inteiro dentro da foto (borda direita da foto = 1010) */}
    <Carimbo a={121} b={176} x={630} y={1296} rot={-7} lines={["Carimbo", "Personalizado"]} />
  </>
);

// ---------- Cena 2 · MATERIA + INDICE (176-407) ----------
const ITENS = [
  { n: "01", t: "Embalagem", a: 272 },
  { n: "02", t: "Sacolas", a: 303 },
  { n: "03", t: "Copos", a: 333 },
];
const Materia: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Rise a={176} b={407} out={3} style={{ left: 66, top: 306, ...manchete(104) }}>
        Muda isso
      </Rise>
      <Rise a={199} b={407} out={3} style={{ left: 66, top: 412 }}>
        <div style={manchete(104, true, COR.roxo)}>em segundos.</div>
      </Rise>
      {/* fio vertical de coluna */}
      <div
        style={{
          position: "absolute",
          left: 652,
          top: 560,
          width: 2,
          height: 890 * enter(f, 186, 16),
          background: COR.fio,
          opacity: leave(f, 407, 3),
        }}
      />
      <Rise a={236} b={407} out={3} dist={18} style={{ left: 674, top: 572, ...kicker }}>
        Sua marca em
      </Rise>
      {/* indice: numeros grandes dominam a coluna (contraste focal do estilo) */}
      {ITENS.map((it, k) => (
        <Rise key={it.n} a={it.a} b={407} out={3} dist={22} style={{ left: 674, top: 650 + k * 236, width: 336 }}>
          <div style={{ height: 2, background: COR.fio, marginBottom: 12 }} />
          <div
            style={{
              fontFamily: oswald,
              fontWeight: 700,
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: "0.02em",
              color: COR.roxo,
            }}
          >
            {it.n}
          </div>
          <div style={{ ...manchete(56), marginTop: 2 }}>{it.t}</div>
        </Rise>
      ))}
    </>
  );
};

// ---------- Cena 3 · OLHO (407-556) ----------
const Olho: React.FC = () => (
  <>
    {/* manchete no mesmo lugar da anterior: troca direta, sem pagina vazia */}
    <Rise a={407} b={478} out={4} style={{ left: 66, top: 300, ...manchete(128) }}>
      Identidade
    </Rise>
    <Rise a={436} b={478} out={4} style={{ left: 70, top: 440 }}>
      <div style={manchete(80, true, COR.roxo)}>&amp; profissionalismo.</div>
      <Sublinha a={445} w={790} />
    </Rise>
    <Rise a={478} b={556} out={3} style={{ left: 56, top: 250, ...manchete(220, false, COR.roxo), lineHeight: 1 }}>
      “
    </Rise>
    <Rise a={479} b={556} out={3} style={{ left: 172, top: 318 }}>
      <div style={{ ...manchete(84, true), fontWeight: 700, lineHeight: 1.12 }}>Seu cliente percebe</div>
      <div style={{ ...manchete(84, true), fontWeight: 700, lineHeight: 1.12 }}>esses detalhes.</div>
      <div style={{ height: 3, width: 160, background: COR.roxo, marginTop: 18 }} />
    </Rise>
  </>
);

// ---------- Cena 4 · ENTREVISTA / FECHO (556-701) ----------
const LINHAS = [
  { t: "rápido", a: 556 },
  { t: "econômico", a: 587 },
  { t: "profissional", a: 638 },
];
const Fecho: React.FC = () => (
  <>
    {LINHAS.map((l, k) => (
      <Rise key={l.t} a={l.a} dist={22} style={{ left: 70, top: 300 + k * 98, width: 940 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26, height: 94 }}>
          <span
            style={{
              fontFamily: oswald,
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 1.2,
              color: COR.roxo,
              letterSpacing: "0.04em",
            }}
          >
            MAIS
          </span>
          <span style={{ ...manchete(80, true), lineHeight: 1.2 }}>{l.t}</span>
        </div>
        <div style={{ height: 2, background: COR.fio, opacity: 0.85 }} />
      </Rise>
    ))}
    {/* selo inteiro dentro da foto, canto superior direito (parede vazia) */}
    <Carimbo a={667} b={760} x={790} y={770} rot={6} lines={["Carimbos", "Tridi"]} size={70} />
  </>
);

// ---------- Rodape (folio) + vinheta escura do papel ----------
// A secao troca no primeiro quadro de cada pagina: a pagina sempre tem
// texto editorial, mesmo durante a troca de foto. Fica fora do 4:5
// (decorativo, nada essencial).
const Folio: React.FC = () => {
  const f = useCurrentFrame();
  let i = 0;
  for (let j = 0; j < STARTS.length; j++) if (f >= STARTS[j]) i = j;
  const txt: React.CSSProperties = {
    fontFamily: mono,
    fontWeight: 500,
    fontSize: 32,
    letterSpacing: "0.05em",
    color: COR.tinta,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };
  return (
    <div style={{ position: "absolute", left: 70, top: 1652, width: 940 }}>
      <div style={{ height: 2, background: COR.fio }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <span style={txt}>Tridi · Carimbos</span>
        <span style={{ ...txt, color: COR.roxo }}>
          {SECOES[i]} — P. 0{i + 1}
        </span>
      </div>
    </div>
  );
};

const Vinheta: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 240,
        background: "linear-gradient(to bottom, rgba(24,20,18,0.62) 0%, rgba(24,20,18,0.22) 45%, rgba(24,20,18,0) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 1600,
        width: 1080,
        height: 320,
        background: "linear-gradient(to top, rgba(24,20,18,0.7) 0%, rgba(24,20,18,0.25) 50%, rgba(24,20,18,0) 100%)",
      }}
    />
  </AbsoluteFill>
);

// ---------- Legenda (fala real) ----------
const GRUPOS = [0, 5, 11, 14, 18, 23, 27, 33, 36, 41, 45, words.length];
// grupos cujo texto ja esta na manchete da pagina: legenda recua (menor,
// mais clara) para nao competir com o titulo; o audio continua igual
const ECO = new Set([3, 7, 8, 9, 10]);
const Legenda: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  let g = -1;
  for (let k = 0; k < GRUPOS.length - 1; k++) {
    const ini = words[GRUPOS[k]].s - 0.08;
    const fim =
      k + 1 < GRUPOS.length - 1 ? words[GRUPOS[k + 1]].s - 0.08 : words[words.length - 1].e + 0.7;
    if (t >= ini && t < fim) g = k;
  }
  if (g < 0) return null;
  const a = Math.round((words[GRUPOS[g]].s - 0.08) * fps);
  const p = enter(f, a, 5);
  const ws = words.slice(GRUPOS[g], GRUPOS[g + 1]);
  let ativo = -1;
  ws.forEach((w, k) => {
    if (t >= w.s - 0.04) ativo = k;
  });
  const eco = ECO.has(g);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        width: 920,
        top: 1474,
        height: 158,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: p * (eco ? 0.62 : 1),
        transform: `translateY(${(1 - p) * 12}px)`,
      }}
    >
      <div
        style={{
          fontFamily: playfair,
          fontWeight: 700,
          fontSize: eco ? 52 : 66,
          lineHeight: 1.16,
          color: COR.tinta,
          textAlign: "center",
        }}
      >
        {ws.map((w, k) => {
          const on = k === ativo;
          const wa = Math.round((w.s - 0.04) * fps);
          return (
            <span key={k} style={{ position: "relative", display: "inline-block", margin: "0 0.13em" }}>
              {on ? (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 4,
                    height: 7,
                    background: COR.lilas,
                    transformOrigin: "left center",
                    transform: `scaleX(${enter(f, wa, 6)})`,
                  }}
                />
              ) : null}
              <span style={{ position: "relative", color: on ? COR.roxo : COR.tinta }}>{w.w}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const V3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COR.papel }}>
    <Papel />
    <Vinheta />
    <Preload />
    <Masthead />
    <Photo />
    <Capa />
    <Materia />
    <Olho />
    <Fecho />
    <Legenda />
    <Folio />
    <Grao />
  </AbsoluteFill>
);

