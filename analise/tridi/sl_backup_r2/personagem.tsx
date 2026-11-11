import React, { useMemo } from "react";
import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Expressao, Sacola } from "../Sacola";
import { COR } from "../theme";
import { DUR, IMPACTO, T, batida } from "./tempo";
import { Brigadeiro, CARIMBO_BASE, Carimbo, Coracao, EIN, EIO, EO, Mundo, iv, mola } from "./ui";

// ---------- pose da protagonista (funcao pura do frame) ----------
// cx = centro do corpo da sacola em x; base = y da base (apoio no balcao); s = escala (1 = LARGURA px)
export const LARGURA = 700; // ~46% da altura do quadro (com alca)
export const BASE = 1440;
const S_CELULA = 200 / LARGURA; // mesmo tamanho das figurantes
const BASE_CELULA = 1095;
// pose do CTA: sacola a esquerda, carimbo fisico a direita
export const POSE_CTA = { cx: 400, base: 1372, s: 0.82 };

type Pose = {
  cx: number; base: number; s: number; rot: number; sx: number; sy: number;
  ox: number; oy: number; pis: number; ex: Expressao; car: boolean; tinta: number; vis: boolean;
};

const BATIDAS_RISO = [batida(17), batida(18), batida(19)];
const BATIDAS_CTA = [batida(32), batida(33), batida(34), batida(35)];

