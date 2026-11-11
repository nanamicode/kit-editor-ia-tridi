# WORKBOOKS · MÓDULO 8 (Instalar e configurar) · FCA — Lúcio Artes
Fonte: workbook-m08-a1 ... a8 (texto do autor). Convenção do workbook: "Troque o que está entre [colchetes] pelo seu caso antes de colar." Cada prompt tem rótulo: DIGITE NO CLAUDE CODE (slash-command), COLE NO CLAUDE CODE (texto) ou COLE NO TERMINAL.
Todo workbook M08 termina com a seção "Continue a escala: os 4 pilares" (A Fábrica cuida do pilar CRIATIVO; PÚBLICO potencializa o ROAS; TRACKEAMENTO é a base; CAMPANHAS DE CONTROLE dão o processo para criar, mensurar e decidir antes de escalar. Aluno: 77% OFF, de R$297 por R$67 cada; recebe novas versões "refeitas em formato de curso" sem pagar de novo). Links: Campanhas de Controle seguro.lucioartes.com/O11E6C3B5 · Super Públicos seguro.lucioartes.com/OA65829EA · Missão Claude Tracking checkout.safe.lucioartes.com/42750161.
Links fixos de todas as aulas M08: claude.com/download · Sistema da Fábrica (fca-sistema.zip + manual) drive.google.com/drive/folders/1xE1OACdDqMbNN43BCKPqp9B6YFqRrhHL · Pacotes que o /fca-instalar baixa (à mão) drive.google.com/drive/folders/1Q6yUiQMR5BZBfFzf5_5KLdi4jFaquHfh · Guias em PDF (instalação, erros comuns, add-ons) drive.google.com/drive/folders/1KiRF1BB9v4fYJriCSfNV5IaZU9q_cWEw.

---
## AULA 8.1 · INSTALAR O CLAUDE CODE DO ZERO (3 capítulos, 3 prompts)
**Ideia central:** "Baixe o app oficial, entre com a assinatura, comece no Pro e aprenda a gerenciar a cota das janelas de 5 horas e do teto semanal antes de pensar em plano maior."

Conteúdo: a Fábrica roda dentro do Claude Code (skills, DNAs, agentes: pesquisa, copy, roteirista, editor, designer). Instalador instala tudo de uma vez; acervo de "mais de 30 GB" (efeitos, músicas, bureaus = vídeos/imagens). Quem não quiser o completo instala o módulo básico e complementa por comando. App: pesquisar "Claude download", só site oficial da Anthropic; Mac ou Windows (e celular); criar conta no app ou no site. Chrome + extensão do Claude (tarefas de navegador sem API). Plano grátis NÃO tem Claude Code (só chat limitado). Recomendado Pro (pagar avulso não aconselhado). Janela de 5 h começa no primeiro comando (ex.: começou meio-dia, consumiu tudo às 15h, espera até 17h). Janela semanal reinicia em dia/hora fixos. Max 5x = 5x mais comandos que o Pro; Max 20x = 20x; mesma janela de 5h. Lúcio tem 2 contas Max 20 (não existe 40x); já fez 60+ anúncios num dia. Tela Uso: sessão atual, semanal, dia/hora do reinício (exemplo: Max 20 reinicia terça 23h, 35% gasto). **Fable** tem janela própria, só aparece depois de usado. VS Code (IDE gratuita Microsoft) e terminal são alternativas; Lúcio aconselha o app.

PROMPT 1/3 · COLE NO CLAUDE CODE · Quando usar: Primeiro teste, com uma pasta aberta no Claude Code
```
Olá! O que tem nesta pasta [nome da pasta que abri]? Me explique em poucas
linhas.
```
PROMPT 2/3 · DIGITE NO CLAUDE CODE · Quando algo não funcionar: diagnóstico da instalação (o "doutor")
```
/doctor
```
PROMPT 3/3 · COLE NO CLAUDE CODE · Entender o que você paga antes de decidir mudar de plano
```
Explique em linguagem simples como funcionam as janelas de 5 horas e a
janela semanal do meu plano [Pro, Max 5x ou Max 20x]. Me dê 3 hábitos para
não gastar a cota à toa enquanto estou aprendendo e para fazer o plano
render.
```
**Sua vez:** baixar app, entrar, instalar extensão do Chrome, abrir tela de Uso. Perguntas: (1) qual plano (grátis, Pro, Max 5x, Max 20x); (2) quanto aparece de uso na sessão atual e no semanal; (3) dia/hora do reinício semanal; (4) extensão instalada e conectada?
**Checklist:** app baixado do site oficial; conta criada e login; Chrome + extensão; plano com Claude Code (Pro+); janela de 5h conta do primeiro comando; existe janela semanal e onde ver reinício; consumo em Configurações → Uso.
Glossário: Claude Code; Fábrica; janela 5h; janela semanal; token (unidade de uso da assinatura); Max 5x/20x; bureaus; IDE (VS Code).
Links extras: claude.com/chrome · code.claude.com/docs/en/setup · code.claude.com/docs/en/vs-code · code.claude.com/docs/en/skills.
(O workbook NÃO traz preços do plano; US$20/R$110 etc. só na transcrição.)

