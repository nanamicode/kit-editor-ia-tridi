// "A Sacola Lisa" (sem narracao) — mapa de tempo em frames (30 fps). Rodada 3.
// Trilha com trimBefore = MUSIC_TRIM frames: as batidas caem em
//   batida(k) = round((0.059 + k*0.61861) * 30 - MUSIC_TRIM)
// Com MUSIC_TRIM = 54 o tempo forte k=16 cai no frame 245 (TUM, 8,2 s); k=20 -> 319 (prova).
// Leitura minima por tela: 0,25 s/palavra + 0,4 s (conferido abaixo, em frames).
export const FPS = 30;
export const MUSIC_TRIM = 54;
export const batida = (k: number) => Math.round((0.059 + k * 0.61861) * 30 - MUSIC_TRIM);

export const T = {
  queda: 8, // contato da sacola com o balcao
  espreitaSai: 54, // carimbo roxo espreita desde o frame 0 (ponto saturado) e sai por cima
  levei: 57, // POV: SOU SUA SACOLA / SEM LOGO. (6) 0-57 = 1,90 s (min 1,90)
  brig: [58, 71, 84] as const, // brigadeiros aparecem (pairam 8 q, caem 7 q)
  onde: 99, // LEVEI O MELHOR BRIGADEIRO (4) 57-99 = 1,40 s (min 1,40)
  lisa: 141, // cliente: é de onde?? (4) 99-141 = 1,40 s (min 1,40)
  ninguem: 175, // E EU… LISA. (3) 141-175 = 1,13 s; silencio 141-153
  ateQue: 217, // NINGUÉM LEMBROU DE MIM. (4) 175-217 = 1,40 s (min 1,40)
  silencio: 235, // 0,33 s sem trilha antes do TUM
  tum: 245, // ATÉ QUE… (2) 217-245 = 0,93 s (min 0,90)
  carimbada: 254,
  agora: 276, // CARIMBADA. (1) 254-276 = 0,73 s (min 0,65)
  prova: 319, // AGORA EU TENHO NOME. (4) 276-319 = 1,43 s (min 1,40)
  borracha: 325,
  gravada: 345, // BORRACHA SÓLIDA + GRAVADA A LASER (5) 325-388 = 2,1 s (min 1,65)
  grade: 388,
  celulas: [388, 395, 402] as const, // 1o cartao entra junto com o titulo (sem quadro vazio)
  logo: 470, // SERVE EM QUALQUER EMBALAGEM. (4) + 3 fotos: 388-470 = 2,73 s
  criam: 506, // NÃO TEM LOGO? (3) 470-506 = 1,20 s (min 1,15)
  cta: 549, // A TRIDI CRIA. VOCÊ APROVA. (5) 506-549 = 1,43 s (min 1,40 p/ 4 palavras uteis)
} as const;
// CTA: CARIMBOS TRIDI + VEJA O PREÇO DA SUA + TOQUE EM SAIBA MAIS (11) -> min 3,15 s = 95 q
export const DUR = T.cta + 95; // 644 q = 21,5 s, sem fade (loop)

// ponto de impacto (centro do logo na sacola em tamanho cheio)
export const IMPACTO = { x: 573, y: 1295 };
export const REVELA_DUR = 10;
