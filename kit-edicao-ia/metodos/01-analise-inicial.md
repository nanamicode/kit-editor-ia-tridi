# Análise inicial do vídeo bruto
**Quando usar / o que resolve.** Primeiro passo de todo vídeo novo, antes do briefing. Um comando mede dimensões, fps, cortes, cliques reais no áudio, fala e silêncio, palavras (opcional) e legenda já queimada. Gera ainda uma folha com 1 quadro por segundo. O agente lê **números**, não quadros.

## Receita rápida
```bash
# rápido (sem transcrição): ~25 s para 12 s de vídeo
python scripts/analisar_video.py originais/bruto.mp4 --saida analise/
# com palavras (modelo small já em cache; large-v3-turbo também, mais lento)
python scripts/analisar_video.py originais/bruto.mp4 --saida analise/ --whisper small --lang pt
```
1. Leia **só o resumo JSON impresso** (cortes, onsets, fala, LUFS, TP, legenda).
2. Abra `analise/folha_1s.jpg` **uma vez** para ver conteúdo e enquadramento (1 leitura cobre o vídeo todo).
3. Passe `analise/analise.json` adiante. `audio_trilha_sfx.py --de-analise` gera os cues de áudio dele. Os tempos de corte/pressão vão para o `video.config.ts`.

## Parâmetros
| arg | default | efeito |
|---|---|---|
| `--limiar-corte` | 0.25 | score mínimo (0–1) de corte. Suba (0.35) se movimento rápido virar corte; desça (0.15) se perder corte entre planos parecidos |
| `--razao-corte` | 3.0 | o score precisa ser N× a mediana local (filtra câmera tremida, zoom) |
| `--onset-db` | 12 | subida mínima em ~50 ms na banda 2–12 kHz para contar como clique/batida |
| `--onset-intervalo` | 0.20 | intervalo mínimo entre onsets (s). Pressão e relevo ficam a ~0.24 s um do outro: não passe de 0.2 |
| `--onset-rel-db` | 30 | descarta onsets com pico N dB abaixo do mais forte (respiração, ruído) |
| `--fala-limiar-db` | auto | limiar absoluto (dBFS) da energia de fala. Auto = max(piso+15, máx−40) |
| `--whisper` | — | `small` \| `large-v3-turbo` \| ... palavra a palavra. `a` = início ajustado pela energia, `a_whisper` = bruto |
| `--sem-legenda` / `--sem-folha` | — | pula etapas |

Formato do `analise.json`:
```
video {w,h,fps,dur,frames,codec}   audio {sr,canais,codec,lufs,tp_dbtp,clip_amostras}
cortes [{t,f,score}]  (t = 1º quadro do plano novo)   planos [[ini,fim]]
onsets [{t,t_pico,pico_db,forca_db}]   fala [[ini,fim]]   silencio [[ini,fim]]
palavras [{w,a,b,a_whisper}]   legenda_queimada {y0,y1,frac_tempo,trechos} | null   folha
```

## Como funciona
- **Cortes:** decodifica o vídeo uma vez em ~320 px (mantendo a proporção). Score = 0.6 × diferença de histograma RGB + 0.4 × diferença de pixels. Conta como corte um pico local acima do limiar e N× acima da mediana de ~0.6 s.
- **Onsets:** envoltória de 5 ms na banda 2–12 kHz. Força = subida sobre o mínimo dos 50 ms anteriores. `t` = início do ataque (−12 dB do pico), `t_pico` = pico.
- **Fala:** energia de 150–4000 Hz acima do limiar, com buracos < 0.3 s fechados e trechos < 0.3 s descartados. Além disso, exige **vozeamento** (autocorrelação 80–400 Hz > 0.35), senão cliques e batidas virariam "fala".
- **Palavras:** faster-whisper com `word_timestamps`. O início só é movido quando há uma subida silêncio→som a até 0.12 s antes ou 0.25 s depois do valor do Whisper.
- **Legenda queimada:** linhas com muitas alternâncias de pixel branco/amarelo, estáveis em ≥ 40 % do pico. Devolve a faixa y (px do original) e os trechos de tempo.

## Armadilhas já vividas
- **B-roll "mudo" tinha cliques reais.** O bruto dos carimbos parecia sem som, mas tinha os clacks mecânicos: pressão (forte) e relevo (~0.24 s depois, mais fraco). Os SFX foram sincronizados a eles. Sempre rode a análise de onsets antes de supor silêncio.
- **O original passava de 0 dBTP** (+1.9 dBTP medido). O script avisa (`aviso`). No mix, use voz a 0.668 (−3.5 dB).
- **O vídeo de exemplo é 1080×1080 a 23.976 fps**, não 1080×1920/30. Leia `video.fps` e converta: `t = f / fps` do arquivo. Nunca suponha 30.
- **Corte escondido por transição:** o bruto tem um corte em 8.30 s (B-roll → apresentadora) que no V02 ficou sob o dissolve da revelação (7.82 s). Ele aparece em `cortes`. Remova-o dos cues de áudio se não quiser whoosh ali.
- **Whisper adianta a 1ª palavra** ("Faz" 8.28, audível ~8.5). O `fala` por energia começa em 8.61. Para ducking, use o início do Whisper (mais conservador). Para legenda, `a`.
- **Silêncio digital** (−∞ dB) gerava "subidas" infinitas. Agora há um piso em −90 dB / percentil 5. `forca_db` alto (60+) só significa "saiu do silêncio".
- A legenda queimada é heurística: confirme na folha antes de cobrir/recortar.

## Checklist de verificação
- Número de cortes = número de trocas de plano vistas na folha (±1 quadro em `t`).
- Onsets fora da fala casam com ações visíveis (pressão/batida). Onsets dentro da fala são sílabas: ignore-os.
- `audio.tp_dbtp > −1` → anotar o ganho da voz no briefing.
- `legenda_queimada` não nula → o layout de legenda nova não pode cair em `y0–y1`.
- Exemplo (criativo.mp4): cortes 1.293/2.836/4.213/5.589/6.840 (+8.300), pressões 0.350/1.520/3.230/4.480/5.940/7.230, relevos 0.595/1.760/3.470/4.720/6.180/7.475, fala 8.61–11.66, legenda y 884–934.
