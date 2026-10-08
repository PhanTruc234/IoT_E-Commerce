'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Check, Ticket, Loader2 } from 'lucide-react';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useMyCoupons, useSaveCoupon } from '../hooks/use-coupons';
import type { MyCoupon } from '../api/coupons.api';

function describe(c: MyCoupon): string {
    if (c.type === 'FREE_SHIPPING') return c.value > 0 ? `Giảm tối đa ${formatVnd(c.value)} phí ship` : 'Miễn phí vận chuyển';
    const base = c.discountType === 'PERCENT' ? `Giảm ${c.value}%` : `Giảm ${formatVnd(c.value)}`;
    const cap = c.discountType === 'PERCENT' && c.maxDiscount ? ` (tối đa ${formatVnd(c.maxDiscount)})` : '';
    return base + cap;
}

function Group({ title, list, selected, onSelect }: { title: string; list: MyCoupon[]; selected: string; onSelect: (code: string) => void }) {
    return (
        <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
            {list.length === 0 ? (
                <p className="text-xs text-gray-400">Chưa có mã. <Link href="/vouchers" className="text-blue-600 hover:underline">Săn/lưu mã →</Link></p>
            ) : (
                <div className="space-y-2">
                    {list.map((c) => {
                        const on = selected === c.code;
                        return (
                            <button key={c.id} type="button" onClick={() => onSelect(on ? '' : c.code)}
                                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left ${on ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <span className="min-w-0">
                                    <span className="font-mono text-sm font-bold text-blue-600">{c.code}</span>
                                    <span className="block text-xs text-gray-700">{describe(c)}</span>
                                    {c.minOrder > 0 && <span className="block text-[11px] text-gray-400">Đơn tối thiểu {formatVnd(c.minOrder)}</span>}
                                </span>
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${on ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'}`}>
                                    {on && <Check className="h-3.5 w-3.5" />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function CouponPickerModal({ open, onClose, initialProduct, initialShipping, onApply }: {
    open: boolean;
    onClose: () => void;
    initialProduct: string;
    initialShipping: string;
    onApply: (product: string, shipping: string) => void;
}) {
    const { data: myCoupons } = useMyCoupons();
    const save = useSaveCoupon();
    const [product, setProduct] = useState(initialProduct);
    const [shipping, setShipping] = useState(initialShipping);
    const [addCode, setAddCode] = useState('');

    useEffect(() => {
        if (open) { setProduct(initialProduct); setShipping(initialShipping); }
    }, [open, initialProduct, initialShipping]);

    if (!open) return null;

    const productVouchers = (myCoupons ?? []).filter((c) => c.type === 'PRODUCT_DISCOUNT' && c.status === 'ACTIVE');
    const shipVouchers = (myCoupons ?? []).filter((c) => c.type === 'FREE_SHIPPING' && c.status === 'ACTIVE');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900"><Ticket className="h-5 w-5 text-blue-600" /> Chọn mã giảm giá</h3>
                    <button type="button" onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
                    <div>
                        <div className="flex gap-2">
                            <input value={addCode} onChange={(e) => setAddCode(e.target.value.toUpperCase())}
                                placeholder="Nhập mã để lưu vào ví"
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500" />
                            <button type="button" disabled={!addCode || save.isPending}
                                onClick={() => save.mutate(addCode, { onSuccess: () => setAddCode('') })}
                                className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                                {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Lưu
                            </button>
                        </div>
                        {save.isError && <p className="mt-1 text-xs text-red-500">{getApiErrorMessage(save.error)}</p>}
                    </div>

                    <Group title="Mã giảm tiền hàng" list={productVouchers} selected={product} onSelect={setProduct} />
                    <Group title="Mã miễn phí vận chuyển" list={shipVouchers} selected={shipping} onSelect={setShipping} />
                </div>

                <div className="flex gap-2 border-t border-gray-100 px-5 py-3">
                    <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Trở lại</button>
                    <button type="button" onClick={() => { onApply(product, shipping); onClose(); }}
                        className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Áp dụng</button>
                </div>
            </div>
        </div>
    );
}
