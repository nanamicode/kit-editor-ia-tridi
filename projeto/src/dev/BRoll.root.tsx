import { AbsoluteFill, Composition } from "remotion";
import { BRoll } from "../scenes/BRoll";
import { Seal3D } from "../scenes/Seal3D";

/** B-roll com o overlay Seal3D por cima (como na montagem final) — so para conferir o rotulo 6. */
const WithSeal: React.FC = () => (
  <AbsoluteFill>
    <BRoll />
    <Seal3D />
  </AbsoluteFill>
);

export const BRollDevRoot: React.FC = () => (
  <>
    <Composition
      id="BRoll"
      component={BRoll}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={363}
    />
    <Composition
      id="BRollSeal"
      component={WithSeal}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={363}
    />
  </>
);
