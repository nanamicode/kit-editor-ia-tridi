/**
 * Entry de teste do modulo de audio. Composicao SoundMix: toca voz + bed aprovados e desenha
 * uma regua de depuracao com os cues (cada tipo numa linha) e um pulso sincronizado ao "relevo".
 * Still: npx remotion still src/dev/SoundMix.ts SoundMix --frame=18 ...
 */
import React from "react";
import { AbsoluteFill, Composition, interpolate } from "remotion";
import { BrandProvider, BRAND_ROXO_DOURADO, SAFE, useBrand, W } from "../kit/theme";
import { CUES_EXEMPLO, SoundMix, cueTimes, parseCues, useCuePulse, useTimeSec, type CueTipo } from "../kit/audio";

const CUES = parseCues(CUES_EXEMPLO);
const LINHAS: CueTipo[] = ["corte", "pressao", "relevo", "riser", "revelacao", "ui", "ding", "stinger"];
const DUR_S = 12.1;

const Regua: React.FC = () => {
  const b = useBrand();
  const t = useTimeSec();
  const relevo = useCuePulse(cueTimes(CUES, "relevo"), { attack: 0.03, release: 0.3 });
  const corte = useCuePulse(cueTimes(CUES, "corte"), { attack: 0.02, release: 0.15 });
  const x0 = SAFE.side;
  const x1 = W - SAFE.side;
  const X = (s: number) => interpolate(s, [0, DUR_S], [x0, x1]);
  return (
    <AbsoluteFill style={{ backgroundColor: b.colors.ink, fontFamily: b.fonts.text, color: b.colors.text }}>
      <div style={{ position: "absolute", top: SAFE.top, left: x0, fontFamily: b.fonts.display, fontSize: 96 }}>
        CUES DE AUDIO
      </div>
      <div style={{ position: "absolute", top: SAFE.top + 130, left: x0, fontSize: 48 }}>t = {t.toFixed(2)} s</div>
      {LINHAS.map((tipo, i) => {
        const y = 560 + i * 92;
        return (
          <React.Fragment key={tipo}>
            <div style={{ position: "absolute", top: y - 30, left: x0, fontSize: 44, opacity: 0.8 }}>{tipo}</div>
            {cueTimes(CUES, tipo).map((s) => (
              <div
                key={s}
                style={{
                  position: "absolute",
                  top: y + 22,
                  left: X(s) - 5,
                  width: 10,
                  height: 36,
                  backgroundColor: s <= t ? b.colors.accent : b.colors.primaryLight,
                }}
              />
            ))}
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", top: 520, bottom: 1920 - 1320, left: X(t) - 2, width: 4, backgroundColor: b.colors.text }} />
      <div
        style={{
          position: "absolute",
          top: 1360,
          left: W / 2 - 90,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: b.colors.accent,
          transform: `scale(${1 + 0.5 * relevo})`,
          opacity: 0.25 + 0.75 * relevo,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: b.colors.text, opacity: 0.35 * corte }} />
      <SoundMix />
    </AbsoluteFill>
  );
};

const Dev: React.FC = () => (
  <BrandProvider brand={BRAND_ROXO_DOURADO}>
    <Regua />
  </BrandProvider>
);

export const SoundMixDevRoot: React.FC = () => (
  <Composition id="SoundMix" component={Dev} width={1080} height={1920} fps={30} durationInFrames={363} />
);
