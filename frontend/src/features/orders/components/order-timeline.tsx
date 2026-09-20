'use client';
import { Check, X } from 'lucide-react';
import { ORDER_STATUS } from '../constants';
import type { OrderStatus, OrderStatusHistory } from '../types';
import { useAuthStore } from '@/features/auth/store/auth.store';

const DOT: Record<OrderStatus, string> = {
    PENDING: 'bg-blue-500',
    CONFIRMED: 'bg-indigo-500',
    SHIPPING: 'bg-amber-500',
    COMPLETED: 'bg-green-500',
    CANCELLED: 'bg-red-500',
};

export function OrderTimeline({ history }: { history: OrderStatusHistory[] }) {
    if (!history?.length) return null;
    const user = useAuthStore((s) => s.user);
    console.log(">>> user", user)
    return (
        <ol className="space-y-0">
            {history.map((h, i) => {
                const last = i === history.length - 1;
                const cancelled = h.status === 'CANCELLED';
                return (
                    <li key={h.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <span className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${DOT[h.status]}`}>
                                {cancelled ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </span>
                            {!last && <span className="w-px flex-1 bg-gray-200" />}
                        </div>
                        <div className={last ? 'pb-0' : 'pb-5'}>
                            <p className="text-sm font-medium text-gray-800">{ORDER_STATUS[h.status].label}</p>
                            {h.note && <p className="text-xs text-gray-700">{h.note}</p>}
                            <p className="mt-0.5 text-xs text-gray-700">
                                {new Date(h.createdAt).toLocaleString('vi-VN')}
                                {user?.role === "ADMIN" && h.changedBy ? ` · ${h.changedBy}` : ''}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}