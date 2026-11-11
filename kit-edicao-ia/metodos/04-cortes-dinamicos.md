# B-roll com cortes dinâmicos (footage, câmera, punch-in, tremor)

**Quando usar / o que resolve:** abrir o criativo com uma sequência rápida de planos de produto (3 a 8 clipes de 0,9 a 1,6 s), cada um com speed-ramp, punch-in no instante da pressão, tremor no impacto e foco no resultado. Tudo sai de **dados** (`clips: BRollClip[]`): nada de reescrever componente.
Componente: `<BRollSequence>` em [template/src/kit/broll/](../template/src/kit/broll/index.ts). Rótulos e HUD: [03](03-rotulos-hud.md). Transições: [05](05-transicoes.md).

## Receita rápida
1. Medir: `python scripts/analisar_video.py originais/broll.mp4 --saida analise/` (o resumo impresso já traz `cortes` e `onsets`).
2. Montar os clipes a partir de `analise/analise.json`:
   - `planos` = `[[ini, fim], ...]` → um clipe por plano: `fromSec = ini`, `toSec = fim`.
   - `onsets[].t` = cliques do carimbo no áudio → `pressSec` = o **primeiro onset dentro de `(fromSec + 0.15, toSec - 0.3)`**. Sem onset no plano: omita `pressSec` (o clipe toca linear, sem punch nem tremor).
   - Plano curto demais (< 0,8 s) ou sem produto: descarte ou junte ao vizinho.
3. `focus` (ponto do carimbo) e `relief` (caixa do resultado), em 0..1 do quadro de origem: **uma** folha com o quadro de cada pressão e o do fim de cada plano:
   `python scripts/folha.py imgs ...` ou `ffmpeg -ss <pressSec> -i broll.mp4 -frames:v 1 p1.png`. Estime u,v a olho (0,5 = centro). Sem relevo visível: omita `relief` (default = em volta de `focus`).
4. Escolher o `mode` por clipe (tabela abaixo) e preencher `video.config.ts`:
```ts
broll: {
  src: "broll.mp4", srcFps: 24000 / 1001, srcWidth: 1080, srcHeight: 1080, startSec: 0,
  clips: [
    { fromSec: 0, toSec: 1.3, mode: "full", title: "SEU LOGO\nEM RELEVO", support: "RELEVO SECO NO ENVELOPE",
      pressSec: 0.47, focus: [0.49, 0.42], relief: { u: 0.4, v: 0.46, w: 0.34, h: 0.13 } },
    { fromSec: 1.3, toSec: 2.83, mode: "card", title: "ADESIVOS", support: "RELEVO NO PAPEL ADESIVO", pressSec: 1.6 },
  ],
}
```
5. Montador: `<BRollSequence {...cfg.broll} />` direto no `AbsoluteFill` raiz (sem `<Sequence from>`; use `startSec`). Duração: `brollEndSec(clips, startSec)`.
6. Conferir: `npx remotion still src/dev/BRoll.ts BRoll --frame=N ...` (V02 de referência) ou stills do `Video` no quadro P+2 de cada clipe (pressão) e no meio do hold.

**Escolha do modo** (alternar; nunca 2 caixas iguais seguidas):
| mode | quando | visual |
|---|---|---|
| `full` | gesto grande e centrado, gancho (1º clipe), produto que enche o quadro | tela cheia, câmera segue o carimbo |
| `card` | objeto pequeno que pede contexto, fundo poluído | cartão inclinado com moldura de acento; fundo = o próprio clipe borrado + grade |
| `strip` | assunto horizontal (cartão, guardanapo, envelope deitado), fundo branco | faixa sangrada com filetes; fundo borrado |
V02: full, card, strip, card, full, strip.

