/**
 * DADOS DO VIDEO — o unico arquivo que muda por video (ver metodos/16-montagem.md).
 * Este exemplo reproduz o criativo de carimbos V02 (aprovado) com a midia de public/exemplo/.
 * Para um video novo: copie este arquivo, apague as secoes que nao vai usar e preencha os
 * numeros com o analise.json (cortes, cliques, palavras). Tempos em SEGUNDOS de composicao.
 */
import { BRAND_ROXO_DOURADO } from "./kit/theme";
import type { VideoConfig } from "./Video";
import { V02_CLIPS } from "./dev/BRoll.root";
import { V02_LEGENDAS, V02_WORDS } from "./dev/Legendas.root";
import { V02_GIGANTE } from "./dev/PalavraGigante.root";
import { V02_CTA, V02_FAIXA } from "./dev/Cta.root";
import { V02_APRESENTADORA, V02_CAM_PUNCHES, V02_PUSH } from "./dev/Apresentadora.root";

export const config: VideoConfig = {
  id: "Video",
  brand: BRAND_ROXO_DOURADO,
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 12.1,

  // 0-7.8 s: B-roll com cortes dinamicos. Para video novo basta {fromSec,toSec,title,support,pressSec,mode} por clipe.
  broll: { src: "exemplo/criativo.mp4", srcFps: 24000 / 1001, srcWidth: 1080, srcHeight: 1080, clips: V02_CLIPS },

  // transicao-estrela: selo cobre 100% em 7.71 s e racha revelando a apresentadora
  selo3d: { atSec: 7.71 },

  // 7.6-12.07 s: apresentadora recortada sobre o cartao editorial
  apresentadora: V02_APRESENTADORA,
  camera: { push: V02_PUSH, punches: V02_CAM_PUNCHES },

  palavraGigante: V02_GIGANTE, // DIFERENCA e GARANTA acima da cabeca, 3 ecos em contorno
  moedas: {
    back: { fromSec: 7.95, toSec: 12.074, parallaxOriginSec: 7.8 },
    front: { fromSec: 8.7, toSec: 12.074, parallaxOriginSec: 7.8 },
  },
  legendas: V02_LEGENDAS, // palavras: V02_WORDS (transcrever.py -> words.json)
  faixaTopo: V02_FAIXA,
  cta: { ...V02_CTA, stamp: { x: 198, y: 410, size: 120, hitSec: 10.4, popSecs: [11.14] } },

  audio: { voiceSrc: "exemplo/criativo.mp4", voiceVolume: 0.668, bedSrc: "exemplo/audio/bed.wav", bedVolume: 1 },
};

/** palavras da fala (referencia rapida para sincronizar outros elementos) */
export const WORDS = V02_WORDS;
