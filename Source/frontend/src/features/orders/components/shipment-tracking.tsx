'use client';
import { useState } from 'react';
import { CalendarClock, Check, Copy, ExternalLink, MapPin, PackageCheck, Truck, TriangleAlert } from 'lucide-react';
import { formatDeliveryDate } from '@/features/shipping/api/shipping.api';
import { ghnStatus } from '../constants';
import type { Order } from '../types';

const TONE = {
    gray: { dot: 'bg-gray-400 ring-gray-100', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' },
    blue: { dot: 'bg-blue-500 ring-blue-100', text: 'text-blue-700', badge: 'bg-blue-50 text-blue-700' },
    amber: { dot: 'bg-amber-500 ring-amber-100', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-700' },
    green: { dot: 'bg-green-500 ring-green-100', text: 'text-green-700', badge: 'bg-green-50 text-green-700' },
    red: { dot: 'bg-red-500 ring-red-100', text: 'text-red-700', badge: 'bg-red-50 text-red-700' },
};

function formatTime(iso: string) {
    return new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function ShipmentTracking({ order }: { order: Order }) {
    const [copied, setCopied] = useState(false);
    if (!order.trackingCode) return null;

    const current = ghnStatus(order.shippingStatus);
    const events = [...(order.shipmentEvents ?? [])].reverse();
    const done = order.shippingStatus === 'delivered';
    const showEta = !!order.expectedDeliveryAt && !done && order.status !== 'CANCELLED' && order.shippingStatus !== 'cancel';

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(order.trackingCode!);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { }
    };

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                        <Truck aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Vận chuyển bởi Giao Hàng Nhanh</h2>
                        <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TONE[current.tone].badge}`}>
                            {current.label}
                        </span>
                    </div>
                </div>
                {order.trackingUrl && (
                    <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                    >
                        Tra cứu trên GHN <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                    </a>
                )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <p className="text-xs text-gray-500">Mã vận đơn</p>
                    <button
                        type="button"
                        onClick={copy}
                        aria-label={`Sao chép mã vận đơn ${order.trackingCode}`}
                        className="mt-0.5 inline-flex cursor-pointer items-center gap-2 font-mono text-base font-bold tracking-wider text-gray-900 hover:text-blue-600"
                    >
                        {order.trackingCode}
                        {copied ? <Check aria-hidden className="h-4 w-4 text-green-600" /> : <Copy aria-hidden className="h-4 w-4 text-gray-400" />}
                    </button>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <p className="text-xs text-gray-500">{done ? 'Đã giao' : 'Dự kiến giao'}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        {done ? <PackageCheck aria-hidden className="h-4 w-4 text-green-600" /> : <CalendarClock aria-hidden className="h-4 w-4 text-blue-600" />}
                        {done && events[0] ? formatTime(events[0].occurredAt) : showEta ? formatDeliveryDate(order.expectedDeliveryAt!) : '—'}
                    </p>
                </div>
            </div>

            <ol className="mt-5">
                {events.length === 0 && (
                    <li className="flex gap-3 text-sm text-gray-500">
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gray-300" />
                        Đã tạo vận đơn, đang chờ GHN đến lấy hàng.
                    </li>
                )}
                {events.map((e, i) => {
                    const st = ghnStatus(e.status);
                    const latest = i === 0;
                    return (
                        <li key={e.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${latest ? `${TONE[st.tone].dot} ring-4` : 'bg-gray-300'}`} />
                                {i < events.length - 1 && <span className="w-px flex-1 bg-gray-200" />}
                            </div>
                            <div className="min-w-0 pb-4">
                                <p className={`text-sm ${latest ? `font-semibold ${TONE[st.tone].text}` : 'text-gray-700'}`}>{st.label}</p>
                                {e.reason && (
                                    <p className="mt-0.5 flex items-start gap-1 text-xs text-red-600">
                                        <TriangleAlert aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" /> {e.reason}
                                    </p>
                                )}
                                {e.warehouse && (
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                        <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" /> {e.warehouse}
                                    </p>
                                )}
                                <p className="mt-0.5 text-xs text-gray-400">{formatTime(e.occurredAt)}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}