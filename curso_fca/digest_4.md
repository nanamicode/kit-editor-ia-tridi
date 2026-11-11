# DIGEST 4 · FCA (Fábrica de Criativos Automáticos) · Módulos 8, 9 e 10

Fonte: aulas 8.1 a 8.8, 9.1 a 9.9, 10.1 a 10.4 (texto da página + transcrição, sem .vtt). Instrutor: Lúcio Artes. Escopo: anúncios em vídeo (Meta Ads) gerados pelo Claude Code com o sistema "Fábrica".
Aviso de fidelidade: as transcrições são legendas automáticas, com ruídos (ex.: ".mv" = ".env"; "Sony" = Sonnet; "Hadeem" = HeyGen provavelmente; "Eleva Labs" = ElevenLabs; "Opus 5.5/Oppo" = Opus). Onde o texto é ambíguo, está sinalizado. Os PROMPTS prontos das aulas estão só nos workbooks (anexos), que NÃO temos (ver seção 7).

---

## 0. O QUE É A FÁBRICA (visão geral, 8.1 e 8.8)

- A Fábrica é "um conjunto que roda dentro do Claude Code" e se conecta a várias aplicações para produzir criativos. Tem várias **skills, DNAs e agentes** que trabalham como uma equipe: pesquisa, copy, roteirista, editor, designer, montador. "Um agente planeja, outro pesquisa, outro faz o roteiro, outro revisa e outro edita, e você nem percebe." (8.8). Sub-agentes trabalham sozinhos; o usuário não precisa se preocupar.
- Um instalador instala tudo de uma vez. Inclui acervo de mais de 30 GB (aula 8.1) / "quase 40 GB" (9.4) de efeitos, músicas, b-rolls (vídeos/imagens de apoio), estilos e prompts.
- Ferramentas de montagem citadas: **Remotion** (montagem) e **Hyperframes** (cortes) (9.4). Outras citadas: Node.js, FFmpeg, Python, Git, transcrição local, VoiceStudio.
- Gestão de modelos embutida: a Fábrica, em modo planejamento, decide qual modelo é adequado a cada tarefa para economizar cota (8.2). Se estiver em modelo muito caro (Fable), ela sugere mudar para Opus.
- Lógica do curso: o usuário é o "gerente/diretor da fábrica". "A fábrica funciona quando tem um gerente, um diretor competente" (10.4). Não pegar só os prompts e sair lançando.
- Os 4 pilares da escala (9.8/9.9): a Fábrica cobre o pilar CRIATIVO ("o criativo atrai"). Outros três: **Público** (potencializa o ROAS), **Trackeamento** (base de tudo), **Campanhas de controle** (processo para criar, mensurar e decidir antes de escalar).

---

## 1. PIPELINE PRÁTICO DE GERAÇÃO DE CRIATIVOS (passo a passo, módulo 9)

Princípio (9.1/9.2/9.8): o módulo ensina etapa por etapa para o aluno entender e corrigir pontualmente; no fim, tudo vai num "prompt mestre" único. Lúcio nem usa o prompt: liga o microfone e fala o pedido. Prompts grandes não são problema ("Às vezes eu escrevo um livro para ele": basta usar **modo planejamento**). "Acabou o tempo de pequenas instruções" (janela de contexto grande); basta o comando bem estruturado.

Etapas (ordem do módulo): link e análise → ângulos e roteiros → narração → arte e amostra → texto e capas → tudo de uma vez.

### Etapa 1 · Colar o link, a IA lê a oferta (9.1)
- Abrir o app do Claude, **conversa nova**, na pasta do projeto. Colar o link da página de vendas. Também aceita: perfil, vídeo do YouTube, post de Instagram, documento, PDF, pasta com materiais (copiar o CAMINHO da pasta e colar; "faz um verdadeiro milagre"). Pode usar o microfone para ditar.
- Se não houver nada, digitar/explicar a oferta (produto físico, digital ou serviço). Pode pedir para pesquisar.
- Dar contexto: **público, dor, desejo, objeções**. "Se você só der a página, ele faz o máximo, mas se der tudo isso, é o contexto que alimenta a IA para entregar qualidade criativa."
- Se a página tem **VSL** (vídeo de vendas), a IA roda a skill "assistir vídeo de referência": baixa o vídeo, **transcreve localmente** no computador, gera **legenda com timestamp**, extrai **quadros a cada 2 segundos e nas mudanças de cena** (com folha de contato) para entender o que aparece na tela. Se não baixar, pode-se mandar o arquivo manualmente.
- Depoimentos na página: ela os entende e pode usá-los nos criativos, se você quiser.
- Quem tem curso: melhor transcrever as aulas ou apontar a pasta para a IA "assistir"; ela aprende o conteúdo e o anúncio fica mais fácil; basta dizer para quem é.
- Saída: análise com **público que compra, o que sente, a objeção (o que faz desistir), a promessa e a oferta que resolve**. O usuário **lê e corrige** o que estiver errado antes de ir para ângulos/roteiro.
- Na demo: oferta "Campanha de Controle" (workshop gravado, R$147 na página; VSL ~18 min).

