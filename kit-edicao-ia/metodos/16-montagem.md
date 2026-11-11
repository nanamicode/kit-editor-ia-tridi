# Montagem (video.config.ts → vídeo inteiro)

**O que resolve:** junta qualquer combinação de módulos num vídeo editando **um arquivo de dados**. O montador [template/src/Video.tsx](../template/src/Video.tsx) já conhece a ordem das camadas: só inclua as seções que vai usar.

## Receita rápida
1. Coloque a mídia em `template/public/<video>/` (bruto, `matte/`, `plate/`, `audio/bed.wav`).
2. Copie [template/src/video.config.ts](../template/src/video.config.ts) (exemplo V02) e troque os dados. Esqueleto mínimo para um vídeo novo:
```ts
import { BRAND_ROXO_DOURADO } from "./kit/theme";
import type { VideoConfig } from "./Video";
import matte from "../public/meuvideo/matte.json";          // gerado por recorte_rvm.py
import words from "../public/meuvideo/words.json";          // gerado por transcrever.py
import { doWhisper } from "./kit/legendas";

const W = doWhisper(words);                                  // [{text,s,e}] em MAIÚSCULAS
export const config: VideoConfig = {
  id: "Video", brand: BRAND_ROXO_DOURADO, width: 1080, height: 1920, fps: 30, durationSec: 15,
  broll: { src: "meuvideo/bruto.mp4", srcFps: 30, srcWidth: 1080, srcHeight: 1920, clips: [
    { fromSec: 0, toSec: 1.4, mode: "full", title: "SEU LOGO\nEM RELEVO", support: "RELEVO SECO NO ENVELOPE", pressSec: 0.5 },
    // … 1 clipe por plano do analise.json (ver 04-cortes-dinamicos.md)
  ]},
  selo3d: { atSec: 7.7 },                                    // cobre 100% aqui; troque a cena sob ele
  apresentadora: { matte, matteDir: "meuvideo/matte", plateDir: "meuvideo/plate", fromSec: 7.6, toSec: 15, liveSec: 8.6 },
  camera: { push: { in0: 8.2, in1: 12, out0: 12, out1: 12.6, amount: 0.05 }, punches: [] },
  palavraGigante: { items: [{ text: "DIFERENÇA", inSec: 8.8, outSec: 9.4 }] },   // ou gigantePelaFala(W, "DIFERENÇA")
  moedas: { back: { fromSec: 7.95, toSec: 15 }, front: { fromSec: 8.7, toSec: 15 } },
  legendas: { words: W, stopBeforeSec: 12.5 },
  cta: { pillInSec: 12.4, clickSec: 12.7, label: "SAIBA MAIS", headline: { words: W.slice(-3) },
         stamp: { x: 198, y: 410, size: 120, hitSec: 12.9 } },
  audio: { voiceSrc: "meuvideo/bruto.mp4", voiceVolume: 0.7, bedSrc: "meuvideo/audio/bed.wav", bedVolume: 1 },
};
```
3. `cd template && npx tsc --noEmit` e depois a folha de stills ([13](13-verificacao-render.md)).

## Seções do config (todas opcionais menos id, brand e dimensões)
| seção | módulo / método | o que preencher |
|---|---|---|
| `broll` | [04](04-cortes-dinamicos.md), [03](03-rotulos-hud.md), [05](05-transicoes.md) | src, srcFps, clips {fromSec,toSec,mode,title,support,pressSec} |
| `selo3d` | [09](09-selo-3d.md) | atSec (cobertura total). Opcional: icon, color, relief |
| `apresentadora` + `camera` | [14](14-cenario-apresentadora.md), [06](06-recorte.md) | matte.json, pastas, fromSec/toSec/liveSec, punches |
| `palavraGigante` | [08](08-palavra-gigante-eco.md) | items {text,inSec,outSec,outline?} |
| `moedas` | [10](10-moedas-3d.md) | back/front {fromSec,toSec,coins?} |
| `legendas` | [02](02-legendas.md) | words (doWhisper), emphasis, stopBeforeSec |
| `faixaTopo`, `cta` | [11](11-cta.md) | texto, tempos, stamp {x,y,size,hitSec} |
| `audio` | [12](12-audio-sfx.md) | voz (bruto), bed.wav, volumes |

## Ordem das camadas (já no Video.tsx; não reordenar sem motivo)
Cartão → palavra gigante → moedas de trás → **pessoa** → moedas da frente → botão/título do CTA → selo da estampa + onda → cursor → legendas │ faixa de topo │ B-roll (opaco até acabar) │ selo 3D (overlay) │ áudio.

## Armadilhas já vividas
- **Elemento escondido por camada:** o selo da estampa ficava atrás do encaixe do botão. Ele tem um canvas próprio acima do botão.
- **Stacking context:** o B-roll e o selo 3D são irmãos diretos no root. Envolver o B-roll em `transform`/`opacity` joga o rótulo do último clipe para baixo do selo.
- **Sem `<Sequence from>`:** os módulos leem o tempo absoluto da composição. Para deslocar, mude os tempos no config.
- `Infinity` em defaultProps vira `null` no Studio: use 9999.
- O vídeo-fonte pode ter outro fps e outro tamanho (o exemplo é 1080x1080 a 23,976). Informe `srcFps`, `srcWidth` e `srcHeight`.

## Checklist
- [ ] Cada seção do config usa números do `analise.json`/`words.json`, não chutes.
- [ ] Folha de stills: abertura, 1 por corte, o selo cobrindo, a revelação, a fala, o CTA e o último quadro.
