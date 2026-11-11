/**
 * GoldSeal — selo metalico 3D (geometria de sealGeometry), material PBR, mapa de ambiente procedural.
 * Usar DENTRO de um <ThreeCanvas width height>. Nenhuma animacao propria: tudo por props calculadas
 * por quadro (useCurrentFrame) por quem usa. Sem useFrame.
 *   <SealLights />
 *   <GoldSeal tones={goldTones(brand.colors.accent)} tint={brand.colors.primaryLight} position rotation scale />
 * Raio do selo = 1 * scale (unidades de mundo).
 */
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BRAND_ROXO_DOURADO } from "../theme";
import { BASE_TOP, DEFAULT_ICON, getSealChunks, getSealCore, getSealPieces, getSealSeams, type SealIcon } from "./sealGeometry";

// ------------------------------------------------------------- tons derivados

type HSL = [number, number, number];
const hexToHsl = (hex: string): HSL => {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((c) => c + c).join("") : v, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s, l];
};
const hslToHex = ([h, s, l]: HSL): string => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (v: number) => Math.round(Math.min(1, Math.max(0, v + m)) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
};

/**
 * Tons do metal. Calibrados no V02: com accent #F5C542 saem exatamente os tons aprovados.
 * Para outra cor de acento, cada tom mantem a mesma relacao (desvio de matiz, razao de saturacao e luz).
 */
const REF = {
  accent: "#F5C542",
  satin: "#A8700A", // corpo acetinado
  polish: "#F0B92E", // aneis, perolas, icone
  glow: "#E8861A", // emissivo (calor do impacto)
  crackDark: "#3A2200",
  crackLight: "#FFF6D6",
  ring: "#FFE9A8", // anel de choque claro
  cream: "#FFFBEC", // nucleo do clarao aditivo
  creamMid: "#FFE896", // meio do clarao
};
export type GoldTones = {
  satin: string;
  polish: string;
  glow: string;
  crackDark: string;
  crackLight: string;
  ring: string;
  cream: string;
  creamMid: string;
};
const toneCache = new Map<string, GoldTones>();
export function goldTones(accent: string): GoldTones {
  const hit = toneCache.get(accent);
  if (hit) return hit;
  const A = hexToHsl(REF.accent);
  const a = hexToHsl(accent);
  const derive = (ref: string): string => {
    if (accent.toLowerCase() === REF.accent.toLowerCase()) return ref;
    const t = hexToHsl(ref);
    const h = (t[0] + (a[0] - A[0]) + 360) % 360;
    const s = Math.min(1, t[1] * (A[1] > 0 ? a[1] / A[1] : 1));
    const l = Math.min(0.97, t[2] * (a[2] / A[2]));
    return hslToHex([h, s, l]);
  };
  const out = {
    satin: derive(REF.satin),
    polish: derive(REF.polish),
    glow: derive(REF.glow),
    crackDark: derive(REF.crackDark),
    crackLight: derive(REF.crackLight),
    ring: derive(REF.ring),
    cream: derive(REF.cream),
    creamMid: derive(REF.creamMid),
  };
  toneCache.set(accent, out);
  return out;
}
const DEFAULT_TONES = goldTones(BRAND_ROXO_DOURADO.colors.accent);
const DEFAULT_TINT = BRAND_ROXO_DOURADO.colors.primaryLight;

// ---------------------------------------------------------------- ambiente

const envCache = new WeakMap<THREE.WebGLRenderer, Map<string, THREE.Texture>>();

function panel(w: number, h: number, pos: [number, number, number], rgb: [number, number, number]): THREE.Mesh {
  const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false });
  mat.color.setRGB(rgb[0], rgb[1], rgb[2], THREE.LinearSRGBColorSpace);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.lookAt(0, 0, 0);
  return m;
}

/**
 * Estudio procedural (PMREM, gerado 1x por renderer e cor): softboxes quentes, tira da cor da marca, parede
 * em gradiente. Luz de estudio = tons neutros quentes documentados aqui (nao sao cor de marca).
 */