### Etapa 2 · Ângulos, estilo e roteiro aprovado (9.2)
- Na MESMA conversa (com a análise feita). Abrir o **catálogo de estilos (do 1 ao 33 na data da aula)**. Escolher o estilo **pelo número** ou **descrevendo o visual** ("aquele estilo assim, assim"), ou **deixar a Fábrica sugerir** (funciona bem se o contexto foi bem passado).
- **Ângulos: nunca peça só um.** Pedir no mínimo 3 ângulos/ganchos diferentes do mesmo criativo ("às vezes os três primeiros segundos fazem a diferença"). Também pode pedir 3 ganchos × estilos diferentes.
- Roteiro vem em texto (o Claude abre ao lado). Pode pedir em HTML, mas "gasta token à toa".
- **Regra: não aprove sem ler. Leia o roteiro em voz alta antes de aprovar.** Depois da aprovação o Claude pede para aprovar com o "prompt final".
- Estilo "Hardcopy" (como o pessoal chama): na verdade adaptação do estilo asiático de roteirização de doramas, o **kishotenketsu**; Hardcopy foi a empresa que popularizou no Brasil. Lúcio usa muito (estilos 1 ou 3).
- Estilos 1 a 33: alguns são gravados de tela; outros são estilos de terceiros usados como base ("os de sucesso mesmo"). V1, V... (ambíguo na transcrição).

### Etapa 3 · Narração (9.3)
- A narração é a voz do anúncio; depois junta-se a b-roll, efeitos e imagens no **formato de stories (9:16)**. O material sai primeiro como **amostra de 5 a 15 segundos**; só após aprovação vira vídeo inteiro.
- **Básica (grátis):** sua voz gravada ou a do Mac, via **VoiceStudio** (já vem no instalador, não pede chave). **Avançada (paga):** **ElevenLabs**, por chave de API.
- Clonar voz no VoiceStudio: abrir o Claude e perguntar "O VoiceStudio está funcionando? Como eu consigo clonar minha voz?". Ele pede um **áudio** (anexar/arrastar; áudio gravado no chat vira texto e não serve). Gravar **10 a 20 segundos** lendo um texto (celular ou computador), pedir o clone e dar um nome. Áudio bom = clone bom (o do teste foi ruim e ficou pior).
- Comando **`/fca-voz-local`**: baixa o modelo de IA de voz mais atualizado (não vem junto no instalador porque desatualiza rápido).
- ElevenLabs passo a passo: criar conta em elevenlabs.io; trocar para a parte "Eleven API" (Lúcio: "Eleven Criativo" → "Eleven API"); **criar chave de API** (nome livre; expiração opcional, ele pôs 15 min só para gravar; dar acessos; restringir IP só se tiver IP fixo, senão não); **copiar na hora, porque some**. Rodar **/fca-conectar ElevenLabs**, que abre o `.env`; colar a chave em API key; salvar e fechar. Campo **Voice ID**: cada voz (inclusive clone) tem um ID; opcional; na primeira vez a Fábrica deixa você ouvir vozes e ao dizer "gostei dessa" salva ID e nome automaticamente.
- Teste de verificação (prompt literal falado): "Verifique se a conexão com ElevenLabs funcionou. Eu vou usar a versão 4. Teste minha voz na versão 4. Diga 'Olá, meu nome é Lúcio Artes'. E passa isso com o VoiceStudio também ... Abra a pasta com a narração ... me diga quanto tempo cada um levou."
- Comparativo medido (30 s de áudio): **ElevenLabs ~6,5 s**, roda de qualquer computador, pago, acabamento melhor. **VoiceStudio 1 min 10 s**, usa muito processador e **6 GB de RAM** (com 4 GB usa swap/HD e fica mais lento); costuma levar 3 a 6x mais que ElevenLabs.
- **v3 vs v4 do ElevenLabs:** v3 é parecido com o VoiceStudio, qualidade um pouco melhor, consome menos créditos. v4 é muito aprimorada, gera entonação/cochicho sozinha a partir do texto, consome mais créditos. Regra do Lúcio: **produtos low ticket / sem a sua voz = v3 ou VoiceStudio; produtos de autoridade (sua voz conhecida) = v4** (pedir "versão 4"). Planos a partir de US$5/mês; Lúcio usa o de US$22 (uso mensal inteiro, VSLs), às vezes +US$10 avulso; há planos de 5, 22 e 99.

### Etapa 4 · Arte, amostra e vídeo inteiro (9.4)
- Enriquecer o acervo de graça com bancos por API (ver seção 2.5). Imagem por IA: OpenAI (GPT Image) ou Google (NanoBanana), via `/fca-conectar`.
- Pedir a arte do roteiro (prompt falado: "monte uma arte do roteiro com b-roll do acervo e efeito de catálogo..."). Se montar, a conexão funciona; se der erro, ele pede correção.
- **Amostra antes do vídeo inteiro: 5 a 15 s** ("monte uma amostra de 5 a 15 segundos..."). A Fábrica já faz por padrão, para economizar tokens e tempo: sem amostra, o erro só aparece no fim, após renderizar tudo. Só com amostra aprovada pedir "aprovei, vídeo inteiro".
- **Render** = transformar roteiro, narração, imagens e vídeos separados (timeline) em um **MP4**; é a etapa mais demorada e depende da máquina.
- **Um render por vez** (no máximo dois): rodar vários em paralelo trava o computador. Lúcio gerou 28 vídeos num dia, um a um. Ou pedir que limite o consumo de recursos (por sua conta e risco; o "custo" é tempo/travamento).

### Etapa 5 · Texto do anúncio e pasta de entrega (9.5)
- Padrão da Fábrica: **anúncio com CTA "Saiba mais"**. Outro CTA (ex.: "Comprar agora"): dizer na hora ("o CTA é tal coisa"). **Conteúdo orgânico**: avisar que é orgânico e dar o CTA (ex.: "curta, comente e compartilhe"). Também gera roteiros para engajamento/crescimento de perfil.
- Pedir **headlines, título e texto já "de acordo com o Meta Andromeda"** (a IA entende o roteiro todo). Recomendação: **um texto e um título por criativo**.
- Tudo fica dentro do projeto aberto: vídeo, capa e texto. Anúncios na pasta **`ads`**; orgânico (se pedido) na pasta **`org`** (a transcrição também diz "orgânica/orgânico"). Para achar: "Abra a pasta dos anúncios". Também dá para pedir para salvar em outra pasta.

