'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couponsApi, type CouponInput } from '../api/coupons.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useMyCoupons() {
    const status = useAuthStore((s) => s.status);
    return useQuery({ queryKey: ['coupons', 'my'], queryFn: couponsApi.my, enabled: status === 'authenticated' });
}
export function useSaveCoupon() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (code: string) => couponsApi.save(code),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons', 'my'] }),
    });
}
export function useCouponQuote(body: { subtotal: number; shippingFee: number; productCode?: string; shippingCode?: string }, enabled: boolean) {
    return useQuery({
        queryKey: ['coupons', 'quote', body],
        queryFn: () => couponsApi.quote(body),
        enabled,
    });
}
// Admin
export function useAdminCoupons() {
    return useQuery({ queryKey: ['admin', 'coupons'], queryFn: couponsApi.adminList });
}
export function useCouponMutations() {
    const qc = useQueryClient();
    const inv = () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    return {
        create: useMutation({ mutationFn: (b: CouponInput) => couponsApi.adminCreate(b), onSuccess: inv }),
        update: useMutation({ mutationFn: ({ id, body }: { id: string; body: Partial<CouponInput> }) => couponsApi.adminUpdate(id, body), onSuccess: inv }),
        remove: useMutation({ mutationFn: (id: string) => couponsApi.adminRemove(id), onSuccess: inv }),
    };
}