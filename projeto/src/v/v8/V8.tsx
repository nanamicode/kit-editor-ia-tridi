// V8 · Totem de autoatendimento · Estilo FCA nº 25 "Suíço / grade tipográfica" + visual V2 (Design Suíço)
// Grade rígida (margens 80 px, coluna de vídeo 836 + coluna de etiqueta), grotesca pesada caixa-alta,
// fundo carvão com riscas finas, 1 cor de acento (roxo do próprio vídeo), cabeçalho "quadro de partidas".
// Sem narração: textos só DESCREVEM o que aparece. Áudio original (música) preservado.
// Correção V02: cartão maior (836x1008), títulos concretos, FIG complementa (não repete), entradas escalonadas,
// sem avanço lento (evita trepidação 23,976->30), zoom lento no quadro congelado do CTA.
// Correção R2: cartão mais alto (836x1238, ocupa a faixa de baixo), FIG sobe para a linha do cabeçalho
// (sem "FIG. 0X"/índice decorativo, sem rótulo que repetia o título), painel "BEBIDAS" cobre o copo com
// marca de terceiros no plano 5. Marca dos totens: Maindx (não aparece escrita no original nem na edição).
import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const grotesca = loadInterTight("normal", { weights: ["800"], subsets: ["latin", "latin-ext"] }).fontFamily;
const texto = loadInter("normal", { weights: ["600"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const V8_FPS = 30;
export const V8_DURATION = 518; // 17,27 s (original 17,28 s)

// Padrão visual (reutilizável, separado dos dados)
const COR = {
  fundo: "#0E0E11",
  risca: "rgba(255,255,255,0.028)",
  guia: "#1F1F25",
  regua: "#34343C",
  cinza: "#A4A4AD",
  claro: "#D4D4DA",
  branco: "#F4F4F6",
  roxo: "#8A3FFC", // caixas (texto branco por cima)
  roxoTexto: "#A877FF", // palavra de acento sobre fundo escuro
};
const M = 80; // margem lateral
const HEAD_Y = 196; // linha de apoio (descrição do plano) + régua de progresso; fora do 4:5, dentro da margem de 100 px
const TITULO_Y = 286; // título: 2 linhas x 104 px -> 286..494
const CARD = { x: M, y: 522, w: 836, h: 1238 }; // 522..1760 (imagem pode passar sob a UI; texto nenhum abaixo de 1635)
const FIG_Y = HEAD_Y - 4; // descrição do plano na linha do cabeçalho
const CARD_W_FINAL = 1080 - 2 * M; // 920 na cena da apresentadora
const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const ATRASO_TITULO = 2; // título entra 2 quadros depois do corte
const ATRASO_FIG = 6; // legenda de figura entra 6 quadros depois do corte
const SAIDA = 3; // saída curta do texto anterior (só opacidade, sem máscara)

// Cortes reais do original (scdet), convertidos para 30 fps
type Cena = {
  from: number;
  l1: string;
  l2: string;
  fig: { pre: string; hl: string; post: string } | null; // complementa o título; null = sem FIG
  cy: number; // centro vertical do recorte, em px do vídeo-fonte (1920)
  z: number; // zoom sobre "largura cheia do cartão"
};
const CENAS: Cena[] = [
  { from: 0, l1: "PEÇA", l2: "NA TELA", fig: { pre: "tela ", hl: "vertical", post: " de toque" }, cy: 1010, z: 1.0 },
  { from: 78, l1: "CARDÁPIO", l2: "DIGITAL", fig: { pre: "fotos dos ", hl: "lanches", post: "" }, cy: 1090, z: 1.1 },
  { from: 169, l1: "TOQUE PARA", l2: "INICIAR", fig: { pre: "botão na ", hl: "base", post: " da tela" }, cy: 900, z: 1.0 },
  { from: 211, l1: "PAGAMENTO", l2: "NO CARTÃO", fig: { pre: "teclado para ", hl: "senha", post: "" }, cy: 1170, z: 1.0 },
  { from: 252, l1: "ESCOLHA", l2: "NO TOQUE", fig: { pre: "monte o ", hl: "pedido", post: "" }, cy: 980, z: 1.0 },
  { from: 296, l1: "TOTEM", l2: "DE PÉ", fig: { pre: "acabamento ", hl: "preto", post: " brilhante" }, cy: 1200, z: 1.0 },
  { from: 341, l1: "PEÇA E PAGUE", l2: "NO TOTEM", fig: { pre: "tela e ", hl: "leitor", post: " juntos" }, cy: 1060, z: 1.0 },
  { from: 387, l1: "CONHEÇA", l2: "O TOTEM", fig: null, cy: 1150, z: 1.0 },
];
const CTA_FROM = 444; // ~14,8 s, acento da música
const CENA_EXPANDE = 387;
// Plano 5: o copo na tela do totem traz marca de terceiros (src x 360-510, y 630-915, câmera parada).
// Painel da grade cobre essa área desde o quadro do corte e diz qual tela está aberta (a própria tela mostra "Bebidas").
const TAPA = { cena: 4, x: 300, y: 585, w: 460, h: 375 }; // em px do vídeo-fonte 1080x1920
const CONGELA = 460; // 15,33 s: quadro nítido, antes do fade-out para preto do original (15,85 s)

const cenaDe = (f: number) => {
  let i = 0;
  for (let k = 0; k < CENAS.length; k++) if (f >= CENAS[k].from) i = k;
  return i;
};
const fimDe = (i: number) => (i + 1 < CENAS.length ? CENAS[i + 1].from : V8_DURATION);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Fundo e grade ----------
const Fundo: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COR.fundo,
      backgroundImage: `repeating-linear-gradient(90deg, ${COR.risca} 0px, ${COR.risca} 1px, transparent 1px, transparent 9px)`,
    }}
  >
    {[M, 1080 - M].map((x) => (
      <div key={x} style={{ position: "absolute", left: x, top: 0, width: 1, height: 1920, background: COR.guia }} />
    ))}
  </AbsoluteFill>
);

