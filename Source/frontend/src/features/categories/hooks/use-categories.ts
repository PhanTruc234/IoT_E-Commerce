'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, type CreateCategoryPayload, type UpdateCategoryPayload } from '../api/categories.api';

const KEY = ['admin', 'categories', 'tree'] as const;

export function useAdminCategoryTree() {
    return useQuery({ queryKey: KEY, queryFn: categoriesApi.adminTree });
}
export function useCreateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: CreateCategoryPayload) => categoriesApi.create(p),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
export function useUpdateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) => categoriesApi.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
export function useDeleteCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => categoriesApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}