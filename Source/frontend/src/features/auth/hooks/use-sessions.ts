'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useSessions() {
    const status = useAuthStore((s) => s.status);
    return useQuery({ queryKey: ['auth', 'sessions'], queryFn: authApi.sessions, enabled: status === 'authenticated' });
}

export function useRevokeSession() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => authApi.revokeSession(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'sessions'] }),
    });
}