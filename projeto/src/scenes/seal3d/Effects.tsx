import React, { useMemo } from "react";
import * as THREE from "three";
import { Easing, interpolate, random } from "remotion";

/** Elementos de apoio do impacto, todos em funcao pura do tempo (sem useFrame). */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ------------------------------------------------------- sombra de contato

let shadowTex: THREE.CanvasTexture | null = null;
function getShadowTexture(): THREE.CanvasTexture {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(10,4,24,1)");
  grad.addColorStop(0.62, "rgba(10,4,24,0.92)");
  grad.addColorStop(0.82, "rgba(10,4,24,0.35)");
  grad.addColorStop(1, "rgba(10,4,24,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  shadowTex = new THREE.CanvasTexture(c);
  shadowTex.colorSpace = THREE.SRGBColorSpace;
  return shadowTex;
}

/**
 * Sombra do selo sobre a superficie (o cartao). Antes do impacto ela antecipa o selo:
 * grande, fraca e deslocada; ao tocar vira sombra de contato curta e escura.
 */
export const ContactShadow: React.FC<{ height: number; opacity: number; x?: number; y?: number; scale?: number }> = ({
  height,
  opacity,
  x = 0,
  y = 0,
  scale = 1,
}) => {
  const tex = useMemo(() => getShadowTexture(), []);
  const h = Math.max(0, height);
  // no ar: sombra grande, fraca e deslocada (antecipa o selo); no toque: curta, escura e colada
  const sc = (1.12 + h * 0.2) * scale;
  const op = Math.min(1, opacity * (1.0 / (1 + h * 0.35)));
  return (
    <mesh position={[x + (0.045 + 0.1 * h * 0.5) * scale, y - (0.07 + 0.14 * h * 0.5) * scale - 0.02, -0.55]} scale={[sc * 1.06, sc * 1.06, 1]}>
      <planeGeometry args={[2.1, 2.1]} />
      <meshBasicMaterial map={tex} transparent opacity={op} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

// ------------------------------------------------------------ onda de choque

const RingMat: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => (
  <meshBasicMaterial
    color={color}
    transparent
    opacity={opacity}
    blending={THREE.AdditiveBlending}
    depthWrite={false}
    toneMapped={false}
    side={THREE.DoubleSide}
  />
);

/**
 * Dois aneis finos que saem do selo no impacto (so circulos: nada de hexagono nem tracejado,
 * para nao riscar o texto do quadro). Ficam sempre dentro de ~1.9 raios do selo.
 * x, y, s = posicao e escala do selo no mundo.
 */
export const Shockwave: React.FC<{ dt: number; x?: number; y?: number; s?: number }> = ({ dt, x = 0, y = 0, s = 1 }) => {
  if (dt <= 0 || dt > 0.3) return null;
  const e = (a: number, b: number, from: number, to: number) =>
    interpolate(dt, [a, b], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  const fade = (a: number, b: number) =>
    interpolate(dt, [a, b], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r1 = e(0, 0.22, 1.0, 1.6) * s;
  const r2 = e(0.03, 0.26, 1.0, 1.32) * s;
  return (
    <group position={[x, y, -0.03]}>
      <mesh scale={[r1, r1, 1]}>
        <ringGeometry args={[0.975, 1, 128]} />
        <RingMat color="#FFE9A8" opacity={0.85 * fade(0.04, 0.22)} />
      </mesh>
      <mesh scale={[r2, r2, 1]}>
        <ringGeometry args={[0.96, 1, 128]} />
        <RingMat color="#F5C542" opacity={0.6 * fade(0.08, 0.26)} />
      </mesh>
    </group>
  );
};

// -------------------------------------------------------------------- faiscas

const SPARKS = 26;
type Spark = { a: number; v: number; len: number; w: number; delay: number; life: number };
let sparkData: Spark[] | null = null;
function getSparks(): Spark[] {
  if (sparkData) return sparkData;
  sparkData = [];
  for (let i = 0; i < SPARKS; i++) {
    sparkData.push({
      a: (i / SPARKS) * Math.PI * 2 + (random(`sa${i}`) - 0.5) * 0.32,
      v: 2.2 + random(`sv${i}`) * 3.6,
      len: 0.07 + random(`sl${i}`) * 0.18,
      w: 0.012 + random(`sw${i}`) * 0.014,
      delay: random(`sd${i}`) * 0.03,
      life: 0.16 + random(`st${i}`) * 0.18,
    });
  }
  return sparkData;
}

/** Faiscas radiais do metal batendo: saem rapido, freiam (arrasto) e apagam. Ancoradas no selo (x, y, s). */
export const Sparks: React.FC<{ dt: number; x?: number; y?: number; s?: number }> = ({ dt, x = 0, y = 0, s = 1 }) => {
  if (dt <= 0 || dt > 0.4) return null;
  const sparks = getSparks();
  return (
    <group position={[x, y, 0.08]}>
      {sparks.map((sp, i) => {
        const t = dt - sp.delay;
        if (t <= 0 || t > sp.life) return null;
        const k = 7; // arrasto
        const r = (0.95 + (sp.v * (1 - Math.exp(-k * t))) / k) * s;
        const life = clamp(t / sp.life);
        const op = 1 - life * life;
        const len = sp.len * s * (1 - life * 0.6);
        return (
          <mesh
            key={i}
            position={[Math.cos(sp.a) * r, Math.sin(sp.a) * r, 0]}
            rotation={[0, 0, sp.a]}
            scale={[len, sp.w * s, 1]}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? "#FFFFFF" : "#FFD86B"}
              transparent
              opacity={op}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};
