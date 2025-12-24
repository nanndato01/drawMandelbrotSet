// (a, b)~(c, d)->(0, 0)~(W, H)に縮小したときの位置

import type PixelPos from "../types/PixelPos";

export function ZoomToNormal(pos: PixelPos, canvasW: number, canvasH: number, SP: PixelPos, EP: PixelPos): PixelPos {
    const minX = Math.min(SP.x, EP.x);
    const maxX = Math.max(SP.x, EP.x);
    const minY = Math.min(SP.y, EP.y);
    const maxY = Math.max(SP.y, EP.y);

    return {
        x: minX + pos.x * ((maxX - minX) / canvasW),
        y: minY + pos.y * ((maxY - minY) / canvasH),
    };
};