### Etapa 6 · As 3 capas (9.6)
- Vídeo 9:16 e capa também 9:16, mas só a **área útil/zona segura (safe zone)**, o enquadramento que aparece no feed do Instagram, mostra o conteúdo inteiro. Tudo que não pode ser cortado deve ficar dentro dela, inclusive o conteúdo do vídeo, se for usar em vários posicionamentos.
- Ao gerar um criativo de vídeo orgânico, a Fábrica devolve **3 variações de capa** focadas no tema (frames do vídeo + montagem). Pode pedir o que quiser ("gere 3 capas").
- **Olhar a capa antes de subir** (capa muito comprida pode cortar algo importante).
- Evitar vários textos/títulos no mesmo criativo (o Meta permite vários): Lúcio sobe **um texto por anúncio**; se quer outro texto, cria **outro anúncio** com a mesma imagem.

### Etapa 7 · Revisar, corrigir e criar versões pelas métricas (9.7)
Referências (antes de ter vendas):
| Métrica | Definição | Referência |
|---|---|---|
| Gancho | quem passou dos 3 segundos | acima de **30%** (bom) |
| Retenção | quem viu os 15 s iniciais ÷ quem viu os 3 s | a partir de **10%** (muito bom) |
| CTR | quem clicou | a partir de **1%** |
- Os números "se equilibram": o slide cita **35% (gancho) e 8% (retenção)** como exemplo; 40% de gancho com 8% de retenção não é ruim, só pode melhorar.
- Processo: dar print das métricas personalizadas OU usar o **connector da Meta** e pedir que o Claude analise os criativos e aponte qual está fora dos padrões da fábrica; pedir sugestão; ele reescreve/cria novo melhorando ou o gancho ou os 15 s após o gancho.
- **Uma correção por vez**: gancho ruim = mexer só no gancho, resto igual. **Nunca mexer em gancho, voz e arte juntos.** Salvar como versão nova **V1, V2, V3**, comparar antes/depois. Combinar o melhor de duas versões (ex.: A com boa retenção + B com bom gancho = versão C).
- **Registrar para o Claude o que funcionou e o que não funcionou** (ele aprende e não repete).
- Não gaste verba para descobrir o óbvio: criativo com 10% de gancho e 5% de retenção "dificilmente vai vender" (regra, não exceção; se vende e dá lucro, está ok). Nunca criar criativo só por criar: primeiro diagnosticar por que não converte.

### Etapa 8 · Prompt mestre "tudo de uma vez" (9.8)
Ver seção 5 para a estrutura. Fluxo: copiar o prompt do workbook, preencher lacunas, **mudar para modo planejamento**, enviar. A Fábrica lê página e arquivos, baixa/transcreve VSL, apresenta o **plano/ficha** para você confirmar; depois de "confirmo" produz roteiro, narração, amostra, lote, textos e capas. Salva briefing em `.md` (markdown) e gera uma **entrega em HTML** com todas as entregas. Saída final: vídeos, texto, título, 3 capas com prévia.
- Na demo: pedido de **3 criativos de topo, 3 de meio e 3 de fundo de funil**. O Claude pediu permissões (Lúcio negou o primeiro comando para refazer o pedido com a quantidade), apresentou o plano (ângulos "anúncio 1, anúncio 2..."), Lúcio aprovou e escolheu modo automático para executar.
- Depois de rodar: "volte à 9.7" (analisar métricas e criar a próxima versão).

### Etapa 9 · Entrega (9.9)
- Pasta aberta ao final ("Abra a pasta com os criativos"). Por funil:
  - **Topo**: despertar quem ainda não sabe do problema.
  - **Meio**: para quem já sabe que tem um problema.
  - **Fundo**: remarketing, quebra de objeção, quem já conhece.
- A narrativa muda a cada etapa; a Fábrica usa o seu material (cortes do VSL, prints da página, gráficos) como matéria-prima.
- Demos: Workshop Campanhas de Controle (topo com narrativa de cassino/apostador, meio com a "queda do 3º dia" e gráfico do gerenciador, fundo quebrando objeção); e **Método Lead Certo** (pediu só 3 de meio e 2 de fundo; "escolha os melhores estilos para mim"). Estilos escolhidos pela Fábrica incluíram analogias (cachorro de Pavlov/campainha, telefonista dos anos 50, ficha falsa/moeda).
- **Mesma narração, outro estilo visual**: se não gostou do estilo, pedir para manter a narração e trocar o visual.
- Todos os criativos terminam com CTA "toque/clique em saiba mais".

---

## 2. INSTALAÇÃO E CONFIGURAÇÃO (módulo 8)

