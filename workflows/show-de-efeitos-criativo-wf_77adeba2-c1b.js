export const meta = {
  name: 'show-de-efeitos-criativo',
  description: 'Edita o criativo de carimbos com recorte, 3D, legendas, cortes dinamicos e audio; revisa com painel adversarial',
  phases: [
    { title: 'Base', detail: 'recorte+limpeza, audio, B-roll, selo 3D, legendas em paralelo' },
    { title: 'Apresentadora', detail: 'cena com oclusao real, 3D e CTA' },
    { title: 'Integracao', detail: 'montagem, audio, stills e previa' },
    { title: 'Revisao', detail: 'painel adversarial com 3 lentes' },
    { title: 'Correcao', detail: 'correcoes por dono de arquivo' },
  ],
}


// Resiliencia: repete ate 3x se o agente retornar null e nunca derruba o workflow
async function A(prompt, opts) {
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await agent(prompt, opts)
      if (r) return r
      log('agente ' + (opts && opts.label) + ' retornou vazio (tentativa ' + i + '/3)')
    } catch (e) {
      log('agente ' + (opts && opts.label) + ' falhou (tentativa ' + i + '/3): ' + String(e).slice(0, 120))
    }
  }
  return null
}

const WS = 'C:/Users/Vinicius Prado/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/scratch-workspaces/cbcefd08-3c72-4ec7-af15-90a5e393045f/1fb5fd07-2315-4f23-9191-6e0300909064/scratch-2026-11-09-db7476'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const HEAD = `Voce e um agente especialista (Remotion 4.0.542 + React + three/R3F + Python/ffmpeg) num projeto compartilhado com outros agentes trabalhando AO MESMO TEMPO. Raiz do trabalho (WS): ${WS}
OBRIGATORIO antes de qualquer coisa: leia ${WS}/SPEC.md (fatos medidos da midia, contratos de arquivos, identidade, DONO UNICO por arquivo) e ${WS}/CLAUDE.md (metodo e regras). Leia tambem as referencias das skills em ${WS}/.claude/skills/ que forem relevantes ao seu trabalho (ex.: remotion-markup/SKILL.md e os .md citados nele; remotion-create/video-layout.md). Edite SOMENTE os arquivos que o SPEC lista como seus. Meta de qualidade: um show de efeitos especiais de nivel profissional, mas com FUNCAO (cada elemento ajuda a entender a mensagem), sem "cara de IA" (nada de degrade generico, tudo mexendo ao mesmo tempo, sem hierarquia). Movimento SOMENTE por useCurrentFrame()/interpolate/spring; proibido CSS transition/animation e useFrame do R3F. Verifique seu trabalho de verdade: renderize stills com o comando do SPEC (--gl=angle e --browser-executable) em varios frames e LEIA as imagens com a ferramenta Read; corrija o que estiver feio, cortado, ilegivel ou torto antes de reportar. O Chrome embutido do Remotion nao funciona aqui. Nao invente dados comerciais. Responda ao final com o objeto estruturado pedido (curto e factual: o que entregou, arquivos, limitacoes reais).`

const REPORT = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    exports: { type: 'string', description: 'nomes/props dos componentes ou arquivos exportados que outros usarao' },
    limitations: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'files'],
}

const plateP = A(`${HEAD}

SEU PAPEL: PLATE (recorte e limpeza da apresentadora). Siga o contrato "Recorte da apresentadora" do SPEC.
Passos: (1) Detecte e REMOVA a legenda queimada (amarelo/branco com contorno preto, centro-baixo, ~y 790-960 do quadro 1080x1080) dos quadros de origem em ${WS}/analise/src/f%04d.png (107 quadros; 7.6s em diante; a legenda existe em parte deles, palavra por palavra). Use mascara por cor (amarelo ~#FFD400, branco, contorno preto) dilatada + inpainting (opencv-python-headless: pip install permitido) ou outra tecnica melhor (ex.: reconstrucao temporal usando quadros vizinhos sem texto onde a pessoa nao se mexeu — cuidado com a mao que cruza a regiao no "garanta o seu"). O resultado nao pode deixar fantasma de texto, nem borrar a camisa/mao de forma visivel. (2) Rode o matting RVM (${WS}/analise/matte.py, modelos/rvm_mobilenetv3_fp32.onnx) sobre os quadros LIMPOS; considere downsample_ratio e eventual refinamento do alfa (por ex. suavizar com guided filter/erosao leve) para bordas limpas e estaveis no tempo (sem tremulacao). (3) DESPILL: remova o halo/reflexo roxo da borda do cabelo (substitua cor de borda por cor do interior do cabelo/neutra nos pixels de alfa parcial) e verifique sobre fundos claro, escuro e laranja. (4) Salve ${WS}/projeto/public/matte/m0001.png..m0107.png (RGBA 1080x1080) e ${WS}/projeto/public/plate/p0001.jpg..p0107.jpg (quadros limpos, qualidade jpg alta) e ${WS}/projeto/src/data/matte.json. (5) Gere um contact sheet de checagem (varios quadros sobre fundo claro/escuro/laranja + um do plate) em ${WS}/analise/review/plate_check.jpg e LEIA-o. Se achar fantasma de legenda ou halo, corrija e repita.
Use python (sem -I) e PYTHONIOENCODING=utf-8. Reporte a qualidade final com franqueza.`, { label: 'PLATE', phase: 'Base', schema: REPORT })

