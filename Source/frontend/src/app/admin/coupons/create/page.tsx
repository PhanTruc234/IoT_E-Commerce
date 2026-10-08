'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useCouponMutations } from '@/features/coupons/hooks/use-coupons';
import type { CouponInput } from '@/features/coupons/api/coupons.api';

const EMPTY: CouponInput = { code: '', type: 'PRODUCT_DISCOUNT', discountType: 'PERCENT', value: 10, minOrder: 0, perUserLimit: 1, isActive: true };

export default function CreateCouponPage() {
    const router = useRouter();
    const { create } = useCouponMutations();
    const [form, setForm] = useState<CouponInput>(EMPTY);
    const set = (k: keyof CouponInput, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const toISO = (v?: string) => (v ? new Date(v).toISOString() : undefined);
    const input = 'rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500';

    const submit = () => {
        if (form.isFlashSale && form.claimStartAt && form.claimEndAt && new Date(form.claimEndAt) <= new Date(form.claimStartAt)) {
            alert('Giờ đóng săn phải SAU giờ mở săn.');
            return;
        }
        const body: CouponInput = {
            ...form,
            code: form.code.trim().toUpperCase(),
            value: Number(form.value),
            minOrder: Number(form.minOrder) || 0,
            maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
            usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
            perUserLimit: Number(form.perUserLimit) || 1,
            startAt: toISO(form.startAt),
            endAt: toISO(form.endAt),
            isFlashSale: form.isFlashSale || undefined,
            claimStartAt: form.isFlashSale ? toISO(form.claimStartAt) : undefined,
            claimEndAt: form.isFlashSale ? toISO(form.claimEndAt) : undefined,
            claimLimit: form.isFlashSale && form.claimLimit ? Number(form.claimLimit) : undefined,
        };
        create.mutate(body, { onSuccess: () => router.push('/admin/coupons') });
    };

    return (
        <div>
            <Link href="/admin/coupons" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"><ArrowLeft className="h-4 w-4" /> Quay lại danh sách</Link>
            <PageHeader title="Tạo mã giảm giá" description="Tạo mã giảm tiền hàng / miễn phí vận chuyển." />

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
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

                <div className="mt-4 rounded-lg border border-red-100 bg-red-50/40 p-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800">
                        <input type="checkbox" checked={!!form.isFlashSale} onChange={(e) => set('isFlashSale', e.target.checked)} className="h-4 w-4" />
                        ⚡ Mã săn theo khung giờ
                    </label>
                    {form.isFlashSale && (
                        <div className="mt-3 grid gap-4 sm:grid-cols-3">
                            <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Giờ mở săn</span>
                                <input className={`w-full ${input}`} type="datetime-local" value={form.claimStartAt ?? ''} onChange={(e) => set('claimStartAt', e.target.value)} /></label>
                            <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Giờ đóng săn</span>
                                <input className={`w-full ${input}`} type="datetime-local" value={form.claimEndAt ?? ''} onChange={(e) => set('claimEndAt', e.target.value)} /></label>
                            <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Số lượng mã phát</span>
                                <input className={`w-full ${input}`} type="number" placeholder="VD: 50" value={form.claimLimit ?? ''} onChange={(e) => set('claimLimit', e.target.value)} /></label>
                        </div>
                    )}
                    <p className="mt-2 text-xs text-gray-400">Khách vào trang “Săn mã” để lấy trong khung giờ; hết số lượng là dừng. Vẫn nên đặt “Hạn sử dụng” ở trên để giới hạn thời gian dùng mã sau khi đã săn.</p>
                </div>

                <div className="mt-4 flex gap-2">
                    <button onClick={submit} disabled={create.isPending || !form.code}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Tạo mã
                    </button>
                    <Link href="/admin/coupons" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Huỷ</Link>
                </div>
                {create.isError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(create.error)}</p>}
            </div>
        </div>
    );
}
