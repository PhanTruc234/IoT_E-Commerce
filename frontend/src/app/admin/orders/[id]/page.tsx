'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { formatVnd } from '@/shared/lib/format';
import { useAdminOrder, useUpdateOrderStatus } from '@/features/orders/hooks/use-orders';
import { NEXT_ACTIONS, ORDER_STATUS, PAYMENT_STATUS } from '@/features/orders/constants';
import type { OrderStatus } from '@/features/orders/types';

export default function AdminOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: order, isLoading, isError, error } = useAdminOrder(id);
    const update = useUpdateOrderStatus(id);
    const [cancelling, setCancelling] = useState(false);

    if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
    if (isError || !order) return <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>;

    const actions = NEXT_ACTIONS[order.status];
    const doUpdate = (to: OrderStatus) => update.mutate(to);

    return (
        <div>
            <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4" /> Danh sách đơn
            </Link>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Đơn {order.code}</h1>
                    <Badge color={ORDER_STATUS[order.status].color}>{ORDER_STATUS[order.status].label}</Badge>
                    <Badge color={PAYMENT_STATUS[order.paymentStatus].color}>{PAYMENT_STATUS[order.paymentStatus].label}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    {actions.map((a) =>
                        a.to === 'CANCELLED' ? (
                            <Button key={a.to} variant="secondary" size="sm" onClick={() => setCancelling(true)} disabled={update.isPending}>{a.label}</Button>
                        ) : (
                            <Button key={a.to} size="sm" onClick={() => doUpdate(a.to)} disabled={update.isPending}>
                                {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{a.label}
                            </Button>
                        ),
                    )}
                </div>
            </div>
            {update.isError && <p className="mb-3 text-sm text-red-600">{getApiErrorMessage(update.error)}</p>}

            <div className="grid gap-5 lg:grid-cols-3">
                <div className="space-y-5 lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white">
                        <div className="border-b border-gray-100 px-5 py-3 text-sm font-semibold text-gray-700">Sản phẩm</div>
                        <ul className="divide-y divide-gray-50">
                            {order.items.map((it) => (
                                <li key={it.id} className="flex items-center gap-3 px-5 py-3">
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
                        <div className="space-y-1.5 border-t border-gray-100 px-5 py-4 text-sm">
                            <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{formatVnd(order.subtotal)}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span>{order.shippingFee === 0 ? 'Miễn phí' : formatVnd(order.shippingFee)}</span></div>
                            <div className="flex justify-between pt-1 text-base font-bold text-gray-900"><span>Tổng cộng</span><span className="text-blue-600">{formatVnd(order.total)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Người nhận</p>
                        <p className="font-medium text-gray-800">{order.recipientName}</p>
                        <p className="text-gray-600">{order.phone}</p>
                        <p className="mt-1 text-gray-600">{order.address}</p>
                        {order.note && <p className="mt-1 text-gray-500">Ghi chú: {order.note}</p>}
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Tài khoản đặt</p>
                        <p className="text-gray-800">{order.user?.fullName ?? '—'}</p>
                        <p className="text-gray-500">{order.user?.email}</p>
                        <p className="mt-2 text-xs text-gray-400">Thanh toán: {order.paymentMethod} · Đặt {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={cancelling}
                title="Huỷ đơn hàng"
                message={`Huỷ đơn "${order.code}"? Kho sẽ được hoàn lại các sản phẩm trong đơn.`}
                confirmText="Huỷ đơn"
                error={update.isError ? getApiErrorMessage(update.error) : undefined}
                loading={update.isPending}
                onClose={() => setCancelling(false)}
                onConfirm={() => update.mutate('CANCELLED', { onSuccess: () => setCancelling(false) })}
            />
        </div>
    );
}