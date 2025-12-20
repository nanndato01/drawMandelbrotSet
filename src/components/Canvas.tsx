import { useEffect, useRef, useState } from "react";

import type PointerPos from "../types/PointerPos";
import type Complex from "../types/Complex";
import { PosToComplex } from "../lib/PosToComplex";
import { ComplexToPos } from "../lib/ComplexToPos";
import { Recurrence } from "../lib/Recurrence";

interface Props{
    canvasW: number;
    canvasH: number;
    scale: number;
    maxIter: number;
    colorFunc: (
        iter: number,
        escaped: boolean,
        maxIter: number
    ) => string;
}

export default function Canvas({ canvasW, canvasH, scale, maxIter, colorFunc }: Props) {
    const BaseCanvasRef = useRef<HTMLCanvasElement>(null);
    const AxisCanvasRef = useRef<HTMLCanvasElement>(null);
    const OrbitCanvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState<PointerPos>({ x: 0, y: 0 });
    const [centerMousePos, setCenterMousePos] = useState<PointerPos>({x: canvasW / 2, y: canvasH / 2});
    const [isCanvsClick, setIsCanvasClick] = useState<boolean>(false);
    const [isAdjustingOrigin, setIsAdjustingOrigin] = useState<boolean>(false);
    const [isAxisVisible, setIsAxisVisible] = useState<boolean>(false);
    const [isBaseDrawn, setIsBaseDrawn] = useState<boolean>(false);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);
    const abortRef = useRef<AbortController | null>(null);


    const centerX = centerMousePos.x;
    const centerY = centerMousePos.y;

    const c: Complex = PosToComplex(mousePos, scale, centerX, centerY);
    const res = Recurrence(c, maxIter);

    const handleClick = () => {
        if(isAdjustingOrigin){
            setCenterMousePos(mousePos);
            handleCenter();
            return;
        }
        setIsCanvasClick((clicked) => !clicked);
        if(!OrbitCanvasRef.current)return;
        const ctx = OrbitCanvasRef.current.getContext("2d");
        if(!ctx)return;
        ctx.clearRect(0, 0, canvasW, canvasH);
    };

    const handleCenter = () => {
        setIsAdjustingOrigin((centerd) => !centerd);
        setIsAxisVisible(true);
    }

    const handleAxisVisible = () => {

        if(!AxisCanvasRef.current)return;
        const ctx = AxisCanvasRef.current.getContext("2d");
        if(!ctx)return;

        if(!isAxisVisible)drawAxis(centerMousePos);
        else ctx.clearRect(0, 0, canvasW, canvasH);
        setIsAxisVisible(prev => !prev);
    }

    const onMouseMove = (e: React.MouseEvent) => {
        if(!OrbitCanvasRef.current)return;
        const rect = OrbitCanvasRef.current.getBoundingClientRect();
        const pos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
        setMousePos(pos);
        if(isAdjustingOrigin && isAxisVisible)drawAxis(pos);
        if(isCanvsClick)drawOrbit();
    };

    const drawBase = async () => {
        if(!BaseCanvasRef.current)return;

        const ctx = BaseCanvasRef.current.getContext("2d");
        if (!ctx) return;

        setIsDrawing(true);
        setIsBaseDrawn(false);
        setProgress(0);
        const abortController = new AbortController();
        abortRef.current = abortController;

        await new Promise(requestAnimationFrame);

        for(let y = 0; y < canvasH; y++){
            if(abortController.signal.aborted){
                setIsDrawing(false);
                return;
            }
            for(let x = 0; x < canvasW; x++){
                const c = PosToComplex({ x, y }, scale, centerX, centerY);
                const { iter, escaped } = Recurrence(c, maxIter);
                ctx.fillStyle = colorFunc(iter, escaped, maxIter);
                ctx.fillRect(x, y, 1, 1);
            }
            setProgress(Math.floor((y / canvasH) * 100));
            await new Promise(requestAnimationFrame);
        }
        setProgress(100);
        setIsDrawing(false);
        setIsBaseDrawn(true);
    };

    const cancelDraw = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        if(!BaseCanvasRef.current)return;
        const ctx = BaseCanvasRef.current.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasW, canvasH);
        setIsBaseDrawn(false);
    };


    const drawAxis = (pos: PointerPos) => {
        if(!AxisCanvasRef.current)return;

        const ctx = AxisCanvasRef.current.getContext("2d");
        if(!ctx)return;
        ctx.clearRect(0, 0, canvasW, canvasH);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pos.x + 2, 0);
        ctx.lineTo(pos.x + 2, canvasH);
        ctx.moveTo(0, pos.y + 2);
        ctx.lineTo(canvasW, pos.y + 2);
        ctx.stroke();
    }

    const drawOrbit = () => {
        if(!OrbitCanvasRef.current)return;

        const ctx = OrbitCanvasRef.current.getContext("2d");
        if(!ctx)return;
        ctx.clearRect(0, 0, canvasW, canvasH);

        for (const z of res.results) {
            const p = ComplexToPos(z, scale, centerX, centerY);

            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(p.x + 1, p.y + 1, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(p.x + 1, p.y + 1, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const reset = () => {
        if (!BaseCanvasRef.current || !OrbitCanvasRef.current) return;
        const baseCtx = BaseCanvasRef.current.getContext("2d");
        const orbitCtx = OrbitCanvasRef.current.getContext("2d");
        if (!baseCtx || !orbitCtx) return;
        baseCtx.clearRect(0, 0, canvasW, canvasH);
        orbitCtx.clearRect(0, 0, canvasW, canvasH);
        setIsBaseDrawn(false);
        setIsCanvasClick(false);
    };

    const resetAxis = () => {
        const p: PointerPos = {x: canvasW / 2, y: canvasH / 2};
        setCenterMousePos(p);
        if(isAxisVisible)drawAxis(p);
    }

    useEffect(() => {
        resetAxis();
    }, [canvasW, canvasH]);

    return (
        <>
            <div className="flex justify-center">
                {!isBaseDrawn && !isDrawing &&
                    <button onClick={drawBase} disabled={isAdjustingOrigin}
                        className="border-2 rounded-xl p-1 m-1 disabled:bg-gray-300"
                    >描画開始</button>
                }
                {isDrawing &&
                    <>
                        <button disabled className="border-2 rounded-xl p-1 m-1">
                            描画中... {progress}%
                        </button>
                        <button onClick={cancelDraw}
                            className="border-2 rounded-xl p-1 m-1"
                        >キャンセル</button>
                    </>
                }
                {isBaseDrawn && !isDrawing && (
                    <button onClick={reset}
                        className="border-2 rounded-xl p-1 m-1"
                    >リセット</button>
                )}
                <button onClick={handleCenter} disabled={isBaseDrawn || isDrawing}
                    className="border-2 rounded-xl p-1 m-1 disabled:bg-gray-300"
                >{isAdjustingOrigin ? "原点調整中" : "原点調整"}</button>
                <button onClick={handleAxisVisible}
                    className="border-2 rounded-xl p-1 m-1"
                >{isAxisVisible ? "原点非表示" : "原点表示"}</button>
                <button onClick={resetAxis} disabled={isBaseDrawn || isDrawing}
                    className="border-2 rounded-xl p-1 m-1 disabled:bg-gray-300"
                >原点リセット</button>
            </div>

            <div>
                <div className="relative p-3" onClick={handleClick}>
                    <canvas ref={BaseCanvasRef} width={canvasW} height={canvasH}
                        className="absolute left-1/2 -translate-x-1/2 border-2"
                    />
                    <canvas ref={AxisCanvasRef} width={canvasW} height={canvasH}
                        className="absolute left-1/2 -translate-x-1/2"
                    />
                    <canvas ref={OrbitCanvasRef} width={canvasW} height={canvasH} onMouseMove={onMouseMove}
                        className="absolute left-1/2 -translate-x-1/2"
                    />
                </div>
            </div>
        </>
    );
}