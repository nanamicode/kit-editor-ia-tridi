# Índice da biblioteca de prompts de vídeo (FCA): referências de movimento, efeito e 3D

> Aviso: são prompts de **terceiros** (autores no X/GitHub) escritos para gerar vídeos com IA. Use como **inspiração de FORMA** (ritmo, estrutura, tipo de efeito, câmera); **nunca copie a obra**, o texto, a marca ou a oferta. Os prompts estão em **inglês** (alguns em turco, chinês ou espanhol). Aqui só há slugs e resumos; abra `prompts/<slug>.md` para ler o original.

## 1. Visão geral

- **Origem:** repositório `yihui-dev/awesome-opus5-5-videos` no GitHub, licença **MIT** (arquivo `LICENSE` na pasta); remakes em skillry.dev. O CATALOGO diz 513 vídeos.
- **Pasta (somente leitura):** `<ACERVO>/biblioteca-prompts-video/`.
- **Contagem real:** 512 arquivos em `prompts/` e 512 registros em `videos.json` (o título do catálogo diz 513; diferença de 1).

| Categoria (campo `category`) | Vídeos | Uso |
|---|---|---|
| Motion graphics (`motion`) | 316 | útil para criativos |
| Explicativos (`explainer`) | 67 | útil para criativos |
| Cenas 3D (`3d`) | 59 | útil para criativos |
| Jogos e interativos (`interactive`) | 70 | evitar para anúncio |

(O CATALOGO.md anuncia Motion 317; o `videos.json` e os arquivos dão **316**. Use 316.)

- **Arquivos:** `CATALOGO.md` (tabela slug | autor | tags | parcial | início do prompt), `CATALOGO.html`, `videos.json` (campos: slug, author, category, tech_tags, prompt, prompt_partial, post_url, skillry_url), `prompts/<slug>.md` (um por vídeo: categoria, "Remake built with", link do post original e o prompt em bloco de código). **Não existe** a pasta `por-categoria/` citada no CATALOGO; filtre por categoria no `videos.json` ou na linha `**Category:**` de cada `.md`.
- **Slug** = `autor-números` (ex.: `twoclipping-000267`). O mesmo autor pode ter vários.
- **Tags:** são **técnicas** (tecnologia usada), não de tema. Frequência (todos / sem jogos): `canvas` 350/295, `svg` 218/209, `threejs` 147/101, `shader` 104/74, `gsap` 99/93, `css` 68/66, `audio` 36/23, `particles` 26/21, `playable` 22/0, `pixel` 16/3, `ai-image` 10/10, `webgl` 9/9, `physics` 9/6.
- **"Parcial" (`prompt_partial`):** 234 de 512. O autor publicou só parte do prompt (o resultado teve ajustes fora do texto, ou o texto é só a legenda do post). Em parciais o prompt é curto e não reproduz o vídeo; trate como descrição, não receita.
- **Repetição:** ~78 prompts são variações do mesmo "15-second motion graphics showreel" e 12 usam o modelo `<inputs>/<direction>` de UI-estados. Para variedade, prefira os slugs da seção 4. Os mais úteis têm blocos `<direction>`, `<rules>`, `<structure>`.

## 2. Como buscar

Na pasta `prompts` (Git Bash):

```bash
cd "<ACERVO>/biblioteca-prompts-video/prompts"
grep -il 'palavra' *.md                 # slugs que citam a palavra (em inglês)
grep -il 'kinetic' *.md | head -20        # ex.: tipografia cinética
grep -il 'kinetic' *.md | xargs grep -L 'Games'   # tira jogos
sed -n '1,60p' twoclipping-000267.md      # ler um prompt por slug (ou Read em prompts/<slug>.md)
grep -n 'Remake built with' <slug>.md     # tecnologias do remake
```

Ver tags/autor/categoria de um slug (as tags estão no JSON):

```bash
python - <<'E'
import json;d={v['slug']:v for v in json.load(open('../videos.json',encoding='utf-8'))}
v=d['twoclipping-000267'];print(v['author'],v['category'],v['tech_tags'],v['prompt_partial'])
E
```

Exemplos prontos (palavras em **inglês**, porque o texto é inglês):

- Texto 3D / título com profundidade: `grep -il '3d text\|extrud\|wordmark' *.md`
- Gráfico animado / dados: `grep -il 'chart\|dashboard\|counter\|infographic' *.md`
- Transição / morph / match cut: `grep -il 'match cut\|morph\|transition\|infinite zoom' *.md`
- Tipografia cinética: `grep -il 'kinetic\|typograph' *.md`
- Shader / fundo líquido: `grep -il 'shader\|glsl\|caustic\|fluid' *.md`
- UI / celular / app: `grep -il 'iphone\|smartphone\|cursor\|ui states' *.md`

