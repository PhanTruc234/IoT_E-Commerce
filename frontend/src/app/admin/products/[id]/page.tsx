'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Spinner } from '@/shared/ui/spinner';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { ProductForm } from '@/features/products/components/product-form';
import { toProductPayload } from '@/features/products/schemas/product.schema';
import { useProduct, useUpdateProduct } from '@/features/products/hooks/use-products';
import { ImageGallery } from '@/features/products/components/image-gallery';
import { SpecEditor } from '@/features/products/components/spec-editor';
import { VariantsTab } from '@/features/products/components/variants-tab';
import { ComboTab } from '@/features/products/components/combo-tab';

const TABS = [
    { key: 'info', label: 'Thông tin' },
    { key: 'images', label: 'Ảnh' },
    { key: 'specs', label: 'Thông số' },
    { key: 'variants', label: 'Thuộc tính & Biến thể' },
    { key: 'combo', label: 'Combo' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export default function EditProductPage() {
    const { id } = useParams<{ id: string }>();
    const [tab, setTab] = useState<TabKey>('info');
    const { data: product, isLoading, isError, error } = useProduct(id);
    const update = useUpdateProduct(id);

    const disabledReason = (key: TabKey): string | null => {
        if (!product) return null;
        if (key === 'variants' && product.type === 'COMBO') return 'Sản phẩm Combo không dùng biến thể';
        if (key === 'combo' && product.type === 'VARIABLE') return 'Sản phẩm có biến thể không thể làm Combo';
        return null;
    };
    useEffect(() => {
        if (product && disabledReason(tab)) setTab('info');
    }, [product?.type]);

    if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
    if (isError || !product) return <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>;

    return (
        <div>
            <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4" /> Danh sách
            </Link>
            <PageHeader title={product.name} description={`SKU: ${product.sku} · Loại: ${product.type}`} />
            <div className="mb-5 flex flex-wrap gap-1 border-b border-gray-200">
                {TABS.map((t) => {
                    const reason = disabledReason(t.key);
                    const active = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            onClick={() => !reason && setTab(t.key)}
                            disabled={!!reason}
                            title={reason ?? undefined}
                            className={`inline-flex items-center gap-1 border-b-2 px-4 py-2 text-sm font-medium transition ${reason
                                ? 'cursor-not-allowed border-transparent text-gray-300'
                                : active
                                    ? 'cursor-pointer border-blue-600 text-blue-600'
                                    : 'cursor-pointer border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {reason && <Lock className="h-3 w-3" />}
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {tab === 'info' && (
                <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6">
                    <ProductForm
                        lockType
                        currentType={product.type}
                        submitLabel="Lưu thay đổi"
                        submitting={update.isPending}
                        defaultValues={{
                            name: product.name,
                            categoryId: product.categoryId,
                            brandId: product.brandId ?? '',
                            description: product.description ?? '',
                            price: String(product.price),
                            salePrice: product.salePrice != null ? String(product.salePrice) : '',
                            stockQuantity: String(product.stockQuantity),
                            status: product.status,
                            type: product.type,
                        }}
                        onSubmit={(v) => {
                            const { type: _drop, ...rest } = toProductPayload(v);
                            void _drop;
                            update.mutate(rest);
                        }}
                    />
                    {update.isError && (
                        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{getApiErrorMessage(update.error)}</p>
                    )}
                    {update.isSuccess && (
                        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">Đã lưu.</p>
                    )}
                </div>
            )}

            {tab === 'images' && <ImageGallery productId={product.id} />}
            {tab === 'specs' && <SpecEditor productId={product.id} />}
            {tab === 'variants' && <VariantsTab productId={product.id} />}
            {tab === 'combo' && <ComboTab productId={product.id} />}
        </div>
    );
}