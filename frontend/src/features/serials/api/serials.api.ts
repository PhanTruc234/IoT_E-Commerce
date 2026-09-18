import { apiClient } from '@/shared/lib/api-client';
import type { SerialListResponse, WarrantyLookup } from '../types';

export interface SerialListParams { page?: number; limit?: number; search?: string; productId?: string; variantId?: string; status?: string }
export interface CreateSerialsBody { productId: string; variantId?: string; warrantyMonths?: number; codes: string[] }
export interface ActivateSerialBody { activatedAt?: string; ownerName?: string; ownerPhone?: string, ownerUserId?: string }
export interface SerialSummary { stock: number; existing: number; suggested: number }
export interface GenerateSerialsBody { productId: string; variantId?: string; quantity: number; warrantyMonths?: number }
export const serialsApi = {
    list: (params: SerialListParams) => apiClient.get<SerialListResponse>('/admin/serials', { params }).then((r) => r.data),
    create: (body: CreateSerialsBody) => apiClient.post<{ created: number }>('/admin/serials', body).then((r) => r.data),
    activate: (id: string, body: ActivateSerialBody) => apiClient.patch(`/admin/serials/${id}/activate`, body).then((r) => r.data),
    remove: (id: string) => apiClient.delete<{ message: string }>(`/admin/serials/${id}`).then((r) => r.data),
    lookup: (code: string) => apiClient.get<WarrantyLookup>('/warranty/lookup', { params: { code } }).then((r) => r.data),
    summary: (productId: string, variantId?: string) =>
        apiClient.get<SerialSummary>('/admin/serials/summary', { params: { productId, ...(variantId ? { variantId } : {}) } }).then((r) => r.data),
    generate: (body: GenerateSerialsBody) =>
        apiClient.post<{ created: number }>('/admin/serials/generate', body).then((r) => r.data),
};