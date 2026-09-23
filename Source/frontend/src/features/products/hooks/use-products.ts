'use client';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    productsApi,
    type CreateProductPayload,
    type ProductListParams,
    type UpdateProductPayload,
} from '../api/products.api';

export function useProducts(params: ProductListParams) {
    return useQuery({
        queryKey: ['admin', 'products', params],
        queryFn: () => productsApi.listAdmin(params),
        placeholderData: keepPreviousData,
    });
}

export function useProduct(id: string) {
    return useQuery({
        queryKey: ['admin', 'product', id],
        queryFn: () => productsApi.getAdmin(id),
        enabled: !!id,
    });
}

export function useCreateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
    });
}

export function useUpdateProduct(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateProductPayload) => productsApi.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'products'] });
            qc.invalidateQueries({ queryKey: ['admin', 'product', id] });
        },
    });
}

export function useDeleteProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productsApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
    });
}