const audioP = A(`${HEAD}

SEU PAPEL: AUDIO (sound design e mix). Voz original (arquivo ${WS}/originais/criativo.mp4, trilha de audio) fica INTACTA e dominante; voce produz uma "cama" sem voz: trilha + SFX, 48 kHz estereo, exatamente 12.074 s, em ${WS}/projeto/public/audio/bed.wav (e stems opcionais sfx.wav / music.wav na mesma pasta), mais ${WS}/projeto/src/data/cues.json com os instantes (segundos da composicao) de cada evento para os outros agentes sincronizarem: cortes secos do B-roll em 1.293, 2.836, 4.213, 5.589, 6.840 s; momentos de IMPACTO/pressao de relevo (observe os quadros do original em ${WS}/analise/ e extraia mais quadros com ffmpeg se precisar para localizar o instante de pressao de cada carimbo — por ex. inspecione o video em 12-24 fps); dissolve para a apresentadora ~7.75-8.0 s; fala comecando em 8.28 s; palavra "Saiba Mais" em 9.98-10.52 s; CTA/ding. Formato cues.json: [{"t":1.293,"tipo":"corte|impacto|riser|revelacao|cta|ding","nome":"..."}].
Sintetize tudo em Python (numpy + soundfile; scipy se disponivel; sem baixar samples de terceiros): trilha com pulso rapido e energia crescente (~108-124 BPM; escolha o BPM que alinhe melhor os cortes a batidas/subdivisoes), baixo, hats, pad, riser ate a revelacao; SFX: whoosh em cada corte, "thump + chk metalico" de relevo nos impactos, glitch curto, impacto grave na revelacao do selo, ding brilhante no CTA. Aplique sidechain/duck da trilha sob a fala (8.2-11.4 s) e mantenha a fala sempre acima. Verifique: (a) renderize uma mixagem de teste voz+cama com ffmpeg e meca loudness (loudnorm/ebur128) — alvo ~ -14 LUFS integrado, pico < -1 dBTP, sem clipping; (b) gere estatisticas por segundo e confirme sem estouro; (c) escreva tambem ${WS}/analise/audio/mix_teste.wav (voz+cama) para referencia. Documente em cues.json tambem o BPM como primeiro objeto {"tipo":"info","bpm":N}.`, { label: 'AUDIO', phase: 'Base', schema: REPORT })

