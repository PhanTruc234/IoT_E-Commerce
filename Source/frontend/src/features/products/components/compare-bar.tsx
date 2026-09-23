'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitCompareArrows } from 'lucide-react';
import { useCompareStore } from '../store/compare.store';

export function CompareBar() {
    const { items, clear } = useCompareStore();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted || items.length === 0) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <GitCompareArrows className="h-5 w-5 text-blue-600" />
                    <span>Đang chọn <b>{items.length}</b> sản phẩm (cùng danh mục) để so sánh</span>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={clear} className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-red-600">Xoá</button>
                    <Link
                        href="/compare"
                        aria-disabled={items.length < 2}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${items.length < 2 ? 'pointer-events-none bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        So sánh ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}