// ---------- Cabeçalho: régua de progresso (a descrição do plano entra por cima dela, em <Figura>) ----------
const Cabecalho: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <div style={{ position: "absolute", left: M, top: HEAD_Y + 64, width: 1080 - 2 * M, height: 2, background: COR.regua }} />
      <div
        style={{
          position: "absolute",
          left: M,
          top: HEAD_Y + 63,
          height: 4,
          background: COR.roxo,
          width: interpolate(frame, [0, durationInFrames - 1], [0, 1080 - 2 * M], clamp),
        }}
      />
    </>
  );
};

// ---------- Título (duas linhas; R2: sem máscara, para nenhum quadro mostrar palavra cortada no corte) ----------
const Titulo: React.FC<{ l1: string; l2: string; dur: number; caixa?: boolean; imediato?: boolean; semSaida?: boolean }> = ({
  l1,
  l2,
  dur,
  caixa,
  imediato,
  semSaida,
}) => {
  // imediato: o 1º título já está na tela no quadro 0 (gancho / miniatura)
  const raw = useCurrentFrame();
  const frame = raw + (imediato ? 12 : 0);
  const sai = semSaida ? 1 : interpolate(raw, [dur - SAIDA, dur], [1, 0], clamp);
  const linha: React.CSSProperties = { height: 104, display: "flex" };
  const base: React.CSSProperties = {
    fontFamily: grotesca,
    fontSize: 100,
    lineHeight: "104px",
    letterSpacing: "-0.035em",
    whiteSpace: "nowrap",
  };
  // entrada: opacidade + deslocamento curto (palavra sempre inteira)
  const entra = (a: number) => interpolate(frame, [a, a + 6], [22, 0], { ...clamp, easing: EASE });
  const op = (a: number) => Math.min(sai, interpolate(frame, [a, a + 4], [0, 1], clamp));
  return (
    <div style={{ position: "absolute", left: M - 4, top: TITULO_Y, width: 1080 - 2 * M + 8 }}>
      <div style={linha}>
        <div style={{ ...base, color: COR.branco, translate: `0px ${entra(0)}px`, opacity: op(0) }}>{l1}</div>
      </div>
      <div style={linha}>
        <div
          style={{
            ...base,
            color: caixa ? COR.branco : COR.roxoTexto,
            background: caixa ? COR.roxo : "transparent",
            padding: caixa ? "0 22px 0 18px" : 0,
            translate: `0px ${entra(2)}px`,
            opacity: op(2),
          }}
        >
          {l2}
        </div>
      </div>
    </div>
  );
};

