'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Eye, X, Pencil } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Spinner } from '@/shared/ui/spinner';
import { formatVnd } from '@/shared/lib/format';
import { useAdminPromotions, usePromotionMutations } from '@/features/promotions/hooks/use-promotions';
import type { AdminPromotion } from '@/features/promotions/api/promotions.api';

function Row({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="font-medium text-gray-800">{value}</dd>
        </div>
    );
}
const dt = (s: string | null) => (s ? new Date(s).toLocaleString('vi-VN') : null);
const scopeLabel = (p: AdminPromotion) =>
    p.scope === 'ALL' ? 'Tất cả sản phẩm' : p.scope === 'CATEGORY' ? `${p._count.categories} danh mục` : `${p._count.products} sản phẩm`;

export default function AdminPromotionsPage() {
    const { data, isLoading } = useAdminPromotions();
    const { remove } = usePromotionMutations();
    const [detail, setDetail] = useState<AdminPromotion | null>(null);

    return (
        <div>
            <div className="flex items-start justify-between gap-3">
                <PageHeader title="Khuyến mãi" description="Chương trình tự động giảm giá sản phẩm + banner trang chủ." />
                <Link href="/admin/promotions/create" className="mt-1 flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> Thêm chương trình
                </Link>
            </div>

            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div> : (
                <div className="space-y-3">
                    {data?.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900">{p.name}
                                    {!p.isActive && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">tắt</span>}</p>
                                <p className="text-xs text-gray-400">
                                    {scopeLabel(p)} ·{' '}
                                    {p.discountType === 'PERCENT' ? `-${p.value}%` : `-${formatVnd(p.value)}`} ·{' '}
                                    {p.endAt ? `đến ${new Date(p.endAt).toLocaleDateString('vi-VN')}` : 'không hạn'}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <button onClick={() => setDetail(p)} title="Xem chi tiết" className="text-gray-400 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                                <Link href={`/admin/promotions/${p.id}/edit`} title="Sửa" className="text-gray-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></Link>
                                <button onClick={() => remove.mutate(p.id)} title="Xoá" className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ))}
                    {data?.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">Chưa có chương trình nào.</p>}
                </div>
            )}

            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
                    <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                            <h3 className="truncate font-semibold text-gray-900">{detail.name}</h3>
                            <button onClick={() => setDetail(null)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            {detail.bannerImage && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={detail.bannerImage} alt="" className="mb-4 h-32 w-full rounded-lg border border-gray-100 object-cover" />
                            )}
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                <Row label="Trạng thái" value={detail.isActive ? 'Đang chạy' : 'Đã tắt'} />
                                <Row label="Phạm vi" value={scopeLabel(detail)} />
                                <Row label="Kiểu giảm" value={detail.discountType === 'PERCENT' ? 'Theo %' : 'Số tiền cố định'} />
                                <Row label="Giá trị" value={detail.discountType === 'PERCENT' ? `${detail.value}%` : formatVnd(detail.value)} />
                                <Row label="Giảm tối đa" value={detail.maxDiscount != null ? formatVnd(detail.maxDiscount) : '—'} />
                                <Row label="Độ ưu tiên" value={detail.priority} />
                                <Row label="Bắt đầu" value={dt(detail.startAt) ?? 'Ngay khi tạo'} />
                                <Row label="Kết thúc" value={dt(detail.endAt) ?? 'Không giới hạn'} />
                                <div className="col-span-2"><Row label="Mô tả" value={detail.description || '—'} /></div>
                                <div className="col-span-2"><Row label="Liên kết khi bấm" value={detail.linkUrl || '—'} /></div>
                                <Row label="Ngày tạo" value={dt(detail.createdAt) ?? '—'} />
                            </dl>
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
