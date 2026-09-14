'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productSpecsApi, type ProductSpecItem } from '../api/product-specs.api';

export function useProductSpecs(productId: string) {
    return useQuery({
        queryKey: ['admin', 'product-specs', productId],
        queryFn: () => productSpecsApi.list(productId),
        enabled: !!productId,
    });
}

export function useReplaceProductSpecs(productId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (items: ProductSpecItem[]) => productSpecsApi.replace(productId, items),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'product-specs', productId] });
            qc.invalidateQueries({ queryKey: ['admin', 'product', productId] });
        },
    });
}