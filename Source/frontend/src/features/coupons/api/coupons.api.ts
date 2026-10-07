import { apiClient } from '@/shared/lib/api-client';

export type CouponType = 'PRODUCT_DISCOUNT' | 'FREE_SHIPPING';
export type DiscountType = 'PERCENT' | 'FIXED';
export type CouponStatus = 'ACTIVE' | 'USED' | 'EXPIRED';

export interface MyCoupon {
    id: string; code: string; description: string | null; type: CouponType;
    discountType: DiscountType; value: number; maxDiscount: number | null;
    minOrder: number; endAt: string | null; status: CouponStatus;
}
export interface CouponQuote {
    discountAmount: number; shippingDiscount: number; total: number;
    productCode: string | null; shippingCode: string | null;
    errors: { product?: string; shipping?: string };
}
export interface AdminCoupon extends MyCoupon {
    usageLimit: number | null; usedCount: number; perUserLimit: number;
    startAt: string | null; isActive: boolean; createdAt: string;
}
export interface CouponInput {
    code: string; description?: string; type: CouponType; discountType: DiscountType;
    value: number; maxDiscount?: number; minOrder?: number; usageLimit?: number;
    perUserLimit?: number; startAt?: string; endAt?: string; isActive?: boolean;
}

export const couponsApi = {
    save: (code: string) => apiClient.post('/coupons/save', { code }).then((r) => r.data),
    my: () => apiClient.get<MyCoupon[]>('/coupons/my').then((r) => r.data),
    quote: (body: { subtotal: number; shippingFee: number; productCode?: string; shippingCode?: string }) =>
        apiClient.post<CouponQuote>('/coupons/quote', body).then((r) => r.data),
    adminList: () => apiClient.get<AdminCoupon[]>('/coupons/admin').then((r) => r.data),
    adminCreate: (body: CouponInput) => apiClient.post<AdminCoupon>('/coupons/admin', body).then((r) => r.data),
    adminUpdate: (id: string, body: Partial<CouponInput>) => apiClient.patch<AdminCoupon>(`/coupons/admin/${id}`, body).then((r) => r.data),
    adminRemove: (id: string) => apiClient.delete(`/coupons/admin/${id}`).then((r) => r.data),
};