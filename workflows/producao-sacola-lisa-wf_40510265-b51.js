export const meta = {
  name: 'producao-sacola-lisa',
  description: 'Produz o criativo Tridi "A Sacola Lisa" (sem narracao) em Remotion com revisao adversarial e render final',
  phases: [
    { title: 'Preparo', detail: 'cortes do ref1, sacola, sons, trilha e batidas' },
    { title: 'Montagem', detail: 'composicao Remotion, stills e amostra' },
    { title: 'Revisao', detail: '3 revisores com lentes distintas' },
    { title: 'Correcao', detail: 'correcoes e nova conferencia' },
    { title: 'Entrega', detail: 'render final, texto, capas' },
  ],
}

const WS = 'C:/Users/Vinicius Prado/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/scratch-workspaces/cbcefd08-3c72-4ec7-af15-90a5e393045f/1fb5fd07-2315-4f23-9191-6e0300909064/scratch-2026-11-09-db7476'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
async function A(prompt, opts) {
  for (let i = 1; i <= 3; i++) {
    try { const r = await agent(prompt, opts); if (r) return r; log('vazio ' + opts.label + ' ' + i) }
    catch (e) { log('falha ' + opts.label + ' ' + i + ': ' + String(e).slice(0, 100)) }
  }
  return null
}

