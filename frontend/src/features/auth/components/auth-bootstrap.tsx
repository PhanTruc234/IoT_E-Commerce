'use client';
import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function AuthBootstrap() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const clear = useAuthStore((s) => s.clear);

    useEffect(() => {
        authApi
            .refresh()
            .then((data) => setAuth(data.accessToken, data.user))
            .catch(() => clear());
    }, [setAuth, clear]);

    return null;
}