export function makeSealEnvironment(gl: THREE.WebGLRenderer, tint: string = DEFAULT_TINT): THREE.Texture {
  let byTint = envCache.get(gl);
  if (!byTint) {
    byTint = new Map();
    envCache.set(gl, byTint);
  }
  const cached = byTint.get(tint);
  if (cached) return cached;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color().setRGB(0.5, 0.36, 0.2, THREE.LinearSRGBColorSpace);
  scene.add(panel(50, 40, [0, 0, 16], [0.62, 0.52, 0.4]));
  scene.add(panel(40, 40, [0, 0, -16], [0.95, 0.74, 0.42]));
  scene.add(panel(14, 26, [-14, 0, -2], [0.9, 0.72, 0.42]));
  scene.add(panel(14, 26, [14, 0, -2], [0.85, 0.68, 0.4]));
  scene.add(panel(26, 8, [0, -10, -2], [0.8, 0.62, 0.34]));
  scene.add(panel(26, 8, [0, 11, -4], [1.1, 0.9, 0.55]));
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 256, 256);
  gr.addColorStop(0, "#ffffff");
  gr.addColorStop(0.5, "#b08a50");
  gr.addColorStop(1, "#5a3c1a");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  const wallTex = new THREE.CanvasTexture(cv);
  wallTex.colorSpace = THREE.SRGBColorSpace;
  const wall = panel(22, 17, [-0.6, 0.5, 10], [1.15, 1.0, 0.8]);
  (wall.material as THREE.MeshBasicMaterial).map = wallTex;
  scene.add(wall);
  scene.add(panel(8, 3.5, [-4.5, 6, 3], [3.4, 2.9, 2.0]));
  scene.add(panel(1.4, 9, [7, 0.5, 3.5], [2.4, 2.2, 2.0]));
  scene.add(panel(10, 1.1, [0, -5.5, 4], [2.6, 2.1, 1.5]));
  // tira da cor da marca (V02: primaryLight #B79BFF -> ~[0.5,0.3,0.95] linear)
  const tc = new THREE.Color().setStyle(tint, THREE.SRGBColorSpace);
  const lin = new THREE.Color().copy(tc).convertSRGBToLinear();
  scene.add(panel(3, 8, [6, -1, -4], [lin.r * 1.055, lin.g * 0.91, lin.b * 0.95]));
  scene.add(panel(5, 1.2, [0, 7, -1], [3, 2.7, 2.2]));
  const pmrem = new THREE.PMREMGenerator(gl);
  const tex = pmrem.fromScene(scene, 0.03).texture;
  pmrem.dispose();
  byTint.set(tint, tex);
  return tex;
}

export function useSealEnvMap(tint: string = DEFAULT_TINT): THREE.Texture {
  const gl = useThree((s) => s.gl);
  return useMemo(() => makeSealEnvironment(gl, tint), [gl, tint]);
}

// ------------------------------------------------------------------- luzes

export type SealLightsProps = {
  /** multiplicador geral */
  intensity?: number;
  /** sombra projetada dos relevos sobre o corpo. Requer <ThreeCanvas shadows>. Custa ~30% de render. */
  shadows?: boolean;
  /** cor do toque frio (marca). Padrao primaryLight do V02. */
  tint?: string;
};

/** Rig de estudio: chave quente, contraluz dourado, toque da marca, preenchimentos frente/verso/baixo. */
export const SealLights: React.FC<SealLightsProps> = ({ intensity = 1, shadows = true, tint = DEFAULT_TINT }) => (
  <>
    <ambientLight intensity={0.18 * intensity} />
    <directionalLight
      position={[-3, 4.2, 6]}
      intensity={2.0 * intensity}
      color="#FFF1D0"
      castShadow={shadows}
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-1.6}
      shadow-camera-right={1.6}
      shadow-camera-top={1.6}
      shadow-camera-bottom={-1.6}
      shadow-camera-near={1}
      shadow-camera-far={20}
      shadow-bias={-0.0004}
      shadow-normalBias={0.012}
    />
    <directionalLight position={[4, -2.5, -2]} intensity={1.7 * intensity} color="#FFC970" />
    <directionalLight position={[-4, -1, -3]} intensity={0.35 * intensity} color={tint} />
    <directionalLight position={[0.4, 0.6, 9]} intensity={0.75 * intensity} color="#FFEBC2" />
    <directionalLight position={[-0.5, 0.8, -9]} intensity={1.3 * intensity} color="#FFE2A0" />
    <directionalLight position={[1.5, -4, 4]} intensity={0.6 * intensity} color="#FFE2A8" />
  </>
);

