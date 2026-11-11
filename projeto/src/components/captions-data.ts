/**
 * Dados das legendas (sem React, sem fonte): tempos das palavras, paginas e
 * a funcao getActiveWord() que os outros agentes usam para sincronizar enfases.
 *
 * TEMPOS CORRIGIDOS contra o audio real (nao confiar so no words.json do Whisper):
 *  - audio e silencio digital ate 8.30 s e ruido de sala ate 8.62 s; a voz entra em 8.62 s
 *    (o Whisper marcava "Faz" em 8.28 s = inicio do ruido).
 *  - espectrograma + envelope de energia mostram os blocos vozeados:
 *    Faz 8.62-8.88 | diferenca 8.94-9.38 | ne? 9.40-9.60 | Cli-que 9.66-9.97 |
 *    Sai 10.02-10.14 / ba 10.18-10.30 | Mais 10.32-10.56 | e 10.60-10.68 |
 *    garanta 10.70-10.97 | seu 11.14-11.45.
 *  - conferido ainda com a legenda queimada original (amostrada a 10 fps), que acende
 *    FAZ 8.6, DIFERENCA 8.9, NE 9.4, CLICA 9.7, EM 9.9, SAIBA 10.0, MAIS 10.3, E 10.6,
 *    GARANTA 10.7, O 11.1, SEU 11.2.
 *  DECISAO "CLIQUE" x "CLICA" (palavra i:3, rodada 2): nao ha como OUVIR o audio aqui, entao foi
 *  decidido por medicao. Whisper large-v3-turbo (muito melhor que o small) transcreve "Clique"
 *  (prob. 0.955 da palavra), inclusive quando o decodificador e enviesado com initial_prompt
 *  "Clica em saiba mais". Pontuacao da frase inteira (log-prob, beam 12): "Clique em saiba mais..."
 *  = -1.32 contra "Clica em saiba mais..." = -3.66 (~10x a favor de "Clique"); a vogal final tem
 *  F2 alto (mais perto de /i/ que de /a/). O texto queimado do original dizia "CLICA", entao
 *  se o usuario ouvir "clica" no audio, basta trocar CAPTION_WORDS[3].text para 'CLICA'.
 *  O mesmo vale para a etiqueta de CTA do Presenter (a palavra "CLIQUE" so aparece aqui).
 *  Os tempos abaixo sao de ARQUIVO (= tempo da composicao), em segundos.
 */

export const WINDOW = {fromSec: 8.1, toSec: 11.9};

export type EmphasisKind = 'diferenca' | 'saiba' | 'garanta' | 'final' | null;

export type CaptionWord = {
	/** indice global (0..10) */
	i: number;
	/** texto exibido (MAIUSCULAS, com acento) */
	text: string;
	/** inicio da fala, s */
	s: number;
	/** fim da fala, s */
	e: number;
	/** pagina a que pertence */
	page: number;
	/** palavra que recebe enfase extra (desenho/caixa/faiscas) */
	emphasis: EmphasisKind;
};

export const CAPTION_WORDS: CaptionWord[] = [
	{i: 0, text: 'FAZ', s: 8.6, e: 8.9, page: 0, emphasis: null},
	{i: 1, text: 'DIFERENÇA,', s: 8.9, e: 9.4, page: 0, emphasis: 'diferenca'},
	{i: 2, text: 'NÉ?', s: 9.4, e: 9.64, page: 1, emphasis: null},
	{i: 3, text: 'CLIQUE', s: 9.64, e: 9.88, page: 2, emphasis: null},
	{i: 4, text: 'EM', s: 9.88, e: 10.0, page: 2, emphasis: null},
	{i: 5, text: 'SAIBA', s: 10.0, e: 10.3, page: 3, emphasis: 'saiba'},
	{i: 6, text: 'MAIS', s: 10.3, e: 10.58, page: 3, emphasis: 'saiba'},
	{i: 7, text: 'E', s: 10.58, e: 10.7, page: 4, emphasis: null},
	{i: 8, text: 'GARANTA', s: 10.7, e: 11.02, page: 4, emphasis: 'garanta'},
	{i: 9, text: 'O', s: 11.02, e: 11.14, page: 5, emphasis: null},
	{i: 10, text: 'SEU!', s: 11.14, e: 11.46, page: 5, emphasis: 'final'},
];