### 2.1 Claude Code e planos (8.1)
- Pré-requisito: Google Chrome instalado. Baixar o **app oficial do Claude** em claude.com/download (pesquisar "claude download" e cuidado com sites de terceiros). Criar conta no app. Instalar a **extensão do Claude no Chrome** (claude.com/chrome; Chrome Web Store), logada na mesma conta.
- **Plano grátis não tem Claude Code** (só chat limitado). **Pro recomendado para começar**: US$20/mês (US$17/mês se anual); Lúcio cita ~R$110. **Max 5x ≈ R$550; Max 20x ≈ R$1100** (5x e 20x mais uso na mesma janela). Não existe 40x: Lúcio tem **2 contas Max 20**. Pagar avulso (extra usage) não é aconselhado ao começar.
- Uso por **janelas de 5 horas** a partir do primeiro comando; esgotou, espera reiniciar. Existe também **janela semanal** total que reinicia em dia/hora fixos (a dele: terça 23h). Ver em Configurações > **Uso**. O modelo **Fable** é maior e mais caro e tem **janela própria**.
- Quando migrar de Pro para Max: se produz muito ou ganha dinheiro com isso (tempo é dinheiro). Lúcio já fez mais de 60 anúncios em um dia.
- A Fábrica é otimizada para economizar plano (agentes, gestão de modelos).
- Links: Setup code.claude.com/docs/en/setup; VS Code code.claude.com/docs/en/vs-code; Skills code.claude.com/docs/en/skills; Git for Windows git-scm.com/download/win; nodejs.org; python.org; ffmpeg.org.

### 2.2 Modelo, pasta e primeiro uso (8.2)
- **Modelos:** roteiros e críticas = **Opus** ("5.5 ou maior"), esforço **médio** (suficiente, "não precisa alterar"), resolve 99% dos casos. **Fable só se extremamente necessário.** Tarefas simples = **Sonnet**.
- **Economia:** uma conversa para cada criativo ou campanha. Ao chegar perto de **80% do contexto** (há contador), abrir nova janela ou usar **`/compact`** (mantém só o essencial). Tarefas em blocos menores.
- Abas do app: **Chat** (conversa), **Cowork** (automações) e **Code** (a que a Fábrica usa; pode aparecer como "Código" conforme o idioma).
- **Projeto = pasta no computador.** Criar pasta em Documentos e dentro uma por projeto/produto/cliente (ex.: `clientes/cliente ABCD`, `produtos/produto ABCD`). Abrir sempre a pasta daquele projeto (botão criar/navegar até a pasta).
- **Modos de permissão:** **Automático** (gerencia, pergunta só decisões críticas); **Manual** (pergunta tudo); **Aceitar edições** (aceita edições, não faz coisas críticas); **Planejamento/Plan** (pensa mais, propõe plano, você aprova, depois sai do plano para outro modo; "economiza porque pensa melhor"). Modo **ignorar permissões/bypass** = "**modo vida louca**": desabilitado por padrão; dá liberdade total (pode apagar arquivos etc.); Lúcio não recomenda. Para habilitar (só quem quiser): Configurações > Claude Code > sessões > permitir modo bypass.
- Painel lateral: tamanho de contexto, saídas, arquivos, **Remote Control** (acompanhar/continuar a conversa pelo app do celular; o computador precisa ficar ligado e trabalhando).
- Primeiro teste (modo Manual): perguntar "O que tem nessa pasta?" O primeiro comando consumiu ~7% de contexto no PC dele por ter muitas configurações de inicialização.
- **Conectores** em Configurações > Extensões e conectores (Gmail, Google Drive etc.).
- Conferir instalação: **`/status`** e **`/doctor`** (analisa e sugere correções). Digitar `/` lista comandos.

### 2.3 Instalar a Fábrica: /fca-instalar (8.3)
1. Baixar o **fca-sistema.zip** + manual (Google Drive, link abaixo da aula). Descompactar (sugestão: Downloads ou pasta de projetos, ex.: "fábrica, instalação"). **Anotar onde ficou.** É só o instalador; pode apagar depois.
2. Abrir o app do Claude > criar projeto > abrir essa pasta descompactada.
3. Digitar **`/fca-instalar`**. Ele mostra o **cardápio** (tamanho de cada item, para que serve, o que o PC já tem, espaço e tempo, aviso do Chrome, licença da voz) e pergunta **Rápida ou Completa**.
   - **Rápida**: programas e sistemas da Fábrica, transcrição local, kit inicial do acervo, vídeo de teste. Precisa de ~**5 GB** livres (8.4).
   - **Completa (recomendada)**: tudo da rápida + acervo completo + **voz local (VoiceStudio) ou ElevenLabs**. Precisa **40 GB livres**.
4. Instala etapa por etapa (ex.: Git e Python primeiro; Node.js e ferramentas individuais a Fábrica instala). Estimativa de tempo é muito superestimada (disse 15 min, levou <2 min; etapas "x de 8").
5. Ao fim gera **vídeo de teste de 6 segundos** ("fábrica instalada") e abre a pasta.
- Permissões: o app pergunta várias vezes; autorizar uma vez ou **"para sempre"** (para a instalação avançar). Não operar em modo vida louca durante a instalação.
- Quem fez rápida complementa depois (8.5).

### 2.4 Conferir: /fca-doutor (8.4) e onde fica
- O que a rápida instalou: motor básico (**Node.js, FFmpeg, transcrição local**), sistemas/skills/agentes/programas, kit inicial de sons, trilhas, b-rolls e **catálogo de estilos**.
- **`/fca-doutor`** (o Lúcio fala também "/fca-doctor"; no 10.4 "/fca-doutor"): confere a instalação, aponta o problema e diz como resolver. Se algo falhar, conversar com o próprio Claude ("deu erro, refaça"). "Você tem que aprender a resolver os problemas com o próprio Claude."
- Local: Windows `Usuários\<seu nome>\fábrica de criativos`; Mac Finder > início > `fábrica de criativos` (o nome da pasta aparece como "FabricaCriativos/fábrica de criativos" na fala). Para trabalhar: abrir o app, selecionar essa pasta.
- Antes de instalar: ter pelo menos 40 GB livres (5 GB para a rápida). Disco quase cheio atrapalha.

