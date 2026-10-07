'use client';
import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Spinner } from '@/shared/ui/spinner';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAdminCoupons, useCouponMutations } from '@/features/coupons/hooks/use-coupons';
import type { CouponInput } from '@/features/coupons/api/coupons.api';

const EMPTY: CouponInput = { code: '', type: 'PRODUCT_DISCOUNT', discountType: 'PERCENT', value: 10, minOrder: 0, perUserLimit: 1, isActive: true };

export default function AdminCouponsPage() {
    const { data, isLoading } = useAdminCoupons();
    const { create, remove } = useCouponMutations();
    const [form, setForm] = useState<CouponInput>(EMPTY);
    const set = (k: keyof CouponInput, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

    const submit = () => {
        const body: CouponInput = {
            ...form,
            code: form.code.trim().toUpperCase(),
            value: Number(form.value),
            minOrder: Number(form.minOrder) || 0,
            maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
            usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
            perUserLimit: Number(form.perUserLimit) || 1,
            endAt: form.endAt || undefined,
        };
        create.mutate(body, { onSuccess: () => setForm(EMPTY) });
    };

    const input = 'rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500';

    return (
        <div>
            <PageHeader title="Mã giảm giá" description="Tạo và quản lý mã giảm tiền hàng / miễn phí vận chuyển." />

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800"><Plus className="h-4 w-4" /> Tạo mã mới</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Mã code</span>
                        <input className={`w-full ${input}`} placeholder="VD: SALE20" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Loại mã</span>
                        <select className={`w-full ${input}`} value={form.type} onChange={(e) => set('type', e.target.value)}>
                            <option value="PRODUCT_DISCOUNT">Giảm tiền hàng</option>
                            <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Kiểu giảm</span>
                        <select className={`w-full ${input}`} value={form.discountType} onChange={(e) => set('discountType', e.target.value)} disabled={form.type === 'FREE_SHIPPING'}>
                            <option value="PERCENT">Theo %</option>
                            <option value="FIXED">Số tiền</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-600">
                            {form.type === 'FREE_SHIPPING' ? 'Giảm ship tối đa (0 = miễn toàn bộ)' : form.discountType === 'PERCENT' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (đ)'}
                        </span>
                        <input className={`w-full ${input}`} type="number" value={form.value} onChange={(e) => set('value', e.target.value)} />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Giảm tối đa (đ) <span className="text-gray-400">· chỉ cho %</span></span>
                        <input className={`w-full ${input}`} type="number" placeholder="Để trống nếu không giới hạn" value={form.maxDiscount ?? ''} onChange={(e) => set('maxDiscount', e.target.value)} disabled={form.discountType !== 'PERCENT' || form.type === 'FREE_SHIPPING'} />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Đơn tối thiểu (đ)</span>
                        <input className={`w-full ${input}`} type="number" placeholder="0 = không yêu cầu" value={form.minOrder ?? ''} onChange={(e) => set('minOrder', e.target.value)} />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Tổng lượt dùng</span>
                        <input className={`w-full ${input}`} type="number" placeholder="Để trống = không giới hạn" value={form.usageLimit ?? ''} onChange={(e) => set('usageLimit', e.target.value)} />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Lượt dùng / người</span>
                        <input className={`w-full ${input}`} type="number" value={form.perUserLimit ?? 1} onChange={(e) => set('perUserLimit', e.target.value)} />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Hạn sử dụng</span>
                        <input className={`w-full ${input}`} type="datetime-local" value={form.endAt ?? ''} onChange={(e) => set('endAt', e.target.value)} />
                    </label>
                </div>
                <button onClick={submit} disabled={create.isPending || !form.code}
                    className="mt-4 flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                    {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Tạo mã
                </button>
                {create.isError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(create.error)}</p>}
            </div>

            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div> : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs text-gray-500">
                            <tr><th className="p-3">Mã</th><th className="p-3">Loại</th><th className="p-3">Giá trị</th><th className="p-3">Đơn tối thiểu</th><th className="p-3">Lượt dùng</th><th className="p-3">HSD</th><th className="p-3"></th></tr>
                        </thead>
                        <tbody>
                            {data?.map((c) => (
                                <tr key={c.id} className="border-t border-gray-100">
                                    <td className="p-3 font-mono font-semibold">{c.code}</td>
                                    <td className="p-3">{c.type === 'FREE_SHIPPING' ? 'Freeship' : 'Giảm hàng'}</td>
                                    <td className="p-3">{c.type === 'FREE_SHIPPING' ? (c.value > 0 ? formatVnd(c.value) : 'Toàn bộ') : c.discountType === 'PERCENT' ? `${c.value}%` : formatVnd(c.value)}</td>
                                    <td className="p-3">{c.minOrder > 0 ? formatVnd(c.minOrder) : '—'}</td>
                                    <td className="p-3">{c.usedCount}{c.usageLimit != null ? `/${c.usageLimit}` : ''}</td>
                                    <td className="p-3">{c.endAt ? new Date(c.endAt).toLocaleDateString('vi-VN') : '—'}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => remove.mutate(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}