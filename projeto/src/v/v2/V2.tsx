import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { COR, TEX } from "../../tridi/theme";
import {
  APRESENTADORA,
  BLOCOS,
  ONOS,
  PAGINA,
  PALAVRAS,
  SPLASH,
  TITULOS,
  type Ono,
  type Titulo,
} from "./data";

const bangers = loadBangers("normal", {
  weights: ["400"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;

const TINTA = "#14051F"; // preto de impressao levemente roxo
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Tratamento de gibi na filmagem: contraste -> posterizacao -> reticula nas sombras -> traco de tinta
const GIBI = "contrast(1.18) saturate(1.45) url(#v2gibi)";
const DOT_TILE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='9' height='9'><circle cx='4.5' cy='4.5' r='2.3' fill='%2314051F'/></svg>";

const FiltroGibi: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="v2gibi" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feComponentTransfer in="SourceGraphic" result="post">
          <feFuncR type="discrete" tableValues="0.04 0.22 0.42 0.62 0.82 1" />
          <feFuncG type="discrete" tableValues="0.02 0.2 0.4 0.6 0.8 1" />
          <feFuncB type="discrete" tableValues="0.08 0.26 0.46 0.66 0.86 1" />
        </feComponentTransfer>
        <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gray" />
        {/* reticula so nas sombras */}
        <feImage href={DOT_TILE} x="0" y="0" width="9" height="9" result="dot" />
        <feTile in="dot" result="dots" />
        <feColorMatrix
          in="gray"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 1.05"
          result="darkA"
        />
        <feComposite in="dots" in2="darkA" operator="in" result="dotsDark" />
        <feBlend in="dotsDark" in2="post" mode="multiply" result="postDots" />
        {/* traco de tinta nas bordas */}
        <feGaussianBlur in="gray" stdDeviation="1.3" result="g2" />
        <feConvolveMatrix
          in="g2"
          order="3"
          kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1"
          preserveAlpha="true"
          result="edge"
        />
        <feComponentTransfer in="edge" result="ink">
          <feFuncR type="discrete" tableValues="1 0.85 0.4 0.05 0 0 0 0 0 0 0 0" />
          <feFuncG type="discrete" tableValues="1 0.85 0.4 0.05 0 0 0 0 0 0 0 0" />
          <feFuncB type="discrete" tableValues="1 0.85 0.4 0.05 0 0 0 0 0 0 0 0" />
        </feComponentTransfer>
        <feBlend in="ink" in2="postDots" mode="multiply" />
      </filter>
    </defs>
  </svg>
);

// ---------- utilidades ----------
const estrela = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  pontas: number,
  dentro: number,
  semente: number,
) => {
  const pts: string[] = [];
  for (let i = 0; i < pontas * 2; i++) {
    const a = (Math.PI * i) / pontas - Math.PI / 2;
    const jit = 1 + 0.12 * Math.sin(i * 12.9898 + semente * 78.233);
    const k = i % 2 === 0 ? jit : dentro;
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return pts.join(" ");
};

const retícula = (cor: string, tam: number, raio = 34) =>
  `radial-gradient(circle at center, ${cor} 0 ${raio}%, transparent ${raio + 2}%)`;

// ---------- fundo da pagina (muda de tom por bloco, como paginas diferentes do gibi) ----------
type Tom = { base: string; raio: string; dot: string; dotOp: number };
const TONS: Record<string, Tom> = {
  gancho: { base: COR.lilas, raio: "#C9AEFF", dot: COR.roxo, dotOp: 0.55 },
  roxo: { base: COR.roxo, raio: "#7400D6", dot: COR.lilas, dotOp: 0.6 },
  pagina: { base: COR.branco, raio: "#F1EAFF", dot: COR.lilas, dotOp: 0.7 },
  final: { base: COR.lilas, raio: "#A378FF", dot: COR.roxo, dotOp: 0.45 },
};
const tomDe = (f: number): Tom => {
  if (f < 70) return TONS.gancho;
  if (f >= PAGINA.de && f < PAGINA.ate) return TONS.pagina;
  if (f >= APRESENTADORA) return TONS.final;
  return TONS.roxo;
};

const Fundo: React.FC = () => {
  const f = useCurrentFrame();
  const t = tomDe(f);
  return (
    <AbsoluteFill style={{ backgroundColor: t.base }}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-conic-gradient(from 0deg at 50% 50%, ${t.raio} 0deg 6deg, ${t.base} 6deg 12deg)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: retícula(t.dot, 26),
          backgroundSize: "26px 26px",
          opacity: t.dotOp,
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 35%, black 85%)",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 35%, black 85%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- janela de recorte do original 720x1280 ----------
// sx/sy = canto da janela no original; esc = escala. A janela nunca desce ate a legenda queimada da cena.
type Geo = { x: number; y: number; w: number; h: number; esc: number; sx: number; sy: number; rot: number };
const BORDA = 10;
const CHEIO: Geo = { x: 80, y: 400, w: 920, h: 1120, esc: 1.25, sx: 0, sy: 0, rot: -1 };
// Pagina de gibi: quadro 1 largo em cima, quadros 2 e 3 lado a lado embaixo
const Q1: Geo = { x: 80, y: 345, w: 920, h: 500, esc: 1.25, sx: 0, sy: 600, rot: -0.8 };
const Q2: Geo = { x: 70, y: 885, w: 450, h: 700, esc: 1.3, sx: 137, sy: 410, rot: 0.8 };
const Q3: Geo = { x: 560, y: 885, w: 440, h: 700, esc: 1.3, sx: 140, sy: 400, rot: -0.8 };

// Recorte por cena no quadro cheio: no copo "Açaí no grau" (legenda CENTAVOS com topo em y~995) desce 95 px
const syCheio = (f: number) => interpolate(f, [45, 51, 69, 70], [0, 95, 95, 0], CL);

const geoDe = (f: number): Geo => {
  if (f >= PAGINA.de && f < PAGINA.p2) return Q1;
  if (f >= PAGINA.p2 && f < PAGINA.p3) return Q2;
  if (f >= PAGINA.p3 && f < PAGINA.ate) return Q3;
  return { ...CHEIO, sy: syCheio(f) };
};

const Moldura: React.FC<{ g: Geo; scale?: number; children: React.ReactNode }> = ({
  g,
  scale = 1,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: g.x,
      top: g.y,
      width: g.w,
      height: g.h,
      boxSizing: "border-box",
      border: `${BORDA}px solid ${TINTA}`,
      boxShadow: `18px 18px 0 ${TINTA}`,
      overflow: "hidden",
      backgroundColor: TINTA,
      transform: `rotate(${g.rot}deg) scale(${scale})`,
    }}
  >
    {children}
  </div>
);

const posMidia = (g: Geo): React.CSSProperties => ({
  position: "absolute",
  left: -g.sx * g.esc,
  top: -g.sy * g.esc,
  width: 720 * g.esc,
  height: 1280 * g.esc,
  filter: GIBI,
});

// sombra de reticula nas bordas do quadro
const SombraBorda: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: retícula(COR.roxo, 16, 36),
      backgroundSize: "16px 16px",
      opacity: 0.45,
      WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 62%, black 100%)",
      maskImage: "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 62%, black 100%)",
    }}
  />
);