const brollP = A(`${HEAD}

SEU PAPEL: BROLL (cena 0.00-~7.80 s). Arquivo: ${WS}/projeto/src/scenes/BRoll.tsx (+ ./broll/*). Fonte: <Video> de @remotion/media com staticFile("criativo.mp4"); use trimBefore/trimAfter/playbackRate no <Sequence> pai de cada clipe. Estude os 6 clipes (extraia quadros extras com ffmpeg a 12 fps para localizar o instante de PRESSAO do carimbo em cada clipe e a posicao do objeto/carimbo no quadro, para ancorar zoom/crop).
Entregue CORTES DINAMICOS de verdade: cada corte com uma transicao diferente e funcional (whip-pan com motion blur, flash branco/dourado de 2-3 quadros, glitch/RGB-split, wipe com forma de selo serrilhado, slide por mascara), punch-in/zoom que acompanha o gesto do carimbo, speed-ramp (slow-mo no impacto e retorno), micro-tremor de camera no impacto, "hold frame" com relevo destacado (realce de luz rasante sobre o relevo com mascara animada). O clipe e QUADRADO: componha o 1080x1920 alternando (a) clipe ampliado/cropado full-bleed quando o gesto cabe, e (b) clipe em moldura/cartao com bordas finas e sombra, com o restante da tela ocupado por elementos FUNCIONAIS: rotulo cinetico do clipe (copy do SPEC), contador 01/06 + barra de progresso por clipe, linha de apoio, grade/papel/textura sutil de fundo em tinta+dourado. Nada de elemento decorativo sem funcao. Texto: Anton/Bebas + Montserrat (google-fonts), tamanhos do SPEC, dentro das margens/zona segura.
Os eventos de impacto/cortes devem coincidir com cues em ${WS}/projeto/src/data/cues.json se o arquivo existir quando voce terminar (o agente AUDIO pode estar gerando; se existir, alinhe; se nao, use os instantes do SPEC e documente os instantes de impacto que voce escolheu no seu relatorio "exports" para o AUDIO/INTEGRATOR). A cena deve terminar limpa em ~6.6 s para entregar o palco ao selo 3D (transicao-estrela 6.8-8.3 s feita por outro agente): deixe o ultimo clipe (cartao branco) com espaco/clima para o selo 3D entrar sobre ele; declare WINDOW = {fromSec:0,toSec:7.8}. Dev: src/dev/BRoll.ts(x); verifique stills em pelo menos 16 frames (todos os cortes e impactos) e um contact sheet.`, { label: 'BROLL', phase: 'Base', schema: REPORT })

const sealP = A(`${HEAD}

SEU PAPEL: SEAL3D (selo dourado 3D + transicao-estrela). Arquivos: ${WS}/projeto/src/scenes/Seal3D.tsx e ./seal3d/*. Primeiro crie e finalize CEDO (outros agentes dependem) o componente reutilizavel ${WS}/projeto/src/scenes/seal3d/GoldSeal.tsx — um selo de relevo 3D com GEOMETRIA REAL (nao imagem girando): disco com borda serrilhada (ex.: Shape com 36-48 dentes extrudado com bevel, ou LatheGeometry+dentes), anel interno, um relevo central (ex.: ExtrudeGeometry de forma simples com monograma neutro como estrela ou S — NAO use marca de terceiros), material metalico dourado (MeshStandardMaterial/MeshPhysicalMaterial metalness alto, roughness baixa, envMap simples gerado proceduralmente ou luzes de area), sombras/iluminacao coerentes. Props: {position,rotation,scale, ...} e quaisquer parametros de animacao baseados em frame passados de fora (sem useFrame). Exporte tambem helpers de iluminacao leve para reuso. Depois faca Seal3D.tsx: a TRANSICAO-ESTRELA de ~6.4 a ~8.3 s (WINDOW sugerido {fromSec:6.4,toSec:8.3}): sobre o ultimo clipe do B-roll (cartao branco com relevo de logo) um selo dourado 3D entra em perspectiva (queda + giro + squash no impacto, flash dourado, shockwave de aneis geometricos leves), estampa a tela, depois a camera mergulha no selo e ele se ABRE/divide (setores do disco girando para fora) revelando a apresentadora por tras (a cena Presenter ja estara por baixo: voce deve produzir a camada de overlay com alfa — fundo transparente — e o buraco revelador pode ser feito com mascara/clip animado do overlay; combine via CSS mask/clipPath animado por frame). Impacto sincronizado com cues (ver ${WS}/projeto/src/data/cues.json se existir; senao impacto do selo em ~7.25 s e revelacao completa ate ~8.1 s; informe os instantes exatos em "exports" para AUDIO/INTEGRATOR). Sem GPU: mantenha poligonos moderados; ThreeCanvas com width/height obrigatorios; <Sequence layout="none"> dentro do canvas. Dev: src/dev/Seal3D.ts(x); stills a cada ~0.15 s da janela + contact sheet; confira que o 3D aparece no RENDER (nao so Studio), com volume, brilho metalico, sombra.`, { label: 'SEAL3D', phase: 'Base', schema: REPORT })

