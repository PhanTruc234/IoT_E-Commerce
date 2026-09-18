import { apiClient } from '@/shared/lib/api-client';
import type { OrderStatus } from '@/features/orders/types';

export interface Overview {
    kpis: {
        revenueTotal: number;
        revenueMonth: number;
        ordersTotal: number;
        ordersPending: number;
        customers: number;
        products: number;
    };
    moderation: { reviewsPending: number; questionsUnanswered: number; ordersPending: number };
    statusBreakdown: { status: OrderStatus; count: number }[];
    revenueTrend: { date: string; revenue: number }[];
    topProducts: { id: string; name: string; soldCount: number; price: number; image: string | null }[];
    lowStock: { id: string; name: string; stockQuantity: number; image: string | null }[];
    recentOrders: { id: string; code: string; recipientName: string; total: number; status: OrderStatus; createdAt: string }[];
}

export const overviewApi = {
    get: () => apiClient.get<Overview>('/admin/overview').then((r) => r.data),
};
