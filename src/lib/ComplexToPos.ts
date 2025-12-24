// (centerX, centerY)を原点としたときの複素数を変換する
// [scale]pxを1とする

import type PixelPos from "../types/PixelPos";
import type Complex from "../types/Complex";

export function ComplexToPos(complex: Complex, scale: number, centerX: number, centerY: number): PixelPos {
    return { x: centerX + complex.re * scale, y: centerY - (complex.im * scale) };
};