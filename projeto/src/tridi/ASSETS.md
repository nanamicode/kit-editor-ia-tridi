# Assets · "A Sacola Lisa" (Carimbos Tridi)

Tudo em `projeto/public/tridi/` (use `staticFile("tridi/...")`). Código em `projeto/src/tridi/`.
Composição de teste registrada: **SacolaTeste** (1920x1200, 30 fps, 90 frames, pasta "Tridi" do Root). A composição **SacolaLisa** ainda não está registrada.

## 1. B-roll real da Tridi (`broll/`), extraído do `originais/tridi/ref1.mp4`
Sem áudio, H.264, 30 fps (1 quadro do original = 1 quadro aqui), 720 px de largura. Recorte feito do topo até acima da legenda queimada, conferido quadro a quadro: nenhum resto de legenda, nenhum flash branco e nenhum quadro de transição.

| Arquivo | Origem (quadros do ref1 / s) | Tamanho, duração | Conteúdo | Uso sugerido |
|---|---|---|---|---|
| `ref1_acai.mp4` | 39–61 / 1,30–2,04 s | 720x920, 23 q (0,77 s) | Carimbo sobe do copo e o "Açaí no Grau" aparece nítido | Prova "BORRACHA SÓLIDA / GRAVADA A LASER" |
| `ref1_acai_still.png` | q 52 / 1,74 s | 720x920 | Quadro mais nítido do logo (pico de nitidez) | Close fixo, zoom lento, fundo do rótulo |
| `ref1_sapore.mp4` | 121–133 / 4,04–4,44 s | 720x960, 13 q (0,43 s) | Sacola amarela "Sapore di Nata": carimbo levanta e revela | Célula "sacola" da grade |
| `ref1_pizza.mp4` | 171–196 / 5,71–6,54 s | 720x960, 26 q (0,87 s) | Panorâmica: caixas kraft, copos "RW Lanches", caixa de pizza "Avenida", "Nick Brasa" | Célula "caixa de pizza" (o fim é o melhor trecho) |
| `ref1_paes.mp4` | 321–332 / 10,71–11,08 s | 720x900, 12 q (0,40 s) | Copo de papel "Sorveteria do Paes" na mão de luva | Célula "copo" |
| `ref1_elaine.mp4` | 360–374 / 12,01–12,48 s | 720x960, 15 q (0,50 s) | Sacola kraft "Delícias da Elaine" diante da parede roxa com o letreiro Tridi | Fecho da prova ou CTA (ambiente da marca) |

