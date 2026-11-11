import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Sequence,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Video} from '@remotion/media';
import {loadFont as loadGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {WORDS} from './words';

const {fontFamily: GROTESK} = loadGrotesk('normal', {
	weights: ['500', '600', '700'],
	subsets: ['latin', 'latin-ext'],
});
const {fontFamily: MONO} = loadMono('normal', {
	weights: ['500', '700'],
	subsets: ['latin', 'latin-ext'],
});

// ---------- Paleta: planta "azul" puxada para o roxo da marca (polo roxo + preto do video) ----------
const C = {
	paper: '#1C0C47',
	paperDeep: '#0B0421',
	line: '#F3EEFF',
	lilac: '#C9A8FF',
	led: '#E45CFF',
	ink: '#12062E',
	chip: 'rgba(11,4,33,0.9)',
};

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- Janela do video: recorte que exclui a faixa da legenda queimada (y >= ~1480 no original) ----------
// Fonte visivel: y 30..1400. Moldura: s=0.8; Tela cheia (CTA): s=1920/1370.
const SRC_TOP = 30;
const SRC_H = 1370;
const WIN = {x: 108, y: 425, w: 864, h: SRC_H * 0.8};
const CTA_T0 = 26.85;
// Gancho: push-in lento no plano 1 (ate o corte em 2,23 s = quadro 67), ancorado no par rosto+totem
const HOOK_CUT = 67;
const HOOK_ORIGIN = {x: 416, y: 776}; // em coordenadas da moldura
const hookZoom = (frame: number) =>
	frame >= HOOK_CUT ? 1 : interpolate(frame, [0, HOOK_CUT - 1], [1, 1.12], {...clamp, easing: Easing.bezier(0.33, 0, 0.4, 1)});
const CTA_T1 = 27.35;

const useCtaProgress = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return interpolate(frame, [CTA_T0 * fps, CTA_T1 * fps], [0, 1], {
		...clamp,
		easing: Easing.bezier(0.65, 0, 0.35, 1),
	});
};

const windowRect = (p: number) => {
	const sFull = 1920 / SRC_H;
	const s = interpolate(p, [0, 1], [0.8, sFull]);
	const x = interpolate(p, [0, 1], [WIN.x, 0]);
	const y = interpolate(p, [0, 1], [WIN.y, 0]);
	const w = interpolate(p, [0, 1], [WIN.w, 1080]);
	const h = interpolate(p, [0, 1], [WIN.h, 1920]);
	const srcX = interpolate(p, [0, 1], [0, (1080 - 1080 / sFull) / 2]);
	return {s, x, y, w, h, srcX};
};

// ---------- Secoes (planta n.) sincronizadas pela fala ----------
type Part = [string, boolean];
const SECTIONS: {t0: number; t1: number; label: string; title: Part[]}[] = [
	{t0: 0, t1: 3.8, label: 'PLANTA Nº 01 — O PRODUTO', title: [['Totem de mesa ', false], ['Pro', true]]},
	{t0: 3.8, t1: 7.5, label: 'PLANTA Nº 02 — A TELA', title: [['Tela de ', false], ['15,6"', true]]},
	{t0: 7.5, t1: 11.8, label: 'PLANTA Nº 03 — A IMPRESSORA', title: [['Impressora ', false], ['térmica', true]]},
	{t0: 11.8, t1: 17.36, label: 'PLANTA Nº 04 — O DISPLAY', title: [['Display de ', false], ['LED', true]]},
	{t0: 17.36, t1: 19.9, label: 'PLANTA Nº 05 — O FORMATO', title: [['Formato ', false], ['compacto', true]]},
	{t0: 19.9, t1: 21.6, label: 'PLANTA Nº 06 — A INSTALAÇÃO', title: [['Balcão', true], [' ou ', false], ['mesa', true]]},
	{t0: 21.6, t1: 26.9, label: 'PLANTA Nº 07 — O CONJUNTO', title: [['Opção ', false], ['completa', true]]},
	{t0: 26.9, t1: 99, label: 'PLANTA Nº 08 — O PEDIDO', title: []},
];

// ---------- Fundo: folha de engenharia ----------
const Sheet: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse 85% 60% at 50% 45%, ${C.paper} 0%, #150836 55%, ${C.paperDeep} 100%)`,
			}}
		>
			<AbsoluteFill
				style={{
					backgroundImage: [
						'linear-gradient(rgba(243,238,255,0.13) 2px, transparent 2px)',
						'linear-gradient(90deg, rgba(243,238,255,0.13) 2px, transparent 2px)',
						'linear-gradient(rgba(243,238,255,0.05) 1px, transparent 1px)',
						'linear-gradient(90deg, rgba(243,238,255,0.05) 1px, transparent 1px)',
					].join(','),
					backgroundSize: '216px 216px, 216px 216px, 36px 36px, 36px 36px',
					backgroundPosition: '0 12px, 0 0, 0 12px, 0 0',
				}}
			/>
			<BackgroundDrawings />
			<svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.07, mixBlendMode: 'screen'}}>
				<filter id="v7noise">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="1080" height="1920" filter="url(#v7noise)" />
			</svg>
		</AbsoluteFill>
	);
};

