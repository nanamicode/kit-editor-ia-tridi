# Índice de efeitos de edição (catálogo FCA) — 391 efeitos, 17 famílias

Fonte completa (assinatura, invariantes, proibições, limites): `<ACERVO>/efeitos-e-estilos/catalogo-de-efeitos.json` (lista de objetos; busca por `id`).

Exemplo: `PYTHONIOENCODING=utf-8 python -c "import json;L=json.load(open(r'<ACERVO>/efeitos-e-estilos/catalogo-de-efeitos.json',encoding='utf-8'));print(json.dumps([e for e in L if e['id']=='chevron-duplo-cta'],ensure_ascii=False,indent=1))"`

Formato: `id | nome | para quê | gatilhos de fala | insumos | seg 9:16 | flags`. Busque com grep por id ou palavra da relação (ex.: `grep -i "preço" efeitos-indice.md`).

Flags: 🎤 exige apresentador · ✂ exige recorte (✂~ recorte preferido) · ⚠ tem limites_9x16 (contagem, caracteres, linhas etc.; ver JSON) · 💲 proíbe valor em dinheiro/promessa de ganho na tela · 📎 exige origem do dado (sem origem = selo SIMULAÇÃO) · #dado = precisa de dado numérico · A0–A3 = nota de adequação a anúncio (campo notas.anuncio). Insumos: imagens/arquivos pedidos; “-” = só texto/sem insumo obrigatório. Seg 9:16 “-” = o catálogo não informa duração.


## tipografia (59)

titulo-atras-da-pessoa | Título atrás da pessoa | nomear o tema em letras gigantes sem tampar o rosto | “hoje: tráfego com IA”; “o assunto é” | - | 4.1 | 🎤 ✂ ⚠ A3
choque-e-afirmacao | Palavra-choque e afirmação | uma palavra de impacto seguida da frase que a explica | “PARE.”; “chega disso” | - | 4.1 | 🎤 ⚠ A3
copy-riscada-e-corrigida | Copy riscada e corrigida | contrapor o jeito errado e o certo de dizer | “não escreva isso, escreva aquilo”; “o erro não é X, é Y” | - | 4.1 | ⚠ A3
redefinicao-de-termo | Redefinição de termo | o que você achava que era X, na verdade é Y | “isso não é o que você pensa”; “marketing não é propaganda” | contexto | 4.1 | ⚠ A3
legenda-palavra-chave | Legenda com palavra-chave | legenda que acompanha a fala e destaca a palavra que vende | “qualquer fala curta com 1 ou 2 palavras-chave”; “palavra amarela gigante” | - | 4.1 | 🎤 ⚠ A2
rotulos-opostos-rosto-no-meio | Dois lados com o rosto no meio | tensão entre dois lados | “de um lado... do outro”; “agência ou sozinho” | - | 4.1 | 🎤 ⚠ A3
pergunta-no-ar | Pergunta que fica no ar | deixar uma pergunta pairando | “e se...?”; “quanto você perde por dia?” | pensador-ou-autor | 3.5 | ⚠ A2
numero-e-veredito-sobre-video | Número e veredito sobre o vídeo | uma medida e o que ela significa | “46% de abertura: bom”; “ROAS 3,2, acima da meta” | #dado | 4.1 | 🎤 ⚠ 📎 A3
etiquetas-que-acumulam | Etiquetas que acumulam | lista de usos, nichos ou exemplos curtos | “serve para dentista, advogado, corretor”; “para quem é” | - | 4.1 | 🎤 ⚠ A3
termos-que-sufocam | Termos que sufocam | sobrecarga: coisas demais ao redor da pessoa | “SEO, e-mail, anúncio, CRM... e você sozinho”; “é coisa demais” | foto-central | 4.1 | 🎤 ⚠ A3
titulo-toma-a-tela | Título que toma a tela | nomear um conceito e deixá-lo ocupar a tela | “regra número um”; “prova primeiro” | - | 3.5 | 🎤 ✂ ⚠ A3
nuvem-de-topicos-atras | Nuvem de tópicos atrás da pessoa | um assunto e as ideias que giram em torno | “tudo que envolve tráfego”; “público, criativo, oferta, página” | - | 4.1 | 🎤 ✂ ⚠ A2
checklist-na-parede | Checklist escrito na parede | itens para anotar no espaço livre do cenário | “anota aí”; “três coisas antes de subir” | parede-lisa | 4.1 | ✂~ ⚠ A2
cartela-frase-palavra-colorida | Cartela de frase com palavra colorida | uma frase da locução vira uma tela; a palavra em que o lead deve prestar atenção… | “esse é o poder de algo bem construído”; “vamos validar uma empresa” | midia-opcional-no-topo | 1.5 | ⚠ A3
palavra-gigante-em-rajada | Palavra gigante em rajada | enumerar perguntas ou benefícios, uma palavra por tela, em sequência rápida | “RELAÇÃO? MÃE? TRAÍDO? VEZ? NOME?”; “prende, entretém, identidade, prioridade, imediato” | - | - | ⚠ A2
golpe-de-cor-chapado | Golpe de cor chapado | quebrar o ritmo no termo central, na confissão ou no preço | “eu fiz o mesmo”; “na mesma tecla” | - | 1 | ⚠ A3
frase-digitada-com-tecla | Frase digitada com tecla | a frase aparece como se estivesse sendo escrita agora; o termo é reescrito diante… | “marketing digital… (reescrito como copy)”; “vamos validar uma empresa” | - | 0.9 | ⚠ A2
palavra-desembaca | Palavra que desembaça | a palavra de impacto (ou o dado que dói) surge borrada e entra em foco | “no digital”; “menos de 1 hora por noite” | fundo-escuro-opcional | 0.65 | ⚠ A3
zoom-na-palavra-final | Zoom na palavra final | a última palavra da frase precisa pesar | “algo bem construído”; “mãe?” | - | - | ⚠ A2
callback-das-perguntas | Callback das perguntas | revelar o mecanismo retomando as perguntas do início, com a mais forte por último | “eu vou deixar essa resposta para o último”; “lembra das perguntas do começo?” | - | - | ⚠ A1
ironia-que-treme | Ironia que treme | ironizar o preço baixo do mercado para filtrar o lead | “o que fazemos não é barato”; “**baratinho**” | - | - | ⚠ A1
texto-fantasma-comido | Texto fantasma | tensão antes da solução: a frase ecoa e as palavras são comidas pela borda | “se você não sabe como vender esse produto” | - | - | ⚠ A2
marca-texto-no-numero | Marca-texto no número | destacar o número que define o personagem ou o dado | “45 anos”; “depois dos 40” | - | - | ⚠ A3
icone-acima-da-frase | Ícone acima da frase | dar subtexto visual a uma palavra abstrata sem foto | “sem tempo”; “agrego” | - | - | ⚠ A2
titulo-de-filme-sobre-foto-escura | Título de filme sobre foto escura | nomear a peça, o mecanismo ou a oferta com peso de título de filme | “acesso vitalício”; “isto é uma VSL” | foto-ou-clipe-de-fundo | - | ⚠ A2
entrada-sobria-da-cartela | Entrada sóbria por tipo de frase | dar vida à cartela sem que a animação chame atenção | “qualquer cartela de frase da peça” | - | 0.5 | ⚠ A3
serifa-leve-branca-sobre-preto | Serifa leve branca sobre preto | escolher a tipografia pela emoção do público (leve para público agitado) | “(público TDAH/agitado)”; “fina = chique, grossa = descontraído” | - | - | ⚠ A2
dores-empilhadas-que-se-completam | Dores empilhadas que se completam | listar sintomas que o cérebro iguala a uma ideia | “falta de foco, procrastinação, hiperatividade”; “tudo isso é…” | - | - | ⚠ A3
cartela-entra-na-palavra-dita | Cartela que entra na palavra dita | sincronizar cada dor/pergunta na tela com o momento em que é falada | “(toda cartela de anúncio)” | - | - | A3
REF-EDICAO-IA-EF-11 | Capa de revista sobre o take (cover story) | dar status de 'matéria de capa' a um nome, marca ou resultado | “cover story”; “capa de revista” | - | 1.5 | 🎤 ⚠ A2
REF-EDICAO-IA-EF-14 | Rótulo de story no topo (gancho em faixa preta) | resumir o tema em uma afirmação de 3–7 palavras com âncora conhecida, legível no… | “rótulo no topo”; “texto de story” | - | 3 | 🎤 ⚠ A3
REF-EDICAO-IA-EF-20 | Letras que caem com quique (gravity drop) | dar peso físico a uma palavra curta: ela 'cai' na tela | “gravity drop”; “letras caindo” | - | 1 | ⚠ A2
REF-EDICAO-IA-EF-21 | Tarja que cresce e vai ao canto (giant captions) | transformar a palavra-chave da legenda em título da cena: nasce pequena no centro e… | “giant captions”; “legenda gigante” | - | 1 | ⚠ A2
REF-EDICAO-IA-EF-22 | Gancho cinético letra a letra (kinetic hook) | abrir com o gancho se montando na frente do espectador, letra por letra, com… | “kinetic hook”; “gancho cinético” | - | 1 | ⚠ A2
REF-EDICAO-IA-EF-23 | Legenda que troca de estilo por trecho | provar versatilidade ('edita no seu estilo') e reiniciar a atenção mudando o… | “legenda que troca de estilo”; “estilo de legenda” | - | - | 🎤 ✂~ ⚠ A2
tarjas-amarelas-rasgadas-palavra-a-palavra | Tarjas amarelas de papel rasgado, uma por palavra | dar peso a cada palavra-chave do gancho como tarja de papel | “olha”; “isso” | - | 1 | ⚠ A3
legenda-em-tira-de-papel-rasgado-digitada | Legenda em tira de papel rasgado, digitada | mostrar a frase-chave como legenda de papel que digita | “isso parece”; “como se fosse” | - | 1 | ⚠ A2
legenda-corre-durante-recuo-de-camera | Legenda palavra-chave que corre durante o recuo | ligar a legenda ao movimento de câmera | “arquivo”; “recuo” | - | 0.8 | ⚠ A2
tarja-marca-texto-que-cresce | Tarja amarela do tamanho da frase, texto digitando dentro | a frase narrada aparece dentro de uma tarja do tamanho exato do texto | “e foi assim que”; “em 1854” | imagem de arquivo própria ou gerada | 2 | ⚠ A3
tarja-de-texto-em-bloco | Tarja preta em bloco com a frase | legenda legível sobre imagem clara ou ocupada | “people are dying”; “a frase quando o fundo é claro” | imagem de arquivo própria ou gerada | 1 | A2
texto-glow-serifa-fina | Serifa fina branca com brilho | narração em texto sobre vídeo escurecido (dialeto CINEMA-GLOW) | “a frase narrada sobre o vídeo de arquivo” | imagem de arquivo própria ou gerada | 0.15 | A1
palavra-futura-cinza-que-acende | Palavra futura em cinza que acende | a frase aparece cheia e acende na cadência da fala | “this is the most important” | imagem de arquivo própria ou gerada | 2 | A1
script-manuscrito-que-se-escreve | Script manuscrito que se escreve | frase emocional ou palavra de fecho em caligrafia | “a frase final”; “being built with dollars” | imagem de arquivo própria ou gerada | 1.5 | A1
numero-que-sobe-e-fixa | Número que sobe e fixa | número como protagonista (ano, valor, %) | “200 pessoas”; “66% ao ano” | #dado | 0.5 | A1
texto-dissolve-em-blocos | Texto que se monta de blocos de pixel | a palavra-chave materializa | “uma flor”; “século XVII” | - | 0.25 | ⚠ 💲 A3
titulo-gelo-com-sombra | Título black gelo com contorno e sombra (2ª linha em acento) | resumo da fala em 2–4 palavras | “título da cena”; “palavra-chave” | - | 0 | ⚠ 💲 A3
texto-no-chao-em-perspectiva | Texto pintado no chão em perspectiva | a frase pertence ao lugar | “poucos acreditavam”; “no campo” | cena com chão visível | 0.6 | ⚠ 💲 A1
travelling-pela-frase | Travelling lateral por uma frase solta no ar | a frase-tese percorrida como paisagem | “descobriu um hábito simples”; “a tese” | - | 2.5 | ⚠ 💲 A2
coluna-de-anos-presa-ao-objeto | Coluna de anos rolando presa a um objeto | voltar no tempo até a data | “em 1930”; “anos atrás” | #dado, objeto recortado | 0.8 | ⚠ 💲 A3
palavra-sob-holofote | Uma palavra por vez sob holofote em tecido/papel | isolar a frase que reengaja | “mas fica pior”; “e tem um detalhe estranho” | - | 0.45 | ⚠ 💲 A3
titulo-3d-extrudado | Título 3D extrudado preso à cena | o tema como objeto físico da cena | “o nome do caso”; “o tema” | - | 0.27 | ⚠ 💲 A2
palavras-espalhadas-em-profundidade | Palavras da conclusão espalhadas em profundidade | a conclusão se espalha | “virou símbolo”; “no fim das contas” | - | 1.2 | ⚠ 💲 A2
muro-de-texto-com-frase-marcada | Muro de texto com frase marcada | isolar a frase que importa no meio de muita informação ('tem algo escondido aqui') | “tem um detalhe que quase ninguém percebe”; “no meio de tudo isso” | cena anterior e/ou seguinte (opcional) | 4.5 | ⚠ A3
palavra-estica-repetindo-letra | Palavra que estica repetindo a letra | ênfase por alongamento | “nuuunca”; “sílaba esticada” | - | 1.5 | 💲 A2
selecao-de-texto-com-alcas | Seleção de texto com alças | correção do termo | “na verdade”; “corrigindo” | - | 0.7 | 💲 A3
letras-voam-em-arco-para-o-balao | Letras que voam em arco para o balão | fala citada | “ele disse”; “a pergunta era” | - | 0.4 | 💲 A2
texto-bordado-em-patch | Texto em patch de tecido | frase-consequência | “ficou mais rápido”; “resultado” | - | 1.6 | 💲 A3
data-em-quadro-negro-com-sublinhado | Data digitada em quadro-negro com sublinhado vermelho | localizar o fato no tempo | “em outubro”; “naquele dia” | textura de quadro-negro com pó de giz… | 2.2 | ⚠ 💲 A3
coluna-de-palavras-que-desce | Coluna de palavras que desce (virada falada) | a virada da história dita palavra por palavra | “mas havia um detalhe”; “mas tinha um porém” | parede escura com vinheta | 1.75 | ⚠ 💲 A3