Muitos hits são o showreel repetido: dedupe lendo só os slugs das seções 3 e 4.

## 3. Mapa por tema

Como as tags são técnicas, os temas abaixo vêm de busca por palavra-chave no texto do prompt (contagem = prompts que citam, sem jogos; aproximada).

**Tags técnicas mais frequentes:** `canvas` 350; `svg` 218; `threejs` 147; `shader` 104; `gsap` 99; `css` 68; `audio` 36; `particles` 26.

### Tipografia cinética e wordmark (~18 prompts)
texto como arquitetura do quadro, revelações mascaradas, identidade/bumper.

- `gdgtify-929495` (@Gdgtify; canvas)
- `techhalla-498547` (@techhalla; canvas)
- `twoclipping-000267` (@twoclipping; svg css)
- `twoclipping-496100` (@twoclipping; canvas)
- `humzaakhalid-537875` (@humzaakhalid; canvas)

### Gráficos e dados (~18 prompts)
painéis, janelas com gráficos, dados reais por estado, visualização de conceito.

- `dale-vaz-879074` (@dale_vaz; canvas)
- `stewchan2-369810` (@stewchan2; canvas)
- `groundcontrol-230877` (@GroundControl; canvas audio)
- `verbove-268381` (@verbove; canvas)
- `charlesmendez-476517` (@charlesmendez; canvas svg gsap)

### 3D e câmera (~80 prompts)
zoom contínuo por camadas, mergulho macro, produto 3D, zoom infinito.

- `acoramaa-053577` (@Acoramaa; threejs shader)
- `irinatoxi-962937` (@irinatoxi; threejs shader canvas)
- `per-simmons-944727` (@per_simmons_; threejs canvas svg)
- `koldo2k-778767` (@koldo2k; canvas ai-image)
- `truenyl-447745` (@truenyl; threejs shader)

### Shader / WebGL (~7 prompts)
refração, fogo, fractais, fluidos; use como fundo ou textura em movimento.

- `nicolamanzini-156628` (@NicolaManzini; threejs shader canvas)
- `nathanwilbanks-981110` (@NathanWilbanks_; threejs shader audio)
- `jrayon-054015` (@jrayon; shader webgl canvas)
- `reflex-cloud-304046` (@reflex_cloud; shader webgl canvas css)
- `lukasersil-726495` (@lukasersil; threejs shader canvas svg)

### UI, telas e produto em uso (~31 prompts)
forma única que vira estados de interface, cursor com cliques reais, UI fiel à marca.

- `twoclipping-402193` (@twoclipping; svg)
- `annacher-433425` (@AnnaCher___; svg)
- `proanaliteg-458642` (@proanaliteg; svg)
- `jhylee95-452427` (@jhylee95; svg gsap)
- `bthreeagency-827092` (@BThreeAgency; canvas svg css)

### Partículas (~23 prompts)
fogos de luz, nuvens de pontos, celebração (use com parcimônia).

- `fornyapayzeka-795431` (@FornYapayZeka; threejs shader particles)
- `kgonia7-746268` (@kgonia7; threejs shader canvas particles)
- `web3wesley-365164` (@Web3Wesley; threejs canvas css particles)
- `zheke-622583` (@zheke; shader webgl canvas particles)
- `zhang-baoqing-920413` (@zhang_baoqing; threejs canvas particles)

### Transições e morph (~36 prompts)
morph de um elemento, match cut, montagem de logo por peças, cortes na batida.

- `mounnna-497266` (@Mounnna; canvas)
- `koldo2k-778767` (@koldo2k; canvas ai-image)
- `twoclipping-402193` (@twoclipping; svg)
- `prasenx-693512` (@prasenx; shader canvas audio)
- `twoclipping-496100` (@twoclipping; canvas)

### Explicativos (~35 prompts)
passo a passo animado, estrutura problema-solução-prova, receita, diagrama.

- `parkerrex-701462` (@ParkerRex; canvas physics)
- `emollick-019567` (@emollick; canvas)
- `alex-prompter-997524` (@alex_prompter; svg gsap)
- `ror-fly-880547` (@Ror_Fly; canvas)
- `arthurkatcher-604161` (@arthurkatcher; svg gsap audio)

### Lançamento / promo de produto (~68 prompts)
roteiro de lançamento 15-30s, hook no 1º segundo, features em sequência.

- `moritzkremb-466494` (@moritzkremb; svg gsap)
- `ik-builds-585923` (@ik_builds; canvas svg)
- `ratheejaisal-154698` (@RatheeJaisal; canvas svg)
- `brainextends-606193` (@brainextends; shader svg)
- `jhylee95-452427` (@jhylee95; svg gsap)