// Desenhos de construcao ao fundo (traco fino, quase apagado)
const BackgroundDrawings: React.FC = () => {
	const frame = useCurrentFrame();
	const draw = interpolate(frame, [0, 24], [0.45, 0], {...clamp, easing: EASE});
	const st = {fill: 'none', stroke: C.line, strokeWidth: 2, pathLength: 1, strokeDasharray: 1, strokeDashoffset: draw};
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.2}}>
			<circle cx={985} cy={150} r={120} {...st} />
			<circle cx={985} cy={150} r={70} {...st} />
			<path d="M845 150 H1080 M985 10 V290" {...st} />
			<circle cx={70} cy={1690} r={90} {...st} />
			<path d="M0 1690 H200 M70 1580 V1800" {...st} />
			<path d="M140 1840 L420 1840 M140 1826 V1854 M420 1826 V1854" {...st} />
			<path d="M660 1840 L940 1840 M660 1826 V1854 M940 1826 V1854" {...st} />
		</svg>
	);
};

// Margem da prancha + carimbo (title block) + regua
const SheetFrame: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = useCtaProgress();
	const draw = interpolate(frame, [0, 0.7 * fps], [0.45, 0], {...clamp, easing: EASE});
	const line = {fill: 'none', stroke: C.line, pathLength: 1, strokeDasharray: 1, strokeDashoffset: draw};
	return (
		<AbsoluteFill>
			{/* escurece topo/base sobre o video em tela cheia para manter os rotulos legiveis */}
			<AbsoluteFill
				style={{
					opacity: p,
					background:
						'linear-gradient(180deg, rgba(11,4,33,0.85) 0%, rgba(11,4,33,0) 16%, rgba(11,4,33,0) 82%, rgba(11,4,33,0.9) 100%)',
				}}
			/>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<rect x={34} y={34} width={1012} height={1852} strokeWidth={2} opacity={0.55} {...line} />
				<rect x={46} y={46} width={988} height={1828} strokeWidth={1} opacity={0.3} {...line} />
				<path d="M34 1660 H1046" strokeWidth={1.5} opacity={0.4} {...line} />
				<path d="M560 1660 V1886" strokeWidth={1.5} opacity={0.4} {...line} />
			</svg>
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 1700,
					fontFamily: MONO,
					fontSize: 24,
					letterSpacing: '0.14em',
					color: C.line,
					opacity: 0.6,
					lineHeight: 1.7,
				}}
			>
				ESC. 1:1 · FOLHA 01/01
				<br />
				VISTA FRONTAL
			</div>
			<div
				style={{
					position: 'absolute',
					right: 80,
					top: 1700,
					textAlign: 'right',
					fontFamily: MONO,
					fontSize: 24,
					letterSpacing: '0.14em',
					color: C.line,
					opacity: 0.6,
					lineHeight: 1.7,
				}}
			>
				TOTEM DE MESA PRO
				<br />
				MIND GEEKS
			</div>
		</AbsoluteFill>
	);
};

// Rotulo de prancha com efeito de digitacao (por secao)
const SectionLabel: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const sec = SECTIONS.find((s) => t >= s.t0 && t < s.t1) ?? SECTIONS[0];
	const local = frame - sec.t0 * fps + (sec.t0 === 0 ? 14 : 0); // 1o quadro ja completo (gancho/capa)
	const chars = Math.floor(interpolate(local, [0, 12], [0, sec.label.length], clamp));
	return (
		<div
			style={{
				position: 'absolute',
				left: 80,
				right: 80,
				top: 222,
				display: 'flex',
				justifyContent: 'space-between',
				fontFamily: MONO,
				fontWeight: 700,
				fontSize: 30,
				letterSpacing: '0.12em',
				color: C.line,
				opacity: 0.8,
			}}
		>
			<span>{sec.label.slice(0, chars)}</span>
			<span style={{color: C.lilac}}>REV. 07</span>
		</div>
	);
};

// ---------- Video recortado na moldura ----------
const VideoWindow: React.FC = () => {
	const p = useCtaProgress();
	const r = windowRect(p);
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	// o original escurece ate o preto em ~29,4 s: a folha da planta assume o fundo do fechamento
	const fadeOut = interpolate(frame, [28.9 * fps, 29.25 * fps], [1, 0], clamp);
	return (
		<div
			style={{
				position: 'absolute',
				opacity: fadeOut,
				left: r.x,
				top: r.y,
				width: r.w,
				height: r.h,
				overflow: 'hidden',
				backgroundColor: C.paperDeep,
			}}
		>
			<AbsoluteFill style={{scale: hookZoom(frame), transformOrigin: `${HOOK_ORIGIN.x}px ${HOOK_ORIGIN.y}px`}}>
				<Video
					src={staticFile('v/v7/v7.mp4')}
					style={{
						position: 'absolute',
						left: -r.srcX * r.s,
						top: -SRC_TOP * r.s,
						width: 1080 * r.s,
						height: 1920 * r.s,
					}}
				/>
			</AbsoluteFill>
			{/* leve tinta azul-roxa de papel tecnico sobre o video */}
			<AbsoluteFill style={{backgroundColor: 'rgba(40,14,110,0.12)', mixBlendMode: 'multiply'}} />
		</div>
	);
};

