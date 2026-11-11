---
name: criativo-acervo-midias
description: Onde estão e como usar as mídias do acervo do curso FCA (b-rolls do Pexels, sons, efeitos, trilhas) que o usuário baixou no computador, com regras de licença e de busca. Use ao precisar de b-roll, som, trilha ou efeito para um criativo ou edição, antes de gerar imagem/vídeo por IA ou baixar algo externo.
---

# Acervo de mídias do curso FCA

**Pasta raiz (somente leitura, nunca apagar nem sobrescrever):**
`<ACERVO>`
O usuário está baixando os pacotes aos poucos; **liste a pasta de novo a cada uso** (`find` / `ls`), não confie em contagens antigas. Para usar um clipe num projeto Remotion, **copie só o necessário** para `projeto/public/` (o disco é limitado); não copie o acervo inteiro.

## Pacotes conhecidos
### `fca-acervo-b-roll-1-negocios-e-telas/b-roll/` (b-roll Pexels)
- Subpasta `pexels/<categoria>/<arquivo>.mp4`. Índice completo em `b-roll/CREDITOS.csv` (colunas: arquivo, categoria, fonte, autor, url_pexels, termo_de_busca, licenca; 770 linhas = todo o acervo de b-roll do curso, mesmo o que ainda não foi baixado).
- Já baixado (primeiro pacote, ~116 clipes): contas-e-dinheiro, pessoas-reagindo, celular-e-mensagens, escritorio, imoveis, e-commerce-e-entregas, tecnologia-e-telas, dinheiro-e-vendas, comercio-e-loja, restaurante-e-comida, academia-e-fitness, estetica-e-beleza, cidade-e-movimento, saude-e-clinica.
- Previstos no CSV (outros pacotes): outros, velas-e-igreja, mesa-e-familia, idosos-em-casa, oracao, carro-de-noite, telefone-e-chamadas, hospital.
- Formato: maioria vertical 1080×1920, 25 fps, ~15 s. **Há exceções** (720×1280, 1080×2048, 1440×2560 e alguns 3840×2160 horizontais): confira com `ffprobe` e use `objectFit="cover"` ou recorte; clipes horizontais precisam de crop/zoom para 9:16.
- Busca: por nome de arquivo e pelo `termo_de_busca` do CSV (`grep -i`). Escolha o clipe pelo que ele **mostra**, extraindo um quadro (`ffmpeg -ss 2 -i clipe.mp4 -frames:v 1 q.jpg`) e olhando antes de usar.

## Licença (LICENCA.txt do pacote)
Pexels License: uso livre, inclusive comercial e em anúncios, sem atribuição obrigatória. **Não revender nem redistribuir o clipe solto ou como pacote de b-roll**; usar dentro dos vídeos do usuário. Rostos são de desconhecidos de banco de imagens. Não usar b-roll para sugerir depoimento, cliente real ou resultado que não existe (ex.: não apresentar uma pessoa de banco como cliente do usuário).

## Regras de uso
- Prefira b-roll que **corresponda à fala** (função), não decorativo.
- Em saúde, finanças, imóveis, religião: não use imagem para insinuar promessa ou condição de uma pessoa real.
- Antes de gerar imagem/vídeo por IA (custo), procure no acervo.
- Quando chegarem outros pacotes (sons, trilhas, efeitos, catálogo de estilos, biblioteca de prompts), registre aqui o caminho, o formato do índice e a licença.


## Atualização: demais pacotes recebidos
- `efeitos-e-estilos/`, `biblioteca-prompts-video/` e `referencias/`: catálogo de 35 estilos de edição, 50 visuais, 391 efeitos e ~512 prompts de vídeo — ver skill `criativo-catalogo-estilos` (índices em `references/`). `referencias/LEIA-ME.pdf` diz que os anúncios de referência do autor ainda não foram entregues.
- Pastas `fca-acervo-biblioteca-prompts-video`, `fca-acervo-efeitos-e-estilos`, `fca-acervo-referencias` estavam vazias na última conferência (provável cópia em download); relistar a pasta raiz a cada uso.
- Ainda não chegaram: sons/trilhas/SFX e os demais pacotes de b-roll (CSV prevê velas-e-igreja, mesa-e-familia, idosos-em-casa, oracao, carro-de-noite, telefone-e-chamadas, hospital, outros).


