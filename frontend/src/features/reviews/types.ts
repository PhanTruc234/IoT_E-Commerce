export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReviewModerationReason = 'SPAM' | 'OFFENSIVE' | 'IRRELEVANT' | 'FAKE' | 'PERSONAL_INFO' | 'OTHER';

export const REVIEW_MODERATION_REASON: Record<ReviewModerationReason, string> = {
    SPAM: 'Spam / quảng cáo',
    OFFENSIVE: 'Ngôn từ phản cảm',
    IRRELEVANT: 'Không liên quan sản phẩm',
    FAKE: 'Đánh giá giả mạo',
    PERSONAL_INFO: 'Lộ thông tin cá nhân',
    OTHER: 'Lý do khác',
};
export interface PublicReview {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    userName: string;
    verifiedPurchase: boolean;
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
    verifiedPurchase: boolean;
    moderationReason: ReviewModerationReason | null;
    createdAt: string;
    product: { name: string };
    user: { fullName: string; email: string };
}
export interface AdminReviewList {
    data: AdminReview[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}