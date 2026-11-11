export const meta = {
  name: 'validados-8-estilos',
  description: 'Reedita 8 criativos validados, cada um num estilo do catalogo FCA, com revisao e render final serializado',
  phases: [
    { title: 'Montagem', detail: '8 agentes em paralelo, um por video (so stills)' },
    { title: 'Previa', detail: 'previas em meia resolucao, uma por vez' },
    { title: 'Revisao', detail: 'revisor independente por video' },
    { title: 'Correcao', detail: 'correcoes por video (so stills)' },
    { title: 'Render final', detail: 'MP4 1080x1920, um por vez' },
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

const VIDS = [
  { n: 1, estilo: 3, nome: 'Letreiro / tipografia gigante', marca: 'Carimbos Tridi', obs: 'Tridi carimbos; 720x1280; b-roll de maos carimbando sacolas/copos (algumas marcas estrangeiras: True Cost, Sigma, Made to Keep) + apresentadora no fundo roxo no fim.' },
  { n: 2, estilo: 32, nome: 'Quadrinho Pop Art', marca: 'Carimbos Tridi', obs: 'Tridi; 720x1280 29.97fps; b-roll proprio (luvas pretas, embalagens de clientes) + apresentadora no roxo no fim.' },
  { n: 3, estilo: 30, nome: 'Revista editorial', marca: 'Carimbos Tridi', obs: 'Tridi; 720x1280; b-roll de carimbada em marmitex/copo/sacola + apresentadora sentada a mesa com produtos.' },
  { n: 4, estilo: 8, nome: 'Retro gamer 16-bit', marca: 'Carimbos Tridi', obs: 'Tridi; QUADRADO 720x720 24fps; embalagens carimbadas (O Brabo Burguer, Avenida, Lary Sweet Cafe) + apresentadora no roxo.' },
  { n: 5, estilo: 5, nome: 'Dossie (mural de investigacao)', marca: 'Carimbos Tridi', obs: 'Tridi; QUADRADO 720x720; carimbo de madeira em sacola/copo (Coffee Time, Sippin) + apresentadora no roxo.' },
  { n: 6, estilo: 21, nome: 'Lancamento tech', marca: 'Totem Mind Geeks (outro cliente do usuario, NAO e Tridi)', obs: 'Totem de autoatendimento Mind Geeks; 1080x1920 29.97fps; apresentadoras, totem com tela/LED/impressora; legenda serifada italica queimada.' },
  { n: 7, estilo: 23, nome: 'Blueprint (planta de engenharia)', marca: 'Totem de mesa Pro (Mind Geeks; NAO e Tridi)', obs: 'Totem de mesa Pro; 1080x1920 30fps; specs faladas: tela 15,6 polegadas, impressora termica integrada, display de LED, compacto, balcao ou mesa; legenda italica queimada.' },
  { n: 8, estilo: 25, nome: 'Suico / grade tipografica', marca: 'Totem de autoatendimento (Mind Geeks; NAO e Tridi)', obs: 'Totem de autoatendimento; 1080x1920 23.976fps; SEM NARRACAO: so musica com letra cantada em ingles; mostra totens com tela de hamburguer, maquininha de cartao e apresentadora no fim.' },
]

const BASE = (v) => `Voce e editor de video senior (Remotion 4.0.542 + Python/ffmpeg) num projeto compartilhado com OUTROS 7 AGENTES trabalhando ao mesmo tempo em outros videos. Raiz WS: ${WS}. LEIA: ${WS}/CLAUDE.md; as skills em ${WS}/.claude/skills/ (criativo-catalogo-estilos/SKILL.md e references/estilos-edicao.md e estilos-visuais.md e efeitos-indice.md; criativo-anatomia-gancho; criativo-meta-regras; criativo-acervo-midias; remotion-best-practices e remotion-markup/*.md).
TAREFA GERAL DO USUARIO: "pegar varios videos validados e colocar um estilo diferente em cada um" do catalogo oficial (35 estilos). SEU VIDEO: v${v.n} = ${WS}/originais/validados/v${v.n}.mp4. Marca: ${v.marca}. Observacoes: ${v.obs}. Transcricao (Whisper, sem tempos) em ${WS}/analise/validados/transcricoes.json (chave "${v.n}"); contact sheet em ${WS}/analise/validados/sheet${v.n}.jpg.
SEU ESTILO: catalogo FCA nº ${v.estilo} · ${v.nome}. Leia a ficha desse estilo em estilos-edicao.md, abra 2-3 imagens de exemplo dele em C:/Users/Vinicius Prado/Downloads/ACERVO DE MIDIAS CURSO CLAUDE/efeitos-e-estilos/exemplos/img/v2/ (arquivos que comecam com o numero ${String(v.estilo).padStart(2, '0')}-) e escolha um visual V compativel em estilos-visuais.md. Aplique o estilo de verdade (layout, tipografia, cor, textura, ritmo e efeitos caracteristicos), adaptado a marca (Tridi: roxo #8B00FF/lilas #B48CFF/branco; Mind Geeks: use as cores que aparecem no video, roxo/preto).
REGRAS DE CONTEUDO (criativo VALIDADO): preserve o audio original (voz e musica) e o sentido; mesma oferta e CTA; NAO acrescente promessa, numero, preco, prazo ou garantia que nao esteja na fala; as frases ditas (inclusive "menos de 30 centavos" quando falado) sao do anunciante e podem aparecer como texto. Nao use marca de terceiros como se fosse do cliente. Video ${v.n === 8 ? '8 nao tem narracao: o texto na tela so pode DESCREVER o que aparece (totem, tela, pagamento por cartao, autoatendimento) e um CTA neutro como "Saiba mais"; nada de numeros ou promessas; mantenha a musica original (o usuario aceita musica com copyright no Meta).' : 'tem narracao: legendas novas no estilo, sincronizadas pela fala real (gere words com timestamps via faster_whisper small pt word_timestamps, python sem -I, PYTHONIOENCODING=utf-8).'}
A legenda ORIGINAL esta QUEIMADA nos quadros: esconda-a pelo layout (recorte/moldura que exclua a faixa da legenda, faixa grafica opaca do proprio estilo por cima, ou zoom) e verifique que nenhum resto aparece. Saida 9:16 1080x1920, 30 fps, duracao igual a do original; essencial dentro do 4:5 central (y 285-1635); titulos >=84 px, apoio >=44 px. Movimento so por useCurrentFrame/interpolate/spring (sem CSS animation, sem useFrame).
ISOLAMENTO (obrigatorio): crie seus arquivos SO em ${WS}/projeto/src/v/v${v.n}/ (inclua um entry proprio ${WS}/projeto/src/v/v${v.n}/index.ts com registerRoot e um Root com a composicao id "V${v.n}") e assets SO em ${WS}/projeto/public/v/v${v.n}/ (copie o video original para la; copie so o necessario do acervo). NAO edite src/Root.tsx nem arquivos de outros. Pode importar fontes do @remotion/google-fonts e componentes comuns (src/tridi/theme.ts) sem altera-los. Disco: ~11 GB livres compartilhados; nao gere arquivos grandes desnecessarios.
VERIFICACAO: stills com: cd ${WS}/projeto && npx remotion still src/v/v${v.n}/index.ts V${v.n} --frame=N --gl=angle --browser-executable="${CHROME}" ${WS}/analise/validados/v${v.n}/still_N.png e LEIA as imagens. NAO renderize video MP4 nesta etapa (outra etapa faz um render por vez).`

const OUT = { type: 'object', properties: { summary: { type: 'string' }, estilo_visual: { type: 'string' }, files: { type: 'array', items: { type: 'string' } }, limitations: { type: 'array', items: { type: 'string' } } }, required: ['summary'] }

phase('Montagem')
let builds = await parallel(VIDS.map(v => () => A(`${BASE(v)}

ETAPA: MONTAGEM. Assista ao video (extraia quadros a 4 fps e LEIA), transcreva com tempos por palavra (se houver fala), planeje cena a cena como o estilo ${v.estilo} conta essa mesma mensagem, implemente a composicao V${v.n} completa e verifique com pelo menos 10 stills espalhados (incluindo inicio, meio, CTA e final), LENDO todos e corrigindo o que estiver feio, cortado, ilegivel, sobreposto ou com resto da legenda queimada. Gere um contact sheet ${WS}/analise/validados/v${v.n}/sheet.jpg. Reporte com franqueza.`, { label: `montagem:v${v.n}-e${v.estilo}`, phase: 'Montagem', schema: OUT })))

async function previa(v, tag) {
  return A(`Renderize a previa do video v${v.n} (composicao V${v.n}) em meia resolucao: cd ${WS}/projeto && npx remotion render src/v/v${v.n}/index.ts V${v.n} ${WS}/analise/validados/v${v.n}/previa.mp4 --scale=0.5 --gl=angle --browser-executable="${CHROME}" --concurrency=3 . Antes, confira o espaco livre em disco (PowerShell Get-PSDrive C); se < 1,5 GB, NAO renderize e reporte. Se o render falhar, leia o erro, corrija o MINIMO necessario nos arquivos de ${WS}/projeto/src/v/v${v.n}/ (somente esses) e tente de novo. Depois confira com ffprobe (duracao), ffmpeg -f null (decodifica inteiro) e ebur128 (loudness). Responda curto com caminho, duracao, loudness e problemas.`, { label: `previa:v${v.n}:${tag}`, phase: 'Previa', schema: OUT })
}

phase('Previa')
let previas = []
for (const v of VIDS) previas.push(await previa(v, 'r1'))

const REV = { type: 'object', properties: { nota: { type: 'number' }, aprovado: { type: 'boolean' }, problemas: { type: 'array', items: { type: 'object', properties: { severidade: { type: 'string', enum: ['alto', 'medio', 'baixo'] }, tempo_s: { type: 'number' }, problema: { type: 'string' }, correcao: { type: 'string' } }, required: ['severidade', 'problema', 'correcao'] } } }, required: ['nota', 'aprovado', 'problemas'] }

phase('Revisao')
const revs = await parallel(VIDS.map((v, i) => () => A(`Voce e um revisor ADVERSARIAL de criativos de anuncio. Video v${v.n}, reeditado no estilo do catalogo FCA nº ${v.estilo} (${v.nome}). Contexto e regras: ${BASE(v).slice(0, 3500)}
Material: previa ${WS}/analise/validados/v${v.n}/previa.mp4 (extraia quadros a 4 fps com ffmpeg e LEIA varios; compare com o original ${WS}/originais/validados/v${v.n}.mp4), stills em ${WS}/analise/validados/v${v.n}/. Relatorio do montador: ${JSON.stringify(builds[i])}. Relatorio da previa: ${JSON.stringify(previas[i])}.
Avalie: (1) o estilo ${v.estilo} esta aplicado de verdade e reconhecivel (compare com as imagens de exemplo do catalogo)? (2) mensagem, oferta e CTA preservados; audio original intacto; legendas sincronizadas e corretas (acentos)? (3) resto da legenda QUEIMADA original visivel? (4) legibilidade no celular, tudo dentro do 4:5, nada sobreposto, gancho forte nos 3 s? (5) promessa/numero inventado ou marca de terceiro como se fosse do cliente? (6) qualidade de motion, cara de template/IA, quadros vazios ou pretos? De nota 0-10 e problemas concretos com tempo e correcao. NAO edite arquivos.`, { label: `revisor:v${v.n}`, phase: 'Revisao', schema: REV })))

phase('Correcao')
builds = await parallel(VIDS.map((v, i) => () => {
  const r = revs[i]
  if (r && r.problemas.filter(p => p.severidade !== 'baixo').length === 0 && r.nota >= 8.5) return Promise.resolve(builds[i])
  return A(`${BASE(v)}

ETAPA: CORRECAO. O revisor deu nota ${r ? r.nota : '?'} e apontou: ${JSON.stringify(r ? r.problemas : [])}. Corrija todos os problemas alto e medio (e os baixos baratos) na composicao V${v.n}, preservando o que funciona. Reverifique com stills nos tempos afetados e LEIA. NAO renderize MP4.`, { label: `correcao:v${v.n}`, phase: 'Correcao', schema: OUT })
}))

phase('Render final')
const finais = []
for (const v of VIDS) {
  finais.push(await A(`Render FINAL do video v${v.n} (estilo ${v.estilo} · ${v.nome}). Confira o disco (Get-PSDrive C; se < 1,5 GB, pare e reporte). Rode: cd ${WS}/projeto && npx remotion render src/v/v${v.n}/index.ts V${v.n} "${WS}/entregas/validados/v${v.n}-estilo${String(v.estilo).padStart(2, '0')}.mp4" --codec=h264 --audio-codec=aac --gl=angle --browser-executable="${CHROME}" --concurrency=3 (crie a pasta entregas/validados). Se falhar, corrija o minimo em ${WS}/projeto/src/v/v${v.n}/ e repita. Verifique: ffprobe (1080x1920, 30 fps, duracao igual ao original ${WS}/originais/validados/v${v.n}.mp4), decodificacao completa (ffmpeg -f null), loudness ebur128, e extraia e LEIA 6 quadros-chave do MP4. Depois apague ${WS}/analise/validados/v${v.n}/previa.mp4 para liberar disco. Reporte caminho, verificacoes e qualquer defeito restante.`, { label: `final:v${v.n}`, phase: 'Render final', schema: OUT }))
}

return { revs: revs.map((r, i) => ({ v: VIDS[i].n, estilo: VIDS[i].estilo, nota: r && r.nota })), finais }
