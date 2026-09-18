'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, Search, ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { formatVnd } from '@/shared/lib/format';
import { useAdminOrders } from '@/features/orders/hooks/use-orders';
import { ORDER_STATUS, PAYMENT_STATUS } from '@/features/orders/constants';
import type { OrderStatus } from '@/features/orders/types';

export default function AdminOrdersPage() {
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<OrderStatus | ''>('');

    const { data, isLoading, isError, error, isFetching } = useAdminOrders({
        page, limit: 15, search: search || undefined, status: status || undefined,
    });

    return (
        <div>
            <PageHeader title="Đơn hàng" description="Duyệt và cập nhật trạng thái đơn hàng." />

            <div className="mb-4 flex flex-wrap gap-2">
                <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="relative w-full max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Mã đơn / tên / SĐT…" className="pl-9" />
                </form>
                <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value as OrderStatus | ''); }} className="w-44">
                    <option value="">Mọi trạng thái</option>
                    {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {isLoading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : isError ? (
                    <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Mã đơn</th>
                                    <th className="px-4 py-3">Khách</th>
                                    <th className="px-4 py-3">Tổng</th>
                                    <th className="px-4 py-3">Thanh toán</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3">Ngày</th>
                                    <th className="px-4 py-3 text-right">Xem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data!.data.length === 0 && (
                                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                        <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-gray-300" />Chưa có đơn hàng.
                                    </td></tr>
                                )}
                                {data!.data.map((o) => (
                                    <tr key={o.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">{o.code}<span className="ml-2 text-xs text-gray-400">{o._count.items} SP</span></td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-800">{o.recipientName}</p>
                                            <p className="text-xs text-gray-400">{o.phone}</p>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{formatVnd(o.total)}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-gray-500">{o.paymentMethod}</span>{' '}
                                            <Badge color={PAYMENT_STATUS[o.paymentStatus].color}>{PAYMENT_STATUS[o.paymentStatus].label}</Badge>
                                        </td>
                                        <td className="px-4 py-3"><Badge color={ORDER_STATUS[o.status].color}>{ORDER_STATUS[o.status].label}</Badge></td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={`/admin/orders/${o.id}`} className="inline-flex cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"><Eye className="h-4 w-4" /></Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {data && data.meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Trang {data.meta.page}/{data.meta.totalPages} — {data.meta.total} đơn</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Trước</Button>
                        <Button variant="secondary" size="sm" disabled={page >= data.meta.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>Sau</Button>
                    </div>
                </div>
            )}
        </div>
    );
}