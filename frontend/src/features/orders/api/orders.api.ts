import { apiClient } from '@/shared/lib/api-client';
import type { AdminOrderDetail, AdminOrderListResponse, AdminOrderParams, Order, OrderStatus, PaymentMethod } from '../types';

export interface CreateOrderBody {
    recipientName: string;
    phone: string;
    address: string;
    note?: string;
    paymentMethod: PaymentMethod;
}
export interface CreateOrderResult {
    order: Order;
    paymentUrl?: string;
}

export const ordersApi = {
    create: (body: CreateOrderBody) => apiClient.post<CreateOrderResult>('/orders', body).then((r) => r.data),
    list: () => apiClient.get<Order[]>('/orders').then((r) => r.data),
    get: (id: string) => apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),
    repay: (id: string) => apiClient.post<{ paymentUrl: string }>(`/orders/${id}/repay`).then((r) => r.data),
    adminList: (params: AdminOrderParams) => apiClient.get<AdminOrderListResponse>('/admin/orders', { params }).then((r) => r.data),
    adminGet: (id: string) => apiClient.get<AdminOrderDetail>(`/admin/orders/${id}`).then((r) => r.data),
    updateStatus: (id: string, status: OrderStatus) => apiClient.patch<AdminOrderDetail>(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
    cancel: (id: string) => apiClient.patch<Order>(`/orders/${id}/cancel`).then((r) => r.data),
};