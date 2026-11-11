# Kit Editor IA Tridi

Kit para editores de vídeo da empresa produzirem criativos com o Claude Code + Remotion. O kit reúne o método dos cursos "Máquina de Edição IA" e "FCA (Fábrica de Criativos Automáticos)", as skills prontas, o projeto Remotion e exemplos reais.

## O que tem aqui
| Pasta | Conteúdo |
|---|---|
| `CLAUDE.md` | Regras do editor IA (fluxo, técnica, verificação). O Claude lê sozinho ao abrir a pasta. **Ajuste a seção "Configuração desta máquina".** |
| `.claude/skills/` | 21 skills: 13 de Remotion e 8 do curso FCA (gancho, copy, diretor, Meta, estilos, prompt mestre, acervo, catálogo) |
| `projeto/` | Projeto Remotion (1080x1920). Composições: `Criativo`, `SacolaLisa` e as de `src/v/` |
| `kit-edicao-ia/` | Métodos passo a passo (`metodos/00-fluxo.md` … `16-montagem.md`), template, marcas, scripts e instalador |
| `curso_fca/` | 53 aulas transcritas, resumos `digest_1..4.md` e workbooks (`wb_*.md`, `pdf_txt/`) |
| `analise/` | Material de produção: briefings, roteiros, transcrições, quadros de revisão. `analise/tridi/BRIEFING.md` = briefing completo da Tridi |
| `entregas/` | Vídeos finais (`criativo_final.mp4`, `tridi/tridi-sacola-lisa-V01.mp4`, capas, texto do anúncio) |
| `originais/` | Vídeos brutos e referências (não editar) |
| `modelos/` | Modelo de recorte de fundo RVM (CPU) |
| `workflows/` | Scripts de orquestração multiagente usados nas produções |
| `conversas/` | Conversas completas exportadas (zip): como tudo foi feito, decisão por decisão |

## Instalar (uma vez por computador)
1. **Claude Code** (app desktop ou CLI) com conta própria do editor.
2. **Node.js 20+**, **ffmpeg** no PATH, **Google Chrome** instalado.
3. **Python 3.10+** com `pip install faster-whisper onnxruntime` (legenda e recorte por CPU).
4. Na pasta `projeto/`: `npm install` (o `node_modules` não vai no repositório).
5. Abra `CLAUDE.md` e ajuste `<ACERVO>` (pasta das mídias do curso) e `<CHROME>` para o seu computador.
6. O acervo de mídias do curso (b-roll, sons, trilhas, catálogo de efeitos) **não está no kit** porque é grande. Copie a pasta "ACERVO DE MIDIAS CURSO CLAUDE" separadamente e aponte `<ACERVO>` para ela.

Atalho: `kit-edicao-ia/instalar.ps1` (Windows) ou `instalar.sh`.

## Como pedir um criativo
Abra esta pasta no Claude Code e converse normalmente. Ordem que funciona:
1. **Briefing:** produto, público, dor, prova real, oferta/CTA, estilo ou referência. Não sabe um dado? Diga "não sei"; o Claude não pode inventar preço, prazo nem depoimento.
2. **Peça 3 ganchos/ângulos** e escolha um.
3. **Leia o roteiro em voz alta** antes de aprovar.
4. **Amostra de 8–15 s** antes do vídeo inteiro.
5. **Correção cirúrgica:** segundo exato + o que está errado + o que manter. Nunca "refaz tudo melhor".
6. **Render final** só quando você pedir: MP4 1080x1920 em `entregas/`.

Prompt pronto para começar: skill `criativo-prompt-mestre` (`.claude/skills/criativo-prompt-mestre/references/prompt-mestre.txt`). Todo pedido termina com: *"Antes de executar, me mostre o plano em passos curtos e espere meu OK. No final, diga como eu confiro que ficou certo."*

## Regras da casa
- Música com copyright: aceita no Meta Ads se o editor escolher (avisar); evitar no TikTok; avisar no orgânico.
- Nada de promessa de resultado, antes/depois ou urgência falsa (skill `criativo-meta-regras`).
- Logos e nomes de clientes só com autorização.
- Chaves de API só no `.env`, nunca no chat. Nenhum serviço pago sem aprovação.
- Render pesa: um por vez. Veja o espaço em disco antes.

## Pendências conhecidas do criativo Tridi V01
Carimbo desenhado (o ideal é foto real do produto); falta autorização das marcas de clientes mostradas; "R$0,30" e a garantia não foram confirmados; não há depoimento real. Detalhes em `analise/tridi/BRIEFING.md`.
