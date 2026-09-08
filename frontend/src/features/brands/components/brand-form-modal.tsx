'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useCreateBrand, useUpdateBrand } from '../hooks/use-brand';
import type { Brand } from '../types';
import Image from 'next/image';

const schema = z.object({ name: z.string().min(1, 'Nhập tên').max(100), isActive: z.boolean() });
type FormValues = z.infer<typeof schema>;

export function BrandFormModal({ open, onClose, brand }: { open: boolean; onClose: () => void; brand?: Brand }) {
    const mode = brand ? 'edit' : 'create';
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', isActive: true },
    });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        reset(brand ? { name: brand.name, isActive: brand.isActive } : { name: '', isActive: true });
        setFile(null);
        setPreview(brand?.logoUrl ?? null);
    }, [open, brand, reset]);

    useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const createMut = useCreateBrand();
    const updateMut = useUpdateBrand();
    const pending = createMut.isPending || updateMut.isPending;
    const error = createMut.error || updateMut.error;

    const onSubmit = (v: FormValues) => {
        const form = new FormData();
        form.append('name', v.name);
        form.append('isActive', String(v.isActive));
        if (file) form.append('logo', file);
        if (mode === 'create') {
            createMut.mutate(form, { onSuccess: onClose });
        }
        else if (brand) {
            updateMut.mutate({ id: brand.id, form }, { onSuccess: onClose });
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === 'create' ? 'Thêm thương hiệu' : `Sửa "${brand?.name}"`}
            footer={
                <>
                    <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
                    <Button type="submit" form="brand-form" disabled={pending}>{pending ? 'Đang lưu…' : 'Lưu'}</Button>
                </>
            }
        >
            <form id="brand-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Field label="Tên thương hiệu" error={errors.name?.message}>
                    <Input {...register('name')} placeholder="VD: Espressif" />
                </Field>
                <Field label="Logo">
                    <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            {preview ? (
                                <Image src={preview} alt="" width={64} height={64} className="h-full w-full object-contain" unoptimized />
                            ) : (
                                <ImagePlus className="h-6 w-6 text-gray-300" />
                            )}
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>Chọn ảnh</Button>
                            {preview && (
                                <button type="button" onClick={() => {
                                    setFile(null);
                                    setPreview(null); if (fileRef.current) fileRef.current.value = '';
                                }} className="cursor-pointer text-xs text-gray-400 hover:text-red-600">
                                    Xóa ảnh
                                </button>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    </div>
                </Field>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded" /> Hiển thị
                </label>
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{getApiErrorMessage(error)}</p>}
            </form>
        </Modal>
    );
}