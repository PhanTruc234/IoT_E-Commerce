import { apiClient } from '@/shared/lib/api-client';
import { Brand, BrandListResponse } from '../types';

export interface BrandListParams {
    page?: number;
    limit?: number;
    search?: string;
    includeInactive?: boolean;
}

export const brandsApi = {
    list: (params: BrandListParams) => apiClient.get<BrandListResponse>('/brands', { params }).then((r) => r.data),
    create: (form: FormData) => apiClient.post<Brand>('/brands', form).then((r) => r.data),
    update: (id: string, form: FormData) => apiClient.patch<Brand>(`/brands/${id}`, form).then((r) => r.data),
    remove: (id: string) => apiClient.delete<{ message: string }>(`/brands/${id}`).then((r) => r.data),
};