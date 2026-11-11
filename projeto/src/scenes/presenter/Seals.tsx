import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GoldSeal, SealLights } from "../seal3d/GoldSeal";
import { CAM_Z, FPS, H, T, W, camOffset, clamp01, ppuAt } from "./layout";

/**
 * Camadas 3 e 5: selos dourados 3D reais (GoldSeal do SEAL3D) em dois ThreeCanvas.
 *  - "back": flutuam ATRAS da apresentadora (entre cartao e pessoa), em paralaxe de camera real
 *    (profundidades diferentes se deslocam diferente quando a camera anda);
 *  - "front": pequenos A FRENTE dela + o selo que ESTAMPA o "SAIBA MAIS" e depois vira o icone do botao.
 * Tudo calculado por frame (useCurrentFrame); nenhum useFrame.
 */

type Pt = [number, number];

type SealSpec = {
  id: string;
  px: Pt;
  z: number;
  /** raio aparente em px (a profundidade z do plano) */
  r: number;
  enter: number;
  /** pops (s): tranco de escala + balanco quando uma palavra bate */
  pops?: number[];
  tiltX?: number;
  swing?: number;
  period?: number;
  phase?: number;
  bob?: number;
  leave?: { t0: number; t1: number; to: Pt };
};

const BACK: SealSpec[] = [
  { id: "A1", px: [150, 1120], z: -1.2, r: 205, enter: T.sealsIn0, pops: [8.9], tiltX: 0.42, swing: 0.55, period: 7.2, phase: 0.5, bob: 14 },
  { id: "A2", px: [965, 1040], z: -0.8, r: 128, enter: T.sealsIn0 + 0.12, pops: [10.7], tiltX: -0.5, swing: 0.7, period: 6.1, phase: 2.2, bob: 11 },
  { id: "A3", px: [905, 470], z: -2.6, r: 82, enter: T.sealsIn0 + 0.3, pops: [8.9], tiltX: 0.14, swing: 0.30, period: 5.3, phase: 1.1, bob: 9, leave: { t0: 9.5, t1: 9.78, to: [1220, 150] } },
  { id: "A4", px: [170, 420], z: -3.2, r: 58, enter: T.sealsIn0 + 0.42, pops: [8.9], tiltX: -0.1, swing: 0.30, period: 4.7, phase: 3.1, bob: 8, leave: { t0: 9.55, t1: 9.82, to: [-140, 260] } },
];

const FRONT: SealSpec[] = [
  { id: "B1", px: [980, 1500], z: 1.1, r: 72, enter: 8.7, pops: [10.7, 11.14], tiltX: 0.16, swing: 0.25, period: 5.6, phase: 0.9, bob: 10 },
  { id: "B2", px: [92, 505], z: 1.8, r: 40, enter: 8.95, tiltX: -0.12, swing: 0.28, period: 4.4, phase: 2.5, bob: 7, leave: { t0: 9.5, t1: 9.76, to: [-140, 300] } },
];

/** Selo de estampa / icone do botao: cai direto no encaixe do icone (sem cruzar a tela), em 10.40 s. */
export const STAMP = {
  hitSec: T.stampHit,
  dropSec: 0.2,
  at: [198, 410] as Pt,
  r: 60,
  dock: [198, 410] as Pt,
  dockR: 60,
};

/** Luz/ambiente mais baixos: o dourado fica saturado (#F5C542) e o relevo le melhor, sem lavar para creme. */
const ENV_INT = 0.8;
const LIGHT_INT = 0.82;

const wobble = (t: number, t0: number, amp: number) => {
  if (t < t0) return 0;
  const dt = t - t0;
  return amp * Math.exp(-dt * 5.5) * Math.sin(dt * 15);
};

const Rig: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = camOffset(t);
  camera.position.set(c.x, c.y, CAM_Z);
  camera.fov = 30;
  camera.up.set(0, 1, 0);
  camera.lookAt(c.x, c.y, 0);
  camera.updateProjectionMatrix();
  return null;
};

const toWorld = (p: Pt, z: number): [number, number, number] => {
  const ppu = ppuAt(z);
  return [(p[0] - W / 2) / ppu, (H / 2 - p[1]) / ppu, z];
};

