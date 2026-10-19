'use client';
import { useState } from 'react';
import { FlaskConical, Loader2, PackagePlus, Printer, RefreshCw } from 'lucide-react';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { formatVnd } from '@/shared/lib/format';
import { useShipmentAction, useShipmentLabel, useShipmentLive } from '../hooks/use-orders';
import { ghnStatus, SIMULATE_STATUSES } from '../constants';
import type { AdminOrderDetail } from '../types';

const btn = 'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';

/** Thao tác vận đơn GHN cho admin: tạo (đơn VNPAY), đồng bộ, in nhãn, giả lập trên sandbox */
export function ShipmentAdminPanel({ order }: { order: AdminOrderDetail }) {
    const action = useShipmentAction(order.id);
    const label = useShipmentLabel(order.id);
    const live = useShipmentLive(order.id, !!order.trackingCode);
    const [simStatus, setSimStatus] = useState('picked');

    const needCreate = order.status === 'CONFIRMED' && !order.trackingCode && order.canShip;
    if (!order.trackingCode && !needCreate) {
        if (order.canShip || order.status === 'CANCELLED') return null;
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-500">
                Đơn dùng địa chỉ kiểu cũ (chưa có phường/xã) nên không tạo được vận đơn GHN — giao thủ công như trước.
            </div>
        );
    }
    const print = () => {
        const win = window.open('about:blank', '_blank');
        label.mutate(undefined, {
            onSuccess: ({ url }) => {
                if (win) { win.opener = null; win.location.href = url; } else window.location.href = url;
            },
            onError: () => win?.close(),
        });
    };
    const customerShip = order.shippingFee - (order.shippingDiscount ?? 0);
    const shopCovers = order.carrierFee != null ? order.carrierFee - customerShip : 0;
    const busy = action.isPending;
    const error = action.error ?? label.error;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
            <p className="mb-3 text-xs font-semibold uppercase text-gray-400">Vận đơn GHN</p>

            {needCreate ? (
                <>
                    <p className="mb-3 text-gray-600">Đơn đã xác nhận nhưng chưa gửi sang GHN (thường là đơn VNPAY được hệ thống tự xác nhận).</p>
                    <button type="button" onClick={() => action.mutate({ kind: 'create' })} disabled={busy}
                        className={`${btn} w-full border-transparent bg-orange-500 text-white hover:bg-orange-600`}>
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />} Tạo vận đơn GHN
                    </button>
                </>
            ) : (
                <>
                    <dl className="space-y-1.5">
                        <div className="flex justify-between gap-3">
                            <dt className="shrink-0 text-gray-500">Trên GHN</dt>
                            <dd className="text-right font-medium text-gray-800">
                                {live.isLoading ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-gray-400" />
                                    : live.data ? ghnStatus(live.data.status).label
                                        : <span className="text-gray-400">Không lấy được</span>}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-3"><dt className="shrink-0 text-gray-500">Trên web</dt><dd className="text-right font-medium text-gray-800">{ghnStatus(order.shippingStatus).label}</dd></div>
                        {live.data && live.data.status !== order.shippingStatus && (
                            <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-700">
                                {order.carrierSandbox
                                    ? 'Khác nhau do trạng thái trên web đang giả lập; GHN sandbox không có shipper nên trạng thái bên GHN đứng yên.'
                                    : 'Trạng thái chưa khớp với GHN, bấm Đồng bộ để cập nhật.'}
                            </p>
                        )}
                        {order.carrierFee != null && (
                            <div className="flex justify-between gap-3"><dt className="shrink-0 text-gray-500">Cước GHN</dt><dd className="text-right font-medium text-gray-800">{formatVnd(order.carrierFee)}</dd></div>
                        )}
                        <div className="flex justify-between gap-3"><dt className="shrink-0 text-gray-500">Khách trả ship</dt><dd className="text-right font-medium text-gray-800">{customerShip <= 0 ? 'Miễn phí' : formatVnd(customerShip)}</dd></div>
                        {shopCovers > 0 && (
                            <div className="flex justify-between gap-3"><dt className="shrink-0 text-gray-500">Shop bù</dt><dd className="text-right font-medium text-orange-600">{formatVnd(shopCovers)}</dd></div>
                        )}
                    </dl>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <button type="button" onClick={() => action.mutate({ kind: 'sync' })} disabled={busy}
                            className={`${btn} border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600`}>
                            <RefreshCw className={`h-4 w-4 ${busy && action.variables?.kind === 'sync' ? 'animate-spin' : ''}`} /> Đồng bộ
                        </button>
                        <button type="button" onClick={print} disabled={label.isPending || order.shippingStatus === 'cancel'}
                            className={`${btn} border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600`}>
                            {label.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />} In vận đơn
                        </button>
                    </div>

                    {order.carrierSandbox && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                        <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3">
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                                <FlaskConical className="h-3.5 w-3.5" /> Giả lập GHN
                            </p>
                            <div className="flex gap-2">
                                <select value={simStatus} onChange={(e) => setSimStatus(e.target.value)} aria-label="Trạng thái giả lập"
                                    className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-amber-400">
                                    {SIMULATE_STATUSES.map((s) => <option key={s} value={s}>{ghnStatus(s).label}</option>)}
                                </select>
                                <button type="button" onClick={() => action.mutate({ kind: 'simulate', status: simStatus })} disabled={busy}
                                    className={`${btn} border-transparent bg-amber-500 py-1.5 text-white hover:bg-amber-600`}>
                                    Gửi
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {error && <p className="mt-3 text-xs text-red-600">{getApiErrorMessage(error)}</p>}
        </div>
    );
}