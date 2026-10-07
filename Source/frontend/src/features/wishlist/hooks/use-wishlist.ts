'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api/wishlist.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useWishlist() {
    const status = useAuthStore((s) => s.status);
    return useQuery({ queryKey: ['wishlist'], queryFn: wishlistApi.list, enabled: status === 'authenticated' });
}
export function useWishlistIds() {
    const status = useAuthStore((s) => s.status);
    return useQuery({ queryKey: ['wishlist', 'ids'], queryFn: wishlistApi.ids, enabled: status === 'authenticated' });
}
export function useToggleWishlist() {
    const qc = useQueryClient();
    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ['wishlist'] });
        qc.invalidateQueries({ queryKey: ['wishlist', 'ids'] });
    };
    const add = useMutation({ mutationFn: (id: string) => wishlistApi.add(id), onSuccess: invalidate });
    const remove = useMutation({ mutationFn: (id: string) => wishlistApi.remove(id), onSuccess: invalidate });
    return { add, remove };
}