const BASE = `Projeto: criativo de anuncio (Meta Ads, 9:16 1080x1920, 30 fps) para Carimbos Tridi (carimbos personalizados com a logo do cliente para pequenos negocios marcarem sacola, copo, caixa). Raiz WS: ${WS}. LEIA ANTES: ${WS}/CLAUDE.md; ${WS}/analise/tridi/BRIEFING.md (CONCEITO 1 "A Sacola Lisa": roteiro cena a cena, estetica "Tridi Impresso", materiais com caminhos; Bloco 8 de regras); ${WS}/analise/tridi/refs.md (trechos do ref1 com tempos, legenda queimada a partir de y~70%); ${WS}/analise/tridi/acervo.md (sons e trilhas, caminhos absolutos); skills em ${WS}/.claude/skills/ (criativo-anatomia-gancho, criativo-diretor-ia, criativo-meta-regras, criativo-catalogo-estilos, criativo-acervo-midias e remotion-best-practices + remotion-markup/*.md).
DECISOES JA TOMADAS PELO DIRETOR (o usuario delegou: "apenas produza um que fique bom, quero algo que venda"):
- Conceito 1 "A Sacola Lisa", MAS **SEM NARRACAO**: o texto na tela carrega a historia (formato POV de Reels), com trilha + SFX. Duracao alvo 18-22 s. Todo o texto essencial dentro do 4:5 central (y 285-1635), titulos Anton >=84 px, apoio Inter SemiBold >=48 px, maximo ~7 palavras por tela, tempo de leitura >= 0,25 s por palavra + 0,4 s.
- Estetica "Tridi Impresso": fase sem marca = papel kraft + reticula (halftone) cinza/preto, trilha abafada (passa-baixa); quadro da CARIMBADA (~9 s) troca tudo para risografia em roxo #8B00FF / sombra #3A0A6B / lilas #B48CFF / branco, registro desalinhado ~3 px, trilha cheia. Recortes sempre com borda branca 12 px (colagem). Nada de degrade generico. Uma revelacao so.
- Protagonista: uma sacola kraft (nao ha foto do usuario): construa-a como recorte de papel kraft crivel (SVG/canvas com textura de papel real gerada proceduralmente, dobras, alca de papel torcido, sombra), com dois olhos simples em traco de carimbo; NADA de cara de clip-art/cartoon infantil. Ela pode olhar, inclinar, ser carimbada.
- Logo da virada: marca ILUSTRATIVA ficticia (ex.: "Doce da Lu" com um desenho simples tipo carimbo), com etiqueta pequena "marca ilustrativa" perto; nunca usar marcas de clientes reais como se fossem a da virada.
- Prova: b-roll PROPRIO da Tridi no ref1 (${WS}/originais/tridi/ref1.mp4; 720x1280 com legenda queimada: recortar acima de y~70% ou usar em cartao menor com borda branca que esconda a legenda; tratar com o mesmo look). Trechos: copo "Acai no Grau" 1,30-2,30 s (carimbo sobe, logo nitida); sacola "Sapore di Nata" 4,05-4,70; caixas de pizza 5,70-6,70; copo "Sorveteria do Paes" 10,55-11,20; sacola "Delicias da Elaine" com parede roxa Tridi 11,75-12,70. Borrar telefones/nomes de pessoas se aparecerem. Selo pequeno "embalagens reais de clientes Tridi". NAO usar ref2/ref3 (b-roll de terceiros).
- Texto (sem fala): use as falas do roteiro do Conceito 1 como textos na tela, encurtando: "POV: SOU UMA SACOLA SEM MARCA" -> "LEVEI O MELHOR BRIGADEIRO DA CIDADE" -> adesivo "O CLIENTE AMOU ♥" (desenhe o coracao como forma, nao emoji) -> balao "é de onde??" -> "LISA." -> "NINGUÉM LEMBROU DE MIM." (cascata de sacolas cinzas iguais) -> "ATÉ QUE…" -> TUM + selo "CARIMBADA." + mundo vira roxo -> "AGORA EU TENHO NOME." -> prova: "BORRACHA SÓLIDA" / "GRAVADA A LASER" sobre o close real -> "1 CARIMBO. VÁRIAS EMBALAGENS." (sacola, copo, caixa de pizza reais) -> "NÃO TEM LOGO? ELES CRIAM." -> CTA "TOQUE EM SAIBA MAIS" + linha "veja quanto custa deixar a sua assim" + assinatura "Carimbos Tridi" (wordmark em texto; nao baixar logo). Selo pequeno "CENA ILUSTRATIVA" no trecho encenado. Ultimo quadro faz loop com o primeiro, sem fade. Nenhum preco, prazo, garantia, numero.
- Sons: carimbada = SFX/hit-cta/hit-madeira-seco-01.wav + FOLEY/foley-380-table-fist-hits-wood-table-06.wav; papel = FOLEY/foley-303-paper-rustle-short-01.wav; whoosh, pop, clique, riser, ding conforme o BRIEFING (caminhos completos no BRIEFING/acervo.md). Trilha = TRILHA_SEGURA (03-sons-livres/trilhas/hiphop-trap-leve/hiphop-02-positivo.mp3, Mixkit): versao abafada ate a carimbada e cheia depois; silencio de 0,3-0,4 s antes do TUM e no "LISA.". Mix final ~ -14 LUFS, pico < -1 dBTP.
- Tecnica: Remotion 4.0.542 ja instalado em ${WS}/projeto (three, @remotion/media, transitions, effects, google-fonts, shapes etc.). Crie TUDO novo em ${WS}/projeto/src/tridi/ e assets em ${WS}/projeto/public/tridi/ (copiar so o necessario; disco ~4 GB livre). Registre a composicao id "SacolaLisa" (1080x1920, 30 fps) adicionando-a em ${WS}/projeto/src/Root.tsx SEM quebrar a composicao "Criativo" existente. Movimento so por useCurrentFrame/interpolate/spring; proibido CSS animation e useFrame. Verificacao obrigatoria: render de stills com: cd ${WS}/projeto && npx remotion still src/index.ts SacolaLisa --frame=N --gl=angle --browser-executable="${CHROME}" <saida.png> e LER as imagens (Read). Renders de video com o mesmo --gl/--browser-executable e --concurrency=3. Sem GPU: manter efeitos leves (halftone/riso pre-processados com ffmpeg ou SVG simples; evite filtros pesados por quadro em video 1080p).`

const OUT = { type: 'object', properties: { summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } }, limitations: { type: 'array', items: { type: 'string' } } }, required: ['summary'] }

