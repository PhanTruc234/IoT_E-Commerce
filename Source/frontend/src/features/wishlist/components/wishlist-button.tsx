'use client';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useWishlistIds, useToggleWishlist } from '../hooks/use-wishlist';

export function WishlistButton({ productId, className = '' }: { productId: string; className?: string }) {
    const router = useRouter();
    const status = useAuthStore((s) => s.status);
    const { data: ids } = useWishlistIds();
    const { add, remove } = useToggleWishlist();
    const active = ids?.includes(productId) ?? false;

    const onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (status !== 'authenticated') { router.push('/login'); return; }
        if (active) remove.mutate(productId);
        else add.mutate(productId);
    };

    return (
        <button type="button" onClick={onClick} aria-label="Yêu thích"
            className={`flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-sm transition hover:bg-white ${className}`}>
            <Heart className={`h-4 w-4 ${active ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
    );
}