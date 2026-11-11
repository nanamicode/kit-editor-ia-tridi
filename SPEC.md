# SPEC — "Show de efeitos" no criativo de carimbos (fonte: originais/criativo.mp4)

Raiz do trabalho (WS): esta pasta. Projeto Remotion: `projeto/` (Remotion 4.0.542, React 19, three 0.170, @react-three/fiber 9, @remotion/{media,transitions,three,captions,shapes,effects,google-fonts,layout-utils} já instalados).
Skills em `.claude/skills/` (remotion-best-practices, remotion-markup/*.md incl. 3d.md, effects.md, sequencing.md, color-correction.md, sfx.md, transitions...). LEIA as referências relevantes antes de codar. Regras do CLAUDE.md da raiz valem.

## Mídia de entrada (fatos medidos)
- `originais/criativo.mp4` (copiado p/ `projeto/public/criativo.mp4`): 1080x1080, 24000/1001 fps (≈23.976), 12.074 s, H.264+AAC estéreo. NUNCA alterar o original.
- 0.00–~7.80 s: B-roll **mudo** (áudio ≈ ruído de fundo -35 dB) de carimbos de relevo seco (embossing) sendo usados em objetos reais. Cortes secos (medidos) em: 1.293, 2.836, 4.213, 5.589, 6.840 s. Ou seja 6 clipes: [0–1.293] envelope azul-marinho; [1.293–2.836] adesivo/etiqueta branca; [2.836–4.213] (adesivo em relevo/guardanapo rosé — conferir); [4.213–5.589] selos dourados; [5.589–6.840] envelope verde-água; [6.840–~7.75] cartão branco. Ver `analise/contact.jpg` e `analise/f01..f12.jpg` (1 frame/s, 540px).
- ~7.75–8.00 s: dissolve para a apresentadora (mulher, cabelo cacheado longo escuro, polo roxa, parede roxa lisa). Fala só de ~8.28 a ~11.30 s. Resto até 12.074 é respiro final.
- Fala (Whisper `small` pt, palavras em `projeto/src/data/words.json`, formato {w,s,e} em segundos de ARQUIVO; ler com encoding utf-8): "Faz[8.28] diferença,[8.74] né?[9.42] Clique[9.68] em[9.82] Saiba[9.98] Mais[10.22] e[10.52] garanta[10.70] o[11.00] seu![11.14–11.28]". (Tratar "né?" como ~9.42–9.62.)
- A apresentadora já tem **legenda queimada** (amarelo/branco com contorno preto, faixa y≈790–960 px do quadro 1080x1080, centro-baixo) ao longo de ~8.0–11.4 s. DEVE sumir do resultado final (inpaint nos quadros ou cobertura total por elementos opacos).
- Produto/negócio do usuário: carimbos (Tridixp). O vídeo NÃO cita marca. NÃO inventar preço, prazo, promoção, número, depoimento. Textos de B-roll devem apenas DESCREVER o que se vê (seção Copy).

## Saída
- Composição `Criativo`: **1080x1920, 30 fps, 363 frames** (12.1 s). Entrega final MP4 H.264 + AAC. (Versão quadrada 1080x1080 pode vir depois.)
- Tempo da composição t_comp = tempo do arquivo (mesma linha do tempo; 0 s = 0 s). frame = round(t*30).

## Recorte da apresentadora (contrato do agente PLATE)
- Modelo RVM (onnx CPU) em `modelos/rvm_mobilenetv3_fp32.onnx`; script base `analise/matte.py` (usar `python` SEM -I; pillow/numpy/onnxruntime/torch/soundfile/demucs instalados; `pip install opencv-python-headless` permitido).
- Quadros de origem 1080x1080 a partir de t=7.6s em `analise/src/f%04d.png` (107 quadros, 23.976 fps); mattes RGBA atuais em `analise/matte/m%04d.png` (qualidade ótima, mas: halo roxo leve na borda do cabelo sobre fundo escuro; e contêm a legenda queimada).
- ENTREGAR: `projeto/public/matte/m0001.png … m0107.png` (RGBA 1080x1080, legenda queimada removida, despill do roxo na borda, alfa limpo) e `projeto/public/plate/p0001.jpg … p0107.jpg` (mesmos quadros SEM canal alfa, legenda removida, para usar como plate cheio). Quadro i corresponde ao tempo de arquivo 7.6 + (i-1)*1001/24000 s. Documentar em `projeto/src/data/matte.json` {firstFileTime:7.6, fps:23.976, count:107, w:1080, h:1080}.

## Identidade visual
- Paleta: tinta `#120A24` (fundo), roxo-marca `#7B2FF0` (da parede), violeta claro `#B794FF`, dourado `#F5C542` / `#FFD86B` (selos), marfim `#FFF8E7`, grafite `#1B1230`. Contraste alto, nada de degradê genérico "cara de IA" — usar texturas funcionais (papel, relevo, grão sutil) e luz dourada com função.
- Tipografia (via @remotion/google-fonts): títulos condensados pesados (ex.: Anton / Bebas Neue), apoio Montserrat/Inter 700+. Texto principal ≥ 84 px, apoio ≥ 44 px, margens ≥ 80 px laterais e ≥ 100 px topo/base (video-layout.md). Zona segura de Reels: evitar texto essencial em y > 1560 e y < 230.
- Princípio do curso: cada elemento precisa ajudar a entender; 1 foco por vez; movimento só por useCurrentFrame()/interpolate/spring; NUNCA CSS transition/animation nem useFrame do R3F.

## Copy (propostas — apenas descrevem o que aparece; usuário pode trocar)
- B-roll, um rótulo por clipe, em ordem: "SEU LOGO EM RELEVO" (abertura, 0–1.3) · "ENVELOPES" · "ADESIVOS" · "GUARDANAPOS" (ou o que o frame mostrar — conferir) · "SELOS DOURADOS" · "CARTÕES". Rótulos curtos, entram no corte e saem antes do próximo; linha de apoio opcional ≥44px.
- Apresentadora: legendas palavra a palavra (texto exato acima, maiúsculas, destaque colorido na palavra falada). Ênfase: "DIFERENÇA", "SAIBA MAIS", "GARANTA".
- CTA final (a partir de ~10.0 s): pílula/botão "SAIBA MAIS" com seta/cursor animado + "GARANTA O SEU!" — sem preço ou prazo.

## Linha do tempo criativa (guia, não grilhão)
0.00–7.75 B-roll com CORTES DINÂMICOS: punch-in/zoom sincronizado ao momento de pressão do carimbo, speed-ramp, whip/glitch/flash nos cortes (@remotion/effects e @remotion/transitions), tremor de câmera curto no impacto, rótulos cinéticos. O quadro 1080x1080 vai dentro de moldura/cartão e/ou ampliado a tela cheia (crop) conforme o clipe; o resto da tela vertical é ocupado por elementos funcionais (rótulos, contador de clipes, barra de progresso).
~6.8–8.3 TRANSIÇÃO-ESTRELA: selo dourado 3D (R3F, geometria real: disco com borda serrilhada extrudada, relevo, material metálico, luz) cai/gira/estampa e se abre revelando a apresentadora (ponte B-roll → apresentadora).
8.0–12.07 APRESENTADORA: recorte real (alfa) sobre cenário gráfico roxo/tinta com profundidade: palavras-chave em tipografia grande ATRÁS da silhueta (oclusão real pelo alfa), selos 3D dourados flutuando atrás/à frente com paralaxe, moldura editorial; legendas dinâmicas; CTA no fim.
ÁUDIO: voz original intocada e dominante; trilha + SFX sintetizados (whoosh nos cortes, "thump/chk" de relevo no impacto, riser até a revelação, ding no CTA), sincronizados ao timeline; mix final ≈ -14 LUFS integrado, voz sempre acima da trilha (duck).

## Divisão de arquivos (DONO ÚNICO por arquivo — não editar arquivos de outro agente)
- PLATE: `projeto/public/matte/*`, `projeto/public/plate/*`, `projeto/src/data/matte.json`, scripts em `analise/`.
- AUDIO: `projeto/public/audio/*.wav` (+ `bed.wav` = trilha+SFX sem voz, 48 kHz estéreo, 12.074 s), `projeto/src/data/cues.json` ([{t, tipo, nome}] cortes/impactos/riser/ding), scripts em `analise/audio/`.
- BROLL: `projeto/src/scenes/BRoll.tsx` + `projeto/src/scenes/broll/*`; dev: `projeto/src/dev/BRoll.ts(x)`.
- SEAL3D: `projeto/src/scenes/Seal3D.tsx` + `projeto/src/scenes/seal3d/*`; dev: `projeto/src/dev/Seal3D.ts(x)`.
- CAPTIONS: `projeto/src/components/Captions.tsx` (palavra a palavra, tempo = words.json); dev: `projeto/src/dev/Captions.ts(x)`.
- PRESENTER: `projeto/src/scenes/Presenter.tsx` + `projeto/src/scenes/presenter/*`; dev: `projeto/src/dev/Presenter.ts(x)`.
- INTEGRATOR: `projeto/src/Root.tsx`, `projeto/src/Criativo.tsx`, `projeto/src/index.ts`.
- Cada cena exporta um componente React SEM props obrigatórias, desenhando em 1080x1920 e lendo o tempo de composição via useCurrentFrame() (frame 0 = 0 s do Criativo; a cena se auto-limita à sua janela e fica transparente fora dela se for overlay). Declare no topo do arquivo `export const WINDOW = { fromSec: number, toSec: number }`.
- Dev isolado: cada agente cria seu entry (`src/dev/X.ts` com `registerRoot`) + Root com a composição id `X` (1080x1920, 30 fps, 363 frames) e verifica com:
  `cd projeto && npx remotion still src/dev/X.ts X --frame=N --gl=angle --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" ../analise/review/X_fNNN.png` e LÊ a imagem (Read): o curso manda o agente conferir o próprio trabalho. (O Chrome embutido do Remotion NÃO funciona nesta pasta — caminho longo.) Sem GPU: 3D roda em software; manter geometria leve.
- Typecheck: `cd projeto && npx tsc --noEmit` (erros nos arquivos dos outros agentes podem existir durante o trabalho; corrija só os seus).
- Não rodar `npx remotion render` do vídeo final (é com o INTEGRATOR/usuário). Não rodar `npm install` (deps prontas; se faltar algo crítico, avisar no relatório).
- Acentos: arquivos em UTF-8. Ao ler JSON com acentos use encoding utf-8; ao escrever no console do Windows defina PYTHONIOENCODING=utf-8.