// Linha de cota do gancho: liga o titulo ao topo do totem (segue o push-in)
const HookLeader: React.FC = () => {
	const frame = useCurrentFrame();
	if (frame >= HOOK_CUT) return null;
	const z = hookZoom(frame);
	// topo do totem no plano 1: fonte (822, 876) -> moldura (s=0,8)
	const wx = 822 * 0.8;
	const wy = (876 - SRC_TOP) * 0.8;
	const sx = WIN.x + HOOK_ORIGIN.x + (wx - HOOK_ORIGIN.x) * z;
	const sy = WIN.y + HOOK_ORIGIN.y + (wy - HOOK_ORIGIN.y) * z - 14;
	const y0 = 405;
	const d = interpolate(frame, [20, 34], [1, 0], {...clamp, easing: EASE});
	const end = interpolate(frame, [30, 38], [0, 1], {...clamp, easing: EASE});
	const op = interpolate(frame, [HOOK_CUT - 7, HOOK_CUT - 1], [1, 0], clamp);
	const path = `M${sx} ${y0} V${sy}`;
	const ticks = `M${sx - 18} ${y0 + 2} H${sx + 18} M${sx - 22} ${sy} H${sx + 22}`;
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', opacity: op}}>
			<path d={path} {...stroke(d, 8)} stroke={C.paperDeep} opacity={0.75} />
			<path d={path} {...stroke(d, 3)} stroke={C.lilac} />
			<path d={`M${sx - 11} ${sy - 20} L${sx} ${sy} L${sx + 11} ${sy - 20}`} {...stroke(1 - end, 3.5)} stroke={C.lilac} />
			<path d={ticks} stroke={C.paperDeep} strokeWidth={8} opacity={0.75 * end} strokeLinecap="round" fill="none" />
			<path d={ticks} stroke={C.lilac} strokeWidth={3} opacity={end} strokeLinecap="round" fill="none" />
			<circle cx={sx} cy={y0 + 2} r={6} fill={C.lilac} opacity={end} />
		</svg>
	);
};

// Cantoneiras, cota lateral e regua em volta da moldura
const WindowMarks: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = useCtaProgress();
	const r = windowRect(p);
	const draw = interpolate(frame, [0, 0.8 * fps], [0.45, 0], {...clamp, easing: EASE});
	const st = {fill: 'none', stroke: C.line, strokeWidth: 3, pathLength: 1, strokeDasharray: 1, strokeDashoffset: draw};
	const L = 46;
	const o = 12;
	const x0 = r.x - o;
	const y0 = r.y - o;
	const x1 = r.x + r.w + o;
	const y1 = r.y + r.h + o;
	const cx = WIN.x - 44;
	const ticks = Array.from({length: 11}, (_, i) => WIN.y + (i * WIN.h) / 10);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', opacity: 1 - p}}>
			<rect x={r.x} y={r.y} width={r.w} height={r.h} {...st} strokeWidth={2} opacity={0.9} />
			<path d={`M${x0} ${y0 + L} V${y0} H${x0 + L}`} {...st} />
			<path d={`M${x1 - L} ${y0} H${x1} V${y0 + L}`} {...st} />
			<path d={`M${x0} ${y1 - L} V${y1} H${x0 + L}`} {...st} />
			<path d={`M${x1 - L} ${y1} H${x1} V${y1 - L}`} {...st} />
			{/* cota vertical a esquerda */}
			<path d={`M${cx} ${WIN.y} V${WIN.y + WIN.h}`} {...st} strokeWidth={2} opacity={0.7} />
			<path d={`M${cx - 10} ${WIN.y + 18} L${cx} ${WIN.y} L${cx + 10} ${WIN.y + 18}`} {...st} strokeWidth={2} opacity={0.7} />
			<path
				d={`M${cx - 10} ${WIN.y + WIN.h - 18} L${cx} ${WIN.y + WIN.h} L${cx + 10} ${WIN.y + WIN.h - 18}`}
				{...st}
				strokeWidth={2}
				opacity={0.7}
			/>
			{ticks.map((ty, i) => (
				<path key={i} d={`M${cx - (i % 5 === 0 ? 14 : 7)} ${ty} H${cx}`} {...st} strokeWidth={2} opacity={0.6} />
			))}
			</svg>
	);
};

