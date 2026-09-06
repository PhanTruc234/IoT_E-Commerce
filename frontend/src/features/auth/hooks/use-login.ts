'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { LoginInput } from '../schemas/auth.schema';

export function useLogin() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    return useMutation({
        mutationFn: (input: LoginInput) => authApi.login(input),
        onSuccess: (data) => {
            setAuth(data.accessToken, data.user);
            router.replace(data.user.role === 'ADMIN' ? '/admin' : '/');
            router.refresh();
        },
    });
}