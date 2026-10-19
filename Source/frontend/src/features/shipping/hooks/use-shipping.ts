'use client';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shippingApi, type AdminZone, type ShippingQuoteBody } from '../api/shipping.api';

export function useShippingConfig() {
    return useQuery({ queryKey: ['shipping', 'config'], queryFn: shippingApi.config, staleTime: 5 * 60 * 1000 });
}

export function useProvinces() {
    return useQuery({ queryKey: ['shipping', 'provinces'], queryFn: shippingApi.provinces, staleTime: 24 * 60 * 60 * 1000, retry: 1 });
}
export function useWards(provinceId: number | null) {
    return useQuery({
        queryKey: ['shipping', 'wards', provinceId],
        queryFn: () => shippingApi.wards(provinceId!),
        enabled: !!provinceId,
        staleTime: 24 * 60 * 60 * 1000,
    });
}
export function useShippingQuote(body: ShippingQuoteBody | null) {
    return useQuery({
        queryKey: ['shipping', 'quote', body],
        queryFn: () => shippingApi.quote(body!),
        enabled: !!body,
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
        retry: false,
    });
}

export function useAdminZones() {
    return useQuery({ queryKey: ['admin', 'shipping', 'zones'], queryFn: shippingApi.adminZones });
}
export function useUpdateZone() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: Partial<AdminZone> }) => shippingApi.updateZone(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'shipping', 'zones'] });
            qc.invalidateQueries({ queryKey: ['shipping', 'config'] });
        },
    });
}
export function useAdminShippingSetting() {
    return useQuery({ queryKey: ['admin', 'shipping', 'setting'], queryFn: shippingApi.adminSetting });
}
export function useUpdateShippingSetting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (freeShipFrom: number) => shippingApi.updateSetting(freeShipFrom),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'shipping', 'setting'] });
            qc.invalidateQueries({ queryKey: ['shipping', 'config'] });
        },
    });
}