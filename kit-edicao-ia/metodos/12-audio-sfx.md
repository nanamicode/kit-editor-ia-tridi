# Áudio: trilha + SFX sintetizados, ducking e mix
**Quando usar / o que resolve.** Todo criativo precisa de trilha com energia crescente, SFX em cada corte e impacto, e voz inteligível. O script sintetiza tudo (numpy/scipy, **sem samples**, sem licença) a partir de uma lista de cues e entrega `bed.wav` com ducking embutido. No Remotion, o `<SoundMix>` toca voz + bed.

## Receita rápida
```bash
# 1) cues automáticos do analise.json (+ instante da revelação, se houver)
python scripts/audio_trilha_sfx.py --de-analise analise/analise.json --revelacao 7.82 --so-cues --salvar-cues analise/cues.json
#    revise analise/cues.json (apague corte escondido por transição, ajuste tipos) e depois:
# 2) sintetizar
python scripts/audio_trilha_sfx.py --cues analise/cues.json --voz originais/bruto.mp4 \
       --saida template/public/audio --ts template/src/cues.gerado.ts
# 3) medir (o agente não ouve)
python scripts/checar_audio.py --voz originais/bruto.mp4 --voz-vol 0.668 --bed template/public/audio/bed.wav --cues analise/cues.json
```
No Remotion: `<SoundMix voiceSrc="bruto.mp4" voiceVolume={0.668} bedSrc="audio/bed.wav" bedVolume={1} />` (de `src/kit/audio`). Sincronizar animação a um SFX: `useCuePulse(cueTimes(parseCues(CUES), "relevo"))`.
Reproduzir o V02: `--cues template/src/kit/audio/cues.exemplo.json --voz template/public/exemplo/criativo.mp4` (o resultado é idêntico ao bed aprovado, resíduo −83 dB).

## Parâmetros
| arg | default | efeito |
|---|---|---|
| `--bpm` / `--offset` | info do cues, senão `auto` | `auto` testa 96–128 BPM e escolhe o que alinha cortes + revelação à grade de 16avos (revelação pesa 3×). Erro ≤ 25 ms é bom |
| `--preset` | `energia=media,tom=A` | energia `baixa\|media\|alta` (dB por camada), tom = transposição a partir de Lá menor (bells também) |
| `--fala ini-fim` | info.fala | trechos de voz para o ducking (repetível). Sem fala = sem ducking |
| `--voz` | — | voz para o seguidor de envoltória e para o `mix_teste.wav` |
| `--duck-db` | 14 | profundidade do duck sob a fala (+ até −5 dB pelo seguidor) |
| `--voz-ganho-db` | −3.5 | só no `mix_teste.wav`. Use o mesmo em `voiceVolume` (o script imprime `voz_volume_remotion`) |
| `--musica-db --sfx-db --bed-db --teto-db --softclip` | −2 / 0 / −2.7 / −5.5 / 0.30 | ganhos e teto do bed (os valores do V02 dão mix −14.1 LUFS, −1.5 dBTP) |
| cue `gain_db` | 0 | ajuste fino por evento (ex. `-6` num pop que mascara a fala) |
| cue `glitch` | cortes ímpares | liga/desliga o glitch nesse corte |
| cue `brilho`/`ring` | sequência do V02 | timbre do chk de relevo (metal 1.25/1.7, papel 0.85/0.8, guardanapo 0.8/0.6) |

**cues.json:** lista de `{t, tipo, nome?, ...}` + um item `{"tipo":"info","bpm","grid_offset_s","fala":[[a,b]]}`. Também aceita o legado V02 (`impacto` + nome pressão/relevo/stinger, `cta`). Saída `cues_resolvidos.json` = info com `downbeats_s`, `compassos[{t,papel}]`, `revelacao_s`, `riser_s`, `rolo_caixa_s`, `silencio_s`, `erro_grade_cortes_ms` e `mix`.

