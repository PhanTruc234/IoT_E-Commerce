import { create } from 'zustand';

export interface BuyNowItem {
    productId: string;
    variantId?: string;
    quantity: number;
    name: string;
    image: string | null;
    variantLabel: string | null;
    unitPrice: number;
}

interface BuyNowState {
    item: BuyNowItem | null;
    set: (item: BuyNowItem) => void;
    clear: () => void;
}

export const useBuyNowStore = create<BuyNowState>((set) => ({
    item: null,
    set: (item) => set({ item }),
    clear: () => set({ item: null }),
}));