---
## AULA 8.2 · MODELO, PASTA E PRIMEIRO USO (4 capítulos, 4 prompts)
**Ideia central:** "Trabalhe no Opus com esforço médio, uma conversa por criativo, abra o Code numa pasta de projeto e comece com permissão controlada."

Regras: roteiros e críticas = **Opus 5.5 (ou maior)**, 99% dos casos; Pro = Opus 5.5 esforço médio; **Fable só se extremamente necessário**; tarefas simples = **Sonnet**. A Fábrica gerencia modelos: no modo plano define o modelo de cada tarefa. Uma conversa por criativo/campanha; tarefas em blocos menores. Contexto: ao chegar perto de 80% (há contador) abrir nova janela ou `/compact` (acima de 80% cada comando relê tudo e consome mais). Interface: Chat / Cowork (automações) / Code (o do curso). Projeto = pasta; criar pasta em Documentos e uma por projeto/produto/cliente (ex. clientes, produtos). Modos: **Automático** (decide, pergunta nas críticas), **Manual** (pergunta tudo), **Aceitar edições** (aceita edições, não faz coisas críticas), **Plano** (propõe plano, você aprova, depois sai do plano). **Bypass ("vida louca")**: desabilitado por padrão; ativar em Configurações > Claude Code > Sessões > permitir o modo bypass; Lúcio deixa em Automático ou Aceitar edições. Esforço médio basta. Remote Control: continuar pelo celular; computador ligado e trabalhando.

PROMPT 1/4 · COLE NO CLAUDE CODE · Primeiro teste, modo Manual, pasta aberta
```
O que tem nesta pasta?
```
PROMPT 2/4 · DIGITE · Conferir instalação: conta, modelo, status geral
```
/status
```
PROMPT 3/4 · DIGITE · Diagnosticar e sugerir correções
```
/doctor
```
PROMPT 4/4 · DIGITE · Enxugar conversa perto de 80% de contexto
```
/compact
```
**Sua vez:** criar pasta de projeto em Documentos, abrir na aba Code, modo Manual, rodar teste, /status e /doctor, olhar contador. Perguntas: pasta criada; modelo e esforço selecionados; resposta do Claude; % de contexto consumido no 1º comando; o que /status e /doctor mostraram.
**Checklist:** pasta em Documentos aberta na aba Code; Opus 5.5 esforço médio; modo de permissão conferido (Manual no 1º teste); teste respondido; contador de contexto localizado; regra "uma conversa por criativo; ~80% nova janela ou /compact"; /status; /doctor sem pendências.
Links extras: Git for Windows git-scm.com/download/win; docs setup/vs-code/skills; claude.com/chrome.

---
## AULA 8.3 · /FCA-INSTALAR: O CARDÁPIO E A ESCOLHA (4 capítulos, 3 prompts)
**Ideia central:** "Um comando, um cardápio e uma escolha: aprenda a ler o que o Claude mostra e instale a Completa."

Passos gerais: baixar zip (Drive), descompactar (Downloads ou pasta de projetos; é só instalador, pode apagar depois), abrir a pasta como projeto no app, digitar `/fca-instalar`, ler cardápio (tamanho, para que serve, o que já tem, espaço/tempo, aviso do Chrome, licença da voz, respostas), escolher Rápida/Completa, instalar etapa por etapa, conferir. Permissão: "uma vez" ou "para sempre"; não usar Modo Vida Louca.

