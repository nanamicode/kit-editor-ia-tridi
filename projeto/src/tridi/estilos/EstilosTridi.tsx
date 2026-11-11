// Frames de estilo (style frames) para Carimbos Tridi em 9 estilos do catalogo FCA.
// Cada quadro (0..8) e um estilo diferente; render com `npx remotion still ... --frame=N`.
// Marca da virada = "Doce da Lu" (ILUSTRATIVA, ficticia). Fotos = embalagens reais de clientes Tridi (ref1).
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadPixel } from "@remotion/google-fonts/PressStart2P";
import { loadFont as loadCourier } from "@remotion/google-fonts/CourierPrime";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { anton, inter, COR, TEX } from "../theme";
import { Sacola } from "../Sacola";
import { LogoDoceDaLu } from "../LogoDoceDaLu";

const bangers = loadBangers().fontFamily;
const pixel = loadPixel().fontFamily;
const courier = loadCourier("normal", { weights: ["400", "700"] }).fontFamily;
const playfair = loadPlayfair("normal", { weights: ["900"] }).fontFamily;

export const ESTILOS_TRIDI = { width: 1080, height: 1920, fps: 30, durationInFrames: 9 };

const FOTO = {
  acai: staticFile("tridi/broll/acai_nat.png"),
  sapore: staticFile("tridi/broll/sapore_nat.png"),
  pizza: staticFile("tridi/broll/pizza_nat.png"),
  paes: staticFile("tridi/broll/paes_nat.png"),
};

const Logo: React.FC<{ cor: string; size: number; style?: React.CSSProperties; espelhar?: boolean }> = ({ cor, size, style, espelhar }) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ ...style, transform: espelhar ? "scaleX(-1)" : undefined }}>
    <LogoDoceDaLu cor={cor} />
  </svg>
);

const Etiqueta: React.FC<{ texto: string; style?: React.CSSProperties; escuro?: boolean }> = ({ texto, style, escuro }) => (
  <div style={{ position: "absolute", fontFamily: inter, fontWeight: 800, fontSize: 22, letterSpacing: 2, textTransform: "uppercase", padding: "6px 12px", background: escuro ? "rgba(0,0,0,.65)" : "rgba(255,255,255,.9)", color: escuro ? "#fff" : "#111", ...style }}>{texto}</div>
);

const Assinatura: React.FC<{ cor?: string; fundo?: string; style?: React.CSSProperties }> = ({ cor = "#fff", fundo = COR.roxo, style }) => (
  <div style={{ position: "absolute", left: 80, right: 80, bottom: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, ...style }}>
    <div style={{ fontFamily: anton, fontSize: 92, color: cor, background: fundo, padding: "6px 34px", lineHeight: 1.1 }}>TOQUE EM SAIBA MAIS</div>
    <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: cor === "#fff" ? "#fff" : cor }}>CARIMBOS TRIDI</div>
  </div>
);

