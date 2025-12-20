import { Link, useLocation } from "react-router-dom";

export default function Header() {
    const location = useLocation();
    const isRoot = location.pathname === "/";

    return (
        <div className="text-center border-b-2 mb-2 p-3">
            <h1 className="text-3xl m-3 font-bold">マンデルブロ集合描画ツール</h1>
            <p>マンデルブロ集合を描画します</p>

            <div className="mt-3">
                {isRoot ? (
                    <Link to="/info" className="underline">ツールについて</Link>
                ) : (
                    <Link to="/" className="underline">描画画面に戻る</Link>
                )}
            </div>
        </div>
    )
}