'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut, ShoppingBag, User as UserIcon, UserCircle, LifeBuoy, Headset } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useLogout } from '../hooks/use-logout';

export function UserNav() {
    const status = useAuthStore((s) => s.status);
    const user = useAuthStore((s) => s.user);
    const logout = useLogout();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    if (status === 'loading') {
        return <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />;
    }

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
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {user.fullName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-24 truncate text-sm text-gray-700 sm:inline">{user.fullName}</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-2">
                        <p className="truncate text-sm font-medium text-gray-800">{user.fullName}</p>
                        <p className="truncate text-xs text-gray-400">{user.email}</p>
                    </div>

                    {user.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <LayoutDashboard className="h-4 w-4 text-gray-400" /> Trang quản trị
                        </Link>
                    )}
                    <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <ShoppingBag className="h-4 w-4 text-gray-400" /> Đơn hàng của tôi
                    </Link>
                    <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <UserCircle className="h-4 w-4 text-gray-400" /> Thông tin cá nhân
                    </Link>
                    <Link href="/support" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Headset className="h-4 w-4 text-gray-400" /> Hỗ trợ và giải đáp
                    </Link>

                    <button
                        type="button"
                        onClick={() => { setOpen(false); logout.mutate(); }}
                        disabled={logout.isPending}
                        className="flex w-full cursor-pointer items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
}