export const pose = (f: number, fps: number): Pose => {
  let cx = 540, base = BASE, s = 1, rot = 0, sy = 1, dy = 0, vis = true;
  let ox = 0, oy = 0, pis = 0;
  let ex: Expressao = "neutra";
  const { tum } = T;

  // frame 0 ja no meio da queda, inclinada; squash no contato
  if (f < T.queda) {
    dy = iv(f, [0, T.queda], [-190, 0], EIN);
    rot = iv(f, [0, T.queda], [-7, 0]);
  }
  sy *= iv(f, [T.queda, T.queda + 2, T.queda + 5, T.queda + 9, T.queda + 14], [1, 0.86, 1.05, 0.98, 1]);
  // brigadeiros pousando dentro
  for (const t of T.brig) sy *= iv(f, [t + 15, t + 17, t + 23], [1, 0.965, 1]);
  // pulinho de felicidade ("o cliente amou")
  const a = T.amou;
  sy *= iv(f, [a - 4, a - 1, a + 1, a + 11, a + 13, a + 18], [1, 0.93, 1.05, 1.04, 0.93, 1]);
  if (f >= a && f <= a + 12) dy -= 34 * Math.sin((Math.PI * (f - a)) / 12);
  // inclina para o balao (cliente fora de quadro, a esquerda)
  if (f >= T.onde && f < T.lisa) rot = iv(f, [T.onde, T.onde + 8], [0, -4.5], EO);
  // cascata: encolhe e vira so mais uma
  if (f >= T.ninguem && f < T.ateQue) {
    const t = iv(f, [T.ninguem, T.ninguem + 15], [0, 1], EIO);
    s = 1 + (S_CELULA - 1) * t;
    base = BASE + (BASE_CELULA - BASE) * t;
  }
  // "ate que..." volta a crescer
  if (f >= T.ateQue && f < tum) {
    const t = iv(f, [T.ateQue, T.ateQue + 13], [0, 1], EO);
    s = S_CELULA + (1 - S_CELULA) * t;
    base = BASE_CELULA + (BASE - BASE_CELULA) * t;
    sy *= iv(f, [tum - 18, tum - 12, tum - 7], [1, 1.035, 1]);
  }
  // TUM
  sy *= iv(f, [tum, tum + 2, tum + 6, tum + 11, tum + 17], [1, 0.87, 1.05, 0.98, 1]);
  if (f >= tum + 14 && f < T.prova) rot = 2.2 * Math.sin(((f - tum - 14) / 37.1) * 2 * Math.PI);
  for (const b of BATIDAS_RISO) sy *= iv(f, [b, b + 2, b + 7], [1, 0.97, 1]);
  // corte seco para a prova: a sacola sai no mesmo quadro
  if (f >= T.prova) vis = false;
  // CTA: ja montada no primeiro quadro (so assenta)
  if (f >= T.cta) {
    vis = true;
    rot = 0;
    cx = POSE_CTA.cx;
    s = POSE_CTA.s;
    base = POSE_CTA.base;
    dy = -60 * (1 - mola(f, T.cta, fps, 13, 200));
    for (const b of BATIDAS_CTA) sy *= iv(f, [b, b + 2, b + 8], [1, 0.97, 1]);
  }

  // olhos
  if (f < T.levei) {
    // olha para o carimbo roxo a direita; acompanha quando ele sobe
    if (f < T.espreitaSai) {
      ox = iv(f, [8, 14], [0, 0.95]);
      oy = iv(f, [8, 14], [0, -0.2]);
      pis = iv(f, [24, 26, 28], [0, 1, 0]);
    } else {
      ex = "cima";
      ox = iv(f, [T.espreitaSai, T.espreitaSai + 6], [0.95, 0.4]);
      oy = -1;
    }
  } else if (f < T.amou) {
    // segue cada brigadeiro: olha para cima enquanto ele paira, desce quando cai
    oy = -0.85;
    for (const t of T.brig) if (f >= t + 8 && f < t + 13 + 6) oy = iv(f, [t + 8, t + 14], [-0.85, 0.5]);
    ex = oy < -0.3 ? "cima" : "neutra";
  } else if (f < T.onde) {
    ex = "feliz";
  } else if (f < T.lisa) {
    ex = "surpresa";
    ox = iv(f, [T.onde, T.onde + 4], [0, -1]);
    oy = -0.2;
  } else if (f < T.ninguem) {
    ex = "seria";
    pis = iv(f, [T.lisa + 20, T.lisa + 23, T.lisa + 26], [0, 1, 0]);
  } else if (f < T.ateQue) {
    ex = "triste";
    ox = 0.15;
    oy = 0.6;
  } else if (f < tum) {
    ex = f < tum - 12 ? "cima" : "surpresa";
    oy = -1;
  } else if (f < tum + 6) {
    ex = "seria";
    pis = 1;
  } else if (f < T.prova) {
    ex = "feliz";
  } else {
    // CTA: contente; nos ultimos 0,6 s olha para o botao (para baixo)
    const olha = DUR - 18;
    ex = f < olha ? "feliz" : "neutra";
    ox = 0.35;
    oy = iv(f, [olha, olha + 4], [0.4, 1]);
  }

  return {
    cx, base: base + dy, s, rot, sy, sx: 1 + (1 - sy) * 0.9,
    ox, oy, pis, ex, car: f >= tum, tinta: iv(f, [tum, tum + 5], [0, 1]), vis,
  };
};

export const Protagonista: React.FC<{ mundo: Mundo }> = ({ mundo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pose(f, fps);
  if (!p.vis) return null;
  const w = LARGURA * p.s;
  const k = w / 600;
  const left = p.cx - 294 * k;
  const top = p.base - 722 * k;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: w,
        height: w * 1.3,
        transformOrigin: `${294 * k}px ${722 * k}px`,
        rotate: `${p.rot}deg`,
        scale: `${p.sx} ${p.sy}`,
      }}
    >
      <Sacola
        largura={w}
        modo={mundo}
        olharX={p.ox}
        olharY={p.oy}
        piscar={p.pis}
        expressao={p.ex}
        carimbada={p.car}
        tinta={p.tinta}
        corTinta={mundo === "riso" ? COR.sombra : COR.roxo}
      />
    </div>
  );
};

