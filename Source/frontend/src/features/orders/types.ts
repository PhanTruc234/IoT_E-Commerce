export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'VNPAY';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED';
export interface AdminOrderParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    paymentStatus?: string;
}
export interface OrderItem {
    id: string;
    productId: string;
    variantId: string | null;
    name: string;
    variantLabel: string | null;
    image: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}
export interface Order {
    id: string;
    code: string;
    recipientName: string;
    phone: string;
    address: string;
    note: string | null;
    subtotal: number;
    shippingFee: number;
    total: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paidAt: string | null;
    createdAt: string;
    items: OrderItem[];
    orderStatusHistories?: OrderStatusHistory[];
}
export interface AdminOrderRow {
    id: string;
    code: string;
    recipientName: string;
    phone: string;
    total: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    createdAt: string;
    user: { fullName: string; email: string } | null;
    _count: { items: number };
}
export interface AdminOrderListResponse {
    data: AdminOrderRow[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number
    };
}
export interface AdminOrderDetail extends Order {
    user: {
        fullName: string;
        email: string;
        phone: string | null
    } | null;
}

export interface OrderStatusHistory {
    id: string;
    status: OrderStatus;
    note: string | null;
    changedBy: string | null;
    createdAt: string;
}