### PASSO A PASSO por sistema (literal do workbook)
**Mac chip Apple (M1/M2/M3/M4)** — como saber: maçã > Sobre este Mac > linha "Chip".
1. Baixe o fca-sistema.zip no Google Drive (link na área de membros e no e-mail de boas-vindas). Vai para Downloads.
2. Dois cliques no zip; aparece a pasta fca-sistema, em Downloads.
3. Instale o app do Claude pelo site oficial (claude.ai/download), arraste para Aplicativos, abra e entre com a conta da assinatura.
4. No app: aba Code → Local → Select folder → Downloads → fca-sistema → Abrir. Se o Mac perguntar se o Claude pode acessar Downloads, clique em Permitir.
5. Digite /fca-instalar e Enter. Se perguntar "Permitir?" para o instalador da Fábrica, clique em "Sim, e não perguntar de novo".
6. Quando aparecer "Tudo pronto", abra a pasta **Fabrica-de-Criativos** no app (Select folder → Command + Shift + H → Fabrica-de-Criativos) e abra uma conversa nova.
O instalador: mostra cardápio, pergunta Rápida/Completa (e a voz, se Completa), instala uma etapa por vez com barra de progresso. **Rápida: 10 a 15 min; Completa: 40 a 60 min.** Se faltarem as ferramentas da Apple: janela da Apple, Instalar e Concordo, esperar, escrever "continuar". Para o ffmpeg abre o Terminal sozinho: clique e digite a senha do Mac uma vez (não aparece ao digitar). Instala Node.js, programa que transcreve áudio, Remotion e sistema da Fábrica "para todos os seus projetos".
Se travar: digite /fca-instalar de novo (pula o que já está pronto); erro: copie a mensagem e cole "Deu este erro, conserte para mim."; **a senha vai só no Terminal, nunca no chat.** Links: claude.ai/download, brew.sh (Homebrew instala o ffmpeg), nodejs.org, ffmpeg.org.

**Mac Intel** — Sobre este Mac, "Processador" = Intel. Passos 1 a 6 idênticos. Diferenças: ffmpeg vem do site indicado pelo ffmpeg.org e é instalado sem senha; se o site não responder, abre o Terminal para instalar via Homebrew (senha uma vez). Mac Intel é mais lento para transcrever e renderizar.

**Windows 10 ou 11** — como saber: Iniciar > Configurações > Sistema > Sobre; "Tipo de sistema" 64 bits, x64.
1. Baixar zip (Downloads). 2. Botão direito > Extrair tudo > Extrair; se ficar fca-sistema dentro de fca-sistema, use a de dentro. 3. Instalar app (claude.ai/download), abrir, login. 4. No app: aba Code → Local → Select folder → Downloads → fca-sistema → Selecionar pasta. 5. /fca-instalar + Enter; "Sim, e não perguntar de novo". 6. "Tudo pronto" → abrir pasta Fabrica-de-Criativos (Disco Local (C:) > Usuários > seu nome > Fabrica-de-Criativos), conversa nova.
Instalador usa **winget** para Node.js, Python, ffmpeg, Git e yt-dlp; pode aparecer janela azul (alterações): clique Sim (às vezes uma por programa). Instala programa de transcrição, Remotion e sistema da Fábrica.
Se travar: faltou algo depois de instalar → fechar o app do Claude, abrir e digitar /fca-instalar; "winget não encontrado" → Microsoft Store, "Instalador de Aplicativo", Instalar/Atualizar, /fca-instalar de novo; **processador ARM → avise o suporte antes de instalar**; erro → "Deu este erro, conserte para mim." Links: nodejs.org, python.org, git-scm.com/download/win, ffmpeg.org.

### Rápida x Completa (tabela do workbook)
| Item | Rápida | Completa |
|---|---|---|
| Espaço | ~5 GB | ~30 GB (bom ter 40 GB livres) |
| Tempo | 10 a 15 min | 40 a 60 min, conforme internet |
| Programas (Git, Python, Node, ffmpeg, Remotion, HyperFrames) | Sim | Sim |
| Sistema da Fábrica (skills, agentes, comandos) | Sim | Sim |
| Transcrição local (modelo small) e yt-dlp | Sim | Sim |
| Acervo | Kit inicial (~0,4 GB) | Completo (~11 GB: 1.700+ sons e trilhas, 770 b-rolls) |
| Voz | Sua voz gravada (legendada no computador) | VoiceStudio (no computador, uso não comercial) ou ElevenLabs (nuvem, pago) |
| Vídeo de teste | Sim | Sim |
| Depois | /fca-completar traz o resto | /fca-completar atualiza |
Com a Rápida já dá: roteiro e copy; criativo com sua voz gravada legendado no computador; editar talking head; motion sem narração; capas; estudar referência.