## Atualização 2: b-rolls 2–4, kit inicial e sons (pasta raiz igual, somente leitura)
Raiz: `<ACERVO>\`

### B-roll Pexels completo (pacotes 1–4; `CREDITOS.csv` em cada `b-roll/`)
- `fca-acervo-b-roll-1-negocios-e-telas` (116): contas-e-dinheiro, pessoas-reagindo, celular-e-mensagens, escritorio, imoveis, e-commerce-e-entregas, tecnologia-e-telas, dinheiro-e-vendas, comercio-e-loja, restaurante-e-comida, academia-e-fitness, estetica-e-beleza, cidade-e-movimento, saude-e-clinica.
- `fca-acervo-b-roll-2-casa-e-familia` (252): carro-de-noite 40, idosos-em-casa 100, mesa-e-familia 112.
- `fca-acervo-b-roll-3-fe-e-hospital` (237): hospital 23, oracao 56, telefone-e-chamadas 32, velas-e-igreja 126.
- `fca-acervo-b-roll-4-outros` (164): outros.
- Licença Pexels (ver acima). Cuidado de uso: religião, hospital, idosos e saúde são temas sensíveis; nunca apresentar pessoa de banco como cliente/paciente real nem insinuar promessa ou condição de uma pessoa.

### Sons (`sons/…`)
| Pasta | Conteúdo | Licença/uso |
|---|---|---|
| `fca-acervo-sons-1-efeitos/sons/01-efeitos-hardcopy/` (1.434 arquivos; `INDICE.csv`: arquivo, categoria, duração, origem) | aleatorios 82, analogicos 15, cartoon 270, foley 528, glitches 25, impactos 20, liquidos 295, transicoes 199 | Uso dentro dos vídeos e anúncios (YouTube, Instagram, Meta Ads, cursos, VSL). **Proibido redistribuir/revender soltos.** Foley e líquidos: biblioteca Adobe (só dentro de vídeos). |
| `…/03-sons-livres/` (`CREDITOS.md`; 82 curados + `biblioteca-interna` 140) | efeitos (caixa-registradora, clique, digitacao, ding, drone-suspense, glitch, hit-cta, impacto, notificacao, pop, riser, swoosh, whoosh) e 5 trilhas (corporativa-energetica, epica-curta, hiphop-trap-leve, lofi, tensao; 3 cada) | **Mais seguro:** CC0 (Freesound) e Mixkit Free License: uso comercial em anúncios, sem atribuição; não redistribuir solto. |
| `…/04-sfx-epidemic/` (`INDICE.csv`, 12 arquivos: fire, impacts, money, paper, reveal, risers, tech, time, ui, whooshes) | efeitos Epidemic Sound | "Licenciados na **conta do produtor**": usar dentro dos vídeos, não redistribuir; se vier reivindicação de direitos no YouTube/Instagram, trocar o efeito. **Preferir `03-sons-livres` quando houver equivalente.** |
| `fca-acervo-sons-3-trilhas-parte2/sons/02-trilhas/` (32 wav; ~115 s cada) | 05-drop-dramatico, 06-percussivo, 07-cinematografico-suave, 08-corporate-uplifting (8 cada), nomeadas `Titulo__Artista.wav` | **Sem arquivo de licença no pacote**; nomes de artista sugerem biblioteca comercial (possível Epidemic). Tratar como "licença não documentada": avisar o usuário antes de usar em anúncio pago. |
| `fca-acervo-sons-4-avatarhype/sons/05-avatarhype/` (`LICENCA.txt`, `AVISO-LICENCA.csv`, `CATALOGO.html`) | 16-avatarhype-musicas 335, 17-avatarhype-sfx 57 | Biblioteca de outro curso, "apresentada como livre de direitos", **mas várias faixas podem ser música comercial com copyright** (ex.: Rammstein) — `AVISO-LICENCA.csv` lista as de risco. **Nunca usar faixa listada nesse CSV em anúncio.** Para as demais, avisar o usuário do risco de reivindicação. |
**Faltam:** trilhas parte 1 (`02-trilhas/01..04`, zip "sons-2" não chegou) e possivelmente `sons/06..` outros.
Regra geral de som: voz sempre dominante; trilha baixa e com duck; **Meta bloqueia música com direitos** — em anúncio use `03-sons-livres`, `01-efeitos-hardcopy`, e só use Epidemic/trilhas parte2/AvatarHype com aviso e preferência por troca quando houver claim.

### Kit inicial (`fca-acervo-kit-inicial`, 968 arquivos, ~400 MB)
**Duplica** parte do acervo: 36 b-rolls (celular, comércio, dinheiro, escritório), 47 efeitos Hardcopy + 83 sons livres, e **cópias** de `biblioteca-prompts-video` e `efeitos-e-estilos` (catálogos). Não é necessário para o trabalho: se faltar disco, pode ser removido sem perda (os originais estão nas pastas próprias). Os catálogos que valem são os das pastas raiz `efeitos-e-estilos/` e `biblioteca-prompts-video/`.

### Como achar um som/clipe
`grep -i termo` nos `INDICE.csv`/`CREDITOS.*`/`CREDITOS.csv`; liste a pasta da categoria; ouça/olhe antes de usar (`ffprobe` para duração; `ffmpeg -ss 2 -i x.mp4 -frames:v 1 q.jpg` para ver um clipe). Copie só o necessário para `projeto/public/`.


## Regra de música por plataforma (decisão do usuário, prevalece sobre os avisos acima)
Experiência do usuário nas contas dele: **música com copyright em anúncio no Meta Ads não dá problema; o TikTok é rigoroso.** Portanto:
- **Meta Ads (anúncio pago):** pode usar qualquer faixa do acervo, inclusive as do `AVISO-LICENCA.csv` do AvatarHype e as de licença não documentada, **se o usuário pedir ou escolher**. Dar no máximo um aviso curto por criativo (risco de reivindicação pelo titular existe, mesmo sem bloqueio da plataforma); não recusar nem insistir.
- **TikTok (anúncio ou orgânico):** **evitar** música com copyright. Usar só `03-sons-livres` (CC0/Mixkit) e `01-efeitos-hardcopy`.
- **Orgânico Instagram/Reels e YouTube:** avisar antes (podem silenciar o vídeo ou gerar reivindicação).
- Na dúvida sobre a plataforma de destino, **perguntar**. Registrar a plataforma no BRIEFING.md.
- Para qualquer plataforma: voz dominante, trilha baixa com duck.
- Continua valendo: não redistribuir os arquivos do acervo soltos.


## Atualização 3: trilhas completas (partes 1 e 2) — acervo agora completo
- `fca-acervo-sons-2-trilhas-parte1/sons/02-trilhas/` (40 wav): **01-tensao-dark**, **02-trap-pesado**, **03-buildup-riser**, **04-cta-epico** (10 cada).
- `fca-acervo-sons-3-trilhas-parte2/sons/02-trilhas/` (32 wav): **05-drop-dramatico**, **06-percussivo**, **07-cinematografico-suave**, **08-corporate-uplifting** (8 cada).
- Total 72 trilhas, ~161 s em média, nomeadas `Titulo__Artista.wav`. **Índice com duração: `references/trilhas-indice.csv`** (pacote, categoria, arquivo, duracao_s). Para ouvir/escolher: `grep -i categoria` no CSV e `ffmpeg -ss 0 -t 20` para trecho de teste.
- **Nenhum dos dois pacotes de trilhas traz arquivo de licença**; os nomes de artista (ex.: Henry Miles, Baha Bank) sugerem biblioteca comercial (possível Epidemic Sound). Seguir a "Regra de música por plataforma" acima: no Meta Ads o usuário aceita uso; no TikTok evitar; orgânico IG/YouTube avisar.
- Uso por função: tensão/gancho → 01; energia de prova/ritmo → 02 e 06; subida antes da revelação → 03; CTA final → 04; virada/impacto → 05; fundo discreto sob voz → 07 e 08. Cortar a faixa ao tamanho do criativo (12–60 s) com fade out; trilha baixa e com duck sob a voz.
- Pacotes do Drive todos conferidos (fora o PDF opcional 00-SE-O-DOWNLOAD-TRAVAR). O kit inicial duplica conteúdo e pode ser apagado se faltar disco.
