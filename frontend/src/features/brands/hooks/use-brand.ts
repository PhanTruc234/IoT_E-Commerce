'use client';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { brandsApi, type BrandListParams } from '../api/brand.api';

export function useBrands(params: BrandListParams) {
    return useQuery({
        queryKey: ['admin', 'brands', params],
        queryFn: () => brandsApi.list(params),
        placeholderData: keepPreviousData,
    });
}
export function useCreateBrand() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (form: FormData) => brandsApi.create(form), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'brands'] }) });
}
export function useUpdateBrand() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, form }: { id: string; form: FormData }) => brandsApi.update(id, form), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'brands'] }) });
}
export function useDeleteBrand() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => brandsApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'brands'] }) });
}