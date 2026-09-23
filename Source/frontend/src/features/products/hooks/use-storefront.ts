'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { categoriesApi } from '@/features/categories/api/categories.api';
import { brandsApi } from '@/features/brands/api/brand.api';
import { PublicProductParams } from '../types';

export function usePublicProducts(params: PublicProductParams) {
    return useQuery({
        queryKey: ['shop', 'products', params],
        queryFn: () => productsApi.listPublic(params),
        placeholderData: keepPreviousData,
    });
}

export function usePublicCategoryTree() {
    return useQuery({
        queryKey: ['shop', 'category-tree'],
        queryFn: () => categoriesApi.publicTree(),
        staleTime: 300_000,
    });
}

export function usePublicBrands() {
    return useQuery({
        queryKey: ['shop', 'brands'],
        queryFn: async () => (await brandsApi.list({ page: 1, limit: 100 })).data,
        staleTime: 300_000,
    });
}
export function usePublicCategoryLeaves() {
    return useQuery({
        queryKey: ['shop', 'category-leaves'],
        queryFn: () => categoriesApi.publicLeaves(),
        staleTime: 300_000,
    });
}
export function useCompare(ids: string[]) {
    return useQuery({
        queryKey: ['shop', 'compare', ids],
        queryFn: () => productsApi.compare(ids),
        enabled: ids.length >= 2,
    });
}