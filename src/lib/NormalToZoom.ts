// (0, 0)~(W, H)->(a, b)~(c, d)に拡大したときの位置

import type PixelPos from "../types/PixelPos";

export function NormalToZoom(pos: PixelPos, canvasW: number, canvasH: number, SP: PixelPos, EP: PixelPos): PixelPos {
    const minX = Math.min(SP.x, EP.x);
    const maxX = Math.max(SP.x, EP.x);
    const minY = Math.min(SP.y, EP.y);
    const maxY = Math.max(SP.y, EP.y);

    return {
        x: (pos.x - minX) * (canvasW / (maxX - minX)),
        y: (pos.y - minY) * (canvasH / (maxY - minY)),
    };
};