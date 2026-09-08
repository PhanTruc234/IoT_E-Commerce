'use client';
import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

// Khi tải trang: gọi /auth/me (access cookie tự gửi).
// Nếu access hết hạn → interceptor tự refresh 1 lần rồi thử lại.
// Nhờ vậy reload KHÔNG tạo refresh token mới nếu access còn hạn.
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