## transicao (50)

cortina-de-cantos-com-titulo | Cortina de cantos com título | separar duas cenas com um título curto no meio | “agora, o outro lado”; “do outro lado” | cena-antes, cena-depois | 4.1 | ⚠ A1
mosaico-interrompe-fala | Mosaico que interrompe a fala | interromper o apresentador com uma frase e voltar | “pausa: isso é importante”; “presta atenção” | - | 4.1 | 🎤 ⚠ A2
separador-estroboscopico-negativo | Separador estroboscópico negativo | pausa dramática entre blocos; separar as palavras | “(trecho sem palavras, só o rosto, entre a dor e a…” | - | 2.25 | ⚠ A2
olho-abre-congela-revela | Olho que abre e revela | enquanto você pensa… você já respondeu: a virada para a revelação | “você já respondeu”; “é o vídeo” | clipe-de-olho | - | ⚠ A2
gesto-acelerado-como-transicao | Gesto acelerado como transição | passar de uma cena para outra pelo próprio movimento do vídeo, sem efeito | “(quando a montagem pede uma transição)” | clipe-com-gesto | - | A2
flash-de-brilho-unico | Flash de brilho único | uma única passagem marcada entre dois blocos (problema → solução) | “e foi aí que tudo mudou”; “agora a solução” | cena-antes, cena-depois | 0.5 | ⚠ A2
fecho-lento-com-fade | Fecho lento com fade | frase final de reflexão, ou saída de um clipe antes do CTA | “e é por isso que…”; “pensa nisso” | - | - | A1
whip-de-luz-diagonal | Whip de luz diagonal | virada de assunto ou de enquadramento | “mas”; “agora” | - | 0.3 | ⚠ A1
cena-nasce-da-anterior | Cena que nasce da anterior (mapa contínuo) | encadear ideias como um único percurso, sem corte, quando cada frase deriva da… | “e isso leva a”; “por trás disso” | ilustração/recorte por ideia | 1 | ⚠ A2
assentamento-minimo-entre-blocos | Assentamento mínimo entre layouts | trocar de layout (pessoa ↔ dividida ↔ foto ↔ motion) sem parecer quebrado e sem… | “(toda troca de layout sem virada de assunto)” | - | 0.2 | ⚠ A3
REF-EDICAO-IA-EF-05 | Corte que atravessa com desfoque radial (zoom-through cut) | passar de uma ideia para a seguinte 'entrando' na imagem, com energia, sem quadro… | “zoom-through”; “zoom through cut” | - | 0.6 | ⚠ A2
REF-EDICAO-IA-EF-25 | Do bruto ao final pelo visor (raw clip → final) | mostrar em 1 s a transformação: o clipe cru (visor de câmera, P&B) vira o vídeo… | “raw clip”; “do bruto ao final” | - | 1.1 | 🎤 ⚠ A2
zoom-blur-radial-abertura | Zoom blur radial de abertura (explosão) | abrir o vídeo mergulhando num ponto da cena inicial e cair na cena do assunto | “olha isso”; “veja” | 2 cenas | 0.5 | ⚠ A3
troca-de-fundo-por-varredura | Troca de fundo por varredura de cor | mudar o cenário da cena sem cortar o assunto | “agora em outro fundo”; “muda o clima” | - | 0.3 | ⚠ A3
troca-de-recorte-por-deslize-lateral | Troca de recorte por deslize lateral | trocar o objeto principal mantendo fundo e letra | “agora”; “e esse outro” | 2 recortes | 0.4 | ✂ ⚠ A2
polaroid-fita-e-zoom-through | Polaroid com fita e zoom-through | passar de uma imagem simples ao resultado trabalhado | “de uma foto simples”; “veja o que sai” | 1 foto + 1 colagem final | 1.75 | ⚠ A2
push-in-com-borrao-de-movimento-recompoe | Push-in com borrão de movimento e recomposição | trocar de composição com energia no meio da colagem | “de repente”; “e agora” | 2 composições | 0.25 | ⚠ A2
recuo-tela-cheia-revela-tv-crt | Recuo da tela cheia que revela a TV de tubo | abrir revelando que o vídeo é um registro, um arquivo | “arquivo”; “documentário” | PNG da TV própria, clipe | 1.9 | ⚠ A2
scan-de-luz-revela-rosto-gerado | Linha de luz que varre o rosto e revela o gerado | sinalizar que um rosto/versão está sendo gerado | “gerado”; “processando” | rosto sintético ou do autor | 1 | ⚠ A3
foco-que-assenta-na-troca | Foco que assenta na troca de plano | tornar a troca de plano macia sem fusão | “todo corte do estilo arquivo” | imagem de arquivo própria ou gerada | 0.25 | A3
zoom-out-de-revelacao | Zoom-out de revelação | abrir em detalhe e revelar a escala (mesa, multidão, rua) | “e então se vê”; “44 mesas” | foto detalhe + foto ampla | 2.4 | A1
rasgo-de-papel-revela | Papel rasgado revela a imagem | abrir a peça ou virar o capítulo | “abertura com retrato”; “e por baixo” | imagem de arquivo própria ou gerada | 1 | A1
bloco-cai-e-vira-cenario | Bloco cai e vira cenário | gancho de logo/letreiro que se torna cena | “abertura com letreiro” | imagem de arquivo própria ou gerada | 1.2 | A1
respingo-de-tinta-em-mascara | Respingo de tinta vermelha em máscara | choque/virada violenta, uso raríssimo | “a virada” | imagem de arquivo própria ou gerada | 0.3 | A1
choque-de-inversao-e-mascara | Choque de inversão e máscara | chamada de impacto de 14 s sem fala | “peça de impacto”; “teaser” | imagem de arquivo própria ou gerada | 14 | A1
zoom-continuo-por-janela | Zoom contínuo através de janela ou moldura | ir de fora para dentro de um lugar sem corte | “lá dentro”; “dentro do hospital” | cena ilustrada gerada por nós | 1.2 | ⚠ 💲 A3
portal-que-nasce-de-ponto-da-cena | Portal que nasce de um ponto da cena (círculo ou quadrado) | o que está na cena abre a porta para a próxima | “e isso levou a”; “anos depois” | cena ilustrada gerada por nós | 0.45 | ⚠ 💲 A3
empurrao-vertical-com-foco | Empurrão vertical com foco que puxa | mais um fato da mesma linha | “e o FBI”; “e mais” | cena ilustrada gerada por nós | 0.75 | ⚠ 💲 A3
cortina-de-nuvem-ou-fumaca | Cortina de nuvem ou fumaça | passou tempo ou distância | “anos depois”; “do outro lado do mundo” | cena ilustrada gerada por nós | 0.6 | ⚠ 💲 A2
estouro-de-luz-em-nevoa | Estouro de luz em névoa branca | virada de capítulo luminosa | “durante a febre”; “foi aí que” | cena ilustrada gerada por nós | 0.55 | ⚠ 💲 A2
saida-do-sujeito-revela-texto | Saída do sujeito revela o título | a ideia estava escondida atrás do personagem | “uma flor”; “uma palavra” | personagem ilustrado gerado por nós… | 0.3 | ✂ ⚠ 💲 A3
wipe-por-primeiro-plano | Wipe por primeiro plano (objeto ou personagem passa colado… | troca de cenário sem corte, guiada por um corpo | “enquanto isso”; “ele foi para” | recorte gerado com alfa | 0.35 | ✂ ⚠ 💲 A2
arremesso-para-fora | Arremesso do objeto para fora do quadro | prova vista, próximo assunto | “e então”; “mas” | objeto-documento gerado | 0.3 | ✂ ⚠ 💲 A2
arco-de-camera-de-abertura | Arco de câmera de abertura | o vídeo começa já em movimento | “primeira frase do gancho” | cena ilustrada gerada por nós | 0.7 | ⚠ 💲 A3
zoom-desfoque-crossfade | Zoom com desfoque e crossfade de fim de bloco | muda o bloco do assunto | “agora”; “e o mais curioso” | cena ilustrada gerada por nós | 0.45 | ⚠ 💲 A2
palavras-tapadas-por-blocos-de-cor | Palavras tapadas por blocos de cor | fim de frase vira transição | “e isso pode acabar”; “fim de frase” | - | 0.5 | 💲 A3
onda-liquida-cobre-a-tela | Onda líquida que cobre a tela | pergunta → resposta | “e se você pudesse”; “a resposta” | - | 0.6 | 💲 A3
caleidoscopio-em-ladrilhos-recua | Caleidoscópio em ladrilhos que recua | troca de ambiente | “e para quem”; “em outro lugar” | - | 0.4 | 💲 A2
dissolve-em-meio-tom | Dissolve em meio-tom | revelação suave | “e o nome é”; “apresentando” | - | 0.6 | 💲 A3
bloco-solido-morfa-e-desliza | Bloco sólido que morfa e desliza | troca de bloco em peça limpa | “agora”; “próximo” | - | 0.4 | 💲 A3
virada-de-carta-no-eixo | Carta que vira no eixo | o outro lado | “o outro lado”; “mas” | - | 0.35 | 💲 A3
cortina-de-palco-abre | Cortina de palco que abre | entrada, apresentação | “e apresento”; “o show” | - | 0.3 | 💲 A2
fresta-horizontal-que-abre | Fresta horizontal que abre | contraste, virada | “só que”; “do outro lado” | - | 0.3 | 💲 A3
mosaico-de-pontos-revela-imagem | Mosaico de pontos que vira imagem | revelação de imagem | “olha isso”; “como fizeram” | - | 1.5 | 💲 A3
corte-em-v-com-faixas | Corte em V com faixas | troca de etapa | “primeiro”; “passo seguinte” | - | 1.3 | 💲 A3
giro-para-vista-de-cima-com-zoom-out | Objeto tomba para a vista de cima e a câmera recua | o fato vira desfecho, visto de longe | “morreu”; “acabou” | objeto em vista frontal e vista de…, chão com grão | 1.3 | ✂ ⚠ 💲 A2
cena-vira-foto-recortada-na-manchete | A cena vira a foto recortada da manchete | o que acabamos de ver virou notícia/documento | “saiu no jornal”; “virou notícia” | cena ilustrada gerada por nós, página de documento/jornal NOSSO com… | 0.8 | ⚠ 💲 A3
estatica-de-tv-como-corte | Estática de TV como corte | interromper: o assunto sai do ar e entra outro | “saiu do ar”; “mudou de canal” | 6 PNGs de ruído pré-gerados | 0.9 | ⚠ 💲 A2
buraco-de-fechadura-revela | Revelação pelo buraco da fechadura | espiar o que estava escondido | “o que ninguém viu”; “por trás” | cena ilustrada gerada por nós, SVG de buraco de fechadura | 1.4 | ⚠ 💲 A3
close-extremo-de-detalhe | Close extremo de detalhe (olho, mão, objeto) | o instante da decisão: quem decide, o dedo que clica, o número que importa | “decide”; “escolhe” | imagem do detalhe gerada por nós… | 0.8 | ⚠ A3

## comparacao (38)

blocos-que-acumulam | Pilhas que acumulam com atraso | quem começou antes acumula mais; o intervalo perdido não volta | “quem começou antes tem mais”; “esse intervalo não se recupera” | #dado | 6 | ⚠ 📎 A2
conta-ate-o-retorno | Conta até o retorno | valor unitário vezes quantidade contra o investimento | “R$ X por venda vezes N”; “investi tanto e voltou tanto” | #dado | 6.6 | ⚠ 📎 A3
capacidade-comprime | Capacidade cheia que comprime | a janela encheu; comprimir libera espaço | “a janela encheu”; “bateu o teto” | #dado | 5.4 | ⚠ 📎 A1
tres-colunas-anotadas | Três colunas anotadas | três versões lado a lado, o que muda em cada uma | “três versões, olha a diferença”; “fraco, médio, forte” | 3-prints | 6.6 | ⚠ A2
tira-de-composicao | Tira de composição 0-100% | de onde vem o resultado, em partes de um todo | “de onde vêm as vendas”; “55% isso, 30% aquilo” | #dado | 6 | ⚠ 📎 A2
livro-caixa-total | Livro-caixa com total | somar tudo o que custa | “vamos somar tudo”; “quanto custa de verdade” | #dado | 6 | ⚠ 📎 A3
duas-pecas-um-papel | Duas peças, um papel cada | duas ferramentas, cada uma com um papel, juntas dão uma capacidade | “navegador mais servidor”; “cada um faz uma parte” | 2-prints | 4.8 | ⚠ A2
volume-encolhe-ao-essencial | Volume que encolhe ao essencial | olha o tamanho disso; agora o que você precisa | “olha o tamanho disso”; “40 páginas contra 1 tela” | paginas-longas, resultado-curto | 4.8 | ⚠ A3
duas-escalas-de-tendencia | Duas escalas de tendência | o método tende mais a A que a B (qualitativo) | “é mais isso que aquilo”; “mais precisão, menos volume” | - | 5.4 | ⚠ A0
matriz-a-contra-b | A contra B em critérios | duas opções em vários critérios | “A contra B em quatro pontos”; “formulário comum contra Lead Certo” | #dado | 6 | ⚠ 📎 A2
barras-em-foco | Barras em foco na ordem da história | olhar uma barra de cada vez na ordem que conta a história | “olha essa barra, agora essa”; “do pior para o melhor” | #dado | 6 | ⚠ 📎 A3
barras-agrupadas-por-metrica | Barras agrupadas por métrica | antes e depois em mais de uma métrica, cada uma com sua unidade | “antes e depois em duas métricas”; “CPA e conversão” | #dado | 6 | ⚠ 📎 A3
icones-contaveis | Ícones contáveis por linha | de cada N, tantos fazem isso | “de cada 25, 9 fazem isso”; “conta comigo” | #dado | 7.2 | ⚠ 📎 A1
atual-depois-historico | O atual primeiro, depois o histórico | o número mais recente e como se chegou nele | “o número de hoje”; “como chegamos aqui” | #dado | 6 | ⚠ 📎 A3
linha-e-tendencia | Linha observada e tendência | a série subindo e para onde ela aponta | “olha a linha subindo”; “essa é a tendência” | #dado | 6 | ⚠ 📎 A3
um-contra-muitos | Um contra muitos | uma coisa completa contra muitos pedaços | “1 criativo bom contra 10 fracos”; “um painel contra seis abas” | unidade | 4.8 | ⚠ A2
antes-depois-em-pares | Antes e depois em pares | antes e depois, vários exemplos em sequência | “antes e depois”; “olha a diferença” | pares-de-prints | 4.8 | ⚠ A3
mesmo-pedido-dois-resultados | Mesmo pedido, dois resultados | mesmo pedido gerou dois resultados; este é o melhor | “mesmo briefing, dois criativos”; “este performou melhor” | resultados | 7.2 | ⚠ A2
quadrante-com-foco | Quadrante com foco | esforço contra potencial; comece por este quadrante | “comece por aqui”; “esforço contra resultado” | #dado | 5.4 | ⚠ 📎 A2
mesma-busca-tres-telas | Mesma busca, três telas | o mesmo dado em três telas diferentes | “vendas de ontem em três lugares”; “Gerenciador, Ticto e GA4” | #dado, 3-prints | 5.4 | ⚠ 📎 A3
pacotes-com-controle | Pacotes com controle deslizante | dois pacotes; o controle mostra preço e o que entra | “dois pacotes”; “o que entra em cada um” | #dado | 6.6 | ⚠ 📎 A1
radar-de-dimensoes | Radar de dimensões | perfil em várias dimensões | “nota em cada área”; “tracking, criativo, oferta” | #dado | 6 | ⚠ 📎 A1
barras-de-razao | Barras de razão | uma coisa é X vezes maior que a outra | “X vezes mais barato”; “quase o dobro” | #dado | 5.4 | ⚠ 📎 A3
registros-e-anel | Registros e anel percentual | lista de registros e a porcentagem que resume | “metade ficou sem resposta”; “dos últimos eventos” | #dado | 6 | ⚠ 📎 A3
linha-a-linha-antes-depois | Antes e depois linha a linha | antes e depois, item por item | “antes era assim, depois ficou assim”; “linha por linha” | - | 6 | ⚠ A3
barras-sequenciais | Barras sequenciais | evolução período a período | “semana a semana”; “dia após dia” | #dado | 5.4 | ⚠ 📎 A3
perda-por-etapa | Perda por etapa | onde as pessoas caem em cada caminho | “onde o público cai”; “de 100 cliques sobram” | #dado | 6 | ⚠ 📎 A3
meta-ultrapassada | Meta ultrapassada | bateu a meta e passou | “bateu a meta”; “passou de 100%” | #dado | 5.4 | ⚠ 📎 A3
tour-entre-dois-cartoes | Tour entre dois cartões | um caiu muito, o outro pouco | “esse caiu 45%, este só 9%”; “compara as duas quedas” | #dado | 6 | ⚠ 📎 A3
duas-frases-uma-vence | Duas frases, uma vence | duas formas de dizer, uma converte | “duas formas de dizer”; “esta converte, esta não” | #dado | 6.6 | ⚠ 📎 A3
tela-dividida-confronto | Tela dividida em confronto | confronto entre duas pessoas ou dois lados | “de um lado… do outro”; “homem ou mulher” | dois-clipes | - | ⚠ A2
cartao-vidro-com-preco | Cartão de vidro com preço | explicar um preço ou uma comparação ao lado de uma imagem | “todos tentam a mesma coisa”; “um e-book de R$ 47” | #dado, imagem-de-referencia | - | ⚠ 📎 A1
REF-EDICAO-IA-EF-13 | Cortina antes/depois com alça (before and after) | mostrar o mesmo material cru e tratado no mesmo enquadramento, revelando a… | “before and after”; “antes e depois” | mesmo clipe antes e depois | 2.3 | ⚠ A3
REF-EDICAO-IA-EF-29 | Recibos empilhando com total riscado | mostrar o custo recorrente do jeito antigo somando, recibo a recibo, até o total… | “toda vez”; “a cada vídeo” | #dado | 3 | ⚠ 📎 A3
demo-hierarquia-por-tamanho | Demonstração: tamanho cria hierarquia (e igual confunde) | contraste de tamanho | “maior”; “menor” | 3 pares de objetos | 3 | ✂ ⚠ 💲 A2
demo-velocidade | Demonstração: um objeto muito mais rápido rompe a placa | contraste de velocidade | “mais rápido”; “velocidade” | 3 objetos iguais | 3 | ✂ 💲 A2
demo-forma-intrusa | Demonstração: a forma diferente no meio da grade | contraste de forma | “forma”; “o diferente” | - | 2 | ⚠ 💲 A2
demo-densidade | Demonstração: cheio × vazio | densidade | “menos é mais”; “cheio demais” | 15–25 objetos recortados | 2.5 | ✂ 💲 A2

## colagem (35)

pilha-de-documentos | Pilha de documentos | pilha de materiais; o mais novo vai para a frente | “relatório da semana 1, 2, 3”; “o mais recente” | paginas | 4.2 | ⚠ A2
pessoa-e-dossie | Pessoa e dossiê | esta é a pessoa e este é o dossiê dela | “esse é o cliente”; “o caso dele” | retrato, materiais, celular | 4.2 | ⚠ A2
parede-de-provas-resumo | Parede de provas com resumo | olha tudo que temos de prova; resumo | “olha as provas”; “conferido em três telas” | #dado, prints | 4.2 | ⚠ 📎 A3
paralaxe-de-material | Paralaxe de material | muito material acumulado levando a uma conclusão | “foram meses de material”; “tudo isso leva a” | muitas-paginas | 4.2 | ⚠ A2
retrato-com-notas | Retrato com notas | apresentar alguém com três notas e uma frase | “quem é o autor”; “três fatos” | retrato, contexto | 4.2 | ⚠ A1
imagens-em-volta-do-apresentador | Imagens em volta do apresentador | várias imagens e, no meio, a pessoa explicando | “olha esses painéis”; “tudo isso” | 4-prints | 4.1 | ✂~ ⚠ A3
parede-de-relatos | Parede de relatos | o que dizem os alunos | “olha o que dizem”; “relatos” | relatos | 4.2 | ⚠ A3
objeto-recortado-sobre-preto | Objeto recortado sobre preto | dar um símbolo visual a uma palavra-chave que não tem movimento óbvio | “anúncio podre”; “refém” | png-recortado | - | ⚠ A3
broll-pela-palavra | B-roll pela palavra | substituir a palavra pela imagem que a simboliza, buscando pela emoção e não pelo… | “complexo”; “concorrente barato” | b-roll-por-palavra | - | ⚠ A3
reflexo-espelhado | Reflexo espelhado | acabamento 'mais trabalhado' em cena emocional ou de inimigo | “(silhueta pai e filho ao pôr do sol)”; “o seu público” | clipe | - | ⚠ A1
pergunta-na-tela-diferente-da-fala | Pergunta na tela diferente da fala | duas mensagens ao mesmo tempo (voz e tela) para prender a atenção e ilustrar o… | “onde está o seu foco?”; “(voz fala uma coisa, a tela outra)” | video-hipnotico, clipe-de-celular-rolando | - | ⚠ A2
colagem-caotica-de-videos | Colagem bagunçada de vídeos | representar a bagunça mental do lead antes de um CTA limpo | “a bagunça na sua cabeça”; “(vários estímulos ao mesmo tempo)” | 4-6-videos-de-pessoas | - | ⚠ A2
insercao-por-fala-troca-direta | Inserção por fala com troca direta | a fala cita uma prova ou ilustração e a frase seguinte cita outra | “veja este”; “olha aqui” | asset-real-ou-ilustracao-selada | - | ⚠ 📎 A3
logo-citado-na-fala | Logo oficial no instante em que é citado | a fala cita uma marca/ferramenta e o logo oficial aparece como asset do projeto | “no Meta”; “no Claude Code” | logo-oficial-baixado | - | ⚠ 📎 A1
foto-real-sobe-sobre-titulo | Foto real recortada que sobe sobre o título | apresentar quem é a pessoa real da história (fundador, protagonista) com peso de capa | “o fundador”; “quem fez isso foi” | foto real da pessoa (licença livre ou… | 2.2 | ✂ ⚠ 📎 A1
clipe-viral-com-camada-explicativa | Clipe viral com camada explicativa | explicar POR QUE algo viralizou ou funciona, usando o próprio exemplo como prova | “você já viu”; “isso viralizou porque” | #dado, trecho do vídeo analisado, contadores de view reais | 8 | ⚠ 📎 A0
objeto-3d-real-com-contorno | Objeto 3D real (glTF livre) com contorno da marca | dar peso físico ao símbolo da ideia (prêmio, ferramenta, produto) quando a… | “(a referência tem objeto 3D)”; “o prêmio” | modelo .glb/.gltf com licença CC0 ou… | 2 | ⚠ 📎 A2
REF-EDICAO-IA-EF-01 | Órbita de cartões em volta da pessoa (orbit) | mostrar que existem muitos exemplos/resultados girando em torno de quem fala | “orbit”; “órbita” | 3-8 clipes ou prints 9:16 | 2 | 🎤 ✂ ⚠ A2
REF-EDICAO-IA-EF-02 | Parede de referências atrás da pessoa (couch wall) | mostrar volume (muitas referências, muitos clientes, muitos vídeos) atrás de quem… | “couch wall”; “parede de vídeos” | 12-24 miniaturas próprias | 2.5 | 🎤 ✂ ⚠ A2
REF-EDICAO-IA-EF-04 | Muro de manchetes em volta do rosto (headline wall) | provar que 'todo mundo está falando disso' com manchetes coladas em volta de quem… | “headline wall”; “todo mundo está falando” | 5-8 manchetes/posts reais | 2.5 | 🎤 ✂~ ⚠ 📎 A2
REF-EDICAO-IA-EF-07 | Pessoa recortada sobre a prova (green screen) | comentar uma prova (post, print, painel, clipe) com a pessoa na frente dela, como… | “green screen”; “olha esse post” | print/clipe real | 4 | 🎤 ✂ ⚠ 📎 A3
REF-EDICAO-IA-EF-08 | Colagem de papel com letras de revista (paper cut) | dar tom artesanal/manifesto a uma frase curta, com a pessoa recortada como figura… | “paper cut”; “colagem” | - | 1.5 | 🎤 ✂ ⚠ A1
recorte-sobe-e-encaixa-push-in | Recorte que sobe, encaixa e faz push-in lento | apresentar o objeto/pessoa principal da colagem com peso e vida | “olha esse”; “aqui está” | 1 recorte PNG alpha | 2 | ✂ ⚠ A2
silhueta-em-marcha-em-loop | Silhuetas de papel em marcha em loop | mostrar volume/produção em andamento sem rosto | “fábrica”; “produção em escala” | sprite de 6 a 8 poses | 3 | ✂ ⚠ A1
galeria-mesma-pose-troca-rapida | Galeria de apresentadores na mesma pose | mostrar variações de um mesmo molde | “cinco versões”; “mesmo roteiro” | N clipes sintéticos | 3 | ✂ ⚠ A3
colagem-de-topo-cadencia-rapida | Inserto de topo a cada 0,3 s com falante embaixo | prender a atenção no gancho sem tirar o falante | “olha”; “três coisas” | inserções próprias | 3.3 | 🎤 ⚠ A3
foto-objeto-em-perspectiva | Foto como objeto em perspectiva | tratar a foto como coisa física (polaroid, recorte) sobre mesa ou papel | “a foto que sobrou”; “em 1968” | foto + fundo madeira/papel | 1 | A1
envelope-e-foto-saindo | Envelope e fotos em leque | revelar um dossiê/arquivo de pessoas | “o arquivo”; “a pasta de fotos” | imagem de arquivo própria ou gerada | 1.5 | A1
objeto-explodido-em-pecas | Objeto explodido em peças | explicar que algo é feito de partes | “assemble”; “montado a partir de” | peças PNG | 0.4 | ✂ A1
foto-voadora-de-papel | Foto impressa chega voando e assenta | a pessoa/objeto chega como documento | “o nome dele era”; “esta é” | foto gerada por nós | 0.5 | ⚠ 💲 A2
mao-recortada-entra-em-cena | Mão recortada entra pela borda e age | a ação da frase acontece literalmente | “trocaram casas”; “carimbou” | mão recortada própria ou gerada | 0.35 | ✂ ⚠ 💲 A3
substituicao-stop-motion | Substituição stop-motion de variantes | muitos tipos da mesma coisa | “todos os tipos”; “vários modelos” | 4–6 variantes do objeto | 0.4 | ✂ ⚠ 💲 A2
cabeca-que-abre | Cabeça do personagem abre como tampa | o que está na cabeça de alguém | “obcecados por”; “só pensavam em” | personagem caricato gerado, em camadas | 0.9 | ✂ 💲 A2
demo-acumulo | Demonstração: excesso que vai poluindo | o erro de somar coisas | “adicionar mais”; “mais um efeito” | 8–12 recortes | 2.5 | ✂ ⚠ 💲 A2
recorte-encaixado-em-objeto-silhueta | Pessoa recortada encaixada dentro de um objeto-silhueta | o destino da pessoa resumido num objeto que a envolve | “preso”; “enterrado” | personagem gerado por nós com alfa, objeto-silhueta PNG (caixão, celular… | 1.5 | ✂ ⚠ 💲 A3

## diagrama (31)

soma-das-partes | Soma das partes | A + B + C = resultado | “isso mais isso dá”; “a soma” | - | 4 | ⚠ A2
chamadas-ancoradas | Chamadas ancoradas | três passos, explicar cada um | “três passos”; “cada parte faz uma coisa” | print-opcional | 4.1 | ⚠ A3
ramo-a-ramo | Ramo a ramo | uma ideia se desdobra em várias | “uma ideia vira quatro”; “uma campanha, quatro conjuntos” | - | 4.2 | ⚠ A1
recipiente-pequeno-grande | Recipiente pequeno e grande | o grande guarda mais e lembra o que importa | “um guarda pouco, o outro muito”; “memória curta contra longa” | - | 4.1 | ⚠ A0
fontes-convergem-na-prova | Fontes que convergem na prova | várias fontes apontam para o mesmo achado | “cinco contas, o mesmo erro”; “tudo aponta para” | print-real | 4.3 | ⚠ A3
ciclo-que-fecha | Ciclo que fecha | é um ciclo que volta ao início | “é um ciclo”; “sobe, mede, pausa, repete” | - | 4.3 | ⚠ A1
ciclo-em-rodadas | Ciclo em rodadas | a mesma volta em rodadas, o estado muda | “rodada 1, rodada 2”; “na segunda volta” | #dado | 4.7 | ⚠ 📎 A1
decompor-e-varrer | Decompor e varrer | a pergunta grande quebra em partes; qual olhar primeiro | “por que a venda não aparece?”; “quebra em cinco” | - | 4.3 | ⚠ A2
funil-absorve | Funil que absorve | muita coisa solta vira uma coisa só | “tudo isso vira um”; “muitos leads, um qualificado” | opcional | 3.9 | ⚠ A2
velho-sai-novo-explica | Sai o velho, entra o novo | estado antigo, estado novo e o que muda | “era assim, agora é assim”; “saiu isso, entrou aquilo” | antes, depois | 4.1 | ⚠ A3
tudo-passa-pelo-centro | Tudo passa pelo centro | tudo passa por um ponto central antes do destino | “tudo passa pelo servidor”; “site, WhatsApp e formulário vão para” | opcional | 3.8 | ⚠ A3
entradas-viram-um-resultado | Entradas viram um resultado | várias entradas formam uma saída pronta | “formulário, WhatsApp e página”; “vira um lead pronto” | - | 3.8 | ⚠ A3
lista-ate-o-destino | Lista até o destino | faça esta lista e vá para ali | “faz essa lista e sobe”; “checklist e depois” | - | 3.7 | ⚠ A2
marco-com-detalhe | Marco com detalhe | estamos no passo N; olha o que tem dentro | “estamos no passo 2”; “o que tem dentro” | - | 4 | ⚠ A2
escopo-aninhado | Escopo aninhado | dentro do espaço maior, uma área menor com filhos | “dentro da conta”; “Business Manager, conta, campanhas” | - | 3.7 | ⚠ A2
material-vira-varias-pecas | Material vira várias peças | um material vira várias peças | “uma URL vira quatro anúncios”; “um vídeo, vários cortes” | fontes | 4.1 | ⚠ A3
linha-de-producao-empacotada | Linha de produção empacotada | montei a linha; agora é um sistema reutilizável | “briefing, roteiro, vídeo, anúncio”; “virou sistema” | fontes | 4.7 | ⚠ A3
posicao-em-dois-eixos | Posição em dois eixos | onde cada coisa se encaixa em dois eixos | “onde cada um fica”; “esforço e valor” | - | 3.8 | ⚠ A1
tres-raios-do-centro | Três raios do centro | uma ideia central, três desdobramentos | “uma venda, três lugares”; “um criativo: feed, reels, stories” | - | 4 | ⚠ A2
nivel-em-destaque | Nível em destaque | na hierarquia, este nível importa, com benefício e cuidado | “o nível que importa”; “o benefício e o cuidado” | - | 4 | ⚠ A2
pistas-de-mensagens | Pistas de mensagens | quem fala com quem, em que ordem, e onde há espera | “o navegador manda para”; “o servidor responde” | - | 4.4 | ⚠ A3
piramide-com-notas | Pirâmide com notas | base, meio e topo, cada nível com sua nota | “na base, no meio, no topo”; “os níveis” | - | 4.1 | ⚠ A1
linha-do-tempo-etapas | Linha do tempo com etapas | semana 1, semana 3, semana 6 | “na semana 1”; “depois de um mês” | #dado | 4 | ⚠ 📎 A2
ponto-a-ponto-b | Do ponto A ao ponto B | a distância entre o estado atual e o desejado tem um nome | “a distância de você para o ponto B é o conhecimento”; “de onde você está até onde quer chegar” | clipe-ponto-a, clipe-ponto-b | - | ⚠ A2
maquete-3d-montar-separar-reunir | Maquete 3D: montar, separar em camadas, reunir | um sistema tem camadas ou partes e a fala percorre cada uma (volume responde o que… | “por dentro”; “em camadas” | - | - | ⚠ A1
trajeto-sobre-maquete | Trajeto sobre a maquete com colisão checada | um percurso passa por pontos de um espaço (o caminho do dado/cliente por etapas) | “o caminho”; “passa por” | - | - | ⚠ A1
REF-EDICAO-IA-EF-27 | Especialista que se clona em ferramenta | mostrar que o conhecimento de um profissional caro virou uma ferramenta/skill que… | “clonar o especialista”; “clonei o conhecimento” | - | 2 | ⚠ A2
calendario-vira-faixa-de-contagem | Calendário que vira faixa de contagem | mostrar um prazo de teste como barra de dias | “durante sete dias”; “em uma semana” | #dado | 3 | ⚠ 💲 📎 A3
demo-despir-efeitos | Demonstração: a imagem perde as camadas | mostrar o que falta tirando | “falta”; “sem isso” | composição em camadas | 0.15 | ✂ 💲 A2
demo-foco-setas | Demonstração: setas e arcos convergem para o que importa | foco no essencial | “a coisa certa”; “o que importa” | 1 objeto recortado | 3 | ✂ 💲 A3
maquina-isometrica-explica-mecanismo | Máquina isométrica que explica o mecanismo | como uma coisa funciona por dentro (entrada → mecanismo → saída) | “como funciona”; “por dentro” | figura isométrica SVG gerada pela… | 6 | ⚠ A2

## lettering-editorial (31)

LETED-EF-01 | Tese em 2 níveis acima da cabeça | abrir uma ideia com frase pequena em cima e a afirmação grande embaixo | “hoje eu vou te mostrar”; “isso muda o jogo” | - | 4 | ⚠ A3
LETED-EF-02 | Palavra-chave em pílula ou serif itálica | marcar o termo que carrega a tese dentro da linha | “o nome disso é”; “presta atenção nessa palavra” | - | 3 | ⚠ A3
LETED-EF-03 | Número-herói no topo | dar ao dado a maior forma da tela quando ele é a prova da tese | “são 78 bilhões”; “1 em cada 5” | #dado | 4 | ⚠ 📎 A3
LETED-EF-04 | Legenda palavra a palavra com palavra ativa | legendar fala contínua mantendo a palavra dita em destaque | “fala corrida acima de 180 palavras por minuto”; “qualquer trecho narrado” | - | - | ⚠ A3
LETED-EF-05 | Ícones e cartões flutuantes em fila | enumerar nomes ou ideias com um cartão por item entrando na palavra | “são três”; “primeiro, segundo, terceiro” | - | 6 | ⚠ A3
LETED-EF-06 | Mockup de interface que se escreve sozinho | mostrar um passo digitado: prompt, comando, preço ou campo | “você escreve”; “você digita” | - | 5 | ⚠ A3
LETED-EF-07 | Grade de pontos que acende | dar escala a um número e mostrar a seleção de poucos entre muitos | “imagina 384”; “só 6 entram” | #dado | 5 | ⚠ 📎 A2
LETED-EF-08 | Fundo alternado com íris circular | trocar de tese ou de ritmo sem corte, abrindo um círculo a partir de um ponto | “agora o outro lado”; “mudando de assunto” | - | 1.5 | ⚠ A2
LETED-EF-09 | Fecho com caixa de palavra-chave | referência de ritmo do fecho: palavra digitada em cartão no topo (na VSL do MCT… | “comenta a palavra”; “me manda mensagem com” | - | 4 | ⚠ A2
LETED-EF-10 | Cartão com cabeça vazando | pôr a pessoa falando dentro de um cartão editorial sem perder presença: o rosto… | “qualquer fala com a pessoa em cena”; “relato” | - | - | 🎤 ✂ ⚠ A3
LETED-EF-11 | Texto gigante atrás da pessoa | dar peso de veredito a uma palavra ou número, com a pessoa na frente dele | “o resultado foi”; “é isso que” | - | 2.5 | 🎤 ✂ ⚠ A3
LETED-EF-12 | PiP circular sobre demonstração | manter o rosto falando enquanto o dado ou a tela ocupam o quadro | “olha aqui”; “na tela” | - | - | 🎤 ⚠ A2
LETED-EF-13 | Punch-in cartão → rosto cheio | marcar opinião, virada ou CTA com o rosto ocupando a tela | “calma lá”; “a parte mais louca” | - | 3 | 🎤 ⚠ A3
LETED-EF-14 | Fundo alternado por função | separar fala e dado pela cor do fundo: claro pontilhado para a pessoa, escuro de… | “agora olha o número”; “na prática” | - | - | ⚠ A3
LETED-EF-15 | Preço riscado → valor novo | ancorar o custo antigo e mostrar o novo | “você paga”; “custava” | #dado | 3 | ⚠ 📎 A2
LETED-EF-16 | Selo carimbado rotacionado | fechar um veredito curto (grátis, aprovado, cancela) como um carimbo | “aprovado”; “de graça” | - | 1.5 | ⚠ A2
LETED-EF-17 | Contador rolando / slot | fazer o número crescer na frente do espectador até o valor real | “chegou a”; “são” | #dado | 2 | ⚠ 📎 A3
LETED-EF-18 | Eyebrow mono de módulo | nomear a etapa, camada ou módulo que está agindo, dando cara técnica | “primeiro”; “a camada” | - | - | ⚠ A2
LETED-EF-19 | Skins por nicho no mesmo take | mostrar que o mesmo método serve a públicos diferentes trocando o universo visual | “para corretor”; “para personal” | - | - | 🎤 ✂ ⚠ A2
LETED-EF-20 | Substituição: o pago riscado vira a alternativa | mostrar que algo caro ou antigo foi trocado por outra solução | “no lugar de”; “substitui” | - | 2 | ⚠ A1
LETED-EF-21 | Mascote que reage à fala (co-apresentador) | dar um personagem ao produto que acompanha e reage ao que o apresentador diz | “esse carinha aqui”; “ele te avisa” | mascote próprio ou licenciado… | 3 | 🎤 ⚠ A2
LETED-EF-22 | Notch que cresce e vira notificação | mostrar que algo CHEGOU: aviso, pedido, venda, tarefa concluída | “chegou”; “aparece ali em cima” | - | 2.5 | ⚠ A2
LETED-EF-23 | Cursor que clica + toast de confirmação | mostrar que a ação é fácil: 'você só clica em X' | “você só clica”; “aprova com um clique” | - | 2 | ⚠ A2
LETED-EF-24 | Timer da dor correndo no mockup | medir a dor em tempo: quanto já se perdeu esperando | “está parado”; “esperando” | #dado | 3 | ⚠ A3
LETED-EF-25 | Cartão que vira tela cheia e volta (morph sem corte) | trocar o enquadramento sem cortar o take: ênfase, virada, ressalva | “porém”; “olha só” | - | 1 | 🎤 ⚠ A2
LETED-EF-26 | Árvore de compatibilidade com linhas tracejadas | mostrar que uma coisa conecta/serve com várias outras | “funciona com”; “integra com” | ícones próprios ou genéricos | 3 | ⚠ A1
LETED-EF-27 | Micro-interações de sistema (dropdown, diálogo, Face ID… | antecipar objeção de uso/segurança mostrando a tela que a pessoa vai ver | “dá para deixar em português”; “vai pedir autorização” | - | 2.5 | ⚠ A2
LETED-EF-28 | Fecho R$ 0 + checklist que se marca + CTA digitado com glow | fechar com o preço/esforço e a lista do que a pessoa recebe, antes da palavra do CTA | “é de graça”; “passo a passo” | #dado | 5 | 🎤 ⚠ A3
texto-em-arco-atras-do-recorte | Texto em arco atrás do recorte | envolver a pessoa/objeto com a palavra-tema | “em volta”; “tudo gira em torno” | 1 recorte PNG alpha | 0.8 | ✂ ⚠ A2
titulo-duas-faces-sans-serifa-sobre-tv | Título em duas faces acima da moldura | titular com duas faces acima da moldura | “documentário”; “filme de arquivo” | - | 2 | ⚠ A2
linha-em-foco-no-jornal | Linha em foco no jornal | destacar uma frase-regra/citação como se fosse recorte de jornal | “frase-regra”; “citação oficial” | - | 4 | ⚠ A3

## tratamento (31)

micro-zoom-por-frase | Micro-zoom por frase | dar ênfase a uma frase sem cortar o take; animar apresentador, avatar ou foto parados | “toda frase de ênfase do apresentador”; “frase-chave (zoom forte)” | take-ou-foto | - | A3
reentrada-suave-do-personagem | Reentrada suave do personagem | voltar ao apresentador logo depois de outra aparição sem estranhar | “(volta ao apresentador depois de cartão ou b-roll…” | - | - | 🎤 A2
grade-escura-da-marca | Grade escura da marca | unificar b-roll de banco com a peça escura; quanto mais tensa a frase, mais escuro | “frase de tensão sobre b-roll”; “nome do produto sobre fogo” | b-roll | - | A3
grade-de-clima | Grade de clima | dar a cor do sentimento à cena (decepção, medo, surreal, pensativo) e casar o clipe… | “perdeu tudo”; “o carro foi para o guincho” | b-roll | - | A2
flashback-preto-e-branco | Flashback em preto e branco | marcar passado, dúvida, dor ou revelação de identidade; a cor volta na solução | “o que ela era”; “não tá te incomodando?” | clipe | 3 | A3
vinheta-foco-central | Vinheta de foco central | clima cinematográfico e foco no rosto ou no centro da cena | “(cena tensa, silhueta do alvo, talking head de avatar…”; “spotlight” | clipe | - | A2
ocultar-rosto | Ocultar rosto | esconder a identidade de quem aparece (mistério ou proteção de terceiro) | “(foto de pessoa no criativo de mistério)”; “(relato de terceiro identificável)” | foto-ou-clipe-com-rosto | - | A1
base-9x16-preto-centro | Base 9:16 preta, conteúdo no centro | definir o quadro-base do anúncio: retrato preto com tudo o que importa no centro | “(todo anúncio de cartela)”; “serve stories e feed” | - | - | ⚠ A3
foto-sem-fundo-com-degrade-sombra | Foto sem fundo com degradê de sombra | fundir foto de banco ao fundo preto mantendo o texto legível | “(foto de banco sobre fundo preto)”; “texto sobre imagem” | foto-de-banco | - | ⚠ A3
congelar-quadro-na-palavra | Congelar quadro para casar com a fala | dar tempo à imagem quando a fala termina antes do movimento | “(fim exato da palavra)” | clipe | - | A2
parallax-hq-2-camadas | Parallax 2,5D de HQ em 2 camadas | dar profundidade a um painel de HQ sem pagar vídeo de IA e sem buraco atrás do… | “(cena de HQ com personagem)”; “(quadro parado de mais de 2 s)” | cenario-vazio, personagem-recortado-png | 4 | ⚠ A2
zoom-na-regiao-da-acao | Zoom na região onde a ação acontece (com repetição) | fazer o público ver o instante decisivo de um vídeo real que, no quadro inteiro… | “nesse momento”; “repara aqui” | vídeo real do caso | 2.5 | ⚠ 📎 A2
mundo-de-papel-em-tres-camadas | Mundo de papel em 3 camadas (profundidade sem rosto) | dar profundidade e movimento a uma peça sem rosto que ficou chapada | “(peça narrada sem pessoa; pedido 'ficou estático'…” | - | - | ⚠ A2
REF-EDICAO-IA-EF-09 | Contorno de giz que ferve (doodle boil) | marcar um momento leve/divertido ou de afeto com contorno desenhado à mão em volta… | “doodle boil”; “rabisco em volta” | - | 1 | 🎤 ✂ ⚠ A1
REF-EDICAO-IA-EF-10 | Contra-zoom de vertigem (vertigo) | dar a sensação física de 'caiu a ficha' / tontura numa frase de choque | “vertigo”; “efeito vertigem” | - | 0.8 | 🎤 ✂ ⚠ A2
REF-EDICAO-IA-EF-19 | Conta-gotas que pega a cor (eyedropper grade) | mostrar que o estilo/cor de uma referência é copiado para o seu vídeo | “eyedropper”; “conta-gotas” | referência de cor | 1.4 | ⚠ A1
REF-EDICAO-IA-EF-26 | Paródia do erro antes da solução | mostrar em 2 s o jeito errado (exagerado) antes de apresentar o certo; o contraste… | “parece slop”; “a maioria faz assim” | - | 2 | 🎤 ⚠ A2
halftone-com-desalinhamento-cromatico | Halftone com desalinhamento cromático | dar textura de impressão a retrato ou prédio | “revista”; “jornal antigo” | 1 imagem | 2 | ✂ ⚠ A2
stop-motion-em-dois | Stop-motion em dois (12 a 15 q/s) | dar cara de colagem física ao movimento | “(estilo da peça inteira)” | - | 0 | ⚠ A2
grao-de-papel-animado | Grão de papel animado | dar textura de papel ao fundo chapado | “(estilo da peça inteira)” | - | 0 | ⚠ A2
grade-crt-aperture-que-some-no-recuo | Grade de tubo que some quando o vídeo encolhe | dar sabor CRT só enquanto o vídeo está grande | “tela de tubo”; “retrô” | - | 0.75 | ⚠ A2
barril-crt-displacement | Curvatura de tela de tubo (barril) | abaular a imagem como vidro de tubo enquanto está grande | “tela de tubo”; “retrô” | - | 0.6 | ⚠ A1
figura-tingida-de-amarelo | Figura ou objeto tingido de amarelo | destacar a figura/objeto citado mantendo a gravura em P&B | “as pessoas”; “a cesta” | gravura + PNG do recorte | 1 | ✂ A3
cor-so-num-elemento-sobre-pb | Cor só num elemento sobre P&B | tudo dessaturado, um recorte vermelho/âmbar chama o olho | “só uma coisa tinha cor”; “o corpo caído” | gravura + recorte | 1 | ✂ A1
gravura-push-in-continuo | Push-in contínuo em gravura parada | dar vida a imagem estática de arquivo | “qualquer imagem parada de gravura ou foto de época” | imagem de arquivo própria ou gerada | 3 | A3
aberracao-cromatica-no-grao | Aberração cromática + grão de filme | textura de arquivo sobre toda foto/gravura | “textura de arquivo”; “grão” | imagem de arquivo própria ou gerada | 3 | A3
iris-oval-de-lente-antiga | Íris oval de lente antiga | dar cara de projeção/fotografia antiga durante a peça toda | “peça inteira em clima de documentário” | imagem de arquivo própria ou gerada | 0 | A1
selo-semitransparente-de-fundo | Selo semitransparente de fundo | dar autoridade documental ao fundo de texto | “documento oficial” | imagem de arquivo própria ou gerada | 3 | A1
brilho-diagonal-que-varre | Brilho diagonal que varre o objeto assentado | valorizar o objeto | “o documento”; “o arquivo” | - | 0.3 | ⚠ 💲 A2
punch-in-que-escoa-para-pb | Punch-in que escoa para P&B na contradição | a frase nega ou desmente o que se acreditava | “negativo”; “não era” | cena ilustrada com profundidade… | 1.8 | ⚠ 💲 A3
cor-seletiva-em-camadas | Cor seletiva em camadas (P&B + cor no mesmo quadro) | separar o que importa do resto: o eleito fica em cor, o contexto vira arquivo | “só esse”; “o certo” | cena fotorreal gerada por nós, recorte (rembg) do elemento eleito | 1.5 | ✂ ⚠ A3

## cartoes (25)

checklist-sincronizado-com-tela | Checklist sincronizado com a tela | marque conforme eu faço na tela | “marca comigo”; “primeiro isso, depois isso” | gravacao-tela | 4.2 | ⚠ A3
recibos-e-contador | Recibos e contador | cada venda soma; o total sobe | “cada venda soma”; “olha o total subir” | #dado, recibos | 4.2 | ⚠ 📎 A3
capitulo-vira-pilha | Capítulo que vira pilha | capítulo, três passos e o detalhe escolhido | “capítulo 2, três passos”; “vamos ao último” | - | 4.2 | ⚠ A0
conversa-empilhada | Conversa empilhada | pergunta, resposta, resposta | “ele perguntou”; “a resposta foi” | avatar | 4.2 | ⚠ A2
tres-contextos-em-conflito | Três contextos em conflito | contextos misturados num só geram conflito | “três clientes, um pixel”; “misturou tudo” | - | 4.2 | ⚠ A1
centro-e-quatro-cantos | Centro e quatro cantos | ideia central com quatro condições | “venda confiável é”; “quatro condições” | - | 4.2 | ⚠ A2
de-x-a-y | De X a Y | custa (ou varia) de X a Y | “de R$ X a R$ Y”; “depende do público” | #dado | 4.2 | ⚠ 📎 A3
arquivar-na-grade | Arquivar na grade | cada coisa no seu lugar | “cada coisa no seu lugar”; “organiza por campanha” | - | 4.2 | ⚠ A1
cartoes-pousam-na-frente | Cartões pousam na frente | falando para a câmera, cartões pousam na frente | “são quatro passos”; “olha os quatro” | - | 4.2 | ⚠ A2
grade-com-prioridade | Grade com prioridade | problemas listados e o prioritário | “quatro causas, e a principal é”; “comece por esta” | - | 4.2 | ⚠ A3
lupa-nos-dois-lados | Lupa nos dois lados | olhar de perto os dois lados e achar o meio | “olha de perto”; “nem um nem outro” | - | 4.2 | ⚠ A1
palavras-viram-conclusao | Palavras que viram conclusão | palavras soltas e a conclusão que as junta | “o que os alunos dizem”; “tudo isso quer dizer” | evidencia | 4.2 | ⚠ A2
perguntas-viram-publico | Perguntas que viram público | faça estas perguntas; uma pessoa vira muitas | “um comprador vira vinte”; “faça estas perguntas” | - | 4.2 | ⚠ A2
matriz-afirmacao-prova | Matriz afirmação e prova | cada afirmação tem sua evidência | “afirmação e prova”; “reduziu o CPA, olha o print” | #dado | 4.2 | ⚠ 📎 A3
razao-entre-pontas | Razão entre pontas fixas | a relação entre duas pontas fixas muda | “a taxa subiu de X para Y”; “de tantos, tantos” | #dado | 4.2 | ⚠ 📎 A2
roteiro-em-colunas | Roteiro em colunas | níveis com subpassos; entrar no primeiro | “três níveis”; “vamos ao primeiro” | - | 4.2 | ⚠ A1
lista-em-capsulas | Lista em cápsulas | coisas, uma de cada vez | “três coisas”; “uma de cada vez” | - | 4.2 | ⚠ A2
status-por-etapa | Status por etapa | etapas, cada uma com seu status | “pixel ok, API ok, deduplicação com erro”; “cada etapa” | #dado | 4.2 | ⚠ 📎 A3
passos-levam-ao-capitulo | Passos levam ao capítulo | passos ligados e o capítulo seguinte | “três passos e o próximo capítulo”; “feito isso, vamos a” | - | 4.2 | ⚠ A0
cartoes-em-perspectiva-leve | Cartões empilhados em perspectiva leve | itens de uma mesma série ganham profundidade sem virar 3D de cinema | “empilhado”; “uma camada sobre a outra” | - | - | ⚠ A1
icone-animado-por-elementos | Ícone cujos elementos animam | a fala descreve uma ação (marcar dias, montar um prato, preencher checks) e o ícone… | “marcar”; “preencher” | - | - | ⚠ A2
sequencia-de-icones-rotulados | Sequência de ícones rotulados | a fala enumera exemplos (nomes de ferramentas/eventos) e cada um se destaca na sua… | “por exemplo”; “como” | icone-svg-por-item | - | ⚠ A2
REF-EDICAO-IA-EF-16 | Índice lateral com contador (lista que acende) | dar mapa e progresso numa lista longa ('17 efeitos', '5 erros'): o espectador vê… | “17 efeitos”; “N coisas” | - | 6 | ⚠ A2
REF-EDICAO-IA-EF-28 | Requisitos riscados com check final | derrubar objeções de pré-requisito: 'você não precisa ser X nem saber Y, só precisa… | “você não precisa”; “não precisa ser técnico” | - | 3 | ⚠ A3
pilulas-numeradas-em-cascata | Pílulas numeradas em cascata | listar etapas de um processo | “passo a passo”; “são sete etapas” | - | 3 | ⚠ A3

## evidencia (24)

comentario-com-marcador | Comentário com marcador | feedback sobre um documento com as palavras decisivas marcadas | “ele pediu para trocar isto e isto”; “o revisor marcou” | documento | 5.4 | ⚠ 📎 A1
problema-resposta-resolvido | Problema, resposta, resolvido | mostrar o buraco, a resposta e o fechamento | “o problema está aqui”; “a solução é esta” | print-real | 6 | ⚠ 📎 A2
prova-circular-metricas | Círculos nas métricas do painel | percorrer os números do painel confirmando um a um | “aqui o CTR, aqui o CPC, aqui o CPA”; “olha esse número” | #dado, print-painel | 4.8 | ⚠ 📎 A3
numero-ao-detalhe-na-tela | Do número ao detalhe na tela | o número-resumo e depois onde ele aparece na interface | “84% de abandono, e olha onde”; “esse é o número, aqui a causa” | #dado, print-interface | 6 | ⚠ 📎 A3
toques-no-celular | Toques no celular passo a passo | tutorial de toques | “toca aqui, depois aqui”; “passo a passo no celular” | gravacao-celular | 5.4 | ⚠ 📎 A3
trecho-de-fonte-marcado | Trecho de fonte marcado | provar uma afirmação com o trecho de uma fonte | “está escrito aqui”; “a política diz” | fonte | 6 | ⚠ 📎 A2
regiao-com-nota | Região com nota | olhar uma parte específica da tela ou documento | “repara neste campo”; “olha esta parte” | print-real | 5.4 | ⚠ 📎 A3
atalho-e-alvo | Atalho e alvo | aperte isto e aquilo muda | “Ctrl + K e olha o que abre”; “aperta isso” | tela-antes, tela-depois | 5.4 | ⚠ 📎 A2
voz-vira-texto-no-campo | Voz que vira texto no campo | ditado ou transcrição indo para um campo | “falei isto e virou isto”; “áudio vira briefing” | area-trabalho | 6 | ⚠ 📎 A2
selo-de-origem-do-dado | Selo de origem do dado | toda prova ou número na tela diz de onde vem (real, exemplo, simulação) | “exemplo”; “repare neste número” | #dado | - | ⚠ 📎 A3
prova-zoom-congela-anel | Prova: zoom, congela e anel | apontar o número exato de uma tela real que prova a tese | “olha este número”; “de 8,7 para 9,3” | #dado, print-real-ou-tela-reconstruida | - | ⚠ 📎 A3
REF-EDICAO-IA-EF-12 | Congelar e rotular com linha-guia (freeze and label) | parar o take para apontar, com rótulos, o que está acontecendo ou quem a pessoa é… | “freeze and label”; “congela” | - | 2 | 🎤 ⚠ A2
REF-EDICAO-IA-EF-17 | Arquivos caem no campo (file drop) | mostrar o 'só arrasta seus arquivos' do processo: o insumo entra na ferramenta | “file drop”; “joga seus vídeos” | - | 1.5 | ⚠ A2
traco-de-pincel-amarelo-destaque | Traço de pincel amarelo de destaque | circular o ponto exato que a fala cita | “esse aqui”; “olha esse ponto” | - | 0.4 | ⚠ A3
palavra-brilho-de-fosforo-escurece-entorno | Palavra com brilho de fósforo e entorno escurecendo | destacar a palavra-tema no vidro e apagar o resto | “o ponto”; “a palavra” | - | 0.8 | ⚠ A3
logo-citado-com-glitch-rgb | Logo citado entra com glitch RGB curto | nomear uma ferramenta no momento em que é citada | “no Meta”; “no WhatsApp” | logo | 0.6 | ⚠ A2
etiqueta-de-nome-com-seta-manuscrita | Etiqueta amarela de nome com seta manuscrita | apresentar uma pessoa ou nome sem foto de rosto nosso | “esse é”; “chamado” | imagem de arquivo própria ou gerada | 1 | A2
bolinha-vermelha-aponta | Bolinhas vermelhas que apontam | marcar quem/onde sem desenhar seta | “estes soldados”; “esses cinco pontos” | imagem de arquivo própria ou gerada | 1 | A1
redacao-com-barras-pretas | Documento com barras pretas de redação | revelar só as palavras-chave de um documento | “documento confidencial”; “o que o relatório dizia” | - | 2 | A1
etiqueta-pendular | Etiqueta de papel pendurada que balança | rótulo que pendura na cena | “vendido”; “esgotado” | - | 0.7 | ⚠ 💲 A2
lupa-callout | Lupa que amplia um detalhe com feixe | mostrar o detalhe que prova | “um detalhe”; “olha aqui” | imagem com detalhe | 0.4 | ⚠ 💲 A3
insercao-anatomica-raio-x | Inserção anatômica com raio-X | mostrar o efeito por dentro | “no corpo”; “por dentro” | figura gerada | 0.6 | ✂ ⚠ 💲 A1
mapa-relevo | Mapa em relevo 3D sobre papel | situar o lugar | “no país”; “na região” | mapa em relevo | 2.5 | 💲 A2
demo-saturacao-unica | Demonstração: só um elemento ganha cor | contraste de cor / foco no número | “só um”; “o que importa” | #dado, grade de itens ou print do painel | 1.5 | ⚠ 💲 A3

## som (15)

som-boom-de-abertura | Boom de abertura | prender o scroll no quadro 0 e depois acalmar | “(abertura de todo anúncio/VSL)” | - | 1.2 | A3
som-clique-na-virada | Clique na virada | marcar cada troca de cartela/imagem sem competir com a voz | “(cada troca de cartela, entre tensão e solução)” | - | 0.4 | A3
som-silencio-estrategico | Silêncio estratégico | destacar a frase que decide a compra tirando todo o som | “mas sabe o porquê…”; “sem prometer carro, mansão e essas balelas” | - | - | A3
som-sfx-do-objeto | SFX do objeto citado | fazer o lead ouvir a coisa que a fala cita (venda, micro-ondas, coração) | “som de notificação de venda”; “quando queria comer” | - | - | A3
som-build-up-antes-da-frase | Build-up antes da frase | avisar o ouvido 'presta atenção' antes da frase-chave ou da virada | “mas agora chegou a hora”; “(antes da solução)” | - | 2 | A3
som-plot-da-musica-no-cta | Plot da música no CTA | plantar a música no gancho e pagar no CTA com o clímax dela | “toque em saiba mais”; “mas agora chegou a hora” | - | - | A3
som-cama-com-duck | Cama com duck | manter a música sob a locução sem enterrar a voz | “(toda música sob locução)” | - | - | A3
som-trilha-por-sentimento | Trilha por sentimento | dar a cada bloco da copy a emoção certa (dor, denúncia, orgulho, solução) | “(cada bloco do roteiro)” | - | - | A3
som-ab-trocando-a-musica | A/B trocando só a música | escalar um criativo validado com variações baratas, ou provar na peça que o som… | “som inserido da maneira incorreta / da maneira correta” | - | - | A3
som-voz-com-filtro | Voz com filtro de personagem | fazer a voz soar ligação, pensamento, pressão ou personagem | “(relato que deve soar gravação de celular)”; “não importa se você não é autoridade” | - | - | A2
som-tratamento-da-narracao | Tratamento da narração | dar qualidade de estúdio à voz gravada em casa antes de montar a imagem | “(toda narração gravada em casa)”; “o áudio manda o ritmo” | - | - | A3
som-tic-tac-e-hit-de-relogio | Tic-tac de fundo e hit de relógio | tensão de tempo e pressa; urgência no CTA | “30 dias viram 6 anos”; “o tempo está passando” | - | - | A3
som-musica-tematica-com-suspense | Música temática com suspense por baixo | ambientar o assunto sem perder a tensão | “(assunto geográfico ou cultural)”; “quando o personagem pensa” | - | - | A2
respiro-editorial-pre-fala | Respiro editorial antes da primeira frase | dar um instante de ar antes da primeira palavra de uma peça falada | - | - | 0.6 | ⚠ A0
emenda-de-fala-com-fade-6ms | Emenda de fala com pausa medida e fade de 6 ms | montar a locução (voz clonada ou gravada) frase a frase sem clique e com respiro… | - | - | - | ⚠ A3

## janela (14)

agenda-move-compromisso | Compromisso que muda de dia | mudança de horário ou prazo visível na agenda | “movi a reunião para quinta”; “remarquei o diagnóstico” | tela-agenda, avatar | 4.1 | 🎤 ⚠ A1
pergunta-espera-resposta | Pergunta, espera e resposta | diálogo curto com IA ou atendimento | “perguntei isso... e ele respondeu”; “o cliente pergunta o valor” | pagina, avatar | 4.1 | 🎤 ⚠ A2
aviso-vira-registro | Aviso que vira registro | confirmar um resultado e mostrar o histórico que ficou | “recebi o aviso... e aqui o registro”; “compra aprovada, evento enviado” | tela-celular | 4.1 | 🎤 ⚠ A2
slides-e-recuo-ao-painel | Slides em sequência e recuo | mostrar páginas em sequência e, no fim, o espaço de trabalho inteiro | “são três etapas... e aqui o painel completo”; “página por página” | slides, editor | 4.1 | 🎤 ⚠ A1
janela-sobre-fundo-desfocado | Janela sobre fundo desfocado | colocar clipe horizontal, foto pequena ou objeto no 9:16 sem distorcer | “olha esse relato”; “esse é o produto” | clipe-ou-foto | - | ⚠ A3
clipe-encolhido-bordas-suaves | Clipe encolhido no centro com bordas suaves | puxar o foco para o centro da tela preta enquanto a fala é sobre foco | “falta de foco”; “(olhe aqui)” | clipe | - | ⚠ A2
moldura-empilhada-24px | Molduras empilhadas com margem de 24 px | duas informações de natureza diferente dividem a tela sem se tocar (evidência em… | “de um lado”; “enquanto isso” | bloco-superior, bloco-inferior | - | ⚠ A2
REF-EDICAO-IA-EF-03 | Mundo de interface atrás da pessoa (UI world) | dizer 'você só pede ao Claude' mostrando a interface tomando o cenário, com a… | “UI world”; “você só digita” | - | 1.8 | 🎤 ✂ ⚠ A3
REF-EDICAO-IA-EF-06 | Recuo que revela a ferramenta trabalhando (pull-back reveal) | revelar que o vídeo/peça que se vê está sendo feito pela ferramenta, com os passos… | “pull-back reveal”; “esse vídeo foi feito” | - | 2 | 🎤 ⚠ A3
REF-EDICAO-IA-EF-15 | Cartão de vídeo entre as mãos | mostrar demonstrações sem tirar o rosto do quadro, como se a pessoa segurasse o… | “cartão na mão”; “olha aqui no celular” | clipes de demonstração 9:16 | 4 | 🎤 ✂~ ⚠ A3
REF-EDICAO-IA-EF-18 | Linha do tempo de edição que limpa os erros (NLE timeline) | mostrar o trabalho chato sendo feito sozinho: os erros ficam vermelhos, somem e… | “NLE timeline”; “corta os erros” | #dado | 2 | ⚠ 📎 A3
clipe-arrastado-com-cursor-encaixa-no-vidro | Clipe arrastado por cursor que encaixa na TV | mostrar o mecanismo de colocar o conteúdo dentro da moldura | “arrasta”; “joga aqui” | clipe + TV própria | 1.5 | ⚠ A3
layout-tv-em-cima-rosto-embaixo | TV em cima, rosto embaixo | manter o rosto visível enquanto a moldura sustenta o tema | “olha aqui”; “o arquivo” | TV própria | 2 | 🎤 ⚠ A3
janela-de-sistema-com-rosto | Janela de sistema com foto | foto dentro de janela de computador, em perspectiva | “imagine”; “a conta dele” | foto nossa ou gerada | 1 | A1

## cta (10)

chevron-duplo-cta | Chevron duplo do CTA | apontar o botão real (Saiba mais / botão abaixo) sem parecer seta de indução | “toque em saiba mais”; “toque no botão verde abaixo” | - | 10 | ⚠ A3
cta-tela-verde-alternada | CTA com tela que alterna | hora do botão: a tela pisca entre o fundo escuro e a cor de ação no ritmo da voz | “prioritário, rápido, direto”; “toque agora” | - | - | ⚠ A2
cta-final-em-loop | CTA final em loop | fecho de todo anúncio: a chamada fica na tela piscando até o fim | “toque em saiba mais e aprenda a criar este tipo de…”; “toque agora para agendar a sua reunião comigo” | b-roll-escurecido-opcional | - | ⚠ A3
fecho-por-duvida-desfocada | Fecho por dúvida que sai do desfoque | fechar com desafio em vez de repetir o CTA | “preparado?”; “(desafio final)” | - | - | ⚠ A3
convite-composto-sem-botao | Convite composto em texto e formas | quando não há banner pronto, o convite ao próximo passo é montado no próprio quadro | “toque”; “clique abaixo” | - | - | ⚠ A2
REF-EDICAO-IA-EF-24 | Caixa de comentário que digita a palavra (comment drop) | fechar o orgânico mostrando exatamente o que digitar e o que a pessoa recebe em… | “comment drop”; “comment CTA” | - | - | ⚠ A0
cartao-comentario-cai-no-bolso | Cartão de comentário que cai num bolso | pedir o comentário com a PALAVRA-CHAVE | “comente”; “escreva” | - | 4 | ⚠ 💲 📎 A1
cta-fundo-preto-palavra-entre-aspas-parada | CTA em fundo preto, palavra entre aspas, 3 s parado | fechar com a palavra a comentar, parada | “comenta”; “me chama com a palavra” | - | 3 | ⚠ A1
fecho-em-preto-com-frase-final | Fecho em preto com a frase de conceito | fechar a peça pelo conceito, sem CTA falado | “a frase final”; “o conceito” | imagem de arquivo própria ou gerada | 1 | A1
cta-ponte-da-moral-com-produto-objeto | CTA que nasce da moral com o produto como objeto | da moral para a oferta sem quebrar o filme | “quem faz isso começou com”; “comente” | tela do nosso produto | 5 | ⚠ 💲 A3

## capitulo (9)

capitulo-borda-orbital | Capítulo com borda orbital | título de capítulo com energia discreta | “capítulo 2”; “parte dois” | - | 4.1 | 🎤 ⚠ A0
capitulo-janela-navegador | Capítulo em janela de navegador | capítulo sobre produto digital ou site | “agora vamos para o navegador”; “abre a página” | - | 4.1 | 🎤 ⚠ A0
capitulo-letra-a-letra | Capítulo letra a letra | título curto lido com calma | “passo três”; “agora o principal” | - | 4.1 | ⚠ A1
capitulo-grade-que-gira | Grade de capítulos que gira | mostrar em qual etapa estamos entre várias | “estamos no passo 3 de 6”; “você está aqui” | - | 4.1 | 🎤 ⚠ A0
capitulo-grade-em-diagonal | Grade de capítulos em diagonal | localizar o módulo com vizinhos visíveis | “vamos ao módulo 4”; “o próximo módulo” | - | 4.1 | ⚠ A0
capitulo-selo-titulo-subtitulo | Selo, título e subtítulo | o título de capítulo padrão, sempre disponível | “módulo 2: criativos”; “parte um” | - | 4.1 | ⚠ A1
capitulo-carimbo-abre-cena | Carimbo que abre a cena | título que estampa e leva à cena seguinte | “parte um”; “e agora” | proxima-cena | 4.1 | ⚠ A1
cartela-textura-trocando | Cartela de palavra com textura de fundo trocando | dar vida a um título parado | “capítulo”; “a palavra do dia” | 3 texturas próprias | 2 | ⚠ A2
interludio-de-papel-com-texto | Interlúdio de papel só com texto | respiro entre cenas ou apresentação de números e datas | “em 1854”; “127 mortos em três dias” | - | 2.5 | A2

## divisao (9)

grafico-varredura-lateral | Gráfico largo percorrido | comparar dois grupos de valores num gráfico maior que a tela | “veja o que aconteceu da semana 1 para a semana 2”; “olha a ponta de cada barra” | #dado | 4.1 | 🎤 ⚠ 📎 A1
duas-curvas-troca-lado | Duas curvas trocando de lado | duas séries da mesma linha do tempo, uma caiu e a outra subiu | “vou te mostrar as duas curvas”; “a cinza caiu, a ciano subiu” | #dado | 4.1 | 🎤 ⚠ 📎 A1
celular-com-etiquetas | Celular com duas etiquetas | mostrar uma conversa/app e destacar duas capacidades | “e ele responde assim”; “e ainda faz isso e isso” | tela-celular, avatar | 4.1 | 🎤 ⚠ A3
celular-conclui-e-recua | Celular que conclui e recua | sequência curta no celular termina numa ação e o resultado respira | “faz isso, isso e isso... pronto”; “publicado” | tela-celular | 4.1 | 🎤 ⚠ A3
lista-progressiva-apresentador | Lista que acumula ao lado do apresentador | argumento em pontos, cada um com sua vez, todos ficando | “são três motivos”; “primeiro... segundo... terceiro” | - | 4.1 | 🎤 ⚠ A3
citacao-sublinhada | Citação com trecho sublinhado | relato ou frase-chave com a parte que importa marcada | “ele me disse”; “olha o que a aluna escreveu” | retrato-autorizado | 4.1 | ✂~ ⚠ A3
faixa-de-leitura-documento | Faixa de leitura num documento | leitura guiada de uma resposta ou documento denso, trecho a trecho | “olha o que a ferramenta respondeu”; “aqui, e depois aqui” | documento | 4.1 | 🎤 ⚠ A2
veredito-tres-afirmacoes | Três afirmações com veredito | julgar três afirmações uma a uma (certo, dúvida, errado) | “mito, mito, verdade”; “isso é verdade?” | - | 4.1 | 🎤 ⚠ A3
tela-dividida-midia-em-cima | Tela dividida narrativa: mídia real em cima, pessoa embaixo | contar uma história real com prova visual contínua enquanto a pessoa narra | “olha isso”; “nesse vídeo” | vídeo/foto real do caso | 6 | 🎤 ⚠ 📎 A2

## composicao (5)

papel-de-parede-de-objeto-repetido | Papel de parede do objeto repetido | o substantivo vira padrão | “todo mundo tem”; “a próxima revolução” | - | 2 | 💲 A3
faixas-diagonais-de-papel | Faixas diagonais de papel | acúmulo, lista, crise | “e mais”; “uma atrás da outra” | - | 2.5 | 💲 A3
pagina-de-hq-em-quadros | Página de HQ em quadros | frase em 3–4 partes | “primeiro… depois… e no fim” | - | 1.5 | 💲 A3
grade-de-paineis-que-se-preenche | Grade de painéis que se preenche | montagem automática | “um clique monta”; “gera tudo” | - | 2 | 💲 A3
bolhas-de-avatar-que-florescem | Bolhas de avatar que florescem | o público, todo mundo | “você já viu”; “todo mundo” | - | 0.9 | 💲 A3

## objeto (4)

folha-amassa-e-cai-no-lixo | Folha que amassa e cai no lixo | ideia descartada | “jogaram fora”; “ignoraram” | - | 0.9 | 💲 A3
aneis-concentricos-de-sinal | Anéis concêntricos de sinal | alcance, comunicação | “alcance”; “chegou em todo mundo” | - | 1 | 💲 A3
emoji-3d-como-elenco | Emojis 3D como elenco | situação cotidiana sem rosto | “quando você”; “aquela sensação” | - | 1.4 | 💲 A2
adesivo-que-se-cola | Etiqueta que se cola | apresentar o objeto-símbolo | “essas pequenas”; “o selo” | - | 0.4 | 💲 A3

## demonstracao (1)

esteira-sob-mira-de-leitura | Esteira sob mira de leitura | cada item é verificado | “cada produto”; “todos passavam por” | - | 3 | 💲 A3
