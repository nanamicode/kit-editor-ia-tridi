// "A Sacola Lisa" (sem narracao) — mapa de tempo em frames (30 fps). Rodada 2.
// Trilha com trimBefore = MUSIC_TRIM frames: as batidas caem em
//   batida(k) = round((0.059 + k*0.61861) * 30 - MUSIC_TRIM)
// Com MUSIC_TRIM = 17 o tempo forte k=16 cai no frame 282 (TUM); k=20 -> 356 (prova).
// Leitura minima por tela: 0,25 s/palavra + 0,4 s (conferido abaixo, em frames).
export const FPS = 30;
export const MUSIC_TRIM = 17;
export const batida = (k: number) => Math.round((0.059 + k * 0.61861) * 30 - MUSIC_TRIM);

export const T = {
  queda: 8, // contato da sacola com o balcao
  espreitaSai: 40, // carimbo roxo que espreita desde o frame 0 sai por cima
  levei: 57, // POV (6 palavras) 0-57 = 1,90 s (min 1,90)
  brig: [58, 71, 84] as const, // brigadeiros aparecem (pairam 8 q, caem 7 q)
  amou: 99, // LEVEI O MELHOR BRIGADEIRO (4) 57-99 = 1,40 s (min 1,40)
  onde: 134, // O CLIENTE AMOU (3) 99-134 = 1,17 s (min 1,15)
  lisa: 176, // cliente: é de onde?? (4) 134-176 = 1,40 s (min 1,40)
  ninguem: 211, // E EU… LISA. (3) 176-211 = 1,17 s (min 1,15); silencio 176-188
  ateQue: 254, // NINGUÉM LEMBROU DE MIM. (4) 211-254 = 1,43 s (min 1,40)
  silencio: 272, // 0,33 s sem trilha antes do TUM
  tum: 282, // ATÉ QUE… (2) 254-282 = 0,93 s (min 0,90)
  carimbada: 291,
  agora: 313, // CARIMBADA. (1) 291-313 = 0,73 s (min 0,65)
  prova: 356, // AGORA EU TENHO NOME. (4) 313-356 = 1,43 s (min 1,40)
  borracha: 364,
  gravada: 386, // BORRACHA SÓLIDA + GRAVADA A LASER (5) 364-425 = 2,03 s (min 1,65)
  grade: 425,
  celulas: [430, 444, 458] as const, // cartoes pousam ate 468; grade completa 468-513 = 1,50 s
  logo: 513, // titulo + 3 rotulos (9) 425-513 = 2,93 s (min 2,65)
  criam: 549, // NÃO TEM LOGO? (3) 513-549 = 1,20 s (min 1,15)
  cta: 577, // ELES CRIAM. (2) 549-577 = 0,93 s (min 0,90)
} as const;
// CTA: CARIMBOS TRIDI + veja quanto custa a sua + TOQUE EM SAIBA MAIS (11) -> min 3,15 s = 95 q
export const DUR = T.cta + 95; // 672 q = 22,4 s, sem fade (loop)

// ponto de impacto (centro do logo na sacola em tamanho cheio)
export const IMPACTO = { x: 489, y: 1258 };
export const REVELA_DUR = 10;
