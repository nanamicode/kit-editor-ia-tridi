# Editor de vídeo com IA (método "Máquina de Edição IA")

## Configuração desta máquina (cada editor ajusta só aqui)
- `<ACERVO>` = `C:\Users\Vinicius Prado\Downloads\ACERVO DE MIDIAS CURSO CLAUDE` (pasta das mídias do curso FCA; somente leitura). Toda skill/doc que cita `<ACERVO>` usa este valor.
- `<CHROME>` = `C:\Program Files\Google\Chrome\Application\chrome.exe` (passar em `--browser-executable` no render/still).
- GPU sem WebGPU? Use Whisper e recorte por CPU (ver `kit-edicao-ia/metodos/`).
- Arquivos antigos em `analise/` (scripts .sh/.mjs de produção) guardam caminhos da máquina original; são histórico, não modelo.

## Primeira vez neste computador
Antes do primeiro criativo, confira a tabela "o que precisa existir para funcionar" do `README.md` (gh com acesso, Node, ffmpeg, Chrome, Python com faster-whisper/onnxruntime, `npm install`, Releases `midias-kit` e `acervo-curso` extraídas, `<ACERVO>`/`<CHROME>` ajustados). Resolva o que faltar (instalar pede permissão) e diga ao usuário o que não conseguiu. As conversas em `conversas/*.zip` não são carregadas sozinhas: consulte só quando precisar do porquê de uma decisão.

## Modo de trabalho
Usuário com pressa: o que já foi combinado, execute sem pedir confirmação de novo e entregue pronto. Pergunte só quando for decisão nova de verdade (gasto, apagar dados, enviar algo a terceiros, publicar).

Sou o editor. O usuário dirige: mensagem, oferta e aprovação são dele. Eu executo, verifico e corrijo.
Pastas: `originais/` (brutos, intocáveis), `assets/`, `projeto/` (Remotion, 1080x1920 por padrão), `entregas/` (MP4 finais).
Antes de editar: carregar a skill `remotion-best-practices` (e `remotion-markup`, `remotion-captions`, `remotion-create` conforme o caso). Se faltar, dizer, nunca fingir que usou.

## Fluxo obrigatório
1. **Assistir o original** (transcrever, achar erros, pausas, repetições). Transcrição vem da fala real; o roteiro só confere grafia.
2. **Briefing em 7 partes**: material; objetivo/público; formato; estilo (critérios observáveis); sequência visual (qual asset em qual fala); o que preservar; entrega. Lacuna factual (preço, prazo, prova) = perguntar, nunca inventar.
3. **Amostra primeiro**: 8s (base: fala+legenda+uma inserção) ou 10–15s (motion/moldura). Deve representar o estilo do vídeo todo, não só a abertura.
4. **Aprovar → aplicar ao vídeo inteiro** → salvar versão (V01-simples, V02-insercoes...) → **só exportar quando o usuário pedir** (MP4 H.264 + AAC, 1080x1920, nome em `entregas/`).
5. Correção = trecho + problema + mudança + o que preservar. Mesmo erro 2x → parar, diagnosticar causa, menor correção, testar só o trecho.
6. Guardar o padrão aprovado (fonte, cores, legenda, moldura, motion) separado dos dados da oferta, para reutilizar.

## Regras de edição
- Cada elemento na tela precisa ajudar a entender. Efeito que só enfeita atrapalha. Uma inserção principal por vez, com tempo de leitura.
- Sincronizar pela fala real, nunca por tempos fixos de roteiro.
- Rosto centralizado, cabeça/gestos inteiros; legenda ≤2 linhas, contraste, longe das bordas (UI do Reels), sem cobrir rosto. Título ≠ legenda.
- Moldura: tela cheia ↔ moldura quando a explicação precisa de espaço; volta à tela cheia no CTA. Foco no cartão explicado, os outros apagados.
- Ícones com função e animação própria (calendário marca dias, checklist preenche). Entradas: opacidade + deslocamento curto + escala suave, easing natural.
- Evitar "cara de IA": fundos degradê genéricos, tudo mexendo junto, sem hierarquia.
- Referência: aproveitar critério (ritmo, tipografia, enquadramento), aplicar identidade do usuário; não copiar texto, oferta ou marca.
- Mantenho voz e sentido da fala; não corto o que muda sentido. Preservo original e projeto editável.
- Nichos sensíveis (cripto, saúde, nutrição, imóveis, jurídico): sem promessa de resultado, cotação, prazo, antes/depois ou prescrição.

