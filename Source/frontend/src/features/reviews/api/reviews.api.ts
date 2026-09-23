import { apiClient } from '@/shared/lib/api-client';
import type { AdminReviewList, ReviewEligibility, ReviewModerationReason, ReviewStatus, ReviewSummary } from '../types';

export interface AdminReviewParams { page?: number; limit?: number; search?: string; status?: string }

export const reviewsApi = {
    listPublic: (productId: string) => apiClient.get<ReviewSummary>(`/products/${productId}/reviews`).then((r) => r.data),
    eligibility: (productId: string) => apiClient.get<ReviewEligibility>(`/products/${productId}/reviews/eligibility`).then((r) => r.data),
    create: (productId: string, body: { rating: number; comment?: string }) => apiClient.post(`/products/${productId}/reviews`, body).then((r) => r.data),
    adminList: (params: AdminReviewParams) => apiClient.get<AdminReviewList>('/admin/reviews', { params }).then((r) => r.data),
    setStatus: (id: string, status: Exclude<ReviewStatus, 'PENDING'>, reason?: ReviewModerationReason) =>
        apiClient.patch(`/admin/reviews/${id}/status`, { status, reason }).then((r) => r.data),
    remove: (id: string, reason: ReviewModerationReason) =>
        apiClient.delete<{ message: string }>(`/admin/reviews/${id}`, { data: { reason } }).then((r) => r.data),
};