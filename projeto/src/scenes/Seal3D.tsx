import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GoldSeal, SealLights } from "./seal3d/GoldSeal";
import { ContactShadow, Shockwave, Sparks } from "./seal3d/Effects";
import { FPS, TL, sealState, type SealState } from "./seal3d/timeline";

/** px de tela por unidade de mundo no plano z=0 para uma camera (distancia z, fov vertical). */
const pxPerUnit = (camZ: number, fov: number) => 1920 / (2 * camZ * Math.tan((fov * Math.PI) / 360));
/** posicao do selo na tela (px, origem no canto sup. esq.). */
const sealScreen = (st: SealState) => {
  const k = pxPerUnit(st.cam.pos[2], st.cam.fov);
  return { x: 540 + (st.seal.pos[0] - st.cam.pos[0]) * k, y: 960 - (st.seal.pos[1] - st.cam.pos[1]) * k };
};

/**
 * SEAL3D — transicao-estrela (camada de OVERLAY com alfa; fundo transparente).
 *
 * Roteiro (tempo de composicao):
 *  <7.30      NADA do selo: o clipe 6 (cartao + rotulo CARTOES) roda livre e o relevo aparece (7.467)
 *  7.30-7.50  o selo dourado 3D entra pela direita e despenca (6 quadros, motion blur horizontal),
 *             a sombra no cartao antecipa; a tela escurece um pouco (foco)
 *  7.50       IMPACTO (logo apos o 'relevo' do cue 7.48): squash, clarao ADITIVO de 2 quadros, dois aneis, faiscas, tremor
 *  7.56-7.71  a camera mergulha no selo (dolly + fov) ate cobrir 100% do quadro
 *  7.71-7.821 ouro cheio (brilho oscilando): troca B-roll -> apresentadora acontece aqui;
 *             rachaduras desenhadas nos ultimos ~2 quadros
 *  7.821      impacto grave (cue 'revelacao'): clarao aditivo curto, a camera recua e o selo estilhaca em 20 pecas planas
 *             de borda serrilhada e bisel polido; a estrela facetada sobe e sai pelo topo
 *  8.0        tudo fora do quadro (quadro 240): a apresentadora fica limpa, sem raios, veu nem pecas sobre ela
 * Requer: a cena Presenter por baixo deste overlay; o B-roll pode terminar dentro do intervalo coberto.
 */

export const WINDOW = { fromSec: TL.windowFrom, toSec: TL.windowTo };
/** Instante exato do impacto (s). AUDIO/INTEGRATOR: thump/flash/tremor sincronizam aqui. */
export const IMPACT_SEC = TL.impact;
/** Intervalo em que o selo cobre 100% do quadro (s): troca de cena invisivel dentro dele. */
export const COVER_SEC = { from: TL.dive1 - 0.005, to: TL.open0 + 0.01 };
/** Revelacao completa (estilhacos fora do quadro). */
export const REVEAL_DONE_SEC = TL.open1;

// pouso do selo (posicao em repouso, ver timeline): aneis e faiscas nascem exatamente ali
const REST_X = 0.12;
const REST_Y = 0.62;
const REST_S = 0.64;

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const st = sealState(frame);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  camera.position.set(st.cam.pos[0], st.cam.pos[1], st.cam.pos[2]);
  camera.fov = st.cam.fov;
  camera.up.set(Math.sin(st.cam.roll), Math.cos(st.cam.roll), 0);
  camera.lookAt(st.cam.pos[0], st.cam.pos[1], 0);
  camera.updateProjectionMatrix();

  return (
    <>
      <SealLights />
      <pointLight position={[st.sweep.x, st.sweep.y, st.sweep.z]} intensity={st.sweep.intensity} color="#FFF1CC" decay={2} />
      <ContactShadow height={st.height} opacity={st.shadow} x={st.seal.pos[0]} y={st.seal.pos[1]} scale={st.seal.scale} />
      <GoldSeal
        position={st.seal.pos}
        rotation={st.seal.rot}
        scale={st.seal.scale}
        squash={st.seal.squash}
        split={st.seal.split}
        heat={st.seal.heat}
        envRotation={st.seal.envRot}
        splitTravel={3.4}
        coreVector={[-0.3, 4.4, 1.2]}
      />
      <Shockwave dt={st.dt} x={REST_X} y={REST_Y} s={REST_S} />
      <Sparks dt={st.dt} x={REST_X} y={REST_Y} s={REST_S} />
    </>
  );
};

/**
 * Rachaduras desenhadas no ouro cheio (8 linhas irregulares do centro para fora, seguindo as
 * emendas entre os setores) um instante antes de as fatias abrirem: torna legivel que o selo racha.
 */
const CRACK_N = 8;
const crackPaths: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < CRACK_N; i++) {
    const base = (i / CRACK_N) * Math.PI * 2;
    let d = "M 0 0";
    for (let k = 1; k <= 8; k++) {
      const r = k * 150;
      const jitter = Math.sin(i * 7.3 + k * 2.1) * 0.05;
      d += ` L ${(Math.cos(base + jitter) * r).toFixed(1)} ${(Math.sin(base + jitter) * r).toFixed(1)}`;
    }
    out.push(d);
  }
  return out;
})();