// ---------------- 1 · Painel do comprador: a tela que o dono de negocio abre todo dia ----------------
const E01Painel: React.FC = () => (
  <AbsoluteFill style={{ background: "#0d0b12" }}>
    <AbsoluteFill style={{ backgroundImage: `url(${TEX.grao})`, opacity: 0.25 }} />
    <div style={{ position: "absolute", top: 230, left: 80, right: 80, textAlign: "center", fontFamily: anton, fontSize: 104, lineHeight: 1.0, color: "#fff" }}>
      A PERGUNTA QUE<br /><span style={{ color: COR.lilas }}>SUA SACOLA LISA</span><br />NÃO RESPONDE
    </div>
    {/* celular */}
    <div style={{ position: "absolute", left: 190, top: 660, width: 700, height: 900, borderRadius: 64, background: "#1c1a22", border: "10px solid #2c2933", boxShadow: "0 40px 90px rgba(0,0,0,.6)", overflow: "hidden" }}>
      <div style={{ height: 120, background: "#15131a", display: "flex", alignItems: "center", gap: 20, padding: "0 34px" }}>
        <div style={{ width: 66, height: 66, borderRadius: 33, background: "linear-gradient(135deg,#f6a,#b48cff)" }} />
        <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 30, color: "#fff" }}>cliente_maria<div style={{ fontWeight: 600, fontSize: 22, color: "#9a95a6" }}>mensagem direta</div></div>
      </div>
      <div style={{ padding: 34, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ alignSelf: "flex-start", background: "#2c2933", color: "#fff", fontFamily: inter, fontWeight: 600, fontSize: 34, padding: "20px 26px", borderRadius: 30, maxWidth: 520 }}>amei o brigadeiro!!</div>
        <div style={{ alignSelf: "flex-start", background: "#2c2933", color: "#fff", fontFamily: inter, fontWeight: 600, fontSize: 34, padding: "20px 26px", borderRadius: 30, maxWidth: 520 }}>minha amiga quer pedir também</div>
        <div style={{ alignSelf: "flex-start", background: COR.roxo, color: "#fff", fontFamily: inter, fontWeight: 800, fontSize: 46, padding: "24px 30px", borderRadius: 30, maxWidth: 560, boxShadow: `0 0 0 6px ${COR.lilas}` }}>é de onde??</div>
        <div style={{ alignSelf: "flex-end", background: "#3b3744", color: "#cfc9da", fontFamily: inter, fontWeight: 600, fontSize: 30, padding: "18px 24px", borderRadius: 30 }}>digitando…</div>
      </div>
    </div>
    <Etiqueta texto="cena ilustrativa" escuro style={{ left: 80, top: 1600 }} />
    {/* circulo de destaque */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <ellipse cx={420} cy={1083} rx={260} ry={90} fill="none" stroke={COR.lilas} strokeWidth={7} strokeDasharray="14 10" />
    </svg>
  </AbsoluteFill>
);

// ---------------- 3 · Letreiro / tipografia gigante ----------------
const E03Letreiro: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Img src={FOTO.acai} style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 1380, objectFit: "cover", filter: "grayscale(1) contrast(1.15) brightness(.55)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 45%, #000 72%)" }} />
    <div style={{ position: "absolute", top: 980, left: 0, right: 0, textAlign: "center", fontFamily: anton, color: "#fff", lineHeight: 0.92 }}>
      <div style={{ fontSize: 170 }}>NÃO FOI</div>
      <div style={{ fontSize: 230, color: COR.lilas }}>IMPRESSO.</div>
    </div>
    <div style={{ position: "absolute", top: 1500, left: 0, right: 0, textAlign: "center", fontFamily: inter, fontWeight: 600, fontSize: 46, color: "#fff" }}>foi <b style={{ color: COR.lilas }}>carimbado</b>.</div>
    <Etiqueta texto="embalagem real de cliente Tridi" escuro style={{ left: 80, top: 300 }} />
  </AbsoluteFill>
);