### 2.5 Completar e biblioteca (8.5)
- **`/fca-completar`**: analisa o que está instalado, mostra o que falta e o espaço necessário (exemplo: ~20 GB a mais, bom ter 30 livres), oferece **completar** ou **só atualizar**. O "complemento" = funcionalidades extras (ex.: **Voice Studio**: modelo de narração local, grátis, uso **não comercial**; alternativa **ElevenLabs** pago na nuvem). Aconselha instalar o Voice Studio mesmo que depois conecte ElevenLabs. Menciona acervo completo de 11 GB nessa opção.
- **`/fca-biblioteca`**: baixa o **acervo** (o que ele já produziu): kit inicial, sons e efeitos, trilhas sonoras, efeitos e estilos, biblioteca de prompts e vídeos, b-rolls ("800 gigas" na fala; provavelmente 800 GB de origem, instala até 30 a 40 GB), b-rolls de casa e família, fé etc. Números citados: **mais de 388 efeitos mapeados e mais de 100 modelos mapeados**. Separado do instalador para a instalação inicial não demorar. Recomenda 40 GB livres.
- Não vêm no instalador: chaves de API, extensão do Chrome (extensão é necessária para o Claude manusear o Chrome; VS Code é desnecessário).

### 2.6 Chaves de API e .env: /fca-conectar (8.6, 9.3, 9.4)
- **A chave de API é a senha da ferramenta**; quem a tem gasta na sua conta. **Nunca colar no chat nem mostrar em print/gravação.** Se vazou: ir na ferramenta e **gerar nova chave** (já aconteceu com ele: vazou e gastou).
- Mora **só no arquivo `.env`** (oculto), dentro da pasta da Fábrica de Criativos (Windows: usuário/fábrica de criativos/.env). O Claude lê a chave de lá.
- Comando: **`/fca-conectar <ferramenta>`** (ex.: `/fca-conectar ElevenLabs`, `/fca-conectar Pexels`, `/fca-conectar NanoBanana`, `/fca-conectar OpenAI`). Ele pergunta qual ferramenta, **cria o campo no `.env` e abre o arquivo**; você cola a chave, **salva, fecha** e diz **"pronto"** ao Claude, que testa. Se usa VS Code, abrir a pasta e editar lá. **Nunca peça ao Claude para ler/mostrar o `.env`.**
- Regra: **conectar uma API por vez**. Nenhuma chave é obrigatória; só para complementos.
- Se não souber onde pegar a chave: pedir ao Claude ("abra o Pexels, encontre a chave de API"); com a extensão do Chrome ele abre o site.
- Onde pegar / custo médio (8.6):
  - ElevenLabs: perfil > API keys (elevenlabs.io). US$5 a 22/mês para voz paga (já há Voice Studio local).
  - OpenAI: platform.openai.com/api-keys. Imagem: **US$0,02 a 0,07 cada**.
  - fal (fal.ai): geração de **vídeo com IA US$20 a 50 por clipe**, conforme modelo (o texto diz "Falo/Fal").
  - Bancos grátis: **Pexels** (www.pexels.com/api; conta grátis, "API de imagens e vídeos", botão para gerar chave; a maioria dos b-rolls dele vem de lá); **Pixabay** (pixabay.com/api/docs; Explore > API; a chave aparece na documentação, em Parameters, logado, não é gerada de imediato); **Freesound** (freesound.org; Developers > Get API Key; freesound.org/apiv2/apply; milhões de sons/efeitos). No `.env` já há campos "grátis, sons, pexels, pixabay, freesound".
- Teste: com OpenAI conectada, pedir uma imagem e ela gera.
- Imagem por IA: OpenAI ("GPT Imagem") ou Google Gemini **NanoBanana**.
- Com bancos conectados, o acervo fica "gigantesco e categorizado": ao pedir "anúncio alegre/atenção", a Fábrica busca áudio/vídeo/imagem do contexto.

### 2.7 Claude no Chrome e VS Code (8.7)
- Extensão do Chrome (mesma conta do Claude): quando a plataforma **não tem API**, o Claude abre o navegador e executa (ex.: Lúcio sobe aulas e capas na área de membros e processador de pagamento; faz login com login/senha na sessão do navegador). Comunica-se direto com o Claude Code do mesmo computador. Deixe o Chrome **em segundo plano** e trabalhe normalmente.
- Sinal de uso: aba com nome "Claude" e **borda laranja** enquanto lê; fechar a aba encerra a leitura.
- Usos na Fábrica: **ler páginas de vendas** (oferta, promessa, público; ex.: "entenda a oferta nessas duas páginas" com links; pode pausar antes de assistir ao VSL), perfil do Instagram (precisa estar logado no navegador), **Biblioteca de Anúncios do Meta** (logado; ex.: "pesquise anúncios de um produto XPTO"), achar chaves de API, baixar vídeo de Instagram.
- **VS Code é opcional**: só para quem já é desenvolvedor; plugin "Claude" na aba de extensões abre um chat com os mesmos modos; ou terminal com `claude`. Para quem usa a Fábrica: **use o app do Claude**.

