'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useLogout() {
    const router = useRouter();
    const clear = useAuthStore((s) => s.clear);
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => authApi.logout(),
        onSettled: () => {
            clear();
            qc.clear();
            router.replace('/login');
            router.refresh();
        },
    });
}