// ---------- gancho: o carimbo roxo ja esta no quadro 0 (unica cor no mundo cinza), espreitando ----------
export const CarimboEspreita: React.FC = () => {
  const f = useCurrentFrame();
  if (f > T.espreitaSai + 12) return null;
  const sai = iv(f, [T.espreitaSai, T.espreitaSai + 11], [0, -1100], EIN);
  const entra = iv(f, [0, 10], [-70, 0], EO);
  const bob = 10 * Math.sin((f / 22) * 2 * Math.PI);
  return (
    <>
      {/* sombra projetada na parede, nitida + deslocada (nao e borrao) */}
      <div
        style={{
          position: "absolute",
          left: 884,
          top: 1010 + bob * 0.4,
          width: 230,
          height: 120,
          background: "rgba(20,20,20,0.20)",
          borderRadius: 18,
          opacity: iv(f, [T.espreitaSai, T.espreitaSai + 5], [1, 0]),
          rotate: "-12deg",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 846,
          top: 720 + entra + bob + sai,
          rotate: `${-14 + iv(f, [T.espreitaSai, T.espreitaSai + 10], [0, 18])}deg`,
        }}
      >
        <Carimbo largura={250} />
      </div>
    </>
  );
};

// ---------- brigadeiros: aparecem grandes acima da boca, pairam, caem dentro ----------
// desenhados por cima da sacola e cortados na borda de cima da face frontal (y ~ 845)
const PAIRA = [
  { x: 470, y: 690, r: -12 },
  { x: 615, y: 680, r: 10 },
  { x: 540, y: 700, r: -4 },
];
const BOCA = { x: 545, y: 930 };
export const Brigadeiros: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.brig[0] || f > T.brig[2] + 16) return null;
  return (
    <AbsoluteFill style={{ clipPath: "inset(0px 0px 1075px 0px)" }}>
      {T.brig.map((t0, i) => {
        if (f < t0 || f > t0 + 15) return null;
        const pz = PAIRA[i];
        const m = mola(f, t0, fps, 11, 260);
        const cai = iv(f, [t0 + 8, t0 + 15], [0, 1], EIN);
        const x = pz.x + (BOCA.x - pz.x) * cai;
        const y = pz.y + (BOCA.y - pz.y) * cai;
        return (
          <div key={t0} style={{ position: "absolute", left: x - 85, top: y - 85, scale: m, rotate: `${pz.r + cai * 40}deg` }}>
            <Brigadeiro size={170} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- coracoes de papel ----------
export const Coracoes: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.amou + 4 || f >= T.onde) return null;
  const a = T.amou;
  const cs = [
    { t: a + 5, x: 90, y: 860, s: 150, r: -14 },
    { t: a + 11, x: 840, y: 960, s: 125, r: 12 },
    { t: a + 17, x: 820, y: 700, s: 100, r: -6 },
  ];
  return (
    <>
      {cs.map((c) => {
        if (f < c.t) return null;
        const m = mola(f, c.t, fps, 9, 220);
        return (
          <div
            key={c.t}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              scale: m,
              rotate: `${c.r + (1 - m) * 30}deg`,
              translate: `0px ${-iv(f, [c.t, c.t + 30], [0, 46])}px`,
            }}
          >
            <Coracao size={c.s} cor="#3b3b3b" />
          </div>
        );
      })}
    </>
  );
};

// ---------- cascata de sacolas iguais (papel de parede) ----------
type Fig = { cx: number; base: number; atraso: number; rot: number; dx: number; dy: number };
const COLS = 5;
const ROWS = 7;
const useFigurantes = () =>
  useMemo(() => {
    const out: Fig[] = [];
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        if (i === 2 && j === 3) continue; // lugar da protagonista
        const cx = 108 + i * 216 + (j % 2 ? 14 : -14);
        const base = 300 + j * 265;
        const dist = Math.hypot(cx - 540, base - BASE_CELULA);
        const h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
        const rnd = h - Math.floor(h);
        out.push({ cx, base, atraso: dist, rot: (rnd - 0.5) * 14, dx: cx - 540, dy: base - BASE_CELULA });
      }
    }
    const ordem = [...out].sort((a, b) => a.atraso - b.atraso);
    ordem.forEach((o, n) => (o.atraso = Math.round(n * 0.8)));
    return out;
  }, []);

const Easing2 = (t: number) => 1 - Math.pow(1 - t, 2.4);

