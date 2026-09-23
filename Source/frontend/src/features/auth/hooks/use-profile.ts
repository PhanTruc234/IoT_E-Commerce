'use client';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useUpdateProfile() {
    const setUser = useAuthStore((s) => s.setUser);
    return useMutation({
        mutationFn: (input: { fullName?: string; phone?: string; address?: string }) => authApi.updateProfile(input),
        onSuccess: (user) => setUser(user),
    });
}