// ---------------- 4 · Plantao (telejornal) ----------------
const E04Plantao: React.FC = () => (
  <AbsoluteFill style={{ background: "#0b1030" }}>
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 2px, transparent 2px 6px)" }} />
    <div style={{ position: "absolute", top: 290, left: 80, display: "flex", gap: 0 }}>
      <div style={{ background: COR.roxo, color: "#fff", fontFamily: anton, fontSize: 52, padding: "6px 22px" }}>PLANTÃO</div>
      <div style={{ background: "#fff", color: COR.roxo, fontFamily: anton, fontSize: 52, padding: "6px 22px" }}>EXCLUSIVO</div>
    </div>
    <div style={{ position: "absolute", top: 400, left: 80, right: 80, background: "#151c4a", border: `4px solid ${COR.lilas}`, height: 640, overflow: "hidden" }}>
      <Img src={TEX.papelFundo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) brightness(.85)" }} />
      <div style={{ position: "absolute", left: 300, top: 110 }}><Sacola largura={320} modo="cinza" expressao="triste" olharX={-0.3} sombraChao /></div>
      <div style={{ position: "absolute", top: 18, right: 18, background: "#e01f3d", color: "#fff", fontFamily: inter, fontWeight: 800, fontSize: 26, padding: "6px 14px", letterSpacing: 2 }}>● AO VIVO</div>
    </div>
    <div style={{ position: "absolute", top: 1070, left: 80, right: 80, background: "#fff", padding: "22px 30px" }}>
      <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 26, color: COR.roxo, letterSpacing: 3 }}>URGENTE</div>
      <div style={{ fontFamily: anton, fontSize: 84, lineHeight: 1.02, color: "#0b1030" }}>CLIENTE AMA O DOCE<br />E NÃO SABE DE ONDE VEIO</div>
    </div>
    <div style={{ position: "absolute", top: 1380, left: 80, right: 80, fontFamily: inter, fontWeight: 600, fontSize: 40, color: "#dfe3ff" }}>A embalagem estava lisa. Nenhum nome, nenhum @.</div>
    <Etiqueta texto="cena ilustrativa · humor" escuro style={{ left: 80, top: 1500 }} />
    <div style={{ position: "absolute", bottom: 230, left: 0, right: 0, height: 82, background: COR.roxo, display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ background: "#fff", color: COR.roxo, fontFamily: anton, fontSize: 40, padding: "0 22px", height: "100%", display: "flex", alignItems: "center" }}>TRIDI</div>
      <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 34, color: "#fff", whiteSpace: "nowrap", paddingLeft: 26 }}>carimbo com a sua logo • sacola, copo e caixa • borracha sólida gravada a laser • toque em saiba mais</div>
    </div>
  </AbsoluteFill>
);

// ---------------- 5 · Dossie (mural de investigacao) ----------------
const Polaroid: React.FC<{ src: string; x: number; y: number; rot: number; legenda: string; w?: number }> = ({ src, x, y, rot, legenda, w = 360 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, background: "#f4f0e6", padding: "18px 18px 70px", rotate: `${rot}deg`, boxShadow: "0 18px 30px rgba(0,0,0,.45)" }}>
    <Img src={src} style={{ width: "100%", height: w * 1.05, objectFit: "cover", filter: "sepia(.35) contrast(1.05)" }} />
    <div style={{ position: "absolute", bottom: 16, left: 18, right: 18, fontFamily: courier, fontWeight: 700, fontSize: 26, color: "#2a2520" }}>{legenda}</div>
    <div style={{ position: "absolute", top: -14, left: w / 2 - 14, width: 28, height: 28, borderRadius: 14, background: COR.roxo, boxShadow: "0 4px 6px rgba(0,0,0,.4)" }} />
  </div>
);
const E05Dossie: React.FC = () => (
  <AbsoluteFill style={{ background: "#6b4a2e" }}>
    <AbsoluteFill style={{ backgroundImage: `url(${TEX.kraftTile})`, backgroundSize: "512px", opacity: 0.55, mixBlendMode: "multiply" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,.55) 100%)" }} />
    <div style={{ position: "absolute", top: 260, left: 80, right: 80, background: "#f4f0e6", padding: "20px 28px", rotate: "-1.5deg", boxShadow: "0 12px 24px rgba(0,0,0,.4)" }}>
      <div style={{ fontFamily: courier, fontWeight: 700, fontSize: 30, color: "#5a4f45" }}>ARQUIVO · CASO Nº 001</div>
      <div style={{ fontFamily: courier, fontWeight: 700, fontSize: 64, color: "#1d1915", lineHeight: 1.05 }}>A EMBALAGEM<br />SEM NOME</div>
    </div>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d="M 260 700 L 760 760 L 520 1180 L 260 700" fill="none" stroke={COR.roxo} strokeWidth={5} />
    </svg>
    <Polaroid src={FOTO.sapore} x={90} y={640} rot={-6} legenda="sacola · com nome" />
    <Polaroid src={FOTO.pizza} x={600} y={690} rot={5} legenda="caixa · com nome" />
    <Polaroid src={FOTO.paes} x={330} y={1100} rot={-2} legenda="copo · com nome" w={400} />
    {/* carimbo CASO RESOLVIDO */}
    <div style={{ position: "absolute", left: 120, top: 1480, rotate: "-9deg", border: `8px solid ${COR.roxo}`, color: COR.roxo, fontFamily: courier, fontWeight: 700, fontSize: 70, padding: "6px 26px", opacity: 0.92, mixBlendMode: "multiply" }}>CASO RESOLVIDO: CARIMBO</div>
    <Etiqueta texto="embalagens reais de clientes Tridi" style={{ left: 80, top: 1640 }} />
  </AbsoluteFill>
);

