# CONTRATO DO KIT (leia antes de mexer em qualquer módulo)

Objetivo do kit: refazer qualquer um dos elementos técnicos do criativo de carimbos (V02) em outros vídeos **com poucos tokens**. O agente edita **dados** (`video.config.ts`) e roda **scripts**, sem reescrever componentes nem medir tudo de novo.

## Estrutura
```
kit-edicao-ia/
  README.md, INSTALAR.md, instalar.ps1, instalar.sh, CLAUDE.md (regras curtas)
  .claude/skills/editor-criativo/SKILL.md  roteador: fluxo + tabela módulo -> método
  .claude/skills/remotion-*                skills oficiais do Remotion (cópia)
  metodos/NN-nome.md       1 por elemento técnico. Curto (ideal <=120 linhas)
  scripts/                 Python/Node reutilizáveis (CLI com --help, caminhos por argumento)
  marcas/*.json            marcas (cores e fontes). roxo-dourado.json = padrão aprovado
  modelos/                 rvm_mobilenetv3_fp32.onnx (recorte)
  exemplos/criativo-carimbos/  config real do V02 + 6 quadros de referência pequenos
  template/                projeto Remotion pronto (npm i; npx remotion studio)
    src/kit/theme.ts       marca, tempo, easing, hash, zona segura (COMPARTILHADO)
    src/kit/<modulo>/      componentes parametrizados (um dono por pasta)
    src/video.config.ts    DADOS do vídeo (o único arquivo que muda por vídeo)
    src/Video.tsx          montador: lê o config e empilha os módulos
    src/dev/<Modulo>.ts(x) entry isolado por módulo, para teste (registerRoot + composição id = nome do módulo)
```

## Regras dos componentes (template/src/kit/*)
1. Tempo sempre em **segundos de composição**, recebido por props. Converter com `f(sec)` de theme.ts. Nada de tempos chumbados do vídeo dos carimbos dentro do componente. Eles vão para `exemplos/criativo-carimbos/video.config.ts` e para os defaults do dev.
2. Cores e fontes só por `useBrand()`. Proibido hex solto, exceto sombras e tons derivados documentados.
3. Movimento só por `useCurrentFrame()` + `interpolate`/`spring`. Nunca CSS transition/animation. Nunca `useFrame` do R3F. Nunca `Math.random`: usar `hash()`.
4. Cada componente é exportado com props tipadas e **defaults sensatos**. Cada módulo tem `index.ts` exportando a API pública e um bloco JSDoc curto no topo (o que faz, props, armadilhas).
5. Mídia via `staticFile()` com caminho recebido por prop. Vídeo e áudio com `@remotion/media`.
6. 1080x1920, 30 fps por padrão, mas ler `useVideoConfig()` em vez de supor.
7. Layout: texto principal >=84 px, apoio >=44 px, margens laterais >=80 px, zona segura `SAFE`.
8. Preservar a qualidade e o visual aprovados no V02. A generalização não pode piorar o resultado: compare seus stills com os de `analise/review/` do projeto original.

## Teste obrigatório de cada módulo
- Entry próprio: `template/src/dev/<Modulo>.ts` (registerRoot) + `<Modulo>.root.tsx` com a composição `<Modulo>` 1080x1920, 30 fps. Usar a mídia de exemplo em `template/public/exemplo/`: criativo.mp4, matte/, plate/, audio/.
- Still: `cd template && npx remotion still src/dev/<Modulo>.ts <Modulo> --frame=N --gl=angle --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" ../../analise/review/kit_<modulo>_fNNN.png`. LER a imagem.
- Typecheck: `cd template && npx tsc --noEmit`. Corrija só os seus arquivos.
- Não rodar `npm install` (template/node_modules é junction para o projeto original). Não renderizar MP4 inteiro.

## Métodos (metodos/NN-nome.md) — formato fixo, enxuto
```
# <Elemento>
**Quando usar / o que resolve** (2-3 linhas)
## Receita rápida (o caminho de menor custo: comandos e campos do config a preencher)
## Parâmetros (tabela: prop | default | efeito)
## Como funciona (o essencial do porquê: 5-10 linhas)
## Armadilhas já vividas (bullets curtos, com a correção)
## Checklist de verificação (quadros a conferir, o que reprova)
```
Escreva para um agente Claude que vai ler **só esse arquivo** e precisa acertar de primeira. Não repita regras gerais do CLAUDE.md. Linkar arquivos por caminho relativo ao kit.

## Scripts (scripts/)
- Python 3.10+, dependências listadas no topo e em `scripts/requirements.txt` (dono: quem criar o script adiciona a linha).
- Entrada e saída por argumentos (`argparse`), sem caminhos absolutos. Imprimir resumo curto (JSON compacto) para o agente não precisar abrir arquivos grandes.
- Windows: `PYTHONIOENCODING=utf-8`, ler e escrever UTF-8.