const FloatingSeal: React.FC<{ s: SealSpec }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / FPS;
  if (t < s.enter - 0.05) return null;
  const grow = spring({ frame: frame - s.enter * FPS, fps, config: { damping: 11, stiffness: 120, mass: 0.9 } });
  let pop = 0;
  let wob = 0;
  for (const pt of s.pops ?? []) {
    if (t >= pt) {
      pop += 0.22 * Math.exp(-(t - pt) * 9);
      wob += wobble(t, pt, 0.26);
    }
  }
  const ph = (t / (s.period ?? 6)) * Math.PI * 2 + (s.phase ?? 0);
  const ry = (s.swing ?? 0.5) * Math.sin(ph) + wob;
  const rx = (s.tiltX ?? 0) + 0.12 * Math.sin(ph * 0.7 + 1);
  let px: Pt = [s.px[0], s.px[1] + (s.bob ?? 0) * Math.sin(ph * 0.8)];
  let rz = 0.12 * Math.sin(ph * 0.5);
  const scale = grow * (1 + pop);
  if (s.leave) {
    const p = interpolate(t, [s.leave.t0, s.leave.t1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });
    px = [px[0] + (s.leave.to[0] - px[0]) * p, px[1] + (s.leave.to[1] - px[1]) * p];
    rz += p * 2.4;
    if (p >= 1) return null;
  }
  const ppu = ppuAt(s.z);
  return (
    <GoldSeal
      position={toWorld(px, s.z)}
      rotation={[rx, ry, rz]}
      scale={(s.r / ppu) * scale}
      envIntensity={ENV_INT}
      heat={0.16 + Math.max(0, pop) * 0.5}
      castShadow={false}
      receiveShadow={false}
    />
  );
};

/** O selo que estampa o encaixe do icone do botao (cai, amassa no impacto, fica de icone). */
const StampSeal: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const { hitSec, dropSec, at, r } = STAMP;
  const t0 = hitSec - dropSec;
  if (t < t0) return null;
  const fall = clamp01((t - t0) / dropSec);
  const h = 1 - fall * fall; // altura (1 -> 0), gravidade
  const since = t - hitSec;
  const squash = since >= 0 ? Math.exp(-since * 16) * 0.95 : 0;
  const heat = since >= 0 ? Math.exp(-since * 11) * 0.9 : 0;
  const z = h * 3.4;
  // 2o impulso do selo-icone no "SEU!" (11.14 s); o clique do cursor (10.22) acontece antes de o selo cair
  const clickPop = t >= T.seuIn ? 0.2 * Math.exp(-(t - T.seuIn) * 9) : 0;
  const sway = since >= 0.3 ? 0.12 * Math.sin((t - hitSec - 0.3) * 3.1) * Math.min(1, (since - 0.3) / 0.4) : 0;
  const ppu0 = ppuAt(0);
  const rotY = 0.55 * h + sway + (t >= T.seuIn ? wobble(t, T.seuIn, 0.6) : 0) + (since >= 0 ? wobble(t, hitSec, 0.35) : 0);
  const rotX = 0.6 * h + 0.06 * Math.sin(t * 2.2);
  const rotZ = -1.4 * h;
  return (
    <GoldSeal
      position={toWorld(at, z)}
      rotation={[rotX, rotY, rotZ]}
      scale={(r / ppu0) * (1 + clickPop)}
      squash={squash}
      envIntensity={ENV_INT}
      heat={heat + clickPop * 1.2}
      castShadow={false}
      receiveShadow={false}
    />
  );
};

const SealsCanvas: React.FC<{ layer: "back" | "front" }> = ({ layer }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (layer === "front" && t < 8.6) return null;
  const list = layer === "back" ? BACK : FRONT;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        filter: "saturate(1.05) contrast(1.08) drop-shadow(10px 16px 12px rgba(10,4,24,0.62))",
      }}
    >
      <ThreeCanvas
        width={W}
        height={H}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 30, position: [0, 0, CAM_Z], near: 0.1, far: 60 }}
      >
        <Rig />
        <SealLights intensity={LIGHT_INT} shadows={false} />
        {list.map((s) => (
          <FloatingSeal key={s.id} s={s} />
        ))}
        {layer === "front" ? <StampSeal /> : null}
      </ThreeCanvas>
    </div>
  );
};

export const SealsBack: React.FC = () => <SealsCanvas layer="back" />;
export const SealsFront: React.FC = () => <SealsCanvas layer="front" />;