// ---------------- 7 · HQ noir com personagem ----------------
const E07HQ: React.FC = () => (
  <AbsoluteFill style={{ background: "#07080f" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="noite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141a3a" /><stop offset="1" stopColor="#05060c" /></linearGradient>
        <pattern id="chuva" width="40" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(14)"><line x1="10" y1="0" x2="10" y2="34" stroke="#8fa0ff" strokeOpacity=".28" strokeWidth="2" /></pattern>
      </defs>
      {/* painel 1 */}
      <rect x="60" y="250" width="960" height="780" fill="url(#noite)" stroke="#fff" strokeWidth="8" />
      <path d="M60 860 L60 700 L150 700 L150 620 L250 620 L250 740 L330 740 L330 560 L440 560 L440 700 L560 700 L560 600 L660 600 L660 760 L780 760 L780 650 L900 650 L900 720 L1020 720 L1020 860 Z" fill="#0a0c18" />
      {[[180, 650], [370, 600], [600, 640], [820, 690]].map(([x, y], i) => <rect key={i} x={x} y={y} width="26" height="34" fill="#f7d36b" opacity=".75" />)}
      <rect x="60" y="860" width="960" height="170" fill="#090a12" />
      <rect x="60" y="250" width="960" height="780" fill="url(#chuva)" />
      <circle cx="840" cy="380" r="60" fill="#e8e3ff" opacity=".9" />
      {/* painel 2 */}
      <rect x="60" y="1070" width="460" height="520" fill="#14102a" stroke="#fff" strokeWidth="8" />
      <rect x="560" y="1070" width="460" height="520" fill={COR.sombra} stroke="#fff" strokeWidth="8" />
    </svg>
    <div style={{ position: "absolute", left: 420, top: 640 }}><Sacola largura={240} modo="cinza" expressao="triste" olharX={-0.5} olharY={0.3} simples /></div>
    <div style={{ position: "absolute", left: 90, top: 280, background: "#f2e9c9", border: "4px solid #111", padding: "14px 20px", fontFamily: courier, fontWeight: 700, fontSize: 36, color: "#111", maxWidth: 520 }}>Naquela cidade, ninguém sabia o nome dela.</div>
    <div style={{ position: "absolute", left: 200, top: 1160 }}><Sacola largura={200} modo="cinza" expressao="seria" simples /></div>
    <div style={{ position: "absolute", left: 90, top: 1100, background: "#f2e9c9", border: "4px solid #111", padding: "10px 16px", fontFamily: courier, fontWeight: 700, fontSize: 30, color: "#111" }}>Mais uma entrega anônima…</div>
    <div style={{ position: "absolute", left: 640, top: 1150 }}><Sacola largura={200} modo="riso" expressao="feliz" carimbada tinta={1} simples /></div>
    <div style={{ position: "absolute", left: 600, top: 1460, fontFamily: bangers, fontSize: 92, color: "#fff", letterSpacing: 2, textShadow: `5px 5px 0 ${COR.roxo}` }}>ATÉ O TUM!</div>
    <Etiqueta texto="marca ilustrativa" style={{ left: 600, top: 1100 }} />
    <div style={{ position: "absolute", left: 80, right: 80, top: 1640, textAlign: "center", fontFamily: anton, fontSize: 84, color: "#fff" }}>SUA EMBALAGEM <span style={{ color: COR.lilas }}>TEM NOME?</span></div>
  </AbsoluteFill>
);

// ---------------- 8 · Retro gamer 16-bit ----------------
const PX = 14;
const SpriteCarimbo: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const m = ["..XXXX..", ".XLLLLX.", ".XLLLLX.", "..XXXX..", "...XX...", "...XX...", "XXXXXXXX", "XPPPPPPX", "XXXXXXXX", "SSSSSSSS"];
  const c: Record<string, string> = { X: "#1a0a33", L: COR.lilas, P: COR.roxo, S: "#3a2a20" };
  return <svg width={8 * PX} height={m.length * PX} style={{ position: "absolute", left: x, top: y }} shapeRendering="crispEdges">{m.flatMap((r, j) => r.split("").map((ch, i) => (ch === "." ? null : <rect key={`${i}-${j}`} x={i * PX} y={j * PX} width={PX} height={PX} fill={c[ch]} />)))}</svg>;
};
const SpriteSacola: React.FC<{ x: number; y: number; cor?: boolean }> = ({ x, y, cor }) => {
  const m = ["...XXXX...", "..X....X..", "..X....X..", "XXXXXXXXXX", "XKKKKKKKKX", "XKKKKKKKKX", cor ? "XKKPPPPKKX" : "XKKKKKKKKX", cor ? "XKKPLLPKKX" : "XKKKKKKKKX", cor ? "XKKPPPPKKX" : "XKKKKKKKKX", "XKKKKKKKKX", "XKKKKKKKKX", "XXXXXXXXXX"];
  const c: Record<string, string> = { X: "#2b1d10", K: "#b9895a", P: COR.roxo, L: COR.lilas };
  return <svg width={10 * PX} height={m.length * PX} style={{ position: "absolute", left: x, top: y }} shapeRendering="crispEdges">{m.flatMap((r, j) => r.split("").map((ch, i) => (ch === "." ? null : <rect key={`${i}-${j}`} x={i * PX} y={j * PX} width={PX} height={PX} fill={c[ch]} />)))}</svg>;
};
const E08Gamer: React.FC = () => (
  <AbsoluteFill style={{ background: "#120a24" }}>
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,.35) 0 3px, transparent 3px 6px)" }} />
    <div style={{ position: "absolute", top: 260, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: pixel, fontSize: 30, color: "#fff" }}>
      <span>NÍVEL 1</span><span style={{ color: COR.lilas }}>MARCA 0/100</span>
    </div>
    <div style={{ position: "absolute", top: 360, left: 80, right: 80, textAlign: "center", fontFamily: pixel, fontSize: 54, lineHeight: 1.5, color: "#fff", textShadow: `6px 6px 0 ${COR.roxo}` }}>MISSÃO:<br />DAR NOME À<br />SACOLA</div>
    {/* chao */}
    <div style={{ position: "absolute", top: 1180, left: 0, right: 0, height: 60, background: "#3d2a5c", borderTop: "6px solid #6e4aa8" }} />
    <SpriteSacola x={240} y={1012} />
    <SpriteSacola x={480} y={1012} />
    <SpriteSacola x={720} y={1012} cor />
    <SpriteCarimbo x={704} y={830} />
    <div style={{ position: "absolute", left: 650, top: 760, fontFamily: pixel, fontSize: 30, color: "#ffe66b" }}>+1 MARCA!</div>
    <div style={{ position: "absolute", top: 1300, left: 120, right: 120, border: "6px solid #fff", background: "#000", padding: "26px 30px", fontFamily: pixel, fontSize: 28, lineHeight: 1.7, color: "#fff" }}>
      ITEM: CARIMBO COM A SUA LOGO<br /><span style={{ color: COR.lilas }}>SACOLA • COPO • CAIXA</span>
    </div>
    <div style={{ position: "absolute", top: 1550, left: 0, right: 0, textAlign: "center", fontFamily: pixel, fontSize: 34, color: "#ffe66b" }}>▶ TOQUE EM SAIBA MAIS</div>
  </AbsoluteFill>
);