// ---------- Legenda de figura (apoio, complementa o título) ----------
const Figura: React.FC<{ pre: string; hl: string; post: string; dur: number; imediato?: boolean }> = ({
  pre,
  hl,
  post,
  dur,
  imediato,
}) => {
  const raw = useCurrentFrame();
  const frame = raw + (imediato ? 20 : 0);
  const op = Math.min(
    interpolate(frame, [0, 6], [0, 1], clamp),
    interpolate(raw, [dur - SAIDA, dur], [1, 0], clamp),
  );
  return (
    <div
      style={{
        position: "absolute",
        left: M,
        top: FIG_Y,
        display: "flex",
        alignItems: "center",
        whiteSpace: "pre",
        fontFamily: texto,
        fontSize: 44,
        color: COR.claro,
        opacity: op,
        translate: interpolate(frame, [0, 10], ["0px 14px", "0px 0px"], { ...clamp, easing: EASE }),
      }}
    >
      <span>{pre}</span>
      <span style={{ position: "relative", padding: "0 10px" }}>
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 2,
            bottom: 2,
            width: "100%",
            background: COR.roxo,
            transformOrigin: "left center",
            scale: `${interpolate(frame, [4, 14], [0, 1], { ...clamp, easing: EASE })} 1`,
          }}
        />
        <span style={{ position: "relative", color: COR.branco }}>{hl}</span>
      </span>
      <span>{post}</span>
    </div>
  );
};

// ---------- Barra roxa que "atualiza o quadro" a cada corte ----------
const BarraCorte: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        height: 8,
        background: COR.roxo,
        width: `${interpolate(frame, [0, 10], [0, 100], { ...clamp, easing: EASE })}%`,
        opacity: interpolate(frame, [10, 18], [1, 0], clamp),
      }}
    />
  );
};

// ---------- Cartão com o vídeo original ----------
const Cartao: React.FC = () => {
  const frame = useCurrentFrame();
  const i = cenaDe(frame);
  const c = CENAS[i];
  const w = interpolate(frame, [CENA_EXPANDE, CENA_EXPANDE + 18], [CARD.w, CARD_W_FINAL], { ...clamp, easing: EASE });
  // sem avanço lento nos planos (a câmera do original já se move); só zoom lento sobre o quadro congelado do CTA
  const zCongela = interpolate(frame, [CONGELA, V8_DURATION - 1], [1, 1.06], clamp);
  const vw = w * c.z * zCongela;
  const vh = (vw * 1920) / 1080;
  const k = vw / 1080;
  const top = Math.min(0, Math.max(CARD.h - vh, CARD.h / 2 - c.cy * k));
  const left = (w - vw) * 0.62; // no zoom final puxa levemente para a apresentadora (lado direito)
  const marca = (x: number, y: number, sx: number, sy: number) => (
    <div key={`${x}-${y}`} style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", left: sx < 0 ? -22 : 0, top: -1, width: 22, height: 3, background: COR.claro }} />
      <div style={{ position: "absolute", left: -1, top: sy < 0 ? -22 : 0, width: 3, height: 22, background: COR.claro }} />
    </div>
  );
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: w,
          height: CARD.h,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* o original escurece até o preto a partir de ~15,85 s: congela o último quadro bom sob o CTA */}
        <Freeze frame={CONGELA} active={frame >= CONGELA}>
          <Video
            src={staticFile("v/v8/v8.mp4")}
            muted
            style={{ position: "absolute", left, top, width: vw, height: vh, maxWidth: "none" }}
          />
        </Freeze>
        {i === TAPA.cena ? (
          <div
            style={{
              position: "absolute",
              left: left + TAPA.x * k,
              top: top + TAPA.y * k,
              width: TAPA.w * k,
              height: TAPA.h * k,
              background: COR.fundo,
              borderTop: `8px solid ${COR.roxo}`,
              boxSizing: "border-box",
              padding: "18px 22px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // R3: bloco de texto junto, sem vazio no meio (o painel precisa da altura para cobrir o copo)
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: grotesca,
                fontSize: 64,
                lineHeight: "70px",
                letterSpacing: "-0.02em",
                color: COR.branco,
                translate: `0px ${interpolate(frame - c.from, [0, 8], [10, 0], { ...clamp, easing: EASE })}px`,
              }}
            >
              BEBIDAS
            </div>
            <div
              style={{
                fontFamily: texto,
                fontSize: 44,
                lineHeight: "52px",
                color: COR.claro,
                opacity: interpolate(frame - c.from, [2, 8], [0, 1], clamp),
              }}
            >
              sabor e preço
            </div>
          </div>
        ) : null}
        {CENAS.map((s, n) => (
          <Sequence key={n} from={s.from} durationInFrames={20} layout="none">
            <BarraCorte />
          </Sequence>
        ))}
      </div>
      {/* marcas de corte (registro) nos cantos */}
      {marca(CARD.x - 14, CARD.y - 14, -1, -1)}
      {marca(CARD.x + w + 14, CARD.y - 14, 1, -1)}
      {marca(CARD.x - 14, CARD.y + CARD.h + 14, -1, 1)}
      {marca(CARD.x + w + 14, CARD.y + CARD.h + 14, 1, 1)}
    </>
  );
};

