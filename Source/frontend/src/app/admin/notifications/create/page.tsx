'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Megaphone } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useNotificationMutations } from '@/features/notifications/hooks/use-notifications';
import type { NotificationInput } from '@/features/notifications/api/notifications.api';

const EMPTY: NotificationInput = { title: '', body: '', type: 'SYSTEM', audience: 'ALL' };

export default function CreateNotificationPage() {
    const router = useRouter();
    const { create } = useNotificationMutations();
    const [form, setForm] = useState<NotificationInput>(EMPTY);
    const set = (k: keyof NotificationInput, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const input = 'w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500';

    const submit = () => {
        const body: NotificationInput = { ...form, userId: form.audience === 'USER' ? form.userId : undefined, linkUrl: form.linkUrl || undefined };
        create.mutate(body, { onSuccess: () => router.push('/admin/notifications') });
    };

    return (
        <div>
            <Link href="/admin/notifications" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"><ArrowLeft className="h-4 w-4" /> Quay lại danh sách</Link>
            <PageHeader title="Soạn thông báo" description="Đăng thông báo / khuyến mãi tới người dùng (hiện ở chuông)." />

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2"><span className="mb-1 block text-xs font-medium text-gray-600">Tiêu đề</span>
                        <input className={input} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="VD: Flash Sale 10.10" /></label>
                    <label className="block sm:col-span-2"><span className="mb-1 block text-xs font-medium text-gray-600">Nội dung</span>
                        <textarea className={input} rows={3} value={form.body} onChange={(e) => set('body', e.target.value)} placeholder="Nội dung thông báo..." /></label>
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Loại</span>
                        <select className={input} value={form.type} onChange={(e) => set('type', e.target.value)}>
                            <option value="SYSTEM">Hệ thống</option>
                            <option value="PROMOTION">Khuyến mãi</option>
                            <option value="COUPON">Mã giảm giá</option>
                        </select></label>
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Gửi tới</span>
                        <select className={input} value={form.audience} onChange={(e) => set('audience', e.target.value)}>
                            <option value="ALL">Tất cả người dùng</option>
                            <option value="USER">Một người (nhập ID)</option>
                        </select></label>
                    {form.audience === 'USER' && (
                        <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">User ID</span>
                            <input className={input} value={form.userId ?? ''} onChange={(e) => set('userId', e.target.value)} placeholder="uuid người dùng" /></label>
                    )}
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Liên kết khi bấm (tuỳ chọn)</span>
                        <input className={input} value={form.linkUrl ?? ''} onChange={(e) => set('linkUrl', e.target.value)} placeholder="/products?category=combo" /></label>
                </div>
                <div className="mt-4 flex gap-2">
                    <button onClick={submit} disabled={create.isPending || !form.title || !form.body}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} <Megaphone className="h-4 w-4" /> Đăng
                    </button>
                    <Link href="/admin/notifications" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Huỷ</Link>
                </div>
                {create.isError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(create.error)}</p>}
            </div>
        </div>
    );
}
