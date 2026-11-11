

## Atualização 2: b-rolls 2–4, kit inicial e sons (pasta raiz igual, somente leitura)
Raiz: `C:\Users\Vinicius Prado\Downloads\ACERVO DE MIDIAS CURSO CLAUDE\`

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
