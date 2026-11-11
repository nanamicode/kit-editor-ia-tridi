import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { CARD_SHOTS, PHRASES, SRC, shotAt } from "./data";

const { fontFamily: OUTFIT } = loadOutfit("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
const { fontFamily: SERIF } = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

// Paleta (Maindx: roxo do cenario + magenta do LED, sobre carvao)
const C = {
  bg: "#0A090D",
  panel: "#121017",
  line: "#2C2836",
  gray: "#4A4556",
  mid: "#8C85A0",
  white: "#F4F2F8",
  accent: "#A970FF",
  purple: "#7B35E8",
  deep: "#5A2BB0",
  led: "#E44CFF",
};

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...CL, easing: EASE });

type Rect = { x: number; y: number; w: number; h: number };
const FULL: Rect = { x: 80, y: 530, w: 920, h: 960 };
const PRODUCT: Rect = { x: 230, y: 800, w: 620, h: 690 };
const CTA: Rect = { x: 60, y: 530, w: 960, h: 970 };
const HEADER = 80;

const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
  w: a.w + (b.w - a.w) * p,
  h: a.h + (b.h - a.h) * p,
});

const cardRect = (f: number): Rect => {
  if (f < 166) return FULL;
  if (f < 272) return PRODUCT;
  if (f < 290) return lerpRect(PRODUCT, FULL, ramp(f, 272, 290));
  if (f < 806) return FULL;
  if (f < 822) return lerpRect(FULL, CTA, ramp(f, 806, 822));
  return CTA;
};

// "Imagem que nasce de pontos": mascara de bolinhas que crescem ate cobrir tudo.
const dotMask = (p: number): React.CSSProperties => {
  if (p >= 1) return {};
  const r = Math.max(0.01, p * 20);
  const m = `radial-gradient(circle, #000 ${r}px, transparent ${r + 0.8}px)`;
  return {
    WebkitMaskImage: m,
    maskImage: m,
    WebkitMaskSize: "26px 26px",
    maskSize: "26px 26px",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
};

// Posiciona a fonte 1080x1920 dentro de uma caixa w x h (centro da fonte em cx,cy).
const winStyle = (w: number, h: number, s: number, cx: number, cy: number): React.CSSProperties => ({
  position: "absolute",
  width: 1080 * s,
  height: 1920 * s,
  left: w / 2 - cx * s,
  top: h / 2 - cy * s,
  maxWidth: "none",
});

const LiveVideo: React.FC<{ from: number; dur: number; style: React.CSSProperties }> = ({ from, dur, style }) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <Video src={staticFile(SRC)} trimBefore={from} muted style={style} />
  </Sequence>
);

/* ---------------- Fundo ---------------- */
const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.13) 2.2px, transparent 2.9px)",
        backgroundSize: "28px 28px",
        backgroundPosition: "14px 14px",
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
  </AbsoluteFill>
);

