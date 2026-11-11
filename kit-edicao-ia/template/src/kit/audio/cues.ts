/**
 * Cues de audio -> instantes para sincronizar animacoes aos SFX.
 * Fonte: cues_resolvidos.json / modulo TS gerado por `scripts/audio_trilha_sfx.py --ts`
 * (ou o cues.json legado do V02: "impacto" + nome pressao/relevo/stinger, "cta" = ui).
 * Tempo sempre em SEGUNDOS de composicao.
 *
 * Uso tipico:
 *   const cues = parseCues(CUES);
 *   const relevos = cueTimes(cues, "relevo");
 *   const punch = useCuePulse(relevos, { attack: 0.03, release: 0.25 }); // 0..1, pico no SFX
 */
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type CueTipo =
  | "corte"
  | "pressao"
  | "relevo"
  | "riser"
  | "revelacao"
  | "ui"
  | "ding"
  | "stinger"
  | "fala";

/** item cru como sai do JSON (inclui o item {tipo:"info"} com bpm, grade, fala, derivados) */
export type RawCue = { tipo: string; t?: number; nome?: string; [k: string]: unknown };

export type Cue = { t: number; tipo: CueTipo; nome: string; fim?: number; raw: RawCue };

export type CueInfo = {
  bpm?: number;
  grid_offset_s?: number;
  semicolcheia_s?: number;
  fala?: [number, number][];
  downbeats_s?: number[];
  revelacao_s?: number | null;
  riser_s?: [number, number] | null;
  silencio_s?: [number, number] | null;
  [k: string]: unknown;
};

const TIPOS: CueTipo[] = ["corte", "pressao", "relevo", "riser", "revelacao", "ui", "ding", "stinger", "fala"];

const normTipo = (c: RawCue): CueTipo | null => {
  const tipo = String(c.tipo).toLowerCase();
  const nome = String(c.nome ?? "").toLowerCase();
  if (tipo === "impacto") {
    if (nome.includes("relevo")) return "relevo";
    if (nome.includes("stinger")) return "stinger";
    return "pressao";
  }
  if (tipo === "cta") return "ui";
  return (TIPOS as string[]).includes(tipo) ? (tipo as CueTipo) : null;
};

/** normaliza e ordena; descarta o item info e tipos desconhecidos */
export const parseCues = (raw: readonly RawCue[]): Cue[] =>
  raw
    .filter((c) => typeof c.t === "number" && c.tipo !== "info")
    .map((c) => ({ c, tipo: normTipo(c) }))
    .filter((x): x is { c: RawCue; tipo: CueTipo } => x.tipo !== null)
    .map(({ c, tipo }) => ({
      t: c.t as number,
      tipo,
      nome: String(c.nome ?? tipo),
      fim: typeof c.fim === "number" ? c.fim : undefined,
      raw: c,
    }))
    .sort((a, b) => a.t - b.t);

/** item {tipo:"info"} (bpm, grade, fala, downbeats, revelacao, riser...) */
export const cueInfo = (raw: readonly RawCue[]): CueInfo =>
  (raw.find((c) => c.tipo === "info") ?? {}) as CueInfo;

/** instantes (s) de um ou mais tipos */
export const cueTimes = (cues: readonly Cue[], tipo: CueTipo | CueTipo[]): number[] => {
  const set = Array.isArray(tipo) ? tipo : [tipo];
  return cues.filter((c) => set.includes(c.tipo)).map((c) => c.t);
};

/** ultimo instante <= tSec (ou null) */
export const lastCue = (times: readonly number[], tSec: number): number | null => {
  let best: number | null = null;
  for (const x of times) if (x <= tSec && (best === null || x > best)) best = x;
  return best;
};

/** proximo instante > tSec (ou null) */
export const nextCue = (times: readonly number[], tSec: number): number | null => {
  let best: number | null = null;
  for (const x of times) if (x > tSec && (best === null || x < best)) best = x;
  return best;
};

/** segundos desde o ultimo cue (Infinity se nenhum) */
export const secSinceCue = (times: readonly number[], tSec: number): number => {
  const l = lastCue(times, tSec);
  return l === null ? Infinity : tSec - l;
};

/** grade musical: tempo da semicolcheia n (0 = offset) */
export const gridTime = (info: CueInfo, n: number): number =>
  (info.grid_offset_s ?? 0) + n * (info.semicolcheia_s ?? 60 / (info.bpm ?? 120) / 4);

/** tempo atual da composicao em segundos */
export const useTimeSec = (): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/**
 * Pulso 0..1 sincronizado ao cue mais recente: sobe em `attack` s (comeca `lead` s antes do cue,
 * para o pico visual coincidir com o transiente) e cai em `release` s. Usa so frame + interpolate.
 */
export const useCuePulse = (
  times: readonly number[],
  opts: { attack?: number; release?: number; lead?: number } = {},
): number => {
  const { attack = 0.03, release = 0.25, lead = 0 } = opts;
  const t = useTimeSec() + lead;
  const nx = nextCue(times, t);
  const pre = nx !== null && nx - t < attack ? interpolate(nx - t, [0, attack], [1, 0]) : 0;
  const since = secSinceCue(times, t);
  const post = Number.isFinite(since)
    ? interpolate(since, [0, release], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;
  return Math.max(pre, post);
};

/** true durante um trecho de fala (info.fala ou cues tipo "fala") */
export const isSpeaking = (raw: readonly RawCue[], tSec: number): boolean => {
  const info = cueInfo(raw);
  const segs: [number, number][] = [...(info.fala ?? [])];
  for (const c of parseCues(raw)) if (c.tipo === "fala" && c.fim !== undefined) segs.push([c.t, c.fim]);
  return segs.some(([a, b]) => tSec >= a && tSec <= b);
};
