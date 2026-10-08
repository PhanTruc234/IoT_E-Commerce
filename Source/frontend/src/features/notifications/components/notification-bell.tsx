'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useUnreadCount, useNotifications, useNotiActions } from '../hooks/use-notifications';
import type { Notification } from '../api/notifications.api';

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
}

export function NotificationBell() {
    const status = useAuthStore((s) => s.status);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { data: unread } = useUnreadCount();
    const { data: list, isLoading } = useNotifications(open && status === 'authenticated');
    const { markRead, markAll } = useNotiActions();

    if (status !== 'authenticated') return null;
    const count = unread?.count ?? 0;

    const onItem = (n: Notification) => {
        if (!n.read) markRead.mutate(n.id);
        setOpen(false);
        if (n.linkUrl) router.push(n.linkUrl);
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen((o) => !o)} className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100" aria-label="Thông báo">
                <Bell className="h-5 w-5 text-gray-600" />
                {count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                            <span className="text-sm font-semibold text-gray-900">Thông báo</span>
                            {count > 0 && (
                                <button onClick={() => markAll.mutate()} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <Check className="h-3 w-3" /> Đọc tất cả
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
                                : !list || list.length === 0 ? <p className="py-8 text-center text-sm text-gray-400">Chưa có thông báo.</p>
                                    : list.map((n) => (
                                        <button key={n.id} onClick={() => onItem(n)}
                                            className={`block w-full border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${n.read ? '' : 'bg-blue-50/40'}`}>
                                            <div className="flex items-start gap-2">
                                                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                                                <div className={n.read ? 'pl-4' : ''}>
                                                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.body}</p>
                                                    <p className="mt-1 text-[11px] text-gray-400">{timeAgo(n.createdAt)}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}