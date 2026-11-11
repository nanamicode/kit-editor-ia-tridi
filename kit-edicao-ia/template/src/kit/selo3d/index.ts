/**
 * selo3d — transicao-estrela com selo metalico 3D (Remotion + @remotion/three, sem useFrame).
 *
 * <SealTransition atSec={7.71} />  overlay transparente POR CIMA das duas cenas. atSec = instante em que o
 *   selo cobre 100% do quadro. Janela = atSec-0.46 .. atSec+0.44 (x durationScale). Troque a cena de baixo
 *   entre sealWindows(atSec).coverFromSec e coverToSec (atSec .. atSec+0.12).
 * Props: durationScale, color, tint, brightness, flash, heatMax, relief, icon, restPx, from, dim,
 *   crackStyle, faceSafe, shadows (ver SealTransition.tsx).
 * Utilitarios: GoldSeal + SealLights (selo 3D avulso dentro de qualquer ThreeCanvas), goldTones(accent),
 *   sealGeometry (getSealPieces, getSealCore(icon), getSealChunks, getSealSeams, svgPathToShapes).
 * Armadilhas: render com --gl=angle (sem GPU, ~5-10 s por quadro com o selo); ThreeCanvas sempre com
 *   width/height; o 1o quadro de cada aba gera PMREM + geometria (mais lento).
 */
export { SealTransition, sealWindows, type SealTransitionProps } from "./SealTransition";
export { GoldSeal, SealLights, goldTones, makeSealEnvironment, useSealEnvMap, type GoldSealProps, type GoldTones } from "./GoldSeal";
export { sealTimeline, sealState, SEAL_OFFSETS, V02_REST, type SealTimeline, type SealState, type SealRest } from "./timeline";
export * as sealGeometry from "./sealGeometry";
export { DEFAULT_ICON, type SealIcon } from "./sealGeometry";
