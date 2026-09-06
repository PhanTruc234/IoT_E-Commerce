'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { RegisterInput } from '../schemas/auth.schema';

export function useRegister() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    return useMutation({
        mutationFn: (input: RegisterInput) =>
            authApi.register({
                fullName: input.fullName,
                email: input.email,
                password: input.password,
                phone: input.phone ? input.phone : undefined,
            }),
        onSuccess: (data) => {
            setAuth(data.accessToken, data.user);
            router.replace('/');
            router.refresh();
        },
    });
}