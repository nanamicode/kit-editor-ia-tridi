import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { COR, TEX, anton, inter } from "../theme";

// ---------- tempo / easing ----------
export const EO = Easing.bezier(0.16, 1, 0.3, 1); // saida suave (entradas)
export const EIO = Easing.bezier(0.65, 0, 0.35, 1);
export const EIN = Easing.bezier(0.55, 0, 0.95, 0.45); // gravidade / saidas
export const iv = (f: number, i: readonly number[], o: readonly number[], easing?: (t: number) => number) =>
  interpolate(f, i as number[], o as number[], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
export const mola = (f: number, inicio: number, fps: number, damping = 12, stiffness = 190) =>
  spring({ frame: f - inicio, fps, config: { damping, stiffness, mass: 0.7 } });

export type Mundo = "cinza" | "riso";

// ---------- linha de titulo: tarja preta rasgada (mundo cinza) ou papel com tinta roxa (riso) ----------
export const Linha: React.FC<{
  f: number;
  texto: string;
  size: number;
  top: number;
  inicio: number;
  fim: number;
  estilo: "tarja" | "papel";
  rot?: number;
  cor?: string;
}> = ({ f, texto, size, top, inicio, fim, estilo, rot = 0, cor }) => {
  if (f < inicio || f >= fim) return null;
  const t = f - inicio;
  const base: React.CSSProperties = {
    display: "inline-block",
    fontFamily: anton,
    fontSize: size,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    letterSpacing: size * 0.012,
  };
  const corpo: React.CSSProperties =
    estilo === "tarja"
      ? {
          ...base,
          backgroundImage: `url(${TEX.tarja})`,
          backgroundSize: "100% 100%",
          padding: `${size * 0.24}px ${size * 0.36}px ${size * 0.2}px`,
          color: "#fff",
        }
      : {
          ...base,
          backgroundColor: COR.papel,
          backgroundImage: `url(${TEX.papelTile})`,
          backgroundSize: "640px 640px",
          padding: `${size * 0.06}px ${size * 0.3}px ${size * 0.08}px`,
          color: cor ?? COR.sombra,
          // registro desalinhado da risografia (placa roxa ~4 px fora)
          textShadow: `-4px 3px 0 rgba(139,0,255,0.6)`,
          boxShadow: `9px 9px 0 ${COR.sombra}`,
        };
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top,
        display: "flex",
        justifyContent: "center",
        opacity: iv(t, [0, 2], [0, 1]),
        translate: `0px ${iv(t, [0, 6], [26, 0], EO)}px`,
        scale: iv(t, [0, 6], [1.14, 1], EO),
        rotate: `${rot + iv(t, [0, 7], [2.5, 0], EO)}deg`,
      }}
    >
      <span style={corpo}>{texto}</span>
    </div>
  );
};

