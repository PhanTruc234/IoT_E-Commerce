import { apiClient } from '@/shared/lib/api-client';
import type { AdminOrderDetail, AdminOrderListResponse, AdminOrderParams, Order, OrderStatus, PaymentMethod } from '../types';

export interface CreateOrderBody {
    recipientName: string;
    phone: string;
    address: string;
    provinceId?: number;
    wardId?: number;
    province?: string;
    note?: string;
    productCouponCode?: string;
    shippingCouponCode?: string;
    paymentMethod: PaymentMethod;
}
export interface DirectOrderBody extends CreateOrderBody {
    productId: string;
    variantId?: string;
    quantity: number;
}
export interface CreateOrderResult {
    order: Order;
    paymentUrl?: string;
}

export const ordersApi = {
    create: (body: CreateOrderBody) => apiClient.post<CreateOrderResult>('/orders', body).then((r) => r.data),
    createDirect: (body: DirectOrderBody) => apiClient.post<CreateOrderResult>('/orders/direct', body).then((r) => r.data),
    list: () => apiClient.get<Order[]>('/orders').then((r) => r.data),
    get: (id: string) => apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),
    repay: (id: string) => apiClient.post<{ paymentUrl: string }>(`/orders/${id}/repay`).then((r) => r.data),
    adminList: (params: AdminOrderParams) => apiClient.get<AdminOrderListResponse>('/admin/orders', { params }).then((r) => r.data),
    adminGet: (id: string) => apiClient.get<AdminOrderDetail>(`/admin/orders/${id}`).then((r) => r.data),
    updateStatus: (id: string, status: OrderStatus) => apiClient.patch<AdminOrderDetail>(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
    cancel: (id: string) => apiClient.patch<Order>(`/orders/${id}/cancel`).then((r) => r.data),
    createShipment: (id: string) => apiClient.post<AdminOrderDetail>(`/admin/orders/${id}/shipment`).then((r) => r.data),
    syncShipment: (id: string) => apiClient.post<AdminOrderDetail>(`/admin/orders/${id}/shipment/sync`).then((r) => r.data),
    shipmentLive: (id: string) => apiClient.get<{ status: string; leadtime: string | null }>(`/admin/orders/${id}/shipment/live`).then((r) => r.data),
    shipmentLabel: (id: string) => apiClient.get<{ url: string }>(`/admin/orders/${id}/shipment/label`).then((r) => r.data),
    simulateShipment: (id: string, status: string) =>
        apiClient.post<AdminOrderDetail>(`/admin/orders/${id}/shipment/simulate`, { status }).then((r) => r.data),
};