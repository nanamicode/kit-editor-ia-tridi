# Selo 3D: transição-estrela
**Quando usar / o que resolve**: virada forte entre duas cenas (B-roll para apresentadora, problema para solução). Um selo de metal 3D cai, estampa, a câmera mergulha até ele cobrir 100% da tela, ele racha nas emendas e estilhaça revelando a cena seguinte. A troca de cena fica escondida embaixo do metal. Use uma vez por vídeo, no ponto de virada.

## Receita rápida
1. Escolha `atSec`: o instante em que o selo cobre a tela toda. A janela vai de `atSec-0.46` a `atSec+0.44`. O impacto cai em `atSec-0.21`: alinhe com uma palavra forte ou com o SFX de batida.
2. No `video.config.ts`:
   ```ts
   selo3d: { atSec: 7.71 }   // V02. Opcionais: icon, color, brightness, flash, restPx, from, durationScale
   ```
3. No montador, coloque o componente **por cima** das duas cenas e corte a cena de baixo dentro da cobertura:
   ```tsx
   import { SealTransition, sealWindows } from "./kit/selo3d";
   const w = sealWindows(cfg.selo3d.atSec);   // coverFromSec..coverToSec = atSec-0.005..atSec+0.121
   // cena A termina em w.coverFromSec+0.02; cena B começa ali. O selo é irmão posterior das cenas.
   <SealTransition {...cfg.selo3d} />
   ```
4. Still (sempre `--gl=angle`, sem GPU):
   `cd template && npx remotion still src/dev/Selo3D.ts Selo3D --frame=232 --gl=angle --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" ../../analise/review/kit_3d_selo_f232.png`
   Quadros com `atSec` 7.71: 222 queda, 226 estampa, 232 cobertura, 234 racha, 235 estilhaços, 238 revelação.
   Outro `atSec`: quadro = round((atSec + offset) * fps), com offset -0.25 / -0.12 / +0.02 / +0.09 / +0.12 / +0.23.
5. **Teste de 5 s renderizado em MP4 antes de montar o vídeo inteiro** (o curso exige; o Studio engana no 3D):
   `npx remotion render src/dev/Selo3D.ts Selo3D --frames=200-269 --gl=angle --browser-executable=... ../../analise/review/selo_teste.mp4`
   Assista e confira o checklist. Só então ligue no `Video.tsx`.

## Trocar ícone e cores
- **Estrela com N pontas**: `icon: { type: "star", points: 6 }` (`inner` 0.3..0.6 afina ou engorda).
- **Logo ou letra (path SVG)**: `icon: { type: "svg", d: "M10 10 L90 10 L50 90 Z", fit: 0.46, depth: 0.12 }`. Só o `d` de um `<path>` (junte vários paths num só `d`). Centraliza e escala sozinho. Logo fino precisa de traço ≥ 6% da largura, senão o bisel come o desenho. Furos (O, A, R) saem certos com subpaths em sentido oposto.
- **Cor do metal**: por padrão vem de `brand.colors.accent`. Os tons acetinado, polido, emissivo e da rachadura derivam dela (`goldTones`), calibrados para dar exatamente o V02 com `#F5C542`. Prata: `color: "#C9CED6"` (testado; metal pouco saturado fica claro, use `relief: 1.4` e `heatMax: 0.4`). Cobre: `"#D9824A"`.
- **Reflexo da marca**: `tint` (padrão `primaryLight`) colore uma tira do estúdio e uma luz fraca.

## Parâmetros
| prop | default | efeito |
|---|---|---|
| atSec | (obrigatório) | instante de cobertura total (s) |
| durationScale | 1 | estica ou encolhe tudo em volta de atSec (0.8 deixa mais seco, 1.2 mais solene) |
| color / tint | accent / primaryLight | cor do metal e reflexo da marca |
| brightness | 1 | luz e reflexo juntos. 0.85 se o metal lavar para creme |
| flash | 1 | clarões aditivos do impacto e da rachadura (0 desliga) |
| heatMax | 1 | teto do emissivo. 0.5 evita estouro no impacto |
| relief | 1 | relevo fino (guilloche) do corpo. 1.4 deixa menos chapado |
| icon | estrela de 5 pontas | ver acima |
| restPx | {x≈586,y≈724,r≈244} | onde e com que raio o selo pousa (px). Não cubra o rótulo da cena A |
| from | "right" | lado de entrada |
| dim | 1 | escurece a cena A em até 30% de `ink` durante a queda |
| crackStyle | "seams" | rachadura nas emendas reais das peças (novo). "radial" = 8 linhas SVG do V02 |
| faceSafe | {540,1130,300,340} | elipse (px) onde o clarão da revelação cai a 12%. `null` desliga |
| shadows | true | sombra dos relevos sobre o corpo. false = cerca de 30% mais rápido |

