'use client';
import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, CheckCircle2, Star, XCircle } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useOrder, useCancelMyOrder, useRepayOrder } from '@/features/orders/hooks/use-orders';
import { ORDER_STATUS, PAYMENT_STATUS } from '@/features/orders/constants';
import type { OrderStatus } from '@/features/orders/types';
import { ReviewFormModal } from '@/features/reviews/components/review-form-modal';
import { OrderTimeline } from '@/features/orders/components/order-timeline';

const STEPS: { key: OrderStatus; label: string }[] = [
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'SHIPPING', label: 'Đang giao' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
];

function OrderView() {
    const { id } = useParams<{ id: string }>();
    const sp = useSearchParams();
    const payment = sp.get('payment');
    const { data: order, isLoading, isError, error } = useOrder(id);
    console.log(">>> order", order)
    const cancel = useCancelMyOrder();
    const repay = useRepayOrder();
    const [confirming, setConfirming] = useState(false);
    const [reviewTarget, setReviewTarget] = useState<{ productId: string; name: string } | null>(null);

    if (isLoading) return <p className="py-16 text-center text-sm text-gray-400">Đang tải…</p>;
    if (isError || !order) return <p className="py-16 text-center text-sm text-red-600">{getApiErrorMessage(error)}</p>;

    const currentIdx = STEPS.findIndex((s) => s.key === order.status);
    const isCancelled = order.status === 'CANCELLED';

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <Link href="/orders" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4" /> Đơn hàng của tôi
            </Link>

            {payment === 'success' && (
                <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"><CheckCircle2 className="h-5 w-5" /> Thanh toán VNPAY thành công!</div>
            )}
            {payment === 'failed' && (
                <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><XCircle className="h-5 w-5" /> Thanh toán VNPAY thất bại hoặc đã huỷ.</div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Đơn {order.code}</h1>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge color={PAYMENT_STATUS[order.paymentStatus].color}>{PAYMENT_STATUS[order.paymentStatus].label}</Badge>
                        <Badge color={ORDER_STATUS[order.status].color}>{ORDER_STATUS[order.status].label}</Badge>
                    </div>
                </div>

                {isCancelled ? (
                    <div className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        <XCircle className="h-5 w-5" /> Đơn hàng đã bị huỷ.
                    </div>
                ) : (
                    <div className="mt-6 flex items-center">
                        {STEPS.map((s, i) => {
                            const done = i <= currentIdx;
                            return (
                                <div key={s.key} className="flex flex-1 items-center last:flex-none">
                                    <div className="flex flex-col items-center">
                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${done ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            {done ? <Check className="h-4 w-4" /> : i + 1}
                                        </span>
                                        <span className={`mt-1 w-16 text-center text-[11px] ${done ? 'font-medium text-blue-600' : 'text-gray-400'}`}>{s.label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < currentIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-6 grid gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Giao đến</p>
                        <p className="font-medium text-gray-800">{order.recipientName} · {order.phone}</p>
                        <p className="text-gray-600">{order.address}</p>
                        {order.note && <p className="mt-1 text-gray-500">Ghi chú: {order.note}</p>}
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Thanh toán</p>
                        <p className="text-gray-700">{order.paymentMethod === 'COD' ? 'Khi nhận hàng (COD)' : 'VNPAY'}</p>
                        <Link href="/legal/purchase" className="mt-1 block text-xs text-blue-600 hover:underline">Điều khoản mua hàng</Link>
                    </div>
                </div>

                <ul className="mt-4 divide-y divide-gray-100 border-y border-gray-100">
                    {order.items.map((it) => (
                        <li key={it.id} className="py-3">
                            <div className="flex items-center gap-3">
                                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-gray-100 bg-gray-50">
                                    {it.image && <Image src={it.image} alt="" fill sizes="48px" className="object-contain p-1" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="line-clamp-1 text-sm text-gray-800">{it.name}</span>
                                    {it.variantLabel && <span className="block text-xs text-indigo-600">{it.variantLabel}</span>}
                                    <span className="text-xs text-gray-500">{it.quantity} × {formatVnd(it.unitPrice)}</span>
                                </span>
                                <span className="shrink-0 text-sm font-medium text-gray-700">{formatVnd(it.lineTotal)}</span>
                            </div>
                            {order.status === 'COMPLETED' && (
                                <div className="mt-2 text-right">
                                    <button
                                        type="button"
                                        onClick={() => setReviewTarget({ productId: it.productId, name: it.name })}
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
                                    >
                                        <Star className="h-3.5 w-3.5" /> Đánh giá
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                <div className="space-y-1.5 pt-4 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{formatVnd(order.subtotal)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span>{order.shippingFee === 0 ? 'Miễn phí' : formatVnd(order.shippingFee)}</span></div>
                    <div className="flex justify-between pt-1 text-base font-bold text-gray-900"><span>Tổng cộng</span><span className="text-blue-600">{formatVnd(order.total)}</span></div>
                </div>

                {order.status === 'PENDING' && (
                    <div className="mt-5 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                        {order.paymentMethod === 'VNPAY' && order.paymentStatus !== 'PAID' && (
                            <button
                                type="button"
                                disabled={repay.isPending}
                                onClick={() => repay.mutate(order.id, { onSuccess: ({ paymentUrl }) => { window.location.href = paymentUrl; } })}
                                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {repay.isPending ? 'Đang tạo…' : 'Thanh toán lại'}
                            </button>
                        )}
                        <button onClick={() => setConfirming(true)} className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-red-300 hover:text-red-600">
                            Huỷ đơn hàng
                        </button>
                    </div>
                )}
            </div>
            {order.orderStatusHistories && order.orderStatusHistories.length > 0 && (
                <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6">
                    <h2 className="mb-4 text-sm font-semibold text-gray-700">Lịch sử đơn hàng</h2>
                    <OrderTimeline history={order.orderStatusHistories} />
                </div>
            )}
            <ConfirmDialog
                open={confirming}
                title="Huỷ đơn hàng"
                message={`Huỷ đơn "${order.code}"? Thao tác này không thể hoàn tác.`}
                confirmText="Huỷ đơn"
                error={cancel.isError ? getApiErrorMessage(cancel.error) : undefined}
                loading={cancel.isPending}
                onClose={() => { setConfirming(false); cancel.reset(); }}
                onConfirm={() => cancel.mutate(order.id, { onSuccess: () => setConfirming(false) })}
            />

            {reviewTarget && (
                <ReviewFormModal
                    productId={reviewTarget.productId}
                    productName={reviewTarget.name}
                    onClose={() => setReviewTarget(null)}
                />
            )}
        </div>
    );
}

export default function OrderDetailPage() {
    return (
        <Suspense fallback={<p className="py-16 text-center text-sm text-gray-400">Đang tải…</p>}>
            <OrderView />
        </Suspense>
    );
}