| tipo | som | detalhe |
|---|---|---|
| `corte` | whoosh (pico no corte, pan alternado) + hit grave + tick | glitch bitcrush nos cortes ímpares; a música baixa 40 % por 0.14 s |
| `pressao` | thump grave 125→62 Hz + estalo | no clique real de maior força |
| `relevo` | chk metálico inarmônico + reverb curto + thump | ~0.245 s após a pressão. Bom ponto para punch-in/tremor |
| `riser` | ruído ascendente + tom 220→1760 Hz + crash invertido | com revelação: vai até o silêncio seco (~100 ms) antes do impacto; rolo de caixa nos 6 últimos 16avos. `auto_compasso` = começa 1 compasso antes |
| `revelacao` | impacto grave longo + chk + sinos + reverb | âncora do clímax; recebe duck de −26 dB quando a fala entra |
| `ui` | pop curto 900→2300 Hz | nível baixo (0.30) |
| `ding` | sino brilhante triplo + reverb | 0.10. Bem baixo de propósito |
| `stinger` | sinos + thump + crash | após a última fala; a música volta +2 dB |
| `fala` | — | `t` + `fim` = trecho de ducking |

## Como funciona
- **Grade:** 16avos (`t = offset + n·60/BPM/4`). A fase dos compassos vem da revelação (cai num downbeat), senão do 1º corte. Revelação, riser e stinger encaixam na grade se estiverem a ≤ 6 ms dela. Cortes e cliques nunca se movem.
- **Arranjo por papel de compasso:** intro → build (Am, F...) → riser (G–E, caixa e hats crescendo) → post (F–G, sem kick no 1º tempo) → talk (Am–F). Instrumentos: kick, caixa+palma, hats, baixo, pad saw, arpejo com eco e sidechain do kick. As curvas de energia são ancoradas nos downbeats e no clímax.
- **Ducking:** −14 dB sob a fala + seguidor da envoltória da voz (−5 dB, ataque 12 ms, release 160 ms) + mid-scoop 250–3800 Hz (abre espaço para a voz).
- **Bed:** HP 38 Hz → ganhos → soft-clip → limiter com look-ahead (teto −5.5 dBFS) → fades. `music.wav`/`sfx.wav` são os stems já com o mesmo ganho de redução.

## Armadilhas já vividas
- **B-roll que parecia mudo tinha cliques reais.** Use os onsets (pressão/relevo) como âncora dos SFX: o som sintético cobre e reforça o real, e não briga com ele. A voz original fica no mix (é ela que traz os cliques).
- **O original passava de 0 dBTP** (+1.9). Voz a 1.0 = 68 amostras clipando e TP +1.9. A 0.668 (−3.5 dB), o mix fica em −14.1 LUFS e −1.5 dBTP.
- **Pop de UI e ding mascaravam a fala** ("Saiba Mais"). Ficaram em 0.30 e 0.10, e o impacto da revelação recebe −26 dB quando a fala começa. Se o checar apontar voz < 6 dB, baixe `gain_db` do cue nesse trecho e não a trilha toda.
- **Checar sem trechos de fala dá alarme falso:** no modo auto, os cliques do B-roll contam como "fala" e aparecem 7 trechos "voz < bed". Passe sempre `--cues`/`--analise`/`--fala`.
- **BPM auto muda com o corte escondido de 8.30 s:** com ele, o melhor é 120 BPM (erro 24 ms). Sem ele, 108 BPM (15 ms). Limpe os cortes antes.
- **Não dá para ouvir:** verifique por medição (`checar_audio.py`, `mix_teste.wav`) e **peça ao usuário para ouvir** o `mix_teste.wav` ou o Studio antes de aprovar. Diga isso no relatório.
- `<Video>` do B-roll ou da apresentadora com áudio ligado duplica a voz: deixe-os `muted` e use só o `<SoundMix>`.

## Checklist de verificação
- `checar_audio.py`: `ok=true`, LUFS −14 ± 1, TP ≤ −1 dBTP, 0 clip, `voz_bed.min_db ≥ 6` (V02: 7.6, mediana 13.1).
- `erro_grade_cortes_ms` ≤ ±25 ms. `compassos` coerente (V02: `bbrpt`).
- Comparar com uma referência: `checar_audio.py --bed novo.wav --comparar ref.wav` (LUFS, bandas, transientes casados ±30 ms).
- Quadros de animação ligados a SFX: still no frame do cue (`round(t·fps)`) mostra o pico do efeito.
- Pedir ao usuário que ouça; reprova: SFX encobrindo palavra, whoosh atrasado em relação ao corte, trilha alta sob a voz.
