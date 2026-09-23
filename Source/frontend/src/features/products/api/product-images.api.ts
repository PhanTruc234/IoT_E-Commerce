import { apiClient } from '@/shared/lib/api-client';
import type { ProductImage } from '../types';
import { uploadImages } from '@/features/uploads/api/uploads.api';

export const productImagesApi = {
    list: (productId: string) =>
        apiClient.get<ProductImage[]>(`/products/${productId}/images`).then((r) => r.data),
    upload: async (productId: string, file: File) => {
        const uploaded = await uploadImages([file], 'products');
        const { data } = await apiClient.post<ProductImage[]>(`/products/${productId}/images`, {
            imageUrls: uploaded.map((u) => u.url),
        });
        return data;
    },
    remove: (productId: string, imageId: string) =>
        apiClient.delete<{ message: string }>(`/products/${productId}/images/${imageId}`).then((r) => r.data),
    setPrimary: (productId: string, imageId: string) =>
        apiClient
            .patch<{ message: string }>(`/products/${productId}/images/${imageId}/primary`)
            .then((r) => r.data),
    reorder: (productId: string, imageIds: string[]) =>
        apiClient
            .patch<ProductImage[]>(`/products/${productId}/images/reorder`, { imageIds })
            .then((r) => r.data),
};