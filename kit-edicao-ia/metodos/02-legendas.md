# Legendas palavra a palavra

**Quando usar / o que resolve:** toda fala do apresentador. Página de 1–2 palavras centrada abaixo do queixo; a palavra falada pinga (mola) na cor ativa e assenta na cor "dita". Contorno grosso + sombra dura da marca: legível sobre qualquer fundo, sem caixa.

## Receita rápida
```bash
# 1) transcrever (word timestamps + correção do início por energia). Imprime JSON curto com o texto e os ajustes.
python scripts/transcrever.py originais/video.mp4 --out analise/words.json --model small --lang pt
#    grafia duvidosa (marca, "clique" x "clica")? rode de novo com --model large-v3-turbo --prompt "<frase do roteiro>"
#    vídeo começa depois na composição? --offset <s>
```
2) No `template/src/video.config.ts`, preencher `legendas` (o JSON do passo 1 vira `words` com `doWhisper()` ou à mão):
```ts
import { doWhisper } from "./kit/legendas";
legendas: {
  words: doWhisper([/* colar aqui o conteúdo de analise/words.json */]),   // ou [{text:"FAZ", s:8.6, e:8.9}, ...]
  pages: undefined,            // automático; ajuste à mão só a página que bater em rosto/mão
  emphasis: [{ word: "GARANTA", kind: "faisca" }],
  showEmphasis: false,         // V02 aprovado: false
  yCenter: 1330, yNudge: 80,
  stopBeforeSec: 10.5,         // a partir daqui outro elemento fala a frase (título do CTA)
  cutAtSec: 9.995,             // corte seco quando a frase vira o botão
}
```
3) `<Legendas {...cfg.legendas} />` acima da pessoa e do cenário. Still dos quadros de cada página (veja Checklist).

API: [template/src/kit/legendas/index.ts](../template/src/kit/legendas/index.ts). Dados do V02: [template/src/dev/Legendas.root.tsx](../template/src/dev/Legendas.root.tsx).

## Parâmetros
| prop | default | efeito |
|---|---|---|
| words | — | `[{text,s,e}]` em segundos de composição, tempo da FALA REAL |
| pages | `paginar(words)` | `[{lines:[[i,j]], size?, dx?, dy?}]`; máx. 2 linhas; `dx/dy` afastam de mão/queixo |
| emphasis | `[]` | `[{word|index, kind}]`, kind = `onda` (sublinhado ondulado), `etiqueta` (caixa na linha), `faisca` (sublinhado + faíscas), `final` (maior, fica na cor ativa) |
| showEmphasis | true | desenha sublinhado/caixa/faíscas. Com false a escala do pop e a cor do `final` continuam |
| yCenter / yNudge | 1330 / 80 | centro do bloco = yCenter+yNudge (px de 1920) |
| stopBeforeSec | ∞ | páginas que começam em/depois disso não aparecem; a anterior sai com pop-out |
| cutAtSec | ∞ | a partir disso nada é desenhado (corte seco) |
| scale | 1 | multiplica todos os corpos |
| leadFrames | 0.8 | antecipação da entrada/pop em quadros |
| exitFrames | 4 | pop-out da última página |
| colors | marca | `{active: accentLight, done: text, accent: primaryLight, ink: ink, spark: accent}` |
| timeOffsetSec | 0 | se montar dentro de `<Sequence from>` |

Helpers: `paginar(words,{maxWords:2,maxChars:15,maxGapSec:0.3})`, `corpoPara(chars)`, `palavraAtiva(words,t)` (sincroniza soco de câmera/flash/SFX), `achaPalavra(words,"garanta")`, `chave(texto)`.

## Como funciona
- Cada página é desenhada só entre a 1ª palavra (−lead) e a 1ª palavra da página seguinte: troca = corte seco, nunca duas páginas ao mesmo tempo.
- Palavras ainda não ditas ocupam espaço (opacidade 0): o layout não pula quando a próxima entra.
- Pop: mola (damping 11, stiffness 240) de 0.84 → 1.10 (1.08–1.24 conforme a ênfase); relaxa para 1.0 em 6 quadros após o fim da palavra; a cor vai de ativa para "dita" em 6 quadros.
- Contorno = 12,5 % do corpo (`-webkit-text-stroke` + `paint-order: stroke fill`), sombra dura de 5,5 % na cor `ink`.
- Corpo automático: `900 / (caracteres × 0.47)` limitado a 110–196 px (V02: 130–196).

## Armadilhas já vividas
- **Whisper adianta a 1ª palavra após silêncio/ruído** (marcou "Faz" em 8.28 s, a voz entra em 8.62 s). O `transcrever.py` corrige pela energia (`ajustes` no JSON). Palavras no meio da frase não são corrigidas: no V02 o small deu "diferença" em 8.74, a real é 8.90. Confira as palavras de ênfase com o envelope de energia ou com a legenda queimada do original.
- **Legenda atrasada parece erro**: a entrada antecipa 0.8 quadro (`leadFrames`). Não aumente além de ~2 quadros.
- **Saída com fade enlameia o contorno**: a última página sai por escala (pop-out de 4 quadros) sempre com opacidade 1. Não use fade.
- **Frase repetida em dois textos**: quando "SAIBA MAIS" vira o botão do CTA, a legenda corta (`cutAtSec`); "GARANTA O SEU!" fica só no título do CTA (`stopBeforeSec`). Uma voz de texto por trecho.
- **Legenda em cima do queixo/mão**: use `dy` (desce) e `dx` + `size` menor na página do gesto (V02: "NÉ?" dy 50; "CLIQUE EM" dx 70, size 130).
- **Acento de "É" sobe ~0.29 do corpo** acima das maiúsculas: conte isso na folga do queixo.
- **"CLIQUE" x "CLICA"**: o small e o large-v3-turbo ouviram "Clique" (prob. 0.955); o texto queimado do original dizia "CLICA". Na dúvida, pergunte ao usuário. Basta trocar o `text`.
- **`Infinity` em defaultProps** vira `null` na serialização do Studio e some tudo: use 9999.

## Checklist de verificação
- Still no meio de cada página (`s + 0.1 s` de cada página) e no último quadro antes do corte.
- Reprova: página cobrindo boca/queixo, palavra cortada na borda (x < 80 ou > 1000), duas páginas juntas, legenda repetindo o texto do CTA, palavra acesa antes da voz.
- Comparar com o V02: [exemplos/criativo-carimbos/](../exemplos/criativo-carimbos/) (quadros 262 "FAZ", 270 "FAZ DIFERENÇA,", 285 "NÉ?", 294 "CLIQUE").
