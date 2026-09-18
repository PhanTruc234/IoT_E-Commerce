import { apiClient } from '@/shared/lib/api-client';
import type { AuditLogList } from '../types';

export interface AuditParams {
    page?: number;
    limit?: number;
    role?: string;
    action?: string;
    entity?: string;
    search?: string;
}

export const auditApi = {
    list: (params: AuditParams) => apiClient.get<AuditLogList>('/admin/audit-logs', { params }).then((r) => r.data),
};
