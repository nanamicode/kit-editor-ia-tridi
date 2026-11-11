export const meta = {
  name: 'criativo-tridi-conceitos',
  description: 'Analisa oferta Tridi (funil+site+refs), garimpa acervo, gera conceitos concorrentes, julga e monta ficha de confirmacao',
  phases: [
    { title: 'Pesquisa', detail: 'funil/site, referencias e acervo em paralelo' },
    { title: 'Conceitos', detail: '4 conceitos radicalmente diferentes' },
    { title: 'Julgamento', detail: '3 juizes com lentes distintas' },
    { title: 'Ficha', detail: 'sintese da ficha e roteiros finais' },
  ],
}

const WS = 'C:/Users/Vinicius Prado/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/scratch-workspaces/cbcefd08-3c72-4ec7-af15-90a5e393045f/1fb5fd07-2315-4f23-9191-6e0300909064/scratch-2026-11-09-db7476'
const ACERVO = 'C:/Users/Vinicius Prado/Downloads/ACERVO DE MIDIAS CURSO CLAUDE'
const IMGS = 'C:/Users/VINICI~1/AppData/Local/Temp/claude/cce6e87fd048478d/3327bc43-165b-4a4b-b1b1-90111da6eb0f/images'

async function A(prompt, opts) {
  for (let i = 1; i <= 3; i++) {
    try { const r = await agent(prompt, opts); if (r) return r; log('vazio ' + (opts && opts.label) + ' ' + i) }
    catch (e) { log('falha ' + (opts && opts.label) + ' ' + i + ': ' + String(e).slice(0, 100)) }
  }
  return null
}

const CONTEXTO = `CONTEXTO DO PROJETO (leia com atencao):
- Cliente: Carimbos Tridi (loja do usuario; Instagram @carimbos.tridi; site https://carimbostridi.com.br ; funil de anuncio "type" https://tridicarimbos.com.br/typecarimbostridi/ que embute um chat em https://chat.carimbostridi.com/type-carimbos-tridi simulando Direct do Instagram). Produto: carimbos personalizados com a logo do cliente (tambem "carimbos de alta precisao"), para pequenos negocios personalizarem embalagens (sacola kraft, caixa de pizza, copo de papel, saco plastico, guardanapo etc.).
- Pedido do usuario (literal): "quero um criativo que seja bem diferente do que estamos acostumados a rodar, algo que chame a atencao e que sirva para vender carimbos personalizados, utilize todo esse contexto e essas midias e seja criativo. utilize todo contexto dos dois cursos ... crie uma copy nova, use uma estetica definida no video e busque fazer o melhor video que puder. acredito que o tempo ideal seja de 15 a 30 segundo."
- O QUE ELES JA RODAM (evitar repetir o formato): 3 anuncios de referencia em ${WS}/originais/tridi/ref1.mp4, ref2.mp4, ref3.mp4 (16-19 s; contact sheets em ${WS}/analise/tridi/sheet1.jpg..sheet3.jpg; transcricoes em ${WS}/analise/tridi/transcricoes.json). Formato atual: b-roll de maos carimbando embalagens + legenda palavra a palavra + apresentadora de cabelo cacheado e polo roxa em fundo roxo dizendo o CTA "Clique em Saiba Mais". Falas atuais: "Por menos de 30 centavos, seu carimbo personalizado estampa sua marca em qualquer embalagem... É isso que faz o cliente lembrar da sua marca. Quer saber mais? Clique aqui." / "Enquanto outros pagam graficas, voce pode personalizar com carinho..." / "Voce capricha no produto para entregar numa embalagem sem a sua marca... gastando centavos por aplicacao. Faz diferenca, ne? Clique em Saiba Mais e garanta o seu!". (A afirmacao "menos de 30 centavos" e "centavos por aplicacao" e do proprio anunciante, mas trate numeros como a confirmar com o usuario.)
- Imagens que o usuario enviou (pode abrir com Read): ${IMGS}/7.png (destaques do Instagram: 3 videos de clientes reais/UGC, "Fica a dica", "Clique aqui para saber mais"), ${IMGS}/8.png e ${IMGS}/9.png (criativos estaticos "CARIMBO PARA PAPEL", sacola kraft com logo, "Personalizacao Economica", "Com a sua Logo", selo "RISCO ZERO - 7 DIAS DE GARANTIA"), ${IMGS}/10.png (site: faixa "Qualidade com preco direto de fabrica", logo de polvo/tentaculos "Carimbos Tridi", banner roxo "SEU NEGOCIO COM MAIS IDENTIDADE - CARIMBO PERSONALIZADO - COMPRE AGORA" com sacola e carimbo "Doces da Vovo"). Cores da marca: roxo vibrante #8B00FF-ish, roxo escuro, lilas, branco; fonte condensada pesada no banner.
- Metodo e regras: leia ${WS}/CLAUDE.md e as skills em ${WS}/.claude/skills/ (criativo-anatomia-gancho, criativo-frameworks-copy, criativo-diretor-ia, criativo-meta-regras, criativo-prompt-mestre, criativo-catalogo-estilos, criativo-acervo-midias, criativo-estilos-referencia; e remotion-*). Regras-chave: 1 ideia, 1 angulo, 1 CTA; gancho 0-3 s com fala <=8 palavras + movimento + texto na tela; corpo = problema + mecanismo; prova real (NUNCA inventar numero, depoimento, preco, prazo, promocao, garantia); 9:16 1080x1920 com o essencial dentro do 4:5 central; tela de celular nunca vazia; destino provavel Meta Ads (no Meta o usuario aceita musica com copyright; no TikTok nao); duracao 15-30 s.
- Acervo de midia local (somente leitura): ${ACERVO} (b-roll Pexels 769 clipes com CREDITOS.csv; sons em fca-acervo-sons-*/sons/...; trilhas indexadas em ${WS}/.claude/skills/criativo-acervo-midias/references/trilhas-indice.csv; catalogos de estilos/efeitos indexados em ${WS}/.claude/skills/criativo-catalogo-estilos/references/; imagens de exemplo de estilos em ${ACERVO}/efeitos-e-estilos/exemplos/img/).
- Limites tecnicos da maquina: Windows, GPU fraca (GT 610, sem WebGPU), renderizacao Remotion em software (--gl=angle, Chrome do sistema), recorte de fundo via RVM em CPU (funcionou bem), Whisper local ok, disco com ~5 GB livres. Sem gerar imagem/video por IA paga (nao ha chaves). Sem voz ElevenLabs (nao ha chave); narracao: voz gravada do usuario OU reaproveitar falas existentes da apresentadora nos refs OU texto na tela sem narracao OU voz sintetizada local (avaliar qualidade/licenca).`

