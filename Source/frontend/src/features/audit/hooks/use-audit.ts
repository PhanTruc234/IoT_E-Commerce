'use client';
import { useQuery } from '@tanstack/react-query';
import { auditApi, type AuditParams } from '../api/audit.api';

export function useAuditLogs(params: AuditParams) {
    return useQuery({ queryKey: ['admin', 'audit', params], queryFn: () => auditApi.list(params) });
}
