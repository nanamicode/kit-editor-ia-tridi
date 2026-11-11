import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { LogoDoceDaLu } from "../LogoDoceDaLu";
import { COR, TEX, anton, inter } from "../theme";
import { DUR, T } from "./tempo";
import { POSE_CTA } from "./personagem";
import { Balao, Carimbo, EO, Etiqueta, Linha, Mundo, iv, mola } from "./ui";

const BROLL = (n: string) => staticFile(`tridi/broll/${n}`);
const BALCAO_Y = 1430; // topo do balcao (base da sacola 1440)

// ---------- fundos ----------
export const Fundo: React.FC<{ mundo: Mundo }> = ({ mundo }) => {
  const f = useCurrentFrame();
  if (mundo === "cinza") {
    // parede cinza fria + reticula; a sacola kraft e a unica coisa quente
    return (
      <AbsoluteFill style={{ backgroundColor: "#c9ccd0" }}>
        <Img src={TEX.papelFundo} style={{ position: "absolute", width: 1080, height: 1920, filter: "grayscale(1) contrast(1.05) brightness(0.9)", opacity: 0.9 }} />
        <Img src={TEX.reticulaGradiente} style={{ position: "absolute", top: -260, width: 1080, height: 1920, opacity: 0.2 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: BALCAO_Y, bottom: 0, backgroundColor: "#7d8186", opacity: 0.62 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: BALCAO_Y,
            bottom: 0,
            backgroundColor: "#1c1c1c",
            WebkitMaskImage: `url(${TEX.reticula})`,
            WebkitMaskSize: "128px 128px",
            opacity: 0.26,
          }}
        />
        <div style={{ position: "absolute", left: 0, right: 0, top: BALCAO_Y - 2, height: 4, backgroundColor: "#3c3f43", opacity: 0.5 }} />
      </AbsoluteFill>
    );
  }
  // risografia: roxo + papel (multiplica) + reticula grossa; balcao so com a sacola em cena
  const balcao = f < T.prova || f >= T.cta ? 1 : 0;
  const by = f >= T.cta ? POSE_CTA.base - 10 : BALCAO_Y;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.roxo }}>
      {/* papel quente aparecendo por baixo da tinta (falhas de cobertura) */}
      <Img src={TEX.papelFundo} style={{ position: "absolute", width: 1080, height: 1920, filter: "grayscale(1) contrast(1.6)", mixBlendMode: "multiply", opacity: 0.6 }} />
      <Img src={TEX.papelFundo} style={{ position: "absolute", width: 1080, height: 1920, filter: "sepia(0.5) contrast(2.2) brightness(1.1)", mixBlendMode: "screen", opacity: 0.16 }} />
      {/* segunda tinta: pontos grandes de reticula em #3A0A6B */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: COR.sombra,
          WebkitMaskImage: `url(${TEX.reticulaGrossa})`,
          WebkitMaskSize: "200px 200px",
          opacity: 0.5,
        }}
      />
      {/* placa lilas fora de registro (~6 px) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: "6px 4px",
          backgroundColor: COR.lilas,
          WebkitMaskImage: `url(${TEX.reticulaGrossa})`,
          WebkitMaskSize: "200px 200px",
          mixBlendMode: "screen",
          opacity: 0.18,
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: by, bottom: 0, backgroundColor: COR.sombra, opacity: 0.55 * balcao }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: by - 2, height: 4, backgroundColor: COR.lilas, opacity: 0.5 * balcao }} />
    </AbsoluteFill>
  );
};

// ---------- textos do mundo sem marca ----------
export const TextosCinza: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = mola(f, T.onde, fps, 11, 230);
  return (
    <>
      <Linha f={f} estilo="tarja" texto="POV: SOU SUA SACOLA" size={98} top={298} inicio={-8} fim={T.levei} rot={-2} />
      <Linha f={f} estilo="tarja" texto="SEM LOGO." size={98} top={430} inicio={-8} fim={T.levei} rot={1.2} />

      <Linha f={f} estilo="tarja" texto="LEVEI O MELHOR" size={96} top={306} inicio={T.levei} fim={T.onde} rot={-1.5} />
      <Linha f={f} estilo="tarja" texto="BRIGADEIRO" size={96} top={432} inicio={T.levei + 2} fim={T.onde} rot={1} />

      {/* balao do CLIENTE: rabicho sai da borda esquerda (quem fala esta fora de quadro) */}
      {f >= T.onde && f < T.lisa ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 150,
              top: 302,
              rotate: "-4deg",
              opacity: iv(f, [T.onde + 2, T.onde + 5], [0, 1]),
              translate: `${iv(f, [T.onde + 2, T.onde + 8], [-30, 0], EO)}px 0px`,
            }}
          >
            <span style={{ display: "inline-block", background: "#161616", color: "#fff", fontFamily: inter, fontWeight: 800, fontSize: 48, padding: "4px 20px 8px", letterSpacing: 1 }}>
              cliente:
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              left: 150,
              top: 392,
              transformOrigin: "0% 100%",
              scale: b,
              rotate: `${-3 + (1 - b) * -12}deg`,
            }}
          >
            <svg width={220} height={130} viewBox="0 0 220 130" style={{ position: "absolute", left: -190, top: 70, overflow: "visible" }}>
              <path d="M200 6 L-20 120 L210 70 Z" fill="#fff" />
            </svg>
            <Balao cauda="nenhuma" padding="22px 54px 30px">
              <span style={{ fontFamily: inter, fontWeight: 800, fontSize: 96, color: "#161616", letterSpacing: -1 }}>é de onde??</span>
            </Balao>
          </div>
        </>
      ) : null}

      {/* pausa comica: corte seco, nada se mexe */}
      {f >= T.lisa && f < T.ninguem ? (
        <>
          <div style={{ position: "absolute", left: 0, width: 1080, top: 316, display: "flex", justifyContent: "center" }}>
            <span
              style={{
                display: "inline-block",
                backgroundImage: `url(${TEX.tarja})`,
                backgroundSize: "100% 100%",
                fontFamily: anton,
                fontSize: 88,
                lineHeight: 1.1,
                padding: "18px 34px 14px",
                color: "#fff",
                rotate: "-2deg",
              }}
            >
              E EU…
            </span>
          </div>
          <div style={{ position: "absolute", left: 0, width: 1080, top: 452, textAlign: "center" }}>
            <span style={{ fontFamily: anton, fontSize: 230, lineHeight: 1.08, color: "#141414", letterSpacing: 4 }}>LISA.</span>
          </div>
        </>
      ) : null}

      <Linha f={f} estilo="tarja" texto="NINGUÉM LEMBROU" size={100} top={318} inicio={T.ninguem} fim={T.ateQue} rot={-1.5} />
      <Linha f={f} estilo="tarja" texto="DE MIM." size={100} top={446} inicio={T.ninguem + 2} fim={T.ateQue} rot={2} />

      <Linha f={f} estilo="tarja" texto="ATÉ QUE…" size={104} top={318} inicio={T.ateQue} fim={T.tum} rot={-2} />
    </>
  );
};