### 2.8 Terminal, conectores, plugins, CLAUDE.md (8.8)
- **Terminal** (opcional): Windows = abrir `cmd`; Mac = Terminal. Instalar Claude Code por comando (**o comando literal é mostrado no vídeo/workbook, não no texto; ver setup docs**), depois digitar `claude`. Lúcio não vê vantagem para marketing.
- **Conectores** (Configurações > Conectores): Gmail, Google Drive, Claude do Chrome etc.; dezenas pré-construídos ou personalizados. **Meta Ads via MCP**: Configurações > Conectores > Adicionar conector personalizado > endereço **`mcp.facebook.com/ads`** (nome: Meta). Deixar OAuth em branco/registro automático, **adicionar**, logar no Facebook (precisa estar logado), aceitar BMs ("aceitar todos"). Lista as contas com MCP habilitado. Ele obteve **permissão de leitura** das contas de anúncio. Dica: pergunte ao Claude "como conectar o MCP do Meta Ads via conector" (cuidado: ele sugeriu o Pipeboard; Lúcio queria o oficial). Com isso o Claude pode ler métricas e, segundo ele, publicar anúncios direto (resposta em tom de "claro que consigo", sem demonstração).
- **Plugins**: hoje quase sem diferença dos conectores; ele não usa nenhum.
- **CLAUDE.md**: regras para todas as sessões/projetos vão aqui. **`/init`** cria, **`/memory`** edita; ou peça ao Claude "salve no CLAUDE.md".

---

## 3. MODELAR ESTILOS, APROVAR, GUARDAR, ATUALIZAÇÕES (módulo 10)

### 10.1 Modelar um estilo pelo link
- Regra de ouro: **"leva a forma, deixa a obra"**: pega cena, ritmo, tipografia, personagens, cortes, cores, transições, som; **não** pega fala, texto, marca nem oferta. Conteúdo você faz o seu.
- Passos: (1) colar o link (post de Instagram/YouTube/TikTok ou o **link do perfil**; pode pedir "os 3 com maior engajamento" em vez dos mais recentes; Instagram às vezes exige login: logar no Chrome + extensão). (2) Colocar em **modo planejamento**. (3) O Claude baixa o vídeo, **transcreve**, **fatia em frames (folha de contato)** e devolve a **receita do estilo** (cenas, enquadramentos, tempo de cada cena, tipografia, ritmo, transições, som, trilha, efeitos, silêncios). (4) Pedir **amostra de 10 a 15 s** reaproveitando copy e áudio de um criativo que já existe (só troca o visual; mais rápido). (5) Aprovar e **salvar como estilo seguinte no catálogo** (na demo, **34**, "cartoon grotesco", de charge; novo personagem criado, não o desenho original).
- Se o vídeo não baixar: **arrastar o arquivo** para o Claude, ou baixar manualmente, ou mandar ele usar o navegador (Lúcio: "ele disse que não conseguia baixar; mandei tentar pelo navegador e deu"). "Nem sempre aceite a primeira resposta da IA; mande tentar de novo."
- Antes, ele pediu para abrir a "página com os estilos atuais" (HTML do catálogo) e conferiu depois que o 34 apareceu lá.
- Bastidores do salvamento: transforma em JSON, salva quadros, **cria a skill do estilo**, grava o número no JSON, confere no script.

### 10.2 Aprovar e guardar
- Ao aprovar: **checklist do diretor com 12 itens**, comparação **lado a lado com a referência** (sem copiar a obra). Cria **ficha do estilo** (próxima vez ela já sabe tudo, inclusive a fonte) e **receita = skill + agente criado automaticamente**.
- Entra com o **próximo número** em "Meus estilos" (ou número escolhido). Funciona com site, TikTok, qualquer origem.
- Uso: pedir **pelo número**; **misturar estilos** (ex.: 12 + 30); ou deixar o Claude **escolher o melhor estilo para o roteiro**; sempre **amostras curtas**.
- **Quando NÃO modelar:** não combina com o público (ex.: advogado + meme/desenho animado); só funciona por causa da marca/rosto do outro; já existe parecido no catálogo; **sem aprovar antes**.
- Erro comum: copiar a obra do outro. Copie a forma, melhore, aprenda.

### 10.3 Atualizações e acesso vitalício
- Estilos novos e mudanças nas skills/agentes/jeito de produzir chegam para quem tem o **acesso vitalício** (link próprio, "última chance", oferecido antes como order bump). Liberação **automática** por script; atualiza **geralmente toda semana**; ele faz **2 backups diários** do Claude e da Fábrica; a pasta de skills, agentes e estilos sincroniza para quem tem vitalício. (Quem não tem: fica com o que instalou. O texto não descreve o comando de atualização.)

### 10.4 Recado final
- Garantia de **7 dias**. Plano: **dias 1 a 3**: instalar, aprender Claude Code, primeiro criativo (colar a página); **dias 4 a 7**: rodar o prompt mestre, subir no gerenciador, **dias 6 e 7** ler métricas e criar versões. Não pular etapas nem querer conectar tudo no dia 1: "vá básico rodando primeiro".
- Pedir ajuda ao próprio Claude e **ler com atenção**; `/fca-doutor` conserta o que quebrou; comentar na aula (ele lê quase diariamente). Pede "final" no direct do Instagram para repostar.
- Outros pilares (descontos de aluno: R$67 em vez de R$297 = 77% OFF, cada, com versões novas inclusas): **Missão Claude Tracking** (traqueamento ≠ rastreamento; inclui "funil de otimização de pixel", **FOP**), **Super Públicos** (segmentação do Meta funciona, depende do FOP), **Workshop Campanha de Controle** (1h30 a 2h, sendo refeito com IA; ensina números de controle, quanto tempo, quando escalar ou não).

---

## 4. REGRAS ACIONÁVEIS E CRITÉRIOS DE QUALIDADE (resumo operacional)

