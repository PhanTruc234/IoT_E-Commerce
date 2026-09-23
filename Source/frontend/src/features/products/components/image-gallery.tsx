'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { GripVertical, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import {
    useDeleteImage,
    useProductImages,
    useReorderImages,
    useSetPrimaryImage,
    useUploadImage,
} from '../hooks/use-product-images';
import type { ProductImage } from '../types';

export function ImageGallery({ productId }: { productId: string }) {
    const { data, isLoading, isError, error } = useProductImages(productId);
    const upload = useUploadImage(productId);
    const del = useDeleteImage(productId);
    const setPrimary = useSetPrimaryImage(productId);
    const reorder = useReorderImages(productId);
    const fileRef = useRef<HTMLInputElement>(null);

    const [items, setItems] = useState<ProductImage[]>([]);
    const dragIndex = useRef<number | null>(null);
    useEffect(() => {
        if (data) setItems(data);
    }, [data]);

    const onFiles = async (files: FileList | null) => {
        if (!files) return;
        const fileArray = Array.from(files);

        console.log(fileArray);
        console.log('Số lượng:', fileArray.length);
        for (const file of Array.from(files)) {
            await upload.mutateAsync(file).catch(() => null);
        }
        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    const handleDrop = (dropIndex: number) => {
        const from = dragIndex.current;
        dragIndex.current = null;
        if (from == null || from === dropIndex) return;
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(dropIndex, 0, moved);
        setItems(next);
        reorder.mutate(next.map((i) => i.id));
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-gray-900">Ảnh sản phẩm</h3>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={upload.isPending}
                >
                    {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    Thêm ảnh
                </Button>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            </div>

            {isLoading ? (
                <p className="py-8 text-center text-sm text-gray-400">Đang tải…</p>
            ) : isError ? (
                <p className="py-8 text-center text-sm text-red-600">{getApiErrorMessage(error)}</p>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
                    Chưa có ảnh. Bấm “Thêm ảnh” để tải lên.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {items.map((img, index) => (
                        <div
                            key={img.id}
                            draggable
                            onDragStart={() => (dragIndex.current = index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(index)}
                            className="group relative rounded-xl border border-gray-200 bg-gray-50 p-2"
                        >
                            <div className="absolute left-2 top-2 z-10 cursor-grab rounded bg-white/80 p-0.5 text-gray-400">
                                <GripVertical className="h-4 w-4" />
                            </div>
                            {img.isPrimary && (
                                <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                    <Star className="h-3 w-3" /> Chính
                                </span>
                            )}
                            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white">
                                <Image src={img.imageUrl} alt="" width={220} height={220} className="h-full w-full object-contain" />
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <button
                                    type="button"
                                    disabled={img.isPrimary || setPrimary.isPending}
                                    onClick={() => setPrimary.mutate(img.id)}
                                    className="cursor-pointer rounded px-1.5 py-1 text-xs text-gray-500 hover:text-amber-600 disabled:opacity-40"
                                >
                                    Đặt chính
                                </button>
                                <button
                                    type="button"
                                    disabled={del.isPending}
                                    onClick={() => del.mutate(img.id)}
                                    className="cursor-pointer rounded px-1.5 py-1 text-gray-500 hover:text-red-600 disabled:opacity-40"
                                    title="Xóa"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(upload.isError || del.isError || reorder.isError || setPrimary.isError) && (
                <p className="mt-3 text-sm text-red-600">
                    {getApiErrorMessage(upload.error || del.error || reorder.error || setPrimary.error)}
                </p>
            )}
        </div>
    );
}