// ---------- textos do mundo com marca ----------
export const TextosRiso: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = mola(f, T.carimbada, fps, 13, 260);
  return (
    <>
      {f >= T.carimbada && f < T.agora ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 330, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "#fff",
              padding: 12,
              boxShadow: `10px 10px 0 ${COR.sombra}`,
              scale: 1.4 - 0.4 * m,
              rotate: "-4deg",
            }}
          >
            <div
              style={{
                border: `9px solid ${COR.roxo}`,
                boxShadow: `inset 0 0 0 6px #fff, inset 0 0 0 10px ${COR.roxo}`,
                padding: "6px 38px 10px",
                fontFamily: anton,
                fontSize: 132,
                lineHeight: 1.08,
                color: COR.sombra,
                textShadow: `-3px 3px 0 ${COR.roxo}`,
                letterSpacing: 3,
                WebkitMaskImage: `url(${TEX.tinta})`,
                WebkitMaskSize: "720px 720px",
              }}
            >
              CARIMBADA.
            </div>
          </div>
        </div>
      ) : null}
      <Linha f={f} estilo="papel" texto="AGORA EU" size={108} top={318} inicio={T.agora} fim={T.prova} rot={-2} />
      <Linha f={f} estilo="papel" texto="TENHO NOME." size={108} top={456} inicio={T.agora + 3} fim={T.prova} rot={1.5} />
    </>
  );
};