phase('Preparo')
const prep = await A(`${BASE}

SUA TAREFA (PREPARO): (1) Extraia do ref1 os 5 trechos citados como arquivos mp4 sem audio em ${WS}/projeto/public/tridi/ (recorte que remova a legenda queimada; verifique olhando quadros; borre telefone/nome de pessoa se visivel) e um quadro estatico do close "Acai no Grau" logo nitida. (2) Copie para ${WS}/projeto/public/tridi/sfx/ apenas os sons que serao usados e a trilha (converta para wav 48k se preciso); gere a versao ABAFADA da trilha (ffmpeg lowpass ~600 Hz) e meça BPM/batidas (ex.: com librosa se houver, senao detecte onsets com ffmpeg/numpy) e grave ${WS}/projeto/src/tridi/beats.json (bpm e tempos das batidas). (3) Gere texturas: papel kraft (PNG 1080x1920 e 1024x1024 tileavel) com fibras e grao, papel de fundo, mascara de "tinta de carimbo" (borda irregular, falhas leves), padrao de reticula, para uso no Remotion. (4) Crie a sacola kraft protagonista como componente/asset (SVG em ${WS}/projeto/src/tridi/Sacola.tsx com props para olhos/expressao, carimbada sim/nao, cor) e renderize um still de teste dela em 3 estados (lisa-cinza, olhando para cima, carimbada-roxo) via uma composicao de teste "SacolaTeste" em src/tridi (registre no Root.tsx sem quebrar o resto) e LEIA o still: precisa parecer papel kraft real recortado, premium, nada infantil. Ajuste ate ficar bom. Escreva ${WS}/projeto/src/tridi/ASSETS.md listando cada arquivo e uso. Reporte o que ficou bom e o que ficou limitado.`, { label: 'preparo', phase: 'Preparo', schema: OUT })

phase('Montagem')
let build = await A(`${BASE}

PREPARO FEITO: ${JSON.stringify(prep)} (leia ${WS}/projeto/src/tridi/ASSETS.md).
SUA TAREFA (MONTAGEM): implemente a composicao "SacolaLisa" completa (18-22 s) em ${WS}/projeto/src/tridi/ seguindo o roteiro e as decisoes acima, com ritmo sincronizado as batidas (beats.json) e a carimbada como clímax (~9 s). Qualidade de motion de nivel profissional: easing natural, squash/stretch leve, pausa comica no "LISA.", cascata de sacolas, transicao cinza->roxo em ~10 quadros a partir do TUM com tremida de 3 quadros, rotulos que entram na hora, cartoes de prova com borda branca, CTA claro. Audio: trilha abafada->cheia, SFX nos eventos, sem clipping. Depois: renderize stills em pelo menos 14 quadros-chave (0, 20, 45, 90, 140, 190, 230, 268, 276, 290, 330, 400, 480, 560, ultimo) em ${WS}/analise/tridi/stills/ e LEIA todos; gere contact sheet; corrija o que estiver feio/ilegivel/fora do 4:5/sobreposto. Renderize uma PREVIA em meia resolucao: npx remotion render src/index.ts SacolaLisa ${WS}/analise/tridi/previa_sacola.mp4 --scale=0.5 --gl=angle --browser-executable="${CHROME}" --concurrency=3, extraia quadros dela com ffmpeg e confira o movimento; meça loudness. Reporte com franqueza.`, { label: 'montagem', phase: 'Montagem', schema: OUT })

const REVIEW = { type: 'object', properties: { aprovado: { type: 'boolean' }, nota: { type: 'number' }, problemas: { type: 'array', items: { type: 'object', properties: { severidade: { type: 'string', enum: ['alto', 'medio', 'baixo'] }, tempo_s: { type: 'number' }, problema: { type: 'string' }, correcao: { type: 'string' } }, required: ['severidade', 'problema', 'correcao'] } } }, required: ['aprovado', 'nota', 'problemas'] }
const LENSES = [
  { k: 'performance', p: 'LENTE PERFORMANCE META: o gancho para o scroll em 0-3 s (movimento no quadro 0, texto legivel de imediato)? A historia e entendida SEM SOM e SEM VOZ? A virada (carimbada) e clara e satisfatoria? O CTA e claro? Retencao: algum trecho morno/longo? Parece conteudo nativo e nao anuncio de template? Daria vontade de tocar em Saiba Mais?' },
  { k: 'design', p: 'LENTE DESIGN/MOTION: estetica coerente (kraft+reticula -> risografia roxa), sacola com aparencia premium e nao infantil, hierarquia (1 foco por vez), tipografia, legibilidade no celular, tudo dentro do 4:5, nada sobreposto, ritmo nas batidas, qualidade das transicoes, cara de IA ou de template?' },
  { k: 'tecnica-regras', p: 'LENTE TECNICA E REGRAS: legenda queimada do ref1 visivel? telefone/nome de pessoa visivel? texto com erro de acento/ortografia? alguma promessa/numero/preco/garantia/urgencia (proibido)? selos "cena ilustrativa"/"marca ilustrativa"/"embalagens reais de clientes Tridi" presentes e legiveis? audio: clipping, loudness (~-14 LUFS), trilha abafada->cheia, silencios? duracao? tsc (npx tsc --noEmit) sem erro nos arquivos tridi? uso proibido de CSS animation/useFrame (grep)? composicao Criativo antiga continua registrada?' },
]

