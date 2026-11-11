import React from "react";

// Sprites desenhados em grade (pixel art 16-bit). "." = transparente.
export const PAL: Record<string, string> = {
  o: "#12051F", // contorno
  w: "#FFFFFF",
  l: "#B48CFF", // lilas Tridi
  p: "#8B00FF", // roxo Tridi
  s: "#4A0E8F", // sombra roxa
  y: "#FFD23F", // ouro (moeda)
  d: "#C98A12", // ouro escuro
  k: "#C9A16B", // kraft
  K: "#8E6A3E", // kraft escuro
  g: "#E9E2F7", // papel claro
};

export const SPR = {
  carimbo: [
    "....oooo....",
    "...owwwlo...",
    "...owwllo...",
    "....owlo....",
    "....owlo....",
    "..oooooooo..",
    ".ollllllllo.",
    ".owllllllso.",
    "oooooooooooo",
    "oppppppppppo",
    "opppppppppso",
    ".oooooooooo.",
  ],
  moeda: [
    "...oooooo...",
    "..oyyyyyyo..",
    ".oywwyyyydo.",
    "oywyyddyyydo",
    "oywyydyyyydo",
    "oyyyydyyyydo",
    "oyyyydyyyydo",
    "oyyyyddyyydo",
    "oyyyyyyyyddo",
    ".oyyyyyyddo.",
    "..oddddddo..",
    "...oooooo...",
  ],
  caixa: [
    "............",
    "..oooooooo..",
    ".okkkkkkkko.",
    "oKKKKKKKKKKo",
    "okkkkkkkkkko",
    "okkkpppkkkko",
    "okkplllpkkko",
    "okkkpppkkkko",
    "okkkkkkkkkko",
    "okkkkkkkkkKo",
    "oKKKKKKKKKKo",
    "oooooooooooo",
  ],
  saquinho: [
    "....oooo....",
    "...o....o...",
    "...o....o...",
    ".oooooooooo.",
    ".ogggggggso.",
    ".oggppppgso.",
    ".ogplllpgso.",
    ".oggppppgso.",
    ".ogggggggso.",
    ".ogggggggso.",
    ".osssssssso.",
    ".oooooooooo.",
  ],
  papel: [
    ".ooooooo....",
    ".okkkkkKo...",
    ".okkkkkKKo..",
    ".okkkkkooooo",
    ".okkkkkkkkko",
    ".okkpppkkkko",
    ".okplllpkkko",
    ".okkpppkkkko",
    ".okkkkkkkkko",
    ".oKkkkkkkkko",
    ".oKKKKKKKKKo",
    ".ooooooooooo",
  ],
  estrela: [
    ".....oo.....",
    "....owlo....",
    "....ollo....",
    "oooolllloooo",
    "owllllllllso",
    ".ollllllllo.",
    "..ollllllo..",
    "..ollllllo..",
    ".olllooollo.",
    ".ollo..olso.",
    "oolo....oloo",
    "oo........oo",
  ],
  check: [
    "..........oo",
    ".........owo",
    "........owo.",
    "oo.....owo..",
    "owo...owo...",
    ".owo.owo....",
    "..owowo.....",
    "...owo......",
    "....o.......",
  ],
  mao: [
    "....oo......",
    "...owwo.....",
    "...owwo.....",
    "...owwo.....",
    "...owwoooo..",
    "...owwowwooo",
    ".ooowwowwowo",
    "owwowwwwwwwo",
    "owwwwwwwwwwo",
    ".owwwwwwwwwo",
    ".owwwwwwwwo.",
    "..owwwwwwwo.",
    "...owwwwwo..",
    "...oooooooo.",
  ],
} as const;

export const Sprite: React.FC<{
  mapa: readonly string[];
  px: number; // tamanho de cada "pixel"
  style?: React.CSSProperties;
  pal?: Record<string, string>;
}> = ({ mapa, px, style, pal = PAL }) => {
  const h = mapa.length;
  const w = Math.max(...mapa.map((r) => r.length));
  const rects: React.ReactNode[] = [];
  mapa.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === "." || !pal[c]) continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={pal[c]} />);
    }
  });
  return (
    <svg
      width={w * px}
      height={h * px}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      style={{ display: "block", ...style }}
    >
      {rects}
    </svg>
  );
};

// Poligono com cantos "em degrau" (2 degraus), em px.
export const degrau = (w: number, h: number, s: number) => {
  const p = [
    [2 * s, 0], [w - 2 * s, 0], [w - 2 * s, s], [w - s, s], [w - s, 2 * s], [w, 2 * s],
    [w, h - 2 * s], [w - s, h - 2 * s], [w - s, h - s], [w - 2 * s, h - s], [w - 2 * s, h],
    [2 * s, h], [2 * s, h - s], [s, h - s], [s, h - 2 * s], [0, h - 2 * s],
    [0, 2 * s], [s, 2 * s], [s, s], [2 * s, s],
  ];
  return `polygon(${p.map(([x, y]) => `${x}px ${y}px`).join(", ")})`;
};

// Moldura pixelada: sombra dura + borda clara + miolo.
export const MolduraPixel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  s?: number; // tamanho do degrau
  borda?: number;
  corBorda?: string;
  corMiolo?: string;
  sombra?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, s = 8, borda = 8, corBorda = PAL.l, corMiolo = "#12051F", sombra = 14, children, style }) => {
  const iw = w - 2 * borda;
  const ih = h - 2 * borda;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>
      {sombra > 0 ? (
        <div
          style={{
            position: "absolute",
            left: sombra,
            top: sombra,
            width: w,
            height: h,
            background: "#000000",
            opacity: 0.85,
            clipPath: degrau(w, h, s),
          }}
        />
      ) : null}
      <div style={{ position: "absolute", inset: 0, background: corBorda, clipPath: degrau(w, h, s) }} />
      <div
        style={{
          position: "absolute",
          left: borda,
          top: borda,
          width: iw,
          height: ih,
          background: corMiolo,
          clipPath: degrau(iw, ih, Math.max(2, s - borda / 2)),
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
