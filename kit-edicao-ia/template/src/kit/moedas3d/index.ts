/**
 * moedas3d — moedas/selos 3D flutuando com paralaxe (atras e a frente da pessoa recortada).
 *
 * <FloatingCoins layer="back"  fromSec={7.95} toSec={12.07} parallaxOriginSec={7.8} />   (antes do recorte)
 * <FloatingCoins layer="front" fromSec={8.7}  toSec={12.07} parallaxOriginSec={7.8} />   (depois do recorte)
 * coins: [{ x, y (px do centro), size (diametro px), depth (-3.2..1.8; negativo = atras), delaySec,
 *           pops?: s absolutos, tiltX?, swing?, period?, phase?, bob?, leave?: {t0,t1,to:[x,y]} }]
 * Sem `coins`, usa V02_COINS_BACK / V02_COINS_FRONT. Cor/ícone/brilho: color, tint, light, envIntensity,
 * heat, heatMax, icon. Armadilhas: --gl=angle; cada camada e um ThreeCanvas (2 canvases = 2x custo);
 * moedas grandes (size > 400) perto da borda cortam: mantenha o centro dentro de SAFE.
 */
export { FloatingCoins, StampWave, V02_COINS_BACK, V02_COINS_FRONT, type Coin, type FloatingCoinsProps, type StampSpec } from "./FloatingCoins";