// ---------- fita de selo (credibilidade): legivel no celular (>= 44 px) ----------
const Fita: React.FC<{ texto: string; top: number; size?: number; rot?: number; inicio: number }> = ({ texto, top, size = 44, rot = -1.5, inicio }) => {
  const f = useCurrentFrame();
  if (f < inicio) return null;
  const t = f - inicio;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top, display: "flex", justifyContent: "center", opacity: iv(t, [0, 2], [0, 1]), translate: `${iv(t, [0, 6], [-40, 0], EO)}px 0px` }}>
      <span
        style={{
          display: "inline-block",
          background: "#fff",
          color: COR.sombra,
          fontFamily: inter,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: size * 0.04,
          lineHeight: 1.1,
          padding: `${size * 0.16}px ${size * 0.5}px ${size * 0.2}px`,
          rotate: `${rot}deg`,
          boxShadow: `-4px 3px 0 ${COR.roxo}, 7px 7px 0 ${COR.sombra}`,
          whiteSpace: "nowrap",
        }}
      >
        {texto}
      </span>
    </div>
  );
};

// ---------- cartao de foto real (recorte com borda branca 12 px), cor quase natural ----------
const Cartao: React.FC<{
  x: number; y: number; w: number; rot: number; aspecto: number;
  foto: string; video?: string; inicio: number; nVideo?: number; trimVideo?: number; posicao?: string;
  zoom?: number; zoomOrigem?: string; style?: React.CSSProperties;
}> = ({ x, y, w, rot, aspecto, foto, video, inicio, nVideo = 0, trimVideo = 0, posicao = "50% 50%", zoom = 1, zoomOrigem, style }) => {
  const f = useCurrentFrame();
  const cw = w - 24;
  const midia: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: posicao, filter: "contrast(1.08) saturate(0.95)" };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        padding: 12,
        background: "#fff",
        boxShadow: `12px 14px 0 ${COR.sombra}`,
        rotate: `${rot}deg`,
        ...style,
      }}
    >
      <div style={{ position: "relative", width: cw, height: cw * aspecto, overflow: "hidden", backgroundColor: COR.sombra }}>
        <div style={{ position: "absolute", inset: 0, scale: zoom, transformOrigin: zoomOrigem ?? posicao }}>
          {video && f < inicio + nVideo ? (
            <Sequence from={inicio} durationInFrames={nVideo} layout="none">
              <Video src={BROLL(video)} muted objectFit="cover" trimBefore={trimVideo} style={midia} />
            </Sequence>
          ) : (
            <Img src={BROLL(foto)} style={midia} />
          )}
        </div>
        {/* leve tinta roxa so nas sombras: liga ao mundo sem apagar o realismo */}
        <div style={{ position: "absolute", inset: 0, backgroundColor: COR.lilas, mixBlendMode: "multiply", opacity: 0.1 }} />
      </div>
    </div>
  );
};

// ---------- prova: cartao grande (close real do copo Acai no Grau) + dois rotulos logo abaixo ----------
const ACAI_TRIM = 6; // o corte cai com o carimbo ja subindo (logo meio visivel)
export const Prova: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.prova || f >= T.grade) return null;
  const a = f - T.prova;
  return (
    <>
      <Cartao
        x={110}
        y={392}
        w={860}
        rot={-1.5 + iv(a, [0, 7], [-4, 0], EO)}
        aspecto={0.86}
        foto="acai_nat.png"
        video="ref1_acai.mp4"
        trimVideo={ACAI_TRIM}
        inicio={T.prova}
        nVideo={23 - ACAI_TRIM}
        posicao="50% 100%"
        zoom={iv(f, [T.prova + 17, T.grade], [1, 1.06])}
        style={{ translate: `0px ${iv(a, [0, 7], [90, 0], EO)}px`, scale: iv(a, [0, 7], [1.08, 1], EO) }}
      />
      <Fita texto="EMBALAGEM DE CLIENTE REAL" top={318} inicio={T.prova} rot={-2} />
      <Linha f={f} estilo="papel" texto="BORRACHA SÓLIDA" size={92} top={1196} inicio={T.borracha} fim={T.grade} rot={-2} />
      <Linha f={f} estilo="papel" texto="GRAVADA A LASER" size={92} top={1330} inicio={T.gravada} fim={T.grade} rot={1.5} />
    </>
  );
};

