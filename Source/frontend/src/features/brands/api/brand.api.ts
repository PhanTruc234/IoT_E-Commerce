import { apiClient } from '@/shared/lib/api-client';
import { Brand, BrandListResponse } from '../types';

export interface BrandListParams {
    page?: number;
    limit?: number;
    search?: string;
    includeInactive?: boolean;
}

export interface BrandPayload {
    name: string;
    logoUrl?: string;
    isActive?: boolean;
}

export const brandsApi = {
    list: (params: BrandListParams) => apiClient.get<BrandListResponse>('/brands', { params }).then((r) => r.data),
    create: (payload: BrandPayload) => apiClient.post<Brand>('/brands', payload).then((r) => r.data),
    update: (id: string, payload: BrandPayload) => apiClient.patch<Brand>(`/brands/${id}`, payload).then((r) => r.data),
    remove: (id: string) => apiClient.delete<{ message: string }>(`/brands/${id}`).then((r) => r.data),
};