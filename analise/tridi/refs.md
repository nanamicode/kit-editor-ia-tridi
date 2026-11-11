# Carimbos Tridi: análise dos 3 anúncios atuais e do material próprio

Fontes analisadas: `originais/tridi/ref1.mp4`, `ref2.mp4`, `ref3.mp4`, `originais/criativo.mp4` e `projeto/public/` (plate, matte, áudio).
Método: quadros a 4 fps com carimbo de tempo (folhas em `scratchpad/refs/r1_*.jpg`, `r2_*`, `r3_*`, `c_*`), detecção de cortes (ffmpeg `scene>0.1`), transcrição palavra a palavra (faster-whisper `small`, pt), loudness EBU R128 e espectrograma.
Todos os tempos estão em segundos do arquivo original.

## 1. Visão geral

| Arquivo | Formato | Duração | Planos | Planos de b-roll | Apresentadora | Final |
|---|---|---|---|---|---|---|
| ref1.mp4 | 720x1280, 29,97 fps, H.264 | 17,87 s | ~15 | 0,00–12,75 (b-roll próprio da Tridi, luvas pretas) | 13,0–16,4 (tomada A) | fade e preto de 16,4 a 17,87 (1,4 s morto) |
| ref2.mp4 | **1080x1080 (quadrado)**, 30 fps, VP9 | 16,21 s | ~6 | 0,00–10,55 (carimbos de madeira, marcas estrangeiras) | 10,7–14,4 (tomada A, a mesma do ref1, cortada em quadrado) | fade e preto de 14,4 a 16,2 (1,8 s morto) |
| ref3.mp4 | 720x1280, 30 fps, H.264 | 19,05 s | ~7 | 0,00–15,2 (carimbos de madeira, marcas estrangeiras) | 15,3–18,4 (tomada B) | fade de 18,4 a 19,05 |
| criativo.mp4 (antigo) | 1080x1080, 23,976 fps | 12,07 s | 6 | 0,00–8,25 (**alicate de relevo seco**, outro produto) | 8,4–11,55 (tomada C) | fade de 11,55 a 12,07 |

## 2. Mapa de planos

### ref1: o único com b-roll claramente da Tridi
Cenário: mesa de madeira, suculentas, peças impressas em 3D (templo grego, pirâmide, polvo), luvas nitrílicas pretas (às vezes brancas ou mão nua), carimbo preto de bloco. Leve granulação, saturação alta, rampas de velocidade e borrões de movimento entre os planos.

| Tempo | O que mostra | Logo legível? | Mãos |
|---|---|---|---|
| 0,00–1,04 | Sacola kraft laranja; o carimbo preto desce e sobe e revela a ilustração "Design Personalizado @wowdesign..." | Sim, de 0,5 a 1,0 | Luvas pretas |
| 1,04–2,34 | Pilha de copos plásticos transparentes, carimbo na lateral, revela **"Açaí no Grau"** (1,5–2,3) | Sim, alto contraste. É a melhor revelação do ref1 | Luvas pretas |
| 2,34–3,04 | Saquinho de algodão "Império Jeans" (coroa), com chicote borrado | Parcial | Luvas pretas |
| 3,04–4,01 | Papel branco: o carimbo sai e aparece **"I LOVE PRATINHOS"** (3,4–4,0) | Sim (tem telefone do cliente) | Luva preta |
| 4,01–4,74 | Sacola amarela "Sapore di Nata": pressiona e levanta, com templo 3D ao fundo | Sim | Luvas pretas |
| 4,74–5,68 | Caixa kraft "Petulance" (manequim) | Sim, pequeno | Luva preta e pulseira |
| 5,68–6,10 | Composição de embalagens de lanchonete (copos e caixas "EW Lanches", caixa kraft) | Sim | Nenhuma |
| 6,10–6,72 | Caixas de pizza octogonais "Avenida" e "Nick Brasa", estáticas; glitch de arrasto em 6,75 | Sim | Nenhuma |
| 6,91–7,95 | Caixa kraft aberta e cartão "Amor em Crochê" carimbado com carimbo claro; chicote em 7,75 | Coberto pela legenda (tem telefone e nome "Andréia") | Mão nua |
| 7,95–8,68 | Sacola plástica branca "Ateliê da Tere" | Coberto pela legenda | Luva branca |
| 8,68–9,68 | Cartão kraft "Coffee"; glitch de arrasto em 8,75 | Sim (9,0–9,5) | Luvas pretas |
| 9,71–10,48 | Marmita de isopor "Humdindin Gourmet" | Parcial, sob a legenda | Luva preta |
| 10,48–11,22 | Copo de papel com tampa "Sorveteria do Paes" | Sim | Luvas pretas e pulseira |
| 11,25–11,50 | Mão nua carimba cartão com monograma; **placa rosa "Carimbos Tridi" e polvo 3D** ao fundo | Monograma pequeno | Mão nua |
| 11,50–11,70 | Flash branco ("ÁGIL" preto sobre branco) | n/a | n/a |
| 11,75–12,75 | **Parede roxa com o letreiro "Tridi"**, mão segurando sacola kraft "Delícias da Elaine" (corações) | Sim, com a legenda sobre a base da sacola | Mão nua |
| 12,75–13,00 | Transição em giro | n/a | n/a |

