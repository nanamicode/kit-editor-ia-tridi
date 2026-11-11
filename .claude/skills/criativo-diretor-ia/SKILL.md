---
name: criativo-diretor-ia
description: Como dirigir a IA na produção de criativos: briefing, modo plano, ângulos, roteiro aprovado, amostra curta antes do render, correção cirúrgica, checklist do diretor (12 itens), diagnóstico por métricas (gancho, retenção, CTR, custo por resultado), versões V1/V2/V3 e pipeline da entrega. Use ao receber um pedido de criativo ou ao revisar/corrigir um já feito.
---

# O diretor da IA (método FCA)

O usuário é o diretor; a IA executa (copy, roteiro, narração, edição). O resultado depende do **contexto**, não de prompt mágico. "Primeiro você entende, depois você pede."

## 1. Briefing (conversa natural, pode ser áudio)
Eixos, em ordem: **produto e público** (obrigatórios) → **dor/grande problema e solução** → **prova** (números, depoimentos reais) → **oferta e CTA** → **estilo e proporção** (+ referência). Se o usuário só tem uma página/link/perfil/VSL, leia tudo (se houver VSL: transcrever com tempo e extrair quadros a cada 1–2 s e nas mudanças de cena; a IA não "assiste", ela mapeia imagens + transcrição).
- Contexto fixo (empresa, oferta, público) salve **uma vez** num arquivo do projeto.
- Referência vale mais que adjetivo ("moderno e bonito" não ajuda).
- Lacuna factual: deixe em branco ou "não sei"; descubra pela página/arquivos ou proponha com motivo. **Nunca invente bônus, preço, prazo, número, depoimento.**
- Peça análise de volta: quem compra, o que sente, a objeção, a promessa, a oferta. O usuário corrige antes de seguir.

## 2. Fluxo de trabalho (um criativo por conversa)
1. **Plano antes** (modo plano / Shift+Tab no Claude Code) para tarefas grandes. Ler o plano.
2. **Ângulos:** nunca um só; mínimo 3 ângulos/ganchos. Escolher estrutura (skill `criativo-frameworks-copy`) e estilo (por número, descrição, referência ou "escolha para mim").
3. **Roteiro em texto; ler em voz alta antes de aprovar.** Não aprovar sem ler.
4. **Narração/arte/b-roll** (voz: gravada, voz local ou ElevenLabs conforme o caso: autoridade pede a melhor voz; low ticket pode usar a local).
5. **Amostra curta (5–15 s, 9:16)** com fala + legenda + uma inserção representativa **antes** de renderizar o vídeo inteiro.
6. **Render do vídeo inteiro** só com amostra aprovada. **Um render por vez** (máx. dois) para não travar a máquina.
7. **Texto do anúncio:** um texto e um título por criativo (CTA padrão "Saiba mais"; avisar se orgânico ou outro CTA). Para orgânico: 3 capas. Conferir a capa.
8. **Entrega organizada** (ex.: pasta `ads`, pasta `org`, briefing em `.md`, resumo em HTML) e perguntar como verificar.
Criar versões por funil quando pedido (topo/meio/fundo com narrativas diferentes).

## 3. Correção cirúrgica
Aponte o **defeito exato** (print + minuto/segundo), diga **o que manter**, faça **uma mudança por vez**; corrija só o trecho e mostre amostra curta antes de refazer tudo. "Refaz tudo melhor" gasta cota, perde o que estava aprovado e esconde o que mudou. Se o mesmo erro voltar, diagnostique antes de tentar de novo.
Termine pedidos com **"como eu verifico?"**. Plano antes, verificação depois.

## 4. Checklist do diretor (12 itens: 6 de roteiro + 6 de vídeo)
Lista oficial só existe no workbook; reconstrução do que as aulas dizem. Diretor não "acha", confere:
- **Roteiro:** uma ideia, um gancho, um CTA; gancho ≤3 s (dor, profissão ou algo que chama); corpo mostra como funciona; prova concreta; duração adequada; fala do comprador e nada que a Meta reprove.
- **Vídeo:** tudo dentro do 4:5 (título e elementos); tela de aparelho preenchida (nunca janela vazia); texto grande com respiro (rótulo miúdo reprova no celular); voz limpa sem estourar; trilha baixa; legenda sem erro; b-rolls ok; nenhum dado de cliente aparecendo.
Aprovar = ler o roteiro e ver o vídeo, não só assistir.

## 5. Diagnóstico por métricas (quando já há tráfego)
| Métrica | Mede | Melhorar | Bom | Ótimo |
|---|---|---|---|---|
| Taxa de 3 s (hook rate) = plays de 3 s / impressões | gancho | <30% | 30–40% | >40% |
| Retenção = ThruPlay (15 s) / impressões | corpo | <10% | 10–15% | >15% |
| CTR do link (não "cliques (todos)") | CTA/transição | <1% | 1–2% | >2% |
| Custo por resultado (CPA/CPL) | tudo | acima do teto | no teto | abaixo |
Gancho baixo → novo gancho. Gancho bom e retenção baixa → mude o corpo. Gancho e retenção bons e CTR baixo → CTA/transição. Tudo bom, clicou e não comprou → **página/oferta**, não o criativo.
**Um número, uma alteração, uma parte por vez**; salve V1, V2, V3 e compare; combine o melhor de duas versões. Registre para a IA o que funcionou e o que não. **Teto de CPA** = definido pela **sua margem** (ex.: R$ 200 − taxas/entrega R$ 50 = margem R$ 150; para 100% de lucro o teto é R$ 75); em lead, custo máximo por lead = teto ÷ leads por venda. Perseguir custo por resultado e taxa de 3 s; ignorar curtida, alcance, CPM. Quando há venda, vale a venda, não o CTR. Esses limiares são do instrutor; não os apresente como verdade absoluta.

## 6. Gestão de custo e uso
Estime tempo e uso/custo antes de tarefa pesada; peça a estimativa à IA (é imprecisa). Uma conversa por criativo; resuma/compacte ao chegar perto de 80% do contexto. Chaves de API só no `.env`, uma por vez, **nunca no chat nem em print**. Evitar modo "ignorar permissões".


## Correções dos workbooks (valem mais que a transcrição)
- Fecho padrão de todo prompt: **"Antes de executar, me mostre o plano em passos curtos e espere meu OK. No final, diga como eu confiro que ficou certo."**
- O checklist de 12 itens não existe como tabela no workbook; a divisão 6+6 acima continua sendo reconstrução. A lista do "antes da próxima aula" está em `criativo-prompt-mestre/references/wb_3.md`.
- Teto de CPA: use a **fórmula** (margem = preço − taxas − impostos − entrega), não os exemplos numéricos das aulas, que se contradizem.
- Custos: vídeo por IA (fal) ≈ US$ 0,20–0,50 por clipe; imagem (OpenAI) ≈ US$ 0,02–0,07; ElevenLabs US$ 5–22/mês. **VoiceStudio tem licença não comercial**: para anúncio que vende, use ElevenLabs ou modelo com licença comercial. Antes de qualquer gasto, dizer o custo e esperar "pode".
- Amostra: 8 s em 9:16 para correção; 5–15 s para amostra de arte/custo.
- Ficha de estilo ao guardar: nome curto, para quem serve, quando usar, quando NÃO usar, fonte e a amostra; a IA deve dizer "o que não conseguiu ver ou ouvir".
- Prompt mestre completo e os 90+ prompts prontos: skill `criativo-prompt-mestre`.
