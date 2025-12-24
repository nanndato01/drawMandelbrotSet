import { useState } from "react";

import type Complex from "../types/Complex";
import SelectBox from "../components/SelectBox";
import Canvas from "../components/Canvas";

type ColorFunc = (iter: number, escaped: boolean, maxIter: number, lastZ: Complex) => string;

const canavsSize = [
    { name: "400*300", val: "400 300" },
    { name: "800*600", val: "800 600" },
    { name: "1200*900", val: "1200 900" }
];

const colorItem = [
    { name: "周期", val: "0" },
    { name: "カラー1", val: "1" },
    { name: "カラー2", val: "2" },
    { name: "モノクロ", val: "3" },
    { name: "なし", val: "4" }
]

const colorFuncs: ColorFunc[] = [
    (iter, escaped, _maxIter, lastZ) => {
        if (!escaped) return "black";

        const abs2 = lastZ.re * lastZ.re + lastZ.im * lastZ.im;

        const log_zn = 0.5 * Math.log(Math.max(abs2, Number.EPSILON));

        const nu = iter + 1 - Math.log(log_zn / Math.log(2)) / Math.log(2);

        const freq = 0.15;

        const r = Math.sin(2 * Math.PI * (freq * nu + 0.0)) * 0.5 + 0.5;
        const g = Math.sin(2 * Math.PI * (freq * nu + 0.33)) * 0.5 + 0.5;
        const b = Math.sin(2 * Math.PI * (freq * nu + 0.66)) * 0.5 + 0.5;

        return `rgb(
            ${Math.floor(r * 255)},
            ${Math.floor(g * 255)},
            ${Math.floor(b * 255)}
        )`;
    },
    (iter, escaped, maxIter, _lastZ) => {
        if (!escaped) return "black";

        const base = Math.log(iter + 1) / Math.log(maxIter + 1);
        const t = Math.pow(base, 2);

        const hue = 360 * t;
        const sat = 90;
        const light = 50;

        return `hsl(${hue}, ${sat}%, ${light}%)`;
    },
    (iter, escaped, maxIter, _lastZ) => {
        if (!escaped) return "black";

        const base = Math.log(iter + 1) / Math.log(maxIter + 1);
        const t = Math.pow(base, 0.7);

        const hue = 360 * (1 - t);
        const sat = 90;
        const light = 50;

        return `hsl(${hue}, ${sat}%, ${light}%)`;
    },
    (iter, escaped, maxIter, _lastZ) => {
        if (!escaped) return "black";

        const base = Math.log(iter + 1) / Math.log(maxIter + 1);
        const t = Math.pow(base, 1.5);

        const light = 50 + t * 50;
        return `hsl(0, 0%, ${light}%)`;
    },
    (_iter, escaped, _maxIter, _lastZ) => {
        return escaped ? "white" : "black";
    }
];

export default function Home() {
    const [canvasSizeSelected, setcanvasSizeSelected] = useState<string>(canavsSize[0].val);
    const [colorSelected, setColorSelected] = useState<string>(colorItem[0].val);
    const [scale, setScale] = useState<number>(100);
    const [maxIter, SetMaxIter] = useState<number>(100);

    const [canvasW, canvasH] = canvasSizeSelected.split(" ").map(Number);
    const colorNum = Number(colorSelected);
    const colorFunc = colorFuncs[colorNum];

    const handleMaxIter = (e: any) => {
        SetMaxIter(e.target.value);
    }

    const handleScale = (e: any) => {
        setScale(e.target.value);
    }

    return (
        <>
            <div className="flex justify-center">
                <label>
                    Canvas Size:
                    <SelectBox selects={canavsSize} value={canvasSizeSelected} onChange={setcanvasSizeSelected} />
                </label>
                <label>
                    Color:
                    <SelectBox selects={colorItem} value={colorSelected} onChange={setColorSelected} />
                </label>

                <label>
                    縮尺:
                    <input type="number" value={scale} onChange={handleScale} placeholder="scale"
                        className="border-2 my-1 mx-3"
                    />
                </label>
                <label>
                    最大計算回数:
                    <input type="number" value={maxIter} onChange={handleMaxIter} placeholder="maxIter"
                        className="border-2 my-1 mx-3"
                    />
                </label>
            </div>

            {((scale > 1000) || (maxIter > 1000)) &&
                <div className="text-center">
                    <p className="text-red-500">注意：縮尺と最大計算回数はどちらも増やせば増やすほど処理が重くなります。</p>
                    <p className="text-red-500">どちらも1000ぐらいを限界として調整して下さい。</p>
                </div>
            }

            <div>
                <Canvas canvasW={canvasW} canvasH={canvasH} scale={scale} maxIter={maxIter} colorFunc={colorFunc} />
            </div>
        </>
    );
};