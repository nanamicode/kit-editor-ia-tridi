/**
 * SealTransition — transicao-estrela: o selo metalico 3D cai, estampa, a camera mergulha ate ele
 * cobrir 100% do quadro, ele racha nas emendas e estilhaca revelando a cena seguinte.
 * OVERLAY transparente: colocar POR CIMA das duas cenas; trocar a cena de baixo em atSec..atSec+0.11*durationScale.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBrand } from "../theme";
import { GoldSeal, SealLights, goldTones, type GoldTones } from "./GoldSeal";
import { ContactShadow, Shockwave, Sparks } from "./Effects";
import { sealState, sealTimeline, V02_REST, type SealRest, type SealState, type SealTimeline } from "./timeline";
import { DEFAULT_ICON, type SealIcon } from "./sealGeometry";

const CAM_Z0 = 9.4;
/** luz neutra de estudio (nao e cor de marca): brilho que varre o metal, e o branco das faiscas */
const SWEEP_LIGHT = "#FFF1CC";
const WHITE = "#FFFFFF";
const FOV0 = 30;
/** px de tela por unidade de mundo no plano z=0 */
const pxPerUnit = (h: number, camZ: number, fov: number) => h / (2 * camZ * Math.tan((fov * Math.PI) / 360));

export type SealTransitionProps = {
  /** instante (s de composicao) em que o selo cobre 100% do quadro. A troca de cena vai em [atSec, coverEndSec]. */
  atSec: number;
  /** estica/encolhe a transicao inteira em volta de atSec (1 = V02, 0.92 s de janela). */
  durationScale?: number;
  /** cor do metal (padrao brand.colors.accent). Tons satin/polish/emissivo derivam dela. */
  color?: string;
  /** cor da marca refletida no metal e no toque de luz (padrao brand.colors.primaryLight). */
  tint?: string;
  /** multiplicador de luz + reflexo (1 = V02). Abaixe (0.85) se o metal lavar para creme. */
  brightness?: number;
  /** multiplicador dos claroes aditivos do impacto e da rachadura (1 = V02; 0 desliga). */
  flash?: number;
  /** teto do emissivo do metal (1 = V02 sem teto; 0.5 evita estouro). */
  heatMax?: number;
  /** relevo fino do corpo (1 = V02). */
  relief?: number;
  /** icone do relevo central: estrela de N pontas ou path SVG. */
  icon?: SealIcon;
  /** pouso: centro (px) e raio (px) do selo em repouso. Padrao V02 ~ x 586, y 724, raio 244 (1080x1920). */
  restPx?: { x: number; y: number; r: number };
  /** de que lado o selo entra. */
  from?: "right" | "left";
  /** escurecimento do fundo durante a queda (1 = V02, 30% de ink). */
  dim?: number;
  /** "seams" (padrao: rachadura nas emendas reais das pecas, presa ao selo) ou "radial" (V02: 8 linhas SVG). */
  crackStyle?: "seams" | "radial";
  /** protege o rosto: o clarao da revelacao nao passa sobre esta elipse (px). null desliga. */
  faceSafe?: { x: number; y: number; rx: number; ry: number } | null;
  /** sombra projetada dos relevos (mais bonito, +30% de render em software). */
  shadows?: boolean;
};

/** janelas uteis para o montador/audio */
export const sealWindows = (atSec: number, durationScale = 1) => {
  const tl = sealTimeline(atSec, durationScale);
  return {
    fromSec: tl.windowFrom,
    toSec: tl.windowTo,
    impactSec: tl.impact,
    coverFromSec: tl.dive1 - 0.005,
    coverToSec: tl.open0 + 0.01,
    revealDoneSec: tl.open1,
  };
};

