/**
 * Resolve os DADOS dos clipes (segundos) em quadros absolutos de composicao:
 * cortes, pre/pos-roll de cada transicao, speed-ramp, quadro da pressao (P) e do relevo (R),
 * camera e rotulo. Tudo deterministico e sem tempo chumbado: os defaults sao relativos
 * ao corte e a pressao. Os numeros em "quadros" sao a 30 fps e escalam com fr().
 */
import { f } from "../theme";
import type { BRollClip, BRollMode, ClipPlan, Seg, TransitionKind } from "./types";

/** quadros "de 30 fps" convertidos ao fps real */
export const fr = (n: number, fps: number) => Math.round((n * fps) / 30);

/** pre-roll (entrada antes do corte, negativo) e pos-roll (saida do clipe anterior depois do corte) */
export const TRANSITION_ROLL: Record<TransitionKind, { pre: number; post: number }> = {
  cut: { pre: 0, post: 0 },
  whip: { pre: -4, post: 5 },
  flash: { pre: 0, post: 2 },
  iris: { pre: -4, post: 8 },
  glitch: { pre: 0, post: 1 },
  wipe: { pre: -4, post: 7 },
};

export const DEFAULT_TRANSITIONS: TransitionKind[] = ["whip", "flash", "iris", "glitch", "wipe"];

const LABEL_Y: Record<BRollMode, number> = { full: 1500, card: 1585, strip: 1585 };

type Ease = (t: number) => number;

/** interpolacao por partes com easing por trecho */
export const piece = (frame: number, keys: number[], vals: number[], easing: Ease | Ease[]) => {
  if (frame <= keys[0]) return vals[0];
  const last = keys.length - 1;
  if (frame >= keys[last]) return vals[last];
  for (let i = 0; i < last; i++) {
    if (frame < keys[i + 1]) {
      const t = (frame - keys[i]) / (keys[i + 1] - keys[i]);
      const e = Array.isArray(easing) ? easing[Math.min(i, easing.length - 1)] : easing;
      return vals[i] + (vals[i + 1] - vals[i]) * e(t);
    }
  }
  return vals[last];
};

type Wp = readonly [frame: number, src: number];

const buildSegs = (enter: number, wps: Wp[], exit: number, fps: number) => {
  const q = (s: number) => Math.round(s * fps) / fps;
  const segs: Seg[] = [];
  const [f0, s0] = wps[0];
  if (enter < f0) segs.push({ kind: "hold", start: enter, frames: f0 - enter, src: q(s0) });
  for (let i = 0; i < wps.length - 1; i++) {
    const [fa, sa] = wps[i];
    const [fb, sb] = wps[i + 1];
    const a = q(sa);
    const b = q(sb);
    const frames = fb - fa;
    if (frames <= 0) continue;
    const rate = ((b - a) * fps) / frames;
    // blend de quadros so em camera lenta extrema (evita dupla exposicao)
    segs.push({ kind: "play", start: fa, frames, src0: a, src1: b, rate, blend: rate < 0.3 });
  }
  const [fl, sl] = wps[wps.length - 1];
  if (exit > fl) segs.push({ kind: "hold", start: fl, frames: exit - fl, src: q(sl) });
  return { segs, holdStart: fl };
};

/** speed-ramp automatico em quadros relativos ao corte: aproxima rapido, antecipa, slow-mo no impacto, acelera, hold */
const autoRamp = (c: BRollClip, durF: number, fps: number): Wp[] => {
  const from = c.fromSec;
  const to = c.toSec;
  const press = c.pressSec;
  if (press === undefined || press <= from || press >= to) {
    return [
      [0, from],
      [Math.max(1, durF), to - 0.5 / fps],
    ];
  }
  const p4 = fr(4, fps);
  const pre = Math.max(from, press - 0.06);
  const approach = Math.max(fr(2, fps), Math.round(((pre - from) * fps) / 1.35));
  const Pf = approach + p4;
  const s1 = Math.min(to - 0.02, press + 0.13);
  const s2 = Math.min(to - 0.01, press + 0.23);
  const end = Math.max(s2, to - 0.12);
  let tail = Math.max(fr(3, fps), Math.round(((end - s2) * fps) / 2.2));
  const lastF = Pf + fr(11, fps) + tail;
  // deixa >= 6 q de hold antes do proximo corte (varredura de luz no relevo): encurta a cauda
  const lim = durF - fr(6, fps);
  if (lastF > lim) tail = Math.max(1, tail - (lastF - lim));
  const wps: Wp[] = [
    [0, from],
    [approach, pre],
    [Pf, press],
    [Pf + fr(7, fps), s1],
    [Pf + fr(11, fps), s2],
    [Pf + fr(11, fps) + tail, end],
  ];
  return wps.filter((w, i) => i === 0 || w[0] > wps[i - 1][0]);
};

/** quadro (absoluto) em que o ramp passa pelo instante-fonte `src` */
const invert = (segs: Seg[], src: number, fps: number): number | null => {
  const s = Math.round(src * fps) / fps;
  for (const g of segs) {
    if (g.kind !== "play") continue;
    const lo = Math.min(g.src0, g.src1);
    const hi = Math.max(g.src0, g.src1);
    if (s >= lo - 1e-6 && s <= hi + 1e-6) {
      const t = g.src1 === g.src0 ? 0 : (s - g.src0) / (g.src1 - g.src0);
      return Math.round(g.start + t * g.frames);
    }
  }
  return null;
};

