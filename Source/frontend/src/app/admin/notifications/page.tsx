'use client';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Spinner } from '@/shared/ui/spinner';
import { useAdminNotifications, useNotificationMutations } from '@/features/notifications/hooks/use-notifications';

export default function AdminNotificationsPage() {
    const { data, isLoading } = useAdminNotifications();
    const { remove } = useNotificationMutations();

    return (
        <div>
            <div className="flex items-start justify-between gap-3">
                <PageHeader title="Thông báo" description="Đăng thông báo / khuyến mãi tới người dùng (hiện ở chuông)." />
                <Link href="/admin/notifications/create" className="mt-1 flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> Soạn thông báo
                </Link>
            </div>

            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div> : (
                <div className="space-y-3">
                    {data?.map((n) => (
                        <div key={n.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900">{n.title} <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">{n.audience === 'ALL' ? 'Tất cả' : '1 người'}</span></p>
                                <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{n.body}</p>
                                <p className="mt-1 text-[11px] text-gray-400">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <button onClick={() => remove.mutate(n.id)} className="shrink-0 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                    {data?.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">Chưa có thông báo nào.</p>}
                </div>
            )}
        </div>
    );
}
