import React, { useId } from "react";
import { BORDA_RECORTE, COR, RISO_TABLE, TEX } from "./theme";
import { LogoDoceDaLu } from "./LogoDoceDaLu";
import { useAssetsLoaded } from "./useAssetsLoaded";

/**
 * Sacola kraft protagonista ("A Sacola Lisa"), recorte de papel com borda branca.
 * Componente PURO: nao le o frame. Quem anima (queda, squash, inclinacao, olhar,
 * piscar, carimbada) e o componente pai, passando os valores por props.
 *
 * Quadro interno: viewBox 600x780. A base da sacola fica em y=722 (para apoiar no balcao).
 */
export type Modo = "kraft" | "cinza" | "riso";
export type Expressao = "neutra" | "cima" | "triste" | "surpresa" | "feliz" | "seria";

export type SacolaProps = {
  /** largura em px na tela (altura = largura * 1.3) */
  largura?: number;
  /** mundo: kraft natural, cinza (sem marca, retícula) ou riso (roxo/lilás) */
  modo?: Modo;
  /** direcao do olhar, -1..1 em cada eixo (y negativo = para cima) */
  olharX?: number;
  olharY?: number;
  /** 0 = aberto, 1 = fechado */
  piscar?: number;
  expressao?: Expressao;
  /** mostra a marca carimbada */
  carimbada?: boolean;
  /** 0..1: entrada da tinta no TUM (opacidade + leve espalhamento) */
  tinta?: number;
  /** cor da tinta do logo (padrão: roxo Tridi) */
  corTinta?: string;
  /** desliga filtros caros (use nas sacolas de fundo da cascata) */
  simples?: boolean;
  /** sombra de contato no chão */
  sombraChao?: boolean;
  /** some com os olhos (sacolas figurantes) */
  semOlhos?: boolean;
  style?: React.CSSProperties;
};

// ---------- geometria (viewBox 600x780) ----------
// olhos no quarto de cima da face; logo grande (60% da largura) no meio-baixo, folga >= 110 (viewBox)
export const OLHO_Y = 305;
export const LOGO_C = { x: 250, y: 566, s: 1.1 };
const FRONT = "M66 205 L434 205 L430 722 L70 722 Z";
const GUSSET = "M434 205 L478 223 L522 174 L517 707 L430 722 Z";
const OPENING = "M66 205 L102 168 L522 174 L478 223 L434 205 Z";
const SILHOUETTE = "M66 205 L102 168 L522 174 L517 707 L430 722 L70 722 Z";