// ---------------- 10 · Anuncio por profissao ----------------
const E10Profissao: React.FC = () => (
  <AbsoluteFill style={{ background: COR.papel }}>
    <AbsoluteFill style={{ backgroundImage: `url(${TEX.papelTile})`, backgroundSize: "1024px", opacity: 0.9 }} />
    <div style={{ position: "absolute", top: 250, left: 70, right: 70, fontFamily: anton, fontSize: 200, lineHeight: 0.9, color: COR.roxo, textAlign: "center" }}>CONFEITEIRA,</div>
    <div style={{ position: "absolute", top: 470, left: 80, right: 80, textAlign: "center", fontFamily: inter, fontWeight: 800, fontSize: 56, lineHeight: 1.15, color: "#1d1720" }}>seu brigadeiro sai<br />sem o seu nome?</div>
    <div style={{ position: "absolute", left: 120, top: 700 }}><Sacola largura={460} modo="kraft" expressao="feliz" carimbada tinta={1} sombraChao /></div>
    <div style={{ position: "absolute", left: 620, top: 880, width: 330, background: "#fff", padding: 14, rotate: "4deg", boxShadow: "0 14px 26px rgba(0,0,0,.25)" }}>
      <Img src={FOTO.paes} style={{ width: "100%", height: 360, objectFit: "cover" }} />
      <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 22, color: "#333", marginTop: 8 }}>COPO REAL · CLIENTE TRIDI</div>
    </div>
    <Etiqueta texto="marca ilustrativa" style={{ left: 140, top: 1330 }} />
    <div style={{ position: "absolute", top: 1420, left: 80, right: 80, textAlign: "center", fontFamily: anton, fontSize: 70, color: "#1d1720" }}>SUA LOGO EM CARIMBO.<br /><span style={{ color: COR.roxo }}>EM TODA EMBALAGEM.</span></div>
  </AbsoluteFill>
);

