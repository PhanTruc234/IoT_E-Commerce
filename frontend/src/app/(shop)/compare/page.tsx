'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GitCompareArrows, X } from 'lucide-react';
import { formatVnd } from '@/shared/lib/format';
import { useCompareStore } from '@/features/products/store/compare.store';
import { useCompare } from '@/features/products/hooks/use-storefront';

export default function ComparePage() {
    const { items, remove, clear } = useCompareStore();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const ids = items.map((i) => i.id);
    const { data, isLoading, isError } = useCompare(mounted ? ids : []);

    if (!mounted) return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-gray-400">Đang tải…</div>;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <GitCompareArrows className="h-6 w-6 text-blue-600" /> So sánh sản phẩm
                </h1>
                {ids.length > 0 && (
                    <button onClick={clear} className="cursor-pointer text-sm text-gray-500 hover:text-red-600">Xoá tất cả</button>
                )}
            </div>

            {ids.length < 2 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">
                    Chọn ít nhất 2 sản phẩm (bấm “So sánh” trên thẻ sản phẩm) để bắt đầu.
                    <div className="mt-4"><Link href="/products" className="text-blue-600 hover:underline">Xem sản phẩm →</Link></div>
                </div>
            ) : isLoading ? (
                <p className="py-16 text-center text-sm text-gray-400">Đang tải so sánh…</p>
            ) : isError || !data ? (
                <p className="py-16 text-center text-sm text-red-600">Không tải được dữ liệu so sánh.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="w-40 border-b border-gray-200 p-3 text-left align-bottom text-xs font-semibold uppercase text-gray-400">Tiêu chí</th>
                                {data.products.map((p) => (
                                    <th key={p.id} className="min-w-48 border-b border-l border-gray-100 p-3 align-top">
                                        <div className="relative">
                                            <button onClick={() => remove(p.id)} className="absolute right-0 top-0 cursor-pointer rounded p-1 text-gray-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                                            <Link href={`/products/${p.slug}`} className="block">
                                                <span className="relative mx-auto block h-28 w-28 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                                    {p.image && <Image src={p.image} alt="" fill sizes="112px" className="object-contain p-2" />}
                                                </span>
                                                <span className="mt-2 block text-center text-sm font-medium text-gray-800 hover:text-blue-600">{p.name}</span>
                                            </Link>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-gray-50">
                                <td className="p-3 font-medium text-gray-600">Thương hiệu</td>
                                {data.products.map((p) => <td key={p.id} className="border-l border-gray-100 p-3 text-center text-gray-700">{p.brand ?? '—'}</td>)}
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-gray-600">Giá</td>
                                {data.products.map((p) => (
                                    <td key={p.id} className="border-l border-gray-100 p-3 text-center">
                                        <span className="font-bold text-blue-600">{formatVnd(p.salePrice ?? p.price)}</span>
                                        {p.salePrice != null && <span className="ml-1 text-xs text-gray-400 line-through">{formatVnd(p.price)}</span>}
                                    </td>
                                ))}
                            </tr>
                            {data.specs.map((s, i) => {
                                const vals = data.products.map((p) => s.values[p.id] ?? '—');
                                const allSame = vals.every((v) => v === vals[0]);
                                return (
                                    <tr key={s.specificationId} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                                        <td className="p-3 font-medium text-gray-600">{s.name}{s.unit ? ` (${s.unit})` : ''}</td>
                                        {data.products.map((p) => (
                                            <td key={p.id} className={`border-l border-gray-100 p-3 text-center ${allSame ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                                                {s.values[p.id] ?? '—'}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {data.specs.length === 0 && <p className="mt-4 text-center text-sm text-gray-400">Các sản phẩm này chưa có thông số để so sánh.</p>}
                </div>
            )}
        </div>
    );
}