// ---------- serve em qualquer embalagem: 2 cartoes em cima + 1 largo embaixo, cortados no detalhe da estampa ----------
type Cel = { foto: string; posicao: string; origem: string; zoom: number; inicio: number; x: number; y: number; w: number; aspecto: number; rot: number };
const CELS: Cel[] = [
  { foto: "sapore_nat.png", posicao: "50% 100%", origem: "50% 100%", zoom: 1.6, inicio: T.celulas[0], x: 52, y: 566, w: 470, aspecto: 1, rot: -2.5 },
  { foto: "paes_nat.png", posicao: "50% 70%", origem: "28% 76%", zoom: 1.85, inicio: T.celulas[1], x: 558, y: 574, w: 470, aspecto: 1, rot: 2 },
  { foto: "pizza_nat.png", posicao: "50% 100%", origem: "37% 100%", zoom: 1.9, inicio: T.celulas[2], x: 150, y: 1072, w: 780, aspecto: 0.56, rot: -1.2 },
];

export const Grade: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.grade || f >= T.logo) return null;
  return (
    <>
      {CELS.map((c) => {
        if (f < c.inicio) return null;
        const t = f - c.inicio;
        const ent = mola(f, c.inicio, fps, 13, 260);
        return (
          <Cartao
            key={c.foto}
            x={c.x}
            y={c.y}
            w={c.w}
            rot={c.rot + (1 - ent) * 7}
            aspecto={c.aspecto}
            foto={c.foto}
            inicio={c.inicio}
            posicao={c.posicao}
            zoomOrigem={c.origem}
            zoom={c.zoom * iv(t, [0, 80], [1, 1.05])}
            style={{ scale: 1.18 - 0.18 * ent, opacity: iv(t, [0, 2], [0, 1]) }}
          />
        );
      })}
      <Linha f={f} estilo="papel" texto="SERVE EM QUALQUER" size={92} top={296} inicio={T.grade} fim={T.logo} rot={-2} />
      <Linha f={f} estilo="papel" texto="EMBALAGEM." size={92} top={418} inicio={T.grade + 2} fim={T.logo} rot={1.2} />
      <Fita texto="CLIENTES REAIS TRIDI" top={1548} inicio={T.celulas[2] + 4} rot={1} />
    </>
  );
};

