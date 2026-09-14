'use client';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { brandsApi, type BrandListParams, type BrandPayload } from '../api/brand.api';

export function useBrands(params: BrandListParams) {
    return useQuery({
        queryKey: ['admin', 'brands', params],
        queryFn: () => brandsApi.list(params),
        placeholderData: keepPreviousData,
    });
}
export function useCreateBrand() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (payload: BrandPayload) => brandsApi.create(payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'brands'] }) });
}
export function useUpdateBrand() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: BrandPayload }) => brandsApi.update(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'brands'] }) });
}
export function useDeleteBrand() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => brandsApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'brands'] }) });
}