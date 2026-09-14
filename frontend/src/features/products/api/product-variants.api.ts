import { apiClient } from '@/shared/lib/api-client';
import type { ProductVariant } from '../types';

export interface UpdateVariantInput {
    price?: number;
    salePrice?: number;
    stockQuantity?: number;
    imageUrl?: string;
    isActive?: boolean;
}

export const productVariantsApi = {
    list: (productId: string) =>
        apiClient.get<ProductVariant[]>(`/products/${productId}/variants`).then((r) => r.data),
    generate: (productId: string) =>
        apiClient
            .post<{ created: number; variants: ProductVariant[] }>(`/products/${productId}/variants/generate`)
            .then((r) => r.data),
    update: (productId: string, variantId: string, data: UpdateVariantInput) =>
        apiClient
            .patch<ProductVariant>(`/products/${productId}/variants/${variantId}`, data)
            .then((r) => r.data),
    remove: (productId: string, variantId: string) =>
        apiClient
            .delete<{ message: string }>(`/products/${productId}/variants/${variantId}`)
            .then((r) => r.data),
};