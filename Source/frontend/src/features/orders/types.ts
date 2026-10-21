import type { InvoiceRequest } from '@/features/tax/api/tax.api';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'VNPAY';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED';
export type PaymentTxnStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
export interface OrderPayment {
    status: PaymentTxnStatus;
    amount: number;
    expiresAt: string;
    needsRefund: boolean;
    createdAt: string;
}
export interface AdminOrderPayment extends OrderPayment {
    id: string;
    txnRef: string;
    providerTxnNo: string | null;
    bankCode: string | null;
    responseCode: string | null;
    paidAt: string | null;
    checkedAt: string | null;
}
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
    /** Giá gốc lúc đặt (đơn cũ: null) */
    listPrice: number | null;
    priceSource: 'NONE' | 'SALE' | 'PROMOTION' | null;
    promotionName: string | null;
}
export interface ShipmentEvent {
    id: string;
    type: string;
    status: string;
    reason: string | null;
    warehouse: string | null;
    occurredAt: string;
}
export interface Order {
    id: string;
    code: string;
    recipientName: string;
    phone: string;
    address: string;
    province: string | null;
    wardName: string | null;
    note: string | null;
    subtotal: number;
    shippingFee: number;
    shippingDiscount: number;
    total: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paidAt: string | null;
    createdAt: string;
    trackingCode: string | null;
    trackingUrl?: string | null;
    shippingStatus: string | null;
    expectedDeliveryAt: string | null;
    items: OrderItem[];
    orderStatusHistories?: OrderStatusHistory[];
    shipmentEvents?: ShipmentEvent[];
    payments?: OrderPayment[];
    taxRate: number | null;
    taxAmount: number;
    pricesIncludeTax: boolean;
    invoiceRequest?: InvoiceRequest | null;
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
    trackingCode: string | null;
    shippingStatus: string | null;
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
    carrierFee: number | null;
    canShip: boolean;
    carrierSandbox: boolean;
    payments: AdminOrderPayment[];
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