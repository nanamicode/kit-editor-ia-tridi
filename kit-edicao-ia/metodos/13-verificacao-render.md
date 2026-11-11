# Verificação e render final

**O que resolve:** o agente confere o próprio trabalho antes de entregar (o curso exige isso) e exporta sem cair nas armadilhas de ambiente, gastando o mínimo de leituras de imagem.

## Receita rápida
```bash
# 1) typecheck (rápido; pega erro antes de qualquer render)
cd template && npx tsc --noEmit

# 2) stills dos quadros-chave numa ÚNICA folha (abertura, cada corte, transição 3D, fala, CTA, último quadro)
python ../scripts/folha.py stills --projeto . --entry src/index.ts --comp Video --frames 0,45,100,140,180,214,242,274,320,362 --out ../review/folha.jpg

# 3) prévia no navegador para o usuário (não renderiza)
npx remotion studio --no-open --port 3000      # abrir http://localhost:3000/Video

# 4) render final (só quando o usuário pedir) — em segundo plano
npx remotion render src/index.ts Video ../entregas/<Nome>_V01.mp4 --codec=h264 --audio-codec=aac --gl=angle --concurrency=3 --browser-executable="<chrome>"

# 5) conferir o MP4 de verdade: folha + áudio
python ../scripts/folha.py mp4 ../entregas/<Nome>_V01.mp4 --n 10 --out ../review/folha_final.jpg
python ../scripts/checar_audio.py ../entregas/<Nome>_V01.mp4
```
`<chrome>` no Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`. O `folha.py` detecta o caminho sozinho.

## O que procurar na folha (reprova se houver)
- Legenda cortada, texto sobre texto, legenda cobrindo o rosto, texto fora da zona segura (y < 230 ou > 1560).
- Caixa de rótulo vazia (fundo entrou antes do texto), acento cortado (Õ, É, Ç).
- Rótulos em lados ou orientações diferentes entre clipes.
- Quadro preto ou transparente onde devia ter imagem (falha de 3D: tente `--gl=angle`, depois `--gl=swangle`).
- Recorte com halo, fio claro em volta do cabelo ou mão sumindo. Rosto ceroso por ganho de exposição alto.
- Tempo de leitura: cada rótulo ≥ 0,5 s inteiro e legível. A palavra gigante fica inteira enquanto é dita.

## Números de referência
- Still 1080x1920 com 3D em software: ~10-25 s por quadro. Sem 3D: ~3-6 s.
- Render 12 s (363 quadros) com 3D em software, concurrency 3: ~8-10 min. Arquivo ~24 MB.
- Áudio de entrega: -14 LUFS integrado (±1), true peak ≤ -1 dBTP, voz ≥ 6 dB acima do bed.

## Armadilhas já vividas (Windows)
- **Caminho longo** quebra o Chrome embutido do Remotion (ENOENT). Use o Chrome do sistema (`--browser-executable`) ou uma pasta curta (ex.: `C:\edicao`).
- **3D não aparece** no headless: `--gl=angle`.
- **Disco cheio** derruba o render no meio (ENOSPC). Garanta ≥ 3 GB livres. Apague os quadros temporários do recorte depois de gerar os PNG finais.
- `Config.setVideoImageFormat("jpeg")` no remotion.config.ts deixa o render mais leve. PNG só se precisar de alfa.
- MP4 H.264 não guarda transparência. Para alfa reutilizável, use WebM VP9 ou ProRes 4444.
- Não confie só em stills do Studio para 3D: confira o MP4 renderizado (folha do modo `mp4`).

## Checklist de entrega
- [ ] `tsc` limpo, folha de stills aprovada.
- [ ] MP4: 1080x1920, 30 fps, H.264 + AAC, duração certa (`ffprobe`).
- [ ] Folha do MP4 final sem defeitos; `checar_audio.py` dentro das metas.
- [ ] Nome versionado em `entregas/`. A versão anterior foi preservada.
- [ ] Ao usuário: o que mudou, o que foi verificado e o que **não** foi (ex.: o agente não ouve o áudio).
