import { apiClient } from '@/shared/lib/api-client';
import type { ProductSpecification } from '@/features/specifications/types';

export interface ProductSpecItem {
    specificationId: string;
    value: string;
}

export const productSpecsApi = {
    list: (productId: string) =>
        apiClient.get<ProductSpecification[]>(`/products/${productId}/specifications`).then((r) => r.data),
    replace: (productId: string, items: ProductSpecItem[]) =>
        apiClient
            .put<ProductSpecification[]>(`/products/${productId}/specifications`, { items })
            .then((r) => r.data),
};