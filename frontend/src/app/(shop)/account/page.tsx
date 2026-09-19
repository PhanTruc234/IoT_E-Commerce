'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, UserCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { ProfileCard } from '@/features/auth/components/profile-card';
import { SessionsCard } from '@/features/auth/components/sessions-card';

type Tab = 'profile' | 'sessions';

const NAV: { key: Tab; label: string; icon: React.ElementType; title: string; desc: string }[] = [
    {
        key: 'profile',
        label: 'Thông tin cá nhân',
        icon: UserCircle,
        title: 'Thông tin cá nhân',
        desc: 'Quản lý thông tin cá nhân của bạn. Thông tin này sẽ được sử dụng khi bạn đặt hàng.',
    },
    {
        key: 'sessions',
        label: 'Thiết bị đăng nhập',
        icon: Monitor,
        title: 'Thiết bị đăng nhập',
        desc: 'Xem và quản lý các thiết bị đang đăng nhập vào tài khoản của bạn.',
    },
];

export default function AccountPage() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const status = useAuthStore((s) => s.status);
    const [tab, setTab] = useState<Tab>('profile');

    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/login');
    }, [status, router]);

    const active = NAV.find((n) => n.key === tab)!;
    const initial = user?.fullName?.charAt(0).toUpperCase() ?? '?';

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-col gap-6 lg:flex-row">
                <aside className="lg:w-72 lg:shrink-0">
                    <div className="space-y-4 lg:sticky lg:top-24">
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="flex flex-col items-center border-b border-gray-100 pb-5 text-center">
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-sm">
                                    {initial}
                                </span>
                                <p className="mt-3 font-semibold text-gray-900">{user?.fullName ?? '—'}</p>
                                <p className="max-w-full truncate text-xs text-gray-400">{user?.email}</p>
                            </div>
                            <nav className="mt-4 space-y-1">
                                {NAV.map((n) => {
                                    const on = tab === n.key;
                                    return (
                                        <button
                                            key={n.key}
                                            type="button"
                                            onClick={() => setTab(n.key)}
                                            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${on ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <n.icon className="h-5 w-5 shrink-0" />
                                            {n.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                            <div>
                                <p className="text-sm font-medium text-emerald-800">Bảo vệ tài khoản</p>
                                <p className="mt-0.5 text-xs text-emerald-700">
                                    Cập nhật thông tin và kiểm tra thiết bị đăng nhập thường xuyên để giữ tài khoản an toàn.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="min-w-0 flex-1">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{active.title}</h1>
                        <p className="mt-1 text-sm text-gray-500">{active.desc}</p>
                    </div>
                    {tab === 'profile' && <ProfileCard />}
                    {tab === 'sessions' && <SessionsCard />}
                </div>
            </div>
        </div>
    );
}
