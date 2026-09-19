import { BadRequestException, Injectable } from '@nestjs/common';
import { ConsentType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const TOGGLEABLE: ConsentType[] = ['MARKETING_EMAIL', 'MARKETING_SMS'];

@Injectable()
export class ConsentService {
    constructor(private readonly prisma: PrismaService) { }

    async findMine(userId: string) {
        const rows = await this.prisma.userConsent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const latest = new Map<string, (typeof rows)[number]>();
        for (const r of rows) {
            if (!latest.has(r.type)) {
                latest.set(r.type, r);
            }
        }
        return [...latest.values()];
    }

    async setConsent(userId: string, type: ConsentType, granted: boolean, meta: { ipAddress?: string; userAgent?: string }) {
        if (!TOGGLEABLE.includes(type)) {
            throw new BadRequestException('Loại đồng ý này không thể thay đổi');
        }
        return this.prisma.userConsent.create({
            data: {
                userId,
                type,
                version: '1.0',
                granted,
                grantedAt: granted ? new Date() : null,
                revokedAt: granted ? null : new Date(),
                ipAddress: meta.ipAddress,
                userAgent: meta.userAgent,
            },
        });
    }
}