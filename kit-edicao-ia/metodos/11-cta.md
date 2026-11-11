# CTA (botão + título + cursor) e faixa de topo

**Quando usar / o que resolve:** fechamento do criativo. Um botão-pílula dourado no topo, que um cursor clica, e um título curto abaixo dele, palavra por palavra na fala ("GARANTA O SEU!"). A faixa de topo (kicker) ocupa o topo vazio antes do CTA, retomando o tema da abertura. Um foco por vez: a faixa sai antes do botão entrar no mesmo lugar.

## Receita rápida
1) Tempos da fala em `analise/words.json` ([02-legendas.md](02-legendas.md)). Achar no áudio o "pop/ding" de UI, se houver (o clique cai nele).
2) No `video.config.ts`:
```ts
cta: {
  label: "SAIBA MAIS",                 // texto do botão que a pessoa fala/pede. Sem preço/prazo inventado
  pillInSec: 9.92,                     // na palavra que anuncia o botão ("Saiba")
  clickSec: 10.22,                     // no ding do áudio (ou ~0.3 s após pillIn)
  pulseSecs: [11.14],                  // pulso extra na última palavra
  socket: { x: 198, r: 60, fillSec: 10.4 },  // encaixe do selo/ícone; null se não houver
  cursor: { from: [1010, 640], showSec: 9.8 },
  headline: { words: words.slice(8), highlight: ["SEU"] },   // as palavras do título, com tempo de fala
},
faixaTopo: { text: "SEU LOGO EM RELEVO", highlight: ["EM", "RELEVO"], inSec: 8.55, outSec: 9.8 },
legendas: { ..., cutAtSec: 9.995, stopBeforeSec: 10.5 },   // a legenda NÃO repete botão nem título
```
3) Camadas: `<FaixaTopo/>` acima de tudo; `<CtaBotao/>` + `<CtaTitulo/>` → [selo/ícone que cai no encaixe] → `<CtaCursor/>`. Sem selo no meio: `<Cta/>` faz as três.

API: [template/src/kit/cta/index.ts](../template/src/kit/cta/index.ts), [template/src/kit/faixa-topo/index.ts](../template/src/kit/faixa-topo/index.ts). Dados do V02: [template/src/dev/Cta.root.tsx](../template/src/dev/Cta.root.tsx).

## Parâmetros
| prop | default | efeito |
|---|---|---|
| label / labelSize | "SAIBA MAIS" / 92 | texto do botão (cabe ~10 caracteres em 92 px entre encaixe e seta) |
| pillInSec | — | botão nasce: mola de escala 0.62 → 1 em ~0.13 s |
| clickSec | — | cursor chega, botão afunda (sombra dura colapsa), acende e passa a pulsar (halos + brilho a cada 1,5 s) |
| pulseSecs | [] | pulsos extras de brilho, sem elemento novo |
| pill | {540,410,860,168} | centro e tamanho da pílula (px) |
| socket | {x: esquerda+88, r 60} | encaixe escuro; `fillSec` = quando o selo cai (encaixe cresce 10 %) |
| cursor | from [1010,640], showSec click−0.42 | trajetória curva até a seta; `null` = sem cursor |
| headline | null | `{words, highlight?, top 556, size 100, gap 26}`; cada palavra cai em `s` (mola, 1,5 quadro de opacidade) |
| FaixaTopo text / highlight | — | frase curta; palavras de destaque na cor `accent` |
| FaixaTopo inSec / outSec | — | régua abre do centro (0.5 s), texto sobe da máscara (0.36 s); sai em 0.2–0.25 s |
| FaixaTopo y / h / fontSize | 244 / 108 / 94 | posição da máscara (dentro da zona segura) |
| FaixaTopo headroom | "auto" | folga acima da máscara para til/acento (0.26 do corpo se houver Õ, Ã, É...) |

## Como funciona
- Botão em SVG: sombra dura `primary` deslocada (12,14), pílula `accentLight` com borda `ink`, filete claro no topo, seta em círculo `ink`. O "afundar" reduz o deslocamento da sombra e move a face junto.
- Brilho = `drop-shadow` com raio/alfa somando clique (decai e^−4,5t), respiração (seno) e pulsos.
- Cursor: bezier (0.4, 0, 0.15, 1) com desvio senoidal (curva), encolhe 18 % no clique; ondas e 10 faíscas saem da seta.
- Faixa: régua dourada em cima e régua `primaryLight` embaixo; um tick percorre a régua marcando o avanço da frase.

## Armadilhas já vividas
- **Legenda repetida no "GARANTA"**: a frase do título também aparecia na legenda. Regra: uma voz de texto por trecho. Legenda para em `stopBeforeSec` e corta seco em `cutAtSec` (quando "SAIBA MAIS" vira o botão).
- **Botão e faixa no mesmo lugar**: a faixa sai em 9.80 e o botão nasce em 9.92. Nunca sobreponha.
- **Til do Õ cortado pela máscara** (CARTÕES): máscara com `overflow: hidden` da altura da capitular corta o acento. `headroom` (auto) aumenta a máscara PARA CIMA sem mexer na posição do texto.
- **Clique fora do áudio**: o clique tem que cair no "ding" (V02 10.22 s), não na palavra. O pulso da palavra final é só brilho no mesmo botão.
- **Botão ilegível no último quadro**: o CTA fica inteiro até o fim e a câmera volta à escala 1.0 antes dele (botão inteiro na tela).
- **Selo/ícone por baixo do botão**: o ícone precisa ficar entre `CtaBotao` e `CtaCursor`; por isso as peças são separadas.
- Sem preço, prazo, "promoção" ou escassez que o usuário não deu.

## Checklist de verificação
- Stills: pillIn + 0.15 s (botão inteiro), clickSec + 0.05 (afundado + ondas), cada palavra do título + 0.1 s, último quadro.
- Faixa: inSec + 0.4 s (texto inteiro, régua aberta) e outSec + 0.1 s (saindo, nada sobre o botão).
- Reprova: texto do botão saindo da pílula, título repetido na legenda, cursor parado longe da seta no clique, acento cortado, faixa e botão juntos.
- V02 de referência: quadros 262/294 (faixa), 305 (botão + cursor), 325/335 (título entrando), 350 (estado final).