const RESEARCH = {
  type: 'object',
  properties: { summary: { type: 'string' }, file: { type: 'string' }, gaps: { type: 'array', items: { type: 'string' } } },
  required: ['summary', 'file'],
}

phase('Pesquisa')
const [oferta, refs, acervo] = await parallel([
  () => A(`${CONTEXTO}

SUA TAREFA: ler a OFERTA. Use o navegador interno do app (ferramentas mcp__Claude_Browser__*; carregue com ToolSearch se estiverem deferidas; crie SUA PROPRIA aba com tabs_create e passe tabId em todas as chamadas; feche ao final). (1) Abra https://chat.carimbostridi.com/type-carimbos-tridi (funil em formato de chat). Ele avanca por mensagens e botoes de escolha. Percorra o fluxo clicando nos botoes de resposta (escolhas como "Sim, quero saber"), esperando as mensagens, rolando e tirando screenshots/lendo o texto, ate o fim ou ate um campo que peca dado pessoal (nome, telefone, e-mail, CEP): NESSE PONTO PARE e nao digite nada. Registre o roteiro inteiro do chat: cada mensagem, cada botao, precos/kits/prazos/garantia/frete/formas de pagamento/argumentos/objecoes respondidas/depoimentos/imagens descritas. (2) Leia https://carimbostridi.com.br : home, catalogo (tipos de carimbo, tamanhos, materiais, precos se visiveis), paginas de produto mais relevantes (1-3), politicas de garantia/troca/prazo de producao/frete, avaliacoes/depoimentos visiveis. Nao compre, nao preencha formularios, nao aceite cookies alem do necessario (recuse os nao essenciais). Nao invente: registre so o que esta escrito na tela. Escreva ${WS}/analise/tridi/oferta.md (em portugues, com acentos): roteiro completo do funil; fatos da oferta (com onde apareceu); provas reais disponiveis (depoimentos, numeros, prints) e se sao verificaveis; publico provavel; dores/desejos/objecoes que a propria pagina usa; o mecanismo (como funciona o carimbo: tinta, almofada, materiais); diferenciais; o que NAO esta claro e precisa ser perguntado ao usuario.`, { label: 'oferta:funil+site', phase: 'Pesquisa', schema: RESEARCH }),
  () => A(`${CONTEXTO}

SUA TAREFA: analisar a fundo os 3 anuncios atuais (refs) e o que ja existe de material proprio do cliente. Extraia quadros com ffmpeg (ex.: fps=4) dos 3 refs, olhe-os (Read) e identifique: cada clipe de b-roll (tempo, o que mostra, qualidade, se a marca carimbada e legivel, se ha maos/luvas), os trechos da apresentadora (tempo, fala, enquadramento, fundo roxo), estilo de legenda, ritmo de corte, musica/sons (meça loudness e descreva). Indique quais trechos sao REAPROVEITAVEIS como materia-prima num criativo novo (ex.: melhores carimbadas em close, revelacao da logo, a apresentadora falando 'Faz diferenca, ne?'), com arquivo e tempos exatos. Verifique tambem os arquivos em ${WS}/originais/ (o criativo.mp4 antigo, com a mesma apresentadora) e em ${WS}/projeto/public/ (matte/plate da apresentadora ja recortada do criativo antigo: 107 quadros RGBA a partir de 7.6s). Diga o que se repete nos 3 refs (o 'jeito de sempre') para os conceitos fugirem disso. Escreva ${WS}/analise/tridi/refs.md (portugues, com acentos), com uma tabela de trechos reaproveitaveis (arquivo, inicio-fim, descricao, nota 0-10 de qualidade visual) e o diagnostico do formato atual.`, { label: 'refs:analise', phase: 'Pesquisa', schema: RESEARCH }),
  () => A(`${CONTEXTO}

SUA TAREFA: garimpar o ACERVO e os CATALOGOS para um criativo de carimbos personalizados para pequenos negocios. (1) Nos catalogos indexados (${WS}/.claude/skills/criativo-catalogo-estilos/references/estilos-edicao.md, estilos-visuais.md, efeitos-indice.md, efeitos-familias.md, prompts-video-indice.md) selecione: 8 estilos de edicao, 8 estilos visuais (V) e 15 efeitos que combinem com carimbo/embalagem/marca/identidade/pequeno negocio e com anuncio de 15-30 s, explicando por que; abra no acervo 1 imagem de exemplo de cada estilo escolhido (${ACERVO}/efeitos-e-estilos/exemplos/img/... ; os JSON originais ${ACERVO}/efeitos-e-estilos/*.json dizem quais imagens sao de cada estilo) e descreva o que ve. (2) No b-roll (${ACERVO}/fca-acervo-b-roll-*/b-roll/CREDITOS.csv e pastas), ache clipes uteis (embalagens, entregas, pequenas lojas, cafeteria, confeitaria, delivery, caixas, sacolas, maos, cliente abrindo pacote, dono de negocio), extraia 1 quadro de cada candidato (ffmpeg -ss 2 -frames:v 1) e olhe; liste os 12 melhores com caminho, resolucao (ffprobe) e para que cena serve. (3) Sons: em ${ACERVO}/fca-acervo-sons-1-efeitos/sons/ (03-sons-livres e 01-efeitos-hardcopy, com INDICE.csv/CREDITOS.md) escolha sons para: carimbada (thump/stamp/impacto seco), whoosh, pop, clique, ding/caixa-registradora, riser; e na lista de trilhas (${WS}/.claude/skills/criativo-acervo-midias/references/trilhas-indice.csv) 4 trilhas candidatas (categoria e arquivo). Para cada som/trilha, diga licenca (sons livres CC0/Mixkit = mais seguros). Escreva ${WS}/analise/tridi/acervo.md (portugues, com acentos) com tudo isso e caminhos absolutos.`, { label: 'acervo:garimpo', phase: 'Pesquisa', schema: RESEARCH }),
])

