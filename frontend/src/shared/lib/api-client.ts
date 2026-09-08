import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { User } from '@/features/auth/types';

// Access token nằm trong httpOnly cookie → trình duyệt tự gửi kèm (withCredentials).
// Không cần đính Authorization header từ JS nữa.
export const apiClient = axios.create({
    baseURL: env.apiUrl,
    withCredentials: true,
});

// Gộp nhiều 401 cùng lúc thành 1 lần refresh
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
    try {
        const { data } = await axios.post<{ user: User }>(
            `${env.apiUrl}/auth/refresh`,
            {},
            { withCredentials: true },
        );
        useAuthStore.getState().setUser(data.user);
        return true;
    } catch {
        useAuthStore.getState().clear();
        return false;
    }
}

apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
        const url = original?.url ?? '';
        const isAuthRoute = ['/auth/login', '/auth/register', '/auth/refresh'].some((p) => url.includes(p));

        // Access cookie hết hạn → thử refresh 1 lần rồi gọi lại request cũ
        if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
            original._retry = true;
            refreshPromise ??= tryRefresh();
            const ok = await refreshPromise;
            refreshPromise = null;
            if (ok) return apiClient(original);
        }
        return Promise.reject(error);
    },
);