// ---------- Titulo da prancha ----------
const TitleBar: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const p = useCtaProgress();
	const idx = Math.max(0, SECTIONS.findIndex((s) => t >= s.t0 && t < s.t1));
	const sec = SECTIONS[idx];
	const prev = idx > 0 ? SECTIONS[idx - 1] : null;
	const local = frame - sec.t0 * fps + (sec.t0 === 0 ? 14 : 0); // 1o quadro ja completo (gancho/capa)
	const boxIn = 1;
	if (sec.title.length === 0) return null;
	// crossfade de 6 quadros: o titulo anterior sai enquanto o novo entra (cabecalho nunca fica vazio)
	const XF = 6;
	const prevOp = prev && prev.title.length ? interpolate(local, [0, XF - 2], [1, 0], clamp) : 0;
	const renderTitle = (parts: Part[], op: number, dy: number) => (
		<div
			style={{
				position: 'absolute',
				left: 28,
				top: 0,
				height: 120,
				lineHeight: '120px',
				fontFamily: GROTESK,
				fontWeight: 600,
				fontSize: 84,
				letterSpacing: '-0.02em',
				color: C.line,
				whiteSpace: 'nowrap',
				opacity: op,
				translate: `0px ${dy}px`,
			}}
		>
			{parts.map(([txt, hi], i) => (
				<span key={i} style={{color: hi ? C.lilac : C.line}}>
					{txt}
				</span>
			))}
		</div>
	);
	return (
		<div
			style={{
				position: 'absolute',
				left: 80,
				top: 285,
				width: 920,
				height: 120,
				opacity: (1 - p) * boxIn,
				translate: `${interpolate(boxIn, [0, 1], [-30, 0])}px 0px`,
				backgroundColor: C.chip,
				borderLeft: `6px solid ${C.lilac}`,
				boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
				display: 'flex',
				alignItems: 'center',
				paddingLeft: 28,
				overflow: 'hidden',
			}}
		>
			{prev && prevOp > 0 ? renderTitle(prev.title, prevOp, interpolate(local, [0, XF], [0, -18], clamp)) : null}
			{renderTitle(
				sec.title,
				interpolate(local, [1, XF], [0, 1], clamp),
				interpolate(local, [0, 10], [22, 0], {...clamp, easing: EASE}),
			)}
			{/* linha de cota que redesenha a cada prancha */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					bottom: 0,
					height: 4,
					width: '100%',
					backgroundColor: C.lilac,
					opacity: 0.85,
					scale: `${interpolate(local, [0, 16], [0.35, 1], {...clamp, easing: EASE})} 1`,
					transformOrigin: 'left center',
				}}
			/>
		</div>
	);
};

// ---------- Legendas novas (fala real) ----------
type Chunk = {words: typeof WORDS; s: number; e: number};
const buildChunks = (): Chunk[] => {
	const chunks: Chunk[] = [];
	let cur: typeof WORDS = [];
	const flush = () => {
		if (cur.length) chunks.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
		cur = [];
	};
	WORDS.forEach((w, i) => {
		const prev = WORDS[i - 1];
		const len = cur.map((c) => c.w).join(' ').length + w.w.length + 1;
		if (cur.length && (cur.length >= 3 || len > 18 || (prev && /[.,?!]$/.test(prev.w)) || (prev && w.s - prev.e > 0.35))) {
			flush();
		}
		cur.push(w);
	});
	flush();
	return chunks.map((c, i) => {
		const next = chunks[i + 1];
		const end = next && next.s - c.e < 0.6 ? next.s : c.e + 0.3;
		return {...c, e: end};
	});
};
const CHUNKS = buildChunks().filter((c) => c.s < 26.95); // a partir do CTA o titulo/botao assumem a fala

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const chunk = CHUNKS.find((c) => t >= c.s && t < c.e);
	if (!chunk) return null;
	const local = frame - chunk.s * fps;
	return (
		<div
			style={{
				position: 'absolute',
				left: 80,
				right: 80,
				top: 1546,
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					backgroundColor: C.chip,
					border: '2px solid rgba(201,168,255,0.45)',
					borderRadius: 8,
					padding: '8px 26px 10px',
					fontFamily: GROTESK,
					fontWeight: 600,
					fontSize: 58,
					letterSpacing: '-0.01em',
					color: C.line,
					whiteSpace: 'nowrap',
					opacity: interpolate(local, [0, 4], [0, 1], clamp),
					translate: `0px ${interpolate(local, [0, 6], [12, 0], {...clamp, easing: EASE})}px`,
				}}
			>
				{chunk.words.map((w, i) => {
					const active = t >= w.s;
					return (
						<span key={i} style={{color: active ? (t < w.e + 0.12 ? C.lilac : C.line) : 'rgba(243,238,255,0.45)'}}>
							{(i ? ' ' : '') + w.w}
						</span>
					);
				})}
			</div>
		</div>
	);
};

// ---------- Cartoes de detalhe (planta) ----------
const CARD_W = 480;
const CARD_H = 410; // respiro >= 24 px sob os rotulos dos cartoes
const Card: React.FC<{
	side: 'left' | 'right';
	tag: string;
	dur: number;
	children: React.ReactNode;
	// posicao livre (canto sup. esq. visual) e escala do cartao inteiro
	pos?: {left: number; top: number; k: number};
}> = ({side, tag, dur, children, pos}) => {
	const frame = useCurrentFrame();
	const inP = interpolate(frame, [0, 12], [0, 1], {...clamp, easing: EASE});
	const out = interpolate(frame, [dur - 7, dur], [1, 0], clamp);
	const k = pos?.k ?? 1;
	return (
		<div
			style={{
				position: 'absolute',
				left: pos ? pos.left : side === 'left' ? 84 : 1080 - 84 - CARD_W,
				top: pos ? pos.top : 1500 - CARD_H,
				width: CARD_W,
				height: CARD_H,
				opacity: inP * out,
				translate: `0px ${interpolate(inP, [0, 1], [28, 0])}px`,
				scale: k * interpolate(inP, [0, 1], [0.96, 1]),
				transformOrigin: pos ? 'top left' : 'center center',
				backgroundColor: '#11062E',
				border: `2px solid ${C.line}`,
				boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
			}}
		>
			<div
				style={{
					height: 46,
					borderBottom: '1.5px solid rgba(243,238,255,0.45)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0 16px',
					fontFamily: MONO,
					fontWeight: 700,
					fontSize: 22,
					letterSpacing: '0.12em',
					color: C.line,
				}}
			>
				<span>{tag}</span>
				<span style={{color: C.lilac}}>ESC 1:5</span>
			</div>
			<div style={{position: 'relative', width: CARD_W, height: CARD_H - 46}}>{children}</div>
		</div>
	);
};

