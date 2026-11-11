// Padrao visual "Tridi Impresso" (separado dos dados da oferta, para reuso).
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { staticFile } from "remotion";

export const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const inter = loadInter("normal", { weights: ["600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const COR = {
  roxo: "#8B00FF",
  sombra: "#3A0A6B",
  lilas: "#B48CFF",
  branco: "#FFFFFF",
  papel: "#EAE6DE",
  tintaPreta: "#231F1C",
  cinzaTinta: "#2A2A2A",
} as const;

export const BORDA_RECORTE = 12; // px, borda branca de colagem

export const TEX = {
  kraftTile: staticFile("tridi/tex/kraft_tile_1024.png"),
  kraftFull: staticFile("tridi/tex/kraft_1080x1920.png"),
  papelFundo: staticFile("tridi/tex/papel_fundo_1080x1920.png"),
  papelTile: staticFile("tridi/tex/papel_fundo_tile_1024.png"),
  tinta: staticFile("tridi/tex/tinta_mascara_tile_1024.png"),
  reticula: staticFile("tridi/tex/reticula_tile_256.png"),
  reticulaGrossa: staticFile("tridi/tex/reticula_grossa_tile_256.png"),
  reticulaGradiente: staticFile("tridi/tex/reticula_gradiente_1080x1920.png"),
  grao: staticFile("tridi/tex/grao_tile_512.png"),
  tarja: staticFile("tridi/tex/tarja_rasgada_preta.png"),
} as const;

// Duotone risografia: luminancia -> sombra #3A0A6B (0) -> lilas #B48CFF (0.45) -> branco (1)
// (kraft medio vira lilas claro, para a borda branca do recorte continuar destacada)
export const RISO_TABLE = {
  r: "0.227 0.494 0.737 0.902 1",
  g: "0.039 0.322 0.600 0.851 1",
  b: "0.420 0.741 1 1 1",
};
// Mundo sem marca: cinza de impressao (preto nunca chapado, branco nunca puro)
export const CINZA_TABLE = "0.10 0.34 0.62 0.86 0.93";
