# Oferta Carimbos Tridi: leitura do funil e do site

Lido em 10/11/2026 no navegador interno. Registrei só o que estava escrito na tela (ou nas respostas da API do próprio chat/loja). Não comprei nada, não preenchi formulário e parei o chat no campo de telefone.

Fontes:
- **[CHAT]**: https://chat.carimbostridi.com/type-carimbos-tridi (Typebot com visual de Direct do Instagram, perfil "carimbos.tridi · Online", avatar do polvo roxo). A página https://tridicarimbos.com.br/typecarimbostridi/ (WordPress/Elementor, título interno "type-carimbos-tridi-BM Douglas") só embute esse chat num iframe, sem nenhum outro texto.
- **[SITE]**: https://carimbostridi.com.br (loja Shopify).
- **[PROD]**: página de produto "Carimbo Personalizado para Todas Embalagens" e os demais produtos.
- **[POL]**: /policies/refund-policy (Política de trocas e devolução).
- **[TERMO]**: /policies/terms-of-service (Termo de Aceite e Responsabilidade).

---

## 1. Roteiro completo do funil em chat [CHAT]

Visual: fundo preto, balões cinza-escuros (#262626) com texto branco, botões roxos (#6300db), balões do usuário lilás (#894df6). No topo, uma barra com o status "digitando..." / "gravando áudio..." / "Online". Há atrasos simulados de digitação entre as mensagens. Pixels disparados: AddToWishlist (passo 2) e ViewContent (passo 3).

**Passo 1 (abertura, sem clique)**
- [GIF] Close de uma mão de luva preta pressionando um carimbo (base escura) sobre um saco plástico branco. A estampa é de um cliente: "ATELIÊ DA TERE · ARTE EM CROCHÊ" com novelos, WhatsApp, @ e endereço (São Miguel / Francisco Beltrão-PR). Logo depois aparece uma luva branca segurando o saco já carimbado.
- "Incrível o resultado, né? 😍"
- "Muita gente ainda não sabe, mas hoje com os **carimbos de alta precisão** é possível personalizar embalagens **com a mesma qualidade de gráfica.**"
- "Quer saber mais sobre os **custos de personalizar com o carimbo?**"
- Botão: **"Sim, quero saber"**

**Passo 2 (mecanismo)**
- "Antes de falar de custo, **é importante você entender uma coisa** 👇"
- [GIF] Máquina a laser (mesa colmeia) em movimento rápido, gravando/cortando.
- "Nossos carimbos **não são comuns**."
- "Eles são fabricados com **borracha sólida**, em **máquinas a laser de alta precisão**."
- "Isso garante **traços definidos, sem falhas e borrões.**"
- Botão: **"Me mostra os benefícios."**

**Passo 3 (benefícios + prova)**
- "Na prática, **esse método te ajuda a:**"
- [Imagem "Essa-embalagem-e-a-nova-tendencia.png"] Sacola kraft com alça e um carimbo preto de caricatura: mulher de óculos e lenço fazendo "ok", com o texto "O Melhor Caldinho de Sanja!", um WhatsApp e "CaldoDaVo.Com".
- "✅ Personalizar suas embalagens por menos de R$0,30 centavos a unidade."
  "✅ Personalizar diferentes embalagens com o mesmo carimbo."
  "✅ Ter durabilidade de mais de 5 anos."
- "**E o mais importante** 👇"
- "**Você não depende de terceiros** e consegue usar sempre que precisar."
- "Olha o que acontece **depois que as pessoas começam a usar** 👇"
- [GIF, UGC] Jovem de cabelo escuro falando para a câmera e segurando um carimbo grande de borracha (base de madeira/MDF com logo em relevo). Tem legenda palavra a palavra em caixa roxa (aparece "grande.") e a marca d'água "@carimbos.tridi".
- Botão: **"Como funciona a compra?"**

**Passo 4 (processo pós-compra)**
- "**Funciona assim, é bem simples:** 👇"
- "**Após compra ✅**
  1️⃣ Entraremos em **contato pelo WhatsApp** para coletar a arte. (caso você não tenha nós fazemos)
  2️⃣ Vamos fazer um modelo de **como vai ficar o seu carimbo e mandar pelo WhatsApp para você aprovar!**
  3️⃣ Após a sua aprovação iremos **fabricar e te enviar em até 3 dias úteis!**"
- "Agora que você já sabe como vai funcionar após a compra, posso te mandar **nossa oferta?**"
- Botão: **"Me manda!"**

**Passo 5 (captura de lead): PAREI AQUI**
- "Qual número podemos chamar para **coletar a arte do carimbo** após a compra?"
- Campo de telefone com DDD, país padrão BR (placeholder "Digite seu número de telefone com DDD"; erro: "Número incorreto. Digite novamente!").
- Não digitei nada. **A oferta (preço/kit) só aparece depois do telefone**, então não sei o que o chat oferece dali em diante (preço, kit, link de checkout, cupom). Ver perguntas na seção 9.

Observação: o chat não fala em preço do carimbo, garantia, frete, forma de pagamento nem depoimento escrito. Os únicos números são "menos de R$0,30 a unidade", "mais de 5 anos de durabilidade" e "até 3 dias úteis".

---

## 2. Fatos da oferta (e onde apareceram)

### Produto principal
- **"Carimbo Personalizado para Todas Embalagens"** [PROD], tag "Mais vendidos". O preço varia pelo tamanho (o maior lado da arte):
  | Tamanho | Preço |
  |---|---|
  | 4 cm | R$ 89,90 (ou 12x de R$ 9,11) |
  | 5 cm | R$ 99,90 |
  | 8 cm | R$ 152,90 |
  | 10 cm | R$ 172,90 |
  | 12 cm | R$ 192,90 |
  | 15 cm | R$ 210,90 |
- A mesma tabela de preços vale para as versões por material: Sacola Kraft (Papel), Isopor, Embalagens Plásticas, Caixa de Papelão, Tecido e Madeira [SITE/products.json].
- Variantes de "Carimbo Personalizado - Para Todas Embalagens" (outro link, provavelmente de campanha): Menor Tamanho R$ 152,90 · Maior Tamanho R$ 192,90 · **Kit Maior e Menor Tamanho R$ 247,90**.
- **Kit 3 Carimbos personalizados (P, M e G)**: R$ 247,90.
- **Carimbo 16 cm²**: R$ 97,90 (de R$ 107,90). **Carimbo 9 cm²**: R$ 74,90 (de R$ 97,90). Os dois dizem "garanta já o seu Carimbo com Frete Grátis!". **Carimbo 8 cm** avulso: R$ 152,90.
- Outros: Carimbo para Sabonete e para Cerâmica (3–6 cm, R$ 81,90 a R$ 91,90); Carimbo de Cera/Sinete R$ 115,90 (de R$ 157,90, "27% OFF"); Carimbo com Nome Personalizado R$ 97,60 (de R$ 119,90, "Frete Grátis"); Alfabeto Kit Completo R$ 93,70; **Chancela Personalizada MDF** R$ 242,90 (alto-relevo, "sem tinta, só pressão", MDF com acrílico, acompanha 1 clichê); **Kit Chancela MDF + Carimbo 16cm²** R$ 297,90 ("Produzimos e enviamos com frete grátis", "Criamos uma arte para você sem custo adicional"); também cortadores de biscoito e logo/nome de parede em LED.
- **Almofada para Carimbo, vendida à parte e "SEM TINTA"**: 6x6 cm R$ 59,90 · 11x11 R$ 69,90 · 16x16 R$ 76,90 · 22x22 R$ 112,90 · 32x32 R$ 132,90. Diferenciais citados: preenchimento constante e homogêneo, preenchimento intenso (alta absorção) e limpador embutido na tampa.
- **Não encontrei tinta à venda** no catálogo.

### Processo, prazo e frete
- Depois da compra: contato por **WhatsApp** para coletar a arte; aceitam PNG, JPG, vetor, PDF ou até foto. Se o cliente não tiver logo, **a Tridi faz a arte** [CHAT; PROD FAQ; Kit Chancela: "sem custo adicional"].
- **Aprovação da arte** antes da produção [CHAT; PROD FAQ].
- **"Fabricar e te enviar em até 3 dias úteis"** depois da aprovação [CHAT]. O [TERMO] 2.2/2.3 diz que os prazos "são estimativas médias" e que podem ser prorrogados "em até 60 (sessenta) dias úteis" por motivos técnicos ou logísticos.
- Entrega pelos **Correios** [PROD]. Há "Frete Grátis" em alguns produtos (16 cm², 9 cm², Nome, Kit Chancela); no produto principal não vi frete grátis escrito.
- Pagamento: parcelamento em **até 12x** no cartão [SITE/PROD]. A política cita cartão de crédito, boleto e PIX (na parte de restituição) [POL].

### Garantia e devolução (ATENÇÃO: há conflito)
- Página de produto: "**Devolução grátis. Até 7 dias a partir do recebimento.**" e "**Compra Garantida. Ou seu dinheiro de volta**" [PROD].
- Criativo estático que o usuário enviou: selo "RISCO ZERO · 7 DIAS DE GARANTIA".
- Política [POL]: produtos personalizados **não têm troca, devolução nem reembolso por desistência ou arrependimento**. O arrependimento só vale "caso o produto ainda não esteja em processo de produção". Defeito de fabricação: reembolso dentro de 7 dias corridos do recebimento, troca dentro da garantia legal de 90 dias. "Não gostei" é analisado caso a caso.
- [TERMO] 4.x/5.x: o desgaste da borracha e da almofada não é defeito. O resultado depende de tinta, almofada, superfície e pressão, que ficam por conta do cliente.
- **Conclusão: não usar "risco zero", "dinheiro de volta" nem "7 dias de garantia" no vídeo sem o usuário confirmar o que vale de fato.**

### Empresa
- Faixa do topo do site: "**Qualidade com preço direto de fábrica**" [SITE].
- "Somos uma empresa especializada em carimbos de alta qualidade para personalizar qualquer tipo de embalagem, independentemente do material." [SITE, Sobre nós]
- "atuando há **mais de 5 anos** no mercado", "Localizada na cidade de **Cerqueira César-SP**", "infraestrutura própria de design, produção e acabamento", "tecnologia de **corte a laser** de alta precisão" [TERMO].
- Rodapé: TRIDI FABRICACAO DE PRODUTOS DIVERSOS LTDA, CNPJ 40.819.810/0001-99. O termo usa outra razão social: "TRIDI COMERCIALIZACAO DE PRODUTOS DIVERSOS LTDA". Atendimento: atendimento@ e sac@tridixp.com.br; WhatsApp (14) 99854-4623; seg–sex 8h–17h, sáb 9h–12h.
- A [POL] fala em "pequena equipe de pessoas dedicadas e apaixonadas pelo que fazem" e em produtos "personalizados individualmente com muito amor e carinho".

---

## 3. Provas reais disponíveis

| Prova | Onde | É verificável? |
|---|---|---|
| Saco plástico carimbado "Ateliê da Tere – Arte em Crochê" (GIF da mão carimbando) | [CHAT] passo 1 | É material real de cliente (logo, @ e endereço visíveis). Para usar no anúncio, convém autorização do cliente ou desfocar os contatos. |
| Sacola kraft "O Melhor Caldinho de Sanja! / CaldoDaVo.Com" com caricatura | [CHAT] passo 3 | Mesma situação: arte real de cliente, com telefone visível. |
| GIF UGC de uma moça mostrando um carimbo grande com legenda | [CHAT] passo 3 | Parece cliente ou criadora de UGC; não sei se é cliente real ou conteúdo pago. Perguntar. |
| Máquina a laser em operação | [CHAT] passo 2 | Mostra o processo; não sei se é da própria fábrica ou banco de imagem. Perguntar. |
| 3 vídeos de clientes nos destaques do Instagram (imagem 7.png do usuário) | Instagram @carimbos.tridi | Prova social real, se o usuário tiver os arquivos e autorização. |
| "Doces da Vovó" (sacola + carimbo no banner do site) | [SITE] banner | Parece mockup ou peça de vitrine. |
| "menos de R$0,30 a unidade" | [CHAT]; refs atuais | Número do anunciante, **sem conta mostrada** (o custo por aplicação depende de tinta e almofada, vendidas à parte ou sem tinta). Confirmar a base do cálculo. |
| "durabilidade de mais de 5 anos" | [CHAT] | Afirmação do anunciante, sem prova. Atenção: a empresa diz ter "mais de 5 anos" de mercado, então pode ser difícil de comprovar. Confirmar. |
| "até 3 dias úteis" | [CHAT] | Promessa do anunciante; o termo permite prorrogar até 60 dias úteis. Confirmar antes de usar. |
| "mesma qualidade de gráfica" / "parecer impresso" | [CHAT]; [PROD 16cm²] | Comparativo do anunciante. Melhor **mostrar** (close da estampa nítida) do que afirmar. |

**Não encontrei no site:** avaliações com estrelas, depoimentos escritos, número de clientes ou pedidos, nem selos de imprensa. Não inventar nada disso.

---

## 4. Público provável
- Pequenos empreendedores que vendem em embalagem: delivery e food (caldos, doces, confeitaria, pizza, lanches, açaí em copo/isopor), artesanato (crochê, ateliês), sabonetes artesanais, cerâmica, moda e brechó (sacola kraft/plástica), lojas de presente e papelaria.
- Negócio de casa ou pequeno, que ainda entrega em embalagem lisa porque a gráfica exige pedido mínimo e custa caro.
- Gente que compra pelo Instagram e responde a chat/Direct (o funil imita o Direct).
- Usam a palavra "empreendedor" o tempo todo [PROD].

## 5. Dores, desejos e objeções que a própria comunicação usa
**Dores**
- "altos custos de personalizar embalagens em gráficas e com a quantidade mínima que a mesma exige" [PROD 16cm²].
- Pedido mínimo, **estoque parado** e desperdício de embalagens impressas [PROD].
- Depender de terceiros (gráfica) [CHAT].
- (Nos anúncios atuais) caprichar no produto e entregar numa embalagem sem marca.

**Desejos**
- Que "o cliente se lembre da sua marca" / "futuras compras" [PROD; refs].
- Ar de marca premium com toque artesanal [Kit Chancela]; "Seu negócio ganha, seus clientes se lembram." [PROD Plásticas].
- Usar sempre que precisar, sem depender de ninguém [CHAT].

**Objeções que eles respondem**
- "Carimbo fica borrado/feio": borracha sólida + laser = "traços definidos, sem falhas e borrões" [CHAT].
- "Não tenho logo": "caso você não tenha nós fazemos" [CHAT].
- "E se não ficar como eu quero?": aprovação da arte pelo WhatsApp antes de produzir [CHAT/PROD].
- "Serve na minha embalagem?": o mesmo carimbo serve em kraft, plástico, isopor, papelão, tecido e copos [PROD].
- "É caro?": "menos de R$0,30 a unidade" [CHAT].
- "Demora?": "até 3 dias úteis" [CHAT].
- "E se der errado?": "Compra garantida" na página [PROD] (com o conflito descrito na seção 2).

## 6. Mecanismo (como funciona)
- O carimbo é de **borracha sólida gravada/cortada a laser** de alta precisão, com a arte do cliente [CHAT/PROD/TERMO].
- Nos carimbos manuais, a **base é reduzida para ficar proporcional à arte**, para dar precisão, menos peso e força direto na área de tinta [TERMO 6.4]. O tamanho é medido **pelo maior lado da arte** (4 a 15 cm) [TERMO 6.3]. Também existe o termo "carimbos automáticos" (carcaça plástica), mas não vi esse produto no catálogo.
- Para usar: entintar na **almofada** (vendida à parte, sem tinta) e pressionar sobre a embalagem. O resultado depende de tinta, almofada, superfície e pressão [TERMO 4.1/9.3].
- O mesmo carimbo serve em vários materiais [PROD]. **O site não diz qual tinta usar** em cada material (plástico e isopor normalmente pedem tinta específica).
- A chancela é diferente: alto-relevo por pressão, **sem tinta**, em papel, tag, convite e envelope [Chancela].

## 7. Diferenciais declarados
1. Precisão a laser + borracha sólida, com "qualidade de gráfica" / "parece impresso".
2. **Sem pedido mínimo** e sem estoque parado.
3. **Um carimbo para todas as embalagens.**
4. Arte criada por eles se o cliente não tiver logo, com aprovação antes de produzir.
5. Fabricação própria ("preço direto de fábrica", Cerqueira César-SP, mais de 5 anos).
6. Rapidez: "até 3 dias úteis" [CHAT].
7. Custo por aplicação "menos de R$0,30" [CHAT].
8. Almofada própria com limpador na tampa.

## 8. Ganchos e ângulos que a oferta permite (sem inventar)
- Contraste "gráfica × carimbo": pedido mínimo e estoque parado de um lado, carimbar só o que vai vender do outro.
- "Muita gente ainda não sabe…": revelação de que um carimbo pode ter qualidade de gráfica (é o próprio gancho do chat).
- Formato Direct/chat do Instagram (o funil já é assim): dá para fazer um criativo que *é* uma conversa, o que conversa bem com o funil de destino.
- Close macro da estampa nítida (prova visual de "sem borrões") e a mesma logo passando por kraft → plástico → isopor → copo (prova de "um carimbo, todas as embalagens").
- Usar artes reais de clientes (Ateliê da Tere, Caldinho de Sanja) **só com autorização**.

## 9. O que NÃO está claro (perguntar ao usuário)
1. **Qual é a oferta que o chat mostra depois do telefone?** Produto, tamanho, preço, kit, desconto, frete grátis, checkout. O CTA do vídeo deve combinar com isso.
2. **"Menos de R$0,30 por unidade":** qual a conta (tinta + almofada ÷ aplicações? preço do carimbo ÷ usos?). Pode aparecer como número na tela?
3. **"Durabilidade de mais de 5 anos":** de onde vem? Pode ser usada?
4. **"Até 3 dias úteis":** é o prazo real atual de produção + envio, ou só de fabricação? O termo permite até 60 dias úteis a mais.
5. **Garantia:** o anúncio pode dizer "7 dias de garantia" / "risco zero" / "compra garantida"? A política diz que personalizados não têm devolução por arrependimento.
6. **Tinta:** vem junto? Qual tinta para plástico, isopor e tecido? A almofada é vendida "sem tinta" e não achei tinta no catálogo.
7. **Frete grátis:** vale para o produto anunciado no funil "type"?
8. **Autorização** para mostrar as embalagens dos clientes (Ateliê da Tere, O Melhor Caldinho de Sanja, clientes dos destaques) e o GIF da moça com o carimbo: é cliente real ou UGC contratado?
9. A máquina a laser do GIF é a da fábrica? Existem vídeos brutos da produção (laser gravando a borracha) em melhor qualidade? Seria uma prova forte e diferente do que eles já rodam.
10. Qual tamanho é o mais vendido ou recomendado para quem está começando (4 cm a R$ 89,90?), e se o vídeo deve citar preço ou só levar ao chat.
11. Razão social divergente no rodapé (FABRICACAO) e no termo (COMERCIALIZACAO): não afeta o vídeo, só registro.