## Parâmetros (BRollClip)
| campo | default | efeito |
|---|---|---|
| `fromSec`/`toSec` | — | trecho do arquivo-fonte |
| `durSec` | `toSec-fromSec` | duração na composição (corte a corte) |
| `mode` | `"full"` | ver tabela |
| `pressSec` | — | instante-fonte da pressão: punch-in (z 1→1,32), tremor 13 q, anel de impacto, colchetes e vinheta em P+7 q |
| `focus` | `[0.5,0.5]` | ponto do carimbo (anel e câmera) |
| `relief` | em volta de `focus`, w .3 h .22 | caixa do resultado: colchetes, vinheta, luz rasante no hold, centro da íris |
| `ramp` | automático | `[[t, src], ...]` t = s desde o corte; depois do último ponto congela (hold) |
| `camera` | automático | `[{t,u,v,z}, ...]` t = s desde o corte |
| `tilt` | -2,2 / 1,9 alternado | inclinação do `card` |
| `spot` | full/strip .3, card .2 | força da vinheta (fundo branco: .1) |
| props do `BRollSequence` | `srcFps` 30, `srcWidth/Height` 1080, `startSec` 0, `grain` .14, `id` "bl" | fonte de qualquer proporção (u,v sempre 0..1) |

## Como funciona
- `planClips()` converte segundos em quadros: corte de cada clipe = soma das durações; pré/pós-roll vem da transição ([05](05-transicoes.md)).
- Speed-ramp automático (padrão do V02): aproxima a ~1,35x até 0,06 s antes da pressão, desacelera até P, slow-mo de 0,23 s após P, acelera ~2,2x até perto de `toSec` e **congela** (hold) até o próximo corte, deixando ≥6 q para a luz rasante varrer o relevo. Cada trecho é uma `<Sequence trimBefore playbackRate>`; hold = `<Sequence freeze>`.
- P (quadro da pressão) = onde o ramp passa por `pressSec` (inversão). R = P + 7 q (relevo aparece).
- Câmera automática: chaves [corte, P-4, P, P+10, hold, saída]; z [1, 1.12, 1.32, 1.26, 1.24, 1.36]; u,v vão de perto do centro → `focus` → `relief`. Em `full` o punch é ×0,6 (já parte de 1,86x); em caixa ×0,82.
- Tremor: decaimento exponencial (`hash`, determinístico), amplitude 18 px (full) / 12 px (caixa), folga de 36/24 px para não revelar borda.

## Armadilhas já vividas
- Tempo de roteiro ≠ tempo real: use sempre `planos`/`onsets` medidos. Clique do carimbo no áudio é o melhor sinal de pressão.
- `ramp`/`camera` explícitos só para fidelidade a um corte aprovado (ver `V02_CLIPS` em [template/src/dev/BRoll.root.tsx](../template/src/dev/BRoll.root.tsx)). Para vídeo novo, comece pelos defaults e ajuste só `focus`/`relief`.
- Dupla exposição em slow-mo: o blend de quadros só liga com `rate < 0.3`. Não force ramp mais lento que isso.
- Ramp que termina colado no corte quebrava o `interpolate` da luz rasante (`[232,232]`); hoje há guarda e ≥6 q de hold, mas mantenha o último ponto do `ramp` ≥ 0,2 s antes do fim.
- Fundo das caixas preto/vazio parecia "cara de IA": o fundo é o próprio clipe borrado (`BgFill`) + grade. Não troque por degradê.
- Fonte não quadrada: passe `srcWidth/srcHeight`; a escala base recalcula a cobertura. Sem isso aparece borda preta.

## Checklist de verificação
- Quadro P+2 de cada clipe: anel nasce no carimbo (não no vazio); tremor sem borda preta.
- Meio do hold: colchetes fecham sobre o relevo; luz rasante visível; nada cobre o resultado.
- Cada clipe: produto/gesto inteiro na tela; rótulo não cobre o relevo (se cobrir, mova `relief`/câmera para cima, nunca o rótulo).
- Reprova: borda do vídeo aparecendo, pressão fora de sincronia com o clique (> 2 q), dois `card` seguidos, caixa vazia.
