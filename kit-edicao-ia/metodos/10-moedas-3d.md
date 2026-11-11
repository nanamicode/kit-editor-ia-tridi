# Moedas 3D flutuantes
**Quando usar / o que resolve**: dar profundidade à cena da apresentadora recortada. Selos/moedas de metal 3D flutuam atrás e na frente dela com paralaxe de câmera real (planos longe andam menos), e "pulam" nas palavras-chave. Reaproveita o `GoldSeal` do selo3d.

## Receita rápida
1. Precisa da pessoa recortada (matte com alfa) para ter "atrás" e "frente". Sem recorte, use só `layer="back"`.
2. `video.config.ts`:
   ```ts
   moedas3d: {
     back:  { fromSec: 7.95, toSec: 12.074, parallaxOriginSec: 7.8 },  // sem coins = V02_COINS_BACK
     front: { fromSec: 8.7,  toSec: 12.074, parallaxOriginSec: 7.8 },  // sem coins = V02_COINS_FRONT
   }
   ```
   Para vídeo novo, passe `coins` próprios e sincronize `pops` com os tempos das palavras (s absolutos, da transcrição).
3. Montagem (ordem das camadas importa):
   ```tsx
   import { FloatingCoins } from "./kit/moedas3d";
   <Fundo/> <FloatingCoins layer="back" {...cfg.moedas3d.back}/> <PessoaRecortada/> <FloatingCoins layer="front" {...cfg.moedas3d.front}/>
   ```
4. Still: `cd template && npx remotion still src/dev/Moedas3D.ts Moedas3D --frame=300 --gl=angle --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" ../../analise/review/kit_3d_moedas_f300.png`
5. Antes de montar o vídeo todo, renderize 5 s em MP4 (`--frames=240-389`, ou o trecho real) e assista a paralaxe e os pops.

## Parâmetros
| prop | default | efeito |
|---|---|---|
| coins | V02 da camada | lista de moedas (abaixo) |
| fromSec / toSec | (obrigatórios) | vida da camada. Entrada = fromSec + delaySec |
| layer | "back" | escolhe o conjunto padrão. A posição na pilha é você quem define |
| parallaxOriginSec | fromSec | origem da deriva de câmera (use o mesmo valor nas 2 camadas) |
| parallax | 1 | amplitude da deriva (0 = parada) |
| color / tint | accent / primaryLight | metal e reflexo da marca |
| light | 0.82 | luz (V02: dourado saturado, sem lavar) |
| envIntensity | 0.8 | reflexo do estúdio |
| heat / heatMax | 0.16 / 0.45 | brilho emissivo base e teto (novo: o teto impede o estouro para creme nos pops) |
| icon | estrela 5 pontas | igual ao selo3d (`{type:"svg", d}` para logo) |
| dropShadow | true | sombra CSS na cena de baixo |

**Coin**: `x, y` (centro px) · `size` (diâmetro px) · `depth` (-3.2 longe … 1.8 perto; atrás da pessoa use < 0, na frente > 0) · `delaySec` · `pops?: number[]` · `tiltX, swing, period, phase, bob` (flutuação) · `leave?: {t0, t1, to:[x,y]}` (voa para fora e some).

V02 atrás: 410 px (150,1120), 256 (965,1040), 164 (905,470, sai em 9.5), 116 (170,420, sai em 9.55). Frente: 144 (980,1500), 80 (92,505, sai em 9.5).

## Como funciona
- Uma câmera perspectiva (fov 30, z 9.4) deriva devagar (seno + avanço linear). Cada moeda fica no plano `depth`, e `x, y, size` em px são convertidos para mundo com os px por unidade **daquele plano**. Por isso a moeda aparece onde você pediu e a paralaxe sai física.
- Entrada por `spring` (damping 11). Pop = tranco de escala de 22% + balanço amortecido em y. Flutuação = senos com período e fase próprios (nada se move em uníssono).
- Cada camada é um `ThreeCanvas` transparente com `SealLights` mais baixas (0.82) e sem sombras projetadas (custo).

## Armadilhas já vividas
- 2 camadas = 2 canvases = cerca de 2x o custo por quadro em software (cerca de 3 a 6 s por quadro com 4+2 moedas). Mantenha até cerca de 6 moedas na tela.
- Moedas iguais, no mesmo tamanho e girando juntas = "cara de IA". Varie size (3 escalas), depth, period e phase.
- Moeda grande na frente do rosto: proibido. As da frente ficam pequenas (≤ 150 px) e nos cantos, fora do rosto e da legenda.
- **Lavar para creme no fim** (revisores): vinha de luz + emissivo somados nos pops. Agora `heatMax` 0.45 por padrão (não altera o V02, cujo pico é cerca de 0.3). Se ainda lavar, use `light: 0.75`.
- A saída (`leave`) precisa terminar antes de um título entrar no mesmo lugar (no V02, antes do botão em 9.92).
- O selo que estampa o botão do CTA não está aqui: ele pertence ao módulo do CTA.

## Checklist de verificação
- Quadro de entrada (fromSec+0.3): moedas crescendo em tempos diferentes, nenhuma cortada na borda de forma estranha.
- Quadro cheio (cerca de 1.5 s depois): as de trás são escondidas pela pessoa nos cabelos/ombros (o recorte passa por cima), as da frente ficam sobre ela sem cobrir o rosto.
- Pop: só na palavra certa (confira na transcrição), sem estourar para branco.
- Reprova: moeda sobre o rosto ou sobre a legenda; todas girando em fase; dourado virando creme; moeda da frente atrás da pessoa (ordem das camadas trocada).