PROMPT 1/3 · DIGITE · Instalar a Fábrica (pasta aberta)
```
/fca-instalar
```
PROMPT 2/3 · COLE · Completar depois da Rápida
```
Quero complementar a minha instalação rápida. Mostre o que falta para a
instalação completa.
```
PROMPT 3/3 · COLE · Erro durante a instalação
```
Deu este erro, conserte para mim: [cole aqui a mensagem do erro]
```
**O que não fazer:** ERRADO "Modo Vida Louca: a IA faz qualquer coisa sem perguntar" / CERTO "Freio ligado: libere só os comandos da Fábrica".
**Sua vez:** (1) opção escolhida e por quê; (2) GB livres, cabe a Completa (40 GB)?; (3) o que o cardápio disse que já tinha; (4) permissão uma vez ou para sempre; vídeo de teste de 6 s abriu?
**Checklist:** zip baixado e descompactado; sei onde está; pasta aberta em projeto novo; /fca-instalar e cardápio lido; 40 GB conferidos; permissões sem Vida Louca; vídeo de teste de 6 s visto.
Glossário: Cardápio; Instalação Rápida; Completa; Acervo (áudios, efeitos, recursos visuais); Modo Vida Louca; Vídeo de teste.

---
## AULA 8.4 · A BARRA, O DOUTOR E O PRIMEIRO VÍDEO (3 capítulos, 4 prompts)
**Ideia central:** "Confira a instalação com o /fca-doutor e, se algo der erro, peça ao próprio Claude para resolver."

Conteúdo: a Rápida instalou motor básico (Node.js, FFmpeg, transcrição local), sistema/skills/agentes, kit inicial (sons, trilhas, b-rolls, catálogo de estilos). `/fca-doutor` confere, aponta, diz como resolver; todo comando da Fábrica mostra descrição ao digitar. Se falhar: escreva no Claude, pergunte o erro, peça para refazer. Fábrica fica: Windows = Usuários > seu nome > pasta Fábrica de Criativos; Mac = Finder > Início > Fábrica de Criativos. O baixado era só instalador. **40 GB livres antes de instalar; modo rápido 5 GB.**

### O que vem no pacote (tabela)
| Item | O que é | Para que a Fábrica usa | Obrigatório? | Custa? |
|---|---|---|---|---|
| Node.js | roda apps JavaScript | roda Remotion e HyperFrames, que montam o vídeo | Obrigatório | Grátis |
| Python | linguagem de scripts | scripts de áudio, imagem, legenda e conferência | Obrigatório | Grátis |
| ffmpeg | faca suíça de vídeo e áudio | corta, converte, junta, confere | Obrigatório | Grátis |
| faster-whisper (whisper.cpp opcional equivalente) | transcreve fala em texto no seu computador | legenda/transcrição sem mandar áudio para fora | Obrigatório (whisper.cpp opcional) | Grátis; pesos de licença não comercial |
| Remotion | editor de vídeo por código | monta vídeo final: pessoa, legenda, efeitos, cortes | Obrigatório | Grátis para uso pessoal ou empresa pequena (confira a licença) |
| Git | histórico de versões | atualiza pacote e skills | Obrigatório (instalador instala se faltar) | Incluído |
| Skills da Fábrica | receitas prontas | ensinam anúncio, roteiro, capa, vídeo do jeito da Fábrica | Vêm no pacote | Incluído |
| Agentes | especialistas virtuais (copy, funil, edição) | Claude chama o certo por etapa | Vêm no pacote | Incluído |
| Biblioteca de prompts e estilos | pedidos e estilos testados | ponto de partida | textos no pacote; catálogos e mídia vêm do Drive (acervo, 8.5) | Incluído |
| Kit inicial do acervo | ~0,4 GB sons, trilhas, b-rolls, catálogo de estilos e prompts | matéria-prima do 1º criativo e do vídeo de teste | Rápida e Completa | Incluído |
| Conhecimento (dossiês e DNA) | resumos de cursos de copy, roteiro, design | Claude consulta antes de escrever | Vem no pacote | Incluído |
| VoiceStudio (voz local) | cria voz no seu computador | narração grátis e privada, para estudo e teste (9.3) | Só na Completa (ou /fca-completar) | Grátis |
"O único custo obrigatório é a assinatura do Claude. Chaves pagas (como a voz do ElevenLabs) só entram se você quiser o modo avançado (aula 8.6). Google Chrome: o HyperFrames usa; o instalador só avisa."

