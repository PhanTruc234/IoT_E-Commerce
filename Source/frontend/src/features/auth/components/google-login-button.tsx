'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function GoogleLoginButton() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);
    const [error, setError] = useState<string | null>(null);

    return (
        <div>
            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={async (cred) => {
                        if (!cred.credential) return;
                        try {
                            const { user } = await authApi.google(cred.credential);
                            setUser(user);
                            router.push(user.role === 'ADMIN' ? '/admin' : '/');
                            router.refresh();
                        } catch (e) {
                            setError(getApiErrorMessage(e));
                        }
                    }}
                    onError={() => setError('Đăng nhập Google thất bại')}
                    text="signin_with"
                    width="320"
                />
            </div>
            {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
        </div>
    );
}