const Stage: React.FC<{
  st: SealState;
  tones: GoldTones;
  tint: string;
  accent: string;
  accentLight: string;
  ink: string;
  white: string;
  rest: SealRest;
  brightness: number;
  heatMax: number;
  relief: number;
  icon: SealIcon;
  seams: boolean;
  shadows: boolean;
}> = ({ st, tones, tint, accent, accentLight, ink, white, rest, brightness, heatMax, relief, icon, seams, shadows }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(st.cam.pos[0], st.cam.pos[1], st.cam.pos[2]);
  camera.fov = st.cam.fov;
  camera.up.set(Math.sin(st.cam.roll), Math.cos(st.cam.roll), 0);
  camera.lookAt(st.cam.pos[0], st.cam.pos[1], 0);
  camera.updateProjectionMatrix();
  return (
    <>
      <SealLights intensity={brightness} tint={tint} shadows={shadows} />
      <pointLight position={[st.sweep.x, st.sweep.y, st.sweep.z]} intensity={st.sweep.intensity * brightness} color={SWEEP_LIGHT} decay={2} />
      <ContactShadow ink={ink} height={st.height} opacity={st.shadow} x={st.seal.pos[0]} y={st.seal.pos[1]} scale={st.seal.scale} />
      <GoldSeal
        position={st.seal.pos}
        rotation={st.seal.rot}
        scale={st.seal.scale}
        squash={st.seal.squash}
        split={st.seal.split}
        heat={st.seal.heat}
        heatMax={heatMax}
        envIntensity={0.8 * brightness}
        relief={relief}
        splitTravel={3.4}
        coreVector={[-0.3, 4.4, 1.2]}
        crack={seams ? st.crack : 0}
        crackOpacity={st.crackFade}
        icon={icon}
        tones={tones}
        tint={tint}
        castShadow={shadows}
        receiveShadow={shadows}
      />
      <Shockwave dt={st.dt} x={rest.x} y={rest.y} s={rest.s} light={tones.ring} accent={accent} />
      <Sparks dt={st.dt} x={rest.x} y={rest.y} s={rest.s} light={accentLight} white={white} />
    </>
  );
};

/** Rachadura V02 (8 linhas SVG irregulares do centro para fora). */
const RadialCracks: React.FC<{ progress: number; w: number; h: number; tones: GoldTones }> = ({ progress, w, h, tones }) => {
  if (progress <= 0.001) return null;
  const paths: string[] = [];
  for (let i = 0; i < 8; i++) {
    const base = (i / 8) * Math.PI * 2;
    let d = "M 0 0";
    for (let k = 1; k <= 8; k++) {
      const r = k * 150;
      const j = Math.sin(i * 7.3 + k * 2.1) * 0.05;
      d += ` L ${(Math.cos(base + j) * r).toFixed(1)} ${(Math.sin(base + j) * r).toFixed(1)}`;
    }
    paths.push(d);
  }
  const common = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - progress };
  return (
    <svg width={w} height={h} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} stroke={tones.crackDark} strokeWidth={9} {...common} />
          <path d={d} stroke={tones.crackLight} strokeWidth={3.5} {...common} />
        </g>
      ))}
    </svg>
  );
};

const rgba = (hex: string, a: number) => {
  const c = new THREE.Color().setStyle(hex, THREE.SRGBColorSpace);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${Math.min(1, Math.max(0, a)).toFixed(3)})`;
};

/** Clarao ADITIVO (mix-blend screen): soma luz onde o gradiente e forte; nao cobre com pelicula opaca. */
const Glow: React.FC<{
  power: number;
  x: number;
  y: number;
  radius: number;
  wash?: number;
  tones: GoldTones;
  accentLight: string;
  hole?: { x: number; y: number; rx: number; ry: number } | null;
}> = ({ power, x, y, radius, wash = 0, tones, accentLight, hole }) => {
  if (power <= 0.002) return null;
  const mask = hole
    ? `radial-gradient(ellipse ${hole.rx}px ${hole.ry}px at ${hole.x}px ${hole.y}px, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.12) 55%, #000 100%)`
    : undefined;
  const maskStyle: React.CSSProperties = mask ? { WebkitMaskImage: mask, maskImage: mask } : {};
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "screen",
          background: `radial-gradient(circle ${radius}px at ${x}px ${y}px, ${rgba(tones.cream, 0.62 * power)} 0%, ${rgba(tones.creamMid, 0.42 * power)} 28%, ${rgba(accentLight, 0.18 * power)} 62%, ${rgba(accentLight, 0)} 100%)`,
          ...maskStyle,
        }}
      />
      {wash > 0 && <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", backgroundColor: rgba(tones.ring, wash * power), ...maskStyle }} />}
    </>
  );
};

const MotionBlurDef: React.FC<{ id: string; sx: number; sy: number }> = ({ id, sx, sy }) => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
    </filter>
  </svg>
);

