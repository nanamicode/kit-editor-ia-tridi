import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export const PrimeiroProjeto: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "#0f0a1f",
        justifyContent: "center",
        alignItems: "center",
        padding: "100px 80px",
      }}
    >
      <div
        style={{
          color: "#f5f0ff",
          fontFamily: "Arial, sans-serif",
          fontWeight: 800,
          fontSize: 120,
          lineHeight: 1.05,
          textAlign: "center",
          textTransform: "uppercase",
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 20], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Meu primeiro projeto
      </div>
    </AbsoluteFill>
  );
};
