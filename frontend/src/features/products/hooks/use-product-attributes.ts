'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productAttributesApi, type AttributeInput } from '../api/product-attributes.api';

export function useProductAttributes(productId: string) {
    return useQuery({
        queryKey: ['admin', 'product-attributes', productId],
        queryFn: () => productAttributesApi.list(productId),
        enabled: !!productId,
    });
}

export function useReplaceAttributes(productId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (attributes: AttributeInput[]) => productAttributesApi.replace(productId, attributes),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'product-attributes', productId] });
            qc.invalidateQueries({ queryKey: ['admin', 'product-variants', productId] });
            qc.invalidateQueries({ queryKey: ['admin', 'product', productId] });
        },
    });
}