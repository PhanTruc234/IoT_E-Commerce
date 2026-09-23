export interface PublicQuestion {
    id: string;
    content: string;
    answer: string | null;
    answeredAt: string | null;
    createdAt: string;
    askerName: string;
}
export interface AdminQuestion {
    id: string;
    content: string;
    answer: string | null;
    answeredAt: string | null;
    createdAt: string;
    product: { name: string };
    user: { fullName: string; email: string };
}
export interface AdminQuestionList {
    data: AdminQuestion[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}