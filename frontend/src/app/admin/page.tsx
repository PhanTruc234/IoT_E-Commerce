'use client';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, Clock, DollarSign, ImageIcon, MessageCircleQuestion, Package, ShoppingCart, Star, Users } from 'lucide-react';
import { Spinner } from '@/shared/ui/spinner';
import { Badge } from '@/shared/ui/badge';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useOverview } from '@/features/overview/hooks/use-overview';
import { ORDER_STATUS } from '@/features/orders/constants';

function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
    const max = Math.max(1, ...data.map((d) => d.revenue));
    const W = 900;
    const H = 200;
    const pad = 28;
    const bw = (W - pad * 2) / Math.max(1, data.length);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {data.map((d, i) => {
                const h = (d.revenue / max) * (H - pad * 2);
                const x = pad + i * bw;
                return (
                    <g key={i}>
                        <rect x={x + 3} y={H - pad - h} width={Math.max(2, bw - 6)} height={h} fill="#3b82f6" rx={3}>
                            <title>{d.date}: {formatVnd(d.revenue)}</title>
                        </rect>
                        {i % 2 === 0 && (
                            <text x={x + bw / 2} y={H - 8} fontSize="9" textAnchor="middle" fill="#9ca3af">{d.date}</text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

function Kpi({ icon: Icon, label, value, tone = 'blue' }: { icon: React.ElementType; label: string; value: string; tone?: 'blue' | 'green' | 'amber' | 'gray' }) {
    const tones: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
        gray: 'bg-gray-100 text-gray-600',
    };
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </span>
                <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const { data, isLoading, isError, error } = useOverview();

    if (isLoading) {
        return <div className="flex justify-center py-20"><Spinner /></div>;
    }
    if (isError || !data) {
        return <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>;
    }

    const { kpis, moderation, statusBreakdown, revenueTrend, topProducts, lowStock, recentOrders } = data;
    const needAttention = moderation.ordersPending + moderation.reviewsPending + moderation.questionsUnanswered;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Tổng quan</h1>
                <p className="mt-1 text-sm text-gray-500">Số liệu kinh doanh & việc cần xử lý.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Kpi icon={DollarSign} label="Doanh thu tháng này" value={formatVnd(kpis.revenueMonth)} tone="green" />
                <Kpi icon={DollarSign} label="Tổng doanh thu" value={formatVnd(kpis.revenueTotal)} tone="blue" />
                <Kpi icon={ShoppingCart} label="Tổng đơn hàng" value={String(kpis.ordersTotal)} tone="blue" />
                <Kpi icon={Users} label="Khách hàng" value={String(kpis.customers)} tone="gray" />
            </div>

            {needAttention > 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                    <Link href="/admin/orders" className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 transition hover:shadow-sm">
                        <span className="flex items-center gap-2 text-sm text-amber-700"><Clock className="h-5 w-5" /> Đơn chờ xác nhận</span>
                        <span className="text-lg font-bold text-amber-700">{moderation.ordersPending}</span>
                    </Link>
                    <Link href="/admin/reviews" className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 transition hover:shadow-sm">
                        <span className="flex items-center gap-2 text-sm text-amber-700"><Star className="h-5 w-5" /> Đánh giá chờ duyệt</span>
                        <span className="text-lg font-bold text-amber-700">{moderation.reviewsPending}</span>
                    </Link>
                    <Link href="/admin/questions" className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 transition hover:shadow-sm">
                        <span className="flex items-center gap-2 text-sm text-amber-700"><MessageCircleQuestion className="h-5 w-5" /> Câu hỏi chưa trả lời</span>
                        <span className="text-lg font-bold text-amber-700">{moderation.questionsUnanswered}</span>
                    </Link>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">Doanh thu 14 ngày (đơn hoàn thành)</h2>
                    <RevenueChart data={revenueTrend} />
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">Đơn hàng theo trạng thái</h2>
                    <ul className="space-y-2">
                        {statusBreakdown.length === 0 && <li className="text-sm text-gray-400">Chưa có đơn.</li>}
                        {statusBreakdown.map((s) => (
                            <li key={s.status} className="flex items-center justify-between text-sm">
                                <Badge color={ORDER_STATUS[s.status].color}>{ORDER_STATUS[s.status].label}</Badge>
                                <span className="font-medium text-gray-800">{s.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Đơn hàng gần đây</h2>
                        <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
                    </div>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.length === 0 && (
                                <tr><td className="py-6 text-center text-gray-400">Chưa có đơn hàng.</td></tr>
                            )}
                            {recentOrders.map((o) => (
                                <tr key={o.id} className="hover:bg-gray-50">
                                    <td className="py-2">
                                        <Link href={`/admin/orders/${o.id}`} className="font-medium text-gray-800 hover:text-blue-600">{o.code}</Link>
                                        <span className="block text-xs text-gray-400">{o.recipientName}</span>
                                    </td>
                                    <td className="py-2"><Badge color={ORDER_STATUS[o.status].color}>{ORDER_STATUS[o.status].label}</Badge></td>
                                    <td className="py-2 text-right font-medium text-gray-800">{formatVnd(o.total)}</td>
                                    <td className="py-2 text-right text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900"><AlertTriangle className="h-4 w-4 text-red-500" /> Sắp hết hàng</h2>
                        <ul className="space-y-2">
                            {lowStock.length === 0 && <li className="text-sm text-gray-400">Không có sản phẩm nào sắp hết.</li>}
                            {lowStock.map((p) => (
                                <li key={p.id}>
                                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-2 text-sm hover:text-blue-600">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-100 bg-gray-50">
                                            {p.image ? <Image src={p.image} alt="" width={32} height={32} className="h-full w-full object-contain" /> : <ImageIcon className="h-4 w-4 text-gray-300" />}
                                        </span>
                                        <span className="line-clamp-1 flex-1 text-gray-700">{p.name}</span>
                                        <span className="shrink-0 font-medium text-red-600">{p.stockQuantity}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900"><Package className="h-4 w-4 text-blue-500" /> Bán chạy</h2>
                        <ul className="space-y-2">
                            {topProducts.length === 0 && <li className="text-sm text-gray-400">Chưa có dữ liệu bán hàng.</li>}
                            {topProducts.map((p) => (
                                <li key={p.id}>
                                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-2 text-sm hover:text-blue-600">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-100 bg-gray-50">
                                            {p.image ? <Image src={p.image} alt="" width={32} height={32} className="h-full w-full object-contain" /> : <ImageIcon className="h-4 w-4 text-gray-300" />}
                                        </span>
                                        <span className="line-clamp-1 flex-1 text-gray-700">{p.name}</span>
                                        <span className="shrink-0 text-xs text-gray-500">đã bán {p.soldCount}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