// traco que se desenha
const useDraw = (start: number, len = 14) => {
	const frame = useCurrentFrame();
	return interpolate(frame, [start, start + len], [1, 0], {...clamp, easing: EASE});
};
const stroke = (off: number, w = 3) => ({
	fill: 'none',
	stroke: C.line,
	strokeWidth: w,
	strokeLinecap: 'round' as const,
	strokeLinejoin: 'round' as const,
	pathLength: 1,
	strokeDasharray: 1,
	strokeDashoffset: off,
});

const BigText: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({
	children,
	size = 48,
	color = C.line,
	style,
}) => (
	<div style={{fontFamily: GROTESK, fontWeight: 600, fontSize: size, color, lineHeight: 1, letterSpacing: '-0.02em', ...style}}>
		{children}
	</div>
);

// A · Tela 15,6"
const CardTela: React.FC = () => {
	const frame = useCurrentFrame();
	const d1 = useDraw(2, 16);
	const d2 = useDraw(12, 14);
	const num = interpolate(frame, [14, 24], [0, 1], {...clamp, easing: EASE});
	return (
		<>
			<svg width={CARD_W} height={CARD_H - 46} style={{position: 'absolute'}}>
				<rect x={36} y={40} width={150} height={240} rx={6} {...stroke(d1)} />
				<rect x={50} y={56} width={122} height={186} {...stroke(d1, 2)} opacity={0.7} />
				<path d="M60 262 H162" {...stroke(d1, 2)} opacity={0.6} />
				{/* cota na diagonal da tela */}
				<path d="M50 242 L172 56" {...stroke(d2, 2.5)} stroke={C.lilac} />
				<path d="M60 222 L50 242 L70 236" {...stroke(d2, 2.5)} stroke={C.lilac} />
				<path d="M152 62 L172 56 L166 76" {...stroke(d2, 2.5)} stroke={C.lilac} />
				<path d="M36 310 H186 M36 300 V320 M186 300 V320" {...stroke(d1, 2)} opacity={0.6} />
			</svg>
			<div style={{position: 'absolute', left: 214, top: 92, opacity: num, translate: `0px ${(1 - num) * 16}px`}}>
				<BigText size={104} color={C.lilac}>
					15,6"
				</BigText>
				<BigText size={46} style={{marginTop: 18}}>
					polegadas
				</BigText>
			</div>
		</>
	);
};

// B · Impressora termica integrada
const CardImpressora: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const d1 = useDraw(2, 16);
	// ticket sai da impressora (em sync com "impressora termica")
	const tk = interpolate(frame, [10, 10 + 1.4 * fps], [0, 1], {...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1)});
	const ok = interpolate(frame, [(8.72 - 7.6) * fps, (8.72 - 7.6) * fps + 10], [0, 1], {...clamp, easing: EASE});
	const dCheck = useDraw((8.72 - 7.6) * fps + 2, 10);
	const ticketH = 150 * tk;
	return (
		<>
			<svg width={CARD_W} height={CARD_H - 46} style={{position: 'absolute'}}>
				<defs>
					<clipPath id="v7slot">
						<rect x={0} y={0} width={CARD_W} height={196} />
					</clipPath>
				</defs>
				<g transform="translate(6 46) scale(0.82)">
				<g clipPath="url(#v7slot)">
					<rect x={92} y={196 - ticketH} width={116} height={ticketH + 4} {...stroke(0, 2)} fill="rgba(243,238,255,0.12)" />
					{[0, 1, 2, 3, 4].map((i) => (
						<path
							key={i}
							d={`M108 ${196 - ticketH + 22 + i * 24} H${i === 4 ? 160 : 192}`}
							{...stroke(0, 2)}
							strokeDasharray="6 6"
							opacity={196 - ticketH + 22 + i * 24 < 190 ? 0.75 : 0}
						/>
					))}
				</g>
				<rect x={40} y={196} width={220} height={120} rx={8} {...stroke(d1)} />
				<path d="M80 196 H220" {...stroke(d1, 5)} />
				<path d="M64 290 H120" {...stroke(d1, 2)} opacity={0.6} />
				<circle cx={232} cy={290} r={8} {...stroke(d1, 2)} />
				{/* cota da largura */}
				<path d="M40 330 H260 M40 320 V340 M260 320 V340" {...stroke(d1, 2)} opacity={0.6} />
				</g>
			</svg>
			<div style={{position: 'absolute', left: 236, top: 180, opacity: ok, translate: `0px ${(1 - ok) * 14}px`}}>
				<svg width={70} height={70} style={{display: 'block', marginBottom: 14}}>
					<rect x={3} y={3} width={64} height={64} rx={6} fill="none" stroke={C.lilac} strokeWidth={3} />
					<path d="M16 36 L30 50 L54 20" {...stroke(dCheck, 6)} stroke={C.lilac} />
				</svg>
				<BigText size={44} color={C.lilac}>
					integrada
				</BigText>
			</div>
		</>
	);
};

