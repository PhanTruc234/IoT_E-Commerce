export interface CartLine {
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    name: string;
    slug: string;
    image: string | null;
    unitPrice: number;
    /** Giá gốc — lớn hơn unitPrice khi đang được giảm */
    listPrice: number;
    priceSource: 'NONE' | 'SALE' | 'PROMOTION';
    promotionName: string | null;
    variantLabel: string | null;
    stock: number;
    lineTotal: number;
    available: boolean;
}
export interface Cart {
    id: string;
    items: CartLine[];
    itemCount: number;
    subtotal: number;
}