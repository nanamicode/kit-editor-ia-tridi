/**
 * FloatingCoins — moedas/selos 3D (GoldSeal do selo3d) flutuando com paralaxe de camera real.
 * Uma instancia = uma camada (um ThreeCanvas). Use duas: layer="back" ATRAS da pessoa recortada e
 * layer="front" A FRENTE dela. Profundidades diferentes se deslocam diferente quando a camera anda.
 */
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBrand } from "../theme";
import { GoldSeal, SealLights, goldTones, type GoldTones } from "../selo3d/GoldSeal";
import { DEFAULT_ICON, type SealIcon } from "../selo3d/sealGeometry";

export type Coin = {
  /** centro na tela (px) */
  x: number;
  y: number;
  /** diametro aparente (px) */
  size: number;
  /** profundidade (unidades de mundo): negativo = longe (atras, paralaxe menor), positivo = perto. */
  depth: number;
  /** atraso de entrada (s) contado de fromSec */
  delaySec?: number;
  /** instantes absolutos (s) de "pop" (tranco + balanco), sincronizados com palavras da fala */
  pops?: number[];
  /** inclinacao base em x (rad) */
  tiltX?: number;
  /** amplitude do giro em y (rad) */
  swing?: number;
  /** periodo da flutuacao (s) */
  period?: number;
  /** fase (rad) */
  phase?: number;
  /** sobe-e-desce (px) */
  bob?: number;
  /** saida: voa ate `to` (px) entre t0 e t1 (s absolutos) e some */
  leave?: { t0: number; t1: number; to: [number, number] };
};

/** V02: atras da apresentadora (entram a partir de 7.95 s) */
export const V02_COINS_BACK: Coin[] = [
  { x: 150, y: 1120, size: 410, depth: -1.2, delaySec: 0, pops: [8.9], tiltX: 0.42, swing: 0.55, period: 7.2, phase: 0.5, bob: 14 },
  { x: 965, y: 1040, size: 256, depth: -0.8, delaySec: 0.12, pops: [10.7], tiltX: -0.5, swing: 0.7, period: 6.1, phase: 2.2, bob: 11 },
  { x: 905, y: 470, size: 164, depth: -2.6, delaySec: 0.3, pops: [8.9], tiltX: 0.14, swing: 0.3, period: 5.3, phase: 1.1, bob: 9, leave: { t0: 9.5, t1: 9.78, to: [1220, 150] } },
  { x: 170, y: 420, size: 116, depth: -3.2, delaySec: 0.42, pops: [8.9], tiltX: -0.1, swing: 0.3, period: 4.7, phase: 3.1, bob: 8, leave: { t0: 9.55, t1: 9.82, to: [-140, 260] } },
];
/** V02: a frente da apresentadora (fromSec 8.7) */
export const V02_COINS_FRONT: Coin[] = [
  { x: 980, y: 1500, size: 144, depth: 1.1, delaySec: 0, pops: [10.7, 11.14], tiltX: 0.16, swing: 0.25, period: 5.6, phase: 0.9, bob: 10 },
  { x: 92, y: 505, size: 80, depth: 1.8, delaySec: 0.25, tiltX: -0.12, swing: 0.28, period: 4.4, phase: 2.5, bob: 7, leave: { t0: 9.5, t1: 9.76, to: [-140, 300] } },
];

export type FloatingCoinsProps = {
  /** moedas; se omitido usa o conjunto V02 da camada */
  coins?: Coin[];
  /** inicio da camada (s). As moedas entram em fromSec + delaySec. */
  fromSec: number;
  /** fim da camada (s): desmonta o canvas depois disso */
  toSec: number;
  layer?: "back" | "front";
  /** origem da deriva de camera (s). Padrao fromSec. V02 usa 7.8 nas duas camadas. */
  parallaxOriginSec?: number;
  /** multiplicador da deriva de camera (paralaxe). 0 = parada. */
  parallax?: number;
  color?: string;
  tint?: string;
  /** luz das moedas (V02 0.82: dourado saturado, relevo legivel, sem lavar para creme) */
  light?: number;
  /** reflexo do ambiente (V02 0.8) */
  envIntensity?: number;
  /** brilho emissivo base (V02 0.16) e teto do emissivo (evita estourar para creme nos pops) */
  heat?: number;
  heatMax?: number;
  icon?: SealIcon;
  /** sombra projetada na cena de baixo (drop-shadow CSS). */
  dropShadow?: boolean;
  /**
   * Selo que ESTAMPA um ponto da tela (ex.: o encaixe do icone do botao CTA): cai em `dropSec`,
   * amassa no impacto em `hitSec` e fica parado ali como icone. Use na camada "front".
   * V02: {x:198, y:410, size:120, hitSec:10.4, popSecs:[11.14]}. Combine com <StampWave> no mesmo ponto.
   */
  stamp?: StampSpec;
};