// C · Display de LED (matriz de pontos)
const CardLed: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const d1 = useDraw(2, 16);
	const cols = 15;
	const rows = 6;
	const sweep = interpolate(frame, [8, 8 + 1.6 * fps], [-4, cols + 4], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'extend',
	});
	const exp = interpolate(frame, [(15.12 - 14.45) * fps, (15.12 - 14.45) * fps + 10], [0, 1], {...clamp, easing: EASE});
	return (
		<>
			<svg width={CARD_W} height={CARD_H - 46} style={{position: 'absolute'}}>
				<rect x={30} y={30} width={420} height={196} rx={10} {...stroke(d1)} />
				{Array.from({length: rows}).map((_, r) =>
					Array.from({length: cols}).map((__, c) => {
						const phase = ((c - sweep) % (cols + 8) + (cols + 8)) % (cols + 8);
						const lit = phase < 5 && (r + c) % 2 === 0 ? 1 : phase < 5 ? 0.55 : 0;
						const on = frame > 8 ? lit : 0;
						return (
							<circle
								key={`${r}-${c}`}
								cx={58 + c * 26}
								cy={62 + r * 26}
								r={8}
								fill={on > 0 ? C.led : 'rgba(243,238,255,0.16)'}
								opacity={on > 0 ? 0.45 + on * 0.55 : 1}
							/>
						);
					}),
				)}
				<path d="M30 248 H450 M30 238 V258 M450 238 V258" {...stroke(d1, 2)} opacity={0.6} />
			</svg>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 276,
					display: 'flex',
					justifyContent: 'center',
					opacity: exp,
					translate: `0px ${(1 - exp) * 14}px`,
				}}
			>
				<BigText size={50} color={C.lilac}>
					+ experiência
				</BigText>
			</div>
		</>
	);
};

// Totem (vista frontal) em traco, reaproveitado
const TotemPath: React.FC<{x: number; y: number; k: number; off: number; dashed?: boolean; opacity?: number}> = ({
	x,
	y,
	k,
	off,
	dashed,
	opacity = 1,
}) => {
	const st = dashed
		? {fill: 'none', stroke: C.line, strokeWidth: 2 / k, strokeDasharray: `${8 / k} ${8 / k}`}
		: stroke(off, 3 / k);
	return (
		<g transform={`translate(${x} ${y}) scale(${k})`} opacity={opacity}>
			<rect x={0} y={0} width={80} height={170} rx={5} {...st} />
			<rect x={8} y={8} width={64} height={92} {...st} />
			<rect x={16} y={110} width={48} height={14} {...st} />
			<path d="M24 138 H56" {...st} />
			<path d="M-10 182 L90 182 L80 170 L0 170 Z" {...st} />
		</g>
	);
};

// D · Formato compacto (contorno maior encolhe ate o compacto)
const CardCompacto: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const d1 = useDraw(2, 16);
	const shrink = interpolate(frame, [(17.9 - 17.45) * fps, (17.9 - 17.45) * fps + 18], [0, 1], {...clamp, easing: EASE});
	const k = interpolate(shrink, [0, 1], [1.55, 1.15]);
	const lbl = interpolate(frame, [(17.9 - 17.45) * fps + 8, (17.9 - 17.45) * fps + 18], [0, 1], {...clamp, easing: EASE});
	const w = 80 * 1.15;
	const cx = CARD_W / 2;
	return (
		<>
			<svg width={CARD_W} height={CARD_H - 46} style={{position: 'absolute'}}>
				<TotemPath x={cx - (80 * 1.55) / 2} y={240 - 182 * 1.55} k={1.55} off={0} dashed opacity={0.35 * (1 - shrink * 0.6)} />
				<TotemPath x={cx - (80 * k) / 2} y={240 - 182 * k} k={k} off={d1} />
				{/* cotas */}
				<path d={`M${cx - w / 2} 260 H${cx + w / 2} M${cx - w / 2} 250 V270 M${cx + w / 2} 250 V270`} {...stroke(1 - lbl, 2.5)} stroke={C.lilac} />
				<path d={`M${cx + w / 2 + 34} ${240 - 182 * 1.15} V240`} {...stroke(1 - lbl, 2.5)} stroke={C.lilac} />
				<path
					d={`M${cx + w / 2 + 24} ${240 - 182 * 1.15} H${cx + w / 2 + 44} M${cx + w / 2 + 24} 240 H${cx + w / 2 + 44}`}
					{...stroke(1 - lbl, 2.5)}
					stroke={C.lilac}
				/>
			</svg>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 284,
					display: 'flex',
					justifyContent: 'center',
					opacity: lbl,
				}}
			>
				<BigText size={48} color={C.lilac}>
					compacto
				</BigText>
			</div>
		</>
	);
};

