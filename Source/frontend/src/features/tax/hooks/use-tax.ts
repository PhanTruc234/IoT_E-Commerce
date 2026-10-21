'use client';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taxApi, type InvoiceRequestBody, type InvoiceStatus, type TaxSetting } from '../api/tax.api';

export function useTaxSetting() {
    return useQuery({ queryKey: ['tax', 'setting'], queryFn: taxApi.setting, staleTime: 5 * 60 * 1000 });
}
export function useUpdateTaxSetting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<TaxSetting>) => taxApi.updateSetting(body),
        onSuccess: (data) => qc.setQueryData(['tax', 'setting'], data),
    });
}
export function useRequestInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: InvoiceRequestBody) => taxApi.requestInvoice(body),
        onSuccess: (_d, body) => qc.invalidateQueries({ queryKey: ['order', body.orderId] }),
    });
}
export function useAdminInvoices(params: { status?: InvoiceStatus; page?: number }) {
    return useQuery({ queryKey: ['admin', 'invoices', params], queryFn: () => taxApi.adminInvoices({ ...params, limit: 20 }), placeholderData: keepPreviousData });
}
export function useProcessInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (a: { id: string; body: { status: 'ISSUED' | 'REJECTED'; invoiceNumber?: string; adminNote?: string } }) => taxApi.processInvoice(a.id, a.body),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'invoices'] }),
    });
}