const pesquisa = { oferta, refs, acervo }
phase('Conceitos')
const CONCEPT = {
  type: 'object',
  properties: {
    nome: { type: 'string' },
    big_idea: { type: 'string' },
    framework: { type: 'string' },
    estilo_edicao: { type: 'string' },
    estilo_visual: { type: 'string' },
    funil_temperatura: { type: 'string' },
    duracao_s: { type: 'number' },
    ganchos_alternativos: { type: 'array', items: { type: 'string' } },
    roteiro: { type: 'array', items: { type: 'object', properties: { tempo: { type: 'string' }, fala: { type: 'string' }, texto_tela: { type: 'string' }, visual: { type: 'string' }, som: { type: 'string' } }, required: ['tempo', 'fala', 'texto_tela', 'visual', 'som'] } },
    prova: { type: 'string' },
    cta: { type: 'string' },
    texto_anuncio: { type: 'string' },
    titulo_anuncio: { type: 'string' },
    narracao: { type: 'string' },
    materiais_usados: { type: 'array', items: { type: 'string' } },
    viabilidade_tecnica: { type: 'string' },
    o_que_precisa_do_usuario: { type: 'array', items: { type: 'string' } },
    por_que_e_diferente: { type: 'string' },
  },
  required: ['nome', 'big_idea', 'framework', 'roteiro', 'cta', 'viabilidade_tecnica', 'por_que_e_diferente', 'ganchos_alternativos'],
}
const ANGLES = [
  { k: 'virada', p: 'ANGULO: 4 atos com virada (Kishotenketsu) - abrir com uma cena que o dono de pequeno negocio reconhece e virar a expectativa no 3o ato; alta retencao.' },
  { k: 'tela-conhecida', p: 'ANGULO: "a tela que o comprador ja usa" - prova/situacao pela interface que o dono de negocio usa todo dia (ex.: conversa de WhatsApp/Direct com cliente, pedido no iFood, comentario de cliente, unboxing filmado pelo cliente) - sem inventar dados; tela nunca vazia.' },
  { k: 'objeto-heroi', p: 'ANGULO: o CARIMBO e a EMBALAGEM como herois visuais com tratamento premium/3D/macro (o momento da carimbada como espetaculo, relevo, tinta, ritmo sincronizado com batida), PAS ou AIDA em 15-20 s, quase sem fala, texto forte na tela.' },
  { k: 'humor-ugc', p: 'ANGULO: humor/situacao inesperada ou formato nativo (UGC, meme, POV, "antes e depois" da embalagem sem graca para a embalagem com marca) que pareca conteudo e nao anuncio, usando os videos de clientes como prova social quando possivel.' },
]
const concepts = await parallel(ANGLES.map(a => () => A(`${CONTEXTO}

PESQUISA PRONTA (leia os arquivos citados, sao a base factual): ${JSON.stringify(pesquisa)}

Voce e um diretor criativo senior de anuncios de performance. Crie UM conceito de criativo de 15-30 s, 9:16, para vender carimbos personalizados da Carimbos Tridi, que seja BEM DIFERENTE do formato atual (b-roll + legenda + apresentadora no roxo). ${a.p}
Use os cursos (skills) a risca: escolha framework e diga por que; gancho em 3 camadas (fala <=8 palavras, movimento, texto central) e mais 4 ganchos alternativos de TIPOS diferentes; corpo com mecanismo; uma prova REAL que exista no material (se nao existir, diga o que pedir ao usuario e deixe o lugar marcado como [A CONFIRMAR]); um unico CTA coerente com o destino (o funil 'type' em formato de Direct: o CTA pode ser 'Toque em Saiba Mais'/'Envie uma mensagem' conforme a oferta); escolha um estilo de edicao (numero e nome do catalogo) + um visual (V numero e nome) e justifique pela cena que o publico conhece; descreva cada cena (tempo, fala, texto na tela, visual, som), quais materiais do acervo/refs usa (caminhos), como narrar com os recursos disponiveis, e a VIABILIDADE tecnica real nesta maquina (Remotion em software, sem IA paga). Respeite as regras da Meta (sem promessa de ganho, sem antes/depois corporal, sem urgencia falsa, sem dado inventado). Escreva tambem texto do anuncio (1 texto) e 1 titulo. Seja ousado na ideia, mas executavel aqui.`, { label: 'conceito:' + a.k, phase: 'Conceitos', schema: CONCEPT }))).then(r => r.filter(Boolean))