// E · Balcao ou mesa
const CardBalcaoMesa: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const base = 19.95;
	const b = interpolate(frame, [(20.14 - base) * fps, (20.14 - base) * fps + 10], [0, 1], {...clamp, easing: EASE});
	const m = interpolate(frame, [(21.0 - base) * fps, (21.0 - base) * fps + 10], [0, 1], {...clamp, easing: EASE});
	const dB = useDraw(2, 14);
	const dM = useDraw(6, 14);
	const k = 0.62;
	return (
		<>
			<svg width={CARD_W} height={CARD_H - 46} style={{position: 'absolute'}}>
				{/* balcao */}
				<g opacity={0.35 + 0.65 * b}>
					<TotemPath x={120 - (80 * k) / 2} y={150 - 182 * k} k={k} off={dB} />
					<rect x={40} y={150} width={160} height={118} {...stroke(dB)} />
					<path d="M30 150 H210" {...stroke(dB, 4)} />
					<path d="M60 182 H180" {...stroke(dB, 2)} opacity={0.5} />
				</g>
				{/* mesa */}
				<g opacity={0.35 + 0.65 * m}>
					<TotemPath x={360 - (80 * k) / 2} y={190 - 182 * k} k={k} off={dM} />
					<path d="M270 190 H450" {...stroke(dM, 6)} />
					<path d="M290 194 V268 M430 194 V268" {...stroke(dM, 4)} />
				</g>
				<path d="M240 60 V270" stroke={C.line} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.4} />
			</svg>
			<div style={{position: 'absolute', left: 0, width: 240, top: 284, display: 'flex', justifyContent: 'center', opacity: b}}>
				<BigText size={46} color={C.lilac}>
					balcão
				</BigText>
			</div>
			<div style={{position: 'absolute', left: 240, width: 240, top: 284, display: 'flex', justifyContent: 'center', opacity: m}}>
				<BigText size={46} color={C.lilac}>
					mesa
				</BigText>
			</div>
		</>
	);
};

// F · Memorial: opcao completa
const CheckRow: React.FC<{label: string; at: number; y: number}> = ({label, at, y}) => {
	const frame = useCurrentFrame();
	const on = interpolate(frame, [at, at + 8], [0, 1], {...clamp, easing: EASE});
	const d = useDraw(at, 10);
	return (
		<div style={{position: 'absolute', left: 36, top: y, display: 'flex', alignItems: 'center', gap: 26}}>
			<svg width={66} height={66}>
				<rect x={3} y={3} width={60} height={60} rx={6} fill="none" stroke={C.line} strokeWidth={3} opacity={0.6 + 0.4 * on} />
				<path d="M15 34 L28 47 L51 19" {...stroke(d, 6)} stroke={C.lilac} />
			</svg>
			<BigText size={50} color={on > 0.5 ? C.line : 'rgba(243,238,255,0.4)'}>
				{label}
			</BigText>
		</div>
	);
};
const CardCompleta: React.FC = () => {
	const {fps} = useVideoConfig();
	const base = 22.2;
	return (
		<>
			<CheckRow label="tecnologia" at={(23.68 - base) * fps} y={34} />
			<CheckRow label="praticidade" at={(24.42 - base) * fps} y={142} />
			<CheckRow label="autonomia" at={(25.5 - base) * fps} y={250} />
		</>
	);
};

// ---------- Fechamento: a planta completa do totem (so specs faladas) ----------
const Callout: React.FC<{at: number; d: string; x: number; y: number; align: 'left' | 'right'; l1: string; l2: string; hi?: boolean}> = ({
	at,
	d,
	x,
	y,
	align,
	l1,
	l2,
	hi,
}) => {
	const frame = useCurrentFrame();
	const dl = interpolate(frame, [at, at + 10], [1, 0], {...clamp, easing: EASE});
	const op = interpolate(frame, [at + 6, at + 14], [0, 1], {...clamp, easing: EASE});
	return (
		<>
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				<path d={d} {...stroke(dl, 2.5)} stroke={C.lilac} />
			</svg>
			<div
				style={{
					position: 'absolute',
					top: y,
					...(align === 'left' ? {left: x} : {right: 1080 - x}),
					textAlign: align,
					opacity: op,
					translate: `${(1 - op) * (align === 'left' ? 14 : -14)}px 0px`,
				}}
			>
				<BigText size={46}>{l1}</BigText>
				<BigText size={hi ? 64 : 46} color={C.lilac} style={{marginTop: 8}}>
					{l2}
				</BigText>
			</div>
		</>
	);
};
const EndPlan: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t0 = 29.3 * fps;
	if (frame < t0 - 1) return null;
	const k = 3;
	const X = 540 - 40 * k;
	const Y = 640;
	const dT = interpolate(frame, [t0, t0 + 18], [1, 0], {...clamp, easing: EASE});
	const dC = interpolate(frame, [t0 + 40, t0 + 52], [1, 0], {...clamp, easing: EASE});
	const lc = interpolate(frame, [t0 + 46, t0 + 56], [0, 1], {...clamp, easing: EASE});
	const yb = Y + 182 * k + 34;
	return (
		<AbsoluteFill>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<TotemPath x={X} y={Y} k={k} off={dT} />
				<path d={`M${X - 30} ${yb} H${X + 80 * k + 30} M${X - 30} ${yb - 12} V${yb + 12} M${X + 80 * k + 30} ${yb - 12} V${yb + 12}`} {...stroke(dC, 2.5)} stroke={C.lilac} />
			</svg>
			<Callout at={t0 + 16} d={`M${X + 72 * k} ${Y + 54 * k} H712`} x={724} y={Y + 54 * k - 34} align="left" l1="tela" l2={'15,6"'} hi />
			<Callout at={t0 + 24} d={`M${X + 16 * k} ${Y + 117 * k} H380`} x={368} y={Y + 117 * k - 50} align="right" l1="display" l2="de LED" />
			<Callout at={t0 + 32} d={`M${X + 56 * k} ${Y + 138 * k} L${X + 80 * k + 40} ${Y + 138 * k} L712 ${Y + 138 * k + 40}`} x={724} y={Y + 138 * k + 8} align="left" l1="impressora" l2="térmica" />
			<div style={{position: 'absolute', left: 0, right: 0, top: yb + 22, display: 'flex', justifyContent: 'center', opacity: lc}}>
				<BigText size={46} color={C.lilac}>
					compacto
				</BigText>
			</div>
		</AbsoluteFill>
	);
};

