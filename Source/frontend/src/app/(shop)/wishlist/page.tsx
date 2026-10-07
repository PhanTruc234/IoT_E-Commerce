'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ImageIcon } from 'lucide-react';
import { formatVnd } from '@/shared/lib/format';
import { Spinner } from '@/shared/ui/spinner';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useWishlist, useToggleWishlist } from '@/features/wishlist/hooks/use-wishlist';

export default function WishlistPage() {
    const router = useRouter();
    const status = useAuthStore((s) => s.status);
    const { data, isLoading } = useWishlist();
    const { remove } = useToggleWishlist();

    useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Heart className="h-6 w-6 text-red-500" /> Sản phẩm yêu thích
            </h1>

            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
                : !data || data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
                        <p className="text-sm text-gray-500">Bạn chưa có sản phẩm yêu thích nào.</p>
                        <Link href="/products" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Khám phá sản phẩm →</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {data.map((p) => {
                            const hasSale = p.salePrice != null && p.salePrice < p.price;
                            return (
                                <div key={p.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    <button onClick={() => remove.mutate(p.id)} aria-label="Bỏ yêu thích"
                                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 shadow-sm hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <Link href={`/products/${p.slug}`} className="flex flex-1 flex-col">
                                        <div className="relative aspect-square bg-gray-50">
                                            {p.image ? <Image src={p.image} alt={p.name} fill sizes="25vw" className="object-contain p-3" />
                                                : <div className="flex h-full items-center justify-center text-gray-300"><ImageIcon className="h-10 w-10" /></div>}
                                        </div>
                                        <div className="flex flex-1 flex-col p-3">
                                            <h3 className="line-clamp-2 flex-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">{p.name}</h3>
                                            <div className="mt-2 flex items-baseline gap-2">
                                                <span className="text-base font-bold text-blue-600">{formatVnd(hasSale ? p.salePrice! : p.price)}</span>
                                                {hasSale && <span className="text-xs text-gray-400 line-through">{formatVnd(p.price)}</span>}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
        </div>
    );
}