// ---------------- 23 · Blueprint (planta do carimbo) ----------------
const E23Blueprint: React.FC = () => {
  const W = "#e8f1ff";
  return (
    <AbsoluteFill style={{ background: "#0f3a7a" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.08) 2px, transparent 2px), linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)", backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px" }} />
      <div style={{ position: "absolute", top: 250, left: 80, fontFamily: courier, fontWeight: 700, fontSize: 28, color: W, letterSpacing: 2 }}>PLANTA Nº 01 · CARIMBO PERSONALIZADO</div>
      <div style={{ position: "absolute", top: 300, left: 80, right: 80, fontFamily: anton, fontSize: 104, lineHeight: 1, color: "#fff" }}>QUALIDADE DE GRÁFICA<br /><span style={{ color: "#9cc4ff" }}>NA SUA MÃO.</span></div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fill="none" stroke={W} strokeWidth={4}>
        {/* cabo */}
        <ellipse cx="540" cy="720" rx="110" ry="40" />
        <path d="M430 720 Q430 800 480 830 L480 900 L600 900 L600 830 Q650 800 650 720" />
        {/* base explodida */}
        <path d="M300 960 L780 960 L840 1010 L360 1010 Z" />
        <path d="M300 960 L300 1020 L360 1070 L840 1070 L840 1010" />
        <line x1="360" y1="1010" x2="360" y2="1070" />
        {/* borracha */}
        <path d="M330 1160 L800 1160 L840 1195 L370 1195 Z" strokeDasharray="10 8" />
        <line x1="540" y1="1075" x2="540" y2="1150" strokeDasharray="8 8" />
        {/* cotas */}
        <line x1="300" y1="1250" x2="840" y2="1250" />
        <line x1="300" y1="1235" x2="300" y2="1265" /><line x1="840" y1="1235" x2="840" y2="1265" />
        {/* chamadas */}
        <line x1="650" y1="740" x2="820" y2="680" /><line x1="800" y1="1180" x2="900" y2="1300" /><line x1="360" y1="1170" x2="230" y2="1360" />
      </svg>
      <Logo cor={W} size={150} espelhar style={{ position: "absolute", left: 470, top: 1105, opacity: 0.95 }} />
      <div style={{ position: "absolute", left: 820, top: 640, fontFamily: courier, fontWeight: 700, fontSize: 28, color: W }}>CABO</div>
      <div style={{ position: "absolute", left: 470, top: 1268, fontFamily: courier, fontWeight: 700, fontSize: 30, color: W }}>4 a 15 cm</div>
      <div style={{ position: "absolute", left: 700, top: 1310, width: 300, fontFamily: anton, fontSize: 52, color: "#fff", lineHeight: 1.05 }}>BORRACHA SÓLIDA</div>
      <div style={{ position: "absolute", left: 80, top: 1370, width: 330, fontFamily: anton, fontSize: 52, color: "#fff", lineHeight: 1.05 }}>GRAVADA A LASER</div>
      <div style={{ position: "absolute", left: 80, top: 1520, right: 80, fontFamily: courier, fontWeight: 700, fontSize: 30, color: "#9cc4ff" }}>* sua logo é gravada espelhada · marca ilustrativa</div>
    </AbsoluteFill>
  );
};