const Cracks: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0.001) return null;
  return (
    <svg width="1080" height="1920" viewBox="-540 -960 1080 1920" style={{ position: "absolute", inset: 0 }}>
      {crackPaths.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#3A2200" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progress} />
          <path d={d} fill="none" stroke="#FFF6D6" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progress} />
        </g>
      ))}
    </svg>
  );
};

/**
 * Clarao ADITIVO (mix-blend-mode: screen): so soma luz onde o gradiente e forte, nao cobre o quadro com
 * uma pelicula opaca. `power` 0..1; centro e raio em px.
 */
const Glow: React.FC<{ power: number; x: number; y: number; radius: number; wash?: number }> = ({
  power,
  x,
  y,
  radius,
  wash = 0,
}) => {
  if (power <= 0.002) return null;
  const a = (v: number) => Math.min(1, Math.max(0, v * power)).toFixed(3);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "screen",
          background: `radial-gradient(circle ${radius}px at ${x}px ${y}px, rgba(255,251,236,${a(0.62)}) 0%, rgba(255,232,150,${a(0.42)}) 28%, rgba(255,214,100,${a(0.18)}) 62%, rgba(255,200,80,0) 100%)`,
        }}
      />
      {wash > 0 && (
        <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", backgroundColor: `rgba(255,236,170,${a(wash)})` }} />
      )}
    </>
  );
};

/** Desfoque de movimento da queda: filtro SVG com desvio calculado por quadro. */
const MotionBlurDef: React.FC<{ sx: number; sy: number }> = ({ sx, sy }) => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id="sl-mb" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
    </filter>
  </svg>
);

/** Linhas de velocidade do mergulho (radiais, curtas, do centro para as bordas). */
const DiveStreaks: React.FC<{ dive: number }> = ({ dive }) => {
  const op = interpolate(dive, [0.15, 0.55, 1], [0, 0.55, 0.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (op <= 0.001) return null;
  const n = 34;
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.sin(i * 12.9898) * 0.09;
    const r0 = 330 + ((i * 37) % 11) * 38 + dive * 620;
    const len = 90 + ((i * 53) % 7) * 46 + dive * 300;
    lines.push(
      <line
        key={i}
        x1={Math.cos(a) * r0}
        y1={Math.sin(a) * r0}
        x2={Math.cos(a) * (r0 + len)}
        y2={Math.sin(a) * (r0 + len)}
        stroke={i % 4 === 0 ? "#FFFFFF" : "#FFD86B"}
        strokeWidth={i % 3 === 0 ? 5 : 3}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <svg
      width="1080"
      height="1920"
      viewBox="-540 -960 1080 1920"
      style={{ position: "absolute", inset: 0, opacity: op }}
    >
      {lines}
    </svg>
  );
};

export const Seal3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const from = Math.floor(TL.windowFrom * FPS);
  const to = Math.ceil(TL.windowTo * FPS);
  if (frame < from || frame > to) return null;
  const st = sealState(frame);

  // desfoque de movimento: so na queda (selo ainda no ar); desvio proporcional ao deslocamento do quadro anterior
  const prev = sealState(frame - 1);
  const k = pxPerUnit(st.cam.pos[2], st.cam.fov);
  const falling = st.t < TL.impact;
  const mbx = falling ? Math.min(16, Math.abs(st.seal.pos[0] - prev.seal.pos[0]) * k * 0.17) : 0;
  const mby = falling ? Math.min(6, Math.abs(st.seal.pos[1] - prev.seal.pos[1]) * k * 0.17) : 0;
  const blur = mbx > 0.6 || mby > 0.6;
  const at = sealScreen(sealState(Math.round(TL.impact * FPS)));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* foco: escurece o cartao para o dourado ler */}
      <AbsoluteFill style={{ backgroundColor: "#120A24", opacity: st.dim }} />
      {blur && <MotionBlurDef sx={mbx} sy={mby} />}
      <div style={{ position: "absolute", inset: 0, filter: blur ? "url(#sl-mb)" : undefined }}>
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          gl={{ antialias: true, alpha: true }}
          camera={{ fov: 30, position: [0, 0, 9.4], near: 0.1, far: 60 }}
        >
          <Stage />
        </ThreeCanvas>
      </div>
      <Cracks progress={st.crack} />
      <DiveStreaks dive={st.dive} />
      {/* clarao do impacto: branco-dourado ADITIVO, ~2 quadros, concentrado no selo (sem veu no quadro) */}
      <Glow power={st.flash} x={at.x} y={at.y} radius={620} wash={0.1} />
      {/* clarao da rachadura: aditivo, ~2-3 quadros, termina antes do quadro 238 (7.93 s) */}
      <Glow power={st.flashOpen * 0.85 + st.rays * 0.15} x={540} y={960} radius={760} wash={0.06} />
    </AbsoluteFill>
  );
};

export default Seal3D;
