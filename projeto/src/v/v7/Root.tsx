import React from 'react';
import {Composition} from 'remotion';
import {V7} from './V7';

// v7 · Totem de mesa Pro (Maindx) · estilo FCA 23 Blueprint + visual V8 Planta Azul (adaptado ao roxo da marca)
export const RootV7: React.FC = () => {
	return (
		<Composition
			id="V7"
			component={V7}
			durationInFrames={946}
			fps={30}
			width={1080}
			height={1920}
		/>
	);
};
