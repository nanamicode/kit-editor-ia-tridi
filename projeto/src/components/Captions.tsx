import React from 'react';
import {Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Anton';
import {
	CAPTION_PAGES,
	CAPTION_WORDS,
	WINDOW as DATA_WINDOW,
	type CaptionWord,
	type EmphasisKind,
} from './captions-data';

export {
	CAPTION_PAGES,
	CAPTION_WORDS,
	EMPHASIS_WINDOWS,
	getActivePage,
	getActiveWord,
	type ActiveWord,
	type CaptionWord,
} from './captions-data';

/** Janela em que o componente desenha algo (transparente fora dela). */
export const WINDOW = DATA_WINDOW;

const {fontFamily} = loadFont('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

const INK = '#120A24';
const IVORY = '#FFF8E7';
const GOLD = '#FFD86B';
const GOLD_DEEP = '#F5C542';
const VIOLET = '#B794FF';

/** a pagina entra/o destaque pinga 0.8 quadro antes da voz (o olho percebe legenda atrasada como erro) */
const LEAD_FRAMES = 0.8;
/** saida da ultima pagina: encolhe (pop-out) em 4 quadros, SEMPRE com opacidade 1 (nada de fade que enlameia o contorno) */
const EXIT_FRAMES = 4;
/** paginas cuja 1a palavra comeca em/depois deste instante nao sao desenhadas (o CTA do topo assume a mesma frase) */
const DEFAULT_STOP_BEFORE_SEC = 10.5;
/** descida padrao da linha para liberar queixo/pescoco da apresentadora (px do quadro 1920) */
const DEFAULT_Y_NUDGE = 80;

export type CaptionsProps = {
	style?: React.CSSProperties;
	/** y do centro do bloco de legenda no quadro de 1920 (antes do yNudge) */
	yCenter?: number;
	/** descida somada ao yCenter (padrao 80 px: a linha fica abaixo do queixo) */
	yNudge?: number;
	/** paginas que comecam em/depois deste instante (s) nao aparecem. Padrao 10.5: "GARANTA O SEU!" fica so no CTA do topo
	 *  (uma voz de texto por trecho). Passe Infinity para legendar a fala inteira. */
	stopBeforeSec?: number;
	/** multiplica todos os corpos de fonte (1 = 136-196 px) */
	scale?: number;
	/** cor da palavra falada */
	activeColor?: string;
	/** cor das palavras ja ditas */
	doneColor?: string;
	/** cor dos traços de enfase (sublinhado) */
	accentColor?: string;
	/** cor do contorno/caixa */
	inkColor?: string;
	/** desliga sublinhado/caixa/faiscas (deixa so o pop de cor/escala) */
	showEmphasis?: boolean;
	/** deslocamento de tempo, se o componente for montado dentro de um Sequence (segundos) */
	timeOffsetSec?: number;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ------------------------------------------------------------------ */
/* Enfases                                                             */
/* ------------------------------------------------------------------ */

/** Sublinhado de marca-texto desenhado da esquerda para a direita (revelado por clip-path). */
const Underline: React.FC<{frame: number; startF: number; color: string; ink: string; thick?: number; wave?: number}> = ({
	frame,
	startF,
	color,
	ink,
	thick = 1,
	wave = 0,
}) => {
	const p = interpolate(frame, [startF, startF + 9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	if (p <= 0) return null;
	const d = wave
		? 'M4 12 C 34 4, 58 18, 96 9 S 156 3, 196 10'
		: 'M4 11 C 40 7, 100 14, 150 9 S 186 8, 196 10';
	return (
		<svg
			viewBox="0 0 200 20"
			preserveAspectRatio="none"
			style={{
				position: 'absolute',
				left: '-3%',
				width: '106%',
				bottom: '-0.2em',
				height: '0.2em',
				overflow: 'visible',
				clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`,
			}}
		>
			<path d={d} fill="none" stroke={ink} strokeWidth={17 * thick} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
			<path d={d} fill="none" stroke={color} strokeWidth={9 * thick} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
		</svg>
	);
};

/** Estouro de faiscas radiais em volta da palavra (GARANTA). */
const SPARK_ANGLES = [-140, -115, -90, -62, -35, -10, 10];
const SPARK_ANGLES_FINAL = [-112, -90, -62, -35, -10, 10];
const Sparks: React.FC<{frame: number; startF: number; color: string; ink: string; angles: number[]}> = ({frame, startF, color, ink, angles}) => {
	const p = interpolate(frame, [startF, startF + 11], [0, 1], clamp);
	if (p <= 0 || p >= 1) return null;
	const tip = Easing.out(Easing.cubic)(p);
	const tail = Easing.out(Easing.cubic)(Math.max(0, p - 0.45) / 0.55);
	const fade = interpolate(p, [0.6, 1], [1, 0], clamp);
	const r0x = 56;
	const r0y = 82;
	const lenX = 15;
	const lenY = 44;
	return (
		<svg
			width="100%"
			height="100%"
			style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: fade, pointerEvents: 'none'}}
		>
			{angles.map((deg, k) => {
				const a = (deg * Math.PI) / 180;
				const wob = 0.82 + ((k * 37) % 5) * 0.07;
				const x1 = 50 + Math.cos(a) * (r0x + lenX * wob * tail);
				const y1 = 50 + Math.sin(a) * (r0y + lenY * wob * tail);
				const x2 = 50 + Math.cos(a) * (r0x + lenX * wob * tip);
				const y2 = 50 + Math.sin(a) * (r0y + lenY * wob * tip);
				return (
					<g key={k}>
						<line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={ink} strokeWidth={15} strokeLinecap="round" />
						<line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={color} strokeWidth={7} strokeLinecap="round" />
					</g>
				);
			})}
		</svg>
	);
};

/* ------------------------------------------------------------------ */
/* Palavra                                                             */
/* ------------------------------------------------------------------ */

type Palette = {active: string; done: string; accent: string; ink: string};

const EMPH_SCALE: Record<NonNullable<EmphasisKind> | 'none', number> = {
	none: 1.1,
	diferenca: 1.08,
	saiba: 1.12,
	garanta: 1.1,
	final: 1.24,
};
/** fatia da etiqueta que cobre so a 1a palavra (SAIBA) antes de MAIS comecar */
const BOX_FIRST_SHARE = 0.63;
const EMPH_ROT: Record<string, [number, number]> = {
	diferenca: [-8, -2.5],
	garanta: [6, 2],
};

const WordView: React.FC<{
	w: CaptionWord;
	frame: number;
	fps: number;
	size: number;
	pal: Palette;
	showEmphasis: boolean;
}> = ({w, frame, fps, size, pal, showEmphasis}) => {
	const startF = w.s * fps - LEAD_FRAMES;
	const endF = w.e * fps - LEAD_FRAMES;
	const isFinal = w.emphasis === 'final';
	const kind = w.emphasis ?? 'none';

	const started = frame >= startF;
	const pop = started
		? spring({frame: frame - startF, fps, config: {damping: 11, stiffness: 240, mass: 0.55}})
		: 0;
	const relax = isFinal ? 0 : interpolate(frame, [endF, endF + 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

	const target = EMPH_SCALE[kind];
	const popScale = started ? interpolate(pop, [0, 1], [0.84, target]) : 0.88;
	const sc = popScale * (1 - relax) + 1 * relax;

	const color = !started
		? pal.done
		: isFinal
			? pal.active
			: interpolateColors(frame, [endF - 1, endF + 5], [pal.active, pal.done]);

	// palavra ainda nao falada: reserva o espaco (layout estavel) mas NAO desenha; falada: opacidade 1 desde o 1o quadro
	const opacity = started ? 1 : 0;

	const rotPair = showEmphasis ? EMPH_ROT[kind] : undefined;
	const rot = rotPair && started ? interpolate(pop, [0, 1], [rotPair[0], rotPair[1]]) : rotPair ? rotPair[0] * 0.3 : 0;

	const ty = started ? interpolate(pop, [0, 1], [size * 0.1, 0]) : size * 0.04;

	const stroke = size * 0.125;
	return (
		<span
			style={{
				position: 'relative',
				display: 'inline-block',
				fontFamily,
				fontSize: size,
				lineHeight: 1,
				letterSpacing: size * 0.008,
				whiteSpace: 'nowrap',
				color,
				opacity,
				transform: `translateY(${ty}px) rotate(${rot}deg) scale(${sc})`,
				transformOrigin: '50% 64%',
				WebkitTextStroke: stroke > 0 ? `${stroke}px ${pal.ink}` : undefined,
				paintOrder: 'stroke fill',
				textShadow: started
					? `0 ${size * 0.055}px 0 ${pal.ink}, 0 ${size * 0.09}px ${size * 0.14}px rgba(10,4,24,0.55)`
					: `0 ${size * 0.02}px ${size * 0.06}px rgba(10,4,24,0.6)`,
			}}
		>
			{w.text}
			{showEmphasis && kind === 'diferenca' ? (
				<Underline frame={frame} startF={startF + 3} color={pal.accent} ink={pal.ink} wave={1} />
			) : null}
			{showEmphasis && (kind === 'garanta' || kind === 'final') ? (
				<>
					{kind === 'garanta' ? (
						<Underline frame={frame} startF={startF + 4} color={pal.accent} ink={pal.ink} thick={1} />
					) : null}
					<Sparks frame={frame} startF={startF} color={GOLD_DEEP} ink={pal.ink} angles={kind === 'final' ? SPARK_ANGLES_FINAL : SPARK_ANGLES} />
				</>
			) : null}
		</span>
	);
};

/* ------------------------------------------------------------------ */
/* Linha (com a caixa-etiqueta de SAIBA MAIS)                          */
/* ------------------------------------------------------------------ */

const LineView: React.FC<{
	words: CaptionWord[];
	frame: number;
	fps: number;
	size: number;
	pal: Palette;
	showEmphasis: boolean;
}> = ({words, frame, fps, size, pal, showEmphasis}) => {
	const hasBox = showEmphasis && words.some((w) => w.emphasis === 'saiba');
	const boxStart = words[0].s * fps - LEAD_FRAMES;
	const p = interpolate(frame, [boxStart, boxStart + 5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	// a etiqueta cresce junto com a fala: cobre so a 1a palavra e abre ate a ultima quando ela comeca
	const second = words.length > 1 ? words[1].s * fps - LEAD_FRAMES : boxStart;
	const grow = words.length > 1 ? interpolate(frame, [second, second + 5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
	const share = BOX_FIRST_SHARE + (1 - BOX_FIRST_SHARE) * grow;
	const reveal = Math.min(p, 1) * share;
	const boxRot = interpolate(p, [0, 1], [-4, -1.6]);
	return (
		<div
			style={{
				position: 'relative',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'baseline',
				columnGap: size * 0.38,
				whiteSpace: 'nowrap',
			}}
		>
			{hasBox ? (
				<div
					style={{
						position: 'absolute',
						left: -size * 0.3,
						right: -size * 0.3,
						top: size * 0.0,
						bottom: -size * 0.02,
						borderRadius: size * 0.18,
						background: pal.ink,
						boxShadow: `0 0 0 ${size * 0.035}px ${VIOLET}, 0 ${size * 0.1}px ${size * 0.22}px rgba(10,4,24,0.5)`,
						transform: `rotate(${boxRot}deg)`,
						clipPath: `inset(-20% ${(1 - reveal) * 100}% -20% -5%)`,
					}}
				/>
			) : null}
			{words.map((w) => (
				<WordView key={w.i} w={w} frame={frame} fps={fps} size={size} pal={pal} showEmphasis={showEmphasis} />
			))}
		</div>
	);
};

/* ------------------------------------------------------------------ */
/* Pagina                                                              */
/* ------------------------------------------------------------------ */

const PageView: React.FC<{
	pageIndex: number;
	frame: number;
	fps: number;
	scale: number;
	pal: Palette;
	showEmphasis: boolean;
	stopBeforeSec: number;
}> = ({pageIndex, frame, fps, scale, pal, showEmphasis, stopBeforeSec}) => {
	const page = CAPTION_PAGES[pageIndex];
	const pageWords = CAPTION_WORDS.filter((w) => w.page === pageIndex);
	const firstStart = pageWords[0].s * fps - LEAD_FRAMES;
	const lastEnd = pageWords[pageWords.length - 1].e * fps;
	const nextCandidate = CAPTION_WORDS.filter((w) => w.page === pageIndex + 1)[0];
	const next = nextCandidate && nextCandidate.s < stopBeforeSec ? nextCandidate : undefined;

	// troca de pagina: corte seco no quadro em que a proxima pagina nasce (sem sobreposicao, sem fade meio-transparente)
	// ultima pagina: pop-out de EXIT_FRAMES quadros sempre com opacidade 1
	const exitStart = Math.min(lastEnd, stopBeforeSec * fps);
	const exitEnd = exitStart + EXIT_FRAMES;
	if (frame < firstStart) return null;
	if (next) {
		if (frame >= next.s * fps - LEAD_FRAMES) return null;
	} else if (frame > exitEnd) {
		return null;
	}

	const enter = spring({
		frame: frame - firstStart,
		fps,
		config: {damping: 14, stiffness: 280, mass: 0.5},
	});
	const out = next ? 0 : interpolate(frame, [exitStart, exitEnd], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const y = interpolate(enter, [0, 1], [26, 0]) - out * 12;
	const s = interpolate(enter, [0, 1], [0.92, 1]) * (1 - out * 0.96);

	const size = page.size * scale;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				rowGap: size * 0.1,
				transform: `translateY(${y}px) scale(${s})`,
				transformOrigin: '50% 50%',
			}}
		>
			{page.lines.map((line, li) => (
				<LineView
					key={li}
					words={line.map((i) => CAPTION_WORDS[i])}
					frame={frame}
					fps={fps}
					size={size}
					pal={pal}
					showEmphasis={showEmphasis}
				/>
			))}
		</div>
	);
};

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export const Captions: React.FC<CaptionsProps> = ({
	style,
	yCenter = 1330,
	yNudge = DEFAULT_Y_NUDGE,
	stopBeforeSec = DEFAULT_STOP_BEFORE_SEC,
	scale = 1,
	activeColor = GOLD,
	doneColor = IVORY,
	accentColor = VIOLET,
	inkColor = INK,
	showEmphasis = true,
	timeOffsetSec = 0,
}) => {
	const rawFrame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const frame = rawFrame + timeOffsetSec * fps;
	if (frame < WINDOW.fromSec * fps || frame > WINDOW.toSec * fps) return null;

	const pal: Palette = {active: activeColor, done: doneColor, accent: accentColor, ink: inkColor};
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: yCenter + yNudge,
				width: 1080,
				height: 0,
				pointerEvents: 'none',
				...style,
			}}
		>
			{CAPTION_PAGES.map((_, p) => (
				<CenteredPage key={p} pageIndex={p} frame={frame} fps={fps} scale={scale} pal={pal} showEmphasis={showEmphasis} stopBeforeSec={stopBeforeSec} />
			))}
		</div>
	);
};

/** centraliza verticalmente cada pagina em yCenter (paginas de 1 ou 2 linhas) */
const CenteredPage: React.FC<{
	pageIndex: number;
	frame: number;
	fps: number;
	scale: number;
	pal: Palette;
	showEmphasis: boolean;
	stopBeforeSec: number;
}> = (props) => {
	const page = CAPTION_PAGES[props.pageIndex];
	if (CAPTION_WORDS.filter((w) => w.page === props.pageIndex)[0].s >= props.stopBeforeSec) return null;
	const size = page.size * props.scale;
	const lines = page.lines.length;
	const h = size * lines + size * 0.1 * (lines - 1);
	return (
		<div
			style={{
				position: 'absolute',
				left: (page.dx ?? 0) * props.scale,
				right: -(page.dx ?? 0) * props.scale,
				top: -h / 2 + (page.dy ?? 0) * props.scale,
				height: h,
			}}
		>
			<PageView {...props} />
		</div>
	);
};

export default Captions;
