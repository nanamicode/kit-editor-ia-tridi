import React from "react";
import { Composition } from "remotion";
import { V5 } from "./V5";

// v5 · Carimbos Tridi · Estilo FCA 5 Dossie (mural de investigacao) + visual V43 Letra a Mao
// Original 720x720, video 16,2 s; audio 16,42 s -> 493 quadros (cobre a cauda do audio)
export const RootV5: React.FC = () => {
  return (
    <Composition
      id="V5"
      component={V5}
      durationInFrames={493}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