1. Sempre **conversa nova por criativo/campanha**; `/compact` ou nova janela a ~80% de contexto.
2. Modo **Plano** para tarefas grandes; revisar o plano e só então aprovar. Evitar bypass.
3. Dar o máximo de contexto (link, VSL, pasta, público, dor, desejo, objeções, bônus, preço, prova). **Lacuna: deixar em branco ou "não sei"**; a Fábrica descobre pela página/arquivos ou **propõe com motivo**. **Nunca inventar bônus.**
4. **3 ângulos/ganchos no mínimo**; estilo por número, descrição ou "você escolhe".
5. **Ler o roteiro em voz alta antes de aprovar**; **ler a ficha bloco por bloco** (confirmar sem ler é erro).
6. **Amostra de 5 a 15 s** antes de qualquer render completo; **1 render por vez (máx. 2)**.
7. Vídeo 9:16; conteúdo importante na **safe zone**; capa 9:16 com área útil; **3 capas** para orgânico; conferir antes de subir.
8. CTA padrão "Saiba mais"; avisar se for orgânico ou outro CTA. **1 texto + 1 título por anúncio**; textos/headlines alinhados ao Meta Andromeda.
9. Métricas: gancho >30%, retenção ≥10% (15 s/3 s), CTR ≥1%; números se equilibram.
10. **Uma mudança por vez**, versões V1, V2, V3; registrar o que funcionou.
11. Funis: gerar topo, meio e fundo com narrativas diferentes.
12. Narração: v3/VoiceStudio para low ticket; v4 para autoridade; áudio de clone de boa qualidade, 10 a 20 s.
13. Chaves só no `.env`; uma API por vez; nunca no chat/print.
14. Modelagem de estilo: levar a forma, deixar a obra; amostra antes de guardar; não modelar sem aprovação.
15. Espaço: 5 GB (rápida), 40 GB (completa/biblioteca). RAM 6 GB para o VoiceStudio.

---

## 5. PROMPTS, COMANDOS, SLASH-COMMANDS, SKILLS E FERRAMENTAS CITADOS (literais)

### Slash-commands da Fábrica (prefixo `/fca-`, "FCA = fábrica de criativos automáticos")
- `/fca-instalar` (cardápio, rápida ou completa)
- `/fca-doutor` (também falado "/fca-doctor"): confere instalação, aponta e ajuda a corrigir
- `/fca-completar` (complementos: Voice Studio ou ElevenLabs; completar ou só atualizar)
- `/fca-biblioteca` (baixa o acervo)
- `/fca-conectar <ferramenta>` (ex.: ElevenLabs, Pexels, Pixabay, Freesound, OpenAI, NanoBanana; a fala também diz "conectar" e "FCA Connector")
- `/fca-voz-local` (baixa o modelo de voz local mais atualizado)
- Existem outros ("todos os comandos têm o descritivo" ao digitar `/fca`); não listados no texto.

### Slash-commands nativos do Claude Code citados
`/status`, `/doctor`, `/compact`, `/init` (cria CLAUDE.md), `/memory` (edita). Digitar `/` lista tudo.

### Skills/agentes citados
- skill **"assistir vídeo de referência"** (baixa, transcreve local, legenda com tempo, quadros a cada 2 s e mudanças de cena, folha de contato). Pipeline de aprendizado/workflow com agentes para modelar estilos; cada estilo vira skill + agente + ficha.
- Ferramentas: Remotion, Hyperframes, FFmpeg, Node.js, Python, Git, VoiceStudio, ElevenLabs (v3/v4), OpenAI (GPT Imagem), NanoBanana (Google Gemini), fal, Pexels, Pixabay, Freesound, Claude no Chrome, VS Code, MCP do Meta Ads (`mcp.facebook.com/ads`), Meta Andromeda, Biblioteca de Anúncios do Meta.

### Prompts literais (falados/exibidos nas aulas; os completos estão nos workbooks)
- "O VoiceStudio está funcionando? Como eu consigo clonar minha voz?" (9.3)
- Teste de voz (9.3): "Verifique se a conexão com ElevenLabs funcionou. Eu vou usar a versão 4. Teste minha voz na versão 4. Diga 'Olá, meu nome é Lúcio Artes'. E passa isso com o VoiceStudio também. [...] Abra a pasta com a narração. E depois com VoiceStudio. E me diga quanto tempo cada um levou."
- "O que tem nessa pasta?" (teste 8.2)
- "Proponha três ângulos de anúncio para essa oferta, estilo 1 / estilo Hardcopy" ou "se eu não escolhi, sugira 2" (9.2, resumido, não literal)
- Prompt de leitura (9.1, parafraseado a partir do que ele leu): "Leia a página de vendas ... se a página tiver vídeo, VSL, rode a skill assistir vídeo de referência: baixe o vídeo, transcreva no meu computador, gere a legenda com o tempo, tire os quadros da tela a cada dois segundos e as mudanças de cena, com a folha de contato ... [entenda o mecanismo, as provas] ..."
- "Monte uma arte do roteiro com b-roll do acervo e efeito de catálogo..." / "Antes do vídeo inteiro, monte uma amostra de 5 a 15 segundos..." (9.4)
- "Abra a pasta dos anúncios" (9.5); "Abra a pasta com os criativos" (9.8/9.9)
- "Entenda a oferta nessas duas páginas [links]" (8.7)
- "Como conectar o MCP do Meta Ads a você via conector?" (8.8)
- Modelagem (10.1): pedir "aprenda esse estilo, crie um novo personagem; quero um novo estilo no CATÁLOGO oficial (número 34); pegue os 3 com maior engajamento; não vou copiar o conteúdo"; depois "gere uma amostra de 10 a 15 segundos com a copy e o áudio do criativo que já existe".
- Estrutura do prompt mestre (9.8, ver abaixo) abre com: "**Quero produzir criativo para minha oferta, do começo ao fim, seguindo todas as etapas do módulo da fábrica de criativos. Abaixo estão todas as informações.**" (reconstruído da fala; a abertura exata está no workbook). Instruções de leitura do briefing: placeholder "**escrever aqui**" = sem resposta; escrever "**não sei**" = você escolhe; "**descubra pela página, pelos arquivos**". Regras: "**Nunca invente bônus**"; "**leia a hora, todo vídeo**" (= assista a todo vídeo/VSL encontrado, baixe, transcreva e entenda); "mude para o modo plano".

