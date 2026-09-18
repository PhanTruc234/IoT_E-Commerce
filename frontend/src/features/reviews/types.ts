export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PublicReview {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    userName: string;
}
export interface ReviewSummary {
    count: number;
    average: number;
    items: PublicReview[];
}
export interface ReviewEligibility {
    purchased: boolean;
    alreadyReviewed: boolean;
    reviewStatus: ReviewStatus | null;
    canReview: boolean;
}
export interface AdminReview {
    id: string;
    rating: number;
    comment: string | null;
    status: ReviewStatus;
    createdAt: string;
    product: { name: string };
    user: { fullName: string; email: string };
}
export interface AdminReviewList {
    data: AdminReview[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}