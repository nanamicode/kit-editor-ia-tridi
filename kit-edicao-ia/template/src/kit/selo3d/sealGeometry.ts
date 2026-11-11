/**
 * sealGeometry — geometria real do selo dourado (sem imagens), reutilizavel em qualquer cena 3D.
 *  - Corpo: disco com borda serrilhada (48 dentes) extrudado com bisel.
 *  - Relevos: anel externo, perolas, aneis internos, mini-estrelas, sunburst e ICONE central.
 *  - Icone central: estrela facetada de N pontas (padrao 5) ou qualquer path SVG (logo da marca).
 *  - Estilhacos: 20 pecas em 3 aneis com emendas serrilhadas (getSealChunks) + as mesmas emendas
 *    como polilinhas (getSealSeams), para desenhar a rachadura exatamente onde o selo vai abrir.
 * Unidades: raio da ponta dos dentes = 1. Tudo em cache por modulo (gera 1x por aba do Chrome).
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

export const SEAL_TEETH = 48;
export const R_TIP = 1.0;
export const R_VAL = 0.93;

const TAU = Math.PI * 2;
const BASE_DEPTH = 0.05;
const BASE_BT = 0.018;
const BASE_BS = 0.012;
/** z do topo do corpo (centrado em z=0). */
export const BASE_TOP = BASE_DEPTH / 2 + BASE_BT;

const RINGS: Array<[number, number]> = [
  [0.865, 0.905],
  [0.765, 0.785],
  [0.585, 0.615],
];
const BEADS = 64;
const BEAD_R = 0.835;
const MINI_STARS = 16;
const MINI_STAR_R = 0.675;
const RAYS = 72;

/** Icone do relevo central. */
export type SealIcon =
  /** estrela facetada (degrau extrudado + piramide). points 5 = V02. inner = raio interno / externo. */
  | { type: "star"; points?: number; inner?: number }
  /**
   * qualquer path SVG (logo, letra, simbolo). `d` = atributo d de <path>. Centralizado e escalado
   * para caber no circulo central (raio `fit`, padrao 0.46). Furos (letras O, A) funcionam se o path
   * usar subpaths com sentido oposto ou fill-rule evenodd.
   */
  | { type: "svg"; d: string; fit?: number; depth?: number };

export const DEFAULT_ICON: SealIcon = { type: "star", points: 5, inner: 0.4375 };

function prep(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const o = g.index ? g.toNonIndexed() : g;
  Object.keys(o.attributes).forEach((k) => {
    if (k !== "position" && k !== "normal" && k !== "uv") o.deleteAttribute(k);
  });
  if (!o.attributes.uv) {
    o.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(o.attributes.position.count * 2), 2));
  }
  return o;
}

function extrude(
  shape: THREE.Shape | THREE.Shape[],
  depth: number,
  bt: number,
  bs: number,
  curveSegments: number,
  bevelSegments = 3,
): THREE.BufferGeometry {
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bt,
    bevelSize: bs,
    bevelOffset: -bs,
    bevelSegments,
    curveSegments,
  });
}

/** Vertices da borda serrilhada entre os indices k0..k1 (par = ponta, impar = vale). */
function toothVerts(k0: number, k1: number): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (let k = k0; k <= k1; k++) {
    const a = (k * Math.PI) / SEAL_TEETH;
    const r = k % 2 === 0 ? R_TIP : R_VAL;
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  return pts;
}

function baseShape(): THREE.Shape {
  const s = new THREE.Shape();
  const pts = toothVerts(0, SEAL_TEETH * 2 - 1);
  s.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y);
  s.closePath();
  return s;
}

function annulusShape(ro: number, ri: number, a0: number, a1: number): THREE.Shape {
  const full = a1 - a0 >= TAU - 1e-6;
  const s = new THREE.Shape();
  if (full) {
    s.absarc(0, 0, ro, 0, TAU, false);
    const h = new THREE.Path();
    h.absarc(0, 0, ri, 0, TAU, true);
    s.holes.push(h);
  } else {
    s.moveTo(ro * Math.cos(a0), ro * Math.sin(a0));
    s.absarc(0, 0, ro, a0, a1, false);
    s.lineTo(ri * Math.cos(a1), ri * Math.sin(a1));
    s.absarc(0, 0, ri, a1, a0, true);
    s.closePath();
  }
  return s;
}