### ref2: b-roll de terceiros (carimbo de madeira com borracha)
| Tempo | O que mostra | Logo legível? | Mãos |
|---|---|---|---|
| 0,00–1,70 | Carimbo de madeira grande pressionado sobre sacola branca (superfície verde-água) | n/a | Mão masculina, moletom cinza |
| 1,70–2,27 | Revela "TRUE COST FLORALS" | Sim | Nua |
| 2,40–3,30 | Copo branco "Coffee Time" girando na mão | Sim | Mão feminina, unha rosa |
| 3,30–4,47 | Carimbinho em papel kraft "Coffee Time"; glitch em 4,5 | Sim | Nua |
| 4,53–6,00 | Copos kraft empilhados, carimbo na lateral, revela "Sippin Coffee Shop" | Sim (5,3–6,0) | Nua |
| 6,07–10,53 | Plano fixo de cima: mostra a borracha invertida (6,0–6,25), carimba o saco kraft e revela "Sippin" (8,6–10,0) | Sim | Nua |
| 10,53–10,70 | Glitch e corte para a apresentadora | n/a | n/a |

### ref3: b-roll de terceiros (mesma origem do ref2; "True Cost Florals" aparece nos dois)
| Tempo | O que mostra | Logo legível? | Mãos |
|---|---|---|---|
| 0,00–3,00 | Sacola kraft de cima, luz natural e folhagem: carimbo grande "MADE TO KEEP" (borracha invertida em 0–0,25), pressão com duas mãos, revelação em 2,4–2,9 | Sim | Nuas |
| 3,00–3,20 | Chicote | n/a | n/a |
| 3,20–6,50 | Sacola branca sobre verde-água, carimbo grande, revela "TRUE COST FLORALS" (5,75–6,3) | Sim | Nuas, moletom |
| 6,75–9,30 | Sacola branca, carimbo "Sigma" (busto esculpido), revelação em 9,2–9,6 | Sim, alto detalhe | Nuas |
| 10,00–12,00 | Copos vermelhos "Symbiose", carimbinho na lateral, revelação em 11,5–12,0 | Sim | Nuas |
| 12,00–15,20 | Caixa de papelão em luz de fim de tarde, carimbo grande "Symbiose", revelação em 14,8–15,2 | Sim | Nuas |
| 15,20–15,40 | Glitch de pixels e corte para a apresentadora | n/a | n/a |

### criativo.mp4 (antigo)
- 0,00–8,25: alicates de relevo seco (sinete metálico) em papel azul ("Mirage"), adesivo branco, guardanapo rosa com monograma, selo dourado, papel azul-claro e cartão branco. Visual bonito, mas é **outro produto**: não serve para vender carimbo de tinta.
- 8,25–8,45: transição em desfoque.
- 8,4–11,55: apresentadora, tomada C. Fade de 11,55 em diante.

