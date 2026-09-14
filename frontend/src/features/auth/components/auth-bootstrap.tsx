'use client';
import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function AuthBootstrap() {
    const setUser = useAuthStore((s) => s.setUser);
    const clear = useAuthStore((s) => s.clear);

    useEffect(() => {
        authApi
            .me()
            .then((user) => setUser(user))
            .catch(() => clear());
    }, [setUser, clear]);

    return null;
}
