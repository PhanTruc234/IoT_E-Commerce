'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarClock, ChevronRight, Loader2, Ticket, Truck, Wallet, Zap } from 'lucide-react';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { SearchSelect } from '@/shared/ui/search-select';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { VatLine } from '@/features/tax/components/vat-line';
import { isIdempotencyConflict, newIdempotencyKey } from '@/shared/lib/idempotency';
import { useCart } from '@/features/cart/hooks/use-cart';
import { useCreateOrder, useCreateDirectOrder } from '@/features/orders/hooks/use-orders';
import { useBuyNowStore } from '@/features/orders/store/buy-now.store';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { PolicyModal } from '@/features/legal/components/policy-modal';
import { PROVINCES } from '@/shared/config/provinces';
import { useProvinces, useShippingConfig, useShippingQuote, useWards } from '@/features/shipping/hooks/use-shipping';
import { calcShippingFee, formatDeliveryDate } from '@/features/shipping/api/shipping.api';
import { useCouponQuote } from '@/features/coupons/hooks/use-coupons';
import { CouponPickerModal } from '@/features/coupons/components/coupon-picker-modal';

const ADDRESS_KEY = 'iotech:last-address';

const schema = z
    .object({
        recipientName: z.string().min(2, 'Nhập họ tên').max(100),
        phone: z.string().regex(/^(0|\+84)\d{8,10}$/, 'Số điện thoại không hợp lệ'),
        addressMode: z.enum(['ghn', 'legacy']),
        provinceId: z.string(),
        wardId: z.string(),
        province: z.string(),
        address: z.string().trim().min(3, 'Nhập số nhà, tên đường').max(255),
        note: z.string().max(500).optional(),
        paymentMethod: z.enum(['COD', 'VNPAY']),
    })
    .superRefine((v, ctx) => {
        if (v.addressMode === 'ghn') {
            if (!v.provinceId) ctx.addIssue({ code: 'custom', path: ['provinceId'], message: 'Chọn tỉnh/thành' });
            if (!v.wardId) ctx.addIssue({ code: 'custom', path: ['wardId'], message: 'Chọn phường/xã' });
        } else if (!v.province) {
            ctx.addIssue({ code: 'custom', path: ['province'], message: 'Chọn tỉnh/thành' });
        }
    });
type FormValues = z.infer<typeof schema>;

