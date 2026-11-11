# V7 — pendências conhecidas (rodada anterior)
## Do render final (estado ATUAL verificado no MP4)
- Conferi 7 quadros parados, não assisti à reprodução contínua. Por isso não verifiquei a sincronia exata entre legenda e fala nem a fluidez das animações.
- O b-roll do Det B (9,5 s) não mostra a impressora; é uma questão de conteúdo e não mexi nisso.
- No CTA os últimos rótulos ('impressora térmica', 'compacto') aparecem perto do fim do vídeo, com pouco tempo de leitura.

## Da revisão independente (nota 8.3) — ANTES da rodada de correção; parte pode já estar corrigida, CONFIRA no estado atual
- [medio] t=7.6s: O cartão DET. B (impressora), de 7,6 a 11,6 s, tem o rótulo 'integrada' passando da borda direita do cartão. Em 'compacto' (DET. D, 17,45 s) e 'balcão' (DET. E, 19,95 s) o texto encosta ou cruza a borda de baixo. Fica com cara de diagramação quebrada num estilo que vive de precisão técnica. | correção sugerida: Em V7.tsx, nos cartões B, D e E, dar ao rótulo pelo menos 24 px de respiro interno: reduzir o desenho, aumentar a altura do cartão para cerca de 400 px ou baixar o rótulo para 44 px. Conferir com still nos frames 290, 540 e 610.
- [medio] t=14.45s: O cartão DET. C (LED), de 14,45 a 17,3 s, cobre a mão e o antebraço da apresentadora enquanto ela gesticula, e o fundo translúcido deixa o corpo aparecendo por trás da matriz de LED. É texto sobre imagem com pouca hierarquia, e o '+ experiência' em lilás sobre fundo translúcido perde contraste. | correção sugerida: Deixar o fundo do cartão C opaco, como C.chip a 0,92 ou mais, e levá-lo para o canto inferior esquerdo da moldura, sobre o totem, que nesse plano está à esquerda e parado. Se não couber, reduzir para 420x340.
- [baixo] t=0s: O gancho dos 3 primeiros segundos é estático. O plano aberto, reduzido a 0,8 na moldura, deixa rosto e totem pequenos (a apresentadora no canto inferior esquerdo, muita parede branca em cima). O título 'Totem de mesa Pro' já está pronto no frame 0, sem nenhum movimento que prenda o olho. | correção sugerida: Nos frames 0 a 90, aplicar um push-in lento no vídeo dentro da moldura (scale de 1,0 para 1,12, ancorado no par rosto+totem) e traçar uma linha de cota ligando o título ao totem por volta do frame 20, sem mudar o texto. O frame 0 continua completo por causa da capa.
- [baixo] t=29s: Entre 29,0 e 29,4 s o rosto da apresentadora aparece como fantasma sob o desenho da planta final, que já começou a se traçar. São duas camadas sem hierarquia durante cerca de 0,4 s. | correção sugerida: Começar o traço da planta final só depois do fade do vídeo (por volta de 29,4 s), ou escurecer o vídeo até zero antes, entre 28,9 e 29,3 s.
- [baixo] t=21.4s: Na troca de cena pelo chicote, entre 'mesa.' e 'Ele é uma' (cerca de 21,3 a 21,7 s), e também perto de 17,2 s e 11,7 s, a barra de título some e o rótulo aparece pela metade ('PLANT'). São uns 0,3 s com o cabeçalho vazio. | correção sugerida: Fazer o título seguinte entrar sobrepondo a saída do anterior (crossfade de 6 frames), em vez de esvaziar e redigitar. O rótulo mono pode continuar sendo digitado.
- [baixo] t=0s: O true peak é de -0,3 dBTP. Vem do áudio original e não de erro da montagem: a diferença de áudio entre a prévia e o original fica em -64 dB, ou seja, o áudio está intacto. Mesmo assim, pode distorcer quando a plataforma recomprimir. | correção sugerida: Só na exportação final, aplicar um limitador true-peak em -1 dBTP (ffmpeg alimiter ou loudnorm com TP=-1), sem mexer na mixagem nem no loudness integrado.
- [baixo] t=26.98s: O título do CTA 'Quer isso no seu negócio?' segue a legenda queimada, mas o Whisper ouviu 'Quero isso'. Se a fala for 'Quero', o texto diverge do áudio. | correção sugerida: Ouvir 26,9 a 27,6 s e confirmar. Se a fala for 'Quero isso', trocar a palavra no título em V7.tsx, ou manter 'Quer isso', que é a forma do anunciante na legenda queimada.
- [baixo] t=0s: Os rótulos decorativos (PLANTA Nº, REV. 07, carimbo do rodapé) têm de 22 a 26 px, ilegíveis no celular, e o cabeçalho, em y≈238, fica fora da zona 4:5. São decorativos e seguem a referência do catálogo, então não há perda de informação. | correção sugerida: Opcional: subir o rótulo PLANTA Nº para 28-30 px. Nenhuma informação de oferta deve ficar nesses elementos.

## Correcao rodada 1 (r2) — feito
- Marca: "MIND GEEKS" -> "MAINDX" no carimbo (V7.tsx) e "Maindx" no comentario do Root.tsx. A fala NAO pronuncia a marca (conferido com faster-whisper large-v3-turbo no audio inteiro); no original a marca aparece so no display de LED do totem, rolando "MAINDX" em roxo (0-9,4 s).
- CTA: video apaga em 28,93-29,13 s e a planta final comeca em 29,17 s (END_T0); rotulos comprimidos: todos legiveis desde ~30,17 s (impressora termica) / 30,1 s (compacto) => >= 1,37 s antes do fim. Sem rosto fantasma (stills 866-880).
- DET. B: o plano da traseira (7,533-9,433 s) virou insert do proprio original (close frontal 12,77-14,43 s a 0,87x, mudo), com push-in e colchete blueprint + rotulo "IMPRESSORA" rastreando a saida do papel. Cartao B foi para o canto sup. esq. da moldura (nao cobre a mao em 9,4-11,6 s).
- Rotulos dentro dos cartoes (integrada, compacto, balcao/mesa) conferidos: >= 24 px de respiro.
- DET. C: fundo opaco, canto sup. esq., nao cobre mao/antebraco (stills 440/470/505).
- "Quer isso" confirmado (large-v3-turbo: Quer 27,06-27,26); titulo mantido.
- Stills em r2/.
## Pendente
- True peak -0,3 dBTP: aplicar limitador -1 dBTP so na exportacao final.

## Rodada 2 (ajuste pos-revisor, 11/11)
- Insert da impressora (V7.tsx PrinterInsert): ty = -92 - 192*u^2 (sobe devagar no inicio). A legenda queimada 'LED' do original nao entra mais na janela (conferido no Studio nos quadros 232, 240, 244, 247, 262, 278). Chip 'IMPRESSORA' passou para cima do colchete (embaixo ele encostava na borda da janela). Obs.: a sugestao do revisor (ty -160) piorava: subir o conteudo traz a legenda para dentro.
- Quadro 0 (capa): SheetFrame, WindowMarks e BackgroundDrawings ja saem completos.
- Nao feito: marca legivel no end card (pede aprovacao do usuario); true peak -1 dBTP (so na exportacao); 'Tchau' sobre a planta (mantido).
- Disco C: cheio (0 bytes livres) impediu `remotion still`; verificacao feita no Studio (porta 3010), sem PNG salvo em r2/.
