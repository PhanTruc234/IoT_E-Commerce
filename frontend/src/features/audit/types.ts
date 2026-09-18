export interface AuditLog {
    id: string;
    actorId: string | null;
    actorEmail: string | null;
    role: string | null;
    action: string;
    entity: string | null;
    entityId: string | null;
    method: string;
    path: string;
    summary: string | null;
    statusCode: number;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

export interface AuditLogList {
    data: AuditLog[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}