// --------------------------------------------------------------- materiais

/** brilho minimo (o metal nunca fecha em preto; baixo para o dourado nao virar creme). */
const EMISSIVE_FLOOR = 0.07;

/** Relevo fino de torno (guilloche) para bumpMap. Deterministico (LCG com semente fixa). */
let bumpTex: THREE.CanvasTexture | null = null;
function getBumpTexture(): THREE.CanvasTexture {
  if (bumpTex) return bumpTex;
  const N = 1024;
  const c = document.createElement("canvas");
  c.width = N;
  c.height = N;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, N, N);
  const cx = N / 2;
  for (let r = 6; r < N * 0.72; r += 3.2) {
    const k = Math.floor(r / 3.2);
    const v = 128 + (k % 2 === 0 ? 46 : -46) + ((k * 37) % 5) * 4;
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(cx, cx, r, 0, Math.PI * 2);
    g.stroke();
  }
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2;
    const v = i % 2 === 0 ? 176 : 84;
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * N * 0.4, cx + Math.sin(a) * N * 0.4);
    g.lineTo(cx + Math.cos(a) * N * 0.46, cx + Math.sin(a) * N * 0.46);
    g.stroke();
  }
  let seed = 1234567;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 26000; i++) {
    const v = 110 + Math.floor(rnd() * 50);
    g.fillStyle = `rgba(${v},${v},${v},0.5)`;
    g.fillRect(rnd() * N, rnd() * N, 1 + rnd() * 2, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(0.5, 0.5);
  t.offset.set(0.5, 0.5);
  t.anisotropy = 8;
  t.needsUpdate = true;
  bumpTex = t;
  return t;
}

type MatProps = {
  kind: "satin" | "polish";
  tones: GoldTones;
  envMap: THREE.Texture;
  envRotation: number;
  envIntensity: number;
  heat: number;
  relief: number;
  attach?: string;
};

const GoldMat: React.FC<MatProps> = ({ kind, tones, envMap, envRotation, envIntensity, heat, relief, attach }) => {
  const satin = kind === "satin";
  const bump = useMemo(() => (satin ? getBumpTexture() : null), [satin]);
  return (
    <meshPhysicalMaterial
      attach={attach ?? "material"}
      color={satin ? tones.satin : tones.polish}
      metalness={1}
      roughness={satin ? 0.52 : 0.16}
      envMap={envMap}
      envMapIntensity={envIntensity}
      envMapRotation={[0, envRotation, 0]}
      bumpMap={bump}
      bumpScale={satin ? 3.2 * relief : 0}
      clearcoat={satin ? 0 : 0.35}
      clearcoatRoughness={0.08}
      emissive={tones.glow}
      emissiveIntensity={Math.max(heat, EMISSIVE_FLOOR)}
    />
  );
};

// ------------------------------------------------------------- rachadura 3D

/**
 * Rachadura desenhada SOBRE as emendas reais dos estilhacos (getSealSeams), presa ao selo:
 * sempre alinhada com as pecas que vao abrir. Fita escura larga + fio claro fino, por cima de tudo.
 * progress 0..1 cresce do centro para fora. width em unidades do selo.
 */
const CrackLines: React.FC<{ progress: number; opacity: number; tones: GoldTones; width: number }> = ({
  progress,
  opacity,
  tones,
  width,
}) => {
  const geos = useMemo(() => {
    const seams = getSealSeams();
    const build = (w: number) => {
      const pos: number[] = [];
      seams.forEach((s) => {
        // janela de cada emenda: comeca quando a frente da rachadura chega no raio r0
        const local = Math.min(1, Math.max(0, (progress * 1.45 - s.r0) / 0.45));
        if (local <= 0) return;
        const total = s.pts.reduce((acc, p, i) => (i ? acc + p.distanceTo(s.pts[i - 1]) : 0), 0);
        let left = total * local;
        for (let i = 1; i < s.pts.length && left > 0; i++) {
          const a = s.pts[i - 1];
          const full = s.pts[i];
          const seg = a.distanceTo(full);
          const b = seg <= left ? full : a.clone().lerp(full, left / seg);
          left -= seg;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const L = Math.hypot(dx, dy) || 1;
          const nx = (-dy / L) * w * 0.5;
          const ny = (dx / L) * w * 0.5;
          pos.push(a.x + nx, a.y + ny, 0, a.x - nx, a.y - ny, 0, b.x + nx, b.y + ny, 0);
          pos.push(b.x + nx, b.y + ny, 0, a.x - nx, a.y - ny, 0, b.x - nx, b.y - ny, 0);
        }
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      return g;
    };
    return { dark: build(width), light: build(width * 0.38) };
  }, [progress, width]);
  if (progress <= 0.001 || opacity <= 0.001) return null;
  return (
    <group position={[0, 0, BASE_TOP + 0.4]}>
      <mesh geometry={geos.dark} renderOrder={10}>
        <meshBasicMaterial color={tones.crackDark} transparent opacity={opacity} depthTest={false} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh geometry={geos.light} renderOrder={11}>
        <meshBasicMaterial color={tones.crackLight} transparent opacity={opacity} depthTest={false} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ selo

export type GoldSealProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  /** 0..1: amassa em z e estufa em xy (impacto). Negativo estica. */
  squash?: number;
  /** 0..1: estilhaca em 20 pecas (0 = selo inteiro). */
  split?: number;
  splitTravel?: number;
  /** deslocamento final (x,y,z) do icone central quando split=1 (cresce com split^2). */
  coreVector?: [number, number, number];
  /** 0..1: brilho emissivo (flash do impacto). */
  heat?: number;
  /** teto do emissivo: evita o metal "estourar para creme". Padrao 1 (sem limite, = V02). */
  heatMax?: number;
  envRotation?: number;
  envIntensity?: number;
  /** multiplicador do relevo fino (guilloche) do corpo. 1 = V02. */
  relief?: number;
  /** 0..1: rachadura desenhada nas emendas (antes de split). */
  crack?: number;
  /** 0..1: opacidade da rachadura (some quando as pecas abrem). */
  crackOpacity?: number;
  crackWidth?: number;
  icon?: SealIcon;
  tones?: GoldTones;
  /** cor da marca refletida no metal (tira do estudio). */
  tint?: string;
  envMap?: THREE.Texture;
  castShadow?: boolean;
  receiveShadow?: boolean;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const rnd = (a: number, b: number) => {
  const x = Math.sin(a * 78.233 + b * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

type ChunkMotion = { delay: number; reach: number; lateral: number; zk: number; axis: THREE.Vector3; spin: number };
let motionCache: ChunkMotion[] | null = null;
function getMotion(): ChunkMotion[] {
  if (motionCache) return motionCache;
  motionCache = getSealChunks().map((c, i) => ({
    delay: (c.band === 0 ? 0.0 : c.band === 1 ? 0.02 : 0.035) * (0.4 + rnd(i, 1)),
    reach: c.band === 0 ? 1.1 + 0.5 * rnd(i, 2) : c.band === 1 ? 0.8 + 0.4 * rnd(i, 2) : 0.7 + 0.3 * rnd(i, 2),
    lateral: (rnd(i, 3) - 0.5) * 1.2,
    zk: -0.8 + 2.4 * rnd(i, 4),
    axis: new THREE.Vector3(rnd(i, 5) - 0.5, rnd(i, 6) - 0.5, 0.35 * (rnd(i, 7) - 0.5)).normalize(),
    spin: (rnd(i, 8) > 0.5 ? 1 : -1) * (1.6 + 2.4 * rnd(i, 9)),
  }));
  return motionCache;
}

const Chunks: React.FC<{
  split: number;
  travel: number;
  mat: (kind: "satin" | "polish", attach?: string) => React.ReactNode;
  castShadow: boolean;
  receiveShadow: boolean;
}> = ({ split, travel, mat, castShadow, receiveShadow }) => {
  const chunks = getSealChunks();
  const motion = getMotion();
  return (
    <>
      {chunks.map((c, j) => {
        const m = motion[j];
        const u = clamp01((split - m.delay) / (1 - 0.06));
        const dir = new THREE.Vector3(Math.cos(c.mid), Math.sin(c.mid), 0);
        const tan = new THREE.Vector3(-Math.sin(c.mid), Math.cos(c.mid), 0);
        const disp = dir.clone().multiplyScalar(u * travel * m.reach).add(tan.clone().multiplyScalar(u * m.lateral));
        disp.z = u * u * 1.6 * m.zk;
        const q = new THREE.Quaternion().setFromAxisAngle(m.axis, u * m.spin);
        return (
          <group key={j} position={[c.cx + disp.x, c.cy + disp.y, disp.z]} quaternion={q}>
            <group position={[-c.cx, -c.cy, 0]}>
              <mesh geometry={c.base} castShadow={castShadow} receiveShadow={receiveShadow}>
                {mat("satin", "material-0")}
                {mat("polish", "material-1")}
              </mesh>
              {c.rays && (
                <mesh geometry={c.rays} castShadow={castShadow} receiveShadow={receiveShadow}>
                  {mat("satin")}
                </mesh>
              )}
              {c.polish && (
                <mesh geometry={c.polish} castShadow={castShadow} receiveShadow={receiveShadow}>
                  {mat("polish")}
                </mesh>
              )}
            </group>
          </group>
        );
      })}
    </>
  );
};

export const GoldSeal: React.FC<GoldSealProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  squash = 0,
  split = 0,
  splitTravel = 3.2,
  coreVector = [0, 0, 3.2],
  heat = 0,
  heatMax = 1,
  envRotation = 0,
  envIntensity = 0.8,
  relief = 1,
  crack = 0,
  crackOpacity = 1,
  crackWidth = 0.0065,
  icon = DEFAULT_ICON,
  tones = DEFAULT_TONES,
  tint = DEFAULT_TINT,
  envMap,
  castShadow = true,
  receiveShadow = true,
}) => {
  const autoEnv = useSealEnvMap(tint);
  const env = envMap ?? autoEnv;
  const whole = useMemo(() => getSealPieces(), []);
  const iconKey = JSON.stringify(icon);
  const core = useMemo(() => getSealCore(icon), [iconKey]);
  const h = Math.min(heat, heatMax);
  const mat = (kind: "satin" | "polish", attach?: string) => (
    <GoldMat
      kind={kind}
      tones={tones}
      envMap={env}
      envRotation={envRotation}
      envIntensity={envIntensity}
      heat={h}
      relief={relief}
      attach={attach}
    />
  );
  const s: [number, number, number] = typeof scale === "number" ? [scale, scale, scale] : scale;
  const k2 = split * split;
  const corePos: [number, number, number] = [coreVector[0] * k2, coreVector[1] * k2, coreVector[2] * k2];
  return (
    <group position={position} rotation={rotation} scale={s}>
      <group scale={[1 + 0.14 * squash, 1 + 0.14 * squash, 1 - 0.55 * squash]}>
        {split <= 0 ? (
          <>
            <mesh geometry={whole.satin} castShadow={castShadow} receiveShadow={receiveShadow}>
              {mat("satin")}
            </mesh>
            <mesh geometry={whole.polish} castShadow={castShadow} receiveShadow={receiveShadow}>
              {mat("polish")}
            </mesh>
            <mesh geometry={core} castShadow={castShadow} receiveShadow={receiveShadow}>
              {mat("polish")}
            </mesh>
          </>
        ) : (
          <>
            <Chunks split={split} travel={splitTravel} mat={mat} castShadow={castShadow} receiveShadow={receiveShadow} />
            <mesh geometry={core} position={corePos} rotation={[0, 0, split * 2.4]} castShadow={castShadow} receiveShadow={receiveShadow}>
              {mat("polish")}
            </mesh>
          </>
        )}
        <CrackLines progress={crack} opacity={crackOpacity} tones={tones} width={crackWidth} />
      </group>
    </group>
  );
};