// ---------- objecao: nao tem logo? a Tridi cria, voce aprova ----------
export const NaoTemLogo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.logo || f >= T.cta) return null;
  const t = f - T.logo;
  const carimba = mola(f, T.criam, fps, 12, 280);
  const aprova = mola(f, T.criam + 16, fps, 12, 280);
  const linha = (txt: string, cor: string, k: number, on: boolean, rot: number): React.ReactNode => (
    <div
      style={{
        fontFamily: anton,
        fontSize: 112,
        lineHeight: 1.06,
        color: cor,
        textShadow: cor === COR.roxo ? `-4px 3px 0 rgba(58,10,107,0.5)` : `-4px 3px 0 rgba(139,0,255,0.55)`,
        opacity: on ? 1 : 0,
        scale: on ? 1.25 - 0.25 * k : 1,
        rotate: `${rot}deg`,
        whiteSpace: "nowrap",
      }}
    >
      {txt}
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        top: 540,
        width: 860,
        background: "#F3EFE7",
        backgroundImage: `url(${TEX.papelTile})`,
        backgroundSize: "640px 640px",
        padding: "34px 30px 40px",
        boxShadow: `14px 16px 0 ${COR.sombra}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        rotate: `${-2 + iv(t, [0, 7], [-6, 0], EO)}deg`,
        translate: `0px ${iv(t, [0, 7], [120, 0], EO)}px`,
        scale: iv(t, [0, 7], [1.08, 1], EO),
      }}
    >
      <div style={{ fontFamily: anton, fontSize: 108, lineHeight: 1.08, color: COR.sombra, textShadow: "-4px 3px 0 rgba(139,0,255,0.5)" }}>
        NÃO TEM LOGO?
      </div>
      <div style={{ position: "relative", width: 300, height: 300, marginTop: 14 }}>
        {f < T.criam ? (
          <svg viewBox="0 0 360 360" width={300} height={300} style={{ position: "absolute", inset: 0 }}>
            <circle cx={180} cy={180} r={160} fill="none" stroke={COR.sombra} strokeWidth={7} strokeDasharray="20 14" />
            <text x={180} y={244} textAnchor="middle" fontFamily={anton} fontSize={170} fill={COR.sombra}>
              ?
            </text>
          </svg>
        ) : (
          <svg
            viewBox="-180 -180 360 360"
            width={300}
            height={300}
            style={{ position: "absolute", inset: 0, scale: 1.3 - 0.3 * carimba, rotate: `${-6 + (1 - carimba) * -10}deg`, overflow: "visible" }}
          >
            <g transform="translate(4 3) scale(1.66)" opacity={0.55}>
              <LogoDoceDaLu cor={COR.roxo} />
            </g>
            <g transform="scale(1.66)">
              <LogoDoceDaLu cor={COR.sombra} />
            </g>
          </svg>
        )}
      </div>
      <div style={{ height: 44, marginTop: 4 }}>
        {f >= T.criam ? (
          <span style={{ fontFamily: inter, fontWeight: 600, fontSize: 28, letterSpacing: 2, color: COR.sombra, textTransform: "uppercase" }}>
            marca ilustrativa
          </span>
        ) : null}
      </div>
      {linha("A TRIDI CRIA.", COR.roxo, carimba, f >= T.criam, -2)}
      {linha("VOCÊ APROVA.", COR.sombra, aprova, f >= T.criam + 16, 1.5)}
    </div>
  );
};

// ---------- CTA: entra ja montado (marca, fita de preco, sacola kraft carimbada, carimbo fisico, botao) ----------
export const CTA: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.cta) return null;
  const t = f - T.cta;
  const m = mola(f, T.cta, fps, 13, 240);
  const car = mola(f, T.cta + 1, fps, 12, 220);
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", justifyContent: "center" }}>
        <span
          style={{
            display: "inline-block",
            background: COR.sombra,
            color: "#fff",
            fontFamily: anton,
            fontSize: 112,
            lineHeight: 1.1,
            letterSpacing: 3,
            padding: "8px 40px 12px",
            boxShadow: `-5px 4px 0 ${COR.lilas}`,
            rotate: "-2deg",
            scale: 1.12 - 0.12 * m,
          }}
        >
          CARIMBOS TRIDI
        </span>
      </div>
      {/* motivo para tocar: mesmo peso visual do botao */}
      <Linha f={f} estilo="papel" texto="VEJA O PREÇO DA SUA" size={80} top={480} inicio={T.cta + 2} fim={99999} rot={1.5} cor={COR.sombra} />
      {/* o produto: carimbo fisico em pe no balcao, a direita da sacola (sem encostar) */}
      <div
        style={{
          position: "absolute",
          left: 724,
          top: POSE_CTA.base - 372 * (270 / 330),
          transformOrigin: "50% 100%",
          translate: `${(1 - car) * 140}px 0px`,
          rotate: `${4 + (1 - car) * 10}deg`,
        }}
      >
        <Carimbo largura={270} />
      </div>
      <Linha f={f} estilo="papel" texto="TOQUE EM SAIBA MAIS" size={92} top={1432} inicio={T.cta} fim={99999} rot={-1.5} cor={COR.sombra} />
      {f >= T.cta + 4 ? (
        <svg
          width={110}
          height={80}
          viewBox="0 0 120 86"
          style={{
            position: "absolute",
            left: 485,
            top: 1556,
            translate: `0px ${6 * Math.sin((t / 18.56) * 2 * Math.PI)}px`,
            opacity: iv(f, [T.cta + 4, T.cta + 8], [0, 1]),
          }}
        >
          <path d="M14 8 L60 38 L106 8" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 44 L60 74 L106 44" fill="none" stroke={COR.lilas} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </>
  );
};

// ---------- selos legais: UMA camada, fora da mascara da transicao e fora da camera ----------
export const Selos: React.FC = () => {
  const f = useCurrentFrame();
  const mundo: Mundo = f < T.tum + 5 ? "cinza" : "riso";
  // centro do logo na sacola do CTA, em x (etiqueta logo abaixo da sacola)
  const xCta = POSE_CTA.cx + (322 - 294) * ((700 * POSE_CTA.s) / 600);
  return (
    <>
      {f < T.prova || f >= T.cta ? <Etiqueta texto="cena ilustrativa" mundo={mundo} top={1590} left={88} size={30} /> : null}
      {f >= T.tum + 8 && f < T.prova ? <Etiqueta texto="marca ilustrativa" mundo="riso" top={1470} centro size={28} /> : null}
      {f >= T.cta && f < DUR ? (
        <Etiqueta texto="marca ilustrativa" mundo="riso" top={POSE_CTA.base + 8} left={xCta - 175} size={26} />
      ) : null}
    </>
  );
};
