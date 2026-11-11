# Rótulos cinéticos e HUD do B-roll

**Quando usar / o que resolve:** dizer em 1-2 palavras o que cada plano mostra (título) + o benefício (linha de apoio), e mostrar progresso (contador 01/06 + barra segmentada) para segurar a atenção na abertura. Vem junto com o `<BRollSequence>` ([04](04-cortes-dinamicos.md)); também exportado avulso como `<KineticLabel>` e `<Hud>`.

## Receita rápida
1. Por clipe, no `video.config.ts`: `title` (maiúsculas, ≤ 14 letras por linha, `"\n"` para 2 linhas) e `support` (≤ 24 letras). Texto vem do briefing aprovado, nunca inventado.
2. Não mexa em posição: o padrão aprovado é **esquerda, ancorado pela base, igual em todos os clipes** (y 1500 em `full`, 1585 em `card`/`strip`). O usuário pediu consistência: não alterne lados.
3. Último clipe com algo entrando por cima (selo 3D, CTA): `label: { layer: "top" }` (já é o default do último).
4. HUD: ligado por padrão (`hud`), contador = nº de clipes. Desligar: `hud={false}`. Mover: `hudY` (default 252, abaixo da UI do Reels).
5. Still do quadro corte+8 de cada clipe (rótulo inteiro) e corte+3 (entrando).

## Parâmetros
| campo | default | efeito |
|---|---|---|
| `title` | — | 1-2 linhas, fonte display da marca, placa `ink` + barra `accent` |
| `titleSize` | auto 96..156 (2 linhas: ≤132) | corpo px; mínimo forçado 84 |
| `support` | — | placa `accent`, texto `ink`, Montserrat 800 |
| `supportSize` (prop do BRollSequence) | 52 | corpo da apoio; mínimo forçado 44 |
| `label.side` | `"left"` | `"right"` existe, mas é desaconselhado (quebra a consistência) |
| `label.y` | full 1500 / caixa 1585 | BASE do bloco em px |
| `label.inSec` | 0,1 (1º clipe −0,267: já pronto no quadro 0) | s relativo ao corte do clipe |
| `label.outSec` | −0,233 | s relativo ao PRÓXIMO corte |
| `label.layer` | `"clip"`; último: `"top"` | `top` = zIndex 40, acima de overlays irmãos |
| `hud` / `hudY` | true / 252 | HUD |

## Como funciona
- Placa e texto dividem **uma** máscara (`clip-path: inset`) com o mesmo progresso (6 q, `EASE.out`): a placa nunca aparece sem texto. As letras sobem de dentro da máscara (mola, +0,3 q por letra) e já chegam a ~40% da subida no 1º quadro.
- Saída: corte seco pela máscara em 5 q + 70 px de deslize; linhas saem em cascata (2 q).
- `headroom` = 26% do corpo acrescentado **acima** da linha: til de "Õ/Ã" e acento de "É" ficam dentro da placa.
- Rótulo `clip` vive dentro da camada do clipe: participa do whip, da íris e do wipe. Rótulo `top` fica fora (não é recortado pela transição).
- HUD: segmento i enche do corte i ao corte i+1; o número troca em "slot" (6 q) após o corte; some nos últimos 11→3 q.

## Armadilhas já vividas
- Caixa vazia antes do texto: placa e letras tinham máscaras separadas. Correção já aplicada (máscara única + letras adiantadas 5 q). Não separe.
- Til do "Õ" cortado pelo topo da máscara: resolvido com `headroom`. Se trocar a fonte display, confira "CARTÕES" num still.
- Apoio pequena demais (~28-30 px numa versão antiga): hoje 52 px com mínimo 44. Texto longo demais não encolhe: reescreva a apoio (≤ 24 letras cabem em 920 px).
- Rótulo do último clipe "lavado" pelo escurecimento/flash do selo 3D: precisa `layer: "top"` **e** nenhum ancestral do `BRollSequence` com `transform`, `opacity`, `filter` ou `isolation` (isso cria stacking context e prende o zIndex 40 abaixo do overlay). Câmera do montador: envolva só a cena da fala, nunca o B-roll.
- Modo vertical (título girado −90°) foi removido: lia mal e quebrava a posição fixa.
- Rótulo sobre o relevo: mova o enquadramento (`relief`/`camera`), não o rótulo.

## Checklist de verificação
- Corte+3: placa abrindo já com letras. Corte+8: título e apoio inteiros, acentos e til visíveis.
- Todos os clipes com o rótulo na mesma posição (esquerda, mesma base por modo).
- Contador correto (01/NN … NN/NN), barra do clipe atual em `accentLight`.
- Último clipe: rótulo pleno sobre o overlay que entra por cima (testar com o módulo do selo montado).
- Reprova: placa vazia, acento cortado, rótulo trocando de lado, apoio < 44 px, texto sobre texto.
