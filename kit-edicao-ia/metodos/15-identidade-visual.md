# Identidade visual (paleta, tipografia, layout)

**O que resolve:** troca a cara do vídeo inteiro em um só lugar, e todos os módulos obedecem. Também guarda o padrão aprovado separado dos dados da oferta, para reutilizar.

## Receita rápida
1. Copie `marcas/roxo-dourado.json` para `marcas/<cliente>.json` e troque as 7 cores. As fontes vêm de `@remotion/google-fonts`.
2. Em `template/src/kit/theme.ts`, crie a constante `BRAND_<CLIENTE>` com o mesmo formato de `BRAND_ROXO_DOURADO` (as fontes são carregadas com `loadFont` no topo do arquivo).
3. Em `video.config.ts`: `brand: BRAND_<CLIENTE>`. O `Video.tsx` envolve tudo em `<BrandProvider>`.
4. Confira 3 stills: rótulo de B-roll, legenda com palavra ativa e CTA.

## Papéis das cores (o que cada token pinta)
| token | papel |
|---|---|
| ink | fundo principal, caixa dos rótulos, contorno da legenda |
| graphite | fundos secundários, HUD |
| primary | cenário da apresentadora, anéis |
| primaryLight | detalhes, número total do contador |
| accent | faixa de apoio, botão CTA, réguas |
| accentLight | palavra falada na legenda, brilho do selo e das moedas |
| text | títulos, legenda não ativa |

**Como escolher:** tire `primary` do próprio vídeo (parede, roupa, produto), porque assim o recorte combina com o fundo. Escolha `accent` com contraste alto sobre `ink` e com função (no V02, o dourado é o material dos selos que aparecem no vídeo). Teste o contraste do texto ≥ 4,5:1.

## Tipografia e layout (1080x1920)
- Títulos: Anton (condensada pesada), ≥ 84 px. Apoio: Montserrat 700-800, ≥ 44 px.
- Margens laterais ≥ 80 px. Zona segura Reels: texto essencial entre y=230 e y=1560 (`SAFE` em theme.ts).
- Legenda: ≤ 2 linhas, longe das bordas e sem cobrir o rosto. Título ≠ legenda.
- Rótulos de B-roll: sempre na mesma posição e orientação (embaixo, à esquerda, horizontal). O usuário reprovou a variação de lado e o rótulo na vertical.

## Armadilhas já vividas
- **Cara de IA:** degradê genérico, tudo mexendo junto, sem hierarquia. Use textura funcional (papel, relevo, grão sutil) e um foco por vez.
- **Roxo sobre roxo:** camisa roxa sumia no cartão roxo. Escureça o cartão atrás do torso ou use rim light sutil.
- **Acentos (Õ, É, Ç):** reserve padding no topo das caixas e máscaras, porque o til era cortado.
- Cor "chumbada" em componente quebra a troca de marca: tudo por `useBrand()`.

## Checklist
- [ ] Os 3 stills (rótulo, legenda, CTA) com a nova marca, sem texto ilegível.
- [ ] Nenhum hex solto nos componentes novos (`grep -n "#[0-9A-Fa-f]\{6\}" template/src/kit`). Só sombras derivadas.
