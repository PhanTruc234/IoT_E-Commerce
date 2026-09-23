'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { specificationsApi, type CreateSpecPayload } from '../api/specifications.api';

export function useSpecifications() {
    return useQuery({
        queryKey: ['admin', 'specifications'],
        queryFn: async () => (await specificationsApi.list()).data,
        staleTime: 60_000,
    });
}

export function useCreateSpecification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSpecPayload) => specificationsApi.create(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'specifications'] }),
    });
}