const capP = A(`${HEAD}

SEU PAPEL: CAPTIONS. Arquivo: ${WS}/projeto/src/components/Captions.tsx (pode criar helpers no mesmo diretorio com prefixo captions-). Componente de legendas dinamicas palavra a palavra para a fala (tempos em ${WS}/projeto/src/data/words.json; confira os tempos reais com o audio, extraia o audio e olhe o espectro/transcreva de novo se precisar: python faster_whisper small pt word_timestamps e CPU ja funcionam; ajuste fino de +-0.05 s). O texto aparece em MAIUSCULAS, 1-3 palavras por pagina com quebras naturais (ex.: FAZ DIFERENCA, NE? / CLIQUE EM / SAIBA MAIS / E GARANTA O SEU!), palavra falada em destaque (cor dourada/violeta + escala/pop com spring), palavras ja ditas em marfim, ainda nao ditas ocultas ou semi-transparentes; enfase extra em DIFERENCA, SAIBA MAIS e GARANTA (por ex. sublinhado desenhado, caixa de destaque, leve rotacao). Tipografia Anton/Bebas ou Montserrat 900 via @remotion/google-fonts, >=84 px (legendas), contorno/sombra para legibilidade sobre rosto/camisa/roxo, duas linhas no maximo, centralizada na zona segura (nao colar na borda inferior; sugerido y entre ~1180 e ~1500 de 1920 — avalie para nao cobrir rosto nem CTA; aceite props para posicao). Props: {style?, yCenter?, ...}. WINDOW = {fromSec:8.1,toSec:11.9}. Entrada/saida suaves por frame, sem flicker. Acentos corretos (DIFERENÇA, NÉ). Dev: src/dev/Captions.ts(x) com fundo roxo + imagem de teste ${WS}/analise/f10.jpg (ou f11) ampliada para ver legibilidade sobre o rosto/camisa; stills em todas as palavras. Entregue tambem uma funcao exportada getActiveWord(tSec) para os outros usarem na sincronia de enfases.`, { label: 'CAPTIONS', phase: 'Base', schema: REPORT })

const presenterP = Promise.all([plateP, capP, sealP]).then(([plate, caps, seal]) =>
  A(`${HEAD}

SEU PAPEL: PRESENTER (cena da apresentadora ~7.9-12.07 s). Arquivos: ${WS}/projeto/src/scenes/Presenter.tsx e ./presenter/*. Insumos prontos de outros agentes (leia os relatorios abaixo e os arquivos):
- PLATE entregou: ${JSON.stringify(plate)}
- CAPTIONS entregou: ${JSON.stringify(caps)}
- SEAL3D entregou: ${JSON.stringify(seal)}
Use os quadros em projeto/public/matte (RGBA) e public/plate (limpo) com <Img>/CanvasImage mapeados por frame: indice = clamp(round((tFile-7.6)*24000/1001)+1, 1, 107), tFile = tempo da composicao (mesma linha do tempo; frame 107 = ultimo; depois dele congele no ultimo quadro ate o fim 12.074 e trate o fim com respiro/zoom lento).
Construa o show com PROFUNDIDADE REAL em camadas (de tras p/ frente): (1) cenario grafico roxo/tinta com textura funcional (papel/linhas finas/grade sutil de selo) e luz que respira; (2) tipografia gigante ATRAS da silhueta — DIFERENCA (entra com a fala em 8.74 s), depois SAIBA MAIS — passando atras do ombro/cabelo com OCLUSAO REAL pelo alfa (a pessoa na camada de cima, o texto em baixo; nao pode reaparecer sobre o rosto); (3) selos dourados 3D (GoldSeal do SEAL3D, ThreeCanvas) flutuando ATRAS dela em paralaxe e alguns pequenos A FRENTE (segundo canvas ou overlay) que reagem as palavras (um selo estampa no Saiba Mais); (4) a pessoa recortada (alfa) com micro-paralaxe/zoom lento (scale 1.00->1.06) e rim light dourado sutil nas bordas (use o proprio alfa para gerar contorno luminoso); (5) moldura editorial assimetrica (canto grande arredondado + canto chanfrado) que se desenha e permite que cabeca/ombros ultrapassem a borda (mesmas camadas, sem duplicar rosto); (6) legendas via componente Captions (import de ../components/Captions) na zona livre sem cobrir o rosto; (7) CTA final SAIBA MAIS como botao/pilula com cursor/seta animado + GARANTA O SEU! a partir de ~10.0 s, legivel ate o fim (12.07), sem preco/prazo. A mao da apresentadora gesticula em ~10.2-11.3 s (convite): evite colidir elementos com a mao.
Esta cena comeca por baixo da transicao-estrela (Seal3D 6.4-8.3 s): WINDOW = {fromSec:7.6,toSec:12.074}; antes de 8.0 s ela pode estar encoberta pelo overlay do selo — projete a entrada (fade/scale de 7.8 a 8.2) para a revelacao funcionar. Dev: src/dev/Presenter.ts(x); stills a cada 0.25 s de 7.8 a 12.07 e contact sheet; confira bordas do alfa sobre o fundo roxo (halo), ordem das camadas, oclusao, legibilidade, ausencia total da legenda original.`, { label: 'PRESENTER', phase: 'Apresentadora', schema: REPORT })
)

