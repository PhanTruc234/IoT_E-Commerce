import { apiClient } from '@/shared/lib/api-client';

export interface WishlistProduct {
    id: string; name: string; slug: string;
    price: number; salePrice: number | null;
    status: string; stockQuantity: number;
    image: string | null; addedAt: string;
}

export const wishlistApi = {
    list: () => apiClient.get<WishlistProduct[]>('/wishlist').then((r) => r.data),
    ids: () => apiClient.get<string[]>('/wishlist/ids').then((r) => r.data),
    add: (productId: string) => apiClient.post('/wishlist', { productId }).then((r) => r.data),
    remove: (productId: string) => apiClient.delete(`/wishlist/${productId}`).then((r) => r.data),
};