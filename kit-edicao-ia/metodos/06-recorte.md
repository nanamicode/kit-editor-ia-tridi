# Recorte da apresentadora (RVM em CPU)

**Quando usar / o que resolve:** tirar a pessoa do fundo para pôr texto, selos ou cartão ATRÁS dela (oclusão real pelo alfa) ou trocar o cenário. Roda em CPU com o modelo RVM ONNX do kit: não precisa de GPU, WebGPU nem serviço pago. Saída = PNG RGBA por quadro + `matte.json` que o `<Presenter>` lê direto.

## Receita rápida
```bash
# (a) o trecho tem legenda queimada? limpe antes (metodos/07) e recorte a pasta limpa:
python scripts/recorte_rvm.py --quadros analise/limpo \
  --saida-matte template/public/<video>/matte --saida-plate template/public/<video>/plate \
  --json template/src/<video>.matte.json
# (b) sem legenda queimada: direto do vídeo (inicio/fim em s do ARQUIVO)
python scripts/recorte_rvm.py --video originais/x.mp4 --inicio 7.6 --fim 12.07 \
  --saida-matte template/public/<video>/matte --saida-plate template/public/<video>/plate \
  --json template/src/<video>.matte.json
# (c) teste barato antes do trecho inteiro (15 quadros, ~2,5 s/quadro em CPU)
python scripts/recorte_rvm.py --video originais/x.mp4 --inicio 9 --fim 9.6 --saida-matte analise/tmp_m --json analise/tmp_m.json
```
No `video.config.ts`: `import matte from "./<video>.matte.json"` e passe `matte`, `matteDir: "<video>/matte"`, `fromSec`, `toSec` ao `<Presenter>` (metodos/14). O resumo impresso traz `sharpFrom`, `firstFileTime`, `alfa_medio` e `ganho_max_usado`: confira esses números antes de abrir imagens.

## Parâmetros
| opção | default | efeito |
|---|---|---|
| `--downsample` | 0.6 | resolução interna do RVM. 0.6 rosto/meio corpo em 1080; 0.4 corpo inteiro; 0.25 em 4K. Mais alto = borda mais fina, mais lento |
| `--guided` | 0.5 | peso do guided filter (cola o alfa na borda real da imagem). 0 desliga |
| `--suavizar` | 0.3 | mistura com o alfa anterior onde a mudança é pequena (anti-tremor sem arrastar movimento) |
| `--lo` / `--hi` | 0.12 / 0.92 | níveis do alfa. `--lo` alto corta halo mas come fiapos (V02 usou 0.28 = recorte duro de “adesivo”) |
| `--cabelo` | on | refino de fios na borda por *unmixing* (parede × cabelo) |
| `--despill` | auto | borda pega a cor do interior; `auto` liga a regra azul/roxo quando o fundo é frio |
| `--normalizar` | on | quadros escuros (fade) clareados SÓ para o modelo; a cor gravada é a original |
| `--furos` | on | fecha furos internos (camisa da cor da parede) |
| `--nitidez` / `--primeiro-nitido` | auto / — | entrada desfocada usa o alfa do 1º quadro nítido desfocado na mesma medida |
| `--corte-cena` | 70 | antes do 1º nítido: quadro muito diferente (B-roll) fica transparente; dissolve vira alfa parcial |
| `--ganho-max` | 1.4 | teto do ganho de exposição gravado no json (o resto vira gamma) |
| `--mascara-legenda` | auto | `mascara_legenda.npz` do metodos/07 (lido sozinho de `--quadros`); repara o alfa sob a legenda |
| `--so 40-54` | — | processa só esse intervalo (teste); nomes de arquivo mantêm o número do quadro |

## Como funciona
1. RVM (MobileNetV3) com estado recorrente: o alfa de cada quadro usa a memória dos anteriores, por isso o trecho é processado em ordem e o teste com `--so` é pior nos 2-3 primeiros quadros.
2. Guided filter + suavização temporal + remoção de ilhas → níveis lo/hi.
3. Na faixa da borda o alfa é recalculado dos pixels (I = a·F + (1-a)·B, B = parede local, F = cor local do cabelo): volta fiapo de cabelo e furinhos de parede entre cachos.
4. Cor: foreground por *blur-fusion* (tira a parede misturada na borda) + despill (a borda pega a croma do interior e tem luminância limitada: nada de fio claro sobre fundo escuro).
5. `matte.json` grava `exposure` por quadro (rosto/ombros vs mediana do meio do trecho): ganho ≤ `--ganho-max` + gamma. O `<PersonCutout>` aplica isso no render.

## Armadilhas já vividas
- **Recorte “adesivo”** (contorno duro + fio dourado): veio de `lo` 0.28 + curva de alfa 1.7 + rim forte. Defaults agora: `--lo 0.12`, borda macia e rim sutil no componente.
- **Rosto ceroso e ruidoso no fim** (fonte escurecendo, ganho até 2,4x): teto 1.4 e gamma no resto; se ainda estiver escuro, escureça o cenário junto (`darkenSec` do Presenter), não suba o ganho.
- **Buraco no peito/camisa** quando a camisa tem a cor da parede: `--furos on` (default). Se a mão encostada no corpo virar opaca demais, rode com `--furos off` e compare.
- **Quadros desfocados na entrada** (transição com blur): o RVM falha; o script detecta o 1º nítido (`sharpFrom`) e o componente congela nele até `liveSec`. Se errar, force `--primeiro-nitido N`.
- **Halo roxo na borda do cabelo**: `--despill on`; se sobrar, suba `--lo` em 0.04 por vez (não mais que 0.22).
- Tempo: o índice do PNG é calculado pelo **tempo do arquivo** (`firstFileTime`), não pelo quadro da composição; não renomeie nem pule arquivos.
- **Trecho começando no B-roll**: o alfa nítido desfocado era aplicado a quadros de outra cena. Agora quadros diferentes do 1º nítido (`--corte-cena`) ficam transparentes e o dissolve fica parcial. Mesmo assim, prefira `--inicio` perto da entrada da pessoa.
- `--video` extrai PNGs temporários na pasta do json (apagados no fim): precisa de ~2 MB livres por quadro.

## Checklist de verificação
- Stills do dev `RecorteClaro` e `RecorteEscuro` (fundo claro e escuro) no meio da fala e no quadro mais escuro:
  `cd template && npx remotion still src/dev/Apresentadora.ts RecorteClaro --frame=300 --gl=angle --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" ../review/recorte_claro.png`
- Reprova: halo/fio claro ou roxo em volta do cabelo; mão, dedos ou mecha sumindo; furo na roupa; borda serrilhada; tremor entre quadros vizinhos (compare 2 stills a 1 quadro de distância); rosto acinzentado/ceroso no fim.
- `alfa_medio` estável entre quadros (variação > 15% sem a pessoa se mexer = tremor ou ilha).
