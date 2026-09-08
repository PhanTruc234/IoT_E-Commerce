import { apiClient } from '@/shared/lib/api-client';
import type { Category, CategoryTreeNode } from '../types';

export interface CreateCategoryPayload {
    name: string;
    description?: string;
    icon?: string;
    parentId?: string;
    sortOrder?: number;
}
export interface UpdateCategoryPayload {
    name?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export const categoriesApi = {
    adminTree: () => apiClient.get<CategoryTreeNode[]>('/categories/admin/tree').then((r) => r.data),
    create: (p: CreateCategoryPayload) => apiClient.post<Category>('/categories', p).then((r) => r.data),
    update: (id: string, p: UpdateCategoryPayload) => apiClient.patch<Category>(`/categories/${id}`, p).then((r) => r.data),
    remove: (id: string) => apiClient.delete<{ message: string }>(`/categories/${id}`).then((r) => r.data),
};