export type CaptionPage = {
	/** palavras por linha (indices globais) - quebras naturais, maximo 2 linhas */
	lines: number[][];
	/** corpo base em px (largura 1080) */
	size: number;
	/** deslocamento horizontal da pagina (px), somado ao centro da tela */
	dx?: number;
	/** deslocamento vertical da pagina (px), somado ao yCenter+yNudge: afasta a legenda do queixo/mao */
	dy?: number;
};

/*
 * Posicionamento por pagina (rodada 3, revisores): a apresentadora mexe a cabeca e a mao nesse trecho.
 *  - queixo ~ y1300 em 9.4-9.64 s: "NE?" (o acento do E sobe ~0.29 do corpo acima das maiusculas) desce e encolhe
 *    para deixar >=60 px livres abaixo do queixo.
 *  - "CLIQUE EM": a mao fechada do gesto de clique fica em x 140-290; a pagina vai para a direita e fica menor
 *    (entre a mao e a moeda dourada do canto direito, x ~ 300-880).
 *  - "SAIBA MAIS": encolhe para ficar dentro de x ~ 200-880 (a moeda do canto direito fica livre).
 */
export const CAPTION_PAGES: CaptionPage[] = [
	{lines: [[0, 1]], size: 136},
	{lines: [[2]], size: 160, dy: 50},
	{lines: [[3, 4]], size: 130, dx: 70, dy: 24},
	{lines: [[5, 6]], size: 144, dx: -24, dy: 22},
	{lines: [[7, 8]], size: 168},
	{lines: [[9, 10]], size: 196},
];

/** Janelas de enfase para os outros agentes (ex.: flash/impacto/CTA em sincronia). */
export const EMPHASIS_WINDOWS: {key: 'DIFERENCA' | 'SAIBA MAIS' | 'GARANTA'; startSec: number; endSec: number}[] = [
	{key: 'DIFERENCA', startSec: 8.9, endSec: 9.4},
	{key: 'SAIBA MAIS', startSec: 10.0, endSec: 10.58},
	{key: 'GARANTA', startSec: 10.7, endSec: 11.02},
];

export type ActiveWord = {
	index: number;
	/** texto exibido (ex.: "DIFERENÇA,") */
	text: string;
	/** mesma palavra sem pontuacao e sem acento (ex.: "DIFERENCA") */
	key: string;
	startSec: number;
	endSec: number;
	/** 0..1 dentro da palavra */
	progress: number;
	page: number;
	/** true em DIFERENCA, SAIBA, MAIS, GARANTA */
	isEmphasis: boolean;
	emphasis: EmphasisKind;
};

const toKey = (t: string) =>
	t
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^A-Z]/g, '');

/**
 * Palavra sendo falada no tempo tSec (segundos de arquivo/composicao).
 * Retorna null fora da fala (antes de 8.60 s, depois de 11.46 s). Intervalos [s, e).
 */
export const getActiveWord = (tSec: number): ActiveWord | null => {
	for (let k = 0; k < CAPTION_WORDS.length; k++) {
		const w = CAPTION_WORDS[k];
		if (tSec >= w.s && tSec < w.e) {
			return {
				index: w.i,
				text: w.text,
				key: toKey(w.text),
				startSec: w.s,
				endSec: w.e,
				progress: (tSec - w.s) / (w.e - w.s),
				page: w.page,
				isEmphasis: w.emphasis === 'diferenca' || w.emphasis === 'saiba' || w.emphasis === 'garanta',
				emphasis: w.emphasis,
			};
		}
	}
	return null;
};

/** Pagina (grupo de 1-3 palavras) ativa em tSec, incluindo o pequeno rastro de saida. */
export const getActivePage = (tSec: number): number | null => {
	if (tSec < CAPTION_WORDS[0].s) return null;
	for (let p = CAPTION_PAGES.length - 1; p >= 0; p--) {
		const first = CAPTION_WORDS.filter((w) => w.page === p)[0];
		if (tSec >= first.s) return p;
	}
	return null;
};