/* ---------------- Legenda-titulo: palavra seguinte em cinza que acende ---------------- */
const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, height: 210, overflow: "hidden" }}>
      {PHRASES.map((ph, i) => {
        const start = Math.round((ph.words[0].s - 0.12) * fps);
        const next = PHRASES[i + 1];
        const end = next ? Math.round((next.words[0].s - 0.12) * fps) : 99999;
        // troca em "rolo": a frase anterior sobe e sai no mesmo instante em que a proxima sobe e entra
        // (sem vazio entre frases e sem texto sobre texto; a faixa recorta o que sai dela)
        if (frame < start - 1 || frame > end + 7) return null;
        const inP = ramp(frame, start, start + 7);
        const outT = ramp(frame, end, end + 7);
        const outOp = ramp(frame, end + 3, end + 7); // a frase que sai segue legivel enquanto sobe
        const lines: (typeof ph.words)[] = [[]];
        ph.words.forEach((w) => {
          if (w.br) lines.push([]);
          lines[lines.length - 1].push(w);
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 80,
              right: 80,
              top: 0,
              height: 210,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              opacity: Math.min(inP, 1 - outOp),
              transform: `translateY(${(1 - inP) * 210 - outT * 210}px)`,
            }}
          >
            {lines.map((ln, li) => (
              <div
                key={li}
                style={{
                  fontFamily: OUTFIT,
                  fontWeight: 600,
                  fontSize: 84,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {ln.map((w, wi) => {
                  const ws = Math.round(w.s * fps);
                  const lit = interpolate(frame, [ws - 1, ws + 3], [0, 1], CL);
                  const color = interpolateColors(lit, [0, 1], [C.gray, w.hi ? C.accent : C.white]);
                  return (
                    <span key={wi} style={{ color }}>
                      {w.t}
                      {wi < ln.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

/* ---------------- Cartao (janela) com o video original ---------------- */
const WindowChrome: React.FC<{ w: number; label: string }> = ({ w, label }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: w,
      height: HEADER,
      borderBottom: `1.5px solid ${C.line}`,
      display: "flex",
      alignItems: "center",
      padding: "0 28px",
      gap: 12,
      boxSizing: "border-box",
    }}
  >
    {[0, 1, 2].map((k) => (
      <div key={k} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#3A3546" }} />
    ))}
    <div style={{ marginLeft: 18, fontFamily: MONO, fontWeight: 500, fontSize: 44, color: C.mid, letterSpacing: "-0.02em" }}>
      {label}
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 9px)", gap: 5 }}>
      {Array.from({ length: 8 }).map((_, k) => (
        <div key={k} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: [0, 3, 5, 6].includes(k) ? C.led : "#3A2442" }} />
      ))}
    </div>
  </div>
);

const Card: React.FC<{
  rect: Rect;
  opacity: number;
  scale: number;
  reveal: number;
  dark?: number;
  children: (w: number, h: number) => React.ReactNode;
}> = ({ rect, opacity, scale, reveal, dark = 0, children }) => {
  const vh = rect.h - HEADER;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: 30,
        backgroundColor: C.panel,
        border: `1.5px solid ${C.line}`,
        boxShadow: "0 40px 80px rgba(0,0,0,0.55)",
        overflow: "hidden",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <WindowChrome w={rect.w} label="Maindx" />
      <div style={{ position: "absolute", left: 0, top: HEADER, width: rect.w, height: vh, overflow: "hidden", ...dotMask(reveal) }}>
        {children(rect.w, vh)}
        {dark > 0 ? <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(10,9,13,${dark})` }} /> : null}
      </div>
    </div>
  );
};

const CardVideo: React.FC<{ from: number; dur: number; w: number; h: number; frame: number }> = ({ from, dur, w, h, frame }) => {
  const sh = shotAt(frame);
  const style: React.CSSProperties = {
    position: "absolute",
    width: 1080 * sh.s,
    height: 1920 * sh.s,
    left: w / 2 - sh.cx * sh.s,
    top: -sh.y0 * sh.s,
    maxWidth: "none",
  };
  return <LiveVideo from={from} dur={dur} style={style} />;
};

// Recorte de um quadro/trecho com o enquadramento de um shot fixo.
const shotStyle = (sh: { s: number; cx: number; y0: number }, w: number): React.CSSProperties => ({
  position: "absolute",
  width: 1080 * sh.s,
  height: 1920 * sh.s,
  left: w / 2 - sh.cx * sh.s,
  top: -sh.y0 * sh.s,
  maxWidth: "none",
});

// Card final: trecho limpo do totem (fonte 180..272, antes do flash branco) tocando mudo.
const END_FROM = 894;
const END_SRC = 180;
const EndVideo: React.FC<{ w: number; frame: number }> = ({ w, frame }) => {
  const sh = shotAt(Math.max(END_SRC, frame - END_FROM + END_SRC));
  if (frame < END_FROM) return <Img src={staticFile("v/v6/s_t180.jpg")} style={shotStyle(sh, w)} />;
  return (
    <Sequence from={END_FROM} layout="none">
      <Video src={staticFile(SRC)} trimBefore={END_SRC} muted style={shotStyle(sh, w)} />
    </Sequence>
  );
};

// Flash branco da transicao original (fonte ~274-291: vazamento de luz, 2 quadros brancos, nevoa rosa).
// 1) quadro limpo do totem (fonte 272) cobre a subida do flash e os quadros brancos, e se dissolve na apresentadora;
// 2) na saida, contraste/brilho tiram a nevoa rosa do video ao vivo; 3) leve escurecimento residual.
const flashCover = (f: number) => interpolate(f, [272, 274, 281, 287], [0, 1, 1, 0], CL);
const hazeFix = (f: number) => interpolate(f, [280, 285, 293], [1, 1, 0], { ...CL, easing: Easing.out(Easing.quad) }) * (f >= 280 ? 1 : 0);
const flashDark = (f: number) => interpolate(f, [281, 284, 292], [0, 0.12, 0], CL);

/* ---------------- Grade de paineis que se desenha ---------------- */
const GridLines: React.FC<{ draw: number; fade: number; paths: string[] }> = ({ draw, fade, paths }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: fade }}>
    {paths.map((d, i) => (
      <path
        key={i}
        d={d}
        pathLength={1}
        stroke="#4A4458"
        strokeWidth={2}
        fill="none"
        strokeDasharray="1 1"
        strokeDashoffset={1 - interpolate(draw, [i * 0.12, i * 0.12 + 0.64], [0, 1], CL)}
      />
    ))}
  </svg>
);

const Nodes: React.FC<{ pts: [number, number][]; p: number }> = ({ pts, p }) => (
  <>
    {pts.map(([x, y], i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x - 7,
          top: y - 7,
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: "#5C566B",
          transform: `scale(${interpolate(p, [i * 0.08, i * 0.08 + 0.4], [0, 1], CL)})`,
        }}
      />
    ))}
  </>
);

type PanelDef = { r: Rect; img: string; s: number; cx: number; cy: number; fill: number };

const Panel: React.FC<{
  def: PanelDef;
  frame: number;
  dim?: number;
  number?: string;
  label?: string;
  live?: { from: number; dur: number };
  exitP: number;
}> = ({ def, frame, dim = 0, number, label, live, exitP }) => {
  const p = ramp(frame, def.fill, def.fill + 9);
  const { r } = def;
  const filled = frame >= def.fill;
  const style = winStyle(r.w, r.h, def.s, def.cx, def.cy);
  const isLive = live && frame >= live.from && frame < live.from + live.dur;
  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: filled ? C.panel : "rgba(18,16,23,0.35)",
        border: `1.5px solid ${filled && dim < 0.5 ? C.accent : C.line}`,
        opacity: 1 - exitP,
        transform: `scale(${1 - exitP * 0.04})`,
      }}
    >
      {filled ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...dotMask(p),
            transform: `scale(${1.06 - 0.06 * p + interpolate(frame, [def.fill, def.fill + 90], [0, 0.03], CL)})`,
            filter: `grayscale(${dim})`,
          }}
        >
          {isLive && live ? (
            <LiveVideo from={live.from} dur={live.dur} style={style} />
          ) : (
            <Img src={staticFile(def.img)} style={style} />
          )}
          <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(10,9,13,${dim * 0.78})` }} />
        </div>
      ) : null}
      {number ? (
        <div
          style={{
            position: "absolute",
            left: 26,
            top: 8,
            fontFamily: OUTFIT,
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1,
            color: filled ? C.accent : C.gray,
            textShadow: filled ? "0 4px 24px rgba(0,0,0,0.7)" : "none",
            opacity: filled ? 1 - dim * 0.5 : 1,
          }}
        >
          {number}
        </div>
      ) : null}
      {label ? (
        <div
          style={{
            position: "absolute",
            left: 22,
            bottom: 22,
            padding: "8px 22px 12px",
            borderRadius: 14,
            backgroundColor: "rgba(10,9,13,0.82)",
            fontFamily: OUTFIT,
            fontWeight: 600,
            fontSize: 48,
            color: filled ? C.white : C.gray,
            opacity: filled ? 1 - dim * 0.45 : 1,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

const GRID4: Rect[] = [
  { x: 80, y: 530, w: 450, h: 470 },
  { x: 550, y: 530, w: 450, h: 470 },
  { x: 80, y: 1020, w: 450, h: 470 },
  { x: 550, y: 1020, w: 450, h: 470 },
];

const ProblemGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const draw = ramp(frame, 89, 103);
  const fade = 1 - ramp(frame, 168, 180);
  const defs: PanelDef[] = [
    { r: GRID4[0], img: "v/v6/s_queue.jpg", s: 0.6, cx: 540, cy: 1050, fill: 97 },
    // paineis entram em sequencia curta (8 quadros) para a grade nao ficar com celulas vazias
    { r: GRID4[1], img: "v/v6/s_red.jpg", s: 0.55, cx: 560, cy: 560, fill: 105 },
    { r: GRID4[2], img: "v/v6/s_man.jpg", s: 0.55, cx: 520, cy: 720, fill: 113 },
    { r: GRID4[3], img: "v/v6/s_desk.jpg", s: 0.55, cx: 560, cy: 640, fill: 121 },
  ];
  return (
    <>
      <GridLines draw={draw} fade={fade * (1 - ramp(frame, 150, 160) * 0.6)} paths={["M80 1010 H1000", "M540 530 V1490", "M80 530 H1000 V1490 H80 Z"]} />
      <Nodes pts={[[540, 1010], [80, 530], [1000, 530], [80, 1490], [1000, 1490], [540, 530], [540, 1490], [80, 1010], [1000, 1010]]} p={draw * fade} />
      {defs.map((d, i) => (
        <Panel key={i} def={d} frame={frame} exitP={ramp(frame, 166 + i * 2, 176 + i * 2)} dim={0} />
      ))}
    </>
  );
};

const SystemsGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const draw = ramp(frame, 462, 482);
  const fade = 1 - ramp(frame, 606, 616);
  const R = [
    { x: 80, y: 530, w: 920, h: 470 },
    { x: 80, y: 1020, w: 450, h: 470 },
    { x: 550, y: 1020, w: 450, h: 470 },
  ];
  const defs: PanelDef[] = [
    { r: R[0], img: "v/v6/s_senha.jpg", s: 0.86, cx: 540, cy: 1135, fill: 484 },
    { r: R[1], img: "v/v6/s_ponto.jpg", s: 0.7, cx: 620, cy: 1055, fill: 526 },
    { r: R[2], img: "v/v6/s_satis.jpg", s: 0.7, cx: 470, cy: 995, fill: 561 },
  ];
  const active = frame < 526 ? 0 : frame < 561 ? 1 : 2;
  const lives = [
    { from: 480, dur: 43 },
    { from: 533, dur: 27 },
    { from: 562, dur: 42 },
  ];
  const labels = ["senha", "ponto", "satisfação"];
  const appear = ramp(frame, 468, 480);
  return (
    <>
      <GridLines draw={draw} fade={fade} paths={["M80 1010 H1000", "M540 1010 V1490", "M80 530 H1000 V1490 H80 Z"]} />
      <Nodes pts={[[540, 1010], [80, 1010], [1000, 1010], [80, 530], [1000, 530], [80, 1490], [1000, 1490], [540, 1490]]} p={draw * fade} />
      {defs.map((d, i) => {
        const dimTarget = frame >= d.fill && i !== active ? 1 : 0;
        const changeAt = i === 0 ? 526 : i === 1 ? 561 : 99999;
        const dim = dimTarget ? ramp(frame, changeAt, changeAt + 8) * 0.85 : 0;
        return (
          <div key={i} style={{ opacity: appear }}>
            <Panel
              def={d}
              frame={frame}
              dim={dim}
              number={String(i + 1)}
              label={labels[i]}
              live={lives[i]}
              exitP={ramp(frame, 604 + i * 2, 614 + i * 2)}
            />
          </div>
        );
      })}
    </>
  );
};

/* ---------------- Ficha tecnica (chips que acendem) ---------------- */
const SpecBar: React.FC<{ frame: number }> = ({ frame }) => {
  const vis = ramp(frame, 298, 310) * (1 - ramp(frame, 458, 466)) + ramp(frame, 618, 630) * (1 - ramp(frame, 800, 808));
  if (vis <= 0) return null;
  const chips = [
    { t: "Tela 7\"", at: 369 },
    { t: "Display LED", at: 659 },
    { t: "Impressora", at: 694 },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 1522,
        height: 96,
        display: "flex",
        justifyContent: "center",
        gap: 18,
        opacity: vis,
        transform: `translateY(${(1 - vis) * 14}px)`,
      }}
    >
      {chips.map((c, i) => {
        const lit = interpolate(frame, [c.at - 1, c.at + 4], [0, 1], CL);
        const pop = spring({ frame: frame - c.at, fps: 30, config: { damping: 14, stiffness: 180 } });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 26px",
              borderRadius: 48,
              border: `2px solid ${interpolateColors(lit, [0, 1], [C.line, C.accent])}`,
              backgroundColor: interpolateColors(lit, [0, 1], ["#0F0D14", "#1A1324"]),
              fontFamily: OUTFIT,
              fontWeight: 600,
              fontSize: 44,
              color: interpolateColors(lit, [0, 1], [C.gray, C.white]),
              whiteSpace: "nowrap",
              transform: `scale(${1 + (frame >= c.at ? (1 - pop) * 0.08 : 0)})`,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: interpolateColors(lit, [0, 1], ["#2E2938", C.led]) }} />
            {c.t}
          </div>
        );
      })}
    </div>
  );
};

/* ---------------- Palavra gigante atras do produto ---------------- */
const GiantWord: React.FC<{ frame: number; inAt: number; outAt?: number; drift?: boolean }> = ({ frame, inAt, outAt, drift }) => {
  const p = ramp(frame, inAt, inAt + 18);
  const o = outAt ? 1 - ramp(frame, outAt, outAt + 14) : 1;
  if (p * o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 520,
        textAlign: "center",
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: 380,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color: C.deep,
        opacity: p * o,
        transform: `translateX(${drift ? interpolate(frame, [inAt, 986], [-14, 14], CL) : 0}px) translateY(${(1 - p) * 60}px) scale(${0.96 + 0.04 * p + (drift ? interpolate(frame, [inAt, 986], [0, 0.035], CL) : 0)})`,
      }}
    >
      Totem
    </div>
  );
};

/* ---------------- CTA ---------------- */
const CtaButton: React.FC<{ frame: number }> = ({ frame }) => {
  const enter = spring({ frame: frame - 862, fps: 30, config: { damping: 15, stiffness: 160 } });
  if (frame < 862) return null;
  // dois toques: no "Saiba mais" falado (872) e de novo no card final (~31 s)
  const tap = frame >= 928 ? frame - 928 : frame - 872;
  const press = tap >= 0 && tap < 8 ? interpolate(tap, [0, 3, 8], [1, 0.95, 1], CL) : 1;
  const ring = tap >= 0 ? interpolate(tap, [0, 18], [0, 1], CL) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1528, height: 104, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 54px",
          height: 104,
          borderRadius: 52,
          backgroundColor: C.purple,
          boxShadow: "0 18px 40px rgba(123,53,232,0.35)",
          fontFamily: OUTFIT,
          fontWeight: 600,
          fontSize: 56,
          color: C.white,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 30}px) scale(${(0.94 + 0.06 * enter) * press})`,
        }}
      >
        Saiba mais
        <svg width={44} height={44} viewBox="0 0 24 24">
          <path d="M5 12h13M13 6l6 6-6 6" stroke={C.white} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {tap >= 0 && ring < 1 ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 120,
              height: 120,
              marginLeft: -60,
              marginTop: -60,
              borderRadius: 60,
              border: `4px solid ${C.white}`,
              opacity: 1 - ring,
              transform: `scale(${0.4 + ring * 1.8})`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

/* ---------------- Composicao ---------------- */
export const V6: React.FC = () => {
  const frame = useCurrentFrame();
  const rect = cardRect(frame);

  // Segmentos do cartao principal
  const segA = frame < 104;
  const segB = frame >= 166 && frame < 482;
  const segC = frame >= 608 && frame < 898;
  const segEnd = frame >= 888;

  const cardA = { op: 1 - ramp(frame, 95, 105), sc: 1 - ramp(frame, 95, 105) * 0.03, rev: ramp(frame, 0, 9) };
  // cartao do produto nasce dos pontos enquanto a grade ainda sai (sobreposicao)
  const cardB = { op: ramp(frame, 167, 171) * (1 - ramp(frame, 462, 470)), sc: 1 - ramp(frame, 462, 470) * 0.03, rev: ramp(frame, 167, 182) };
  const cardC = { op: ramp(frame, 609, 613) * (1 - ramp(frame, 884, 895)), sc: 1, rev: ramp(frame, 610, 624) };
  const cardE = { op: ramp(frame, 890, 894), rev: ramp(frame, 892, 908) };

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Audio src={staticFile(SRC)} />
      <Background />

      {/* palavra gigante (atras do cartao do produto) */}
      <GiantWord frame={frame} inAt={232} outAt={268} />
      {segEnd ? <GiantWord frame={frame} inAt={896} drift /> : null}

      {segA ? (
        <Card rect={rect} opacity={cardA.op} scale={cardA.sc} reveal={cardA.rev}>
          {(w, h) => <CardVideo from={0} dur={104} w={w} h={h} frame={frame} />}
        </Card>
      ) : null}

      {frame >= 88 && frame < 182 ? <ProblemGrid frame={frame} /> : null}

      {segB ? (
        <Card rect={rect} opacity={cardB.op} scale={cardB.sc} reveal={cardB.rev} dark={flashDark(frame)}>
          {(w, h) =>
            frame < 180 ? (
              <Img src={staticFile("v/v6/s_t180.jpg")} style={shotStyle(CARD_SHOTS[1], w)} />
            ) : (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    filter: hazeFix(frame) > 0 ? `contrast(${1 + 0.55 * hazeFix(frame)}) brightness(${1 - 0.25 * hazeFix(frame)}) saturate(${1 + 0.25 * hazeFix(frame)})` : undefined,
                  }}
                >
                  <CardVideo from={180} dur={302} w={w} h={h} frame={frame} />
                </div>
                {flashCover(frame) > 0 ? (
                  <Img src={staticFile("v/v6/s_t272.jpg")} style={{ ...shotStyle(CARD_SHOTS[3], w), opacity: flashCover(frame) }} />
                ) : null}
              </>
            )
          }
        </Card>
      ) : null}

      {frame >= 460 && frame < 618 ? <SystemsGrid frame={frame} /> : null}

      {segC ? (
        <Card rect={rect} opacity={cardC.op} scale={cardC.sc} reveal={cardC.rev}>
          {(w, h) => <CardVideo from={608} dur={290} w={w} h={h} frame={frame} />}
        </Card>
      ) : null}

      {segEnd ? (
        <Card rect={PRODUCT} opacity={cardE.op} scale={1 + interpolate(frame, [892, 986], [0, 0.04], CL)} reveal={cardE.rev}>
          {(w) => <EndVideo w={w} frame={frame} />}
        </Card>
      ) : null}

      <SpecBar frame={frame} />
      <CtaButton frame={frame} />
      <Headline />
    </AbsoluteFill>
  );
};
