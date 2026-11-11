/** Apoio do impacto (dentro do ThreeCanvas): sombra de contato, aneis de choque, faiscas. Funcao pura do tempo. */
import React, { useMemo } from "react";
import * as THREE from "three";
import { Easing, interpolate, random } from "remotion";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const shadowTex = new Map<string, THREE.CanvasTexture>();
function getShadowTexture(ink: string): THREE.CanvasTexture {
  const hit = shadowTex.get(ink);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  const col = new THREE.Color().setStyle(ink, THREE.SRGBColorSpace);
  const rgb = `${Math.round(col.r * 255 * 0.556)},${Math.round(col.g * 255 * 0.4)},${Math.round(col.b * 255 * 0.66)}`;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.62, `rgba(${rgb},0.92)`);
  grad.addColorStop(0.82, `rgba(${rgb},0.35)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  shadowTex.set(ink, t);
  return t;
}

/** Sombra do selo na superficie: no ar grande/fraca/deslocada (antecipa), no toque curta e escura. */
export const ContactShadow: React.FC<{ ink: string; height: number; opacity: number; x?: number; y?: number; scale?: number }> = ({
  ink,
  height,
  opacity,
  x = 0,
  y = 0,
  scale = 1,
}) => {
  const tex = useMemo(() => getShadowTexture(ink), [ink]);
  const h = Math.max(0, height);
  const sc = (1.12 + h * 0.2) * scale;
  const op = Math.min(1, opacity * (1.0 / (1 + h * 0.35)));
  if (op <= 0.002) return null;
  return (
    <mesh position={[x + (0.045 + 0.1 * h * 0.5) * scale, y - (0.07 + 0.14 * h * 0.5) * scale - 0.02, -0.55]} scale={[sc * 1.06, sc * 1.06, 1]}>
      <planeGeometry args={[2.1, 2.1]} />
      <meshBasicMaterial map={tex} transparent opacity={op} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

const RingMat: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => (
  <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
);

/** Dois aneis finos que saem do selo no impacto (ficam dentro de ~1.6 raio: nao riscam o texto). */
export const Shockwave: React.FC<{ dt: number; x?: number; y?: number; s?: number; light: string; accent: string }> = ({
  dt,
  x = 0,
  y = 0,
  s = 1,
  light,
  accent,
}) => {
  if (dt <= 0 || dt > 0.3) return null;
  const e = (a: number, b: number, from: number, to: number) =>
    interpolate(dt, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const fade = (a: number, b: number) => interpolate(dt, [a, b], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r1 = e(0, 0.22, 1.0, 1.6) * s;
  const r2 = e(0.03, 0.26, 1.0, 1.32) * s;
  return (
    <group position={[x, y, -0.03]}>
      <mesh scale={[r1, r1, 1]}>
        <ringGeometry args={[0.975, 1, 128]} />
        <RingMat color={light} opacity={0.85 * fade(0.04, 0.22)} />
      </mesh>
      <mesh scale={[r2, r2, 1]}>
        <ringGeometry args={[0.96, 1, 128]} />
        <RingMat color={accent} opacity={0.6 * fade(0.08, 0.26)} />
      </mesh>
    </group>
  );
};

const SPARKS = 26;
type Spark = { a: number; v: number; len: number; w: number; delay: number; life: number };
let sparkData: Spark[] | null = null;
function getSparks(): Spark[] {
  if (sparkData) return sparkData;
  sparkData = [];
  // random() do Remotion = deterministico por semente (mesmas faiscas do V02)
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

/** Faiscas radiais do metal batendo: saem rapido, freiam e apagam. */
export const Sparks: React.FC<{ dt: number; x?: number; y?: number; s?: number; light: string; white: string }> = ({
  dt,
  x = 0,
  y = 0,
  s = 1,
  light,
  white,
}) => {
  if (dt <= 0 || dt > 0.4) return null;
  return (
    <group position={[x, y, 0.08]}>
      {getSparks().map((sp, i) => {
        const t = dt - sp.delay;
        if (t <= 0 || t > sp.life) return null;
        const k = 7;
        const r = (0.95 + (sp.v * (1 - Math.exp(-k * t))) / k) * s;
        const life = clamp(t / sp.life);
        const len = sp.len * s * (1 - life * 0.6);
        return (
          <mesh key={i} position={[Math.cos(sp.a) * r, Math.sin(sp.a) * r, 0]} rotation={[0, 0, sp.a]} scale={[len, sp.w * s, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? white : light}
              transparent
              opacity={1 - life * life}
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
