'use client';
import { useQuery } from '@tanstack/react-query';
import { promotionsApi, type PromotionInput } from '../api/promotions.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useActivePromotions() {
    return useQuery({ queryKey: ['promotions', 'active'], queryFn: promotionsApi.active, staleTime: 5 * 60 * 1000 });
}
export function useAdminPromotions() {
    return useQuery({ queryKey: ['admin', 'promotions'], queryFn: promotionsApi.adminList });
}
export function usePromotionMutations() {
    const qc = useQueryClient();
    const inv = () => { qc.invalidateQueries({ queryKey: ['admin', 'promotions'] }); qc.invalidateQueries({ queryKey: ['promotions', 'active'] }); };
    return {
        create: useMutation({ mutationFn: (b: PromotionInput) => promotionsApi.adminCreate(b), onSuccess: inv }),
        remove: useMutation({ mutationFn: (id: string) => promotionsApi.adminRemove(id), onSuccess: inv }),
        update: useMutation({ mutationFn: ({ id, body }: { id: string; body: Partial<PromotionInput> }) => promotionsApi.adminUpdate(id, body), onSuccess: inv }),
    };
}