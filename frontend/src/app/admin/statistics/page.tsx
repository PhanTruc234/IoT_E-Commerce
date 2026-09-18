'use client';
import { useState } from 'react';
import { Eye, PackageCheck, Search, ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Spinner } from '@/shared/ui/spinner';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAnalytics } from '@/features/analytics/hooks/use-analytics';

function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
    const max = Math.max(1, ...data.map((d) => d.value));
    const W = 720, H = 180, pad = 24;
    const bw = (W - pad * 2) / Math.max(1, data.length);
    const step = Math.max(1, Math.ceil(data.length / 8));
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {data.map((d, i) => {
                const h = (d.value / max) * (H - pad * 2);
                const x = pad + i * bw;
                return (
                    <g key={i}>
                        <rect x={x + 2} y={H - pad - h} width={Math.max(2, bw - 4)} height={h} fill={color} rx={2}>
                            <title>{d.label}: {d.value}</title>
                        </rect>
                        {i % step === 0 && <text x={x + bw / 2} y={H - 6} fontSize="9" textAnchor="middle" fill="#9ca3af">{d.label}</text>}
                    </g>
                );
            })}
        </svg>
    );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: number | string; sub?: string }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-gray-500"><Icon className="h-4 w-4" /><span className="text-xs">{label}</span></div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

function RankList({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
            {rows.length === 0 ? <p className="py-6 text-center text-sm text-gray-400">Chưa có dữ liệu.</p> : (
                <ul className="space-y-2">
                    {rows.map((r, i) => (
                        <li key={i}>
                            <div className="flex items-center justify-between text-sm">
                                <span className="truncate text-gray-700">{i + 1}. {r.label}</span>
                                <span className="ml-2 shrink-0 font-medium text-gray-900">{r.value}</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(r.value / max) * 100}%` }} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

const RANGES = [7, 14, 30];

export default function AdminStatisticsPage() {
    const [days, setDays] = useState(14);
    const { data, isLoading, isError, error } = useAnalytics(days);

    return (
        <div>
            <PageHeader title="Thống kê hành vi" description="Phân tích hành vi duyệt & mua của khách." />

            <div className="mb-4 flex gap-2">
                {RANGES.map((r) => (
                    <button key={r} onClick={() => setDays(r)}
                        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm ${days === r ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-600'}`}>
                        {r} ngày
                    </button>
                ))}
            </div>

            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
                : isError || !data ? <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>
                    : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                <StatCard icon={Eye} label="Lượt xem sản phẩm" value={data.totals.views} />
                                <StatCard icon={Search} label="Lượt tìm kiếm" value={data.totals.searches} />
                                <StatCard icon={ShoppingCart} label="Lượt thêm giỏ" value={data.totals.addToCart} />
                                <StatCard icon={PackageCheck} label="Đơn hàng" value={data.totals.orders} />
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-5">
                                <h3 className="mb-4 text-sm font-semibold text-gray-900">Phễu chuyển đổi</h3>
                                {[
                                    { label: 'Xem sản phẩm', value: data.funnel.views, color: 'bg-blue-500' },
                                    { label: 'Thêm giỏ', value: data.funnel.addToCart, color: 'bg-indigo-500' },
                                    { label: 'Đặt hàng', value: data.funnel.orders, color: 'bg-green-500' },
                                ].map((s, i) => {
                                    const max = Math.max(1, data.funnel.views);
                                    return (
                                        <div key={i} className="mb-2">
                                            <div className="mb-1 flex justify-between text-xs text-gray-500"><span>{s.label}</span><span>{s.value}</span></div>
                                            <div className="h-6 w-full rounded bg-gray-100">
                                                <div className={`flex h-6 items-center rounded ${s.color} px-2 text-xs font-medium text-white`} style={{ width: `${Math.max(3, (s.value / max) * 100)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="mt-3 flex gap-6 text-sm">
                                    <span className="text-gray-600">Xem → Giỏ: <b className="text-blue-600">{data.funnel.viewToCart}%</b></span>
                                    <span className="text-gray-600">Giỏ → Đặt: <b className="text-green-600">{data.funnel.cartToOrder}%</b></span>
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Lượt xem theo ngày</h3>
                                    <MiniBarChart data={data.trend.map((t) => ({ label: t.date, value: t.views }))} color="#3b82f6" />
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Đơn hàng theo ngày</h3>
                                    <MiniBarChart data={data.trend.map((t) => ({ label: t.date, value: t.orders }))} color="#22c55e" />
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-3">
                                <RankList title="SP xem nhiều nhất" rows={data.topProducts.map((p) => ({ label: p.name, value: p.views }))} />
                                <RankList title="Từ khoá tìm nhiều nhất" rows={data.topSearches.map((s) => ({ label: s.keyword, value: s.count }))} />
                                <RankList title="Danh mục được xem nhiều" rows={data.topCategories.map((c) => ({ label: c.name, value: c.views }))} />
                            </div>
                        </div>
                    )}
        </div>
    );
}