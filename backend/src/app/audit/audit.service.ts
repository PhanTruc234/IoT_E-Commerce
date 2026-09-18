import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { AuditListQueryDto } from './dto/audit-list-query.dto';

export interface AuditRecord {
    actorId?: string | null;
    actorEmail?: string | null;
    role?: string | null;
    action: string;
    entity?: string | null;
    entityId?: string | null;
    method: string;
    path: string;
    summary?: string | null;
    statusCode: number;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
    constructor(private readonly prisma: PrismaService) { }

    async record(data: AuditRecord) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    actorId: data.actorId ?? null,
                    actorEmail: data.actorEmail ?? null,
                    role: data.role ?? null,
                    action: data.action,
                    entity: data.entity ?? null,
                    entityId: data.entityId ?? null,
                    method: data.method,
                    path: data.path,
                    summary: data.summary ?? null,
                    statusCode: data.statusCode,
                    ipAddress: data.ipAddress ?? null,
                    userAgent: data.userAgent ?? null,
                    metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
                },
            });
        } catch {
            return;
        }
    }

    async findAll(query: AuditListQueryDto) {
        const { page, limit, role, action, entity, search } = query;
        const where: Prisma.AuditLogWhereInput = {
            ...(role ? { role } : {}),
            ...(action ? { action } : {}),
            ...(entity ? { entity } : {}),
            ...(search
                ? {
                    OR: [
                        { actorEmail: { contains: search, mode: 'insensitive' } },
                        { summary: { contains: search, mode: 'insensitive' } },
                        { path: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return { data, meta: buildMeta(total, page, limit) };
    }
}
