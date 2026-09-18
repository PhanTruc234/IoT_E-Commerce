'use client';
import { create } from 'zustand';

interface CartUI {
    open: boolean;
    setOpen: (open: boolean) => void;
}
export const useCartUI = create<CartUI>((set) => ({
    open: false,
    setOpen: (open) => set({ open }),
}));