PROMPT 1/4 · DIGITE
```
/fca-doutor
```
PROMPT 2/4 · COLE · Deu erro na instalação
```
Deu erro na instalação. Qual foi o erro? Explique em linguagem simples e
refaça a etapa que falhou.
```
PROMPT 3/4 · COLE · /fca-doutor apontou problema
```
O /fca-doutor apontou este problema: [cole aqui o que apareceu]. Resolva
para mim e depois rode o /fca-doutor de novo para conferir.
```
PROMPT 4/4 · COLE · Espaço em disco
```
Quanto espaço livre eu tenho no meu HD? Preciso de pelo menos [40 GB para a
Fábrica / 5 GB para o modo rápido]. Me diga se está ok.
```
**Não fazer:** ERRADO "Seguir sem o Tudo pronto, com disco quase cheio" / CERTO "Esperar o Tudo pronto; 5 GB (Rápida) ou 40 GB livres (Completa)"; pular a conferência.
**Sua vez:** alguma etapa deu erro?; o que o /fca-doutor mostrou; onde ficou a pasta; espaço livre antes de instalar.
**Checklist:** li etapas; rodei /fca-doutor; se erro, perguntei ao Claude; encontrei a pasta; sei que o baixado era só instalador; conferi espaço; abro a pasta Fábrica de Criativos no app para trabalhar.
Links extras: nodejs.org, python.org, ffmpeg.org.

---
## AULA 8.5 · /FCA-COMPLETAR E O ACERVO (3 prompts)
**Ideia central:** "O modo rápido te põe para rodar logo; o complemento e a biblioteca deixam sua Fábrica no nível top, e eu não aconselho ninguém a ficar só no rápido."

Complemento = funcionalidades extras (Voice Studio). `/fca-completar` analisa, mostra o que falta e espaço (exemplo: ~20 GB a mais, ideal 30 livres), pergunta: completar o acervo de 11 GB com Voice Studio, ou só atualizar. Voice Studio: modelo local, grátis, **uso não comercial**, gera/clona voz; alternativa ElevenLabs (paga, nuvem); Lúcio aconselha instalar o Voice Studio também. Biblioteca: kit inicial, sons e efeitos, trilhas, efeitos e estilos, biblioteca de prompts de vídeo, b-rolls (casa e família, fé...); **mais de 388 efeitos mapeados e mais de 100 modelos**. Separado para a instalação inicial não ficar lenta; 40 GB livres. Não vêm: chaves de API e extensão do Chrome (instalar se quiser que o Claude manuseie o Chrome; VS Code desnecessário).

### Acervo: baixar sozinho ou pelo Drive
"O /fca-biblioteca baixa o acervo sozinho: digite `/fca-biblioteca kit`, `/fca-biblioteca completo` ou uma categoria (`sons`, `b-roll`, `efeitos-e-estilos`, `biblioteca-prompts-video`, `referencias`). Plano B se o download automático falhar: baixe pelo navegador na pasta ENTREGAS do Drive do curso (botão direito, Fazer download), descompacte e arraste o conteúdo para a pasta indicada."
| Pasta no Drive | O que tem | Coloque em | Onde aparece |
|---|---|---|---|
| 03-SONS | efeitos sonoros, trilhas por clima, sons livres | acervo/sons/ | Aula 9.4 (arte) |
| 04-EFEITOS-E-ESTILOS | catálogo de estilos e de efeitos (abrem no navegador) | acervo/efeitos-e-estilos/ | Aula 7.1 e Módulo 11; Aula 7.2 |
| 05-BIBLIOTECA-PROMPTS-VIDEO | CATALOGO.html dos **513 prompts**, com link para o vídeo original no X | acervo/biblioteca-prompts-video/ | Aula 9.4 |
| 06-B-ROLL | vídeos de banco por categoria, com créditos | acervo/b-roll/ | Aula 7.2 |
| 07-REFERENCIAS | anúncios nossos de referência (em breve) | acervo/referencias/ | |
Dicas: baixar aos poucos, começar por 03-SONS e 06-B-ROLL; catálogos funcionam sem internet; textos dos 513 prompts já vêm no pacote (skill `/biblioteca-videos-ia` usa); **ao baixar versão nova da pasta 04 NÃO apague `acervo/efeitos-e-estilos/meus-estilos/`** (estilos modelados ficam aí). Catálogos (dois cliques): `acervo/efeitos-e-estilos/CATALOGO-ESTILOS-v2.html`, `acervo/efeitos-e-estilos/CATALOGO-DE-EFEITOS.html`, `acervo/biblioteca-prompts-video/CATALOGO.html`, `acervo/sons/02-trilhas/CATALOGO.html`; ou peça: "abra o catálogo de estilos".

