'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const COMPARE_MAX = 4;

export interface CompareItem {
    id: string;
    categoryId: string;
}

interface CompareState {
    items: CompareItem[];
    toggle: (item: CompareItem) => void;
    remove: (id: string) => void;
    clear: () => void;
}

export const useCompareStore = create<CompareState>()(
    persist(
        (set, get) => ({
            items: [],
            toggle: ({ id, categoryId }) => {
                const items = get().items;
                if (items.some((x) => x.id === id)) {
                    set({ items: items.filter((x) => x.id !== id) });
                    return;
                }
                if (items.length > 0 && items[0].categoryId !== categoryId) return;
                if (items.length < COMPARE_MAX) set({ items: [...items, { id, categoryId }] });
            },
            remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
            clear: () => set({ items: [] }),
        }),
        { name: 'compare-items' },
    ),
);