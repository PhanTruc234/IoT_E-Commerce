'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { apiClient } from '@/shared/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { usePromotionMutations } from '@/features/promotions/hooks/use-promotions';
import type { PromotionInput } from '@/features/promotions/api/promotions.api';
import { productsApi } from '@/features/products/api/products.api';
import { uploadImages } from '@/features/uploads/api/uploads.api';

const EMPTY: PromotionInput = { name: '', discountType: 'PERCENT', value: 10, scope: 'ALL', priority: 0, isActive: true, categoryIds: [], productIds: [] };

export default function CreatePromotionPage() {
    const router = useRouter();
    const { create } = usePromotionMutations();
    const { data: categories } = useQuery({
        queryKey: ['categories', 'leaves'],
        queryFn: () => apiClient.get<{ id: string; name: string }[]>('/categories/leaves').then((r) => r.data),
    });
    const [form, setForm] = useState<PromotionInput>(EMPTY);
    const set = (k: keyof PromotionInput, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const input = 'w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500';

    const [uploading, setUploading] = useState(false);
    const onPickBanner = async (file?: File) => {
        if (!file) return;
        setUploading(true);
        try {
            const [res] = await uploadImages([file], 'misc');
            setForm((f) => ({ ...f, bannerImage: res.url }));
        } finally {
            setUploading(false);
        }
    };

    const toggleCat = (id: string) => setForm((f) => ({ ...f, categoryIds: f.categoryIds?.includes(id) ? f.categoryIds.filter((x) => x !== id) : [...(f.categoryIds ?? []), id] }));

    const [prodSearch, setProdSearch] = useState('');
    const { data: productList } = useQuery({
        queryKey: ['promo', 'product-search', prodSearch],
        queryFn: () => productsApi.listAdmin({ search: prodSearch || undefined, limit: 20 }).then((r) => r.data),
        enabled: form.scope === 'PRODUCT',
    });
    const toggleProduct = (id: string) => setForm((f) => ({ ...f, productIds: f.productIds?.includes(id) ? f.productIds.filter((x) => x !== id) : [...(f.productIds ?? []), id] }));

    const submit = () => {
        const body: PromotionInput = {
            ...form, value: Number(form.value), priority: Number(form.priority) || 0,
            maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
            endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
            startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
            categoryIds: form.scope === 'CATEGORY' ? form.categoryIds : [],
            productIds: form.scope === 'PRODUCT' ? form.productIds : [],
        };
        create.mutate(body, { onSuccess: () => router.push('/admin/promotions') });
    };

    return (
        <div>
            <Link href="/admin/promotions" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"><ArrowLeft className="h-4 w-4" /> Quay lại danh sách</Link>
            <PageHeader title="Tạo chương trình khuyến mãi" description="Tự động giảm giá sản phẩm + banner trang chủ." />

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Tên chương trình</span>
                        <input className={input} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="VD: Sale cuối tuần" /></label>
                    <label className="block sm:col-span-2 lg:col-span-3"><span className="mb-1 block text-xs font-medium text-gray-600">Mô tả ngắn <span className="text-gray-400">· hiển thị trên banner</span></span>
                        <textarea className={input} rows={3} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="Nội dung mô tả cho chương trình, hiển thị trên banner trang chủ…" /></label>
                    <div className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Ảnh banner</span>
                        <input className={input} value={form.bannerImage ?? ''} onChange={(e) => set('bannerImage', e.target.value)} placeholder="Dán URL hoặc tải ảnh ↓" />
                        <div className="mt-1.5 flex items-center gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Tải ảnh
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickBanner(e.target.files?.[0])} />
                            </label>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {form.bannerImage && <img src={form.bannerImage} alt="" className="h-8 w-14 rounded border border-gray-100 object-cover" />}
                        </div></div>
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Phạm vi áp dụng</span>
                        <select className={input} value={form.scope} onChange={(e) => set('scope', e.target.value)}>
                            <option value="ALL">Tất cả sản phẩm</option>
                            <option value="CATEGORY">Theo danh mục</option>
                            <option value="PRODUCT">Chọn sản phẩm thủ công</option>
                        </select></label>
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Kiểu giảm</span>
                        <select className={input} value={form.discountType} onChange={(e) => set('discountType', e.target.value)}>
                            <option value="PERCENT">Theo %</option>
                            <option value="FIXED">Số tiền</option>
                        </select></label>
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">{form.discountType === 'PERCENT' ? 'Phần trăm (%)' : 'Số tiền (đ)'}</span>
                        <input className={input} type="number" value={form.value} onChange={(e) => set('value', e.target.value)} /></label>
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Giảm tối đa (đ) · cho %</span>
                        <input className={input} type="number" value={form.maxDiscount ?? ''} onChange={(e) => set('maxDiscount', e.target.value)} disabled={form.discountType !== 'PERCENT'} /></label>
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Ngày bắt đầu · trống = ngay</span>
                        <input className={input} type="datetime-local" value={form.startAt ?? ''} onChange={(e) => set('startAt', e.target.value)} /></label>
                    <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Ngày kết thúc</span>
                        <input className={input} type="datetime-local" value={form.endAt ?? ''} onChange={(e) => set('endAt', e.target.value)} /></label>
                </div>

                {form.scope === 'CATEGORY' && (
                    <div className="mt-3">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Chọn danh mục áp dụng ({form.categoryIds?.length ?? 0} đã chọn)</span>
                        <div className="flex flex-wrap gap-2">
                            {categories?.map((c) => (
                                <button key={c.id} type="button" onClick={() => toggleCat(c.id)}
                                    className={`rounded border px-2 py-1 text-xs ${form.categoryIds?.includes(c.id) ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {form.scope === 'PRODUCT' && (
                    <div className="mt-3">
                        <span className="mb-1 block text-xs font-medium text-gray-600">Chọn sản phẩm áp dụng ({form.productIds?.length ?? 0} đã chọn)</span>
                        <input className={`${input} mb-2`} value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} placeholder="Tìm sản phẩm theo tên..." />
                        <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-gray-100 p-2">
                            {productList?.map((p) => {
                                const on = form.productIds?.includes(p.id);
                                return (
                                    <button key={p.id} type="button" onClick={() => toggleProduct(p.id)}
                                        className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm ${on ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                                        <span className="truncate">{on ? '✓ ' : ''}{p.name}</span>
                                        <span className="shrink-0 text-xs text-gray-400">{formatVnd(p.price)}</span>
                                    </button>
                                );
                            })}
                            {(!productList || productList.length === 0) && <p className="px-2 py-4 text-center text-xs text-gray-400">Không có sản phẩm.</p>}
                        </div>
                    </div>
                )}

                <div className="mt-4 flex gap-2">
                    <button onClick={submit} disabled={create.isPending || !form.name}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Tạo chương trình
                    </button>
                    <Link href="/admin/promotions" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Huỷ</Link>
                </div>
                {create.isError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(create.error)}</p>}
            </div>
        </div>
    );
}
