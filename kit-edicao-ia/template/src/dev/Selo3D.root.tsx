import React from "react";
import { AbsoluteFill, Composition, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { BrandProvider, BRAND_ROXO_DOURADO } from "../kit/theme";
import { SealTransition, sealWindows, type SealTransitionProps } from "../kit/selo3d";

/**
 * Teste isolado do selo3d com os dados do V02 (atSec 7.71). Cena A = criativo.mp4 (cartao, 1080x1080 em top 420),
 * cena B = plate da apresentadora (exemplo/plate, 23.976 fps a partir de 7.6 s). A troca acontece em atSec.
 * Quadros de conferencia: 222 (queda), 226 (estampa), 232 (cobre), 234 (racha), 238 (revela).
 */
const V02: SealTransitionProps = { atSec: 7.71 };

/** offset = quadro absoluto onde a Sequence comeca (useCurrentFrame e relativo a ela). Indice >= 26: 1o quadro nitido da pessoa. */
const PlateFrame: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame() + offset;
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = Math.min(107, Math.max(26, Math.round(((t - 7.6) * 24000) / 1001) + 1));
  return (
    <Img
      src={staticFile(`exemplo/plate/p${String(idx).padStart(4, "0")}.jpg`)}
      style={{ position: "absolute", left: 0, bottom: 0, width: 1080, height: 1080 }}
    />
  );
};

const Stand: React.FC<SealTransitionProps> = (props) => {
  const { fps } = useVideoConfig();
  const swap = Math.round((sealWindows(props.atSec, props.durationScale).coverFromSec + 0.02) * fps);
  return (
    <BrandProvider brand={BRAND_ROXO_DOURADO}>
      <AbsoluteFill style={{ backgroundColor: BRAND_ROXO_DOURADO.colors.ink }}>
        <Sequence durationInFrames={swap}>
          <div style={{ position: "absolute", left: 0, top: 420, width: 1080, height: 1080, overflow: "hidden" }}>
            <Video src={staticFile("exemplo/criativo.mp4")} muted style={{ width: 1080, height: 1080 }} />
          </div>
        </Sequence>
        <Sequence from={swap}>
          <PlateFrame offset={swap} />
        </Sequence>
        <SealTransition {...props} />
      </AbsoluteFill>
    </BrandProvider>
  );
};

export const Selo3DRoot: React.FC = () => (
  <Composition id="Selo3D" component={Stand} defaultProps={V02} width={1080} height={1920} fps={30} durationInFrames={270} />
);
