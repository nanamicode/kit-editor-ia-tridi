---
name: criativo-catalogo-estilos
description: Catálogos do curso FCA para escolher o visual de um criativo: 35 estilos de edição numerados, 50 estilos visuais (V1–V50), 391 efeitos de edição com gatilhos de fala e limites em 9:16, e a biblioteca de ~512 prompts de vídeo (motion graphics, explicativos, 3D). Use ao decidir estilo, efeito, transição ou técnica de um criativo, ao receber "estilo N"/"visual VN", ou ao procurar referência de movimento antes de improvisar.
---

# Catálogos de estilos e efeitos (acervo do curso FCA)

Índices compactos em `references/` (leia o arquivo certo, não tudo). Os **originais** ficam em
`<ACERVO>\` (somente leitura):
- `efeitos-e-estilos/` — `CATALOGO-ESTILOS-v2.json/.html`, `ESTILOS-VISUAIS-V1-V50.json/.md`, `catalogo-de-efeitos.json` (+ `.html`), `exemplos/img/` (≈275 imagens de cada estilo; **olhe a imagem** de um estilo antes de propor).
- `biblioteca-prompts-video/` — `prompts/<slug>.md` (512 prompts), `CATALOGO.md/.html/json`.
- `referencias/LEIA-ME.pdf` — a pasta de anúncios de referência do autor ainda não foi entregue ("em breve").

## O que consultar
| Preciso de… | Arquivo |
|---|---|
| Estilo de EDIÇÃO (ritmo/estrutura), pedido como "estilo 12" | `references/estilos-edicao.md` (35 estilos; tabela-índice no topo) |
| Aparência da imagem (VISUAL), pedido como "visual V8" | `references/estilos-visuais.md` (V1–V50 por categoria, com `prompt_pt`) |
| Efeito concreto (cartela na palavra dita, zoom, antes/depois, checklist, som…) | `references/efeitos-familias.md` (visão geral e top 10 para 9:16) e `references/efeitos-indice.md` (391 efeitos, uma linha cada, `grep -i`) |
| Detalhes de um efeito (assinatura, invariantes, proibições, limites 9:16) | JSON original `catalogo-de-efeitos.json`, buscando pelo `id` (ver comando no topo de `efeitos-indice.md`) |
| Inspiração de movimento/3D/tipografia/dados em vídeo | `references/prompts-video-indice.md` (mapa por tema, 40 prompts curados, como buscar em `prompts/`) |

## Regras de combinação (do catálogo)
**1 estilo de edição + 1 visual principal + (opcional) 1 visual de apoio.** Ex.: "estilo 5 Dossiê com visual V8 Planta Azul". Se o visual ficar forte demais: "o mesmo design, 50% mais sutil". Toda imagem em **9:16 com o importante na área 4:5**. **Celular, monitor ou painel mostrando tela nunca vazio** (interface coerente). Escolha o estilo **pelo público e pela cena que ele conhece** (ver `criativo-estilos-referencia`).

## Como usar num pedido
1. Descubra público, dor, etapa do funil e se há apresentador/recorte/imagens/dados (insumos).
2. Proponha **2–3 estilos** (edição + visual) com o motivo; mostre a imagem de exemplo de cada um ao usuário; ele decide.
3. Para cada trecho da fala, escolha efeitos cujos **gatilhos** casem com o que é dito e cujos **insumos** existam; respeite duração/limites 9:16 e as **proibições** (ex.: 💲 = nada de valor ou promessa de ganho na tela; 📎 = exige origem do número). Não use efeito que peça dado que o usuário não deu.
4. Implemente com as skills de Remotion do projeto; **amostra de 8–15 s antes do vídeo inteiro**.
5. Prompts de vídeo da biblioteca são de terceiros (MIT, autores no X/GitHub), em inglês, 234 de 512 "parciais": use a **forma**, nunca a obra.

## Limitações conhecidas
- Catálogo de edição: sem campo "evitar" nem "para quem funciona" (os 35 estão como "pronto"); alguns resumos da tabela-índice estão truncados.
- Efeitos: ⚠ aparece em 311 de 391 (pouco discriminante); 65 sem duração; `notas.anuncio` (0–3) interpretado como adequação a anúncio; família "capítulo" pouco útil em anúncio curto.
- Prompts de vídeo: 512 arquivos (o catálogo cita 513/514); ~78 repetem o mesmo showreel de 15 s; alguns em turco, chinês ou espanhol; a pasta `por-categoria/` citada não existe.
- Os estilos novos do aluno (comando /fca-novo-estilo) ficariam em `meus-estilos/` a partir do número 100; aqui não existe essa pasta.
