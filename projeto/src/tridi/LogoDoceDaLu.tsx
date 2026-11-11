import React, { useId } from "react";
import { anton } from "./theme";

// MARCA ILUSTRATIVA FICTICIA ("Doce da Lu"), desenhada como arte de carimbo de 1 cor.
// Nao representa nenhum cliente real. Sempre acompanhar da etiqueta "marca ilustrativa" na cena.
// Desenhada num quadro 200x200 centrado em (0,0): use <g transform> para posicionar.
export const LogoDoceDaLu: React.FC<{ cor: string }> = ({ cor }) => {
  const id = useId().replace(/:/g, "");
  const arcTop = `arcTop${id}`;
  const arcBot = `arcBot${id}`;
  // forminha de brigadeiro: trapezio com pregas
  const flutes = Array.from({ length: 9 }, (_, i) => -26 + i * 6.5);
  return (
    <g>
      <defs>
        <path id={arcTop} d="M -66 0 A 66 66 0 0 1 66 0" />
        <path id={arcBot} d="M -70 0 A 70 70 0 0 0 70 0" />
      </defs>
      <circle r={96} fill="none" stroke={cor} strokeWidth={7} />
      <circle r={86} fill="none" stroke={cor} strokeWidth={2.2} />
      <text
        fontFamily={anton}
        fontSize={36}
        letterSpacing={2.5}
        fill={cor}
        textAnchor="middle"
      >
        <textPath href={`#${arcTop}`} startOffset="50%">
          DOCE DA LU
        </textPath>
      </text>
      <text
        fontFamily={anton}
        fontSize={17}
        letterSpacing={4}
        fill={cor}
        textAnchor="middle"
        dominantBaseline="hanging"
      >
        <textPath href={`#${arcBot}`} startOffset="50%">
          BRIGADEIROS
        </textPath>
      </text>
      {/* estrelinhas laterais */}
      {[-1, 1].map((s) => (
        <path
          key={s}
          transform={`translate(${s * 80} 4)`}
          d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z"
          fill={cor}
        />
      ))}
      {/* brigadeiro: bolinha com granulado sobre forminha */}
      <g transform="translate(0 6)">
        <mask id={`gran${id}`} maskUnits="userSpaceOnUse" x={-40} y={-50} width={80} height={80}>
          <rect x={-40} y={-50} width={80} height={80} fill="#000" />
          <circle cx={0} cy={-14} r={27} fill="#fff" />
          {[
            [-12, -26, 30], [2, -32, -20], [13, -22, 60], [-4, -16, 10], [10, -9, -40],
            [-15, -8, 75], [0, -2, 20], [-20, -18, -60], [18, -15, 15], [6, -22, 90],
          ].map(([x, y, r], i) => (
            <rect
              key={i}
              x={x - 3.4}
              y={y - 1.2}
              width={6.8}
              height={2.4}
              rx={1.2}
              fill="#000"
              transform={`rotate(${r} ${x} ${y})`}
            />
          ))}
        </mask>
        <rect x={-40} y={-50} width={80} height={80} fill={cor} mask={`url(#gran${id})`} />
        <path d="M -34 6 L 34 6 L 26 38 L -26 38 Z" fill="none" stroke={cor} strokeWidth={4.5} strokeLinejoin="round" />
        {flutes.map((x, i) => (
          <line key={i} x1={x * 1.18} y1={8} x2={x} y2={36} stroke={cor} strokeWidth={2.4} />
        ))}
        <path d="M -38 6 Q -19 -2 0 6 Q 19 -2 38 6" fill="none" stroke={cor} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};
