'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Eye, X } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Spinner } from '@/shared/ui/spinner';
import { formatVnd } from '@/shared/lib/format';
import { useAdminCoupons, useCouponMutations } from '@/features/coupons/hooks/use-coupons';
import type { AdminCoupon } from '@/features/coupons/api/coupons.api';

function Row({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="font-medium text-gray-800">{value}</dd>
        </div>
    );
}
const dt = (s: string | null) => (s ? new Date(s).toLocaleString('vi-VN') : null);
const toLocalInput = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function AdminCouponsPage() {
    const { data, isLoading } = useAdminCoupons();
    const { remove, update } = useCouponMutations();
    const [detail, setDetail] = useState<AdminCoupon | null>(null);
    const [newEnd, setNewEnd] = useState('');

    return (
        <div>
            <div className="flex items-start justify-between gap-3">
                <PageHeader title="Mã giảm giá" description="Quản lý mã giảm tiền hàng / miễn phí vận chuyển." />
                <Link href="/admin/coupons/create" className="mt-1 flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> Thêm mã
                </Link>
            </div>

            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div> : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs text-gray-500">
                            <tr><th className="p-3">Mã</th><th className="p-3">Loại</th><th className="p-3">Giá trị</th><th className="p-3">Đơn tối thiểu</th><th className="p-3">Lượt dùng</th><th className="p-3">HSD</th><th className="p-3"></th></tr>
                        </thead>
                        <tbody>
                            {data?.map((c) => (
                                <tr key={c.id} className="border-t border-gray-100">
                                    <td className="p-3 font-mono font-semibold">{c.code}{!c.isActive && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 font-sans text-[10px] font-medium text-gray-500">tắt</span>}</td>
                                    <td className="p-3">{c.type === 'FREE_SHIPPING' ? 'Freeship' : 'Giảm hàng'}</td>
                                    <td className="p-3">{c.type === 'FREE_SHIPPING' ? (c.value > 0 ? formatVnd(c.value) : 'Toàn bộ') : c.discountType === 'PERCENT' ? `${c.value}%` : formatVnd(c.value)}</td>
                                    <td className="p-3">{c.minOrder > 0 ? formatVnd(c.minOrder) : '—'}</td>
                                    <td className="p-3">{c.usedCount}{c.usageLimit != null ? `/${c.usageLimit}` : ''}</td>
                                    <td className="p-3">{c.endAt ? new Date(c.endAt).toLocaleDateString('vi-VN') : '—'}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setDetail(c); setNewEnd(toLocalInput(c.endAt)); }} title="Xem chi tiết" className="text-gray-400 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                                            <button onClick={() => remove.mutate(c.id)} title="Xoá" className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data?.length === 0 && (
                                <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-400">Chưa có mã nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
                    <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                            <h3 className="font-semibold text-gray-900">Chi tiết mã <span className="font-mono text-blue-600">{detail.code}</span></h3>
                            <button onClick={() => setDetail(null)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                <Row label="Loại" value={detail.type === 'FREE_SHIPPING' ? 'Miễn phí vận chuyển' : 'Giảm tiền hàng'} />
                                <Row label="Trạng thái" value={detail.isActive ? 'Đang bật' : 'Đã tắt'} />
                                <div className="col-span-2"><Row label="Mô tả" value={detail.description || '—'} /></div>
                                {detail.type === 'PRODUCT_DISCOUNT' && <Row label="Kiểu giảm" value={detail.discountType === 'PERCENT' ? 'Theo %' : 'Số tiền cố định'} />}
                                <Row label="Giá trị" value={detail.type === 'FREE_SHIPPING' ? (detail.value > 0 ? formatVnd(detail.value) : 'Miễn toàn bộ phí ship') : detail.discountType === 'PERCENT' ? `${detail.value}%` : formatVnd(detail.value)} />
                                <Row label="Giảm tối đa" value={detail.maxDiscount != null ? formatVnd(detail.maxDiscount) : '—'} />
                                <Row label="Đơn tối thiểu" value={detail.minOrder > 0 ? formatVnd(detail.minOrder) : 'Không yêu cầu'} />
                                <Row label="Tổng lượt dùng" value={`${detail.usedCount}${detail.usageLimit != null ? ' / ' + detail.usageLimit : ' (không giới hạn)'}`} />
                                <Row label="Lượt dùng / người" value={detail.perUserLimit} />
                                <Row label="Bắt đầu" value={dt(detail.startAt) ?? 'Ngay khi tạo'} />
                                <Row label="Hạn sử dụng" value={dt(detail.endAt) ?? 'Không giới hạn'} />
                                <Row label="Flash sale (săn mã)" value={detail.isFlashSale ? 'Có' : 'Không'} />
                                {detail.isFlashSale && <>
                                    <Row label="Mở săn" value={dt(detail.claimStartAt) ?? '—'} />
                                    <Row label="Đóng săn" value={dt(detail.claimEndAt) ?? '—'} />
                                    <Row label="Đã săn / Số lượng phát" value={`${detail.claimedCount}${detail.claimLimit != null ? ' / ' + detail.claimLimit : ''}`} />
                                </>}
                                <Row label="Ngày tạo" value={dt(detail.createdAt) ?? '—'} />
                            </dl>
                        </div>
                        <div className="space-y-3 border-t border-gray-100 px-5 py-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quản lý nhanh</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Kích hoạt mã</span>
                                <button type="button" disabled={update.isPending}
                                    onClick={() => update.mutate({ id: detail.id, body: { isActive: !detail.isActive } }, { onSuccess: () => setDetail({ ...detail, isActive: !detail.isActive }) })}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${detail.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {detail.isActive ? 'Đang bật — bấm để tắt' : 'Đã tắt — bấm để bật'}
                                </button>
                            </div>
                            <div className="flex items-end gap-2">
                                <label className="flex-1"><span className="mb-1 block text-xs text-gray-500">Gia hạn sử dụng đến</span>
                                    <input type="datetime-local" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500" /></label>
                                <button type="button" disabled={!newEnd || update.isPending}
                                    onClick={() => update.mutate({ id: detail.id, body: { endAt: new Date(newEnd).toISOString() } }, { onSuccess: () => setDetail({ ...detail, endAt: new Date(newEnd).toISOString() }) })}
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Lưu hạn</button>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 px-5 py-3 text-right">
                            <button onClick={() => setDetail(null)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