let hist = []
for (let round = 1; round <= 3; round++) {
  phase('Revisao')
  const vs = (await parallel(LENSES.map(l => () => A(`Voce e um revisor ADVERSARIAL de criativos de anuncio (rodada ${round}). Padrao: reprovar se houver problema real. Leia ${WS}/analise/tridi/BRIEFING.md (Conceito 1) e as decisoes: ${BASE.slice(0, 3000)}
Material: stills em ${WS}/analise/tridi/stills/ e a previa ${WS}/analise/tridi/previa_sacola.mp4 (extraia quadros com ffmpeg a 6 fps e LEIA varios; meça audio com ffmpeg ebur128). Pode renderizar quadros extras (cd ${WS}/projeto && npx remotion still src/index.ts SacolaLisa --frame=N --gl=angle --browser-executable="${CHROME}" ${WS}/analise/tridi/stills/rev_N.png). Relatorio do montador: ${JSON.stringify(build)}.
${l.p}
De nota 0-10 e liste problemas concretos (tempo, problema, correcao observavel). NAO edite arquivos.`, { label: 'revisor:' + l.k + ':' + round, phase: 'Revisao', schema: REVIEW })))).filter(Boolean)
  const probs = vs.flatMap(v => v.problemas).filter(p => p.severidade !== 'baixo')
  const notas = vs.map(v => v.nota)
  hist.push({ round, notas, n: probs.length })
  log('Rodada ' + round + ': notas ' + notas.join('/') + ', ' + probs.length + ' problemas alto/medio')
  if (!probs.length && notas.every(n => n >= 8.5)) break
  if (round === 3) break
  phase('Correcao')
  build = await A(`${BASE}

Voce e o montador da composicao SacolaLisa (arquivos em ${WS}/projeto/src/tridi/). Revisores adversariais (rodada ${round}) deram notas ${notas.join('/')} e apontaram: ${JSON.stringify(vs.map(v => v.problemas))}
Corrija TODOS os problemas alto e medio de verdade (e os baixos baratos). Preserve o que funciona. Reverifique: re-renderize os stills afetados e os quadros-chave em ${WS}/analise/tridi/stills/ e LEIA; renderize de novo a previa em meia resolucao em ${WS}/analise/tridi/previa_sacola.mp4 (mesmo comando) e confira; meça o audio. Reporte o que mudou e o que ainda nao ficou bom.`, { label: 'correcao:' + round, phase: 'Correcao', schema: OUT })
}

phase('Entrega')
const entrega = await A(`${BASE}

A composicao SacolaLisa esta aprovada pelo diretor. Historico de revisao: ${JSON.stringify(hist)}. Ultimo relatorio: ${JSON.stringify(build)}.
SUA TAREFA (ENTREGA): (1) Renderize o MP4 final em resolucao cheia: cd ${WS}/projeto && npx remotion render src/index.ts SacolaLisa ${WS}/entregas/tridi/tridi-sacola-lisa-V01.mp4 --codec=h264 --audio-codec=aac --gl=angle --browser-executable="${CHROME}" --concurrency=3 (crie a pasta). Confira: ffprobe (1080x1920, 30 fps, duracao), decodificacao completa sem erro (ffmpeg -f null), loudness (ebur128) e 8 quadros-chave extraidos e LIDOS. (2) Gere 3 capas 1080x1920 (PNG) em ${WS}/entregas/tridi/capas/ a partir dos melhores quadros (gancho, virada roxa, CTA), com o essencial dentro do 4:5, e uma previa 4:5 de cada. (3) Escreva ${WS}/entregas/tridi/texto-e-titulo.txt com 1 texto e 1 titulo do anuncio (use os do BRIEFING Conceito 1, removendo qualquer garantia/preco/numero) e o CTA do botao "Saiba mais". (4) Atualize ${WS}/analise/tridi/BRIEFING.md com uma secao final 'PRODUZIDO' (o que foi feito, versao, onde ficou, decisoes tomadas sem o usuario, pendencias). Reporte caminhos e verificacoes.`, { label: 'entrega', phase: 'Entrega', schema: OUT })

return { prep, build, hist, entrega }
