import { apiClient } from '@/shared/lib/api-client';
import type { ProductAttribute } from '../types';

export interface AttributeInput {
    name: string;
    isVariant: boolean;
    options: { value: string }[];
}

export const productAttributesApi = {
    list: (productId: string) =>
        apiClient.get<ProductAttribute[]>(`/products/${productId}/attributes`).then((r) => r.data),
    replace: (productId: string, attributes: AttributeInput[]) =>
        apiClient
            .put<ProductAttribute[]>(`/products/${productId}/attributes`, { attributes })
            .then((r) => r.data),
};