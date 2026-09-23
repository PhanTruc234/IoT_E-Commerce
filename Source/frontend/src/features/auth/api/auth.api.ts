import { apiClient } from '@/shared/lib/api-client';
import type { AuthResponse, RegisterPayload, User } from '../types';
import type { LoginInput } from '../schemas/auth.schema';

export const authApi = {
    login: (input: LoginInput) => apiClient.post<AuthResponse>('/auth/login', input).then((r) => r.data),
    register: (input: RegisterPayload) => apiClient.post<AuthResponse>('/auth/register', input).then((r) => r.data),
    google: (idToken: string) => apiClient.post<AuthResponse>('/auth/google', { idToken }).then((r) => r.data),
    me: () => apiClient.get<User>('/auth/me').then((r) => r.data),
    updateProfile: (input: { fullName?: string; phone?: string; address?: string }) =>
        apiClient.patch<User>('/auth/me', input).then((r) => r.data),
    logout: () => apiClient.post<{ message: string }>('/auth/logout').then((r) => r.data),
    refresh: () => apiClient.post<AuthResponse>('/auth/refresh').then((r) => r.data),
    sessions: () => apiClient.get<import('../types').LoginSession[]>('/auth/sessions').then((r) => r.data),
    revokeSession: (id: string) => apiClient.delete<{ message: string }>(`/auth/sessions/${id}`).then((r) => r.data),
};