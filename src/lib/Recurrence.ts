//

import type Complex from "../types/Complex";

interface EscapeResult{
    iter: number;
    escaped: boolean;
    results: Complex[];
};

export function Recurrence(c: Complex, maxIter: number): EscapeResult {
    let z: Complex = {re: 0, im: 0};
    let n = 0;
    const results: Complex[] = [z];
    while(n < maxIter){
        const re2 = z.re * z.re;
        const im2 = z.im * z.im;

        if(re2 + im2 > 4){
            const mag = Math.sqrt(re2 + im2);
            const val = n + 1 - Math.log(Math.log(mag)) / Math.log(2);
            return {iter: val, escaped: true, results: results};
        }

        z = {re: re2 - im2 + c.re, im: 2 * z.re * z.im + c.im};
        results.push(z);
        n++;
    }

    return {iter: maxIter, escaped: false, results: results};
}