## 3. Trechos da apresentadora
Mesma pessoa em todos: cabelo cacheado muito longo, polo roxa, calça preta, fundo de parede roxa lisa com luminárias de teto visíveis no topo. O enquadramento é de corpo inteiro até as coxas, com o rosto pequeno no quadro 9:16 (cabeça a ~10–25% da altura). Ela gesticula apontando para baixo, para o botão.

| Tomada | Arquivo e tempo | Fala (palavra a palavra, Whisper) | Observações |
|---|---|---|---|
| A | ref1 13,0–16,4 | "É isso que faz o cliente lembrar da sua marca" 13,06–14,94 · "Quer saber mais?" 15,12–15,68 · "Clique aqui." 15,86–16,24 | 720p. Legenda grande queimada no peito (y ≈ 73–80%), sem cobrir o rosto. Entra após o giro (12,75–13,0). |
| A (mesma) | ref2 10,7–14,4 | "É isso que faz o cliente lembrar da sua marca" 10,76–12,74 · "Quer saber mais?" 12,90–13,48 · "Clique aqui." 13,66–14,06 | Recorte quadrado com legenda pequena no rodapé. Entra por glitch em 10,53–10,7. |
| B | ref3 15,3–18,4 | "Faz diferença, né?" 15,32–16,28 · "Clique em Saiba Mais" 16,46–17,34 · "e garanta o seu!" 17,34–18,10 | Polo com logo bordado e relógio inteligente. Os primeiros quadros, até ~15,45, ainda estão no glitch. Legenda branca e roxa no rodapé (y ≈ 90%). |
| C | criativo.mp4 8,4–11,55 | "Faz" 8,28–8,74 (durante o desfoque) · "diferença," 8,74–9,12 · "né?" 9,42–9,46 · "Clique em Saiba Mais e garanta o seu!" 9,68–11,28 | 1080x1080. Provavelmente é outra tomada que não a B (o ritmo entre "Faz" e "Clique" difere: 1,40 s contra 1,14 s). A legenda queimada diz "CLICA EM". **Já existe plate limpo e matte** (ver seção 6). |

## 4. Legenda, ritmo de corte e transições
- **ref1**: legenda de 1 a 3 palavras por vez, gigante (~120–160 px em 1080), fonte condensada pesada no estilo Anton/Bebas, preenchimento texturizado ou em degradê (azul, cinza-prata, verde em "PROFISSIONAL"), centralizada em y ≈ 75–85%. Há um flash "ÁGIL" preto sobre branco. Ela cobre a base de várias embalagens. Ritmo: ~15 planos em 12,75 s, **média de ~0,85 s por plano**, com rampas de velocidade, chicotes (2,34; 7,75), arrastos de glitch (6,75; 8,75), flash branco (11,5) e giro (12,75).
- **ref2**: caixa-alta pequena (~40 px em 1080), sans pesada no estilo Lato Black, branca com a palavra ativa em amarelo, 1 a 2 palavras, no rodapé (y ≈ 92% do quadrado). Ritmo lento: ~6 planos em 10,5 s (**~1,8 s por plano**), com um plano fixo de 4,5 s. Glitch de pixels em 4,5 e 10,5.
- **ref3**: o mesmo estilo de ref2 com destaque roxo/magenta e contorno escuro, em y ≈ 90%, o que **colide com a interface do Reels** (legenda e botões). Ritmo de **~2,2 s por plano**, com chicote em 3,0 e glitch em 15,25.
- **criativo.mp4**: legenda branca e amarela no rodapé.

