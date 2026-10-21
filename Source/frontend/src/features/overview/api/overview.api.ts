import { apiClient } from '@/shared/lib/api-client';
import type { OrderStatus } from '@/features/orders/types';

/** Số của kỳ đang xem + kỳ trước (cùng số ngày, ngay trước đó) để tính % thay đổi */
export interface Pair { cur: number; prev: number }

export interface Overview {
    range: { from: string; to: string; days: number; prevFrom: string; prevTo: string; timezone: string };
    sales: {
        netRevenue: Pair;
        orders: Pair;
        aov: Pair;
        gross: number;
        shippingCollected: number;
        daily: { date: string; net: number; orders: number }[];
        byCategory: { id: string; name: string; amount: number }[];
        byPayment: { method: 'COD' | 'VNPAY'; orders: number; net: number }[];
    };
    orders: {
        total: number;
        statusBreakdown: { status: OrderStatus; count: number }[];
        cancelRate: Pair;
        stalePending: number;
        staleConfirmed: number;
        vnpayUnpaid: number;
        needsRefund: number;
        staleHours: { pending: number; confirmed: number };
    };
    shipping: {
        inTransit: number;
        problems: { count: number; items: { id: string; code: string; shippingStatus: string | null; updatedAt: string }[] };
        shipments: number;
        carrierFee: number;
        charged: number;
        subsidy: number;
    };
    promotions: {
        active: { count: number; items: { id: string; name: string; endAt: string | null; forcePriority: boolean }[] };
        discount: Pair;
        breakdown: { sale: number; promotion: number; productVoucher: number; shippingVoucher: number; total: number };
        topVouchers: { code: string; kind: 'PRODUCT' | 'SHIPPING'; uses: number; amount: number }[];
    };
    tax: { vat: Pair; invoicesPending: number };
    products: {
        lowStock: { count: number; threshold: number; items: { id: string; name: string; stockQuantity: number }[] };
        slowMovers: { count: number; days: number; items: { id: string; name: string; stock: number; value: number }[] };
        topRevenue: { id: string; name: string; qty: number; revenue: number }[];
    };
    customers: {
        newCustomers: Pair;
        buyers: number;
        returning: number;
        firstTime: number;
        top: { id: string; name: string; email: string; orders: number; spent: number }[];
    };
    behavior: {
        views: number;
        addToCart: number;
        searches: number;
        orders: number;
        viewToCart: Pair;
        cartToOrder: Pair;
        topSearches: { keyword: string; count: number }[];
    };
    todo: { reviewsPending: number; questionsUnanswered: number; ticketsOpen: number; warrantyOpen: number; invoicesPending: number };
}

export interface OverviewRange { from: string; to: string }

export const overviewApi = {
    get: (range: OverviewRange) => apiClient.get<Overview>('/admin/overview', { params: range }).then((r) => r.data),
};