Cada clipe tem 4 versões:
- `*.mp4`: cor original (crf 14).
- `*_riso.mp4`: risografia pré-processada (duotone #3A0A6B → #8B00FF → #B48CFF → branco, placa escura desalinhada 3 px, grão). O logo continua legível. Use no mundo roxo, depois da carimbada.
- `*_lento.mp4` e `*_riso_lento.mp4`: cada quadro repetido 2x (0,5x, "stop-motion" a 15 qps, que combina com a colagem). Use quando o trecho precisar de ≥1 s de leitura (sapore, paes e elaine têm menos de 0,6 s).
- `ref1_acai_still_riso.png`: o quadro fixo tratado.

**Privacidade:**
- Pizza: o telefone da caixa "Avenida" ("(67) 9 …") foi borrado com pixelização rastreada, quadro a quadro, de q 184 em diante.
- Elaine: a linha "Chef Elaine Rossi" (nome de pessoa) foi borrada. O nome da marca "Delícias da Elaine" ficou visível, como pede o BRIEFING.
- Os outros clipes não mostram telefone nem nome de pessoa.

**Limites:**
- Os trechos limpos são mais curtos que os tempos do BRIEFING. O ref1 tem chicotes, flashes e a legenda "ÁGIL" sobre a sacola da Elaine em 11,75–12,00 s.
- A fonte é 720p: num cartão de 860 px a imagem fica levemente suave (a borda branca ajuda).
- Pôr o selo "embalagens reais de clientes Tridi" na cena.

## 2. Sons (`sfx/`), todos WAV 48 kHz estéreo
| Arquivo | Origem | Uso |
|---|---|---|
| `hit-madeira-seco-01.wav` | SFX/hit-cta | TUM da carimbada (camada de ataque) |
| `foley-380-table-fist-hits-wood-table-06.wav` | FOLEY | TUM da carimbada (camada de corpo, junto com o de cima) |
| `foley-303-paper-rustle-short-01.wav` | FOLEY | Sacola caindo no balcão (q 0), papel |
| `whoosh-rapido-curto-01.wav` | SFX/whoosh | Sombra do carimbo cruzando o topo, entrada de cartões |
| `pop-bolha-ui-01.wav` | SFX/pop (convertido mono→estéreo) | Corações, cascata de sacolas (subir o pitch com `playbackRate`), células da grade |
| `clique-interface-01.wav` | SFX/clique | Rótulos BORRACHA SÓLIDA / GRAVADA A LASER |
| `riser-sintetico-curto-01.wav` | SFX/riser (3,05 s) | Começa ~3 s antes do TUM e termina exatamente nele |
| `ding-notificacao-correta-01.wav` | SFX/ding | Balão do CTA / "ELES CRIAM" |
| `trilha-cheia.wav` | TRILHA_SEGURA hiphop-02-positivo (Mixkit), 115 s, −4 dB | Depois da carimbada. −16,0 LUFS, pico −2,9 dBTP |
| `trilha-abafada.wav` | A mesma faixa com passa-baixa de 600 Hz (2x 2 polos, ~24 dB/oct), −4 dB | Antes da carimbada. −19,3 LUFS, pico −5,4 dBTP |

As duas trilhas estão alinhadas em amostras: a troca abafada → cheia pode ser um corte seco no mesmo `trimBefore`. Depois da troca, a trilha fica ~3 LU mais alta, e isso é intencional.
Volumes originais (I/TP):
- hit-madeira −20,2 LUFS / −1,9 dBTP
- foley-380 −23,3 / −4,4
- papel −23,6 / −0,5 (baixar)
- whoosh −23,2 / −4,6
- riser −21,3 / −9,7
- ding −23,4 / −10,9
- pop e clique muito curtos para medir I (pico −7 / −6 dBTP)

O mix final ainda precisa de `loudnorm` (alvo −14 LUFS, < −1 dBTP) depois do render.

## 3. Batidas (`src/tridi/beats.json`)
- 96,99 BPM (período 0,61861 s), fase 0,059 s, compasso 4/4.
- Batida k = `0.059 + k*0.61861`. O tempo forte é k % 4 == 0 (0,059 · 2,533 · 5,008 · 7,482 · 9,957 · 12,431 · 14,906 · 17,380 · 19,855 · 22,329 s …).
- Também traz `kicks_s` (picos reais < 150 Hz).
- Faixa de energia constante, sem drop. A carimbada deve cair num tempo forte. Exemplo: TUM em 9,2 s no vídeo → `trimBefore` da trilha ≈ 0,757 s (9,957 − 9,2) para o tempo forte de 9,957 s coincidir com o TUM.
- Método: grade de tempo constante ajustada por mínimos quadrados a 135 onsets graves (resíduo mediano 10,6 ms), conferida no gráfico em 0–8 s e 90–98 s. Não usa librosa.

## 4. Texturas (`tex/`)
| Arquivo | Tamanho | Uso |
|---|---|---|
| `kraft_tile_1024.png` | 1024² **tileável** | Papel kraft (flocos, nuvens, fibras finas direcionais, inclusões). É o padrão da `Sacola` (escala 0,62) e de qualquer recorte kraft |
| `kraft_1080x1920.png` | tela cheia | Fundo kraft da fase sem marca (aplicar `grayscale` + retícula no mundo cinza) |
| `papel_fundo_1080x1920.png` / `papel_fundo_tile_1024.png` | tela / tile | Papel off-white #EAE6DE com fibras (fundo neutro, cartões, balões de papel) |
| `tinta_mascara_tile_1024.png` | 1024² tileável, RGBA branco + alfa | Máscara de "tinta de carimbo" (falhas e porosidade). `mask-image` ou `<mask>` sobre logos, selo "CARIMBADA.", textos carimbados |
| `reticula_tile_256.png` | 256² tileável, pontos pretos sobre transparente (passo 16 px a 45°) | Retícula fina (mundo sem marca). `mask-image` com cor de fundo, ou overlay com `opacity` |
| `reticula_grossa_tile_256.png` | 256² tileável (passo 32 px) | Retícula grossa (fundo roxo da risografia, transições em mosaico de pontos) |
| `reticula_gradiente_1080x1920.png` | tela, pontos crescem para baixo | Sombra em retícula no pé do quadro / balcão |
| `grao_tile_512.png` | 512² tileável, cinza 128 ± ruído | Grão de impressão em `mix-blend-mode: overlay` (≤ 0,25) |
| `tarja_rasgada_preta.png` | 1100x240 RGBA | Tarja preta de papel rasgado com fibra branca na borda, para o "POV: SOU UMA SACOLA SEM MARCA" (pode esticar na horizontal) |
| `ruido_deslocamento_tile_1024.png` | 1024² | Mapa de ruído (R/G) para deslocamento. Reserva, não usado ainda |

Para regerar: `analise/tridi/scripts/tex.py <pasta_saida>`, `clips.py <ref1.mp4> <pasta_saida>`, `beats2.py <trilha.wav> <beats.json>` (Python com numpy, opencv, scipy e soundfile).

## 5. Componentes (`src/tridi/`)
- `theme.ts`: paleta (#8B00FF, #3A0A6B, #B48CFF, branco), fontes Anton/Inter já carregadas (`anton`, `inter`), borda de recorte 12 px, caminhos `TEX.*`, tabelas de duotone `RISO_TABLE` / `CINZA_TABLE`. É o padrão "Tridi Impresso", separado da oferta.
- `useAssetsLoaded.ts`: segura o render (`delayRender`) até as imagens usadas dentro de SVG carregarem. A `Sacola` já usa.
- `LogoDoceDaLu.tsx`: **marca ilustrativa fictícia** "Doce da Lu · brigadeiros" (selo circular de 1 cor, brigadeiro com granulado vazado). Sempre com a etiqueta "marca ilustrativa" na cena.
- `Sacola.tsx`: protagonista. Componente puro (não lê frame): o pai anima por props.
  - `largura` (px; altura = 1,3x; base da sacola em y = 0,926 da altura)
  - `modo`: `"kraft" | "cinza" | "riso"`
  - `olharX`, `olharY` (−1..1; y negativo = para cima), `piscar` (0..1)
  - `expressao`: `neutra | cima | triste | surpresa | feliz | seria`
  - `carimbada`, `tinta` (0..1: entrada do logo no TUM, com leve espalhamento de 1,06 para 1), `corTinta`
  - `simples` (sem filtros, para as dezenas de sacolas da cascata), `sombraChao`, `semOlhos` (figurantes)
  - Borda branca de 12 px de tela em qualquer tamanho. Olhos e logo ficam fora do filtro de cor (tinta com cor exata, multiply). No modo riso, o logo ganha placa escura desalinhada 3 px.
- `SacolaTeste.tsx`: still de aprovação.
  - Frame 0: os 3 estados (lisa-cinza / olhando para cima / carimbada-roxo).
  - Frames 60–66: a tinta entrando.
  - Frames 75–89: painel 1 em kraft natural.
  - Saída aprovada em `analise/tridi/sacola_teste_3estados.png`.

**Desempenho:**
- Cada `Sacola` completa usa 2 `feTurbulence` pequenos (olhos e logo).
- Na cascata, use `simples` + `semOlhos`: só padrão de imagem e formas, barato em CPU.

## 6. Montagem: composição **SacolaLisa** (registrada no Root, pasta "Tridi")
- 1080x1920, 30 fps, 647 frames (21,57 s), sem narração. Código: `SacolaLisa.tsx` (mundos, câmera, transição em retícula, áudio), `sl/tempo.ts` (mapa de frames e batidas), `sl/personagem.tsx` (pose da sacola, brigadeiros, corações, cascata, carimbo), `sl/cenas.tsx` (fundos, textos, prova, grade, objeção, CTA, selos), `sl/ui.tsx` (primitivas).
- `SacolaFig` (240x300) só gera `public/tridi/fig/sacola_fig_{cinza,riso}.png` (figurantes da cascata; frame 0 = cinza, 1 = riso).
- Trilha com `trimBefore` = 23 frames: o tempo forte cai no TUM (frame 276). Silêncios: 183–195 (LISA.) e 267–275 (antes do TUM).
- Áudio final: o mix do Remotion sai em ~−17 LUFS. Masterizar depois do render com `analise/tridi/scripts/master_audio.py <render.mp4> <saida.mp4>` (limitador suave + loudnorm linear, vídeo copiado): −14,1 LUFS, −2,3 dBTP na prévia.
- Stills de conferência: `analise/tridi/scripts/stills.mjs` (copiar para `projeto/` e rodar com `node`; reaproveita 1 bundle).
