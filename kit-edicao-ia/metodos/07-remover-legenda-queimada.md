# Remover legenda queimada

**Quando usar / o que resolve:** o bruto já vem com legenda gravada nos pixels e o vídeo novo terá legenda própria (ou recorte da pessoa). Gera quadros limpos do trecho, sem serviço pago, e a máscara que o recorte usa para não abrir buraco no corpo onde a legenda estava.

## Receita rápida
```bash
# 1) preview: acha faixa e cores sozinho, limpa 4 quadros e monta UMA folha (original | máscara | limpo)
python scripts/remover_legenda_queimada.py --video originais/x.mp4 --inicio 7.6 --fim 12.07 --saida analise/limpo --preview
# 2) trecho inteiro (repita --faixa/--cores do preview se quiser travar)
python scripts/remover_legenda_queimada.py --video originais/x.mp4 --inicio 7.6 --fim 12.07 --saida analise/limpo --processos 2
# 3) recorte em cima dos quadros limpos (metodos/06)
python scripts/recorte_rvm.py --quadros analise/limpo --saida-matte template/public/<video>/matte --saida-plate template/public/<video>/plate --json template/src/<video>.matte.json
```
Leia o JSON impresso: `faixa` (y0,y1), `cores`, `com_legenda` (1º e último quadro), `trechos` (blocos com a mesma frase) e `px_preenchidos` (quanto veio de clone temporal, espacial ou interpolação). Depois abra só `_preview.jpg`.

## Parâmetros
| opção | default | efeito |
|---|---|---|
| `--faixa y0,y1` | auto | faixa vertical da legenda (px do quadro de origem) |
| `--cores` | auto | `branco,amarelo,verde,ciano,rosa` (palavra destacada costuma ser amarela) |
| `--sem-contorno` | off | legenda sem stroke escuro (detecção mais permissiva; confira falsos positivos) |
| `--dilatar` | 17 | raio da máscara em px (cobre antialias, sombra e contorno) |
| `--voto` | 0.35 | fração dos quadros do trecho para o pixel entrar (máscara estável, sem tremor) |
| `--vizinhos` | 12 | quadros vizinhos para clone temporal (0 desliga) |
| `--sem-espacial` / `--sem-morph` | off | desligam o clone espacial e a interpolação que segue braço/mão |
| `--grao` | 0.4 | grão no remendo (0 = remendo liso, “plástico”) |
| `--formato` | jpg | `png` se for reprocessar muitas vezes |
| `--so 30,40-45` | — | só esses quadros (correção pontual) |

## Como funciona
1. Detecção: pixels branco/amarelo… dentro da faixa e a até ~meia espessura de traço de um pixel escuro (o recheio de letra contornada nunca fica longe do stroke; pele, parede e camisa encostadas ficam de fora). Componentes pequenos só entram se encostarem numa letra (pontos, acentos); exige ≥2 letras por quadro e ≥3 quadros seguidos.
2. Os quadros são agrupados por frase (IoU das máscaras) e a máscara é votada por trecho, depois dilatada.
3. Preenchimento em camadas: interpolação vertical coluna a coluna (mediana das amostras) + *morph* por DTW que segue a borda de braço/mão inclinados + costura Poisson; clone temporal (vizinhos alinhados por fluxo DIS onde o pixel estava livre, ganho/offset por canal, Poisson); clone espacial de faixas acima/abaixo (textura); grão casado ao ruído local.
4. Saída: `c0001.jpg…`, `quadros.json` (tempo do 1º quadro e fps reais, lidos do vídeo) e `mascara_legenda.npz`.

## Armadilhas já vividas
- **B-roll com parede branca e metal escuro** virava “legenda”: resolvido com o limite de distância ao stroke, tamanho máximo de componente e mínimo de 3 quadros. Se ainda aparecer trecho falso em `trechos`, trave `--faixa`.
- **Letra colada no braço** (D de “DIFERENÇA” encostado na pele) ficava metade fora da máscara e deixava riscos escuros; a regra do stroke resolve. Se sobrar resíduo, aumente `--dilatar` para 21.
- **Legenda fixa sobre a pessoa parada**: o clone temporal não acha fonte (`temporal_px` ≈ 0) e quem preenche é a interpolação + clone espacial; aceitável sobre camisa lisa, ruim sobre rosto. Se a legenda cobre o rosto, avise o usuário antes: não há pixel real para recuperar.
- **Mão passando rápido pela faixa** fica borrada no remendo (mesmo no V02). Ela some atrás de texto/legenda nova na maioria dos casos; se ficar à mostra, prefira cobrir com a legenda nova no mesmo lugar.
- Tempo: `quadros.json` grava o pts REAL do 1º quadro (ex.: `-ss 7.6` entrega o quadro de 7.6326 s). O recorte copia isso para o `matte.json`; não “arredonde” na mão.
- Disco: o modo `--video` extrai PNGs temporários (~2 MB/quadro) e apaga no fim.

## Checklist de verificação
- `_preview.jpg` (4 quadros espalhados) e, no trecho inteiro, uma folha de 6 quadros com `scripts/folha.py imgs analise/limpo/c00NN.jpg ...`.
- Reprova: resto de letra ou contorno; remendo liso sem grão; mancha da cor errada (roxo da camisa sobre a mão); borda do braço quebrada/deslocada; remendo que “pisca” entre quadros vizinhos (compare 2 quadros seguidos).
- Conferir o mesmo trecho também sobre fundo escuro e claro depois do recorte (metodos/06): resíduo de legenda vira halo no alfa.