PROMPT 1/3 · DIGITE
```
/fca-completar
```
PROMPT 2/3 · DIGITE
```
/fca-biblioteca
```
PROMPT 3/3 · COLE · Quando /fca-completar perguntar
```
Quero [completar com o Voice Studio / completar e usar a ElevenLabs na nuvem
/ só atualizar].
```
**Sua vez:** espaço que falta x livre; opção escolhida e por quê; 40 GB livres?; categorias do acervo mais usadas.
**Checklist:** sei complemento x biblioteca; 40 GB; rodei /fca-completar; escolhi Voice Studio/ElevenLabs/atualizar; baixei biblioteca; chaves de API e extensão ficam para depois.

---
## AULA 8.6 · CHAVES DE API E O ARQUIVO .ENV (/FCA-CONECTAR) (3 prompts)
**Ideia central:** "Chave é senha: ela mora só no .env, nunca no chat, e você conecta uma API por vez."

Conteúdo: chave de API = senha; quem tem gasta na sua conta; nunca em chat nem print (todas as empresas não recomendam). Lúcio tem dezenas de APIs (Facebook Ads, Google). Nenhuma chave é obrigatória. Onde pegar: ElevenLabs = perfil > chaves de API; OpenAI = imagens e mais; **fal = API de geração de vídeo**; grátis: Pexels (imagens/vídeos) e Freesound (sons). Se não souber: "abra o Freesound/Pexels" (com extensão do Chrome ligada, ele mostra onde fica a chave).
**Custos (workbook):** ElevenLabs **US$5 a 22/mês** (voz paga; Fábrica já tem Voz Estúdio). Imagem OpenAI **2 a 7 centavos de dólar cada**. Vídeo com IA na fal **20 a 50 CENTAVOS de dólar o clipe**, conforme o modelo (digest anterior dizia US$20 a 50: ERRADO).

### Arquivo .env
| | Mac | Windows |
|---|---|---|
| Onde fica | `~/Fabrica-de-Criativos/.env` | `%USERPROFILE%\Fabrica-de-Criativos\.env` (C:\Users\seu-nome\...) |
| Por que "some" | começa com ponto = oculto | igual |
| Mostrar | Finder: Command+Shift+. | Explorador > Exibir > Itens ocultos (Win 11: Exibir > Mostrar > Itens ocultos) |
| Editar (fácil) | /fca-conectar abre no TextEdit; cola a chave, salva, fecha, diz "pronto"; ou botão direito > Abrir com > TextEdit (texto simples) | /fca-conectar abre no Bloco de Notas; mesmo passo |
| Pelo VS Code | Arquivo > Abrir Pasta > Fabrica-de-Criativos; .env aparece; salve e feche a aba | igual |
| Formato | `NOME=valor`, sem aspas e sem espaços | igual |
Fluxo: `/fca-conectar <ferramenta>` → ele cria o campo e abre o .env → você cola a chave, salva, fecha → diz "pronto" → ele testa. **Uma API por vez.**

### Boas práticas (tabela Nunca / No lugar)
- Colar chave no chat → gravar com /fca-conectar; no chat só dizer "pronto".
- Pedir ao Claude para ler, mostrar ou conferir o .env → rodar /fca-doutor: ele diz só quais nomes estão preenchidos.
- Chave em print, vídeo, WhatsApp, grupo → se aparecer, trate como vazada e troque.
- Mandar a pasta com .env para alguém → tirar o .env antes de compartilhar.
- Subir a pasta para o GitHub → manter o .env fora de qualquer repositório.
- Usar Modo Vida Louca → manter o "Permitir?" ligado (um pedido mal escrito poderia mandar chaves para fora).
**Se vazou:** 1) entre no site do fornecedor e revogue (apague) a chave; 2) gere outra; 3) atualize com /fca-conectar; 4) olhe o painel de gasto.

