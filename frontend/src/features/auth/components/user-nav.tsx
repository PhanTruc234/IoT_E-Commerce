'use client';
import Link from 'next/link';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useLogout } from '../hooks/use-logout';

export function UserNav() {
    const status = useAuthStore((s) => s.status);
    const user = useAuthStore((s) => s.user);
    const logout = useLogout();

    if (status === 'loading') return <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />;

    if (status !== 'authenticated' || !user) {
        return (
            <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <Link
                href={user.role === 'ADMIN' ? '/admin' : '/account'}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {user.fullName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-24 truncate text-sm text-gray-700 sm:inline">{user.fullName}</span>
            </Link>
            <button
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                aria-label="Đăng xuất"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
            >
                <LogOut className="h-4 w-4" />
            </button>
        </div>
    );
}