import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getSealChunks, getSealCore, getSealPieces } from "./sealGeometry";

/**
 * GoldSeal — selo dourado 3D com geometria real (corpo serrilhado extrudado, aneis,
 * perolas, mini-estrelas, sunburst e estrela central), material metalico PBR e
 * mapa de ambiente procedural (softboxes) gerado uma unica vez por renderer.
 *
 * Reutilizavel por qualquer cena DENTRO de um <ThreeCanvas>:
 *   <ThreeCanvas width height shadows camera={{ fov: 30, position: [0, 0, 9.4] }}>
 *     <SealLights />
 *     <GoldSeal position={[0, 0, 0]} rotation={[0, frame * 0.03, 0]} scale={1} />
 *   </ThreeCanvas>
 * Raio do selo = 1 * scale (unidades de mundo). Nenhuma animacao propria: tudo vem de props
 * calculadas por frame (useCurrentFrame) por quem usa. Sem useFrame.
 */

export const SEAL_RADIUS = 1;

// ---------------------------------------------------------------- ambiente

const envCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

function panel(
  w: number,
  h: number,
  pos: [number, number, number],
  rgb: [number, number, number],
): THREE.Mesh {
  const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false });
  mat.color.setRGB(rgb[0], rgb[1], rgb[2], THREE.LinearSRGBColorSpace);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.lookAt(0, 0, 0);
  return m;
}

/** Sala de estudio procedural: softboxes quentes, tira violeta (identidade) e parede de fundo. */
export function makeSealEnvironment(gl: THREE.WebGLRenderer): THREE.Texture {
  const cached = envCache.get(gl);
  if (cached) return cached;
  const scene = new THREE.Scene();
  // fundo quente e claro: verso e laterais do selo refletem ouro-ambar, nunca preto
  scene.background = new THREE.Color().setRGB(0.5, 0.36, 0.2, THREE.LinearSRGBColorSpace);
  // parede ampla e fraca atras da camera
  scene.add(panel(50, 40, [0, 0, 16], [0.62, 0.52, 0.4]));
  // preenchimento de verso/lateral: o selo de costas ou de lado continua metal dourado
  scene.add(panel(40, 40, [0, 0, -16], [0.95, 0.74, 0.42]));
  scene.add(panel(14, 26, [-14, 0, -2], [0.9, 0.72, 0.42]));
  scene.add(panel(14, 26, [14, 0, -2], [0.85, 0.68, 0.4]));
  scene.add(panel(26, 8, [0, -10, -2], [0.8, 0.62, 0.34]));
  scene.add(panel(26, 8, [0, 11, -4], [1.1, 0.9, 0.55]));
  // parede principal com gradiente diagonal (o que a face frontal reflete): da luz quente ao ambar escuro
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
  // softbox principal superior esquerda
  scene.add(panel(8, 3.5, [-4.5, 6, 3], [3.4, 2.9, 2.0]));
  // tira vertical direita (fria/neutra)
  scene.add(panel(1.4, 9, [7, 0.5, 3.5], [2.4, 2.2, 2.0]));
  // faixa baixa para dar leitura ao chanfro inferior
  scene.add(panel(10, 1.1, [0, -5.5, 4], [2.6, 2.1, 1.5]));
  // tira violeta (cor da marca) atras/direita
  scene.add(panel(3, 8, [6, -1, -4], [0.5, 0.3, 0.95]));
  // luz de recorte do alto
  scene.add(panel(5, 1.2, [0, 7, -1], [3, 2.7, 2.2]));
  const pmrem = new THREE.PMREMGenerator(gl);
  const tex = pmrem.fromScene(scene, 0.03).texture;
  pmrem.dispose();
  envCache.set(gl, tex);
  return tex;
}

export function useSealEnvMap(): THREE.Texture {
  const gl = useThree((s) => s.gl);
  return useMemo(() => makeSealEnvironment(gl), [gl]);
}

// ------------------------------------------------------------------- luzes

export type SealLightsProps = {
  /** multiplicador geral */
  intensity?: number;
  /** liga sombra projetada (relevos sobre o corpo). Requer <ThreeCanvas shadows>. */
  shadows?: boolean;
};

