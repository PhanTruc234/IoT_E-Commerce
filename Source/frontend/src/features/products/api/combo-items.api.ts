import { apiClient } from '@/shared/lib/api-client';
import type { ComboItemInput, ComboSummary } from '../types';

export const comboItemsApi = {
    get: (comboId: string) =>
        apiClient.get<ComboSummary>(`/products/${comboId}/combo-items`).then((r) => r.data),
    replace: (comboId: string, items: ComboItemInput[]) =>
        apiClient.put<ComboSummary>(`/products/${comboId}/combo-items`, { items }).then((r) => r.data),
};