import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sacola } from "./Sacola";
import { COR, TEX, anton, inter } from "./theme";

// Composicao de teste da protagonista em 3 estados (still de aprovacao).
// Frame 0..59: estados parados; 60..66 carimbada animada no 3o painel; 75..89 painel 1 em modo kraft natural (conferencia).
export const SACOLA_TESTE = { width: 1920, height: 1200, fps: 30, durationInFrames: 90 };

const Painel: React.FC<{ x: number; fundo: "cinza" | "riso"; rotulo: string; children: React.ReactNode }> = ({
  x,
  fundo,
  rotulo,
  children,
}) => (
  <div style={{ position: "absolute", left: x, top: 0, width: 640, height: 1200, overflow: "hidden" }}>
    {fundo === "cinza" ? (
      <>
        <Img src={TEX.papelFundo} style={{ position: "absolute", width: 1080, height: 1920, left: -220, top: -360, filter: "grayscale(1) contrast(1.05) brightness(0.93)" }} />
        <Img src={TEX.reticulaGradiente} style={{ position: "absolute", width: 1080, height: 1920, left: -220, top: -720, opacity: 0.16 }} />
      </>
    ) : (
      <>
        <div style={{ position: "absolute", inset: 0, background: COR.roxo }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: COR.sombra,
            WebkitMaskImage: `url(${TEX.reticulaGrossa})`,
            WebkitMaskSize: "128px 128px",
            maskImage: `url(${TEX.reticulaGrossa})`,
            maskSize: "128px 128px",
            opacity: 0.35,
          }}
        />
      </>
    )}
    {/* balcao */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 930, height: 270, background: fundo === "cinza" ? "#9a9a9a" : COR.sombra, opacity: fundo === "cinza" ? 0.55 : 0.55 }} />
    {children}
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 1060,
        fontFamily: inter,
        fontWeight: 600,
        fontSize: 34,
        color: fundo === "cinza" ? "#1c1c1c" : "#fff",
      }}
    >
      {rotulo}
    </div>
  </div>
);

export const SacolaTeste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tum = 60; // frame da carimbada no painel 3
  const tinta = spring({ frame: frame - tum, fps, config: { damping: 200 }, durationInFrames: 6 });
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      <Painel x={0} fundo="cinza" rotulo="1 · lisa (mundo cinza)">
        <div style={{ position: "absolute", left: 85, top: 300, rotate: "-2deg" }}>
          <Sacola largura={470} modo={frame >= 75 ? "kraft" : "cinza"} olharX={-0.8} olharY={0.15} expressao="seria" />
        </div>
      </Painel>
      <Painel x={640} fundo="cinza" rotulo="2 · olhando para cima">
        <div style={{ position: "absolute", left: 85, top: 300, rotate: "3deg" }}>
          <Sacola largura={470} modo="cinza" olharX={0.15} olharY={-1} expressao="cima" />
        </div>
        {/* sombra do carimbo cruzando o topo */}
        <div style={{ position: "absolute", left: 300, top: -60, width: 300, height: 220, borderRadius: 24, background: "#000", opacity: 0.22, filter: "blur(18px)" }} />
      </Painel>
      <Painel x={1280} fundo="riso" rotulo="3 · carimbada (risografia)">
        <div
          style={{
            position: "absolute",
            left: 85,
            top: 300,
            rotate: "-1.5deg",
            translate: `0px ${interpolate(frame, [tum, tum + 2, tum + 5], [0, 6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
          }}
        >
          <Sacola
            largura={470}
            modo="riso"
            olharX={0}
            olharY={0}
            expressao="feliz"
            carimbada
            tinta={frame < tum ? 1 : tinta}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 384,
            top: 960,
            fontFamily: inter,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: 1,
            color: "#fff",
            opacity: 0.9,
          }}
        >
          marca ilustrativa
        </div>
        <div
          style={{
            position: "absolute",
            left: 250,
            top: 120,
            rotate: "-6deg",
            fontFamily: anton,
            fontSize: 84,
            color: "#fff",
            border: "8px solid #fff",
            padding: "0 18px",
            lineHeight: 1.15,
          }}
        >
          CARIMBADA.
        </div>
      </Painel>
    </AbsoluteFill>
  );
};