// ---------- splash "ÁGIL!" dentro do quadro ----------
const Splash: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inner = CHEIO.w - 2 * BORDA;
  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ backgroundColor: COR.roxo }}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-conic-gradient(from 0deg at 50% 46%, ${COR.lilas} 0deg 5deg, ${COR.roxo} 5deg 14deg)`,
          opacity: 0.7,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: retícula(TINTA, 18, 30),
          backgroundSize: "18px 18px",
          opacity: 0.3,
        }}
      />
      <svg width={inner} height={1100} style={{ position: "absolute", left: 0, top: 0 }}>
        <g
          transform={`translate(450 500) scale(${interpolate(pop, [0, 1], [0.3, 1])}) rotate(${interpolate(pop, [0, 1], [-20, -4])}) translate(-450 -500)`}
        >
          <polygon points={estrela(476, 526, 420, 360, 14, 0.66, 3)} fill={TINTA} />
          <polygon
            points={estrela(450, 500, 420, 360, 14, 0.66, 3)}
            fill={COR.branco}
            stroke={TINTA}
            strokeWidth={12}
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 200 }}>
        <div
          style={{
            fontFamily: bangers,
            fontSize: 290,
            lineHeight: 1,
            color: COR.roxo,
            WebkitTextStroke: `9px ${TINTA}`,
            paintOrder: "stroke fill",
            textShadow: `18px 18px 0 ${TINTA}`,
            transform: `scale(${interpolate(pop, [0, 1], [0.2, 1])}) rotate(-6deg)`,
            letterSpacing: 6,
          }}
        >
          ÁGIL!
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- quadro principal com o video original (muda de lugar na pagina de gibi) ----------
const CONGELA = 484;
const BATIDAS = [
  0, 70, 123, 167, PAGINA.de, PAGINA.p2, PAGINA.p3, PAGINA.ate, 311, 333, 356, APRESENTADORA, 454, 476, CONGELA,
];

const Quadro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = geoDe(frame);
  const ult = BATIDAS.filter((b) => b <= frame).pop() ?? 0;
  const s = spring({ frame: frame - ult, fps, config: { damping: 14, stiffness: 200 } });
  const naPagina = frame >= PAGINA.de && frame < PAGINA.ate;
  const punch = naPagina ? interpolate(s, [0, 1], [0.86, 1]) : 1 + 0.022 * (1 - s);
  const empurra = interpolate(frame, [CONGELA, 536], [1, 1.045], CL);
  return (
    <Moldura g={g} scale={punch}>
      <Video src={staticFile("v/v2/v2.mp4")} style={posMidia(g)} />
      <SombraBorda />
      {/* quadro final congelado: o original escurece para preto em 16,25 s; seguramos o gesto apontando para o CTA com empurrao lento */}
      <Sequence from={CONGELA} layout="absolute-fill">
        <AbsoluteFill style={{ transform: `scale(${empurra})`, transformOrigin: "50% 30%" }}>
          <Img
            src={staticFile("v/v2/freeze.jpg")}
            style={{ position: "absolute", left: 0, top: 0, width: 720 * CHEIO.esc, height: 880 * CHEIO.esc, filter: GIBI }}
          />
        </AbsoluteFill>
        <SombraBorda />
      </Sequence>
      <Sequence from={SPLASH.de} durationInFrames={SPLASH.ate - SPLASH.de} layout="absolute-fill">
        <Splash />
      </Sequence>
    </Moldura>
  );
};

// ---------- pagina de gibi: quadros ja vistos ficam congelados ----------
const QuadroFixo: React.FC<{ g: Geo; src: string }> = ({ g, src }) => (
  <Moldura g={g}>
    <Img src={staticFile(src)} style={posMidia(g)} />
    <SombraBorda />
  </Moldura>
);

// quadro ainda vazio da pagina (reticula lilas), para a pagina ler como gibi desde o primeiro item
const QuadroVazio: React.FC<{ g: Geo }> = ({ g }) => (
  <Moldura g={g}>
    <AbsoluteFill style={{ backgroundColor: "#EFE6FF" }} />
    <AbsoluteFill
      style={{
        backgroundImage: retícula(COR.lilas, 20, 30),
        backgroundSize: "20px 20px",
      }}
    />
  </Moldura>
);

const Pagina: React.FC = () => {
  const f = useCurrentFrame();
  if (f < PAGINA.de || f >= PAGINA.ate) return null;
  return (
    <>
      {f >= PAGINA.p2 ? <QuadroFixo g={Q1} src="v/v2/caixa_f.jpg" /> : null}
      {f >= PAGINA.p3 ? <QuadroFixo g={Q2} src="v/v2/sacola_f.jpg" /> : <QuadroVazio g={Q2} />}
      <QuadroVazio g={Q3} />
    </>
  );
};

// ---------- caixas de texto do gibi ----------
const Check: React.FC<{ local: number; tam?: number }> = ({ local, tam = 86 }) => {
  const d = interpolate(local, [3, 11], [1, 0], CL);
  return (
    <svg width={tam} height={tam} viewBox="0 0 86 86" style={{ marginRight: 16, flexShrink: 0 }}>
      <rect x={5} y={5} width={76} height={76} rx={8} fill={COR.lilas} stroke={TINTA} strokeWidth={7} />
      <path
        d="M20 44 L36 60 L68 24"
        fill="none"
        stroke={COR.roxo}
        strokeWidth={13}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={d}
      />
    </svg>
  );
};

const caixaGibi: React.CSSProperties = {
  position: "absolute",
  backgroundColor: COR.branco,
  border: `8px solid ${TINTA}`,
  boxShadow: `12px 12px 0 ${TINTA}`,
  display: "flex",
};

const TituloBox: React.FC<{ t: Titulo }> = ({ t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ini = Math.round(t.de * fps);
  const fim = Math.round(t.ate * fps);
  if (frame < ini || frame > fim) return null;
  const local = frame - ini;
  // gancho ja nasce grande no quadro 0 (so um "tremor" de impacto); os outros entram com mola
  const ent = t.pre ? 1 : spring({ frame: local, fps, config: { damping: 11, stiffness: 190 } });
  const tremor = t.pre ? [0, 1.6, -1.2, 0.8, 0][Math.min(4, Math.floor(local / 2))] : 0;
  const sai = interpolate(frame, [fim - 4, fim], [1, 0], CL);
  return (
    <div
      style={{
        ...caixaGibi,
        left: 56,
        top: t.pre ? 292 : 300,
        transformOrigin: "left center",
        transform: `translate(${tremor * 4}px, ${-tremor * 3}px) scale(${interpolate(ent, [0, 1], [0.45, 1]) * (0.85 + 0.15 * sai)}) rotate(${interpolate(ent, [0, 1], [-12, -3])}deg)`,
        opacity: Math.min(1, ent * 2) * sai,
        padding: t.pre ? "8px 30px 0px" : "8px 30px 2px",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {t.pre ? (
        <div style={{ fontFamily: bangers, fontSize: 68, lineHeight: 1, color: TINTA, letterSpacing: 3 }}>
          {t.pre}
        </div>
      ) : null}
      <div style={{ display: "flex", alignItems: "center" }}>
        {t.check ? <Check local={local} /> : null}
        <div
          style={{
            fontFamily: bangers,
            fontSize: t.pre ? 150 : 96,
            lineHeight: 1.02,
            color: COR.roxo,
            letterSpacing: 3,
            whiteSpace: "nowrap",
            textShadow: t.pre ? `5px 5px 0 ${TINTA}` : undefined,
          }}
        >
          {t.t}
        </div>
      </div>
    </div>
  );
};

// rotulos da pagina (a propria fala "Serve em caixa, sacola, papel kraft" vira a pagina; legenda some)
const Rotulo: React.FC<{
  de: number;
  linhas: string[];
  left?: number;
  right?: number;
  top: number;
  rot: number;
  check?: boolean;
  tam?: number;
  cor?: string;
}> = ({ de, linhas, left, right, top, rot, check = true, tam = 88, cor = COR.roxo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < de || f >= PAGINA.ate) return null;
  const local = f - de;
  const ent = spring({ frame: local, fps, config: { damping: 11, stiffness: 200 } });
  return (
    <div
      style={{
        ...caixaGibi,
        left,
        right,
        top,
        alignItems: "center",
        padding: "6px 24px 0px 16px",
        transform: `scale(${interpolate(ent, [0, 1], [0.5, 1])}) rotate(${rot}deg)`,
        opacity: Math.min(1, ent * 2),
      }}
    >
      {check ? <Check local={local} /> : null}
      <div style={{ fontFamily: bangers, fontSize: tam, lineHeight: 0.98, color: cor, letterSpacing: 3 }}>
        {linhas.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
  );
};

const RotulosPagina: React.FC = () => (
  <>
    <Rotulo de={PAGINA.de} linhas={["SERVE EM:"]} left={56} top={290} rot={-3} check={false} tam={72} cor={TINTA} />
    <Rotulo de={219} linhas={["CAIXA"]} right={56} top={292} rot={2.5} />
    <Rotulo de={PAGINA.p2} linhas={["SACOLA"]} left={44} top={842} rot={-2.5} />
    <Rotulo de={PAGINA.p3} linhas={["PAPEL", "KRAFT"]} right={44} top={842} rot={2.5} />
  </>
);

// ---------- onomatopeias nos contatos do carimbo ----------
const Onomatopeia: React.FC<{ o: Ono }> = ({ o }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gancho = o.f === 0;
  const pop = gancho ? 1 : spring({ frame: f, fps, config: { damping: 8, stiffness: 240 } });
  const batida = gancho ? interpolate(f, [0, 3, 7], [1.18, 0.96, 1], CL) : 1;
  const sai = interpolate(f, [o.dur - 5, o.dur], [1, 0], CL);
  const w = o.w;
  const h = w * 0.74;
  return (
    <div
      style={{
        position: "absolute",
        left: o.x - w / 2,
        top: o.y - h / 2,
        width: w,
        height: h,
        transform: `scale(${interpolate(pop, [0, 1], [0.2, 1]) * batida}) rotate(${o.rot}deg)`,
        opacity: sai,
      }}
    >
      <svg width={w} height={h} viewBox="0 0 340 252" style={{ position: "absolute" }}>
        <polygon points={estrela(180, 134, 160, 116, 11, 0.62, 7 + o.f)} fill={TINTA} />
        <polygon
          points={estrela(170, 124, 160, 116, 11, 0.62, 7 + o.f)}
          fill={COR.roxo}
          stroke={TINTA}
          strokeWidth={8}
          strokeLinejoin="round"
        />
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: bangers,
            fontSize: w * 0.33,
            color: COR.branco,
            WebkitTextStroke: `${Math.round(w / 90)}px ${TINTA}`,
            paintOrder: "stroke fill",
            textShadow: `${Math.round(w / 45)}px ${Math.round(w / 45)}px 0 ${TINTA}`,
            letterSpacing: 4,
            marginTop: -w * 0.02,
          }}
        >
          {o.t}
        </div>
      </AbsoluteFill>
    </div>
  );
};

// ---------- legendas (narracao no b-roll, balao de fala na apresentadora) ----------
const Legenda: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = BLOCOS.findIndex((b, i) => {
    const ini = PALAVRAS[b.de].s - 0.06;
    const prox = BLOCOS[i + 1];
    const fim = prox ? PALAVRAS[prox.de].s - 0.06 : 17.45;
    return t >= ini && t < fim;
  });
  if (idx < 0) return null;
  const b = BLOCOS[idx];
  if (b.tipo === "oculto") return null;
  // so o primeiro bloco de uma sequencia do mesmo tipo entra com opacidade; nas trocas o balao fica opaco e so o texto muda
  const continua = idx > 0 && BLOCOS[idx - 1].tipo === b.tipo;
  const iniF = Math.round((PALAVRAS[b.de].s - 0.06) * fps);
  const ent = spring({ frame: frame - iniF, fps, config: { damping: 13, stiffness: 210 } });
  const op = continua ? 1 : Math.min(1, ent * 2);
  const palavras = PALAVRAS.slice(b.de, b.ate + 1);

  const texto = (
    <>
      {palavras.map((p, i) => {
        const prox = palavras[i + 1];
        const ativa = t >= p.s - 0.04 && (prox ? t < prox.s - 0.04 : t < p.e + 0.4);
        const dita = t >= p.s - 0.04;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 2px",
              padding: "0 7px",
              backgroundColor: ativa ? COR.roxo : "transparent",
              color: ativa ? COR.branco : TINTA,
              opacity: dita ? 1 : 0.45,
              transform: `rotate(${ativa ? -2 : 0}deg) scale(${ativa ? 1.06 : 1})`,
            }}
          >
            {p.w.toUpperCase()}
          </span>
        );
      })}
    </>
  );

  if (b.tipo === "narracao") {
    return (
      <AbsoluteFill style={{ alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            bottom: 300,
            maxWidth: 860,
            backgroundColor: COR.lilas,
            border: `7px solid ${TINTA}`,
            boxShadow: `10px 10px 0 ${TINTA}`,
            padding: "10px 18px 6px",
            textAlign: "center",
            fontFamily: bangers,
            fontSize: 70,
            lineHeight: 1.12,
            letterSpacing: 2,
            transform: `rotate(1deg) scale(${interpolate(ent, [0, 1], [continua ? 0.95 : 0.85, 1])})`,
            opacity: op,
          }}
        >
          {texto}
        </div>
      </AbsoluteFill>
    );
  }

  // balao de fala no topo (dentro do 4:5), rabicho apontando para a cabeca da apresentadora
  const escB = continua ? 1 : interpolate(ent, [0, 1], [0.7, 1]);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: op }}>
        <polygon points="560,462 680,462 512,598" fill={COR.branco} stroke={TINTA} strokeWidth={7} strokeLinejoin="round" />
      </svg>
      <AbsoluteFill style={{ alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            top: 294,
            width: 900,
            minHeight: 200,
            boxSizing: "border-box",
            backgroundColor: COR.branco,
            border: `7px solid ${TINTA}`,
            borderRadius: "50%",
            boxShadow: `10px 10px 0 ${TINTA}`,
            padding: "34px 80px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            textAlign: "center",
            fontFamily: bangers,
            fontSize: 68,
            lineHeight: 1.1,
            letterSpacing: 2,
            transformOrigin: "50% 100%",
            transform: `scale(${escB})`,
            opacity: op,
          }}
        >
          <div>{texto}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- CTA: estouro "CLIQUE AQUI!" ----------
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 200 } });
  const pulso = 1 + 0.035 * Math.max(0, Math.sin((f - 12) / 5));
  // tremor em ritmo de quadrinho (troca de pose a cada 4 quadros) depois que o estouro assenta
  const tremor = f > 14 ? [0, 1.4, -1, 0.7][Math.floor(f / 4) % 4] : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        top: 1360,
        width: 800,
        height: 270,
        transform: `scale(${0.92 * interpolate(pop, [0, 1], [0.2, 1]) * (f > 12 ? pulso : 1)}) rotate(${-4 + tremor}deg)`,
      }}
    >
      <svg width={800} height={270} style={{ position: "absolute" }}>
        <polygon points={estrela(414, 144, 390, 128, 16, 0.74, 11)} fill={TINTA} />
        <polygon
          points={estrela(400, 130, 390, 128, 16, 0.74, 11)}
          fill={COR.branco}
          stroke={TINTA}
          strokeWidth={9}
          strokeLinejoin="round"
        />
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: bangers,
            fontSize: 108,
            color: COR.roxo,
            WebkitTextStroke: `4px ${TINTA}`,
            paintOrder: "stroke fill",
            textShadow: `8px 8px 0 ${TINTA}`,
            letterSpacing: 4,
            marginTop: -6,
          }}
        >
          CLIQUE AQUI!
        </div>
      </AbsoluteFill>
    </div>
  );
};

export const V2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COR.roxo }}>
      <FiltroGibi />
      <Fundo />
      <Pagina />
      <Quadro />
      <RotulosPagina />
      {ONOS.map((o) => (
        <Sequence key={o.f} from={o.f} durationInFrames={o.dur} layout="absolute-fill">
          <Onomatopeia o={o} />
        </Sequence>
      ))}
      {TITULOS.map((t, i) => (
        <TituloBox key={i} t={t} />
      ))}
      <Legenda />
      <Sequence from={476} layout="absolute-fill">
        <Cta />
      </Sequence>
      {/* grao de papel jornal por cima de tudo */}
      <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.1, pointerEvents: "none" }}>
        <Img src={TEX.grao} style={{ width: 1080, height: 1920, objectFit: "cover" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
