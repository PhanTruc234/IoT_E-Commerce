import { AxiosError } from 'axios';

/** Mã cho 1 lần thực hiện thao tác "tạo mới" — gửi lại (retry) phải dùng đúng mã cũ để server trả kết quả cũ. */
export function newIdempotencyKey(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Chỉ gửi lại khi không biết request trước có tới server hay không (mất mạng, timeout, gateway lỗi). */
export function isRetryableNetworkError(error: unknown): boolean {
    if (!(error instanceof AxiosError)) return false;
    if (!error.response) return true;
    return [502, 503, 504].includes(error.response.status);
}

export function isIdempotencyConflict(error: unknown): boolean {
    return error instanceof AxiosError && error.response?.status === 422;
}