## 5. Áudio (medido)
| Arquivo | Loudness integrado | LRA | Pico | Leitura do espectrograma |
|---|---|---|---|---|
| ref1 | **-14,2 LUFS** | 3,4 LU | -0,8 dBFS | Trilha com grave contínuo (energia constante abaixo de 200 Hz) mais narração feminina em off do início ao fim. Whooshes e impactos de banda larga nos cortes (~0,3; 2,3; 6,9; 8,6; 9,6 s). Voz e trilha comprimidas juntas, mix denso. |
| ref2 | -15,9 LUFS | 4,8 LU | -3,9 dBFS | A voz domina. Trilha baixa ou intermitente (grave com buracos de -50 dB). Whoosh/glitch em 4,3 e 10,7 s. |
| ref3 | -14,3 LUFS | 3,8 LU | -0,4 dBFS | Voz quase seca, trilha muito baixa ou ausente (grave cai a -55 dB entre as frases). Glitch sonoro em 15,2 s. Fica mais alto na fala da apresentadora (~-10 LUFS momentâneo em 17,5 s). |
| criativo.mp4 | -14,7 LUFS | 16,5 LU | **+1,9 dBTP (clipa)** | Primeiros 8 s só com cliques mecânicos e trilha, voz a partir de 8,3 s. |

A narração em off do b-roll é feminina. Não confirmei se é a mesma apresentadora. Nenhum dos três usa som real da carimbada (o "toc" do carimbo) como elemento: está tudo coberto por voz e trilha.

## 6. Material próprio já processado (`projeto/public/`)
- `plate/p0001–p0107.jpg`: quadros de criativo.mp4 a partir de 7,6 s (1080x1080) com a **legenda queimada removida por inpaint**. A apresentadora aparece limpa.
- `matte/m0001–m0107.png`: a apresentadora recortada em RGBA (RVM em CPU), 1080x1080, 23,976 fps. Medi a cobertura alfa e a luminância quadro a quadro:
  - m0001–m0018 (7,60–8,31 s): vazios (ainda é b-roll);
  - m0019–m0022 (8,35–8,48 s): entrada borrada da transição;
  - **m0023–m0096 (≈ 8,52–11,56 s): utilizáveis**, com bom recorte de cabelo sobre fundo claro (verificado);
  - m0097–m0107: escurecem com o fade final (luminância de 89 a 37). Não usar.
  - Fala coberta pelo trecho limpo: "diferença, né? Clique em Saiba Mais e garanta o seu!" ("Faz" cai na entrada borrada).
- `audio/bed.wav` (12,07 s, -13,9 LUFS): trilha e SFX **sintetizados localmente** no projeto anterior, sem problema de licença, com ducking embutido para a voz do criativo.mp4. `music.wav` (-16,0 LUFS) e `sfx.wav` (-17,0 LUFS) são as camadas separadas.
- `dev-captions/plate34.png`, `plate60.png`: quadros de teste do plate.

## 7. Trechos reaproveitáveis (matéria-prima)
Nota = qualidade visual de 0 a 10, já descontando resolução, legenda queimada e borrão.
**Atenção:** em ref1, ref2 e ref3 **a legenda está queimada em todos os quadros**. Para reaproveitar, é preciso cortar acima da faixa da legenda (ref1: usar y < 70%; ref2/ref3: y < 85%), cobri-la com um elemento gráfico ou pedir os brutos ao usuário.

