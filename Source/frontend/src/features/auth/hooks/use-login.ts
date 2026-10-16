'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { LoginInput } from '../schemas/auth.schema';
import { getSafeNext } from '@/shared/lib/safe-next';

export function useLogin() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);
    return useMutation({
        mutationFn: (input: LoginInput) => authApi.login(input),
        onSuccess: (data) => {
            setUser(data.user);
            router.replace(getSafeNext() ?? (data.user.role === 'ADMIN' ? '/admin' : '/'));
            router.refresh();
        },
    });
}