// ---------- CTA (tela cheia) ----------
const CtaLayer: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tIn = interpolate(frame, [27.0 * fps, 27.0 * fps + 12], [0, 1], {...clamp, easing: EASE});
	const bIn = interpolate(frame, [28.46 * fps, 28.46 * fps + 10], [0, 1], {...clamp, easing: EASE});
	const dB = interpolate(frame, [28.46 * fps - 2, 28.46 * fps + 14], [1, 0], {...clamp, easing: EASE});
	const bob = Math.sin((frame / fps) * Math.PI * 2 * 1.1) * 6;
	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					left: 80,
					right: 80,
					top: 300,
					opacity: tIn,
					translate: `0px ${(1 - tIn) * 24}px`,
					backgroundColor: C.chip,
					borderLeft: `6px solid ${C.lilac}`,
					padding: '22px 28px 26px',
					boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
				}}
			>
				<BigText size={88} style={{lineHeight: 1.08}}>
					Quer isso no seu <span style={{color: C.lilac}}>negócio?</span>
				</BigText>
			</div>
			<EndPlan />
			{/* botao "Clique aqui" como peca da planta */}
			<div
				style={{
					position: 'absolute',
					left: 190,
					width: 700,
					top: 1490,
					height: 124,
					opacity: bIn,
					scale: interpolate(bIn, [0, 1], [0.92, 1]),
				}}
			>
				<svg width={760} height={184} style={{position: 'absolute', left: -30, top: -30}}>
					<path d="M10 40 V10 H50 M710 10 H750 V40 M10 144 V174 H50 M710 174 H750 V144" {...stroke(dB, 3)} />
				</svg>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backgroundColor: C.lilac,
						border: `3px solid ${C.line}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 26,
					}}
				>
					<BigText size={76} color={C.ink} style={{fontWeight: 700}}>
						Clique aqui
					</BigText>
					<svg width={56} height={64} style={{translate: `0px ${bob}px`}}>
						<path d="M28 6 V52 M10 36 L28 56 L46 36" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------- Composicao ----------
export const V7: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill style={{backgroundColor: C.paperDeep}}>
			<Sheet />
			<VideoWindow />
			<WindowMarks />
			<HookLeader />
			<SheetFrame />
			<SectionLabel />
			<TitleBar />

			<Sequence name="Det A tela" from={Math.round(5.1 * fps)} durationInFrames={Math.round(2.4 * fps)} layout="none">
				<Card side="right" tag="DET. A — TELA" dur={Math.round(2.4 * fps)}>
					<CardTela />
				</Card>
			</Sequence>
			<Sequence name="Det B impressora" from={Math.round(7.6 * fps)} durationInFrames={Math.round(4.0 * fps)} layout="none">
				<Card side="right" tag="DET. B — IMPRESSORA" dur={Math.round(4.0 * fps)}>
					<CardImpressora />
				</Card>
			</Sequence>
			<Sequence name="Det C LED" from={Math.round(14.45 * fps)} durationInFrames={Math.round(2.85 * fps)} layout="none">
				<Card side="left" tag="DET. C — DISPLAY" dur={Math.round(2.85 * fps)} pos={{left: 118, top: 440, k: 0.9}}>
					<CardLed />
				</Card>
			</Sequence>
			<Sequence name="Det D compacto" from={Math.round(17.45 * fps)} durationInFrames={Math.round(2.45 * fps)} layout="none">
				<Card side="left" tag="DET. D — FORMATO" dur={Math.round(2.45 * fps)}>
					<CardCompacto />
				</Card>
			</Sequence>
			<Sequence name="Det E balcao mesa" from={Math.round(19.95 * fps)} durationInFrames={Math.round(1.7 * fps)} layout="none">
				<Card side="left" tag="DET. E — INSTALAÇÃO" dur={Math.round(1.7 * fps)}>
					<CardBalcaoMesa />
				</Card>
			</Sequence>
			<Sequence name="Det F completa" from={Math.round(22.2 * fps)} durationInFrames={Math.round(4.65 * fps)} layout="none">
				<Card side="right" tag="DET. F — MEMORIAL" dur={Math.round(4.65 * fps)}>
					<CardCompleta />
				</Card>
			</Sequence>

			<Captions />
			<CtaLayer />
		</AbsoluteFill>
	);
};
