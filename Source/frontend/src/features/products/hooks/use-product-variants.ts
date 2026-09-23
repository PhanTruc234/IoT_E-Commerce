'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productVariantsApi, type UpdateVariantInput } from '../api/product-variants.api';

function useInvalidateVariants(productId: string) {
    const qc = useQueryClient();
    return () => {
        qc.invalidateQueries({ queryKey: ['admin', 'product-variants', productId] });
        qc.invalidateQueries({ queryKey: ['admin', 'product', productId] });
    };
}

export function useProductVariants(productId: string) {
    return useQuery({
        queryKey: ['admin', 'product-variants', productId],
        queryFn: () => productVariantsApi.list(productId),
        enabled: !!productId,
    });
}
export function useGenerateVariants(productId: string) {
    const invalidate = useInvalidateVariants(productId);
    return useMutation({ mutationFn: () => productVariantsApi.generate(productId), onSuccess: invalidate });
}
export function useUpdateVariant(productId: string) {
    const invalidate = useInvalidateVariants(productId);
    return useMutation({
        mutationFn: ({ variantId, data }: { variantId: string; data: UpdateVariantInput }) =>
            productVariantsApi.update(productId, variantId, data),
        onSuccess: invalidate,
    });
}
export function useDeleteVariant(productId: string) {
    const invalidate = useInvalidateVariants(productId);
    return useMutation({ mutationFn: (variantId: string) => productVariantsApi.remove(productId, variantId), onSuccess: invalidate });
}