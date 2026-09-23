import { apiClient } from '@/shared/lib/api-client';
import type { Specification, SpecDataType, SpecListResponse } from '../types';

export interface CreateSpecPayload {
    name: string;
    unit?: string;
    dataType?: SpecDataType;
}

export const specificationsApi = {
    list: (search?: string) =>
        apiClient
            .get<SpecListResponse>('/specifications', { params: { page: 1, limit: 100, search } })
            .then((r) => r.data),
    create: (payload: CreateSpecPayload) =>
        apiClient.post<Specification>('/specifications', payload).then((r) => r.data),
};