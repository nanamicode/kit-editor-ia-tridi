# Famílias de efeitos (catálogo FCA) — visão geral

391 efeitos em 17 famílias. Índice completo (um efeito por linha: id, gatilhos, insumos, flags): `efeitos-indice.md`. Detalhe de um efeito (assinatura, invariantes, proibições, limites): JSON `<ACERVO>/efeitos-e-estilos/catalogo-de-efeitos.json`, busca por `id`.

## As 17 famílias (qtd · para que serve · nota média de anúncio 0–3)
- **tipografia** (59 · 2,4): texto animado que carrega a fala: cartela por palavra dita, golpe de cor, holofote, tarja, correção/redefinição de termo, título atrás da pessoa. Base do anúncio.
- **transicao** (50 · 2,3): trocas curtas de bloco/cena (fresta, virada de carta, portal, mosaico, onda, corte em V), em geral 0,2–1,5 s. Para virada, pergunta→resposta, antes→depois.
- **comparacao** (38 · 2,3): antes/depois, acumulação, razão entre grandezas, três versões lado a lado.
- **colagem** (35 · 2,0): pilhas de documentos, parede de relatos/provas, b-roll pela palavra, imagens em volta do apresentador.
- **diagrama** (31 · 2,0): fluxos e relações: soma das partes, 3 passos ancorados, ramos, fontes que convergem, linha de produção.
- **tratamento** (31 · 2,1): grade de cor, micro-zoom, flashback P&B, grão, base 9:16 preta; unifica o visual, não é conteúdo.
- **lettering-editorial** (31 · 2,4): sistema de texto editorial (LETED-EF-nn): abertura pequena/grande, termo marcado, dado gigante, legenda palavra a palavra, enumeração.
- **cartoes** (25 · 2,0): cartões, balões e pílulas: checklist sincronizado, recibos com contador, conversa, etapas numeradas, objeções.
- **evidencia** (24 · 2,3): prova na tela: círculo/pincel, lupa, print real, comentário com marcador, métricas percorridas.
- **som** (15 · 2,7): sound design e áudio: clique na virada, cama com duck, silêncio estratégico, build-up, tic-tac, tratamento de narração. Maior nota média entre as famílias grandes.
- **janela** (14 · 2,3): app/celular/agenda/chat em janela, em geral com apresentador ao lado.
- **cta** (10 · 1,9): fechamento: chevron duplo, CTA em loop, tela alternada, fecho por dúvida.
- **divisao** (9 · 2,3): tela dividida apresentador + gráfico/celular/citação (em 9:16, empilhar).
- **capitulo** (9 · 0,8): títulos de capítulo. Pouco útil em anúncio curto (proibição recorrente: capítulo em anúncio curto mata o ritmo); melhor para aula/VSL.
- **composicao** (5 · 3,0): quadro inteiro: papel de parede de objeto, faixas diagonais, página de HQ, grade de painéis.
- **objeto** (4 · 2,8): objeto animado como símbolo (folha amassada, anéis de sinal, emoji 3D, adesivo).
- **demonstracao** (1 · 3,0): esteira-sob-mira-de-leitura (itens verificados um a um).

## Mais úteis para anúncio 9:16
168 efeitos têm nota A3 (campo notas.anuncio). Sem apresentador/recorte/origem obrigatórios, bons pontos de partida:
- Texto e ritmo: cartela-entra-na-palavra-dita, LETED-EF-04 (legenda palavra a palavra), palavra-sob-holofote, golpe-de-cor-chapado, entrada-sobria-da-cartela, base-9x16-preto-centro.
- Ênfase/troca: micro-zoom-por-frase, assentamento-minimo-entre-blocos, foco-que-assenta-na-troca, fresta-horizontal-que-abre.
- Prova/comparação: antes-depois-em-pares, linha-a-linha-antes-depois, checklist-sincronizado-com-tela, lupa-callout.
- Fechamento: chevron-duplo-cta, cta-final-em-loop.
- Som: som-clique-na-virada, som-cama-com-duck, som-silencio-estrategico, som-build-up-antes-da-frase, som-tratamento-da-narracao.

## Quem exige o quê (contagens no catálogo)
- **Apresentador obrigatório** (🎤): 52 (mais em tipografia 12, divisao 8, janela 8, colagem 6). Opcional: 39.
- **Recorte da pessoa obrigatório** (✂): 39; preferido: 6; opcional: 37.
- **Imagens/arquivos pedidos**: 173 efeitos listam algo (prints reais, tela de celular, clipe, b-roll, documento, imagem própria ou gerada, cena ilustrada, retrato autorizado, pares de prints); 218 não pedem imagem.
- **Dado numérico** (#dado): 51. Derivado (razão, total, %, ROI) nunca se digita: calcula-se.
- **Origem do dado** (📎): 62 exigem origem; sem origem o valor leva selo SIMULAÇÃO.
- **Texto** entra em 242 efeitos; 149 funcionam sem texto.
- **Limites 9:16** (⚠): 311 efeitos trazem limites (nº de quadros, caracteres por rótulo/título, linhas, itens, palavras). Respeitar; ver JSON.
- **Duração 9:16**: típica de 0,2 a 6 s; 138 efeitos têm ≤2 s; poucos passam de 8 s (chevron-duplo-cta 10, choque-de-inversao-e-mascara 14, clipe-viral-com-camada-explicativa 8). 65 não informam duração.

## Regras gerais que se repetem
Invariantes:
- Escala aparece antes do dado e não muda; número colado na ponta e crescendo junto (comparações).
- Derivado (razão, total, %, ROI) é calculado, nunca digitado.
- Layout assentado antes do movimento; final parado ≥ 2 s; um único elemento recebe o destaque final; uma ideia por batida.
- Topologia existe desde o início e só recebe elementos; ligação desenhada antes do nó de destino (diagramas).
- Texto assentado não treme nem flutua; print/gravação real fica na tela o tempo todo.
- Receitas de som completas em RECEITAS-SOM-HARDCOPY.md (citado por 11 efeitos).

Proibições mais frequentes:
- Valor em dinheiro ou promessa de ganho na tela (70 efeitos; flag 💲 no índice). Alinha com as regras de política da Meta.
- Texto, marca, rosto, logo, personagem ou caso da referência (68): levar a forma, não a obra.
- Valor/número sem origem (sem origem = selo SIMULAÇÃO); métrica de tela inventada; nome, métrica ou endosso inventado.
- Fundir unidades diferentes numa razão só.
- Reorganizar a estrutura no meio da animação; mais de 4 palavras por nó; título que vira parágrafo; crossfade entre títulos grandes (letra dupla).
- Painel genérico de aplicativo; redesenhar painel quando existe print real; print quase todo borrado; tela de terceiro com marca reconhecível.
- Rosto coberto por cartão; lado a lado em 9:16 (empilhar).
- Imagem gerada por IA apresentada como prova; voz clonada sobre o take do autor.
- Três efeitos proíbem uso em anúncio: recipiente-pequeno-grande, capitulo-vira-pilha, passos-levam-ao-capitulo.

## Como escolher
1. Ache o momento da fala (gancho, dor, prova, virada, CTA) e procure no índice por palavra da relação ou gatilho.
2. Confira as flags: 🎤/✂ (há apresentador/recorte?), #dado e 📎 (há dado com origem?), imagens pedidas (há o asset?).
3. Abra o JSON do id para ler invariantes, proibições e limites antes de aplicar.
4. Em nicho sensível, descarte efeitos que exibam valor, resultado ou prazo.