const [plate, audio, broll, seal, caps] = await Promise.all([plateP, audioP, brollP, sealP, capP])
const presenter = await presenterP

phase('Integracao')
const INTEG = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    stills: { type: 'array', items: { type: 'string' }, description: 'caminhos absolutos dos PNGs renderizados da composicao Criativo' },
    contactSheets: { type: 'array', items: { type: 'string' } },
    preview: { type: 'string', description: 'MP4 de previa (meia resolucao) se gerado' },
    knownProblems: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'stills'],
}
const reports = { plate, audio, broll, seal, caps, presenter }

async function integrate(note) {
  return A(`${HEAD}

SEU PAPEL: INTEGRATOR. Arquivos seus: ${WS}/projeto/src/Root.tsx, src/Criativo.tsx, src/index.ts. Monte a composicao final Criativo (1080x1920, 30 fps, 363 frames) unindo as cenas dos outros agentes, cujos relatorios estao aqui: ${JSON.stringify(reports)}
${note}
Camadas: BRoll (0-7.8 s) -> Presenter (a partir de 7.6 s) -> Seal3D overlay (6.4-8.3 s, transicao-estrela) -> Captions (8.1-11.9; se a cena Presenter ja inclui Captions, nao duplique; confira) -> eventuais overlays globais. Audio: a faixa original do criativo (voz) via <Audio> de @remotion/media (staticFile criativo.mp4, volume 1) e a cama ${WS}/projeto/public/audio/bed.wav por cima (volume ajustavel, ducking ja embutido). Verifique que cada cena se limita a sua janela e que nao ha duplicacao do clipe original visivel (por ex. o <Video> original nao deve aparecer por tras do Presenter). Corrija incompatibilidades de interface entre cenas SEM reescrever o trabalho dos outros (se precisar de ajuste neles, descreva em knownProblems com o nome do dono).
Depois renderize stills da composicao Criativo (comando do SPEC, entry src/index.ts, composicao Criativo; --gl=angle; --browser-executable) em frames-chave: 0, 8, 20, 28, 36, 42, 50, 58, 70, 84, 100, 126, 130, 148, 168, 190, 200, 214, 226, 240, 250, 262, 274, 290, 300, 312, 330, 350, 362 (ajuste conforme necessario) em ${WS}/analise/review/Criativo_fNNN.png, gere contact sheets (grades de ~12 frames) em ${WS}/analise/review/sheet_*.jpg e uma previa em meia resolucao: npx remotion render src/index.ts Criativo ${WS}/analise/review/preview.mp4 --scale=0.5 --gl=angle --browser-executable="${CHROME}" --concurrency=4. LEIA os stills/sheets e corrija problemas obvios de integracao. Rode npx tsc --noEmit e relate. Registre em knownProblems tudo que ainda esta ruim.`, { label: 'INTEGRATOR', phase: 'Integracao', schema: INTEG })
}

let integ = await integrate('Esta e a PRIMEIRA integracao.')