// ---------- etiqueta pequena (selos legais: CENA ILUSTRATIVA, marca ilustrativa...) ----------
export const Etiqueta: React.FC<{
  texto: string;
  top: number;
  left?: number;
  centro?: boolean;
  mundo: Mundo;
  size?: number;
  rot?: number;
  opacity?: number;
}> = ({ texto, top, left = 88, centro, mundo, size = 26, rot = 0, opacity = 1 }) => {
  const cor = mundo === "cinza" ? "#161616" : "#fff";
  const fundo = mundo === "cinza" ? "rgba(255,255,255,0.88)" : COR.sombra;
  const el = (
    <span
      style={{
        display: "inline-block",
        fontFamily: inter,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: size * 0.08,
        textTransform: "uppercase",
        color: cor,
        background: fundo,
        border: `2px solid ${cor}`,
        padding: `${size * 0.22}px ${size * 0.5}px`,
        lineHeight: 1.1,
        rotate: `${rot}deg`,
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </span>
  );
  return centro ? (
    <div style={{ position: "absolute", left: 0, width: 1080, top, display: "flex", justifyContent: "center", opacity }}>{el}</div>
  ) : (
    <div style={{ position: "absolute", left, top, opacity }}>{el}</div>
  );
};

// ---------- formas de papel ----------
export const HEART = "M50 88 C22 68 2 50 2 27 C2 11 14 1 28 1 C38 1 46 7 50 15 C54 7 62 1 72 1 C86 1 98 11 98 27 C98 50 78 68 50 88 Z";

export const Coracao: React.FC<{ size: number; cor: string; borda?: number }> = ({ size, cor, borda = 9 }) => (
  <svg viewBox="-12 -12 124 116" width={size} height={size * (116 / 124)} style={{ overflow: "visible" }}>
    <path d={HEART} fill="#fff" stroke="#fff" strokeWidth={borda * 2 * (124 / size)} strokeLinejoin="round" />
    <path d={HEART} fill={cor} />
    <path d="M20 22 C24 14 32 12 38 15" fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

// brigadeiro de papel recortado (mundo cinza: sem cor)
export const Brigadeiro: React.FC<{ size: number }> = ({ size }) => {
  const sw = 12 * 2 * (100 / size);
  const fundo = "M18 56 L82 56 L74 94 L26 94 Z";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
      <g stroke="#fff" strokeWidth={sw} strokeLinejoin="round" fill="#fff">
        <circle cx={50} cy={42} r={30} />
        <path d={fundo} />
      </g>
      <path d={fundo} fill="#8d7458" />
      {[30, 38, 46, 54, 62, 70].map((x) => (
        <line key={x} x1={x} y1={58} x2={x + (x - 50) * 0.12} y2={92} stroke="#5a4532" strokeWidth={2.4} />
      ))}
      <circle cx={50} cy={42} r={30} fill="#3a2316" />
      {[
        [38, 28, 30], [52, 22, -20], [62, 32, 60], [44, 40, 10], [58, 46, -40],
        [34, 48, 75], [50, 56, 20], [66, 54, -60], [42, 58, 40], [56, 36, 90],
      ].map(([x, y, r], i) => (
        <rect key={i} x={x - 3.5} y={y - 1.3} width={7} height={2.6} rx={1.3} fill="#e9dcc6" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <path d="M32 30 C36 20 46 16 54 17" fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
};

// ---------- carimbo (sempre em tinta roxa: e a unica coisa com cor no mundo cinza) ----------
// viewBox 330x400; base da borracha em y=372 (centro x=165)
export const CARIMBO_BASE = { x: 165, y: 372, w: 330, h: 400 };
export const Carimbo: React.FC<{ largura?: number }> = ({ largura = 330 }) => {
  const sw = 12 * 2 * (330 / largura);
  const knob = "M165 8 C214 8 238 40 238 74 C238 104 214 124 190 128 L140 128 C116 124 92 104 92 74 C92 40 116 8 165 8 Z";
  const neck = "M138 124 L192 124 L200 186 L130 186 Z";
  const block = "M28 182 L302 182 Q314 182 314 194 L314 320 Q314 332 302 332 L28 332 Q16 332 16 320 L16 194 Q16 182 28 182 Z";
  const pad = "M10 330 L320 330 L320 366 Q320 372 314 372 L16 372 Q10 372 10 366 Z";
  return (
    <svg viewBox="0 0 330 400" width={largura} height={largura * (400 / 330)} style={{ overflow: "visible" }}>
      <defs>
        <pattern id="carimbo-ret" patternUnits="userSpaceOnUse" width={64} height={64}>
          <image href={TEX.reticulaGrossa} width={64} height={64} />
        </pattern>
      </defs>
      {/* recorte branco */}
      <g fill="#fff" stroke="#fff" strokeWidth={sw} strokeLinejoin="round">
        <path d={knob} />
        <path d={neck} />
        <path d={block} />
        <path d={pad} />
      </g>
      {/* placa escura desalinhada (risografia) */}
      <g transform="translate(4 3)" fill={COR.sombra} opacity={0.55}>
        <path d={knob} />
        <path d={block} />
      </g>
      <path d={knob} fill={COR.roxo} />
      <path d="M128 40 C140 26 160 22 176 24" fill="none" stroke={COR.lilas} strokeWidth={9} strokeLinecap="round" />
      <path d={neck} fill={COR.sombra} />
      <path d={block} fill={COR.roxo} />
      <path d="M210 182 L302 182 Q314 182 314 194 L314 320 Q314 332 302 332 L210 332 Z" fill="url(#carimbo-ret)" opacity={0.55} />
      <path d="M30 196 L180 196" stroke={COR.lilas} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
      <text x={165} y={278} textAnchor="middle" fontFamily={anton} fontSize={46} letterSpacing={4} fill="#fff" opacity={0.92}>
        TRIDI
      </text>
      <path d={pad} fill="#1d0636" />
      <path d="M14 334 L316 334" stroke={COR.lilas} strokeOpacity={0.5} strokeWidth={3} />
    </svg>
  );
};

// ---------- balao de fala em papel recortado ----------
export const Balao: React.FC<{
  children: React.ReactNode;
  cauda: "esquerda" | "baixo" | "nenhuma";
  padding?: string;
  style?: React.CSSProperties;
  cor?: string;
}> = ({ children, cauda, padding = "26px 46px", style, cor = "#fff" }) => (
  <div style={{ position: "relative", display: "inline-block", ...style }}>
    <div
      style={{
        position: "relative",
        background: cor,
        borderRadius: 44,
        padding,
        boxShadow: "8px 10px 0 rgba(0,0,0,0.22)",
        zIndex: 1,
      }}
    >
      {children}
    </div>
    {cauda === "esquerda" ? (
      <svg width={90} height={80} style={{ position: "absolute", left: -46, bottom: -20, zIndex: 2 }} viewBox="0 0 90 80">
        <path d="M86 6 L2 72 L60 40 Z" fill={cor} />
      </svg>
    ) : cauda === "nenhuma" ? null : (
      <svg width={90} height={70} style={{ position: "absolute", left: "50%", marginLeft: -20, bottom: -54, zIndex: 2 }} viewBox="0 0 90 70">
        <path d="M2 2 L40 66 L64 2 Z" fill={cor} />
      </svg>
    )}
  </div>
);
