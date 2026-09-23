'use client';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/features/categories/api/categories.api';
import { brandsApi } from '@/features/brands/api/brand.api';
import type { CategoryTreeNode } from '@/features/categories/types';
import { CategoryOption } from '../types';


function flatten(nodes: CategoryTreeNode[], acc: CategoryOption[] = []): CategoryOption[] {
    for (const n of nodes) {
        acc.push({
            id: n.id,
            label: `${'— '.repeat(Math.max(0, n.level - 1))}${n.name}`,
            level: n.level,
            isLeaf: !n.children?.length,
        });
        if (n.children?.length) flatten(n.children, acc);
    }
    return acc;
}

export function useCategoryOptions() {
    return useQuery({
        queryKey: ['admin', 'category-options'],
        queryFn: async () => flatten(await categoriesApi.adminTree()),
        staleTime: 60_000,
    });
}

export function useBrandOptions() {
    return useQuery({
        queryKey: ['admin', 'brand-options'],
        queryFn: async () =>
            (await brandsApi.list({ page: 1, limit: 100, includeInactive: true })).data,
        staleTime: 60_000,
    });
}