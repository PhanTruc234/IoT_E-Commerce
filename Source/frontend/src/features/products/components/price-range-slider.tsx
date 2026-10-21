'use client';
import { useState } from 'react';
import { formatVnd } from '@/shared/lib/format';

/** Bước kéo tròn số theo độ rộng khoảng giá (≈ 100 nấc) */
function stepFor(span: number) {
    const raw = span / 100;
    const pow = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
    return [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? pow * 10;
}

/**
 * Thanh kéo giá hai đầu, không ô nhập, không nút "Áp dụng": thả chuột / nhả phím là lọc ngay.
 * Hai đầu mút là giá thấp nhất và cao nhất của các SP đang hiển thị (theo danh mục / từ khoá).
 * Kéo về sát đầu mút = bỏ lọc phía đó. Khởi tạo lại bằng `key` khi khoảng giá hoặc bộ lọc thay đổi.
 */
export function PriceRangeSlider({
    min,
    max,
    value,
    onCommit,
}: {
    min: number;
    max: number;
    value: { min?: number; max?: number };
    onCommit: (v: { min?: number; max?: number }) => void;
}) {
    const step = stepFor(max - min);
    const clamp = (n: number) => Math.min(max, Math.max(min, n));
    // Thanh chia đều 100 nấc để luôn kéo chạm được hai đầu mút; giá hiển thị làm tròn theo `step`
    const notch = (max - min) / 100;
    const snap = (n: number) => (n >= max ? max : n <= min ? min : clamp(Math.round(n / step) * step));
    const [lo, setLo] = useState(clamp(value.min ?? min));
    const [hi, setHi] = useState(clamp(value.max ?? max));

    if (max <= min) {
        return <p className="text-xs text-gray-500">Các sản phẩm đang hiển thị cùng giá {formatVnd(min)}.</p>;
    }

    const pct = (n: number) => ((n - min) / (max - min)) * 100;
    const commit = () => onCommit({ min: lo > min ? lo : undefined, max: hi < max ? hi : undefined });
    const thumb = 'pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent outline-none '
        + '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab '
        + '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 '
        + '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow '
        + '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab '
        + '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:bg-white';
    const commitEvents = { onPointerUp: commit, onKeyUp: commit, onTouchEnd: commit };

    return (
        <div className="px-2 pt-7">
            <div className="relative h-5">
                {/* Giá hiện ngay trên hai đầu kéo; nhãn dịch theo vị trí để không tràn khỏi khung ở hai mép */}
                <span className="absolute -top-6 whitespace-nowrap text-[11px] font-semibold text-blue-700" style={{ left: `${pct(lo)}%`, transform: `translateX(-${pct(lo)}%)` }}>{formatVnd(lo)}</span>
                <span className="absolute -top-6 whitespace-nowrap text-[11px] font-semibold text-blue-700" style={{ left: `${pct(hi)}%`, transform: `translateX(-${pct(hi)}%)` }}>{formatVnd(hi)}</span>
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
                <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-600" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
                <input
                    type="range" min={min} max={max} step={notch} value={lo} aria-label="Giá thấp nhất"
                    onChange={(e) => setLo(Math.min(snap(Number(e.target.value)), hi))}
                    {...commitEvents}
                    className={`${thumb} ${lo >= hi - notch ? 'z-20' : 'z-10'}`}
                />
                <input
                    type="range" min={min} max={max} step={notch} value={hi} aria-label="Giá cao nhất"
                    onChange={(e) => setHi(Math.max(snap(Number(e.target.value)), lo))}
                    {...commitEvents}
                    className={`${thumb} z-10`}
                />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-gray-400">
                <span>{formatVnd(min)}</span>
                <span>{formatVnd(max)}</span>
            </div>
        </div>
    );
}
