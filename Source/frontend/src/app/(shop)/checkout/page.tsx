'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, Loader2, Ticket, Truck, Wallet, Zap } from 'lucide-react';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useCart } from '@/features/cart/hooks/use-cart';
import { useCreateOrder, useCreateDirectOrder } from '@/features/orders/hooks/use-orders';
import { useBuyNowStore } from '@/features/orders/store/buy-now.store';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { PolicyModal } from '@/features/legal/components/policy-modal';
import { PROVINCES } from '@/shared/config/provinces';
import { useShippingConfig } from '@/features/shipping/hooks/use-shipping';
import { calcShippingFee } from '@/features/shipping/api/shipping.api';
import { useCouponQuote } from '@/features/coupons/hooks/use-coupons';
import { CouponPickerModal } from '@/features/coupons/components/coupon-picker-modal';

const schema = z.object({
    recipientName: z.string().min(2, 'Nhập họ tên').max(100),
    phone: z.string().regex(/^(0|\+84)\d{8,10}$/, 'Số điện thoại không hợp lệ'),
    province: z.string().min(1, 'Chọn tỉnh/thành'),
    address: z.string().min(5, 'Nhập địa chỉ').max(255),
    note: z.string().max(500).optional(),
    paymentMethod: z.enum(['COD', 'VNPAY']),
});
type FormValues = z.infer<typeof schema>;

interface LineItem { id: string; name: string; image: string | null; variantLabel: string | null; quantity: number; unitPrice: number; lineTotal: number }

function CheckoutInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isBuyNow = searchParams.get('buynow') === '1';

    const user = useAuthStore((s) => s.user);
    const authStatus = useAuthStore((s) => s.status);

    const [agreed, setAgreed] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [productCode, setProductCode] = useState('');
    const [shippingCode, setShippingCode] = useState('');
    const [showCoupon, setShowCoupon] = useState(false);

    const { data: cart, isLoading } = useCart();
    const { data: shipConfig } = useShippingConfig();
    const create = useCreateOrder();
    const createDirect = useCreateDirectOrder();
    const buyNowItem = useBuyNowStore((s) => s.item);
    const clearBuyNow = useBuyNowStore((s) => s.clear);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { recipientName: '', phone: '', province: '', address: '', note: '', paymentMethod: 'COD' },
    });
    const method = watch('paymentMethod');
    const province = watch('province');

    useEffect(() => {
        if (authStatus === 'unauthenticated') router.replace('/login');
    }, [authStatus, router]);
    useEffect(() => {
        if (user) {
            setValue('recipientName', user.fullName ?? '');
            if (user.phone) setValue('phone', user.phone);
            if (user.address) setValue('address', user.address);
        }
    }, [user, setValue]);

    // Nguồn dữ liệu: mua ngay (1 món) hoặc toàn bộ giỏ hàng
    const items: LineItem[] = isBuyNow
        ? (buyNowItem ? [{ id: 'buynow', name: buyNowItem.name, image: buyNowItem.image, variantLabel: buyNowItem.variantLabel, quantity: buyNowItem.quantity, unitPrice: buyNowItem.unitPrice, lineTotal: buyNowItem.unitPrice * buyNowItem.quantity }] : [])
        : (cart?.items ?? []);
    const itemCount = isBuyNow ? (buyNowItem?.quantity ?? 0) : (cart?.itemCount ?? 0);
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

    const shippingFee = calcShippingFee(shipConfig, subtotal, province);
    const sourceReady = isBuyNow ? !!buyNowItem : !!(cart && cart.items.length > 0);
    const { data: quote } = useCouponQuote(
        { subtotal, shippingFee: shippingFee ?? 0, productCode: productCode || undefined, shippingCode: shippingCode || undefined },
        sourceReady,
    );
    const discountAmount = quote?.discountAmount ?? 0;
    const shippingDiscountAmt = quote?.shippingDiscount ?? 0;
    const finalTotal = Math.max(0, subtotal + (shippingFee ?? 0) - discountAmount - shippingDiscountAmt);
    const freeByThreshold = shipConfig ? subtotal >= shipConfig.freeShipFrom : false;

    const submitting = isBuyNow ? createDirect.isPending : create.isPending;
    const submitIsError = isBuyNow ? createDirect.isError : create.isError;
    const submitError = isBuyNow ? createDirect.error : create.error;

    const onSubmit = (v: FormValues) => {
        const coupons = { productCouponCode: productCode || undefined, shippingCouponCode: shippingCode || undefined };
        const handlers = {
            onSuccess: ({ order, paymentUrl }: { order: { id: string }; paymentUrl?: string }) => {
                clearBuyNow();
                if (paymentUrl) window.location.href = paymentUrl;
                else router.push(`/orders/${order.id}`);
            },
        };
        if (isBuyNow && buyNowItem) {
            createDirect.mutate({ ...v, ...coupons, productId: buyNowItem.productId, variantId: buyNowItem.variantId, quantity: buyNowItem.quantity }, handlers);
        } else {
            create.mutate({ ...v, ...coupons }, handlers);
        }
    };

    // ----- Guard render (sau khi đã gọi hết hook) -----
    if (isBuyNow && !buyNowItem) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-16 text-center">
                <p className="text-sm text-gray-500">Phiên “Mua ngay” đã kết thúc hoặc trang vừa được tải lại.</p>
                <Link href="/products" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Chọn sản phẩm →</Link>
            </div>
        );
    }
    if (!isBuyNow) {
        if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-400">Đang tải…</div>;
        if (!cart || cart.items.length === 0) {
            return (
                <div className="mx-auto max-w-6xl px-4 py-16 text-center">
                    <p className="text-sm text-gray-500">Giỏ hàng trống.</p>
                    <Link href="/products" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Mua sắm ngay →</Link>
                </div>
            );
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                Thanh toán
                {isBuyNow && <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600"><Zap className="h-3.5 w-3.5" /> Mua ngay</span>}
            </h1>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <section className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                            <Truck className="h-5 w-5 text-blue-600" /> Thông tin giao hàng</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Họ và tên" error={errors.recipientName?.message}>
                                <Input {...register('recipientName')} placeholder="Nguyễn Văn A" />
                            </Field>
                            <Field label="Số điện thoại" error={errors.phone?.message}>
                                <Input {...register('phone')} placeholder="0901234567" />
                            </Field>
                        </div>
                        <div className="mt-4">
                            <Field label="Tỉnh/Thành" error={errors.province?.message}>
                                <select {...register('province')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <option value="">— Chọn tỉnh/thành —</option>
                                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </Field>
                        </div>
                        <div className="mt-4">
                            <Field label="Địa chỉ nhận hàng" error={errors.address?.message}>
                                <Input {...register('address')} placeholder="Số nhà, đường, phường/xã, quận/huyện" />
                            </Field>
                        </div>
                        <div className="mt-4">
                            <Field label="Ghi chú (tuỳ chọn)">
                                <textarea {...register('note')} rows={3} placeholder="Ghi chú cho người giao hàng…"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </Field>
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                            <Wallet className="h-5 w-5 text-blue-600" /> Phương thức thanh toán</h2>
                        <div className="space-y-2">
                            {([
                                { v: 'COD', label: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi nhận' },
                                { v: 'VNPAY', label: 'VNPAY', desc: 'Thẻ/QR qua cổng VNPAY' },
                            ] as const).map((m) => (
                                <label key={m.v} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${method === m.v ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                    <input type="radio" value={m.v} {...register('paymentMethod')} className="mt-1" />
                                    <span>
                                        <span className="block text-sm font-medium text-gray-800">{m.label}</span>
                                        <span className="block text-xs text-gray-500">{m.desc}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>
                <aside className="lg:col-span-1">
                    <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 font-semibold text-gray-900">Đơn hàng ({itemCount})</h2>
                        <ul className="max-h-64 space-y-3 overflow-y-auto">
                            {items.map((it) => (
                                <li key={it.id} className="flex gap-3">
                                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-gray-100 bg-gray-50">
                                        {it.image && <Image src={it.image} alt="" fill sizes="48px" className="object-contain p-1" />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="line-clamp-1 text-sm text-gray-800">{it.name}</span>
                                        {it.variantLabel && <span className="block text-xs text-indigo-600">{it.variantLabel}</span>}
                                        <span className="text-xs text-gray-500">{it.quantity} × {formatVnd(it.unitPrice)}</span>
                                    </span>
                                    <span className="shrink-0 text-sm font-medium text-gray-700">{formatVnd(it.lineTotal)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mb-4 border-t border-gray-100 pt-4">
                            <button type="button" onClick={() => setShowCoupon(true)}
                                className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm hover:bg-gray-50">
                                <span className="flex items-center gap-2 font-medium text-gray-800"><Ticket className="h-4 w-4 text-blue-600" /> Mã giảm giá</span>
                                <span className="flex items-center gap-1 text-gray-400">
                                    {productCode || shippingCode
                                        ? <span className="font-medium text-blue-600">Đã chọn {[productCode, shippingCode].filter(Boolean).length} mã</span>
                                        : 'Chọn mã'}
                                    <ChevronRight className="h-4 w-4" />
                                </span>
                            </button>
                            {(productCode || shippingCode) && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {productCode && <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-600">{productCode}</span>}
                                    {shippingCode && <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-600">{shippingCode}</span>}
                                </div>
                            )}
                            {quote?.errors.product && <p className="mt-1 text-xs text-red-500">{quote.errors.product}</p>}
                            {quote?.errors.shipping && <p className="mt-1 text-xs text-red-500">{quote.errors.shipping}</p>}
                        </div>
                        <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
                            <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{formatVnd(subtotal)}</span></div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span>
                                    {shippingFee == null ? <span className="text-gray-400">Chọn tỉnh/thành</span>
                                        : shippingFee === 0 ? <span className="font-medium text-green-600">Miễn phí</span>
                                            : formatVnd(shippingFee)}
                                </span>
                            </div>
                            {freeByThreshold && shipConfig && (
                                <p className="text-xs text-green-600">Đơn ≥ {formatVnd(shipConfig.freeShipFrom)} được miễn phí vận chuyển</p>
                            )}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatVnd(discountAmount)}</span></div>
                            )}
                            {shippingDiscountAmt > 0 && (
                                <div className="flex justify-between text-green-600"><span>Giảm phí ship</span><span>-{formatVnd(shippingDiscountAmt)}</span></div>
                            )}
                            <div className="flex justify-between pt-1 text-base font-bold text-gray-900">
                                <span>Tổng cộng</span>
                                <span className="text-blue-600">{formatVnd(finalTotal)}</span>
                            </div>
                        </div>
                        <label className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded" />
                            <span>
                                Tôi đồng ý với{' '}
                                <button type="button" onClick={() => setShowTerms(true)} className="cursor-pointer font-medium text-blue-600 hover:underline">Điều khoản mua hàng</button>
                            </span>
                        </label>
                        <button type="submit" disabled={submitting || !agreed}
                            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {method === 'VNPAY' ? 'Thanh toán VNPAY' : 'Đặt hàng'}
                        </button>
                        {submitIsError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(submitError)}</p>}
                    </div>
                </aside>
            </div>
            {showTerms && <PolicyModal slug="purchase" onClose={() => setShowTerms(false)} />}
            <CouponPickerModal
                open={showCoupon}
                onClose={() => setShowCoupon(false)}
                initialProduct={productCode}
                initialShipping={shippingCode}
                onApply={(p, s) => { setProductCode(p); setShippingCode(s); }}
            />
        </form>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-400">Đang tải…</div>}>
            <CheckoutInner />
        </Suspense>
    );
}