/** Linhas de velocidade do mergulho (radiais, curtas). */
const DiveStreaks: React.FC<{ dive: number; w: number; h: number; light: string; white: string }> = ({ dive, w, h, light, white }) => {
  const op = interpolate(dive, [0.15, 0.55, 1], [0, 0.55, 0.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (op <= 0.001) return null;
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + Math.sin(i * 12.9898) * 0.09;
    const r0 = 330 + ((i * 37) % 11) * 38 + dive * 620;
    const len = 90 + ((i * 53) % 7) * 46 + dive * 300;
    lines.push(
      <line
        key={i}
        x1={Math.cos(a) * r0}
        y1={Math.sin(a) * r0}
        x2={Math.cos(a) * (r0 + len)}
        y2={Math.sin(a) * (r0 + len)}
        stroke={i % 4 === 0 ? white : light}
        strokeWidth={i % 3 === 0 ? 5 : 3}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <svg width={w} height={h} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`} style={{ position: "absolute", inset: 0, opacity: op }}>
      {lines}
    </svg>
  );
};



export const SealTransition: React.FC<SealTransitionProps> = ({
  atSec,
  durationScale = 1,
  color,
  tint,
  brightness = 1,
  flash = 1,
  heatMax = 1,
  relief = 1,
  icon = DEFAULT_ICON,
  restPx,
  from = "right",
  dim = 1,
  crackStyle = "seams",
  faceSafe = { x: 540, y: 1130, rx: 300, ry: 340 },
  shadows = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const brand = useBrand();
  const TL: SealTimeline = sealTimeline(atSec, durationScale);
  const fromF = Math.floor(TL.windowFrom * fps);
  const toF = Math.ceil(TL.windowTo * fps);
  if (frame < fromF || frame > toF) return null;

  const accent = color ?? brand.colors.accent;
  const tones = goldTones(accent);
  const tintC = tint ?? brand.colors.primaryLight;
  const accentLight = color ? tones.creamMid : brand.colors.accentLight;
  const K0 = pxPerUnit(height, CAM_Z0, FOV0);
  const rest: SealRest = restPx
    ? { x: (restPx.x - width / 2) / K0, y: (height / 2 - restPx.y) / K0, s: restPx.r / K0 }
    : V02_REST;
  const side = from === "left" ? -1 : 1;
  const st = sealState(frame, fps, TL, rest, side);

  // desfoque de movimento so na queda, proporcional ao deslocamento desde o quadro anterior
  const prev = sealState(frame - 1, fps, TL, rest, side);
  const k = pxPerUnit(height, st.cam.pos[2], st.cam.fov);
  const falling = st.t < TL.impact;
  const mbx = falling ? Math.min(16, Math.abs(st.seal.pos[0] - prev.seal.pos[0]) * k * 0.17) : 0;
  const mby = falling ? Math.min(6, Math.abs(st.seal.pos[1] - prev.seal.pos[1]) * k * 0.17) : 0;
  const blur = mbx > 0.6 || mby > 0.6;
  const at = sealState(Math.round(TL.impact * fps), fps, TL, rest, side);
  const kAt = pxPerUnit(height, at.cam.pos[2], at.cam.fov);
  const atPx = { x: width / 2 + (at.seal.pos[0] - at.cam.pos[0]) * kAt, y: height / 2 - (at.seal.pos[1] - at.cam.pos[1]) * kAt };
  const blurId = `sl-mb-${Math.round(atSec * 1000)}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundColor: brand.colors.ink, opacity: st.dim * dim }} />
      {blur && <MotionBlurDef id={blurId} sx={mbx} sy={mby} />}
      <div style={{ position: "absolute", inset: 0, filter: blur ? `url(#${blurId})` : undefined }}>
        <ThreeCanvas
          width={width}
          height={height}
          shadows={shadows}
          gl={{ antialias: true, alpha: true }}
          camera={{ fov: FOV0, position: [0, 0, CAM_Z0], near: 0.1, far: 60 }}
        >
          <Stage
            st={st}
            tones={tones}
            tint={tintC}
            accent={accent}
            accentLight={accentLight}
            ink={brand.colors.ink}
            white={WHITE}
            rest={rest}
            brightness={brightness}
            heatMax={heatMax}
            relief={relief}
            icon={icon}
            seams={crackStyle === "seams"}
            shadows={shadows}
          />
        </ThreeCanvas>
      </div>
      {crackStyle === "radial" && <RadialCracks progress={st.crack * st.crackFade} w={width} h={height} tones={tones} />}
      <DiveStreaks dive={st.dive} w={width} h={height} light={accentLight} white={WHITE} />
      <Glow power={st.flash * flash} x={atPx.x} y={atPx.y} radius={620} wash={0.1} tones={tones} accentLight={accentLight} />
      <Glow
        power={(st.flashOpen * 0.85 + st.rays * 0.15) * flash}
        x={width / 2}
        y={height / 2}
        radius={760}
        wash={0.06}
        tones={tones}
        accentLight={accentLight}
        hole={faceSafe}
      />
    </AbsoluteFill>
  );
};