PROMPT 1/3 · DIGITE
```
/fca-conectar [nome da ferramenta, ex.: elevenlabs]
```
PROMPT 2/3 · COLE · Não sei onde pegar a chave (extensão Chrome ligada)
```
Abra o [Pexels / Freesound / ferramenta] e me mostre onde eu pego a chave de
API.
```
PROMPT 3/3 · COLE · Testar conexão
```
Pronto. Conectei a [ferramenta]. Teste a conexão gerando [uma imagem de
teste / um item simples].
```
**Sua vez:** ferramenta conectada; chave só no .env?; teste funcionou?; o que faria primeiro se vazasse.
**Checklist:** chave = senha; nunca no chat/print; .env oculto na pasta da Fábrica; uma API por vez; colar, salvar, fechar, "pronto"; nunca pedir para ler o .env; se vazar, gerar nova, gravar e conferir gasto.
Links: elevenlabs.io · platform.openai.com/api-keys · fal.ai · pexels.com/api · freesound.org/apiv2/apply.
Glossário: API; chave de API; .env; /fca-conectar; Pexels e Freesound; fal; OpenAI.

---
## AULA 8.7 · CLAUDE NO CHROME E NO VS CODE (2 prompts)
**Ideia central:** "O Claude abre o navegador e faz por você o que não dá para fazer por API; o VS Code é opcional e o app do Claude continua sendo o caminho principal da Fábrica."

Conteúdo: extensão (mesma conta) para plataformas sem API (área de membros, capas de módulos, subir aulas). Instalar: Chrome primeiro; buscar "Claude extensão" (Chrome Web Store ou site Claude); adicionar; conectar à conta; com Claude Code no mesmo computador os dois se comunicam. Ler páginas de vendas (inclusive assistindo ao VSL; Chrome em segundo plano; aba com nome "Claude" e laranja; fechar aba encerra). Ajuda: página/oferta/promessa/público; perfil do Instagram (logado ou API); Biblioteca de Anúncios da Meta (logado). VS Code opcional: abrir pasta, plugin Claude, mesmos modos; ou terminal `claude`; só para quem já é dev. Rotina: abrir a pasta da Fábrica, Chrome em segundo plano.

PROMPT 1/2 · COLE · Extensão do Chrome, páginas públicas abertas
```
Entenda a oferta nessas duas páginas: [link ou aba da página 1] e [link ou
aba da página 2]. Me diga a promessa, o público e o que cada uma faz de
diferente.
```
PROMPT 2/2 · COLE · Biblioteca de Anúncios da Meta (logado no Chrome)
```
Pesquise na Biblioteca de Anúncios da Meta anúncios de [produto ou nicho].
Me diga quais ganchos e promessas aparecem mais.
```
**Não fazer:** ERRADO "Abrir só um arquivo; ler página de cliente" / CERTO "Abrir a pasta da Fábrica; só páginas públicas".
**Sua vez:** páginas lidas; promessa e público encontrados; viu aba laranja "Claude"?; VS Code ou só app?
**Checklist:** Chrome; extensão adicionada e conectada; teste em página pública; aba laranja; logado no Chrome para Instagram/Biblioteca; decidi sobre VS Code.
Links: claude.com/chrome; code.claude.com/docs/en/vs-code.

---
## AULA 8.8 · TERMINAL, CONECTORES E PLUGINS (4 prompts)
**Ideia central:** "Terminal é opcional; o que vale é ligar seus conectores (como o Meta Ads), guardar as regras no CLAUDE.md e deixar a IA trabalhar em equipe."

Conteúdo: terminal opcional (Windows: cmd; Mac: Terminal; depois digitar `claude`). Conectores em Configurações > Conectores (Gmail, Drive, Claude do Chrome; dezenas pré-construídos; personalizados). Meta Ads: adicionar conector personalizado, endereço do servidor MCP oficial da Meta, **não mexer nas opções avançadas, só Adicionar**, logar no Facebook, confirmar e aceitar os BMs; contas sem MCP habilitado não aparecem; permissão de **leitura** nas contas; criativos poderão ser subidos direto. Plugins quase iguais a conectores. CLAUDE.md = memória; /init cria, /memory edita. IA em equipe: chefe planeja, agente pesquisa/varre, outro roteiro/critica, chefe revisa.

