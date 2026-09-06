export interface ApiErrorResponse {
    statusCode: number;
    message: string | string[];
    error?: string;
}

export interface Paginated<T> {
    data: T[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}