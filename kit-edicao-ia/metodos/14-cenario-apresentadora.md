# Cenário da apresentadora (pessoa recortada + cartão + câmera)

**Quando usar / o que resolve:** a cena de fala com a pessoa recortada sobre um cenário da marca (tinta, luz que respira, anéis, cartão editorial), com texto ATRÁS dela (oclusão real), zoom lento e “socos” de câmera nos picos de fala. Precisa do recorte pronto (metodos/06).

## Receita rápida
```tsx
// video.config.ts
import matte from "./<video>.matte.json";
export const apresentadora = {
  matte, matteDir: "<video>/matte", plateDir: "<video>/plate",
  fromSec: 7.6, toSec: 12.074,      // janela da cena (s de composição)
  liveSec: 8.64,                    // até aqui congela no 1º quadro nítido (omitir = sharpFrom do json)
  personInSec: 7.88, cardInSec: [7.78, 8.22],
  punches: [{ t: 8.9, a: 0.022 }, { t: 10.4, a: 0.03 }],   // picos de fala (camera interna + pulso da luz)
  darkenSec: [11.3, 12.07],         // a fonte escurece no fim? o cenário acompanha (null = não)
};
export const cameraApresentadora = { push: { in0: 8.15, in1: 10.45, out0: 10.45, out1: 11.1, amount: 0.05 },
  punches: [{ t: 9.42, a: 0.03, rot: -0.55 }, { t: 9.68, a: 0.034, rot: 0.6 }] };
// Video.tsx
<PresenterCamera {...cfg.cameraApresentadora}>
  <Presenter {...cfg.apresentadora} overlay={<Legendas .../>}>
    <PalavraGigante ... />          {/* filhos = ATRÁS da pessoa */}
  </Presenter>
</PresenterCamera>
```
Teste: `cd template && npx remotion still src/dev/Apresentadora.ts Apresentadora --frame=270 --gl=angle --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" ../review/apres_f270.png`. A composição `ApresentadoraV02` mostra o visual antigo para A/B.

## Parâmetros
| prop | default | efeito |
|---|---|---|
| `matte` / `matteDir` | — | json do recorte e pasta em `public/` com `m0001.png…` |
| `fromSec` / `toSec` | — | janela; fora dela o Presenter não desenha nada |
| `liveSec` | sharpFrom | fim do “congelado respirando” |
| `fileOffsetSec` | 0 | tempo de composição − tempo do arquivo (cena que não começa no mesmo relógio do bruto) |
| `personInSec` / `cardInSec` | from+0.28 / [from+0.18, from+0.62] | entradas (mola de baixo; cartão sobe e o eco dourado se desenha) |
| `card` | `CARD_DEFAULT` | `{x0,x1,top,rTL,chamfer,bottom}`; `top` na altura do peito; `false` sem cartão |
| `punches` | [] | `{t,a}` socos de escala (a 0.015–0.03) e pulso da luz |
| `darkenSec` | null | vinheta + cartão escurecem junto com a fonte |
| `person.edge` | blur 0.8, slope 1.25, intercept −0.1 | borda do alfa (V02: 1.0/1.7/−0.32 = dura) |
| `person.rim` | accent 0.16, cool 0.12, width 1.6 | rim de luz; 0 desliga (V02: 0.38/0.30) |
| `person.maxGain` | 1.4 | teto da exposição vinda do json |
| `person.glow` / `shadow` / `grain` | 0.36 / 0.5 / 0.08 | contraluz atrás, sombra projetada, grão |
| `person.baseScale` / `zoomGain` / `z` | 1.1 / 0.06 / 0.6 | tamanho, zoom lento ao longo da cena, paralaxe |
| `behind`/`children`, `front`, `overlay` | — | atrás da pessoa / na frente dentro da câmera / fora da câmera |
| `plateDir` + `plateSec` | — | plate limpo em tela cheia nesse intervalo (volta à tela cheia) |
| `PresenterCamera.push` | null | `{in0,in1,out0,out1,amount}`: sobe, segura, volta a 1.0 |
| `PresenterCamera.punches` | [] | `{t,a,rot}` socos com rotação (cortes de frase) |

Peças soltas (mesmas props): `<PersonCutout>`, `<BackdropInk>`, `<EditorialCard>`, `<EditorialBackdrop>`, `<PlateFrame>`; funções `paralaxe(t,z,t0)`, `punchAt`, `matteIndexAt`.

## Como funciona
- O PNG do quadro vem de `round((t − fileOffset − firstFileTime)·fps) + 1`, travado em `[sharpFrom, count]`: sincroniza com a fala mesmo com fps diferente (23.976 → 30).
- A pessoa é uma camada acima do texto de `behind`; o alfa recorta as letras (oclusão real). Um filtro SVG faz borda, exposição, grão, rim, contraluz e sombra a partir do próprio alfa.
- Paralaxe: uma câmera virtual (z 9.4, fov 30) desloca cada plano conforme a profundidade (fundo −6, cartão −1.6, pessoa 0.6, palavra gigante −2.2): dá profundidade sem 3D.
- Duas câmeras: a interna (socos de fala, só escala) e a externa `PresenterCamera` (push + socos com rotação + deriva lateral só quando há escala sobrando, então a borda nunca aparece).
- Cores: `primary` (cartão e luz), `primaryLight` (anéis), `accentLight` (eco do cartão e rim), `ink` (fundo); relevos e luzes são tons derivados com `tone()`.

## Armadilhas já vividas
- **“Adesivo” com fio dourado**: rim 0.38 + borda 1.7 deixavam contorno duro. Defaults novos são sutis; para separar cabelo escuro do cartão use `glow`, não rim.
- **Rosto ceroso no fim**: não suba `maxGain` acima de 1.5; use `darkenSec` para o cenário escurecer junto com a fonte.
- **Texto atrás da pessoa** sempre em `behind`/`children`. Máscara falsa por cima não acompanha cabelo nem gesto.
- **Cartão ou botão encostado na borda** durante o push: a câmera externa precisa voltar a 1.0 (`out1`) antes do CTA.
- Socos só em picos reais de fala (medir no áudio/legenda), 2-5 por cena; `a > 0.035` parece câmera tremida.
- Duas instâncias de `<PersonCutout>` na mesma tela: passe `filterId` diferente.
- Entrada de cena por overlay (selo 3D) cobre os primeiros ~0.3 s: o fundo faz fade de `fromSec` até +0.5 s; não antecipe a pessoa antes de o overlay abrir.

## Checklist de verificação
- Stills: entrada (personInSec+0.3), palavra atrás da cabeça, cada soco, quadro mais escuro do fim, e 1 quadro da composição `ApresentadoraV02` no mesmo tempo para A/B.
- Fundo claro e escuro: `RecorteClaro` / `RecorteEscuro` (metodos/06).
- Reprova: contorno duro/fio dourado; rosto cortado pela borda no pico do push; letra de `behind` passando NA FRENTE do cabelo; cartão com borda aparecendo durante soco; pele cerosa/ruidosa no fim; congelado visível depois de `liveSec`.