PROMPT 1/4 · COLE NO TERMINAL (Mac, opcional)
```
curl -fsSL https://claude.ai/install.sh | bash
```
PROMPT 2/4 · COLE NO TERMINAL (Windows, opcional; é PowerShell; se o cmd não aceitar, abra o PowerShell)
```
irm https://claude.ai/install.ps1 | iex
```
PROMPT 3/4 · COLE NO CLAUDE CODE · ligar serviço como conector
```
Como conectar o MCP oficial do [serviço, ex.: Meta Ads] a você via conector?
Procure o endereço do servidor MCP oficial e me diga o passo a passo para
adicionar como conector personalizado.
```
PROMPT 4/4 · COLE NO CLAUDE CODE · regra global
```
Grave no CLAUDE.md, para valer em todas as sessões e todos os projetos:
[regra que você quer, ex.: sempre responda em português do Brasil].
```
**Não fazer:** ERRADO "Não reabrir o terminal; plugins todos de uma vez" / CERTO "Reabrir o terminal; um plugin por vez".
**Sua vez:** conectores ligados; Meta Ads ligado e contas habilitadas; regra para o CLAUDE.md; terminal usado?
**Checklist:** terminal opcional; onde ficam Conectores; Meta Ads conectado e logado no Facebook; contas habilitadas conferidas; /init cria e /memory edita; Fábrica = equipe de agentes.
Links: **mcp.facebook.com/ads** (endereço do conector Meta); code.claude.com/docs/en/setup; code.claude.com/docs/en/skills; git-scm.com/download/win.
Glossário: Terminal; Conector; MCP; Plugin; CLAUDE.md; Subagente.

---
## CORREÇÕES E ACRÉSCIMOS ao digest_4.md (M08)
1. **Custo fal**: vídeo IA = US$0,20 a 0,50 por clipe (centavos), NÃO US$20 a 50. Corrigir.
2. **Pasta da Fábrica**: nome real é `Fabrica-de-Criativos` (sem acento, com hifens): Mac `~/Fabrica-de-Criativos/.env`; Windows `%USERPROFILE%\Fabrica-de-Criativos\.env`.
3. **Comando de instalação por terminal** (era "não está no texto"): Mac `curl -fsSL https://claude.ai/install.sh | bash`; Windows (PowerShell) `irm https://claude.ai/install.ps1 | iex`.
4. **/fca-biblioteca** tem argumentos: `kit`, `completo`, ou categoria `sons`, `b-roll`, `efeitos-e-estilos`, `biblioteca-prompts-video`, `referencias`. Estrutura `acervo/...`; plano B por Drive (pasta ENTREGAS). Não apagar `acervo/efeitos-e-estilos/meus-estilos/`.
5. **Números do acervo**: completo ~11 GB (1.700+ sons e trilhas, 770 b-rolls); kit inicial ~0,4 GB; **513 prompts de vídeo** (CATALOGO.html); catálogo `CATALOGO-ESTILOS-v2.html`; "800 gigas/30 GB" da fala = ruído: Completa ~30 GB, bom ter 40 GB livres; Rápida ~5 GB.
6. **Tempos**: Rápida 10 a 15 min; Completa 40 a 60 min (digest dizia que era subestimado; o workbook confirma esses tempos).
7. **Passo a passo por SO** (Mac Apple, Mac Intel, Windows) com winget (Node, Python, ffmpeg, Git, yt-dlp), senha do Mac só no Terminal, ARM = avisar suporte, "winget não encontrado" = Instalador de Aplicativo. Rodar /fca-instalar de novo pula o que já está pronto.
8. **Ferramentas do pacote**: HyperFrames e Remotion montam o vídeo; faster-whisper (modelo small) transcreve; yt-dlp baixa vídeos; licença do Remotion: grátis pessoal/empresa pequena (conferir). Pesos de voz/whisper de uso não comercial.
9. **Esforço médio** e **Opus 5.5** confirmados; "Sony" = Sonnet. `/fca-doutor` (grafia oficial, "doutor", não "doctor"; `/doctor` e `/status` são nativos).
10. **Boas práticas de .env** (ampliadas): /fca-doutor lista só nomes preenchidos; nunca GitHub/WhatsApp/print; se vazou: revogar, gerar, atualizar, conferir gasto.
11. Preços de plano (US$20/17, R$110/550/1100) NÃO aparecem no workbook, só na fala.
12. Atalho Mac para pasta: Command+Shift+H; app: aba Code → Local → Select folder.
