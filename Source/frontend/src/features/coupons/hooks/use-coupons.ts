'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couponsApi, type CouponInput } from '../api/coupons.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { CouponQuoteBody } from '../api/coupons.api';

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
export function useCouponQuote(body: CouponQuoteBody, enabled: boolean) {
    return useQuery({
        queryKey: ['coupons', 'quote', body],
        queryFn: () => couponsApi.quote(body),
        enabled,
    });
}
export function useFlashCoupons() {
    const status = useAuthStore((s) => s.status);
    return useQuery({
        // Khách chưa đăng nhập vẫn xem được; đăng nhập xong tải lại để biết mã nào mình đã lấy
        queryKey: ['coupons', 'flash', status === 'authenticated'],
        queryFn: couponsApi.flash,
        enabled: status !== 'loading',
        refetchInterval: 15000, // cập nhật số lượng còn lại mỗi 15s
    });
}
export function useClaimCoupon() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (couponId: string) => couponsApi.claim(couponId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['coupons', 'flash'] });
            qc.invalidateQueries({ queryKey: ['coupons', 'my'] });
        },
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