// (centerX, centerY)を原点としたときの複素数を返す
// [scale]pxを1とする

import type PixelPos from "../types/PixelPos";
import type Complex from "../types/Complex";

export function PosToComplex(pointerPos: PixelPos, scale: number, centerX: number, centerY: number): Complex {
    const xp = pointerPos.x - centerX;
    const yp = -(pointerPos.y - centerY);

    return { re: xp / scale, im: yp / scale };
};