function starShape(rOut: number, rIn: number, points = 5): THREE.Shape {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn;
    const a = (i * Math.PI) / points;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

/** Espelha em z (verso do selo) corrigindo a ordem dos triangulos. */
function mirrorZ(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const o = g.clone();
  const p = o.attributes.position;
  const n = o.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    p.setZ(i, -p.getZ(i));
    n.setZ(i, -n.getZ(i));
  }
  (["position", "normal", "uv"] as const).forEach((name) => {
    const a = o.attributes[name];
    if (!a) return;
    const k = a.itemSize;
    const arr = a.array as Float32Array;
    for (let i = 0; i < a.count; i += 3) {
      for (let c = 0; c < k; c++) {
        const i1 = (i + 1) * k + c;
        const i2 = (i + 2) * k + c;
        const tmp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = tmp;
      }
    }
  });
  return o;
}

/** Relevo assentado sobre a face frontal do corpo. */
function onTop(g: THREE.BufferGeometry, bt: number, extraZ = 0): THREE.BufferGeometry {
  g.translate(0, 0, BASE_TOP - 0.004 + bt + extraZ);
  return g;
}

export type SealPieces = {
  /** corpo + raios: acabamento acetinado */
  satin: THREE.BufferGeometry;
  /** aneis, perolas, estrelinhas: acabamento polido */
  polish: THREE.BufferGeometry;
};

let piecesCache: SealPieces | null = null;

/** Selo inteiro, SEM o icone central (ver getSealCore). */
export function getSealPieces(): SealPieces {
  if (piecesCache) return piecesCache;
  const satin: THREE.BufferGeometry[] = [];
  const polish: THREE.BufferGeometry[] = [];

  const base = extrude(baseShape(), BASE_DEPTH, BASE_BT, BASE_BS, 8, 3);
  base.translate(0, 0, -BASE_DEPTH / 2);
  satin.push(base);

  for (let i = 0; i < RAYS; i++) {
    const ang = ((i + 0.5) * TAU) / RAYS;
    const box = new THREE.BoxGeometry(0.35, 0.02, 0.042);
    box.translate(0.375, 0, 0);
    box.rotateZ(ang);
    box.translate(0, 0, BASE_TOP + 0.012);
    satin.push(box);
  }

  RINGS.forEach(([ro, ri]) => {
    const ring = onTop(extrude(annulusShape(ro, ri, 0, TAU), 0.046, 0.016, 0.012, 160, 4), 0.016);
    polish.push(ring);
    polish.push(mirrorZ(ring));
  });

  for (let i = 0; i < BEADS; i++) {
    const ang = ((i + 0.5) * TAU) / BEADS;
    const b = new THREE.SphereGeometry(0.03, 14, 10);
    b.translate(BEAD_R, 0, 0);
    b.rotateZ(ang);
    b.translate(0, 0, BASE_TOP + 0.012);
    polish.push(b);
  }

  for (let i = 0; i < MINI_STARS; i++) {
    const ang = ((i + 0.5) * TAU) / MINI_STARS;
    const st = onTop(extrude(starShape(0.075, 0.032, 5), 0.034, 0.012, 0.006, 4, 3), 0.012);
    st.translate(MINI_STAR_R, 0, 0);
    st.rotateZ(ang);
    polish.push(st);
  }

  piecesCache = {
    satin: mergeGeometries(satin.map(prep), false)!,
    polish: mergeGeometries(polish.map(prep), false)!,
  };
  return piecesCache;
}

