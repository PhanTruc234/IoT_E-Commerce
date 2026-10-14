export interface ApiErrorResponse {
    statusCode: number;
    message: string | string[];
    error?: string;
    retryAfter?: number;
}

export interface Paginated<T> {
    data: T[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}