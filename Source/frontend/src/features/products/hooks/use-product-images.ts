'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productImagesApi } from '../api/product-images.api';

function useInvalidateImages(productId: string) {
    const qc = useQueryClient();
    return () => {
        qc.invalidateQueries({ queryKey: ['admin', 'product-images', productId] });
        qc.invalidateQueries({ queryKey: ['admin', 'product', productId] });
        qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    };
}

export function useProductImages(productId: string) {
    return useQuery({
        queryKey: ['admin', 'product-images', productId],
        queryFn: () => productImagesApi.list(productId),
        enabled: !!productId,
    });
}

export function useUploadImage(productId: string) {
    const invalidate = useInvalidateImages(productId);
    console.log(productId, "productIdproductId")
    return useMutation({
        mutationFn: (file: File) => productImagesApi.upload(productId, file),
        onSuccess: invalidate,
    });
}

export function useDeleteImage(productId: string) {
    const invalidate = useInvalidateImages(productId);
    return useMutation({
        mutationFn: (imageId: string) => productImagesApi.remove(productId, imageId),
        onSuccess: invalidate,
    });
}

export function useSetPrimaryImage(productId: string) {
    const invalidate = useInvalidateImages(productId);
    return useMutation({
        mutationFn: (imageId: string) => productImagesApi.setPrimary(productId, imageId),
        onSuccess: invalidate,
    });
}

export function useReorderImages(productId: string) {
    const invalidate = useInvalidateImages(productId);
    return useMutation({
        mutationFn: (imageIds: string[]) => productImagesApi.reorder(productId, imageIds),
        onSuccess: invalidate,
    });
}