/** Piramide facetada de N pontas: cada face reflete uma luz diferente (contraste de relevo no metal liso). */
function facetedStar(rOut: number, rIn: number, h: number, points: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const n = points * 2;
  const pt = (i: number): [number, number] => {
    const r = i % 2 === 0 ? rOut : rIn;
    const a = (i * Math.PI) / points;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pt(i);
    const [x1, y1] = pt((i + 1) % n);
    pos.push(0, 0, h, x0, y0, 0, x1, y1, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  return g;
}

/** Shapes de um path SVG, centralizados, y para cima, cabendo no raio `fit`. */
export function svgPathToShapes(d: string, fit = 0.46): THREE.Shape[] {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  const raw: Array<{ outer: THREE.Vector2[]; holes: THREE.Vector2[][] }> = [];
  data.paths.forEach((p) => {
    SVGLoader.createShapes(p).forEach((s) => {
      const e = s.extractPoints(12);
      raw.push({ outer: e.shape, holes: e.holes });
    });
  });
  const all = raw.flatMap((r) => r.outer);
  if (all.length === 0) return [];
  const box = new THREE.Box2().setFromPoints(all);
  const c = box.getCenter(new THREE.Vector2());
  // cabe no circulo: usa o ponto mais distante do centro
  const rMax = Math.max(...all.map((p) => p.distanceTo(c))) || 1;
  const k = fit / rMax;
  const map = (p: THREE.Vector2) => new THREE.Vector2((p.x - c.x) * k, -(p.y - c.y) * k);
  return raw.map((r) => {
    const s = new THREE.Shape(r.outer.map(map));
    r.holes.forEach((h) => s.holes.push(new THREE.Path(h.map(map))));
    return s;
  });
}

const coreCache = new Map<string, THREE.BufferGeometry>();

/** Icone central (peca unica, polida, frente e verso). */
export function getSealCore(icon: SealIcon = DEFAULT_ICON): THREE.BufferGeometry {
  const key = JSON.stringify(icon);
  const hit = coreCache.get(key);
  if (hit) return hit;
  const parts: THREE.BufferGeometry[] = [];
  if (icon.type === "star") {
    const n = Math.max(3, Math.round(icon.points ?? 5));
    const inner = icon.inner ?? 0.4375;
    const SD = 0.16;
    const SB = 0.034;
    const star = onTop(extrude(starShape(0.48, 0.48 * inner, n), SD, SB, 0.026, 4, 5), SB);
    star.rotateZ(Math.PI / 2);
    parts.push(star, mirrorZ(star));
    const starTop = BASE_TOP - 0.004 + SD + 2 * SB;
    const pyr = facetedStar(0.41, 0.41 * (0.17 / 0.41) * (inner / 0.4375), 0.085, n);
    pyr.rotateZ(Math.PI / 2);
    pyr.translate(0, 0, starTop - 0.004);
    parts.push(pyr, mirrorZ(pyr));
    const hubShape = new THREE.Shape();
    hubShape.absarc(0, 0, 0.07, 0, TAU, false);
    const hub = extrude(hubShape, 0.02, 0.012, 0.008, 40, 3);
    hub.translate(0, 0, starTop - 0.004 + 0.085);
    parts.push(hub);
  } else {
    const shapes = svgPathToShapes(icon.d, icon.fit ?? 0.46);
    const SD = icon.depth ?? 0.12;
    const SB = 0.026;
    const g = onTop(extrude(shapes, SD, SB, 0.014, 10, 4), SB);
    parts.push(g, mirrorZ(g));
  }
  const out = mergeGeometries(parts.map(prep), false)!;
  coreCache.set(key, out);
  return out;
}

// ------------------------------------------------------------ estilhacos (chunks)

export type SealChunk = {
  /** base extrudada, com grupos: 0 = faces (acetinado), 1 = laterais + bisel (polido) */
  base: THREE.BufferGeometry;
  rays: THREE.BufferGeometry | null;
  polish: THREE.BufferGeometry | null;
  cx: number;
  cy: number;
  mid: number;
  band: 0 | 1 | 2;
};

const BAND_R: Array<[number, number]> = [
  [0, 0.4],
  [0.4, 0.795],
  [0.795, 1.0],
];
/** [inicio em graus, quantidade, passo em graus] por faixa (emendas desencontradas, tipo tijolo) */
const BAND_SPLIT: Array<[number, number, number]> = [
  [10, 4, 90],
  [25, 8, 45],
  [0, 8, 45],
];
const AMP_ARC = 0.016;
const AMP_SEAM = 0.03;

function hash2(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function arcPoint(R: number, deg: number, amp: number): THREE.Vector2 {
  const k = Math.round(deg / 2.5);
  const rr = R + amp * (hash2(R * 100, k) * 2 - 1);
  const a = (deg * Math.PI) / 180;
  return new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr);
}

function seamInterior(deg: number, rA: number, rB: number, steps: number, amp: number): THREE.Vector2[] {
  const lo = Math.min(rA, rB);
  const hi = Math.max(rA, rB);
  const a = (deg * Math.PI) / 180;
  const pts: THREE.Vector2[] = [];
  for (let i = 1; i < steps; i++) {
    const r = lo + ((hi - lo) * i) / steps;
    const off = amp * ((i % 2 === 0 ? 1 : -1) * (0.55 + 0.45 * hash2(deg, i)));
    pts.push(new THREE.Vector2(Math.cos(a) * r - Math.sin(a) * off, Math.sin(a) * r + Math.cos(a) * off));
  }
  return rA <= rB ? pts : pts.reverse();
}

function chunkShape(band: 0 | 1 | 2, d0: number, d1: number): THREE.Shape {
  const [r0, r1] = BAND_R[band];
  const pts: THREE.Vector2[] = [];
  if (band === 2) {
    const per = 180 / SEAL_TEETH;
    pts.push(...toothVerts(Math.round(d0 / per), Math.round(d1 / per)));
  } else {
    for (let d = d0; d <= d1 + 1e-6; d += 2.5) pts.push(arcPoint(r1, d, AMP_ARC));
  }
  const outEnd = pts[pts.length - 1].length();
  const outStart = pts[0].length();
  const inAt = (d: number) => (r0 === 0 ? new THREE.Vector2(0, 0) : arcPoint(r0, d, AMP_ARC));
  pts.push(...seamInterior(d1, outEnd, inAt(d1).length(), 5, AMP_SEAM));
  if (r0 === 0) pts.push(new THREE.Vector2(0, 0));
  else for (let d = d1; d >= d0 - 1e-6; d -= 2.5) pts.push(arcPoint(r0, d, AMP_ARC));
  pts.push(...seamInterior(d0, inAt(d0).length(), outStart, 5, AMP_SEAM));
  const s = new THREE.Shape();
  s.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y);
  s.closePath();
  return s;
}

let chunkCache: SealChunk[] | null = null;

export function getSealChunks(): SealChunk[] {
  if (chunkCache) return chunkCache;
  const out: SealChunk[] = [];
  const bands: Array<0 | 1 | 2> = [0, 1, 2];
  for (const band of bands) {
    const [r0, r1] = BAND_R[band];
    const [start, count, step] = BAND_SPLIT[band];
    for (let c = 0; c < count; c++) {
      const d0 = start + c * step;
      const d1 = d0 + step;
      const a0 = (d0 * Math.PI) / 180;
      const a1 = (d1 * Math.PI) / 180;
      const norm = (a: number) => ((a % TAU) + TAU) % TAU;
      const na0 = norm(a0);
      const w = a1 - a0;
      const inChunk = (ang: number) => norm(ang - na0) < w - 1e-9;

      const baseG = extrude(chunkShape(band, d0, d1), BASE_DEPTH, BASE_BT, BASE_BS, 4, 3);
      baseG.translate(0, 0, -BASE_DEPTH / 2);

      const rays: THREE.BufferGeometry[] = [];
      const lo = Math.max(0.2, r0);
      const hi = Math.min(0.55, r1);
      for (let i = 0; i < RAYS && hi - lo > 0.01; i++) {
        const ang = ((i + 0.5) * TAU) / RAYS;
        if (!inChunk(ang)) continue;
        const box = new THREE.BoxGeometry(hi - lo, 0.02, 0.042);
        box.translate((lo + hi) / 2, 0, 0);
        box.rotateZ(ang);
        box.translate(0, 0, BASE_TOP + 0.012);
        rays.push(box);
      }

      const polish: THREE.BufferGeometry[] = [];
      RINGS.forEach(([ro, ri]) => {
        if (Math.max(ro, ri) < r0 || Math.min(ro, ri) > r1) return;
        const ring = onTop(extrude(annulusShape(ro, ri, a0, a1), 0.046, 0.016, 0.012, 10, 4), 0.016);
        polish.push(ring, mirrorZ(ring));
      });
      if (band === 2) {
        for (let i = 0; i < BEADS; i++) {
          const ang = ((i + 0.5) * TAU) / BEADS;
          if (!inChunk(ang)) continue;
          const b = new THREE.SphereGeometry(0.03, 14, 10);
          b.translate(BEAD_R, 0, 0);
          b.rotateZ(ang);
          b.translate(0, 0, BASE_TOP + 0.012);
          polish.push(b);
        }
      }
      if (band === 1) {
        for (let i = 0; i < MINI_STARS; i++) {
          const ang = ((i + 0.5) * TAU) / MINI_STARS;
          if (!inChunk(ang)) continue;
          const st = onTop(extrude(starShape(0.075, 0.032, 5), 0.034, 0.012, 0.006, 4, 3), 0.012);
          st.translate(MINI_STAR_R, 0, 0);
          st.rotateZ(ang);
          polish.push(st);
        }
      }

      const mid = (a0 + a1) / 2;
      const rm = band === 0 ? 0.2 : (r0 + r1) / 2;
      out.push({
        base: baseG,
        rays: rays.length ? mergeGeometries(rays.map(prep), false)! : null,
        polish: polish.length ? mergeGeometries(polish.map(prep), false)! : null,
        cx: Math.cos(mid) * rm,
        cy: Math.sin(mid) * rm,
        mid,
        band,
      });
    }
  }
  chunkCache = out;
  return out;
}

/** Uma emenda entre estilhacos: polilinha (unidades do selo) + raio onde comeca (para animar de dentro p/ fora). */
export type SealSeam = { pts: THREE.Vector2[]; r0: number };

let seamCache: SealSeam[] | null = null;

/**
 * As MESMAS emendas usadas por getSealChunks, como polilinhas: emendas radiais de cada faixa
 * (zigue-zague identico) + arcos entre faixas (r 0.4 e 0.795). A rachadura desenhada por cima
 * coincide com as bordas das pecas que vao voar: leitura organizada, nada de linhas aleatorias.
 */
export function getSealSeams(): SealSeam[] {
  if (seamCache) return seamCache;
  const out: SealSeam[] = [];
  [0, 1, 2].forEach((band) => {
    const [r0, r1] = BAND_R[band];
    const [start, count, step] = BAND_SPLIT[band];
    for (let c = 0; c < count; c++) {
      const d = start + c * step;
      const outer = band === 2 ? R_TIP : arcPoint(r1, d, AMP_ARC).length();
      const inner = r0 === 0 ? 0 : arcPoint(r0, d, AMP_ARC).length();
      const a = (d * Math.PI) / 180;
      const p = (r: number) => new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);
      out.push({ pts: [p(inner), ...seamInterior(d, inner, outer, 5, AMP_SEAM), p(outer)], r0 });
      // arco externo da faixa (fronteira com a faixa seguinte), deste ate o proximo angulo
      if (band < 2) {
        const pts: THREE.Vector2[] = [];
        for (let dd = d; dd <= d + step + 1e-6; dd += 2.5) pts.push(arcPoint(r1, dd, AMP_ARC));
        out.push({ pts, r0: r1 });
      }
    }
  });
  seamCache = out;
  return out;
}
