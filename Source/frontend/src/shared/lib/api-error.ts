import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/shared/types/api';

export function getApiErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra'): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorResponse | undefined;
        if (data?.message) {
            return Array.isArray(data.message) ? data.message[0] : data.message;
        }
    }
    return fallback;
}