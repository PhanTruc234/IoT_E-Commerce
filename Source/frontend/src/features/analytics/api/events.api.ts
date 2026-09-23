import { apiClient } from '@/shared/lib/api-client';

export type EventType = 'VIEW_PRODUCT' | 'SEARCH' | 'ADD_TO_CART' | 'VIEW_CATEGORY';
export interface TrackPayload { type: EventType; productId?: string; categoryId?: string; keyword?: string }
export function track(payload: TrackPayload) {
    apiClient.post('/events', payload).catch(() => { });
}

export interface Analytics {
    days: number;
    totals: {
        views: number;
        searches: number;
        addToCart: number;
        orders: number
    };
    funnel: {
        views: number;
        addToCart: number;
        orders: number;
        viewToCart: number;
        cartToOrder: number
    };
    topProducts: {
        productId: string;
        name: string;
        views: number
    }[];
    topSearches: {
        keyword: string;
        count: number
    }[];
    topCategories: {
        categoryId: string;
        name: string;
        views: number
    }[];
    trend: {
        date: string;
        views: number;
        orders: number
    }[];
}

export const analyticsApi = {
    get: (days: number) => apiClient.get<Analytics>('/admin/analytics', { params: { days } }).then((r) => r.data),
};