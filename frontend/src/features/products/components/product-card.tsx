'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Boxes, ImageIcon, Layers } from 'lucide-react';
import { formatVnd } from '@/shared/lib/format';
import type { ProductListItem } from '../types';
import { CompareButton } from './compare-button';

export function ProductCard({ product }: { product: ProductListItem }) {
    const img = product.images[0]?.imageUrl ?? null;
    const hasSale = product.salePrice != null && product.salePrice < product.price;
    const outOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0;
    const discount = hasSale ? Math.round((1 - product.salePrice! / product.price) * 100) : 0;

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-blue-300 hover:shadow-md"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                {img ? (
                    <Image
                        src={img}
                        alt={product.name}
                        fill
                        sizes="(max-width:768px) 50vw, 20vw"
                        className="object-contain p-3 transition group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                        <ImageIcon className="h-10 w-10" />
                    </div>
                )}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {hasSale && (
                        <span className="rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">-{discount}%</span>
                    )}
                    {product.type === 'COMBO' && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-amber-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
                            <Boxes className="h-3 w-3" /> Combo
                        </span>
                    )}
                    {product.type === 'VARIABLE' && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-indigo-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
                            <Layers className="h-3 w-3" /> Nhiều loại
                        </span>
                    )}
                </div>
                {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <span className="rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white">Hết hàng</span>
                    </div>
                )}
                <CompareButton productId={product.id} categoryId={product.category?.id ?? ''} className="absolute right-2 top-2 z-10" />
            </div>
            <div className="flex flex-1 flex-col p-3">
                {product.brand && (
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{product.brand.name}</span>
                )}
                <h3 className="mt-0.5 line-clamp-2 flex-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">
                    {product.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-bold text-blue-600">{formatVnd(hasSale ? product.salePrice : product.price)}</span>
                    {hasSale && <span className="text-xs text-gray-400 line-through">{formatVnd(product.price)}</span>}
                </div>
            </div>
        </Link>
    );
}