phase('Julgamento')
const SCORE = {
  type: 'object',
  properties: {
    notas: { type: 'array', items: { type: 'object', properties: { nome: { type: 'string' }, nota: { type: 'number' }, forcas: { type: 'string' }, fraquezas: { type: 'string' }, correcoes: { type: 'string' } }, required: ['nome', 'nota', 'fraquezas', 'correcoes'] } },
    ranking: { type: 'array', items: { type: 'string' } },
  },
  required: ['notas', 'ranking'],
}
const LENS = [
  { k: 'performance', p: 'LENTE PERFORMANCE (diretor de trafego Meta): forca do gancho nos 3 s (taxa de 3 s), retencao ate o CTA, clareza da unica ideia, CTA coerente com o funil, chance de CTR; adequacao ao Meta Andromeda (semantica nova vs. anuncios atuais).' },
  { k: 'copy-regras', p: 'LENTE COPY E COMPLIANCE: framework bem aplicado, fala do comprador, prova real (reprove qualquer dado inventado, preco/prazo/garantia sem fonte), politicas da Meta, CTA unico, gancho <=8 palavras.' },
  { k: 'producao', p: 'LENTE PRODUCAO: viabilidade real nesta maquina (Remotion em software, GPU fraca, sem IA paga, sem ElevenLabs, materiais existentes), risco de ficar com cara de IA, qualidade visual possivel com os materiais disponiveis, tempo de render, se a estetica definida e coerente com a marca (roxo/lilas/branco).' },
]
const juizes = await parallel(LENS.map(l => () => A(`Voce e um juiz exigente. Avalie, de 0 a 10, estes conceitos de criativo para Carimbos Tridi (contexto: ${CONTEXTO.slice(0, 2500)}). ${l.p}
CONCEITOS: ${JSON.stringify(concepts)}
Para cada um: nota, forcas, fraquezas e correcoes concretas. Depois o ranking. Seja duro: so 9+ se estiver pronto para rodar.`, { label: 'juiz:' + l.k, phase: 'Julgamento', schema: SCORE }))).then(r => r.filter(Boolean))