export const Cascata: React.FC<{ mundo: Mundo }> = ({ mundo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const figs = useFigurantes();
  if (f < T.ninguem + 2 || f > T.tum + 18) return null;
  const src = staticFile(mundo === "cinza" ? "tridi/fig/sacola_fig_cinza.png" : "tridi/fig/sacola_fig_riso.png");
  const voo = iv(f, [T.tum, T.tum + 16], [0, 1], Easing2);
  return (
    <>
      {figs.map((g, n) => {
        const t0 = T.ninguem + 2 + g.atraso;
        if (f < t0) return null;
        const m = mola(f, t0, fps, 10, 240);
        const len = Math.hypot(g.dx, g.dy) || 1;
        const tx = (g.dx / len) * 1300 * voo;
        const ty = (g.dy / len) * 1300 * voo;
        return (
          <Img
            key={n}
            src={src}
            style={{
              position: "absolute",
              left: g.cx - 118,
              top: g.base - 261,
              width: 240,
              height: 300,
              transformOrigin: "118px 261px",
              scale: m * (1 + 0.35 * voo),
              rotate: `${g.rot + (1 - m) * 25 + voo * (g.dx > 0 ? 25 : -25)}deg`,
              translate: `${tx}px ${ty}px`,
            }}
          />
        );
      })}
      {/* "ate que...": a pilha apaga, so a protagonista fica acesa */}
      <AbsoluteFill
        style={{
          backgroundColor: mundo === "cinza" ? "#121212" : COR.sombra,
          opacity: iv(f, [T.ateQue - 2, T.ateQue + 6, T.tum - 1, T.tum + 1], [0, 0.6, 0.6, 0]),
        }}
      />
    </>
  );
};

// ---------- carimbo descendo + TUM ----------
const LARG_CARIMBO = 360;
const KC = LARG_CARIMBO / CARIMBO_BASE.w;
const Y_PRENSA = IMPACTO.y + 132; // borracha cobre o logo inteiro
const yCarimbo = (f: number) => {
  const { tum } = T;
  if (f < tum - 12) return iv(f, [T.ateQue, tum - 12], [-140, 800], EO);
  if (f < tum - 6) return iv(f, [tum - 12, tum - 6], [800, 720], EO); // antecipacao: sobe um pouco
  if (f < tum) return iv(f, [tum - 6, tum], [720, Y_PRENSA], EIN); // desce seco
  if (f < tum + 3) return Y_PRENSA;
  return iv(f, [tum + 3, tum + 10], [Y_PRENSA, -560], Easing.bezier(0.45, 0, 0.7, 0.35));
};

export const CarimboCena: React.FC = () => {
  const f = useCurrentFrame();
  const { tum } = T;
  if (f < T.ateQue || f > tum + 10) return null;
  const y = yCarimbo(f);
  const prox = iv(y, [600, Y_PRENSA], [0.15, 1]);
  const prensa = f >= tum && f < tum + 3;
  const ant = f >= tum - 12 && f < tum - 6;
  return (
    <>
      {f < tum ? (
        <div
          style={{
            position: "absolute",
            left: IMPACTO.x - 190,
            top: IMPACTO.y - 70,
            width: 380,
            height: 150,
            borderRadius: 30,
            background: "rgba(0,0,0,0.35)",
            opacity: prox,
            scale: 1.4 - 0.4 * prox,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: IMPACTO.x - CARIMBO_BASE.x * KC,
          top: y - CARIMBO_BASE.y * KC,
          transformOrigin: `${CARIMBO_BASE.x * KC}px ${CARIMBO_BASE.y * KC}px`,
          scale: prensa ? "1.05 0.93" : ant ? `${iv(f, [tum - 12, tum - 6], [1, 0.97])} ${iv(f, [tum - 12, tum - 6], [1, 1.04])}` : "1 1",
          rotate: `${iv(f, [T.ateQue, tum - 12, tum], [-8, -3, 0])}deg`,
        }}
      >
        <Carimbo largura={LARG_CARIMBO} />
      </div>
    </>
  );
};
