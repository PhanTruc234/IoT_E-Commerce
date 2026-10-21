'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    BadgePercent, Boxes, ClipboardList, MousePointerClick, Percent, ShoppingBag, ShoppingCart, Truck, Users,
} from 'lucide-react';
import { Spinner } from '@/shared/ui/spinner';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useOverview } from '@/features/overview/hooks/use-overview';
import type { OverviewRange } from '@/features/overview/api/overview.api';
import { BarList, DailyChart, Delta, PeriodBar, PRESETS, Section, Stat, TodoTile, fmtDay } from '@/features/overview/components/dashboard-ui';
import { ORDER_STATUS, ghnStatus } from '@/features/orders/constants';

const num = (n: number) => n.toLocaleString('vi-VN');
const pct = (n: number) => `${n.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;

export default function AdminDashboardPage() {
    const [range, setRange] = useState<OverviewRange>(() => PRESETS[2].range());
    const { data, isLoading, isError, error, isFetching } = useOverview(range);

    if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
    if (!data) {
        // Vẫn giữ thanh chọn kỳ để chọn lại được khi lỗi
        return (
            <div>
                <h1 className="mb-4 text-xl font-bold text-gray-900">Tổng quan</h1>
                <PeriodBar value={range} onChange={setRange} loading={isFetching} />
                <p className="text-sm text-red-600">{isError ? getApiErrorMessage(error) : 'Không tải được số liệu'}</p>
            </div>
        );
    }
    const { sales, orders, shipping, promotions, tax, products, customers, behavior, todo } = data;

    return (
        <div>
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900">Tổng quan</h1>
                <p className="text-sm text-gray-500">{fmtDay(data.range.from, true)} – {fmtDay(data.range.to, true)} ({data.range.days} ngày). Doanh thu chỉ tính đơn đã chốt: không huỷ, đơn VNPAY đã thanh toán.</p>
            </div>
            <PeriodBar value={range} onChange={setRange} loading={isFetching} prev={{ from: data.range.prevFrom, to: data.range.prevTo }} />
            {isError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{getApiErrorMessage(error)} — đang hiện số liệu của kỳ trước đó.</p>}

            {/* Việc cần xử lý: đặt trên cùng vì là thứ admin cần làm ngay */}
            <Section title="Việc cần xử lý" icon={ClipboardList} href="/admin/orders" linkLabel="Đơn hàng" className="mb-5">
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    <TodoTile label={`Đơn chờ xác nhận > ${orders.staleHours.pending}h`} count={orders.stalePending} href="/admin/orders" tone="warn" />
                    <TodoTile label={`Đã xác nhận chưa giao > ${orders.staleHours.confirmed}h`} count={orders.staleConfirmed} href="/admin/orders" tone="warn" />
                    <TodoTile label="Đánh giá chờ duyệt" count={todo.reviewsPending} href="/admin/reviews" />
                    <TodoTile label="Câu hỏi chưa trả lời" count={todo.questionsUnanswered} href="/admin/questions" />
                    <TodoTile label="Yêu cầu hỗ trợ" count={todo.ticketsOpen} href="/admin/support" />
                    <TodoTile label="Yêu cầu bảo hành" count={todo.warrantyOpen} href="/admin/support" tone="warn" />
                </div>
            </Section>

            <div className="grid gap-5 lg:grid-cols-3">
                <Section title="Bán hàng" icon={ShoppingBag} href="/admin/orders" linkLabel="Xem đơn hàng" className="lg:col-span-3">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Stat big label="Doanh thu thuần" value={formatVnd(sales.netRevenue.cur)} delta={<Delta pair={sales.netRevenue} />}
                            hint="Tiền hàng sau giảm giá, không gồm phí ship và VAT" />
                        <Stat big label="Số đơn đã chốt" value={num(sales.orders.cur)} delta={<Delta pair={sales.orders} />} />
                        <Stat big label="Giá trị trung bình / đơn" value={formatVnd(sales.aov.cur)} delta={<Delta pair={sales.aov} />}
                            hint={`Khách đã trả ${formatVnd(sales.gross)} (gồm ship ${formatVnd(sales.shippingCollected)} và VAT)`} />
                    </div>
                    <div className="mt-5">
                        <p className="mb-1 text-xs font-medium text-gray-500">Doanh thu thuần theo ngày</p>
                        <DailyChart data={sales.daily} />
                    </div>
                    <div className="mt-5 grid gap-6 md:grid-cols-2">
                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">Theo danh mục <span className="font-normal text-gray-400">· tiền hàng trước mã giảm giá</span></p>
                            <BarList rows={sales.byCategory.slice(0, 8).map((c) => ({ key: c.id, label: c.name, value: c.amount, display: formatVnd(c.amount) }))} />
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">Theo phương thức thanh toán</p>
                            <BarList rows={sales.byPayment.map((p) => ({
                                key: p.method, label: p.method === 'COD' ? 'Thanh toán khi nhận (COD)' : 'VNPAY',
                                value: p.net, display: `${formatVnd(p.net)} · ${num(p.orders)} đơn`,
                            }))} />
                        </div>
                    </div>
                </Section>

                <Section title="Đơn hàng" icon={ShoppingCart} href="/admin/orders">
                    <div className="grid grid-cols-2 gap-4">
                        <Stat label="Đơn tạo trong kỳ" value={num(orders.total)} />
                        <Stat label="Tỉ lệ huỷ" value={pct(orders.cancelRate.cur)} delta={<Delta pair={orders.cancelRate} rate lowerIsBetter />} />
                    </div>
                    <div className="mt-4">
                        <BarList rows={(['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'] as const).map((s) => {
                            const c = orders.statusBreakdown.find((x) => x.status === s)?.count ?? 0;
                            return { key: s, label: ORDER_STATUS[s].label, value: c, display: `${num(c)} · ${pct(orders.total ? (c / orders.total) * 100 : 0)}` };
                        })} empty="Chưa có đơn trong kỳ" />
                    </div>
                    <div className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm">
                        <p className="flex justify-between"><span className="text-gray-600">VNPAY chưa thanh toán <span className="text-xs text-gray-400">(hiện tại)</span></span><span className="font-semibold tabular-nums">{num(orders.vnpayUnpaid)}</span></p>
                        <p className="flex justify-between"><span className="text-gray-600">Giao dịch cần hoàn tiền <span className="text-xs text-gray-400">(hiện tại)</span></span><span className={`font-semibold tabular-nums ${orders.needsRefund ? 'text-red-600' : ''}`}>{num(orders.needsRefund)}</span></p>
                    </div>
                </Section>

                <Section title="Vận chuyển GHN" icon={Truck} href="/admin/orders" linkLabel="Xem đơn đang giao">
                    <div className="grid grid-cols-2 gap-4">
                        <Stat label="Đang giao" value={num(shipping.inTransit)} hint="Hiện tại" />
                        <Stat label="Gặp sự cố / hoàn" value={num(shipping.problems.count)} hint="Hiện tại" />
                    </div>
                    {shipping.problems.items.length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs">
                            {shipping.problems.items.map((o) => (
                                <li key={o.id} className="flex justify-between gap-2">
                                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-blue-600 hover:underline">{o.code}</Link>
                                    <span className="text-red-600">{ghnStatus(o.shippingStatus).label}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm">
                        <p className="text-xs text-gray-400">{num(shipping.shipments)} vận đơn của đơn đã chốt trong kỳ</p>
                        <p className="flex justify-between"><span className="text-gray-600">Phí GHN thực tế</span><span className="tabular-nums">{formatVnd(shipping.carrierFee)}</span></p>
                        <p className="flex justify-between"><span className="text-gray-600">Phí ship thu của khách</span><span className="tabular-nums">{formatVnd(shipping.charged)}</span></p>
                        <p className="flex justify-between font-semibold"><span className="text-gray-700">Shop bù ship</span><span className="tabular-nums">{formatVnd(shipping.subsidy)}</span></p>
                    </div>
                </Section>

                <Section title="Khuyến mại & voucher" icon={BadgePercent} href="/admin/promotions" linkLabel="Khuyến mại">
                    <Stat label="Tổng tiền đã giảm" value={formatVnd(promotions.discount.cur)} delta={<Delta pair={promotions.discount} />} />
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                        <span>Giảm giá riêng SP</span><span className="text-right tabular-nums">{formatVnd(promotions.breakdown.sale)}</span>
                        <span>Chương trình KM</span><span className="text-right tabular-nums">{formatVnd(promotions.breakdown.promotion)}</span>
                        <span>Mã giảm tiền hàng</span><span className="text-right tabular-nums">{formatVnd(promotions.breakdown.productVoucher)}</span>
                        <span>Mã giảm phí ship</span><span className="text-right tabular-nums">{formatVnd(promotions.breakdown.shippingVoucher)}</span>
                    </div>
                    <div className="mt-4 border-t border-gray-100 pt-3">
                        <p className="mb-1 text-xs font-medium text-gray-500">Đang chạy ({promotions.active.count})</p>
                        {promotions.active.items.length ? (
                            <ul className="space-y-0.5 text-xs text-gray-700">
                                {promotions.active.items.map((p) => (
                                    <li key={p.id} className="flex justify-between gap-2">
                                        <span className="truncate">{p.name}{p.forcePriority && <span className="ml-1 text-amber-600">(bắt buộc)</span>}</span>
                                        <span className="shrink-0 text-gray-400">{p.endAt ? `đến ${new Date(p.endAt).toLocaleDateString('vi-VN')}` : 'không hạn'}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-xs text-gray-400">Không có chương trình nào.</p>}
                        <p className="mb-1 mt-3 text-xs font-medium text-gray-500">Voucher dùng nhiều nhất <Link href="/admin/coupons" className="font-normal text-blue-600 hover:underline">· xem mã</Link></p>
                        {promotions.topVouchers.length ? (
                            <ul className="space-y-0.5 text-xs text-gray-700">
                                {promotions.topVouchers.map((v) => (
                                    <li key={v.code} className="flex justify-between gap-2">
                                        <span className="font-mono">{v.code}</span>
                                        <span className="tabular-nums text-gray-500">{num(v.uses)} lượt · {formatVnd(v.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-xs text-gray-400">Chưa có đơn dùng mã trong kỳ.</p>}
                    </div>
                </Section>

                <Section title="Thuế" icon={Percent} href="/admin/invoices" linkLabel="Yêu cầu hoá đơn">
                    <div className="grid grid-cols-2 gap-4">
                        <Stat label="VAT trong kỳ" value={formatVnd(tax.vat.cur)} delta={<Delta pair={tax.vat} />} hint="Theo thuế suất lưu trên từng đơn" />
                        <Stat label="Hoá đơn chờ xuất" value={num(tax.invoicesPending)} />
                    </div>
                    <Link href="/admin/tax" className="mt-3 inline-block text-xs text-blue-600 hover:underline">Cài đặt thuế suất →</Link>
                </Section>

                <Section title="Sản phẩm & kho" icon={Boxes} href="/admin/products" className="lg:col-span-2">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">Top doanh thu trong kỳ</p>
                            <BarList rows={products.topRevenue.map((p) => ({ key: p.id, label: p.name, value: p.revenue, display: `${formatVnd(p.revenue)} · ${num(p.qty)}` }))} />
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">Sắp hết hàng (≤ {products.lowStock.threshold}, hiện tại) · {num(products.lowStock.count)} SP</p>
                            {products.lowStock.items.length ? (
                                <ul className="space-y-1 text-xs">
                                    {products.lowStock.items.map((p) => (
                                        <li key={p.id} className="flex justify-between gap-2">
                                            <Link href={`/admin/products/${p.id}`} className="truncate text-gray-700 hover:text-blue-600">{p.name}</Link>
                                            <span className={`shrink-0 font-semibold tabular-nums ${p.stockQuantity === 0 ? 'text-red-600' : 'text-amber-700'}`}>{p.stockQuantity === 0 ? 'Hết' : `còn ${p.stockQuantity}`}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-xs text-gray-400">Không có SP sắp hết.</p>}
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">Tồn lâu: {products.slowMovers.days} ngày không bán · {num(products.slowMovers.count)} SP</p>
                            {products.slowMovers.items.length ? (
                                <ul className="space-y-1 text-xs">
                                    {products.slowMovers.items.map((p) => (
                                        <li key={p.id} className="flex justify-between gap-2">
                                            <Link href={`/admin/products/${p.id}`} className="truncate text-gray-700 hover:text-blue-600">{p.name}</Link>
                                            <span className="shrink-0 tabular-nums text-gray-500">{num(p.stock)} cái · {formatVnd(p.value)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-xs text-gray-400">Không có SP tồn lâu.</p>}
                        </div>
                    </div>
                </Section>

                <Section title="Khách hàng" icon={Users} href="/admin/users">
                    <div className="grid grid-cols-2 gap-4">
                        <Stat label="Khách đăng ký mới" value={num(customers.newCustomers.cur)} delta={<Delta pair={customers.newCustomers} />} />
                        <Stat label="Khách mua trong kỳ" value={num(customers.buyers)} hint={`${num(customers.returning)} quay lại · ${num(customers.firstTime)} mua lần đầu`} />
                    </div>
                    <p className="mb-1 mt-4 text-xs font-medium text-gray-500">Top khách hàng theo chi tiêu</p>
                    {customers.top.length ? (
                        <ul className="space-y-1 text-xs">
                            {customers.top.map((c) => (
                                <li key={c.id} className="flex justify-between gap-2">
                                    <span className="min-w-0 truncate text-gray-700" title={c.email}>{c.name}</span>
                                    <span className="shrink-0 tabular-nums text-gray-500">{formatVnd(c.spent)} · {num(c.orders)} đơn</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-xs text-gray-400">Chưa có khách mua trong kỳ.</p>}
                </Section>

                <Section title="Hành vi khách" icon={MousePointerClick} href="/admin/statistics" linkLabel="Thống kê" className="lg:col-span-2">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">Phễu chuyển đổi: xem → giỏ → mua</p>
                            <BarList rows={[
                                { key: 'v', label: 'Lượt xem sản phẩm', value: behavior.views, display: num(behavior.views) },
                                { key: 'c', label: 'Thêm vào giỏ', value: behavior.addToCart, display: num(behavior.addToCart) },
                                { key: 'o', label: 'Đơn đã chốt', value: behavior.orders, display: num(behavior.orders) },
                            ]} />
                            <div className="mt-3 grid grid-cols-2 gap-4">
                                <Stat label="Xem → giỏ" value={pct(behavior.viewToCart.cur)} delta={<Delta pair={behavior.viewToCart} rate />} />
                                <Stat label="Giỏ → mua" value={pct(behavior.cartToOrder.cur)} delta={<Delta pair={behavior.cartToOrder} rate />} />
                            </div>
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">Từ khoá tìm nhiều nhất · {num(behavior.searches)} lượt tìm</p>
                            <BarList rows={behavior.topSearches.map((k) => ({ key: k.keyword, label: k.keyword, value: k.count, display: num(k.count) }))} empty="Chưa có lượt tìm kiếm trong kỳ" />
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}
