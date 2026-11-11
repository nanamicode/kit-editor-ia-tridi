# Fluxo de trabalho (do bruto ao MP4) — com economia de tokens

**O que resolve:** a ordem certa de passos para editar um criativo com o kit, gastando o mínimo de tokens. O usuário dirige: ele dá a mensagem, a oferta e a aprovação. O agente executa, verifica e corrige.

## Receita rápida
1. **Medir, não olhar.** Rode `python scripts/analisar_video.py <bruto.mp4> --out analise/ --whisper small --lang pt`. Leia **só** o resumo JSON e a folha de contato (1 imagem). Isso substitui abrir dezenas de quadros. Ver [01-analise-inicial.md](01-analise-inicial.md).
2. **Briefing em 7 partes**, perguntando ao usuário só as lacunas factuais (preço, prazo, prova, nome): material; objetivo/público; formato; estilo (critérios observáveis); sequência visual (qual asset em qual fala); o que preservar; entrega.
3. **Escolher os módulos** pela tabela da [skill](../.claude/skills/editor-criativo/SKILL.md). Leia **só** os métodos dos módulos escolhidos.
4. **Preencher `template/src/video.config.ts`** com os números do `analise.json` (cortes, cliques, palavras) e com os textos aprovados. Ver [16-montagem.md](16-montagem.md). Componentes não são reescritos: só dados.
5. **Preparar a mídia** (só se o módulo pedir): recorte ([06](06-recorte.md)), remoção de legenda queimada ([07](07-remover-legenda-queimada.md)), trilha e SFX ([12](12-audio-sfx.md)).
6. **Amostra primeiro:** 8 s (fala + legenda + uma inserção) ou 10-15 s, se tiver motion ou 3D. A amostra deve representar o vídeo todo. Mostre em stills ou no Studio e espere a aprovação.
7. **Aplicar ao vídeo inteiro → verificar** ([13-verificacao-render.md](13-verificacao-render.md)) → salvar a versão (V01, V02…) → **exportar só quando o usuário pedir**.
8. **Correção = trecho + problema + mudança + o que preservar.** Mesmo erro 2x → parar, diagnosticar a causa, fazer a menor correção e testar só o trecho.

## Regras de economia de tokens (as que mais pesam)
- Prefira números do `analise.json` a olhar quadros. Para ver quadros, use **uma folha de contato** em vez de N imagens.
- Leia só o método do módulo que vai usar. Não abra o código do componente, porque a API está no método e no `index.ts` do módulo.
- Ajuste fino = mudar 1 campo do config + 1 still do quadro afetado. Nunca renderize o vídeo inteiro para conferir um detalhe.
- Render final só uma vez por versão, em segundo plano. Confira o MP4 com uma folha de 8-10 quadros e `checar_audio.py`.
- Tarefas grandes (várias cenas novas): divida em agentes paralelos, um dono por pasta, e use um revisor independente.

## Armadilhas já vividas
- Transcrição do Whisper adianta o início da fala (ruído de sala). Corrigir pela energia (o script já faz isso). A grafia ("clica" × "clique") só se confirma de ouvido: pergunte ao usuário.
- B-roll "mudo" pode ter cliques reais do produto. Eles são ouro para sincronizar o punch-in e os SFX.
- Um vídeo com legenda queimada exige remover a legenda antes de pôr legenda nova.
- O agente não ouve o áudio: verifica por medição (LUFS, razão voz/bed) e pede ao usuário para ouvir.

## Checklist
- [ ] Briefing aprovado, sem dado inventado (preço, prazo, número, depoimento).
- [ ] Amostra aprovada antes de aplicar ao vídeo todo.
- [ ] Stills de abertura, meio, transições e CTA conferidos. Folha do MP4 final conferida.
- [ ] Áudio em -14 LUFS ±1, true peak ≤ -1 dBTP, voz ≥ 6 dB acima do bed.
- [ ] Versão salva em `entregas/` com nome versionado. O original fica intocado.
