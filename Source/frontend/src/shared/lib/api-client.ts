import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { User } from '@/features/auth/types';

// Backend bắt buộc header này với POST/PUT/PATCH/DELETE (chống CSRF):
// form của trang lạ không tự thêm header được, còn fetch từ trang lạ sẽ bị CORS chặn.
// Không gắn cho GET để request đọc dữ liệu không phải gửi thêm preflight OPTIONS.
const CSRF_HEADER = { 'X-Requested-With': 'XMLHttpRequest' };
const SAFE_METHODS = ['get', 'head', 'options'];

export const apiClient = axios.create({
    baseURL: env.apiUrl,
    withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
    if (!SAFE_METHODS.includes((config.method ?? 'get').toLowerCase())) {
        config.headers.set('X-Requested-With', 'XMLHttpRequest');
    }
    return config;
});

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
    try {
        const { data } = await axios.post<{ user: User }>(
            `${env.apiUrl}/auth/refresh`,
            {},
            { withCredentials: true, headers: CSRF_HEADER },
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