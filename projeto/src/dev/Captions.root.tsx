import React from 'react';
import {AbsoluteFill, Composition, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Captions} from '../components/Captions';

/** Contexto real aproximado: recorte da apresentadora (mesma escala/ancora do Presenter) sobre cartao roxo,
 *  moeda dourada do canto direito (x~950,y~1505) e a grande a esquerda. Serve so para conferir sobreposicao. */
const matteIdx = (t: number) => Math.min(107, Math.max(26, Math.round(((t - 7.6) * 24000) / 1001) + 1));
const DevMatte: React.FC<{all?: boolean}> = ({all}) => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const p = interpolate(t, [7.8, 12.074], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
	const S = 1.1 * (1 + 0.06 * p);
	const n = String(matteIdx(t)).padStart(4, '0');
	return (
		<AbsoluteFill style={{background: '#8C55E0'}}>
			<div style={{position: 'absolute', left: -150, top: 940, width: 330, height: 330, borderRadius: 165, background: '#E8B52E'}} />
			<div style={{position: 'absolute', left: 878, top: 1432, width: 144, height: 144, borderRadius: 72, background: '#D9921C'}} />
			<div style={{position: 'absolute', left: 820, top: 920, width: 250, height: 250, borderRadius: 125, background: '#E8B52E'}} />
			<div style={{position: 'absolute', left: 0, top: 1920 - 1080, width: 1080, height: 1080, transformOrigin: '50% 100%', scale: S}}>
				<Img src={staticFile(`matte/m${n}.png`)} style={{width: 1080, height: 1080, display: 'block'}} />
			</div>
			<Captions yCenter={1330} showEmphasis={false} stopBeforeSec={all ? Infinity : undefined} />
		</AbsoluteFill>
	);
};

/** Fundo de teste: roxo da parede + foto da apresentadora ampliada (cover 1080x1920). */
const Dev: React.FC<{bg: 'plate34' | 'plate60' | 'f10' | 'ink' | 'purple'; yCenter?: number; all?: boolean}> = ({bg, yCenter, all}) => (
	<AbsoluteFill style={{background: bg === 'ink' ? '#120A24' : '#7B2FF0'}}>
		{bg === 'plate34' || bg === 'plate60' || bg === 'f10' ? (
			<Img
				src={staticFile(bg === 'f10' ? 'dev-captions/f10.jpg' : `dev-captions/${bg}.png`)}
				style={{position: 'absolute', left: -500, top: 0, width: 1920, height: 1920}}
			/>
		) : null}
		<Captions yCenter={yCenter} stopBeforeSec={all ? Infinity : undefined} />
	</AbsoluteFill>
);

export const CaptionsDevRoot: React.FC = () => (
	<>
		<Composition id="Captions" component={Dev} defaultProps={{bg: 'plate34' as const}} width={1080} height={1920} fps={30} durationInFrames={363} />
		<Composition id="CaptionsPlate60" component={Dev} defaultProps={{bg: 'plate60' as const}} width={1080} height={1920} fps={30} durationInFrames={363} />
		<Composition id="CaptionsInk" component={Dev} defaultProps={{bg: 'ink' as const}} width={1080} height={1920} fps={30} durationInFrames={363} />
		<Composition id="CaptionsAllPlate60" component={Dev} defaultProps={{bg: 'plate60' as const, all: true}} width={1080} height={1920} fps={30} durationInFrames={363} />
		<Composition id="CaptionsAllPurple" component={Dev} defaultProps={{bg: 'purple' as const, all: true}} width={1080} height={1920} fps={30} durationInFrames={363} />
		<Composition id="CaptionsPurple" component={Dev} defaultProps={{bg: 'purple' as const}} width={1080} height={1920} fps={30} durationInFrames={363} />
		<Composition id="CaptionsMatte" component={DevMatte} width={1080} height={1920} fps={30} durationInFrames={363} />
		<Composition id="CaptionsMatteAll" component={DevMatte} defaultProps={{all: true}} width={1080} height={1920} fps={30} durationInFrames={363} />
	</>
);