export const SealLights: React.FC<SealLightsProps> = ({ intensity = 1, shadows = true }) => (
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
    {/* contraluz dourado quente (o rosa vinha daqui: violeta sobre ouro vira magenta) */}
    <directionalLight position={[4, -2.5, -2]} intensity={1.7 * intensity} color="#FFC970" />
    {/* toque violeta bem leve so para amarrar com a parede da marca */}
    <directionalLight position={[-4, -1, -3]} intensity={0.35 * intensity} color="#B79BFF" />
    {/* preenchimento frontal: a face dourada nunca escurece, qualquer que seja a inclinacao */}
    <directionalLight position={[0.4, 0.6, 9]} intensity={0.75 * intensity} color="#FFEBC2" />
    {/* preenchimento de verso (selo de costas ou de lado) */}
    <directionalLight position={[-0.5, 0.8, -9]} intensity={1.3 * intensity} color="#FFE2A0" />
    {/* preenchimento frio de baixo */}
    <directionalLight position={[1.5, -4, 4]} intensity={0.6 * intensity} color="#FFE2A8" />
  </>
);

// --------------------------------------------------------------- materiais

/** brilho minimo (so para o metal nunca fechar em preto; baixo para o dourado nao virar creme). */
const EMISSIVE_FLOOR = 0.07;
const SATIN = "#A8700A";
const POLISH = "#F0B92E";

/**
 * Relevo fino de torno (guilloche): aneis concêntricos + estrias radiais + grao, em escala de cinza.
 * Mapeado pelas UVs do corpo (que sao as proprias coordenadas xy do selo, -1..1), serve de bumpMap.
 * Deterministico (LCG com semente fixa): todo renderer/aba gera a mesma textura.
 */
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
  // aneis de torno
  for (let r = 6; r < N * 0.72; r += 3.2) {
    const k = Math.floor(r / 3.2);
    const v = 128 + (k % 2 === 0 ? 46 : -46) + ((k * 37) % 5) * 4;
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(cx, cx, r, 0, Math.PI * 2);
    g.stroke();
  }
  // estrias radiais curtas na coroa externa
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
  // grao de metal escovado
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
  envMap: THREE.Texture;
  envRotation: number;
  envIntensity: number;
  heat: number;
  attach?: string;
};

const GoldMat: React.FC<MatProps> = ({ kind, envMap, envRotation, envIntensity, heat, attach }) => {
  const satin = kind === "satin";
  const bump = useMemo(() => (satin ? getBumpTexture() : null), [satin]);
  return (
    <meshPhysicalMaterial
      attach={attach ?? "material"}
      color={satin ? SATIN : POLISH}
      metalness={1}
      roughness={satin ? 0.52 : 0.16}
      envMap={envMap}
      envMapIntensity={envIntensity}
      envMapRotation={[0, envRotation, 0]}
      bumpMap={bump}
      bumpScale={satin ? 3.2 : 0}
      clearcoat={satin ? 0 : 0.35}
      clearcoatRoughness={0.08}
      emissive="#E8861A"
      emissiveIntensity={Math.max(heat, EMISSIVE_FLOOR)}
    />
  );
};

// ------------------------------------------------------------------ selo

