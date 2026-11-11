import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../theme";
import { punchAt, type Punch } from "./util";

/**
 * <PresenterCamera> — camera da apresentadora: push lento (sobe, segura, volta a 1.0 antes do CTA) e socos curtos
 * nos picos/cortes de fala (com rotacao opcional), com paralaxe que so desloca quando ha escala sobrando.
 * Envolve o que deve "ser filmado" (cena da pessoa + texto atras dela). Legenda/CTA ficam FORA se nao podem mexer.
 * Armadilhas: a escala precisa voltar a 1.0 antes de um botao/CTA encostado na borda (push.out1);
 * socos so em picos reais de fala (a do audio), 2-5 por cena; a > 0.035 ja parece tremida.
 */

export type CameraPush = {
  /** sobe de in0 ate in1 (s), segura, desce de out0 ate out1 (s) */
  in0: number;
  in1: number;
  out0?: number;
  out1?: number;
  /** escala extra no topo (0.05 = +5%) */
  amount: number;
};

export type PresenterCameraProps = {
  children: React.ReactNode;
  punches?: readonly Punch[];
  push?: CameraPush | null;
  /** origem do zoom (CSS). 50% 58% = entre rosto e peito */
  origin?: string;
  /** deslocamento lateral quando ha escala sobrando (px por unidade de escala). 0 desliga */
  drift?: number;
  /** curva do soco: subida (s), antecipacao antes do pico (s), decaimento (k) */
  attack?: number;
  lead?: number;
  decay?: number;
};

const sine = Easing.inOut(Easing.sin);

export const pushAt = (t: number, p: CameraPush | null | undefined) => {
  if (!p) return 0;
  const up = sine(clamp((t - p.in0) / Math.max(0.01, p.in1 - p.in0), 0, 1));
  const down = p.out0 !== undefined && p.out1 !== undefined ? sine(clamp((t - p.out0) / Math.max(0.01, p.out1 - p.out0), 0, 1)) : 0;
  return p.amount * up * (1 - down);
};

export const PresenterCamera: React.FC<PresenterCameraProps> = ({
  children,
  punches = [],
  push = null,
  origin = "50% 58%",
  drift = 260,
  attack = 0.06,
  lead = 0.03,
  decay = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = punchAt(t, punches, attack, lead, decay);
  const s = 1 + pushAt(t, push) + p.s;
  const k = s - 1;
  const t0 = push?.in0 ?? 0;
  const tx = k * drift * Math.sin((t - t0) * 1.1);
  const ty = -k * drift * 0.42;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: origin,
        transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${p.rot.toFixed(3)}deg) scale(${s.toFixed(5)})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