phase('Ficha')
const ficha = await A(`${CONTEXTO}

PESQUISA: ${JSON.stringify(pesquisa)}
CONCEITOS: ${JSON.stringify(concepts)}
JULGAMENTO DE 3 JUIZES: ${JSON.stringify(juizes)}

Voce e o diretor criativo final. Monte a FICHA DE CONFIRMACAO no padrao do prompt mestre do curso (skill criativo-prompt-mestre: 8 blocos Oferta, Publico e funil, O que produzir, Estilo, Arquivos de apoio, Voz, Onde salvar, Regras), mostrando para cada campo: o que o usuario disse / o que foi descoberto (com fonte) / o que foi escolhido por voce e por que. Em seguida apresente os 3 MELHORES conceitos (ja com as correcoes dos juizes aplicadas, enxertando as melhores ideias dos outros), em ordem de recomendacao, cada um com: nome, big idea (2 linhas), por que e diferente do que ja rodam, framework, estilo de edicao + visual (numeros do catalogo e caminho de 1 imagem de exemplo), duracao, ROTEIRO em tabela tempo | fala | texto na tela | visual | som, 5 ganchos alternativos (tipos diferentes), prova usada (real ou [A CONFIRMAR]), CTA, texto e titulo do anuncio, materiais (caminhos), narracao, riscos e o que falta do usuario. Termine com a lista curta de PERGUNTAS ao usuario (so o que impede produzir) e a previsao de producao (tempo de render aproximado nesta maquina; custo = zero se sem IA paga). Grave ${WS}/analise/tridi/BRIEFING.md (portugues, com acentos, formatado para leitura humana). Nao produza video. Responda com o caminho e um resumo de 10 linhas.`, { label: 'ficha', phase: 'Ficha' })

return { pesquisa, n_conceitos: concepts.length, juizes: juizes.map(j => j.ranking), ficha }
