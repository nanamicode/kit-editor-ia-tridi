/** Tons DERIVADOS da marca (documentados): alfa e mistura com branco. Sem hex solto. */
const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

/** cor da marca com opacidade */
export const alpha = (hex: string, a: number) => {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

/** mistura com branco (k = 0 cor pura, 1 branco) -> clarão do flash, luz do relevo */
export const tint = (hex: string, k: number) => {
  const [r, g, b] = rgb(hex).map((c) => Math.round(c + (255 - c) * k));
  return `rgb(${r},${g},${b})`;
};