## 4. Seleção curada: 40 prompts para criativos de anúncio

Sem jogos. Abra `prompts/<slug>.md`. Formato: slug | autor | tags | o que faz e como adaptar.

1. `twoclipping-402193` | @twoclipping | svg | Uma única forma vira 8-12 estados de UI (botão, loader, gráfico), tudo no ritmo de 120 BPM; adaptaria mostrando a jornada do produto como uma peça só que se transforma.
2. `annacher-433425` | @AnnaCher___ | svg | Promo montada com a UI real do cliente, forma que nunca corta e cursor que clica; adaptaria recriando a tela que o comprador já usa.
3. `verbove-268381` | @verbove | canvas | Um arquivo, uma função draw(t), dados reais em cada estado e saída em 1:1, 16:9 e 9:16; adaptaria para gerar o mesmo criativo nos três formatos do anúncio.
4. `twoclipping-000267` | @twoclipping | svg css | Minimalismo premium: uma ideia por plano, revelações de texto mascaradas, match cuts e lista de efeitos proibidos; adaptaria como guia de estilo limpo e anti-"cara de IA".
5. `twoclipping-496100` | @twoclipping | canvas | Abertura estilo keynote com wordmark de uma palavra e fotos reais sobre trilha com "drop"; adaptaria como vinheta de marca/oferta com a fala no lugar da trilha.
6. `brainextends-606193` | @brainextends | shader svg | Brief completo (entregáveis, fps, áudio, revisão do render) para um vídeo de marca de 18s; adaptaria o formato de brief a cada oferta.
7. `moritzkremb-466494` | @moritzkremb | svg gsap | Vídeo de lançamento de SaaS com assets reais e edição de motion; adaptaria o encadeamento dor, produto, prova para uma oferta digital.
8. `jhylee95-452427` | @jhylee95 | svg gsap | Cenas com gancho no 1º segundo e batidas distintas para prova do produto e IA, cor/tipografia da marca; adaptaria como esqueleto gancho-prova-CTA.
9. `ik-builds-585923` | @ik_builds | canvas svg (parcial) | Modelo de 15s sem narração, fundo claro e notas de marcador com {{PRODUTO}} parametrizado; adaptaria trocando só os dados da oferta (padrão reutilizável).
10. `alex-prompter-997524` | @alex_prompter | svg gsap | Explicativo de 30s em 5 cenas (problema, o que faço, 3 passos, prova, nome); adaptaria direto como roteiro de anúncio de serviço.
11. `ratheejaisal-154698` | @RatheeJaisal | canvas svg | Lançamento de até 20s, ritmo rápido, features em sequência na identidade da marca; adaptaria para anúncio de benefícios em cortes curtos.
12. `charlesmendez-476517` | @charlesmendez | canvas svg gsap | Fluxo de usuário em etapas (campanha, métricas, atribuição, agente) com cara "slick e punchy"; adaptaria como demonstração de passo a passo da oferta.
13. `dale-vaz-879074` | @dale_vaz | canvas | Começa num ponto no preto e abre janelas de gráficos/posições com zoom em várias escalas; adaptaria para revelar um painel sem prometer ganho.
14. `stewchan2-369810` | @stewchan2 | canvas | Visualização de um conceito abstrato (como backlinks funcionam); adaptaria para explicar o mecanismo da oferta em um diagrama animado.
15. `groundcontrol-230877` | @GroundControl | canvas audio | Animação de dados reais puxados da web (clima de 2026) com áudio; adaptaria como gráfico animado de dado público que sustenta o argumento.
16. `mounnna-497266` | @Mounnna | canvas | Logo desenhado em wireframe e montado por estilhaços low-poly, depois ícone e nome digitados; adaptaria como assinatura de marca no CTA.
17. `0xvalure-331584` | @0xValure | threejs canvas | Logo vira reel de 10s a partir de um vídeo de referência; adaptaria como modelo de teaser curto com a identidade do cliente.
18. `gdgtify-929495` | @Gdgtify | canvas | Filme de 20s só com tipografia onde cada linha muda a arquitetura do quadro; adaptaria para uma frase-chave que se constrói palavra a palavra.
19. `techhalla-498547` | @techhalla | canvas | Bumper de identidade cinético de 20s com pôster que se move; adaptaria como abertura de marca/personalidade.
20. `humzaakhalid-537875` | @humzaakhalid | canvas (parcial) | Reel de 24s com paleta fixa, motion blur, hits de câmera, HUD e UI de terminal; adaptaria o pacote de estilo (cores + movimentos) a uma marca.
21. `koldo2k-778767` | @koldo2k | canvas ai-image | Zoom infinito em colagem vintage atravessando objetos de uma paisagem à outra; adaptaria como transição entre blocos de argumento.
22. `ror-fly-880547` | @Ror_Fly | canvas | Receita animada com ingredientes e medidas entrando conforme a ordem; adaptaria para listar etapas/itens da entrega com tempo de leitura.
23. `mattbean-917572` | @mattbean | canvas | Clipe em estilo desenho de 30s para um processo de 3 passos; adaptaria como "como funciona" em 3 etapas.
24. `parkerrex-701462` | @ParkerRex | canvas physics | Explicação de um mecanismo (balde de fichas) onde cada quadro é função pura do tempo; adaptaria para animar um sistema/processo e renderizar frame a frame.
25. `emollick-019567` | @emollick | canvas | Explicação em que cada trecho muda de estilo visual, rápido e autorreferente; adaptaria para variar o visual a cada ponto e segurar retenção.
26. `arthurkatcher-604161` | @arthurkatcher | svg gsap audio (parcial) | Explica um assunto técnico em 40s com cortes na batida da música; adaptaria sincronizando entradas aos beats ou a falas-chave.
27. `irinatoxi-962937` | @irinatoxi | threejs shader canvas (parcial) | Do celular à escala atômica em 20s, mergulhando por placa e chip; adaptaria como "zoom para dentro" revelando o diferencial do produto.
28. `acoramaa-053577` | @Acoramaa | threejs shader (parcial) | Da mesa ao átomo dentro da CPU com peças se soltando e zoom contínuo; adaptaria como desmontagem de um produto para mostrar o que há dentro.
29. `per-simmons-944727` | @per_simmons_ | threejs canvas svg (parcial) | Lata 3D com rótulo pintado em código e variações de foto de produto; adaptaria para mostrar o produto girando com variações de rótulo/cor.
30. `bthreeagency-827092` | @BThreeAgency | canvas svg css | Tela de conquista fiel a um frame do Figma, emblema 3D e partículas douradas; adaptaria como animação de selo/benefício liberado com celebração curta.
31. `iamtanzil-120030` | @iamtanzil_ | canvas css | Cabeçalho de produto com spotlight "raio-x" que apaga a foto e revela o interior; adaptaria como revelação do mecanismo do produto (não de resultado).
32. `iamtanzil-675031` | @iamtanzil_ | threejs gsap | Herói 3D guiado por rolagem com títulos e cartões em tempos marcados do vídeo; adaptaria a sincronia para cartões que entram em momentos exatos da fala.
33. `lukasersil-726495` | @lukasersil | threejs shader canvas svg | Showreel de técnicas (tipografia cinética, 2D/3D, fluidos, partículas) em 15s; use como catálogo para escolher UM efeito por cena.
34. `prasenx-693512` | @prasenx | shader canvas audio | Showreel com trilha sintetizada em código e cada corte/transição na batida; adaptaria SFX e cortes sincronizados às entradas dos elementos.
35. `stokebuilder-356793` | @stokebuilder | canvas svg (parcial) | Animações em tela cheia inseridas sobre o corte de um episódio para conceitos difíceis de visualizar; adaptaria como inserção explicativa sobre a fala.
36. `konstantinsaifo-501736` | @konstantinsaifo | threejs shader (parcial) | Motor de foguete que se abre para seguir o fluxo interno; adaptaria a vista explodida/corte para explicar como o produto funciona por dentro.
37. `nicolamanzini-156628` | @NicolaManzini | threejs shader canvas (parcial) | Aquário com reflexo, refração e cáusticas em shader; adaptaria como fundo líquido premium atrás de texto ou produto.
38. `1littlecoder-378066` | @1littlecoder | canvas | Anúncio de 30s inspirado no clássico Apple 1984, sem molduras; adaptaria só a estrutura dramática (tensão e quebra), nunca a obra.
39. `sudo-kiran-335993` | @sudo_kiran | canvas svg gsap css | Explicativo de motion graphics de um produto com roteiro e paleta definidos; adaptaria como corpo do anúncio entre gancho e CTA.
40. `tak3sh8-441895` | @tak3sh8 | canvas audio | Animação de quadro branco desenhada à mão explicando um conceito, com áudio; adaptaria para explicar o mecanismo da oferta com traço simples e legível.

## 5. Regras de uso

- Inspiração de forma; não copiar texto, marca, oferta nem a obra de ninguém. Cite o slug como referência interna.
- Traduza o critério (ex.: "uma ideia por plano", "corte na batida") para a identidade e a oferta do usuário.
- Tudo aqui foi feito em código (HTML/Canvas/SVG/Three.js/Remotion); para efeitos 3D e shader no Remotion, teste 5s renderizados em MP4 antes de montar o vídeo.
- Nichos sensíveis: não herdar promessa de resultado, cotação ou antes/depois dos exemplos (ex.: painéis de trading).
