import { Recurrence } from "./Recurrence";
import { PosToComplex } from "./PosToComplex";

interface Item{
    iter: number;
    escaped: boolean;
}

export function RecAllPixels(width: number, height: number, scale: number, centerX: number, centerY: number, maxIter: number): Item[] {
    const results: Item[] = [];
    for(let x = 0; x < width; ++x)for(let y = 0; y < height; ++y){
        const c = PosToComplex({x: x, y: y}, scale, centerX, centerY);
        const res = Recurrence(c, maxIter);
        results.push({iter: res.iter, escaped: res.escaped});
    }
    return results;
}