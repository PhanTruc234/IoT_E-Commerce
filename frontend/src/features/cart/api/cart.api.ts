import { apiClient } from '@/shared/lib/api-client';
import type { Cart } from '../types';

export interface AddToCartBody {
    productId: string;
    variantId?: string;
    quantity?: number;
}

export const cartApi = {
    get: () => apiClient.get<Cart>('/cart').then((r) => r.data),
    add: (body: AddToCartBody) => apiClient.post<Cart>('/cart/items', body).then((r) => r.data),
    update: (id: string, quantity: number) => apiClient.patch<Cart>(`/cart/items/${id}`, { quantity }).then((r) => r.data),
    remove: (id: string) => apiClient.delete<Cart>(`/cart/items/${id}`).then((r) => r.data),
    clear: () => apiClient.delete<Cart>('/cart').then((r) => r.data),
};