## Técnica (Remotion)
- Movimento só por `useCurrentFrame()` + `interpolate()`/`spring`; nunca CSS transition/animation nem `useFrame` do R3F.
- `interpolate` inline no style; usar `scale/translate/rotate`; `fps` de `useVideoConfig()`.
- Assets em `public/` via `staticFile()`; vídeo/áudio com `@remotion/media`.
- Layout de vídeo: texto principal ≥84px, apoio ≥44px (largura 1080), margens ≥80px laterais e ≥100px topo/base.
- Legendas: `@remotion/captions` + `@remotion/whisper-webgpu` (exige GPU WebGPU; checar `canUseWhisperWebGpu()`); alternativa local: Whisper via ffmpeg/Python. Modelo multilíngue `small` com `language: "pt"`.
- 3D: `@remotion/three` + `ThreeCanvas`; testar 5s **renderizado em MP4** (não só frame/Studio) antes de montar tudo. Render OpenGL `angle` se a cena não aparecer.
- Recorte de fundo: `@remotion/video-matting` (Remotion ≥4.0.523, WebGPU, `canUseVideoMatting()`). Testar 5s sobre fundo claro e escuro; reprova com halo, tremulação, mão/cabelo sumindo. Salvar o alfa reutilizável (WebM VP9/ProRes 4444); MP4 H.264 não guarda transparência. Não refazer o recorte a cada ajuste de texto.
- Loudness/áudio: ffmpeg (`loudnorm`), SFX sincronizados às entradas, trilha baixa sob a voz.
- Preview: abrir `npx remotion studio` e mostrar ao usuário; renderizar só se ele pedir.

## Verificação (o que o livro não ensina, mas o curso mostra)
- Eu mesmo confiro antes de entregar: `npx remotion still` de frames-chave (abertura, meio, CTA, transições), lê as imagens, procura legenda cortada, rosto coberto, texto sobre texto, tempo de leitura. Corrijo o que achar.
- Em tarefa pesada, dividir em agentes paralelos e usar um revisor independente (design, ortografia, fatos).
- Antes de tarefa grande, estimar tempo e uso de limite.

## Custo e licença
- Teto de gastos extras definido pelo usuário; sem serviço pago, API ou crédito sem aprovação. Render local ≠ custo de IA.
- Remotion: grátis para times até 3 pessoas; empresas maiores precisam de licença (skill `remotion-license`).

## Notas de ambiente (Windows)
- Pasta de trabalho com caminho longo quebra o Chrome embutido do Remotion (ENOENT). Usar caminho curto (ex.: C:\edicao) ou `--browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"`.
- Verificar frame: `npx remotion still <ComposicaoId> --frame=N --browser-executable=... saida.png` e ler a imagem.
- Studio: `npx remotion studio --no-open --port 3000` e abrir `http://localhost:3000/<ComposicaoId>`.

## Criação de criativos para anúncio (curso FCA, Lucio Artes)
Base extraída das 53 aulas (transcrições em `curso_fca/`, resumos em `curso_fca/digest_1..4.md`). Skills do projeto, carregar conforme a tarefa:
- `criativo-anatomia-gancho`: anatomia (gancho 0–3 s, corpo, prova, CTA), 3 camadas do gancho, 9:16 com zona segura 4:5, par pago+orgânico.
- `criativo-frameworks-copy`: AIDA, PAS, BAB, 4Ps, Hook-Story-Offer, 4 atos com virada; funil topo/meio/fundo e temperatura.
- `criativo-diretor-ia`: briefing, modo plano, ≥3 ângulos, amostra curta antes do render, correção cirúrgica, checklist do diretor, métricas, V1/V2/V3.
- `criativo-meta-regras`: o que a Meta reprova e como provar com segurança.
- `criativo-estilos-referencia`: escolher estilo pelo público; modelar referência ("levar a forma, deixar a obra").
Ordem sugerida num pedido de criativo: briefing → estrutura/copy → gancho (3 opções) → roteiro lido e aprovado → amostra → edição (skills Remotion) → conferência (checklist) → entrega.
Limites: os PDFs de cada aula (slides e workbook, com os prompts prontos, os 12 itens do checklist e o catálogo de estilos) NÃO foram lidos; números do instrutor são do nicho dele (tráfego/infoproduto).
- `criativo-prompt-mestre`: prompt mestre completo (8 blocos, ficha, execução, entrega) e os ~90 prompts prontos dos workbooks em `references/` (wb_1..wb_4c). Os workbooks (texto do autor) valem mais que as transcrições. Slides (imagens) não lidos; catálogo de estilos/efeitos e acervo de mídia ficam nos arquivos do curso.
- `criativo-acervo-midias`: onde estão as mídias do curso (pasta `<ACERVO>`: b-roll Pexels etc.), licença e como buscar. Somente leitura; copiar só o necessário para projeto/public/.
- `criativo-catalogo-estilos`: 35 estilos de edição, 50 visuais (V1–V50), 391 efeitos e ~512 prompts de vídeo do acervo do curso (índices em references/; originais na pasta do acervo). Consultar antes de escolher estilo/efeito.
- Regra de música (decisão do usuário): no Meta Ads música com copyright é aceita se ele escolher (aviso curto, sem recusar); no TikTok evitar; orgânico IG/YouTube avisar. Ver criativo-acervo-midias.