// ---------- Etiqueta vertical na coluna direita (único lugar com "AUTOATENDIMENTO") ----------
const Etiqueta: React.FC = () => {
  const frame = useCurrentFrame();
  // sai por completo ANTES de o cartão começar a alargar
  const saida: [number, number] = [CENA_EXPANDE - 7, CENA_EXPANDE - 1];
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x + CARD.w + 16,
        top: CARD.y,
        writingMode: "vertical-rl",
        fontFamily: grotesca,
        fontSize: 48,
        letterSpacing: "0.02em",
        color: COR.branco,
        background: COR.roxo,
        padding: "22px 10px",
        opacity: interpolate(frame, saida, [1, 0], clamp),
        translate: interpolate(frame, saida, ["0px 0px", "40px 0px"], { ...clamp, easing: EASE }),
      }}
    >
      AUTOATENDIMENTO
    </div>
  );
};

export const V8: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* áudio original inteiro (música), independente do congelamento da imagem */}
      <Audio src={staticFile("v/v8/v8.mp4")} />
      <Fundo />
      <Cabecalho />
      <Cartao />
      <Etiqueta />
      {CENAS.map((s, n) => {
        // título entra 2 quadros depois do corte e sai nos 4 quadros em torno do próximo corte
        const ini = n === 0 ? 0 : s.from + ATRASO_TITULO;
        const fim = (n === CENAS.length - 1 ? CTA_FROM : fimDe(n)) + ATRASO_TITULO;
        return (
          <Sequence key={`t${n}`} name={`Título ${n + 1}`} from={ini} durationInFrames={fim - ini} layout="none">
            <Titulo l1={s.l1} l2={s.l2} dur={fim - ini} imediato={n === 0} />
          </Sequence>
        );
      })}
      <Sequence
        name="CTA"
        from={CTA_FROM + ATRASO_TITULO}
        durationInFrames={V8_DURATION - CTA_FROM - ATRASO_TITULO}
        layout="none"
      >
        <Titulo l1="SAIBA" l2="MAIS" caixa semSaida dur={V8_DURATION - CTA_FROM - ATRASO_TITULO} />
      </Sequence>
      {CENAS.map((s, n) => {
        if (!s.fig) return null;
        const ini = n === 0 ? 0 : s.from + ATRASO_FIG;
        const fim = fimDe(n) + 2; // termina de sumir logo após o corte
        return (
          <Sequence key={`f${n}`} name={`Figura ${n + 1}`} from={ini} durationInFrames={fim - ini} layout="none">
            <Figura {...s.fig} dur={fim - ini} imediato={n === 0} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
