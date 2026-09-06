import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { AuthResponse } from '@/features/auth/types';

export const apiClient = axios.create({
    baseURL: env.apiUrl,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    try {
        const { data } = await axios.post<AuthResponse>(
            `${env.apiUrl}/auth/refresh`,
            {},
            { withCredentials: true },
        );
        useAuthStore.getState().setAuth(data.accessToken, data.user);
        return data.accessToken;
    } catch {
        useAuthStore.getState().clear();
        return null;
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
            refreshPromise ??= refreshAccessToken();
            const newToken = await refreshPromise;
            refreshPromise = null;
            if (newToken) {
                original.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(original);
            }
        }
        return Promise.reject(error);
    },
);