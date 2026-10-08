import { apiClient } from '@/shared/lib/api-client';

export type DiscountType = 'PERCENT' | 'FIXED';
export type PromotionScope = 'ALL' | 'CATEGORY' | 'PRODUCT';

export interface ActivePromotion {
    id: string; name: string; description: string | null;
    bannerImage: string | null; linkUrl: string | null;
    discountType: DiscountType; value: number; maxDiscount: number | null;
    scope: PromotionScope; priority: number; endAt: string | null;
    productIds: string[]; categoryIds: string[];
}
export interface AdminPromotion extends ActivePromotion {
    startAt: string | null; isActive: boolean; createdAt: string;
    _count: { products: number; categories: number };
}
export interface PromotionInput {
    name: string; description?: string; bannerImage?: string; linkUrl?: string;
    discountType: DiscountType; value: number; maxDiscount?: number;
    scope: PromotionScope; productIds?: string[]; categoryIds?: string[];
    priority?: number; startAt?: string; endAt?: string; isActive?: boolean;
}

export const promotionsApi = {
    active: () => apiClient.get<ActivePromotion[]>('/promotions/active').then((r) => r.data),
    adminList: () => apiClient.get<AdminPromotion[]>('/promotions/admin').then((r) => r.data),
    adminCreate: (b: PromotionInput) => apiClient.post('/promotions/admin', b).then((r) => r.data),
    adminUpdate: (id: string, b: Partial<PromotionInput>) => apiClient.patch(`/promotions/admin/${id}`, b).then((r) => r.data),
    adminRemove: (id: string) => apiClient.delete(`/promotions/admin/${id}`).then((r) => r.data),
};