const REVIEW = {
  type: 'object',
  properties: {
    approved: { type: 'boolean' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          owner: { type: 'string', enum: ['PLATE', 'AUDIO', 'BROLL', 'SEAL3D', 'CAPTIONS', 'PRESENTER', 'INTEGRATOR'] },
          severity: { type: 'string', enum: ['alto', 'medio', 'baixo'] },
          timeSec: { type: 'number' },
          problem: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['owner', 'severity', 'problem', 'fix'],
      },
    },
  },
  required: ['approved', 'issues'],
}
const LENSES = [
  { key: 'legibilidade', prompt: `LENTE LEGIBILIDADE/SINCRONIA: texto cortado ou fora da zona segura, contraste, tamanho minimo (>=84px titulos/legendas, >=44px apoio), legenda sincronizada com words.json (compare frames x tempos), texto cobrindo rosto/mao, legenda original queimada ainda visivel (reprovacao), tempo de leitura insuficiente, acentos errados, CTA legivel ate o fim.` },
  { key: 'design', prompt: `LENTE DESIGN/MOVIMENTO: hierarquia (um foco por vez), elementos decorativos sem funcao, cara de IA (degrade generico, tudo mexendo junto), consistencia de paleta/tipografia, qualidade dos cortes/transicoes (variedade, funcao, sincronia com o gesto), uso de espaco vertical, ritmo, e se o show de efeitos e realmente impressionante ou morno. Compare frames consecutivos e contact sheets; assista a previa se puder (extraia frames do preview.mp4 com ffmpeg).` },
  { key: 'tecnica', prompt: `LENTE TECNICA: halos/tremulacao/cabelo sumindo no alfa, oclusao do texto atras da silhueta correta (texto nao reaparece sobre rosto), 3D com volume real/sombra/brilho (nao imagem plana), clipes duplicados/overlay indevido, quadros pretos/vazios, descontinuidade de audio (verifique cues.json x cortes e bed.wav com ffmpeg: duracao 12.074 s, picos, loudness aproximado, voz acima da trilha), duracao total, erros de typecheck (npx tsc --noEmit), uso proibido de CSS animation/useFrame (grep), preview.mp4 sem artefatos.` },
]

async function review(round, integReport) {
  phase('Revisao')
  const verdicts = await parallel(LENSES.map(l => () => A(`Voce e um revisor ADVERSARIAL de edicao de video (rodada ${round}). Seu padrao e REPROVAR: so aprove se realmente nao achar problema. Leia ${WS}/SPEC.md. O trabalho esta em ${WS}/projeto (Remotion). Material para inspecao: stills e contact sheets em ${WS}/analise/review/ (Criativo_f*.png, sheet_*.jpg, preview.mp4) — LEIA as imagens com a ferramenta Read (varias!), e renderize frames adicionais se quiser (comando do SPEC; entry src/index.ts; composicao Criativo; --gl=angle; --browser-executable="${CHROME}"; salve em ${WS}/analise/review/rev_*.png). Relatorio do integrador: ${JSON.stringify(integReport)}. ${l.prompt}
Liste problemas CONCRETOS (com tempo em segundos, dono do arquivo responsavel e correcao observavel). Severidade alto = quebra a entrega (ilegivel, quebrado, feio, legenda queimada, 3D falso); medio = visivelmente abaixo do nivel profissional; baixo = polimento. NAO edite arquivos.`, { label: 'revisor:' + l.key, phase: 'Revisao', schema: REVIEW })))
  return verdicts.filter(Boolean)
}

let history = []
for (let round = 1; round <= 2; round++) {
  const verdicts = await review(round, integ)
  const issues = verdicts.flatMap(v => v.issues).filter(i => i.severity !== 'baixo')
  history.push({ round, count: issues.length, issues })
  log(`Rodada ${round}: ${issues.length} problemas alto/medio`)
  if (!issues.length) break
  phase('Correcao')
  const byOwner = {}
  for (const i of issues) (byOwner[i.owner] = byOwner[i.owner] || []).push(i)
  const owners = Object.keys(byOwner).filter(o => o !== 'INTEGRATOR')
  const fixers = await parallel(owners.map(o => () => A(`${HEAD}

SEU PAPEL: dono de ${o} (consulte o SPEC para seus arquivos). Revisores adversariais encontraram estes problemas no seu trabalho (rodada ${round}). Corrija TODOS os de severidade alto e medio de forma real (nao maquiagem), reverifique com stills lidos por voce, e reporte.
PROBLEMAS: ${JSON.stringify(byOwner[o], null, 1)}
Contexto das demais pecas: ${JSON.stringify(reports)}`, { label: 'fix:' + o, phase: 'Correcao', schema: REPORT })))
  integ = await integrate(`Esta e a REINTEGRACAO da rodada ${round}. Os donos acabaram de corrigir: ${JSON.stringify(fixers.filter(Boolean))}. Problemas que sao SEUS (INTEGRATOR) a corrigir: ${JSON.stringify(byOwner['INTEGRATOR'] || [])}. Regere todos os stills, sheets e a previa.`)
}

return { reports, integ, history }
