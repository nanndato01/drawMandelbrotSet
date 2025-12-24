import { useRef, useState } from "react";

import type PixelPos from "../types/PixelPos";
import type Complex from "../types/Complex";

import { PosToComplex } from "../lib/PosToComplex";
import { ComplexToPos } from "../lib/ComplexToPos";
import { NormalToZoom } from "../lib/NormalToZoom";
import { ZoomToNormal } from "../lib/ZoomToNormal";
import { Recurrence } from "../lib/Recurrence";

interface Props {
    canvasW: number;
    canvasH: number;
    scale: number;
    maxIter: number;
    colorFunc: (
        iter: number,
        escaped: boolean,
        maxiter: number,
        lastZ: Complex
    ) => string;
}

type ZoomPhase = "idle" | "selecting";

export default function Canvas({ canvasW, canvasH, scale, maxIter, colorFunc }: Props) {
    const mousePosRef = useRef<PixelPos>({ x: 0, y: 0 });
    const startZoomMousePosRef = useRef<PixelPos>({ x: 0, y: 0 });
    const endZoomMousePosRef = useRef<PixelPos>({ x: canvasW, y: canvasH });
    const startZoomClickMousePosRef = useRef<PixelPos>({ x: 0, y: 0 });

    const baseCanvasRef = useRef<HTMLCanvasElement>(null);
    const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
    const zoomCanvasRef = useRef<HTMLCanvasElement>(null);

    const [isZooming, setIsZooming] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isBaseDrawn, setIsBaseDrawn] = useState(false);
    const [isCanvasClick, setIsCanvasClick] = useState(false);

    const [zoomPhase, setZoomPhase] = useState<ZoomPhase>("idle");
    const [progress, setProgress] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    const centerX = canvasW * (3 / 4);
    const centerY = canvasH / 2;

    const getCtx = (canvasRef: React.RefObject<HTMLCanvasElement | null>): CanvasRenderingContext2D | null => {
        return canvasRef.current?.getContext("2d") ?? null;
    };

    const posToEndPos = (s: PixelPos, p: PixelPos): PixelPos => {
        const dx = p.x - s.x;
        const dy = dx * canvasH / canvasW;
        return { x: p.x, y: s.y + dy };
    };

    const handleClickCanvas = () => {
        if (isDrawing) return;

        const orbitCtx = getCtx(orbitCanvasRef);
        if (!orbitCtx) return;
        orbitCtx.clearRect(0, 0, canvasW, canvasH);
        setIsCanvasClick(prev => !prev);

        if (isZooming) {
            if (zoomPhase === "idle") {
                startZoomMousePosRef.current = ZoomToNormal(mousePosRef.current, canvasW, canvasH, startZoomMousePosRef.current, endZoomMousePosRef.current);
                startZoomClickMousePosRef.current = mousePosRef.current;
                setZoomPhase("selecting");
            } else if (zoomPhase === "selecting") {
                endZoomMousePosRef.current = ZoomToNormal(posToEndPos(startZoomClickMousePosRef.current, mousePosRef.current), canvasW, canvasH, startZoomMousePosRef.current, endZoomMousePosRef.current);
                setIsZooming(false);
                setZoomPhase("idle");
                drawBase();
            }
        }
    };

    const handleClickZoom = () => {
        setIsZooming(prev => !prev);
        setZoomPhase("idle");
        setIsCanvasClick(false);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!zoomCanvasRef.current) return;
        const rect = zoomCanvasRef.current.getBoundingClientRect();
        const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        mousePosRef.current = pos;

        const zoomCtx = getCtx(zoomCanvasRef);
        if (!zoomCtx) return;
        zoomCtx.clearRect(0, 0, canvasW, canvasH);

        if (isCanvasClick && !isZooming && !isDrawing) drawOrbit(pos);
        if (isZooming && zoomPhase === "selecting") drawZoom(pos, startZoomClickMousePosRef.current);
    };

    const drawBase = async () => {
        const ctx = getCtx(baseCanvasRef);
        if (!ctx) return;

        setIsDrawing(true);
        setIsBaseDrawn(false);
        setIsCanvasClick(false);
        setProgress(0);
        const abortController = new AbortController();
        abortRef.current = abortController;

        await new Promise(requestAnimationFrame);

        for (let y = 0; y < canvasH; y++) {
            if (abortController.signal.aborted) {
                setIsDrawing(false);
                return;
            }
            for (let x = 0; x < canvasW; x++) {
                const p = ZoomToNormal({ x, y }, canvasW, canvasH, startZoomMousePosRef.current, endZoomMousePosRef.current);
                const c = PosToComplex(p, scale, centerX, centerY);
                const { iter, escaped, results } = Recurrence(c, maxIter);
                ctx.fillStyle = colorFunc(iter, escaped, maxIter, results.slice(-1)[0]);
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
        const ctx = getCtx(baseCanvasRef);
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasW, canvasH);
        setIsBaseDrawn(false);
        startZoomMousePosRef.current = { x: 0, y: 0 };
        endZoomMousePosRef.current = { x: canvasW, y: canvasH };
    };

    const drawOrbit = (pos: PixelPos) => {
        const ctx = getCtx(orbitCanvasRef);
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasW, canvasH);

        const c = PosToComplex(ZoomToNormal(pos, canvasW, canvasH, startZoomMousePosRef.current, endZoomMousePosRef.current), scale, centerX, centerY);
        const res = Recurrence(c, maxIter);

        for (const z of res.results) {
            const p = NormalToZoom(ComplexToPos(z, scale, centerX, centerY), canvasW, canvasH, startZoomMousePosRef.current, endZoomMousePosRef.current);

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

    const drawZoom = (mousePos: PixelPos, sPos: PixelPos) => {
        const ctx = getCtx(zoomCanvasRef);
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasW, canvasH);

        const sx = sPos.x;
        const sy = sPos.y;
        const p = posToEndPos(sPos, mousePos);
        const ex = p.x;
        const ey = p.y;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, sy);
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, ey);
        ctx.moveTo(ex, sy);
        ctx.lineTo(ex, ey);
        ctx.moveTo(sx, ey);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    };

    const reset = () => {
        const baseCtx = getCtx(baseCanvasRef);
        const orbitCtx = getCtx(orbitCanvasRef);
        if (!baseCtx || !orbitCtx) return;
        baseCtx.clearRect(0, 0, canvasW, canvasH);
        orbitCtx.clearRect(0, 0, canvasW, canvasH);
        setIsBaseDrawn(false);
        setIsCanvasClick(false);
        setIsZooming(false);
        startZoomMousePosRef.current = { x: 0, y: 0 };
        endZoomMousePosRef.current = { x: canvasW, y: canvasH };
    };

    return (
        <>
            <div className="flex justify-center">
                {!isBaseDrawn && !isDrawing &&
                    <button onClick={drawBase} disabled={isZooming}
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
                {isBaseDrawn && !isDrawing && (
                    <button onClick={handleClickZoom}
                        className="border-2 rounded-xl p-1 m-1 disabled:bg-gray-300"
                    >{isZooming ? "部分拡大中" : "部分拡大"}</button>
                )}
            </div>
            <div>
                <div className="relative p-3" onClick={handleClickCanvas}>
                    <canvas ref={baseCanvasRef} width={canvasW} height={canvasH}
                        className="absolute left-1/2 -translate-x-1/2 border-2"
                    />
                    <canvas ref={orbitCanvasRef} width={canvasW} height={canvasH}
                        className="absolute left-1/2 -translate-x-1/2"
                    />
                    <canvas ref={zoomCanvasRef} width={canvasW} height={canvasH} onMouseMove={onMouseMove}
                        className="absolute left-1/2 -translate-x-1/2"
                    />
                </div>
            </div>
        </>
    );
}