# Transições nos cortes do B-roll (whip, flash, íris, glitch, wipe)

**Quando usar / o que resolve:** cada corte do B-roll ganha uma transição curta (3 a 9 quadros) com função: virar a página, marcar impacto, nascer do resultado. Faz parte do `<BRollSequence>` ([04](04-cortes-dinamicos.md)); escolhe-se por clipe com `transitionIn`.

## Receita rápida
1. Os cortes vêm dos dados (`fromSec/toSec`/`durSec` de cada clipe, tirados de `planos` do `analise.json`). Não há tempo de transição para preencher: ela se ancora no corte.
2. Sem `transitionIn`, o ciclo padrão é whip → flash → iris → glitch → wipe (o do V02). Para mudar, ponha no clipe que **entra**: `{ ..., transitionIn: "iris" }`.
3. Regra de escolha:
| transição | use quando | evite |
|---|---|---|
| `whip` | troca de assunto/página, 1º corte (dá ritmo) | dois whips seguidos |
| `flash` | o clipe que entra começa já no gesto (corte de impacto) | fundo muito claro (lava) |
| `iris` | o clipe anterior termina com o relevo pronto e centralizado (nasce dele) | `relief` mal posicionado: a íris abre no vazio |
| `glitch` | corte seco entre planos parecidos | mais de 1 por vídeo |
| `wipe` | último corte, antes do encerramento | — |
| `cut` | ritmo já cheio, ou fala por cima | — |
4. Still no quadro do corte e corte±2 de cada transição (folha única).

## Parâmetros
| transição | janela (q a 30 fps, relativo ao corte C) | pré-roll do clipe que entra / pós-roll do que sai | efeito |
|---|---|---|---|
| `whip` | C−4 … C+5, `EASE.whip` | −4 / +5 | os dois clipes deslizam 1080 px; blur horizontal até 90 px pela velocidade; grade de fundo em paralaxe (`world`) |
| `flash` | C−2 … C+2 | 0 / +2 | clarão `tint(accentLight,.55)` [0,.3,.5,.22,0]×.8; RGB-split 26 px em C±1; sai com soco 1→1,12, entra 1,16→1 em 10 q |
| `iris` | C−4 … C+5, `EASE.inOut` | −4 / +8 | círculo até 1700 px a partir do relevo do clipe anterior (posição de tela no quadro C) + 1 anel `accentLight` 12→3 px |
| `glitch` | C−2 … C+2 | 0 / +1 | displacement por faixas (feTurbulence 0.0006×0.03, até 40 px) + RGB 9 px em C±1; entra com escala 1,07→1 |
| `wipe` | C−4 … C+3, `EASE.inOut` | −4 / +7 | aresta diagonal (inclinação 420 px) revela da esquerda p/ direita; linhas `accentLight` 14 px + `text` 4 px |
| `cut` | — | 0 / 0 | corte seco |
Constantes em `TRANSITION_ROLL` ([plan.ts](../template/src/kit/broll/plan.ts)); escalam com o fps.

## Como funciona
- `layerFx(i, frame)` devolve o estilo da camada do clipe i (translate/scale/clip-path/filter) somando a transição de **entrada** e a de **saída**. A camada só existe entre `enter` e `exit` (pré/pós-roll acima).
- O clipe posterior é desenhado por cima; durante o pré-roll ele segura o 1º quadro do ramp (hold).
- Filtros SVG (`<FilterDefs>`) têm ids prefixados (`id`, default "bl") e atributos recalculados por quadro. RGB/rasgo são aplicados só na **imagem** (camada da câmera), no máximo 3 quadros por corte: rótulo e HUD ficam legíveis.
- Overlays (clarão, anel, aresta) ficam acima de tudo, abaixo só do grão.

## Armadilhas já vividas
- Glitch/RGB no quadro inteiro deixava o rótulo ilegível: o filtro vai só no `CamLayer` e por ≤3 q.
- Selo recortado com aro duplo na íris escondia o gesto: hoje é um círculo limpo + 1 anel. Não acrescente dentes, degradê ou segundo aro.
- Íris abrindo fora do relevo: o centro vem de `relief` do clipe **anterior**. Corrija o `relief`, não a transição.
- Rótulo "top" não é recortado pela transição (fica fora da camada). Por isso o último clipe entra com o rótulo 2 q antes do corte (`label.inSec: -0.0667`) sem parecer solto: a máscara do rótulo abre junto com o wipe.
- Dois B-rolls no mesmo quadro (raro) colidem ids de filtro: passe `id` diferente.
- Nada de CSS transition/animation: tudo é função do quadro (`prog`/`interpolate`).

## Checklist de verificação
- Quadro C de cada transição: sem quadro preto/vazio entre clipes; whip com blur só horizontal.
- Íris: o círculo nasce em cima do relevo pronto do clipe anterior.
- Flash: clarão ≤ 3 q, não estoura o rótulo do clipe que entra.
- Glitch/RGB: no máximo 3 q, rótulo legível.
- Reprova: borda do vídeo aparecendo no whip, transição igual em cortes seguidos, overlay cobrindo o rótulo depois do corte.