const autoTitleSize = (lines: string[]) => {
  const n = Math.max(...lines.map((l) => Array.from(l).length), 1);
  const cap = lines.length > 1 ? 132 : 156;
  return Math.max(96, Math.min(cap, Math.floor(760 / (0.46 * n))));
};

/** chaves estritamente crescentes (a partir de lo) */
const monotonic = (keys: number[], lo: number) => {
  const out: number[] = [];
  for (const k of keys) {
    const prev = out.length ? out[out.length - 1] : lo - 1;
    out.push(Math.max(k, prev + 1));
  }
  return out;
};

export const planClips = (clips: BRollClip[], startSec: number, fps: number) => {
  const n = clips.length;
  const durs = clips.map((c) => c.durSec ?? Math.max(0.2, c.toSec - c.fromSec));
  const cutSec: number[] = [];
  let acc = startSec;
  for (const d of durs) {
    cutSec.push(acc);
    acc += d;
  }
  const cuts = cutSec.map((s) => f(s, fps));
  const end = f(acc, fps);
  const tIn = clips.map<TransitionKind>((c, i) =>
    i === 0 ? "cut" : (c.transitionIn ?? DEFAULT_TRANSITIONS[(i - 1) % DEFAULT_TRANSITIONS.length]),
  );
  let cardCount = 0;

  const plans: ClipPlan[] = clips.map((c, i) => {
    const mode: BRollMode = c.mode ?? "full";
    const last = i === n - 1;
    const cut = cuts[i];
    const next = last ? end : cuts[i + 1];
    const enter = i === 0 ? cut : cut + fr(TRANSITION_ROLL[tIn[i]].pre, fps);
    const exit = last ? end : next + fr(TRANSITION_ROLL[tIn[i + 1]].post, fps);

    const relWps: Wp[] = c.ramp
      ? c.ramp.map(([t, s]) => [f(t, fps), s] as const)
      : autoRamp(c, next - cut, fps);
    const wps: Wp[] = relWps.map(([fr0, s]) => [cut + fr0, s] as const);
    const { segs, holdStart } = buildSegs(enter, wps, exit, fps);

    const focus = c.focus ?? ([0.5, 0.5] as const);
    const relief = {
      u: c.relief?.u ?? focus[0],
      v: c.relief?.v ?? focus[1],
      w: c.relief?.w ?? 0.3,
      h: c.relief?.h ?? 0.22,
      rot: c.relief?.rot ?? 0,
    };
    const P = c.pressSec !== undefined ? invert(segs, c.pressSec, fps) : null;
    const R = P !== null ? P + fr(7, fps) : c.relief ? Math.round((cut + next) / 2) : null;

    let cam: ClipPlan["cam"];
    if (c.camera && c.camera.length) {
      const keys = monotonic(c.camera.map((k) => cut + f(k.t, fps)), cut);
      cam = {
        keys,
        u: c.camera.map((k) => k.u),
        v: c.camera.map((k) => k.v),
        z: c.camera.map((k) => k.z),
      };
    } else if (P !== null) {
      const hs = Math.max(holdStart, P + fr(11, fps));
      const keys = monotonic([cut, P - fr(4, fps), P, P + fr(10, fps), hs, Math.max(exit, hs + 1)], cut);
      const u0 = 0.5 + (focus[0] - 0.5) * 0.3;
      const v0 = 0.5 + (focus[1] - 0.5) * 0.3;
      const um = (focus[0] + relief.u) / 2;
      const vm = (focus[1] + relief.v) / 2;
      cam = {
        keys,
        u: [u0, focus[0], focus[0], um, relief.u, relief.u],
        v: [v0, focus[1], focus[1], vm, relief.v, relief.v],
        z: [1.0, 1.12, 1.32, 1.26, 1.24, 1.36],
      };
    } else {
      cam = { keys: [cut, Math.max(exit, cut + 1)], u: [focus[0], focus[0]], v: [focus[1], focus[1]], z: [1.0, 1.15] };
    }

    const lines = c.title.split("\n").filter(Boolean).slice(0, 2);
    const L = c.label ?? {};
    const tilt = mode === "card" ? (c.tilt ?? (cardCount++ % 2 === 0 ? -2.2 : 1.9)) : 0;
    return {
      i,
      mode,
      enter,
      cut,
      next,
      exit,
      P,
      R,
      holdStart,
      segs,
      cam,
      focus,
      relief,
      hasRelief: R !== null,
      lines,
      titleSize: c.titleSize ?? autoTitleSize(lines),
      support: c.support ?? "",
      labelIn: cut + f(L.inSec ?? (i === 0 ? -0.2667 : 0.1), fps),
      labelOut: next + f(L.outSec ?? -0.2333, fps),
      side: L.side ?? "left",
      labelY: L.y ?? LABEL_Y[mode],
      labelTop: (L.layer ?? (last ? "top" : "clip")) === "top",
      tilt,
      spot: c.spot ?? (mode === "card" ? 0.2 : 0.3),
      tIn: tIn[i],
      last,
    };
  });
  return { plans, cuts, end, start: cuts[0] ?? f(startSec, fps) };
};

export type Plan = ReturnType<typeof planClips>;