| # | Arquivo | Início–fim (s) | Descrição | Nota | Observação para uso |
|---|---|---|---|---|---|
| 1 | ref1.mp4 | 1,30–2,30 | Copo transparente "Açaí no Grau": carimbo sai, logo aparece, alto contraste | **8** | Melhor revelação própria. A legenda "CENTAVOS" pega a base do copo: recortar em y < 70% |
| 2 | ref1.mp4 | 11,75–12,70 | Mão segura sacola kraft "Delícias da Elaine" diante da parede roxa com o letreiro **Tridi** | **8** | Única imagem de marca e ambiente da Tridi. Legenda sobre a base da sacola |
| 3 | ref1.mp4 | 3,34–4,00 | Papel branco "I LOVE PRATINHOS", revelação limpa | 7 | Tem telefone do cliente visível (privacidade) |
| 4 | ref1.mp4 | 4,05–4,70 | Sacola amarela "Sapore di Nata": pressiona e levanta, com cenário 3D | 7 | Cor forte, bom para variedade |
| 5 | ref1.mp4 | 0,25–1,00 | Sacola laranja: levanta o carimbo e revela a ilustração | 7 | Bom gancho de cor (laranja e preto) |
| 6 | ref1.mp4 | 10,55–11,20 | Copo de papel "Sorveteria do Paes" na mão enluvada | 7 | Legenda fica abaixo do copo |
| 7 | ref1.mp4 | 5,70–6,70 | Composição de embalagens de lanchonete e caixas de pizza "Avenida"/"Nick Brasa" carimbadas | 7 | Plano estático: bom para uma "parede de marcas" ou prova de variedade |
| 8 | ref1.mp4 | 4,78–5,60 | Caixa kraft "Petulance" | 6 | Logo pequeno |
| 9 | ref1.mp4 | 9,00–9,60 | Cartão kraft "Coffee" | 6 | Logo parcialmente sob a legenda |
| 10 | ref1.mp4 | 11,25–11,48 | Mão carimba cartão; placa "Carimbos Tridi" e polvo 3D ao fundo | 6 | Curto (0,23 s), útil como lampejo de marca |
| 11 | ref1.mp4 | 13,10–14,95 | Apresentadora A: "É isso que faz o cliente lembrar da sua marca" | 6 | 720p e legenda no peito. Rosto limpo; dá para usar em plano médio cortado acima da legenda (fica suave por causa da ampliação) |
| 12 | ref1.mp4 | 15,10–16,30 | Apresentadora A: "Quer saber mais? Clique aqui." | 6 | Mesmas condições |
| 13 | **projeto/public/matte + plate** (criativo.mp4) | m0023–m0096 ≈ 8,52–11,56 | Apresentadora C **já recortada e sem legenda**: "diferença, né? Clique em Saiba Mais e garanta o seu!" | **8** | Melhor fonte da apresentadora: limpa, 1080, recorte pronto. Voz do criativo.mp4 nos mesmos tempos (pico original +1,9 dBTP: aplicar -3,5 dB) |
| 14 | ref3.mp4 | 15,45–16,30 | Apresentadora B: "Faz diferença, né?" (sem o glitch) | 6 | Legenda queimada a y ≈ 90%; cortar acima dela |
| 15 | ref3.mp4 | 16,45–18,10 | Apresentadora B: "Clique em Saiba Mais e garanta o seu!" | 6 | Idem |
| 16 | projeto/public/audio/bed.wav | 0–12,07 | Trilha e SFX sintetizados (livres) | 6 | Reaproveitável como base sonora sem licença |
| 17 | ref3.mp4 | 12,00–15,20 | Caixa de papelão em luz quente, carimbo grande "Symbiose" e revelação | 8 visual / **uso: evitar** | Produto (carimbo de madeira) e marca de terceiros |
| 18 | ref3.mp4 | 6,75–9,60 | Carimbo "Sigma" (busto), revelação muito detalhada | 8 visual / **uso: evitar** | Idem |
| 19 | ref3.mp4 | 0,00–2,90 | Sacola kraft "MADE TO KEEP": borracha invertida, pressão e revelação, luz natural | 8 visual / **uso: evitar** | Idem |
| 20 | ref2.mp4 | 6,00–10,00 | Plano fixo de cima: borracha "Sippin", carimbada e revelação no saco kraft | 7 visual / **uso: evitar** | Idem (vídeo quadrado) |
| 21 | criativo.mp4 | 0,00–8,25 | Alicates de relevo seco | 8 visual / **uso: não** | Outro produto: induziria o cliente a erro |

**Resumo do que é próprio e utilizável:** o b-roll do ref1 (itens 1 a 10), a apresentadora (itens 11 a 15, com prioridade para o matte, item 13) e o bed sintético (item 16). O b-roll de ref2 e ref3 mostra carimbos de madeira com marcas estrangeiras ("True Cost Florals", "Sippin", "Made to Keep", "Sigma", "Symbiose"). Tudo indica que não é material da Tridi nem o produto que ela entrega. Não usar até o usuário confirmar a origem e a licença, pela regra de coerência entre anúncio e página da Meta e por direitos autorais.