export type GoldSealProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  /** 0..1: amassa em z e estufa em xy (impacto do carimbo). Valores negativos esticam. */
  squash?: number;
  /** 0..1: estilhaca em 20 pecas (0 = selo inteiro, uma malha unica). */
  split?: number;
  /** distancia radial percorrida pelos setores quando split=1 (unidades de mundo). */
  splitTravel?: number;
  /** deslocamento final (x,y,z) da estrela central quando split=1 (cresce com split^2). */
  coreVector?: [number, number, number];
  /** 0..1: brilho emissivo (flash do impacto). */
  heat?: number;
  /** giro (rad) do mapa de ambiente: varre os reflexos sem mexer o selo. */
  envRotation?: number;
  envIntensity?: number;
  envMap?: THREE.Texture;
  castShadow?: boolean;
  receiveShadow?: boolean;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const rnd = (a: number, b: number) => {
  const x = Math.sin(a * 78.233 + b * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

type ChunkMotion = {
  delay: number;
  reach: number;
  lateral: number;
  zk: number;
  axis: THREE.Vector3;
  spin: number;
};
let motionCache: ChunkMotion[] | null = null;
function getMotion(n: number): ChunkMotion[] {
  if (motionCache && motionCache.length === n) return motionCache;
  const chunks = getSealChunks();
  motionCache = chunks.map((c, i) => ({
    delay: (c.band === 0 ? 0.0 : c.band === 1 ? 0.02 : 0.035) * (0.4 + rnd(i, 1)),
    // quanto mais perto do centro, mais longe precisa ir para sair do quadro
    reach: c.band === 0 ? 1.1 + 0.5 * rnd(i, 2) : c.band === 1 ? 0.8 + 0.4 * rnd(i, 2) : 0.7 + 0.3 * rnd(i, 2),
    lateral: (rnd(i, 3) - 0.5) * 1.2,
    zk: -0.8 + 2.4 * rnd(i, 4),
    axis: new THREE.Vector3(rnd(i, 5) - 0.5, rnd(i, 6) - 0.5, 0.35 * (rnd(i, 7) - 0.5)).normalize(),
    spin: (rnd(i, 8) > 0.5 ? 1 : -1) * (1.6 + 2.4 * rnd(i, 9)),
  }));
  return motionCache;
}

/** Estilhacos planos (3 aneis de pecas) que giram e voam para fora: ver getSealChunks. */
const Chunks: React.FC<{
  split: number;
  travel: number;
  mat: (kind: "satin" | "polish", attach?: string) => React.ReactNode;
  castShadow: boolean;
  receiveShadow: boolean;
}> = ({ split, travel, mat, castShadow, receiveShadow }) => {
  const chunks = getSealChunks();
  const motion = getMotion(chunks.length);
  const items = chunks.map((c, j) => {
    const m = motion[j];
    const u = clamp01((split - m.delay) / (1 - 0.06));
    const dir = new THREE.Vector3(Math.cos(c.mid), Math.sin(c.mid), 0);
    const tan = new THREE.Vector3(-Math.sin(c.mid), Math.cos(c.mid), 0);
    const disp = dir
      .clone()
      .multiplyScalar(u * travel * m.reach)
      .add(tan.clone().multiplyScalar(u * m.lateral));
    disp.z = u * u * 1.6 * m.zk;
    const q = new THREE.Quaternion().setFromAxisAngle(m.axis, u * m.spin);
    const pos: [number, number, number] = [c.cx + disp.x, c.cy + disp.y, disp.z];
    return (
      <group key={j} position={pos} quaternion={q}>
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
  });
  return <>{items}</>;
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
  envRotation = 0,
  envIntensity = 0.8,
  envMap,
  castShadow = true,
  receiveShadow = true,
}) => {
  const autoEnv = useSealEnvMap();
  const env = envMap ?? autoEnv;
  const whole = useMemo(() => getSealPieces(null), []);
  const core = useMemo(() => getSealCore(), []);
  const mat = (kind: "satin" | "polish", attach?: string) => (
    <GoldMat kind={kind} envMap={env} envRotation={envRotation} envIntensity={envIntensity} heat={heat} attach={attach} />
  );
  const s: [number, number, number] =
    typeof scale === "number" ? [scale, scale, scale] : scale;
  const sq = squash;
  const k2 = split * split;
  const corePos: [number, number, number] = [coreVector[0] * k2, coreVector[1] * k2, coreVector[2] * k2];
  const coreSpin = split * 2.4;
  return (
    <group position={position} rotation={rotation} scale={s}>
      <group scale={[1 + 0.14 * sq, 1 + 0.14 * sq, 1 - 0.55 * sq]}>
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
            <Chunks
              split={split}
              travel={splitTravel}
              mat={mat}
              castShadow={castShadow}
              receiveShadow={receiveShadow}
            />
            <mesh
              geometry={core}
              position={corePos}
              rotation={[0, 0, coreSpin]}
              castShadow={castShadow}
              receiveShadow={receiveShadow}
            >
              {mat("polish")}
            </mesh>
          </>
        )}
      </group>
    </group>
  );
};