type P = [number, number];
const bez = (p0: P, p1: P, p2: P, p3: P, t: number): P => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
const bezD = (p0: P, p1: P, p2: P, p3: P, t: number): P => {
  const u = 1 - t;
  return [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
};

type Alca = { p: [P, P, P, P]; w: number };
const ALCA_TRAS: Alca = { p: [[206, 222], [196, 34], [398, 34], [388, 222]], w: 14 };
const ALCA_FRENTE: Alca = { p: [[158, 262], [146, 76], [352, 76], [342, 262]], w: 15 };
const alcaPath = (a: Alca) =>
  `M${a.p[0][0]} ${a.p[0][1]} C${a.p[1][0]} ${a.p[1][1]} ${a.p[2][0]} ${a.p[2][1]} ${a.p[3][0]} ${a.p[3][1]}`;

// cordao de papel torcido: sulcos diagonais ao longo da curva
const Torcao: React.FC<{ a: Alca; escuro: string; claro: string }> = ({ a, escuro, claro }) => {
  const n = 46;
  const els: React.ReactNode[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const [x, y] = bez(...a.p, t);
    const [dx, dy] = bezD(...a.p, t);
    const len = Math.hypot(dx, dy) || 1;
    const tx = dx / len;
    const ty = dy / len;
    const nx = -ty;
    const ny = tx;
    const h = a.w * 0.5;
    // sulco inclinado ~35 graus em relacao a normal
    const k = 0.7;
    const x1 = x + nx * h - tx * h * k;
    const y1 = y + ny * h - ty * h * k;
    const x2 = x - nx * h + tx * h * k;
    const y2 = y - ny * h + ty * h * k;
    els.push(<line key={`d${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={escuro} strokeWidth={1.6} strokeLinecap="round" />);
    els.push(
      <line key={`c${i}`} x1={x1 + tx * 2.2} y1={y1 + ty * 2.2} x2={x2 + tx * 2.2} y2={y2 + ty * 2.2} stroke={claro} strokeWidth={1.1} strokeLinecap="round" />,
    );
  }
  return <g>{els}</g>;
};

const Olho: React.FC<{
  cx: number; cy: number; ox: number; oy: number; piscar: number; expressao: Expressao; cor: string; lado: -1 | 1;
}> = ({ cx, cy, ox, oy, piscar, expressao, cor, lado }) => {
  const rx = 31;
  const ry = 38;
  const sw = 7;
  if (expressao === "feliz") {
    return (
      <path d={`M${cx - rx} ${cy + 6} Q${cx} ${cy - 30} ${cx + rx} ${cy + 6}`} fill="none" stroke={cor} strokeWidth={sw + 1} strokeLinecap="round" />
    );
  }
  const sy = Math.max(0.06, 1 - piscar);
  const px = cx + ox * 12;
  const py = cy + oy * 15;
  // palpebra para expressoes (corta a parte de cima do olho)
  let palpebra: React.ReactNode = null;
  if (expressao === "triste") {
    palpebra = <path d={`M${cx - rx - 4} ${cy - 18 + lado * -8} L${cx + rx + 4} ${cy - 18 + lado * 8}`} stroke={cor} strokeWidth={sw} strokeLinecap="round" />;
  } else if (expressao === "seria") {
    palpebra = <path d={`M${cx - rx - 2} ${cy - 10} L${cx + rx + 2} ${cy - 10}`} stroke={cor} strokeWidth={sw} strokeLinecap="round" />;
  }
  let sobrancelha: React.ReactNode = null;
  if (expressao === "surpresa" || expressao === "cima") {
    const lift = expressao === "surpresa" ? 22 : 12;
    sobrancelha = (
      <path d={`M${cx - 20} ${cy - ry - lift + 4} Q${cx} ${cy - ry - lift - 8} ${cx + 20} ${cy - ry - lift + 4}`} fill="none" stroke={cor} strokeWidth={sw - 0.5} strokeLinecap="round" />
    );
  } else if (expressao === "triste") {
    sobrancelha = (
      <path d={`M${cx - 20} ${cy - ry - 12 + lado * 8} L${cx + 20} ${cy - ry - 12 - lado * 8}`} fill="none" stroke={cor} strokeWidth={sw - 0.5} strokeLinecap="round" />
    );
  }
  return (
    <g>
      <g transform={`translate(${cx} ${cy}) scale(1 ${sy}) translate(${-cx} ${-cy})`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={cor} strokeWidth={sw} />
        <circle cx={px} cy={py} r={13.5} fill={cor} />
      </g>
      {sy < 0.5 ? <path d={`M${cx - rx} ${cy} L${cx + rx} ${cy}`} stroke={cor} strokeWidth={sw} strokeLinecap="round" /> : null}
      {palpebra}
      {sobrancelha}
    </g>
  );
};

export const Sacola: React.FC<SacolaProps> = ({
  largura = 600,
  modo = "kraft",
  olharX = 0,
  olharY = 0,
  piscar = 0,
  expressao = "neutra",
  carimbada = false,
  tinta = 1,
  corTinta = COR.roxo,
  simples = false,
  sombraChao = true,
  semOlhos = false,
  style,
}) => {
  useAssetsLoaded([TEX.kraftTile, TEX.tinta, TEX.reticula]);
  const uid = useId().replace(/:/g, "");
  const id = (s: string) => `${s}-${uid}`;
  const url = (s: string) => `url(#${id(s)})`;

  const tintaOlho = modo === "riso" ? COR.sombra : modo === "cinza" ? "#262626" : COR.tintaPreta;
  const filtroCor = modo === "kraft" ? undefined : url("cor");
  const B = BORDA_RECORTE * (600 / largura); // borda branca constante em px de tela
  const tintaVis = carimbada ? Math.max(0, Math.min(1, tinta)) : 0;

  return (
    <svg
      viewBox="0 0 600 780"
      width={largura}
      height={largura * 1.3}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <pattern id={id("kraft")} patternUnits="userSpaceOnUse" width={1024 * 0.62} height={1024 * 0.62}>
          <image href={TEX.kraftTile} width={1024 * 0.62} height={1024 * 0.62} />
        </pattern>
        <pattern id={id("ret")} patternUnits="userSpaceOnUse" width={256 * 0.55} height={256 * 0.55}>
          <image href={TEX.reticula} width={256 * 0.55} height={256 * 0.55} />
        </pattern>
        <clipPath id={id("clipFront")}>
          <path d={FRONT} />
        </clipPath>
        <clipPath id={id("clipSil")}>
          <path d={SILHOUETTE} />
        </clipPath>
        {/* sombreamento da face frontal: luz de cima-esquerda, discreto */}
        <linearGradient id={id("shadeFront")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.24" />
        </linearGradient>
        <linearGradient id={id("shadeGusset")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0.30" />
          <stop offset="0.52" stopColor="#000" stopOpacity="0.40" />
          <stop offset="1" stopColor="#000" stopOpacity="0.26" />
        </linearGradient>
        <linearGradient id={id("interior")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0f06" stopOpacity="0.45" />
          <stop offset="1" stopColor="#1a0f06" stopOpacity="0.78" />
        </linearGradient>
        <filter id={id("vinco")} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id={id("vincoLargo")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        {/* traço de carimbo: borda levemente irregular */}
        <filter id={id("carimbo")} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={id("carimboFino")} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <mask id={id("tintaMask")} maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="780">
          <image href={TEX.tinta} x="-80" y="0" width="760" height="760" />
        </mask>
        <mask id={id("tintaMaskLogo")} maskUnits="userSpaceOnUse" x="-130" y="-130" width="260" height="260">
          <image href={TEX.tinta} x="-130" y="-130" width="420" height="420" />
        </mask>
        {modo === "riso" ? (
          <filter id={id("cor")} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues={RISO_TABLE.r} />
              <feFuncG type="table" tableValues={RISO_TABLE.g} />
              <feFuncB type="table" tableValues={RISO_TABLE.b} />
            </feComponentTransfer>
          </filter>
        ) : (
          // mundo sem marca: kraft de verdade, so um pouco apagado (o fundo e que e cinza)
          <filter id={id("cor")} colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.82" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.04" intercept="-0.02" />
              <feFuncG type="linear" slope="1.04" intercept="-0.02" />
              <feFuncB type="linear" slope="1.04" intercept="-0.02" />
            </feComponentTransfer>
          </filter>
        )}
      </defs>

      {/* sombra de contato no balcao (fora do filtro de cor: sombra neutra) */}
      {sombraChao ? (
        <ellipse cx={300} cy={728} rx={250} ry={16} fill="#000" opacity={0.28} filter={simples ? undefined : url("vincoLargo")} />
      ) : null}

      {/* ===== RECORTE (borda branca de colagem) ===== */}
      <g>
        <path d={SILHOUETTE} fill="#fff" stroke="#fff" strokeWidth={B * 2} strokeLinejoin="round" />
        <path d={alcaPath(ALCA_TRAS)} fill="none" stroke="#fff" strokeWidth={ALCA_TRAS.w + B * 2} strokeLinecap="round" />
        <path d={alcaPath(ALCA_FRENTE)} fill="none" stroke="#fff" strokeWidth={ALCA_FRENTE.w + B * 2} strokeLinecap="round" />
      </g>

      {/* ===== SACOLA (tudo que passa pelo filtro de cor do mundo) ===== */}
      <g filter={filtroCor}>
        {/* interior visivel pela boca */}
        <path d={OPENING} fill={url("kraft")} />
        <path d={OPENING} fill={url("interior")} />
        {/* alca de tras */}
        <path d={alcaPath(ALCA_TRAS)} fill="none" stroke={url("kraft")} strokeWidth={ALCA_TRAS.w} strokeLinecap="round" />
        <path d={alcaPath(ALCA_TRAS)} fill="none" stroke="#2a1606" strokeOpacity={0.42} strokeWidth={ALCA_TRAS.w} strokeLinecap="round" />
        {!simples ? <Torcao a={ALCA_TRAS} escuro="rgba(40,20,5,0.45)" claro="rgba(255,235,200,0.18)" /> : null}
        {/* alca da frente */}
        <path d={alcaPath(ALCA_FRENTE)} fill="none" stroke={url("kraft")} strokeWidth={ALCA_FRENTE.w} strokeLinecap="round" />
        <path d={alcaPath(ALCA_FRENTE)} fill="none" stroke="#3a2008" strokeOpacity={0.16} strokeWidth={ALCA_FRENTE.w} strokeLinecap="round" />
        {!simples ? <Torcao a={ALCA_FRENTE} escuro="rgba(60,30,8,0.42)" claro="rgba(255,240,210,0.35)" /> : null}
        <path d={alcaPath(ALCA_FRENTE)} fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={2} transform="translate(2 4)" />

        {/* sanfona lateral (fole) */}
        <path d={GUSSET} fill={url("kraft")} />
        <path d={GUSSET} fill={url("shadeGusset")} />
        {/* dobra central do fole + vincos diagonais do fundo */}
        <path d="M478 223 L474 650" stroke="#1d0f04" strokeOpacity={0.35} strokeWidth={2} />
        <path d="M480 223 L476 650" stroke="#fff3df" strokeOpacity={0.22} strokeWidth={1.4} />
        <path d="M474 650 L432 718 M474 650 L516 705" stroke="#1d0f04" strokeOpacity={0.28} strokeWidth={1.8} />
        <path d="M434 247 L478 266 L521 218" fill="none" stroke="#1d0f04" strokeOpacity={0.3} strokeWidth={1.6} />

        {/* face frontal */}
        <path d={FRONT} fill={url("kraft")} />
        <g clipPath={url("clipFront")}>
          <path d={FRONT} fill={url("shadeFront")} />
          {/* aba dobrada da boca (2 camadas de papel) */}
          <rect x={60} y={205} width={380} height={42} fill="#fff6e6" opacity={0.07} />
          <path d="M60 247 L440 247" stroke="#1d0f04" strokeOpacity={0.32} strokeWidth={1.6} />
          <rect x={60} y={248} width={380} height={9} fill="#000" opacity={0.10} filter={simples ? undefined : url("vinco")} />
          {/* vinco horizontal do fundo dobrado e diagonais dos cantos */}
          <path d="M60 640 L440 640" stroke="#1d0f04" strokeOpacity={0.16} strokeWidth={1.4} />
          <path d="M60 642 L440 642" stroke="#fff3df" strokeOpacity={0.16} strokeWidth={1.2} />
          <path d="M70 722 L122 640 M430 722 L380 640" stroke="#1d0f04" strokeOpacity={0.12} strokeWidth={1.4} />
          {/* amassados suaves (luz + sombra deslocadas) */}
          {!simples ? (
            <g filter={url("vinco")}>
              <path d="M96 300 C150 340 170 420 150 520" stroke="#fff8ea" strokeOpacity={0.10} strokeWidth={9} fill="none" />
              <path d="M104 303 C158 343 178 423 158 523" stroke="#2a1606" strokeOpacity={0.09} strokeWidth={7} fill="none" />
              <path d="M330 270 C360 330 400 360 420 430" stroke="#fff8ea" strokeOpacity={0.16} strokeWidth={4} fill="none" />
              <path d="M335 272 C365 332 405 362 425 432" stroke="#2a1606" strokeOpacity={0.10} strokeWidth={4} fill="none" />
              <path d="M230 590 C260 600 300 596 340 610" stroke="#2a1606" strokeOpacity={0.10} strokeWidth={4} fill="none" />
            </g>
          ) : null}
          {/* aresta frente/fole com luz */}
          <path d="M432 205 L428 722" stroke="#fff3df" strokeOpacity={0.30} strokeWidth={2.4} />
          {/* reticula nas sombras do mundo cinza */}
          {modo === "cinza" ? <path d={FRONT} fill={url("ret")} opacity={0.10} /> : null}
        </g>
        {modo === "cinza" ? <path d={GUSSET} fill={url("ret")} opacity={0.22} /> : null}
        {/* fio de corte do papel */}
        <path d={SILHOUETTE} fill="none" stroke="#2a1606" strokeOpacity={0.35} strokeWidth={1.4} strokeLinejoin="round" />
      </g>

      {/* ===== TINTA DE CARIMBO (fora do filtro: cor exata) ===== */}
      {!semOlhos ? (
        <g
          filter={simples ? undefined : url("carimbo")}
          mask={simples ? undefined : url("tintaMask")}
          opacity={modo === "riso" ? 0.95 : 0.88}
          style={{ mixBlendMode: "multiply" }}
        >
          <Olho cx={196} cy={OLHO_Y} ox={olharX} oy={olharY} piscar={piscar} expressao={expressao} cor={tintaOlho} lado={-1} />
          <Olho cx={304} cy={OLHO_Y} ox={olharX} oy={olharY} piscar={piscar} expressao={expressao} cor={tintaOlho} lado={1} />
        </g>
      ) : null}

      {tintaVis > 0 ? (
        <g
          opacity={tintaVis}
          transform={`translate(${LOGO_C.x} ${LOGO_C.y}) rotate(-3) scale(${1.06 - 0.06 * tintaVis}) scale(${LOGO_C.s})`}
        >
          {modo === "riso" ? (
            // placa desalinhada da risografia (~4 px)
            <g transform="translate(3.5 2.5)" opacity={0.6}>
              <LogoDoceDaLu cor={corTinta === COR.sombra ? COR.roxo : COR.sombra} />
            </g>
          ) : null}
          {/* camada base sem falhas (densidade minima da tinta) + camada com falhas por cima */}
          <g opacity={simples ? 1 : 0.62} filter={simples ? undefined : url("carimboFino")}>
            <LogoDoceDaLu cor={corTinta} />
          </g>
          {!simples ? (
            <g filter={url("carimboFino")} mask={url("tintaMaskLogo")}>
              <LogoDoceDaLu cor={corTinta} />
            </g>
          ) : null}
        </g>
      ) : null}
    </svg>
  );
};
