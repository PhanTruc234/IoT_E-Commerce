'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { ProductForm } from '@/features/products/components/product-form';
import { toProductPayload } from '@/features/products/schemas/product.schema';
import { useCreateProduct } from '@/features/products/hooks/use-products';

const TABS = [
    { key: 'info', label: 'Thông tin' },
    { key: 'images', label: 'Ảnh' },
    { key: 'specs', label: 'Thông số' },
    { key: 'variants', label: 'Thuộc tính & Biến thể' },
    { key: 'combo', label: 'Combo' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export default function CreateProductPage() {
    const router = useRouter();
    const create = useCreateProduct();
    const [tab, setTab] = useState<TabKey>('info');

    return (
        <div>
            <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4" /> Danh sách
            </Link>
            <PageHeader
                title="Thêm sản phẩm"
                description="Lưu thông tin cơ bản trước, rồi thêm ảnh / thông số / biến thể / combo."
            />

            {/* Tabs — 4 tab sau bị khóa cho tới khi tạo xong SP */}
            <div className="mb-5 flex flex-wrap gap-1 border-b border-gray-200">
                {TABS.map((t) => {
                    const locked = t.key !== 'info';
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex cursor-pointer items-center gap-1 border-b-2 px-4 py-2 text-sm font-medium transition ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            {locked && <Lock className="h-3 w-3" />}
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {tab === 'info' ? (
                <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6">
                    <ProductForm
                        submitLabel="Tạo & tiếp tục"
                        submitting={create.isPending}
                        onSubmit={(v) =>
                            create.mutate(toProductPayload(v), {
                                onSuccess: (product) => router.replace(`/admin/products/${product.id}`),
                            })
                        }
                    />
                    {create.isError && (
                        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {getApiErrorMessage(create.error)}
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
                    <Lock className="h-8 w-8 text-gray-300" />
                    <p className="mt-3 max-w-sm text-sm text-gray-500">
                        Hãy lưu <b>Thông tin</b> cơ bản trước. Sau khi tạo, bạn sẽ thêm được ảnh, thông số,
                        biến thể và combo.
                    </p>
                    <button
                        onClick={() => setTab('info')}
                        className="mt-3 cursor-pointer text-sm font-medium text-blue-600 hover:underline"
                    >
                        ← Về tab Thông tin
                    </button>
                </div>
            )}
        </div>
    );
}