### Blocos do briefing do prompt mestre (9.8: "8 blocos" / "oito regras")
O texto da aula nomeia: **oferta, público e funil, o que produzir, estilo (pode anexar print/URL de referência), onde salvar**; fala em "8 blocos" e "oito regras" mas NÃO lista os 8 (ver seção 7). Campos vistos no preenchimento: link da página de vendas; link do arquivo de vendas (ex.: HD externo); nome do produto; "o que eu entrego em uma frase" (ex.: "a gravação de workshop de 1h30 a 2h, mão na massa na tela do gerenciador, que ensina a montar campanha de controle"); preço; bônus; público (ex.: "empresários de São Paulo, 25 a 54 anos, já investem em tráfego e não conseguem performar no Meta"; produto físico também serve, ex.: farmácia em promoção); quantidade por funil ("3 de topo, 3 de meio, 3 de fundo"); estilo ("escolha os melhores estilos"); onde salvar (pasta padrão ou Documentos). Regra de custo: ele tenta **prever gasto antes** (impreciso, só referência).
Saída: vídeos, texto, título, **3 capas com prévia**, briefing em `.md`, entrega em **HTML**.

---

## 6. ERROS COMUNS E AVISOS

- **Não aprovar roteiro/ficha sem ler.** Ler em voz alta.
- **Não usar modo bypass ("vida louca")**; pode apagar arquivos, enviar mensagens etc.
- **Chave de API no chat/print = vazamento**; gerar nova se acontecer.
- Peça de **ângulo único**: sempre mais de um.
- **Subir capa sem verificar** (cortada pela zona segura).
- **Renderizar tudo de uma vez / vários em paralelo** trava a máquina.
- **Pular a amostra**: erro só aparece no fim.
- **Mexer em gancho, voz e arte juntos**; criar criativo novo sem diagnosticar métrica.
- **Copiar a obra** do outro ao modelar; guardar estilo sem aprovar; modelar estilo incompatível com o público/nicho.
- Plano grátis não roda Claude Code; disco com menos de 5/40 GB; RAM <6 GB deixa VoiceStudio lento; instalação "completa" depende de espaço.
- Estimativas de tempo/custo da Fábrica são **imprecisas** (tempo superestimado; custo impreciso).
- IA "alucina" ou desiste (ex.: "não consigo baixar o vídeo"): mandar tentar de novo/por outro caminho (navegador). "Isso é o Claude, não a Fábrica."
- Instagram exige login: estar logado no Chrome com extensão.
- Tentar fazer tudo em um dia / pular etapas dá resultado pior. Não é "prompt pronto": é método com diretor.
- Nichos sensíveis (ex.: Lúcio citou "Mounjaro" como exemplo de promoção de farmácia): o curso não traz regras de compliance; aplicar as regras do projeto.

---

## 7. O QUE NÃO ESTÁ CLARO OU SÓ EXISTE NOS ANEXOS (não temos)

- **Todos os prompts prontos** de cada aula (workbooks Workbook-M08-A1..A8, M09-A1..A9, M10-A1..A4), incl. o **prompt mestre completo da 9.8** (texto não está nas páginas/transcrições, só trechos falados). Também slides (Slides-Mxx-Ax).
- Os **8 blocos do briefing** e as **8 regras** do prompt mestre: só 5 a 6 citados na fala. Os campos exatos, a ordem e o texto literal estão no workbook 9.8.
- **Comando literal de instalação do Claude Code por terminal** (Mac e Windows) citado em 8.8 (mostrado só em tela); consultar code.claude.com/docs/en/setup.
- **Catálogo de estilos** (1 a 34): lista, nomes e números (exceto: 1 e 3 usados por ele; 12 e 30 citados como exemplo; 34 = cartoon grotesco; Hardcopy/kishotenketsu) não descritos no texto. A "folha de estilos" é uma página HTML; "checklist do diretor (12 itens)" não listado.
- **Comando de atualização** da Fábrica para quem tem acesso vitalício (10.3 só diz que é por script e sincronização automática).
- Quais **outros comandos `/fca-*`** existem; como o `/fca-biblioteca` é invocado exatamente (nome dado: FCA biblioteca).
- Especificação técnica de **resolução/duração/fps/legendas** dos vídeos (só 9:16 e amostra 5 a 15 s); templates de copy/Andromeda (o que a Fábrica gera como título/texto não é detalhado); tamanho exato da safe zone (só descrita visualmente, "como na tela").
- Detalhes do **plano/ficha** da 9.8 (formato, custo estimado) e da estrutura de pastas além de `ads` e `org`.
- Como **subir os anúncios** pelo conector Meta (só afirmado, não demonstrado; permissão exibida foi de leitura).
- Métricas "personalizadas" do gerenciador (colunas de gancho, retenção 15s/3s, CTR) foram ensinadas em módulo anterior (não neste digest).
- Valores/preços e planos mudam (US$ e R$ citados em 8.1/8.6/9.3 são do momento da gravação). Nome dos modelos ("Opus 5.5", "Fable", "Sonnet") conforme a gravação; usar o que estiver disponível.
- Links de compra e descontos (R$67, 77% OFF) estão no texto das páginas; não são relevantes para a produção.
