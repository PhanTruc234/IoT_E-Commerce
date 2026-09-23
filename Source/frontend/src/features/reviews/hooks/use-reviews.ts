'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, type AdminReviewParams } from '../api/reviews.api';
import type { ReviewModerationReason, ReviewStatus } from '../types';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useProductReviews(productId: string) {
    return useQuery({ queryKey: ['shop', 'reviews', productId], queryFn: () => reviewsApi.listPublic(productId), enabled: !!productId });
}
export function useReviewEligibility(productId: string) {
    const status = useAuthStore((s) => s.status);
    return useQuery({ queryKey: ['shop', 'review-eligibility', productId], queryFn: () => reviewsApi.eligibility(productId), enabled: !!productId && status === 'authenticated' });
}
export function useCreateReview(productId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: { rating: number; comment?: string }) => reviewsApi.create(productId, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['shop', 'review-eligibility', productId] });
            qc.invalidateQueries({ queryKey: ['shop', 'reviews', productId] });
        },
    });
}
export function useAdminReviews(params: AdminReviewParams) {
    return useQuery({ queryKey: ['admin', 'reviews', params], queryFn: () => reviewsApi.adminList(params) });
}
export function useSetReviewStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, reason }: { id: string; status: Exclude<ReviewStatus, 'PENDING'>; reason?: ReviewModerationReason }) =>
            reviewsApi.setStatus(id, status, reason),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }); qc.invalidateQueries({ queryKey: ['shop', 'reviews'] }); },
    });
}
export function useDeleteReview() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: ReviewModerationReason }) => reviewsApi.remove(id, reason),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }); qc.invalidateQueries({ queryKey: ['shop', 'reviews'] }); },
    });
}