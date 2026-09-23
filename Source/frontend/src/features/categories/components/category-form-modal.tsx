'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal } from '@/shared/ui/modal';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { IconPicker } from './icon-picker';
import type { Category } from '../types';
import { useCreateCategory, useUpdateCategory } from '../hooks/use-categories';
import { CategoriesSchema, CategoryFormInput, CategoryFormOutput } from '../schemas/categories.schema';

interface Props {
    open: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    parent?: { id: string; name: string; level: number } | null;
    category?: Category;
}

export function CategoryFormModal({ open, onClose, mode, parent, category }: Props) {
    const showIcon = mode === 'edit' ? (category?.level ?? 1) >= 2 : parent != null;
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
        useForm<CategoryFormInput, unknown, CategoryFormOutput>({
            resolver: zodResolver(CategoriesSchema),
            defaultValues: {
                name: '',
                description: '',
                icon: '',
                sortOrder: 0,
                isActive: true
            },
        });

    useEffect(() => {
        if (!open) return;
        reset(
            mode === 'edit' && category
                ? {
                    name: category.name,
                    description: category.description ?? '',
                    icon: category.icon ?? '',
                    sortOrder: category.sortOrder,
                    isActive: category.isActive
                }
                : {
                    name: '',
                    description: '',
                    icon: '',
                    sortOrder: 0,
                    isActive: true
                },
        );
    }, [open, mode, category, reset]);

    const createMut = useCreateCategory();
    const updateMut = useUpdateCategory();
    const pending = createMut.isPending || updateMut.isPending;
    const error = createMut.error || updateMut.error;
    const icon = watch('icon');

    const onSubmit = (v: CategoryFormOutput) => {
        if (mode === 'create') {
            createMut.mutate(
                {
                    name: v.name,
                    description: v.description || undefined,
                    icon: showIcon ? v.icon || undefined : undefined,
                    parentId: parent?.id,
                    sortOrder: v.sortOrder
                },
                { onSuccess: onClose },
            );
        } else if (category) {
            updateMut.mutate(
                {
                    id: category.id,
                    data: {
                        name: v.name,
                        description: v.description || undefined,
                        icon: showIcon ? v.icon || undefined : undefined,
                        sortOrder: v.sortOrder,
                        isActive: v.isActive
                    }
                },
                { onSuccess: onClose },
            );
        }
    };

    const title =
        mode === 'create' ? (parent ? `Thêm danh mục con vào "${parent.name}"` : 'Thêm danh mục gốc') : `Sửa "${category?.name}"`;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
                    <Button type="submit" form="category-form" disabled={pending}>{pending ? 'Đang lưu…' : 'Lưu'}</Button>
                </>
            }
        >
            <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {parent && mode === 'create' && (
                    <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">Sẽ tạo ở <b>cấp {parent.level + 1}</b> thuộc "{parent.name}"</p>
                )}
                <Field label="Tên danh mục" error={errors.name?.message}>
                    <Input {...register('name')} placeholder="VD: Cảm biến nhiệt độ" />
                </Field>
                <Field label="Mô tả" error={errors.description?.message}>
                    <textarea {...register('description')} rows={2} placeholder="Mô tả ngắn (tùy chọn)"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </Field>
                {showIcon && (
                    <Field label="Icon">
                        <IconPicker value={icon} onChange={(n) => setValue('icon', n, { shouldDirty: true })} />
                        {icon && (
                            <button type="button" onClick={() => setValue('icon', '')} className="mt-1 cursor-pointer text-xs text-gray-400 hover:text-red-600">Bỏ chọn icon</button>
                        )}
                    </Field>
                )}
                <div className="flex items-end gap-6">
                    <Field label="Thứ tự" error={errors.sortOrder?.message}>
                        <Input type="number" {...register('sortOrder')} className="w-24" />
                    </Field>
                    {mode === 'edit' && (
                        <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
                            <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded" /> Hiển thị
                        </label>
                    )}
                </div>
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{getApiErrorMessage(error)}</p>}
            </form>
        </Modal>
    );
}