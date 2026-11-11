/**
 * APRESENTADORA (metodos: 06-recorte.md, 07-remover-legenda-queimada.md, 14-cenario-apresentadora.md).
 * <Presenter matte={matteJson} matteDir="x/matte" fromSec toSec liveSec? punches? darkenSec? person?
 *            behind={<texto atras/>} front? overlay? plateDir? plateSec? />
 *   = <BackdropInk> + <EditorialCard> + behind + <PersonCutout> + front, numa camera interna de socos.
 * Por fora: <PresenterCamera push={{in0,in1,out0,out1,amount}} punches={[{t,a,rot}]}>.
 * Dados: matte.json do scripts/recorte_rvm.py (firstFileTime, fps, count, w, h, sharpFrom, exposure).
 * Armadilhas: o indice do PNG vem do TEMPO DO ARQUIVO (fileOffsetSec se a cena nao usa o relogio do arquivo);
 * rim/ganho altos = "adesivo" e rosto ceroso (defaults: rim 0.16/0.12, maxGain 1.4); texto atras da pessoa
 * vai em `behind`, nunca por cima com mascara falsa.
 */
export { Presenter, PlateFrame, type PresenterProps } from "./Presenter";
export { PersonCutout, PERSON_LOOK_DEFAULT, type PersonCutoutProps, type PersonLook, type PersonEdge } from "./PersonCutout";
export {
  EditorialBackdrop,
  BackdropInk,
  EditorialCard,
  cardPath,
  CARD_DEFAULT,
  type BackdropInkProps,
  type EditorialCardProps,
  type CardShape,
} from "./EditorialBackdrop";
export { PresenterCamera, pushAt, type PresenterCameraProps, type CameraPush } from "./PresenterCamera";
export {
  matteIndexAt,
  sharpFileSec,
  exposureAt,
  paralaxe,
  punchAt,
  mix,
  rgba,
  tone,
  pad4,
  type MatteInfo,
  type Punch,
} from "./util";
