'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, Store, X } from 'lucide-react';
import { ADMIN_NAV } from '@/shared/config/admin-nav';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useLogout } from '@/features/auth/hooks/use-logout';

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const user = useAuthStore((s) => s.user);
    const logout = useLogout();

    const nav = (
        <nav className="flex flex-col gap-0.5 p-3">
            {ADMIN_NAV.map((item) => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
                <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
                    <span className="text-lg font-bold text-gray-900">TMĐT<span className="text-blue-600">IoT</span></span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">Admin</span>
                </div>
                <div className="flex-1 overflow-y-auto">{nav}</div>
            </aside>
            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                    <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white">
                        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
                            <span className="text-lg font-bold">TMĐT<span className="text-blue-600">IoT</span></span>
                            <button onClick={() => setOpen(false)} className="cursor-pointer rounded-lg p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto">{nav}</div>
                    </aside>
                </div>
            )}
            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4">
                    <button onClick={() => setOpen(true)} className="cursor-pointer rounded-lg p-1.5 hover:bg-gray-100 lg:hidden">
                        <Menu className="h-5 w-5" />
                    </button>
                    <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600"><Store className="h-4 w-4" /> Về cửa hàng</Link>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden text-sm text-gray-600 sm:inline">{user?.fullName}</span>
                        <button onClick={() => logout.mutate()} className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-600">
                            <LogOut className="h-4 w-4" /> Đăng xuất
                        </button>
                    </div>
                </header>
                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}