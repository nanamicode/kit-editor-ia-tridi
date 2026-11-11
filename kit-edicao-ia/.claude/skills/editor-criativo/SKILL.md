---
name: editor-criativo
description: Edita criativos de vídeo verticais (Reels/TikTok/anúncio) com o Kit Edição IA — B-roll com cortes dinâmicos, rótulos e HUD, legendas palavra a palavra, palavra gigante com eco, recorte da apresentadora, remoção de legenda queimada, selo 3D, moedas 3D, CTA, trilha e SFX sintetizados, verificação e render. Use para qualquer pedido de editar, montar, legendar, sonorizar ou exportar vídeo com Remotion neste kit.
---

# Editor de criativos (Kit Edição IA)

Fluxo: [metodos/00-fluxo.md](../../../metodos/00-fluxo.md) — medir → briefing → amostra → aprovação → vídeo inteiro → verificar → exportar só quando o usuário pedir.

**Regra de ouro (economia de tokens):** abra **só** o método do elemento que vai usar. A API já está no método. Não leia o código dos componentes. Prefira números do `analise.json` a olhar quadros, e uma folha (`scripts/folha.py`) em vez de várias imagens.

## Qual método ler
| Pedido do usuário | Método | Peças |
|---|---|---|
| Começar qualquer vídeo / "o que tem nesse vídeo?" | [01-analise-inicial](../../../metodos/01-analise-inicial.md) | `scripts/analisar_video.py` |
| Legenda palavra a palavra, destaque na palavra falada | [02-legendas](../../../metodos/02-legendas.md) | `scripts/transcrever.py`, `kit/legendas` |
| Rótulo por clipe, contador 01/06, barra de progresso | [03-rotulos-hud](../../../metodos/03-rotulos-hud.md) | `kit/broll` |
| Cortes dinâmicos, punch-in, tremor, speed-ramp | [04-cortes-dinamicos](../../../metodos/04-cortes-dinamicos.md) | `kit/broll` |
| Transição whip, flash, glitch, íris | [05-transicoes](../../../metodos/05-transicoes.md) | `kit/broll` |
| Recortar a pessoa do fundo (sem tela verde) | [06-recorte](../../../metodos/06-recorte.md) | `scripts/recorte_rvm.py` |
| Apagar legenda já queimada no vídeo | [07-remover-legenda-queimada](../../../metodos/07-remover-legenda-queimada.md) | `scripts/remover_legenda_queimada.py` |
| Palavra gigante atrás ou acima da pessoa, com eco | [08-palavra-gigante-eco](../../../metodos/08-palavra-gigante-eco.md) | `kit/palavra-gigante` |
| Transição 3D (selo/moeda que estampa e racha) | [09-selo-3d](../../../metodos/09-selo-3d.md) | `kit/selo3d` |
| Objetos 3D flutuando com paralaxe | [10-moedas-3d](../../../metodos/10-moedas-3d.md) | `kit/moedas3d` |
| Botão "SAIBA MAIS", cursor, título final, faixa de topo | [11-cta](../../../metodos/11-cta.md) | `kit/cta`, `kit/faixa-topo` |
| Trilha, efeitos sonoros, ducking, loudness | [12-audio-sfx](../../../metodos/12-audio-sfx.md) | `scripts/audio_trilha_sfx.py`, `scripts/checar_audio.py`, `kit/audio` |
| Conferir e exportar MP4 | [13-verificacao-render](../../../metodos/13-verificacao-render.md) | `scripts/folha.py` |
| Cenário da apresentadora, câmera, exposição | [14-cenario-apresentadora](../../../metodos/14-cenario-apresentadora.md) | `kit/apresentadora` |
| Trocar cores e fontes (outra marca) | [15-identidade-visual](../../../metodos/15-identidade-visual.md) | `kit/theme.ts`, `marcas/*.json` |
| Juntar tudo num vídeo | [16-montagem](../../../metodos/16-montagem.md) | `template/src/video.config.ts`, `Video.tsx` |

Para Remotion em geral (API, regras), use a skill `remotion-best-practices`.

## Comandos de bolso
```bash
python scripts/analisar_video.py originais/X.mp4 --saida analise/ --whisper small --lang pt
cd template && npx tsc --noEmit
python ../scripts/folha.py stills --projeto . --comp Video --frames 0,60,120,240,300 --out ../review/folha.jpg
npx remotion studio --no-open --port 3000
npx remotion render src/index.ts Video ../entregas/X_V01.mp4 --codec=h264 --audio-codec=aac --gl=angle
```
Exemplo completo e aprovado: `template/src/video.config.ts` (criativo de carimbos V02). Referência visual: `exemplos/criativo-carimbos/referencia_V02.jpg`.
