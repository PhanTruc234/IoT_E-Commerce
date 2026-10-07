'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Clock, Loader2 } from 'lucide-react';
import { formatVnd } from '@/shared/lib/format';
import { Spinner } from '@/shared/ui/spinner';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useMyCoupons, useSaveCoupon } from '@/features/coupons/hooks/use-coupons';
import type { MyCoupon } from '@/features/coupons/api/coupons.api';

function describe(c: MyCoupon): string {
    if (c.type === 'FREE_SHIPPING') return c.value > 0 ? `Giảm tối đa ${formatVnd(c.value)} phí ship` : 'Miễn phí vận chuyển';
    const base = c.discountType === 'PERCENT' ? `Giảm ${c.value}%` : `Giảm ${formatVnd(c.value)}`;
    const cap = c.discountType === 'PERCENT' && c.maxDiscount ? ` (tối đa ${formatVnd(c.maxDiscount)})` : '';
    return base + cap;
}
function daysLeft(endAt: string | null): string {
    if (!endAt) return 'Không thời hạn';
    const d = Math.ceil((new Date(endAt).getTime() - Date.now()) / 86400000);
    return d <= 0 ? 'Hết hạn' : d <= 3 ? `Sắp hết hạn: còn ${d} ngày` : `Còn ${d} ngày`;
}

export default function VouchersPage() {
    const router = useRouter();
    const status = useAuthStore((s) => s.status);
    const { data, isLoading } = useMyCoupons();
    const save = useSaveCoupon();
    const [code, setCode] = useState('');

    useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Ticket className="h-6 w-6 text-blue-600" /> Ví mã giảm giá
            </h1>

            <div className="mb-6 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Nhập mã để lưu"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500" />
                <button onClick={() => code && save.mutate(code, { onSuccess: () => setCode('') })} disabled={save.isPending || !code}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                    {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Lưu mã
                </button>
            </div>
            {save.isError && <p className="-mt-4 mb-4 text-sm text-red-600">{getApiErrorMessage(save.error)}</p>}

            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
                : !data || data.length === 0 ? <p className="py-12 text-center text-sm text-gray-400">Ví mã của bạn đang trống.</p>
                    : (
                        <div className="space-y-3">
                            {data.map((c) => {
                                const dim = c.status !== 'ACTIVE';
                                const near = c.status === 'ACTIVE' && c.endAt && Math.ceil((new Date(c.endAt).getTime() - Date.now()) / 86400000) <= 3;
                                return (
                                    <div key={c.id} className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${dim ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'}`}>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-blue-600 px-2 py-0.5 font-mono text-sm font-bold text-white">{c.code}</span>
                                                <span className="text-xs text-gray-400">{c.type === 'FREE_SHIPPING' ? 'Freeship' : 'Giảm tiền hàng'}</span>
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-gray-800">{describe(c)}</p>
                                            {c.minOrder > 0 && <p className="text-xs text-gray-400">Đơn tối thiểu {formatVnd(c.minOrder)}</p>}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            {c.status === 'USED' ? <span className="text-xs text-gray-400">Đã dùng</span>
                                                : c.status === 'EXPIRED' ? <span className="text-xs text-gray-400">Hết hạn</span>
                                                    : <span className={`flex items-center gap-1 text-xs ${near ? 'font-medium text-red-500' : 'text-gray-400'}`}><Clock className="h-3 w-3" />{daysLeft(c.endAt)}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
        </div>
    );
}