Utilitários: `GoldSeal` + `SealLights` (selo avulso em qualquer `ThreeCanvas`), `sealGeometry.getSealPieces/getSealCore(icon)/getSealChunks/getSealSeams/svgPathToShapes`, `goldTones(accent)`.

## Como funciona
- `timeline.ts`: offsets medidos no V02 viram uma timeline relativa a `atSec`. `sealState(frame)` é função pura: posição, rotação, squash, split, câmera, flashes. As oscilações usam fase equivalente ao V02, então o movimento é idêntico para qualquer `atSec`.
- Queda de 6 quadros com motion blur SVG proporcional ao deslocamento. No impacto: squash, 2 anéis, 26 faíscas, tremor de câmera e clarão aditivo (`mix-blend: screen`, nunca película opaca).
- Mergulho: dolly de 9.4 para 2.65 com easing in. O selo cobre a tela por cerca de 3 quadros, com o brilho oscilando (esconde a emenda de cena).
- Racha: as linhas nascem nas mesmas emendas serrilhadas (`getSealSeams`) dos 20 estilhaços (3 anéis desencontrados). Depois as peças giram e saem do quadro, e a estrela central sobe pelo topo. Tudo fora do quadro em `atSec+0.35`.
- Metal: `meshPhysicalMaterial` metalness 1 + envMap PMREM procedural (softboxes, gerado 1x por aba) + bump de torno. Sem HDR externo.

## Armadilhas já vividas
- **Sem GPU**: sempre `--gl=angle`. Em software o still custa de 11 a 25 s (bundle incluído; medido 11-24 s). No render, os quadros com o selo custam cerca de 3 a 8 s cada, e a janela tem cerca de 27 quadros. Fora da janela o componente retorna `null` e não custa nada.
- O Studio/still pode mostrar certo e o MP4 sair diferente (motion blur, primeiro quadro sem PMREM). Por isso o teste de 5 s em MP4 é obrigatório.
- `ThreeCanvas` sem `width/height` não renderiza. Nunca `useFrame`: o estado vem todo do frame.
- O selo é overlay. Se ficar dentro de um container com `transform`/`filter` (câmera da cena), ele treme junto: deixe-o como irmão direto das cenas.
- Rótulo/HUD da cena A que precisa ficar visível durante a queda: z-index acima do overlay ou `restPx` mais alto.
- **Estouro para creme** (revisores): vem do emissivo + clarão. Use `heatMax: 0.5` e/ou `flash: 0.7`. Default mantido em 1 para não mudar o aprovado.
- **Moeda chapada em repouso** (revisores): suba `relief: 1.4` e `brightness: 1.1`. Não virou default para não alterar o V02.
- **Raios de luz sobre o rosto na revelação** (revisores): agora `faceSafe` (default ligado) corta o clarão numa elipse em volta do rosto. Ajuste x/y ao enquadramento real.
- **Rachadura desorganizada** (revisores): as 8 linhas radiais do V02 não batiam com as peças. Agora `crackStyle: "seams"` desenha a rachadura presa ao selo, exatamente nas bordas dos estilhaços.
- Ícone SVG com muitos pontos (> 2 mil) deixa o primeiro quadro lento: simplifique o path.

## Checklist de verificação
- Queda (≈atSec-0.25): selo inteiro, de frente, sem mostrar o verso. A sombra antecipa.
- Estampa (≈atSec-0.12): selo legível, anéis e faíscas dentro de cerca de 1.6 raio, não cobre o rótulo nem o título da cena A.
- Cobertura (atSec..+0.1): 100% dourado, sem borda transparente em nenhum canto. A troca de cena acontece aqui.
- Racha/estilhaços (+0.09..+0.15): linhas nas emendas, peças planas legíveis girando para fora.
- Revelação (+0.23 em diante): a cena B limpa, sem peças, véu nem raio sobre o rosto.
- Reprova: canto sem ouro na cobertura; cena A aparecendo depois da troca; flash branco chapado; selo mudando de tamanho aos saltos.
