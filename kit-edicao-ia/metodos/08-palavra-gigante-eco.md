# Palavra-chave gigante com eco

**Quando usar / o que resolve:** dar peso à palavra que carrega a mensagem (DIFERENÇA, GARANTA) no instante em que é dita. Fica ATRÁS da pessoa recortada, logo acima da cabeça: o cabelo oclui a base das letras (profundidade real). 3 ecos em contorno empilhados para cima criam a trilha de movimento. Visual aprovado pelo usuário no V02: **não mude o desenho, só os dados**.

## Receita rápida
1) Escolher 1–2 palavras-chave do vídeo inteiro (nunca mais de uma por vez). Tempos vêm do `words.json` (ver [02-legendas.md](02-legendas.md)).
2) No `video.config.ts`:
```ts
import { gigantePelaFala } from "./kit/palavra-gigante";
palavraGigante: {
  items: [
    gigantePelaFala(words, "diferença", { fontSize: 236, spacing: 2 }),                      // cheia
    gigantePelaFala(words, "garanta", { outline: true, fontSize: 250, spacing: 3, holdSec: 0.22 }), // contorno
  ].filter(Boolean),
  parallax: { z: -2.2, t0Sec: 7.8 },   // se a cena tem a deriva de câmera do Presenter; senão null
}
```
3) Ordem das camadas: fundo/cartão → `<PalavraGigante/>` → pessoa recortada → legendas. Still no meio de cada palavra.

API: [template/src/kit/palavra-gigante/index.ts](../template/src/kit/palavra-gigante/index.ts). Dados do V02: [template/src/dev/PalavraGigante.root.tsx](../template/src/dev/PalavraGigante.root.tsx).

## Parâmetros
| prop | default | efeito |
|---|---|---|
| items[].text | — | maiúsculas com acento, sem pontuação |
| items[].inSec / outSec | — | letras entram (1,4 quadro entre letras) / fecham em ordem inversa (0,5 quadro) |
| items[].outline | false | só contorno 6 px. Use quando outro texto limpo já mostra a palavra |
| items[].fontSize | 240 | V02: 236 (9 letras), 250 (7 letras). Largura útil ~1000 px |
| items[].baseline | 900 | linha de base em px; fica logo acima da cabeça |
| items[].spacing | 2 | espaçamento entre letras |
| echoes / echoStep | 3 / 46 | quantos ecos e distância vertical entre eles (para cima) |
| echoOpacity / echoFalloff | 0.62 / 0.14 | opacidade dos ecos = 0.62 − k·0.14 (k = 1..3 → 0.48, 0.34, 0.20) |
| color | brand.text | cor das letras e dos ecos |
| shadowColor | primary a L 22 % | sombra dura (cheia: opaca, deslocada 7,9; contorno: 62 %, sem deslocamento) |
| parallax | null | `{z, t0Sec}`: mesma deriva da câmera 3D do Presenter (plano atrás em z −2.2) |

`gigantePelaFala(words, palavra, {leadSec=0.1, holdSec=0, ...item})` monta o item: entra 0,1 s antes da fala e sai no fim dela.

## Como funciona
- Cada letra é um span com mola (damping 14, stiffness 210): sobe 70 px, escala 1.18 → 1, gira ±5° alternado; saída em 6 quadros (desce 90 px, easing in-cubic), da última letra para a primeira ("fecha").
- Três camadas por palavra: sombra dura, ecos (contorno 3 px) e a principal. Todas usam a mesma animação por letra, então o eco acompanha a letra.
- A palavra só é montada entre `inSec − 0.1` e `outSec + 0.5`.
- A oclusão pela pessoa não é máscara: é a ordem das camadas (a pessoa recortada fica por cima).

## Armadilhas já vividas
- **Palavra parada como decoração** foi reprovada: cada palavra entra, fica enquanto é dita e sai (troca-fecha). Não deixe duas na tela.
- **Tempo de roteiro ≠ fala**: use os tempos corrigidos (DIFERENÇA fala em 8.90, entra 8.80; GARANTA fala em 10.70, entra 10.62). O Whisper small marcou "diferença" em 8.74: confira com a energia.
- **Duas vozes iguais**: GARANTA gigante é só contorno porque o título do CTA mostra "GARANTA" limpo logo abaixo; com fonte cheia competiam.
- **Altura**: baseline 900 deixa a palavra acima da cabeça com a base ocluída pelo cabelo. Mais baixo, o rosto cobre a palavra; mais alto, bate no botão do CTA (y 326–494).
- O `Ç` desce abaixo da baseline: tudo bem, fica atrás do cabelo.

## Checklist de verificação
- Stills: entrada (in + 0.15 s, letras ainda subindo), meio da fala (palavra inteira + 3 ecos visíveis), saída (out + 0.1 s).
- Reprova: palavra cortada nas bordas, rosto coberto (ordem de camadas errada), ecos sumidos (opacidade) ou descendo em vez de subir, duas palavras gigantes juntas.
- V02 de referência: quadros 270 (DIFER… entrando) e 285 (DIFERENÇA inteira com ecos), 325/335 (GARANTA em contorno).
