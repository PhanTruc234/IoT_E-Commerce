import { apiClient } from '@/shared/lib/api-client';

export interface TaxSetting { enabled: boolean; rate: number; pricesIncludeTax: boolean }

export type InvoiceBuyerType = 'PERSONAL' | 'COMPANY';
export type InvoiceStatus = 'PENDING' | 'ISSUED' | 'REJECTED';

export interface InvoiceRequest {
    id: string;
    orderId: string;
    buyerType: InvoiceBuyerType;
    buyerName: string;
    taxCode: string | null;
    address: string;
    email: string;
    note: string | null;
    status: InvoiceStatus;
    invoiceNumber: string | null;
    adminNote: string | null;
    processedAt: string | null;
    createdAt: string;
}
export interface AdminInvoiceRequest extends InvoiceRequest {
    order: { id: string; code: string; total: number; taxRate: number | null; taxAmount: number; pricesIncludeTax: boolean; status: string; createdAt: string };
    user: { fullName: string; email: string };
}
export interface InvoiceRequestBody {
    orderId: string; buyerType: InvoiceBuyerType; buyerName: string; taxCode?: string; address: string; email: string; note?: string;
}

export const taxApi = {
    setting: () => apiClient.get<TaxSetting>('/tax/setting').then((r) => r.data),
    updateSetting: (body: Partial<TaxSetting>) => apiClient.patch<TaxSetting>('/admin/tax/setting', body).then((r) => r.data),
    requestInvoice: (body: InvoiceRequestBody) => apiClient.post<InvoiceRequest>('/invoice-requests', body).then((r) => r.data),
    adminInvoices: (params: { status?: InvoiceStatus; page?: number; limit?: number }) =>
        apiClient.get<{ data: AdminInvoiceRequest[]; meta: { page: number; limit: number; total: number; totalPages: number }; pending: number }>(
            '/admin/invoice-requests', { params },
        ).then((r) => r.data),
    processInvoice: (id: string, body: { status: 'ISSUED' | 'REJECTED'; invoiceNumber?: string; adminNote?: string }) =>
        apiClient.patch<InvoiceRequest>(`/admin/invoice-requests/${id}`, body).then((r) => r.data),
};

export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; color: 'amber' | 'green' | 'red' }> = {
    PENDING: { label: 'Chờ xử lý', color: 'amber' },
    ISSUED: { label: 'Đã xuất', color: 'green' },
    REJECTED: { label: 'Từ chối', color: 'red' },
};
