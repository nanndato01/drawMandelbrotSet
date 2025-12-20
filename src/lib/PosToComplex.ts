// (centerX, centerY)を原点としたときの複素数を返す
// [scale]pxを1とする

import type PointerPos from "../types/PointerPos";
import type Complex from "../types/Complex";

export function PosToComplex(pointerPos: PointerPos, scale: number, centerX: number, centerY: number): Complex {
    const xp = pointerPos.x - centerX;
    const yp = -(pointerPos.y - centerY);

    return {re: xp / scale, im: yp / scale};
};