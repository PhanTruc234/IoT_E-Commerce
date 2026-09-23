'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBag } from 'lucide-react';
import { Spinner } from '@/shared/ui/spinner';
import { Badge } from '@/shared/ui/badge';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { formatVnd } from '@/shared/lib/format';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useMyOrders, useCancelMyOrder } from '@/features/orders/hooks/use-orders';
import { ORDER_STATUS, PAYMENT_STATUS } from '@/features/orders/constants';
import type { Order, OrderStatus } from '@/features/orders/types';

const FILTERS: { key: OrderStatus | ''; label: string }[] = [
    { key: '', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'SHIPPING', label: 'Đang giao' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã huỷ' },
];

export default function MyOrdersPage() {
    const router = useRouter();
    const authStatus = useAuthStore((s) => s.status);
    const { data, isLoading } = useMyOrders();
    const cancel = useCancelMyOrder();
    const [filter, setFilter] = useState<OrderStatus | ''>('');
    const [target, setTarget] = useState<Order | null>(null);

    useEffect(() => {
        if (authStatus === 'unauthenticated') router.replace('/login');
    }, [authStatus, router]);

    const orders = (data ?? []).filter((o) => (filter ? o.status === filter : true));

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <ShoppingBag className="h-6 w-6 text-blue-600" /> Đơn hàng của tôi
            </h1>
            <p className="mb-5 text-sm text-gray-500">Theo dõi và quản lý các đơn đã đặt.</p>

            <div className="mb-5 flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${filter === f.key ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16"><Spinner /></div>
            ) : orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
                    <Package className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                    <p className="text-sm text-gray-500">Chưa có đơn hàng nào.</p>
                    <Link href="/products" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Mua sắm ngay →</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o) => {
                        const count = o.items.reduce((s, i) => s + i.quantity, 0);
                        return (
                            <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-800">{o.code}</span>
                                        <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge color={PAYMENT_STATUS[o.paymentStatus].color}>{PAYMENT_STATUS[o.paymentStatus].label}</Badge>
                                        <Badge color={ORDER_STATUS[o.status].color}>{ORDER_STATUS[o.status].label}</Badge>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 py-3">
                                    {o.items.slice(0, 4).map((it) => (
                                        <span key={it.id} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                            {it.image && <Image src={it.image} alt="" fill sizes="48px" className="object-contain p-1" />}
                                        </span>
                                    ))}
                                    {o.items.length > 4 && <span className="text-xs text-gray-400">+{o.items.length - 4}</span>}
                                    <span className="ml-2 line-clamp-1 flex-1 text-sm text-gray-600">{o.items[0]?.name}{o.items.length > 1 ? ` và ${o.items.length - 1} SP khác` : ''}</span>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                                    <span className="text-sm text-gray-500">{count} sản phẩm · <span className="font-bold text-blue-600">{formatVnd(o.total)}</span></span>
                                    <div className="flex items-center gap-2">
                                        {o.status === 'PENDING' && (
                                            <button onClick={() => setTarget(o)} className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-red-300 hover:text-red-600">
                                                Huỷ đơn
                                            </button>
                                        )}
                                        <Link href={`/orders/${o.id}`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                open={target !== null}
                title="Huỷ đơn hàng"
                message={`Huỷ đơn "${target?.code}"? Thao tác này không thể hoàn tác.`}
                confirmText="Huỷ đơn"
                error={cancel.isError ? getApiErrorMessage(cancel.error) : undefined}
                loading={cancel.isPending}
                onClose={() => { setTarget(null); cancel.reset(); }}
                onConfirm={() => { if (target) cancel.mutate(target.id, { onSuccess: () => setTarget(null) }); }}
            />
        </div>
    );
}