export type StampSpec = {
  x: number;
  y: number;
  /** diametro final (px) */
  size: number;
  /** instante do impacto (s) */
  hitSec: number;
  /** duracao da queda (s), padrao 0.2 */
  dropSec?: number;
  /** pulsos depois de pousado (s absolutos), ex.: a ultima palavra do CTA */
  popSecs?: number[];
};

const CAM_Z = 9.4;
const FOV = 30;

const wobble = (t: number, t0: number, amp: number) => {
  if (t < t0) return 0;
  const dt = t - t0;
  return amp * Math.exp(-dt * 5.5) * Math.sin(dt * 15);
};

const Rig: React.FC<{ origin: number; parallax: number; t: number }> = ({ origin, parallax, t }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const u = t - origin;
  const cx = parallax * (0.055 * Math.sin((u / 6.5) * Math.PI * 2) + 0.012 * u);
  const cy = parallax * 0.03 * Math.sin((u / 8.2) * Math.PI * 2 + 1);
  camera.position.set(cx, cy, CAM_Z);
  camera.fov = FOV;
  camera.up.set(0, 1, 0);
  camera.lookAt(cx, cy, 0);
  camera.updateProjectionMatrix();
  return null;
};

const FloatingCoin: React.FC<{
  c: Coin;
  fromSec: number;
  W: number;
  H: number;
  tones: GoldTones;
  tint: string;
  envIntensity: number;
  heat: number;
  heatMax: number;
  icon: SealIcon;
}> = ({ c, fromSec, W, H, tones, tint, envIntensity, heat, heatMax, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const enter = fromSec + (c.delaySec ?? 0);
  if (t < enter - 0.05) return null;
  const K = H / (2 * CAM_Z * Math.tan((FOV * Math.PI) / 360));
  const ppu = (K * CAM_Z) / (CAM_Z - c.depth);
  const grow = spring({ frame: frame - enter * fps, fps, config: { damping: 11, stiffness: 120, mass: 0.9 } });
  let pop = 0;
  let wob = 0;
  for (const pt of c.pops ?? []) {
    if (t >= pt) {
      pop += 0.22 * Math.exp(-(t - pt) * 9);
      wob += wobble(t, pt, 0.26);
    }
  }
  const ph = (t / (c.period ?? 6)) * Math.PI * 2 + (c.phase ?? 0);
  const ry = (c.swing ?? 0.5) * Math.sin(ph) + wob;
  const rx = (c.tiltX ?? 0) + 0.12 * Math.sin(ph * 0.7 + 1);
  let px: [number, number] = [c.x, c.y + (c.bob ?? 0) * Math.sin(ph * 0.8)];
  let rz = 0.12 * Math.sin(ph * 0.5);
  if (c.leave) {
    const p = interpolate(t, [c.leave.t0, c.leave.t1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
    if (p >= 1) return null;
    px = [px[0] + (c.leave.to[0] - px[0]) * p, px[1] + (c.leave.to[1] - px[1]) * p];
    rz += p * 2.4;
  }
  return (
    <GoldSeal
      position={[(px[0] - W / 2) / ppu, (H / 2 - px[1]) / ppu, c.depth]}
      rotation={[rx, ry, rz]}
      scale={(c.size / 2 / ppu) * grow * (1 + pop)}
      envIntensity={envIntensity}
      heat={heat + Math.max(0, pop) * 0.5}
      heatMax={heatMax}
      icon={icon}
      tones={tones}
      tint={tint}
      castShadow={false}
      receiveShadow={false}
    />
  );
};

const StampCoin: React.FC<{
  s: StampSpec;
  W: number;
  H: number;
  tones: GoldTones;
  tint: string;
  envIntensity: number;
  heatMax: number;
  icon: SealIcon;
}> = ({ s, W, H, tones, tint, envIntensity, heatMax, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const drop = s.dropSec ?? 0.2;
  const t0 = s.hitSec - drop;
  if (t < t0) return null;
  const fall = Math.min(1, Math.max(0, (t - t0) / drop));
  const h = 1 - fall * fall; // altura 1 -> 0 (gravidade)
  const since = t - s.hitSec;
  const squash = since >= 0 ? Math.exp(-since * 16) * 0.95 : 0;
  let heat = since >= 0 ? Math.exp(-since * 11) * 0.9 : 0;
  let pop = 0;
  let wob = since >= 0 ? wobble(t, s.hitSec, 0.35) : 0;
  for (const pt of s.popSecs ?? []) {
    if (t >= pt) {
      pop += 0.2 * Math.exp(-(t - pt) * 9);
      wob += wobble(t, pt, 0.6);
    }
  }
  heat += pop * 1.2;
  const z = h * 3.4; // vem da frente da camera
  const K = H / (2 * CAM_Z * Math.tan((FOV * Math.PI) / 360));
  const ppuZ = (K * CAM_Z) / (CAM_Z - z);
  const ppu0 = K;
  const sway = since >= 0.3 ? 0.12 * Math.sin((since - 0.3) * 3.1) * Math.min(1, (since - 0.3) / 0.4) : 0;
  return (
    <GoldSeal
      position={[(s.x - W / 2) / ppuZ, (H / 2 - s.y) / ppuZ, z]}
      rotation={[0.6 * h + 0.06 * Math.sin(t * 2.2), 0.55 * h + sway + wob, -1.4 * h]}
      scale={(s.size / 2 / ppu0) * (1 + pop)}
      squash={squash}
      envIntensity={envIntensity}
      heat={heat}
      heatMax={Math.max(heatMax, 0.9)}
      icon={icon}
      tones={tones}
      tint={tint}
      castShadow={false}
      receiveShadow={false}
    />
  );
};

/** Onda de choque achatada (2D) no ponto da estampa: so marca o impacto do selo. */
export const StampWave: React.FC<{ x: number; y: number; r: number; hitSec: number }> = ({ x, y, r, hitSec }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const brand = useBrand();
  const p = (frame / fps - hitSec) / 0.4;
  if (p < 0 || p > 1) return null;
  const e = Easing.out(Easing.cubic)(p);
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <circle cx={x} cy={y} r={r * 0.8 + 110 * e} fill="none" stroke={brand.colors.accentLight} strokeWidth={10 * (1 - p)} opacity={0.9 * (1 - p)} />
      <circle cx={x} cy={y} r={r * 0.8 + 70 * e} fill="none" stroke={brand.colors.text} strokeWidth={4 * (1 - p)} opacity={0.8 * (1 - p)} />
    </svg>
  );
};

export const FloatingCoins: React.FC<FloatingCoinsProps> = ({
  coins,
  fromSec,
  toSec,
  layer = "back",
  parallaxOriginSec,
  parallax = 1,
  color,
  tint,
  light = 0.82,
  envIntensity = 0.8,
  heat = 0.16,
  heatMax = 0.45,
  icon = DEFAULT_ICON,
  dropShadow = true,
  stamp,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const brand = useBrand();
  const t = frame / fps;
  if (t < fromSec - 0.1 || t > toSec) return null;
  const list = coins ?? (layer === "back" ? V02_COINS_BACK : V02_COINS_FRONT);
  const tones = goldTones(color ?? brand.colors.accent);
  const tintC = tint ?? brand.colors.primaryLight;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        // sombra derivada do ink (rgba 10,4,24 no V02)
        filter: `saturate(1.05) contrast(1.08)${dropShadow ? " drop-shadow(10px 16px 12px rgba(10,4,24,0.62))" : ""}`,
      }}
    >
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true }} camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 60 }}>
        <Rig origin={parallaxOriginSec ?? fromSec} parallax={parallax} t={t} />
        <SealLights intensity={light} shadows={false} tint={tintC} />
        {list.map((c, i) => (
          <FloatingCoin
            key={i}
            c={c}
            fromSec={fromSec}
            W={width}
            H={height}
            tones={tones}
            tint={tintC}
            envIntensity={envIntensity}
            heat={heat}
            heatMax={heatMax}
            icon={icon}
          />
        ))}
        {stamp ? (
          <StampCoin s={stamp} W={width} H={height} tones={tones} tint={tintC} envIntensity={envIntensity} heatMax={heatMax} icon={icon} />
        ) : null}
      </ThreeCanvas>
    </div>
  );
};
