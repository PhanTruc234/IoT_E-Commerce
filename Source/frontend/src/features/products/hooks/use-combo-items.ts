'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { comboItemsApi, type ComboItemInput } from '../api/combo-items.api';

export function useComboItems(comboId: string) {
    return useQuery({
        queryKey: ['admin', 'combo-items', comboId],
        queryFn: () => comboItemsApi.get(comboId),
        enabled: !!comboId,
    });
}

export function useReplaceComboItems(comboId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (items: ComboItemInput[]) => comboItemsApi.replace(comboId, items),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'combo-items', comboId] });
            qc.invalidateQueries({ queryKey: ['admin', 'product', comboId] });
            qc.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}