## 8. O "jeito de sempre" (o que se repete nos 3)
1. **Abre direto na mão carimbando uma embalagem.** O primeiro quadro é igual nos três: não há pergunta visual, tensão nem algo inesperado. O gancho fica só na fala ("Por menos de 30 centavos…", "Enquanto outros pagam gráficas…", "Você capricha no produto…").
2. **Estrutura fixa:** ~80% de b-roll de processo com narração em off, depois a apresentadora na parede roxa só para o CTA nos últimos 3 a 4 s.
3. **A mesma revelação repetida:** "carimbo sobe, logo aparece" de 6 a 14 vezes por vídeo. A partir da terceira, deixa de surpreender.
4. **Benefício genérico e abstrato:** "lembrar da sua marca", "profissional", "faz diferença". Não há mecanismo (como funciona, quanto dura, quantas aplicações), objeção respondida, prova de cliente nomeada nem oferta concreta na tela.
5. **CTA genérico e igual:** "Quer saber mais? Clique aqui" / "Clique em Saiba Mais e garanta o seu". A mesma tomada A aparece em dois anúncios.
6. **Legenda queimada no rodapé** como único elemento gráfico. Em ref2 e ref3 ela fica pequena e baixa, na zona da interface do Reels. Não há título, cartão, número nem gráfico explicativo.
7. **Transições de template** (chicote, giro, glitch de pixels, flash) sem função narrativa.
8. **Final morto:** de 0,6 a 1,8 s de fade para preto em todos.
9. **Apresentadora subaproveitada:** corpo inteiro, rosto pequeno, teto e luminárias no quadro. Nunca segura nem demonstra o produto.
10. **Trilha e narração cobrindo tudo:** o som real da carimbada (ASMR do "toc" e do descolar) nunca aparece.
11. **O produto Tridi em si quase não aparece:** o carimbo, a almofada, a caixa, a arte da logo virando carimbo, a fábrica e a impressão 3D (o "Tridi" do nome) não estão nos vídeos. Os destaques do Instagram com vídeos de clientes reais também não são usados.
12. **Formato inconsistente:** ref2 é 1:1. Os outros são 720p, o que fica suave em 1080x1920.

### Para os conceitos fugirem disso
- Gancho visual que não seja "mão carimbando", por exemplo: a embalagem "sem marca" sendo descartada ou confundida, uma parede de dezenas de marcas reais (itens 1 a 7) montando um mosaico, ou a logo do cliente virando carimbo.
- Uma única revelação, guardada para o clímax, com o som real da carimbada em destaque e a trilha baixa.
- Mostrar o mecanismo (arte → carimbo → aplicação em vários materiais) com gráficos dentro do 4:5 central, e não só legenda.
- Apresentadora (matte, item 13) usada como personagem dentro de uma moldura ou cena, não só como rodapé de CTA. Cortar em plano médio.
- CTA específico e coerente com o funil "type" (conversa estilo Direct), sem fade morto no final.

## 9. Lacunas e pontos a confirmar com o usuário
1. **Brutos sem legenda** do b-roll do ref1 e da apresentadora (tomadas A e B). Isso eleva muito a qualidade do reaproveitamento.
2. **Origem do b-roll de ref2 e ref3**: é da Tridi ou de terceiros? Hoje considerei "não usar".
3. **Autorização dos clientes** cujas marcas aparecem ("Açaí no Grau", "I Love Pratinhos", "Sapore di Nata", "Delícias da Elaine" etc.). Alguns quadros mostram telefone e nome de pessoa ("Amor em Crochê – Andréia", "I Love Pratinhos").
4. **Números e oferta**: "menos de 30 centavos" e "centavos por aplicação" são afirmações do próprio anunciante. Confirmar antes de repetir, assim como a "garantia de 7 dias / Risco Zero" e o preço.
5. A narração em off é da apresentadora ou de outra voz? Isso define se dá para reaproveitar mais falas dela.
