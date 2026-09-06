'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';
import type { Role } from '../types';

export function RequireAuth({ role, children }: { role?: Role; children: React.ReactNode }) {
    const router = useRouter();
    const status = useAuthStore((s) => s.status);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/login');
        else if (status === 'authenticated' && role && user?.role !== role) router.replace('/');
    }, [status, role, user, router]);

    if (status !== 'authenticated' || (role && user?.role !== role)) {
        return <div className="p-8 text-center text-sm text-gray-500">Đang tải…</div>;
    }
    return <>{children}</>;
}