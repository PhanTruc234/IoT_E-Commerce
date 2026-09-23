'use client';
import { useEffect, useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { useCompareStore } from '../store/compare.store';

export function CompareButton({ productId, categoryId, className }: { productId: string; categoryId: string; className?: string }) {
    const { items, toggle } = useCompareStore();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const active = mounted && items.some((i) => i.id === productId);
    const lockedCat = items[0]?.categoryId;
    const blocked = mounted && !active && !!lockedCat && lockedCat !== categoryId;

    return (
        <button
            type="button"
            disabled={blocked}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle({ id: productId, categoryId }); }}
            title={blocked ? 'Chỉ so sánh sản phẩm cùng danh mục' : 'Thêm vào so sánh'}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition ${active
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : blocked
                        ? 'cursor-not-allowed border-gray-200 bg-white/70 text-gray-300'
                        : 'cursor-pointer border-gray-200 bg-white/90 text-gray-500 hover:text-blue-600'
                } ${className ?? ''}`}
        >
            <GitCompareArrows className="h-3.5 w-3.5" /> {active ? 'Đang so sánh' : 'So sánh'}
        </button>
    );
}