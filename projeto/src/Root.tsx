import React from "react";
import { Composition, Folder } from "remotion";
import { Criativo, DURATION, FPS } from "./Criativo";
import { SacolaTeste, SACOLA_TESTE } from "./tridi/SacolaTeste";
import { SacolaLisa, SACOLA_LISA } from "./tridi/SacolaLisa";
import { SacolaFig, SACOLA_FIG } from "./tridi/SacolaFig";
import { EstilosTridi, ESTILOS_TRIDI } from "./tridi/estilos/EstilosTridi";
import { CarimboShow, CS_DURATION, CS_FPS } from "./carimbo/CarimboShow";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Criativo"
        component={Criativo}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Folder name="FV09-Hooks">
        <Composition
          id="CriativoH1"
          component={Criativo}
          defaultProps={{ hook: "h1" as const }}
          durationInFrames={DURATION}
          fps={FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="CriativoH2"
          component={Criativo}
          defaultProps={{ hook: "h2" as const }}
          durationInFrames={DURATION}
          fps={FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="CriativoH3"
          component={Criativo}
          defaultProps={{ hook: "h3" as const }}
          durationInFrames={DURATION}
          fps={FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="CriativoH4"
          component={Criativo}
          defaultProps={{ hook: "h4" as const }}
          durationInFrames={DURATION}
          fps={FPS}
          width={1080}
          height={1920}
        />
      </Folder>
      <Folder name="Carimbos">
        <Composition
          id="CarimboShow"
          component={CarimboShow}
          durationInFrames={CS_DURATION}
          fps={CS_FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="CarimboShowH1"
          component={CarimboShow}
          defaultProps={{ hook: "h1" as const }}
          durationInFrames={CS_DURATION}
          fps={CS_FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="CarimboShowH2"
          component={CarimboShow}
          defaultProps={{ hook: "h2" as const }}
          durationInFrames={CS_DURATION}
          fps={CS_FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="CarimboShowH3"
          component={CarimboShow}
          defaultProps={{ hook: "h3" as const }}
          durationInFrames={CS_DURATION}
          fps={CS_FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="CarimboShowH4"
          component={CarimboShow}
          defaultProps={{ hook: "h4" as const }}
          durationInFrames={CS_DURATION}
          fps={CS_FPS}
          width={1080}
          height={1920}
        />
      </Folder>
      <Folder name="Tridi">
        <Composition
          id="EstilosTridi"
          component={EstilosTridi}
          durationInFrames={ESTILOS_TRIDI.durationInFrames}
          fps={ESTILOS_TRIDI.fps}
          width={ESTILOS_TRIDI.width}
          height={ESTILOS_TRIDI.height}
        />
        <Composition
          id="SacolaLisa"
          component={SacolaLisa}
          durationInFrames={SACOLA_LISA.durationInFrames}
          fps={SACOLA_LISA.fps}
          width={SACOLA_LISA.width}
          height={SACOLA_LISA.height}
        />
        <Composition
          id="SacolaFig"
          component={SacolaFig}
          durationInFrames={SACOLA_FIG.durationInFrames}
          fps={SACOLA_FIG.fps}
          width={SACOLA_FIG.width}
          height={SACOLA_FIG.height}
        />
        <Composition
          id="SacolaTeste"
          component={SacolaTeste}
          durationInFrames={SACOLA_TESTE.durationInFrames}
          fps={SACOLA_TESTE.fps}
          width={SACOLA_TESTE.width}
          height={SACOLA_TESTE.height}
        />
      </Folder>
    </>
  );
};
