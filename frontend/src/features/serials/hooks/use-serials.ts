'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serialsApi, type ActivateSerialBody, type CreateSerialsBody, type SerialListParams } from '../api/serials.api';

export function useSerials(params: SerialListParams) {
    return useQuery({ queryKey: ['admin', 'serials', params], queryFn: () => serialsApi.list(params) });
}
export function useCreateSerials() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (b: CreateSerialsBody) => serialsApi.create(b), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'serials'] }) });
}
export function useActivateSerial() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, body }: { id: string; body: ActivateSerialBody }) => serialsApi.activate(id, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'serials'] }) });
}
export function useDeleteSerial() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => serialsApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'serials'] }) });
}
import type { GenerateSerialsBody } from '../api/serials.api';

export function useSerialSummary(productId?: string, variantId?: string) {
    return useQuery({
        queryKey: ['admin', 'serial-summary', productId, variantId ?? null],
        queryFn: () => serialsApi.summary(productId!, variantId),
        enabled: !!productId,
    });
}
export function useGenerateSerials() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (b: GenerateSerialsBody) => serialsApi.generate(b), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'serials'] }) });
}