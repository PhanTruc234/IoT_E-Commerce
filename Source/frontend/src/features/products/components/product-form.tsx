'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    productSchema,
    type ProductFormInput,
    type ProductFormOutput,
} from '../schemas/product.schema';
import { useBrandOptions, useCategoryOptions } from '../hooks/use-selects';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import type { ProductType } from '../types';

interface Props {
    defaultValues?: Partial<ProductFormInput>;
    onSubmit: (values: ProductFormOutput) => void;
    submitting?: boolean;
    submitLabel?: string;
    lockType?: boolean;
    currentType?: ProductType;
}

export function ProductForm({
    defaultValues,
    onSubmit,
    submitting,
    submitLabel = 'Lưu',
    lockType,
    currentType,
}: Props) {
    const categories = useCategoryOptions();
    const brands = useBrandOptions();

    const { register, handleSubmit, formState: { errors } } = useForm<ProductFormInput, unknown, ProductFormOutput>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            categoryId: '',
            brandId: '',
            description: '',
            price: '',
            salePrice: '',
            stockQuantity: '0',
            status: 'ACTIVE',
            type: 'SIMPLE',
            ...defaultValues,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Field label="Tên sản phẩm" error={errors.name?.message}>
                <Input {...register('name')} placeholder="VD: ESP32 DevKit V1" />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Danh mục" error={errors.categoryId?.message}>
                    <Select {...register('categoryId')}>
                        <option value="">— Chọn danh mục —</option>
                        {categories.data?.map((c) => (
                            <option key={c.id} value={c.id} disabled={!c.isLeaf}>
                                {c.label}{!c.isLeaf ? ' (nhóm — không chọn được)' : ''}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label="Thương hiệu">
                    <Select {...register('brandId')}>
                        <option value="">— Không có —</option>
                        {brands.data?.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </Select>
                </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Giá gốc (VND)" error={errors.price?.message}>
                    <Input type="number" min={0} {...register('price')} placeholder="150000" />
                </Field>
                <Field label="Giá khuyến mãi" error={errors.salePrice?.message}>
                    <Input type="number" min={0} {...register('salePrice')} placeholder="(để trống nếu không)" />
                </Field>
                <Field label="Tồn kho" error={errors.stockQuantity?.message}>
                    <Input type="number" min={0} {...register('stockQuantity')} />
                </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Trạng thái">
                    <Select {...register('status')}>
                        <option value="ACTIVE">Đang bán</option>
                        <option value="INACTIVE">Ẩn</option>
                        <option value="OUT_OF_STOCK">Hết hàng</option>
                    </Select>
                </Field>

                <Field label="Loại sản phẩm">
                    {lockType ? (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                            {currentType === 'VARIABLE'
                                ? 'Có biến thể'
                                : currentType === 'COMBO'
                                    ? 'Combo'
                                    : 'Đơn'}{' '}
                            {/* <span className="text-gray-400">— quản lý ở tab Biến thể/Combo</span> */}
                        </div>
                    ) : (
                        <Select {...register('type')}>
                            <option value="SIMPLE">Sản phẩm đơn</option>
                            <option value="COMBO">Combo</option>
                        </Select>
                    )}
                </Field>
            </div>

            <Field label="Mô tả">
                <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Mô tả sản phẩm…"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </Field>

            <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang lưu…' : submitLabel}
                </Button>
            </div>
        </form>
    );
}