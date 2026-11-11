# Kit Edição IA

Tudo o que foi usado para criar o criativo de carimbos (V02), separado em **elementos técnicos reutilizáveis**. Cada elemento tem um componente pronto, scripts e um método escrito curto. Com o kit, o Claude edita outros vídeos **mexendo só em dados e rodando comandos**, sem redescobrir nada. Por isso gasta muito menos tokens.

## O que vem dentro
| Elemento | Método | O que é |
|---|---|---|
| Análise automática do vídeo | `metodos/01` | 1 comando mede cortes, cliques do produto, fala, palavras e legenda queimada |
| Legendas palavra a palavra | `metodos/02` | destaque na palavra falada, páginas automáticas, transcrição corrigida |
| Rótulos + HUD | `metodos/03` | título + linha de apoio por clipe, contador 01/06, barra de progresso |
| Cortes dinâmicos | `metodos/04` | speed-ramp, punch-in na pressão, tremor, modos tela cheia, cartão e faixa |
| Transições | `metodos/05` | whip, flash, íris, glitch, wipe |
| Recorte da pessoa | `metodos/06` | sem tela verde, IA em CPU (RVM), despill, alfa limpo |
| Remover legenda queimada | `metodos/07` | detecta e apaga a legenda que já vinha no vídeo |
| Palavra gigante com eco | `metodos/08` | palavra-chave enorme, ecos em contorno, sincronizada à fala |
| Selo 3D (transição) | `metodos/09` | selo metálico que cai, estampa, cobre a tela e racha revelando a cena |
| Moedas 3D flutuantes | `metodos/10` | objetos 3D atrás e à frente da pessoa, com paralaxe |
| CTA | `metodos/11` | botão "SAIBA MAIS" com cursor e clique, título final, faixa de topo, selo que estampa |
| Trilha + efeitos sonoros | `metodos/12` | música e SFX sintetizados (sem samples), ducking, -14 LUFS, checagem |
| Verificação e render | `metodos/13` | folha de conferência numa imagem, render, armadilhas do Windows |
| Cenário da apresentadora | `metodos/14` | cartão editorial, câmera com push e socos, exposição |
| Identidade visual | `metodos/15` | paleta e fontes num só lugar (`marcas/`, `theme.ts`) |
| Montagem | `metodos/16` | um arquivo de dados (`video.config.ts`) monta o vídeo inteiro |

## Instalar num computador novo
1. **Descompacte direto num caminho curto**, por exemplo `C:\edicao` (fica `C:\edicao\kit-edicao-ia`). No Windows, extrair dentro de Downloads, OneDrive ou outra pasta funda **falha**: algumas skills do Remotion têm caminhos muito longos, e o limite de 260 caracteres do Windows corta esses arquivos. O caminho longo também quebra o Chrome do Remotion. (Isso foi testado.)
2. Precisa ter instalado: **Node.js 20+**, **Python 3.10+**, **ffmpeg**, **Google Chrome** e o **Claude Code**.
3. Rode o instalador (ele confere tudo, instala os pacotes e testa):
   - Windows: `powershell -ExecutionPolicy Bypass -File .\instalar.ps1 -SkillsGlobais`
   - Mac/Linux: `bash instalar.sh --skills-globais`

   `-SkillsGlobais` copia as skills para `~/.claude/skills`, para elas valerem em qualquer pasta. Sem a opção, valem só dentro do kit.
4. Abra o Claude Code na pasta do kit e peça, por exemplo:
   > use a skill editor-criativo para editar originais/meu_video.mp4 com legenda palavra a palavra e trilha com SFX

O modelo do Whisper (transcrição) é baixado sozinho no primeiro uso, cerca de 500 MB para o `small`. O modelo de recorte já vem em `modelos/`.

## Como o kit economiza tokens
- **Medir em vez de olhar:** `analisar_video.py` devolve os números num JSON curto. O Claude não precisa abrir dezenas de quadros.
- **Dados em vez de código:** um vídeo novo é um `video.config.ts` novo. Os componentes não são reescritos.
- **Leitura sob demanda:** a skill aponta para um método por elemento (40-80 linhas). O Claude lê só o que vai usar.
- **Uma imagem de conferência:** `folha.py` junta 8-10 quadros numa imagem só.
- **Armadilhas já resolvidas:** cada método lista os erros que já aconteceram e a correção. Nada de tentativa e erro.

## Estrutura
```
CLAUDE.md                regras curtas do editor (lidas automaticamente)
.claude/skills/          editor-criativo (roteador) + skills oficiais do Remotion
metodos/                 1 método por elemento técnico
scripts/                 análise, transcrição, recorte, remoção de legenda, trilha/SFX, checagem, folha
template/                projeto Remotion: src/kit/<modulo> (componentes), src/video.config.ts (dados), src/dev (teste de cada módulo)
template/public/exemplo/ mídia do criativo de carimbos para testar
marcas/                  paletas (roxo-dourado = padrão aprovado)
modelos/                 modelo de recorte RVM
exemplos/                referência visual do V02
CONTRATO.md              regras para quem for criar módulos novos no kit
```

## Testar se está tudo funcionando
```bash
cd template
npx remotion studio                      # abre o exemplo V02 no navegador
python ../scripts/folha.py stills --projeto . --comp Video --frames 30,110,232,290,345 --out teste.jpg
```
Para testar um módulo sozinho, use as entradas `src/dev/<Modulo>.ts`, por exemplo `npx remotion studio src/dev/Selo3D.ts`.

## Licença e custos
- Remotion: grátis para times de até 3 pessoas. Empresas maiores precisam de licença (veja a skill `remotion-license`).
- Tudo roda localmente: sem API paga. A trilha e os efeitos são sintetizados (sem direitos autorais de terceiros).
- O modelo RVM (recorte) é GPL-3.0, de PeterL1n/RobustVideoMatting. A fonte Anton e a Montserrat vêm do Google Fonts (OFL).
- A mídia em `template/public/exemplo/` é o criativo do cliente: não redistribuir fora da empresa.
