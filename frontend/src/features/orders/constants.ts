import type { OrderStatus, PaymentStatus } from './types';

export const ORDER_STATUS: Record<OrderStatus, { label: string; color: 'blue' | 'indigo' | 'amber' | 'green' | 'red' }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'blue' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'indigo' },
    SHIPPING: { label: 'Đang giao', color: 'amber' },
    COMPLETED: { label: 'Hoàn thành', color: 'green' },
    CANCELLED: { label: 'Đã huỷ', color: 'red' },
};
export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; color: 'gray' | 'amber' | 'green' | 'red' }> = {
    UNPAID: { label: 'Chưa thanh toán', color: 'gray' },
    PENDING: { label: 'Chờ thanh toán', color: 'amber' },
    PAID: { label: 'Đã thanh toán', color: 'green' },
    FAILED: { label: 'Thất bại', color: 'red' },
};
export const NEXT_ACTIONS: Record<OrderStatus, { to: OrderStatus; label: string }[]> = {
    PENDING: [{ to: 'CONFIRMED', label: 'Xác nhận đơn' }, { to: 'CANCELLED', label: 'Huỷ đơn' }],
    CONFIRMED: [{ to: 'SHIPPING', label: 'Giao hàng' }, { to: 'CANCELLED', label: 'Huỷ đơn' }],
    SHIPPING: [{ to: 'COMPLETED', label: 'Hoàn thành' }],
    COMPLETED: [],
    CANCELLED: [],
};