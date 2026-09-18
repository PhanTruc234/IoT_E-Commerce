'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type CreateOrderBody } from '../api/orders.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AdminOrderParams, OrderStatus } from '../types';

export function useCreateOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateOrderBody) => ordersApi.create(body),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    });
}
export function useRepayOrder() {
    return useMutation({ mutationFn: (id: string) => ordersApi.repay(id) });
}
export function useOrder(id: string) {
    return useQuery({ queryKey: ['order', id], queryFn: () => ordersApi.get(id), enabled: !!id });
}
export function useMyOrders() {
    const status = useAuthStore((s) => s.status);
    return useQuery({ queryKey: ['orders'], queryFn: ordersApi.list, enabled: status === 'authenticated' });
}
export function useAdminOrders(params: AdminOrderParams) {
    return useQuery({ queryKey: ['admin', 'orders', params], queryFn: () => ordersApi.adminList(params) });
}
export function useAdminOrder(id: string) {
    return useQuery({ queryKey: ['admin', 'order', id], queryFn: () => ordersApi.adminGet(id), enabled: !!id });
}
export function useUpdateOrderStatus(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id, status),
        onSuccess: (data) => {
            qc.setQueryData(['admin', 'order', id], data);
            qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
        },
    });
}
export function useCancelMyOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ordersApi.cancel(id),
        onSuccess: (data) => {
            qc.setQueryData(['order', data.id], data);
            qc.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}