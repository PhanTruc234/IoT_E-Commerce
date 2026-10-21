'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Boxes, ImageIcon, Layers, Star, Zap } from 'lucide-react';
import type { ProductListItem } from '../types';
import { CompareButton } from './compare-button';
import { WishlistButton } from '@/features/wishlist/components/wishlist-button';
import { ProductPrice } from '@/features/promotions/components/product-price';
import { discountBadge } from '@/features/promotions/lib/pricing';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useBuyNowStore } from '@/features/orders/store/buy-now.store';

export function ProductCard({ product }: { product: ProductListItem }) {
    const router = useRouter();
    const authStatus = useAuthStore((s) => s.status);
    const setBuyNow = useBuyNowStore((s) => s.set);
    const img = product.images[0]?.imageUrl ?? null;
    const { listPrice, finalPrice } = product.pricing;
    const hasDiscount = finalPrice < listPrice;
    const outOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0;

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (outOfStock) return;
        if (authStatus !== 'authenticated') { router.push('/login'); return; }
        // Sản phẩm có biến thể → vào trang chi tiết để chọn phân loại rồi mua
        if (product.type === 'VARIABLE') { router.push(`/products/${product.slug}`); return; }
        // Sản phẩm đơn giản / combo → mua trực tiếp (không đụng giỏ hàng)
        setBuyNow({ productId: product.id, quantity: 1, name: product.name, image: img, variantLabel: null, unitPrice: finalPrice });
        router.push('/checkout?buynow=1');
    };

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
                    {hasDiscount && (
                        <span className="rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">{discountBadge(listPrice, finalPrice)}</span>
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
                <WishlistButton productId={product.id} className="absolute right-2 top-11 z-10" />
            </div>
            <div className="flex flex-1 flex-col p-3">
                {product.brand && (
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{product.brand.name}</span>
                )}
                <h3 className="mt-0.5 line-clamp-2 flex-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">
                    {product.name}
                </h3>
                {product.ratingCount > 0 && (
                    <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] text-gray-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.ratingAvg.toFixed(1)} <span className="text-gray-400">({product.ratingCount})</span>
                    </span>
                )}
                <div className="mt-2">
                    <ProductPrice pricing={product.pricing} size="sm" badge={false} />
                </div>
                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={outOfStock}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-orange-500 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Zap className="h-3.5 w-3.5" />
                    {outOfStock ? 'Hết hàng' : product.type === 'VARIABLE' ? 'Chọn' : 'Mua ngay'}
                </button>
            </div>
        </Link>
    );
}