// ---------------- 32 · Quadrinho Pop Art ----------------
const E32PopArt: React.FC = () => (
  <AbsoluteFill style={{ background: "#ffe14d" }}>
    <AbsoluteFill style={{ backgroundImage: `radial-gradient(${COR.roxo} 22%, transparent 24%)`, backgroundSize: "34px 34px", opacity: 0.22 }} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <polygon points="540,520 610,700 790,600 700,780 900,860 690,900 760,1080 600,960 540,1160 480,960 320,1080 390,900 180,860 380,780 290,600 470,700" fill={COR.roxo} stroke="#111" strokeWidth="10" />
    </svg>
    <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontFamily: bangers, fontSize: 300, color: "#ffe14d", letterSpacing: 6, WebkitTextStroke: "10px #111", rotate: "-6deg" }}>TUM!</div>
    <div style={{ position: "absolute", left: 300, top: 1050 }}><Sacola largura={480} modo="kraft" expressao="surpresa" carimbada tinta={1} sombraChao /></div>
    <div style={{ position: "absolute", left: 70, top: 250, background: "#fff", border: "8px solid #111", borderRadius: 60, padding: "24px 40px", fontFamily: bangers, fontSize: 96, color: "#111", letterSpacing: 2 }}>É DE ONDE?!</div>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><polygon points="230,440 300,440 250,520" fill="#fff" stroke="#111" strokeWidth="8" /></svg>
    <div style={{ position: "absolute", right: 70, top: 440, background: COR.roxo, border: "8px solid #111", padding: "14px 26px", fontFamily: bangers, fontSize: 70, color: "#fff", rotate: "4deg" }}>AGORA TEM NOME!</div>
    <Etiqueta texto="marca ilustrativa" style={{ left: 330, top: 1660 }} />
  </AbsoluteFill>
);

const LISTA = [E01Painel, E03Letreiro, E04Plantao, E05Dossie, E07HQ, E08Gamer, E10Profissao, E23Blueprint, E32PopArt];

export const EstilosTridi: React.FC = () => {
  const f = useCurrentFrame();
  const C = LISTA[Math.min(f, LISTA.length - 1)];
  return <C />;
};
