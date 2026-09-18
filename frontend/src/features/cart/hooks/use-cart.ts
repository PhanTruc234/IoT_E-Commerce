'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi, type AddToCartBody } from '../api/cart.api';
import type { Cart } from '../types';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useCart() {
    const status = useAuthStore((s) => s.status);
    return useQuery({
        queryKey: ['cart'],
        queryFn: cartApi.get,
        enabled: status === 'authenticated',
    });
}

function useSetCart() {
    const qc = useQueryClient();
    return (data: Cart) => qc.setQueryData(['cart'], data);
}

export function useAddToCart() {
    const setCart = useSetCart();
    return useMutation({ mutationFn: (b: AddToCartBody) => cartApi.add(b), onSuccess: setCart });
}
export function useUpdateCartItem() {
    const setCart = useSetCart();
    return useMutation({ mutationFn: ({ id, quantity }: { id: string; quantity: number }) => cartApi.update(id, quantity), onSuccess: setCart });
}
export function useRemoveCartItem() {
    const setCart = useSetCart();
    return useMutation({ mutationFn: (id: string) => cartApi.remove(id), onSuccess: setCart });
}
export function useClearCart() {
    const setCart = useSetCart();
    return useMutation({ mutationFn: () => cartApi.clear(), onSuccess: setCart });
}