interface LineItem { id: string; productId: string; variantId?: string | null; name: string; image: string | null; variantLabel: string | null; quantity: number; unitPrice: number; lineTotal: number }

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
    const provincesQ = useProvinces();
    const ghnDown = provincesQ.isError;
    const create = useCreateOrder();
    const createDirect = useCreateDirectOrder();
    // Giữ nguyên qua các lần bấm lại sau lỗi → nếu lần trước thật ra đã tạo đơn, server trả lại đúng đơn đó
    const orderKey = useRef<string | null>(null);
    const buyNowItem = useBuyNowStore((s) => s.item);
    const clearBuyNow = useBuyNowStore((s) => s.clear);

    const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            recipientName: '', phone: '', addressMode: 'ghn', provinceId: '', wardId: '', province: '', address: '', note: '', paymentMethod: 'COD',
        },
    });
    const method = watch('paymentMethod');
    const provinceId = watch('provinceId');
    const wardId = watch('wardId');
    const legacyProvince = watch('province');
    const wardsQ = useWards(provinceId ? Number(provinceId) : null);

    useEffect(() => {
        if (authStatus === 'unauthenticated') router.replace('/login');
    }, [authStatus, router]);
    useEffect(() => {
        if (user) {
            setValue('recipientName', user.fullName ?? '');
            if (user.phone) setValue('phone', user.phone);
            if (user.address && !getValues('address')) setValue('address', user.address);
        }
    }, [user, setValue, getValues]);
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(ADDRESS_KEY) ?? 'null') as { provinceId?: string; wardId?: string; street?: string } | null;
            if (saved?.provinceId) {
                setValue('provinceId', saved.provinceId);
                setValue('wardId', saved.wardId ?? '');
                if (saved.street) setValue('address', saved.street);
            }
        } catch { }
    }, [setValue]);
    useEffect(() => {
        setValue('addressMode', ghnDown ? 'legacy' : 'ghn');
    }, [ghnDown, setValue]);
    useEffect(() => {
        if (wardsQ.data && wardId && !wardsQ.data.some((w) => String(w.id) === wardId)) setValue('wardId', '');
    }, [wardsQ.data, wardId, setValue]);

    const items: LineItem[] = isBuyNow
        ? (buyNowItem ? [{ id: 'buynow', productId: buyNowItem.productId, variantId: buyNowItem.variantId, name: buyNowItem.name, image: buyNowItem.image, variantLabel: buyNowItem.variantLabel, quantity: buyNowItem.quantity, unitPrice: buyNowItem.unitPrice, lineTotal: buyNowItem.unitPrice * buyNowItem.quantity }] : [])
        : (cart?.items ?? []);
    const itemCount = isBuyNow ? (buyNowItem?.quantity ?? 0) : (cart?.itemCount ?? 0);
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

    const quoteBody = !ghnDown && provinceId && wardId && items.length
        ? { provinceId: Number(provinceId), wardId: Number(wardId), subtotal, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }
        : null;
    const quoteQ = useShippingQuote(quoteBody);
    const quoting = !!quoteBody && quoteQ.isFetching;
    const provinceName = provincesQ.data?.find((p) => String(p.id) === provinceId)?.name;
    const shippingFee = ghnDown
        ? calcShippingFee(shipConfig, subtotal, legacyProvince)
        : !quoteBody ? null
            : quoteQ.data ? quoteQ.data.fee
                : quoteQ.isError ? calcShippingFee(shipConfig, subtotal, provinceName) : null;
    const eta = !ghnDown && quoteBody && quoteQ.data?.source === 'GHN' ? quoteQ.data.expectedDeliveryAt : null;

    const sourceReady = isBuyNow ? !!buyNowItem : !!(cart && cart.items.length > 0);
    const { data: quote } = useCouponQuote(
        {
            subtotal, shippingFee: shippingFee ?? 0, productCode: productCode || undefined, shippingCode: shippingCode || undefined,
            items: items.map((i) => ({ productId: i.productId, variantId: i.variantId ?? undefined, quantity: i.quantity })),
        },
        sourceReady,
    );
    const discountAmount = quote?.discountAmount ?? 0;
    const shippingDiscountAmt = quote?.shippingDiscount ?? 0;
    // Tổng & VAT do backend tính (cùng công thức với lúc tạo đơn); trong lúc chờ thì hiện tạm tổng trước thuế
    const finalTotal = quote?.total ?? Math.max(0, subtotal + (shippingFee ?? 0) - discountAmount - shippingDiscountAmt);
    const freeByThreshold = shipConfig ? subtotal >= shipConfig.freeShipFrom : false;
    const missingForFree = shipConfig && !freeByThreshold ? shipConfig.freeShipFrom - subtotal : 0;
    const carrierFee = quoteBody && !quoting ? quoteQ.data?.carrierFee ?? null : null;
    const subsidy = quoteBody && !quoting && shippingFee ? quoteQ.data?.subsidy ?? 0 : 0;
    const submitting = isBuyNow ? createDirect.isPending : create.isPending;
    const submitIsError = isBuyNow ? createDirect.isError : create.isError;
    const submitError = isBuyNow ? createDirect.error : create.error;
    const rechecking = submitting && (isBuyNow ? createDirect.failureCount : create.failureCount) > 0;

    const onSubmit = (v: FormValues) => {
        const street = v.address.trim();
        const address = v.addressMode === 'ghn'
            ? { provinceId: Number(v.provinceId), wardId: Number(v.wardId), address: street }
            : { province: v.province, address: street };
        const base = {
            recipientName: v.recipientName, phone: v.phone, note: v.note, paymentMethod: v.paymentMethod, ...address,
            productCouponCode: productCode || undefined, shippingCouponCode: shippingCode || undefined,
        };
        orderKey.current ??= newIdempotencyKey();
        const key = orderKey.current;
        const handlers = {
            onError: (e: unknown) => {
                if (isIdempotencyConflict(e)) orderKey.current = null;
            },
            onSuccess: ({ order, paymentUrl }: { order: { id: string }; paymentUrl?: string }) => {
                orderKey.current = null;
                if (v.addressMode === 'ghn') {
                    try { localStorage.setItem(ADDRESS_KEY, JSON.stringify({ provinceId: v.provinceId, wardId: v.wardId, street })); } catch { }
                }
                clearBuyNow();
                if (paymentUrl) window.location.href = paymentUrl;
                else router.push(`/orders/${order.id}`);
            },
        };
        if (isBuyNow && buyNowItem) {
            createDirect.mutate({ body: { ...base, productId: buyNowItem.productId, variantId: buyNowItem.variantId, quantity: buyNowItem.quantity }, key }, handlers);
        } else {
            create.mutate({ body: base, key }, handlers);
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
                                <Input {...register('recipientName')} placeholder="Nguyễn Văn A" autoComplete="name" />
                            </Field>
                            <Field label="Số điện thoại" error={errors.phone?.message}>
                                <Input {...register('phone')} placeholder="0901234567" inputMode="tel" autoComplete="tel" />
                            </Field>
                        </div>

                        {ghnDown ? (
                            <>
                                <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                    Chưa tải được danh sách phường/xã. Bạn vẫn đặt hàng được bằng cách nhập địa chỉ đầy đủ bên dưới.
                                </p>
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
                                        <Input {...register('address')} placeholder="Số nhà, đường, phường/xã" autoComplete="street-address" />
                                    </Field>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Field label="Tỉnh/Thành phố" error={errors.provinceId?.message}>
                                        <Controller
                                            control={control}
                                            name="provinceId"
                                            render={({ field }) => (
                                                <SearchSelect
                                                    value={field.value}
                                                    onChange={(v) => { field.onChange(v); setValue('wardId', ''); }}
                                                    options={(provincesQ.data ?? []).map((p) => ({ value: String(p.id), label: p.name }))}
                                                    placeholder={provincesQ.isLoading ? 'Đang tải…' : 'Chọn tỉnh/thành phố'}
                                                    searchPlaceholder="Tìm tỉnh/thành…"
                                                    loading={provincesQ.isLoading}
                                                    disabled={provincesQ.isLoading}
                                                    invalid={!!errors.provinceId}
                                                />
                                            )}
                                        />
                                    </Field>
                                    <Field label="Phường/Xã" error={errors.wardId?.message ?? (wardsQ.isError ? 'Không tải được phường/xã, hãy chọn lại tỉnh' : undefined)}>
                                        <Controller
                                            control={control}
                                            name="wardId"
                                            render={({ field }) => (
                                                <SearchSelect
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={(wardsQ.data ?? []).map((w) => ({ value: String(w.id), label: w.name }))}
                                                    placeholder={!provinceId ? 'Chọn tỉnh/thành trước' : wardsQ.isLoading ? 'Đang tải…' : 'Chọn phường/xã'}
                                                    searchPlaceholder="Tìm phường/xã (gõ không dấu cũng được)…"
                                                    emptyText="Không có phường/xã phù hợp"
                                                    loading={wardsQ.isFetching}
                                                    disabled={!provinceId || wardsQ.isLoading}
                                                    invalid={!!errors.wardId}
                                                />
                                            )}
                                        />
                                    </Field>
                                </div>
                                <div className="mt-4">
                                    <Field label="Số nhà, tên đường" error={errors.address?.message}>
                                        <Input {...register('address')} placeholder="VD: 12 Hàng Bài" autoComplete="address-line1" />
                                    </Field>
                                </div>
                            </>
                        )}

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
                            <div className="flex items-center justify-between gap-2 text-gray-600">
                                <span className="flex items-center gap-1.5">
                                    Phí vận chuyển
                                    {!ghnDown && <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">GHN</span>}
                                </span>
                                <span className="text-right" aria-live="polite">
                                    {quoting ? <span className="inline-flex items-center gap-1 text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tính…</span>
                                        : shippingFee == null ? <span className="text-gray-400">{ghnDown ? 'Chọn tỉnh/thành' : 'Chọn phường/xã'}</span>
                                            : shippingFee === 0 ? (
                                                <span className="font-medium text-green-600">
                                                    {!!carrierFee && <span className="mr-1.5 text-xs font-normal text-gray-400 line-through">{formatVnd(carrierFee)}</span>}
                                                    Miễn phí
                                                </span>
                                            ) : (
                                                <>
                                                    {subsidy > 0 && <span className="mr-1.5 text-xs text-gray-400 line-through">{formatVnd(carrierFee)}</span>}
                                                    {formatVnd(shippingFee)}
                                                </>
                                            )}
                                </span>
                            </div>
                            {subsidy > 0 && (
                                <p className="text-xs text-green-600">IoTech hỗ trợ {formatVnd(subsidy)} phí vận chuyển</p>
                            )}
                            {eta && !quoting && (
                                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <CalendarClock className="h-3.5 w-3.5 text-blue-600" /> Dự kiến giao: <span className="font-medium text-gray-700">{formatDeliveryDate(eta)}</span>
                                </p>
                            )}
                            {quoteQ.data?.source === 'ZONE' && quoteBody && !quoting && (
                                <p className="text-xs text-gray-400">Phí tạm tính theo khu vực do GHN chưa phản hồi.</p>
                            )}
                            {freeByThreshold && shipConfig && (
                                <p className="text-xs text-green-600">Đơn ≥ {formatVnd(shipConfig.freeShipFrom)} được miễn phí vận chuyển</p>
                            )}
                            {missingForFree > 0 && shipConfig && (
                                <div className="rounded-lg bg-blue-50 px-3 py-2">
                                    <p className="flex items-center justify-between gap-2 text-xs text-blue-700">
                                        <span>Mua thêm <b>{formatVnd(missingForFree)}</b> để được miễn phí vận chuyển</span>
                                        {!isBuyNow && <Link href="/products" className="shrink-0 font-medium underline-offset-2 hover:underline">Mua thêm</Link>}
                                    </p>
                                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-blue-100" aria-hidden>
                                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, (subtotal / shipConfig.freeShipFrom) * 100)}%` }} />
                                    </div>
                                </div>
                            )}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatVnd(discountAmount)}</span></div>
                            )}
                            {shippingDiscountAmt > 0 && (
                                <div className="flex justify-between text-green-600"><span>Giảm phí ship</span><span>-{formatVnd(shippingDiscountAmt)}</span></div>
                            )}
                            {quote && !quote.pricesIncludeTax && <VatLine taxRate={quote.taxRate} taxAmount={quote.taxAmount} pricesIncludeTax={false} />}
                            <div className="flex justify-between pt-1 text-base font-bold text-gray-900">
                                <span>Tổng cộng</span>
                                <span className="text-blue-600">{formatVnd(finalTotal)}</span>
                            </div>
                            {quote?.pricesIncludeTax && <VatLine taxRate={quote.taxRate} taxAmount={quote.taxAmount} pricesIncludeTax />}
                        </div>
                        <label className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded" />
                            <span>
                                Tôi đồng ý với{' '}
                                <button type="button" onClick={() => setShowTerms(true)} className="cursor-pointer font-medium text-blue-600 hover:underline">Điều khoản mua hàng</button>
                            </span>
                        </label>
                        <button type="submit" disabled={submitting || !agreed || quoting}
                            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {method === 'VNPAY' ? 'Thanh toán VNPAY' : 'Đặt hàng'}
                        </button>
                        {rechecking && <p className="mt-2 text-sm text-amber-600">Mạng chập chờn, đang kiểm tra lại đơn hàng… vui lòng không tắt trang.</p>}
                        {submitIsError && (
                            <p className="mt-2 text-sm text-red-600">
                                {getApiErrorMessage(submitError, 'Không kết nối được máy chủ. Bấm đặt hàng lại — hệ thống sẽ không tạo trùng đơn.')}
                                {isIdempotencyConflict(submitError) && <> <Link href="/orders" className="underline">Xem đơn hàng của tôi</Link></>}
                            </p>
                        )}
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