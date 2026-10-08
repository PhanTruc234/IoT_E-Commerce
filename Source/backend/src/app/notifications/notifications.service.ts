import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    private mineWhere(userId: string) {
        return { OR: [{ audience: 'ALL' as const }, { userId }] };
    }

    async listMine(userId: string, limit = 20) {
        const items = await this.prisma.notification.findMany({
            where: this.mineWhere(userId),
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { reads: { where: { userId }, select: { id: true } } },
        });
        return items.map((n) => ({
            id: n.id, title: n.title, body: n.body, type: n.type,
            linkUrl: n.linkUrl, createdAt: n.createdAt, read: n.reads.length > 0,
        }));
    }

    async unreadCount(userId: string) {
        const [total, read] = await Promise.all([
            this.prisma.notification.count({ where: this.mineWhere(userId) }),
            this.prisma.notificationRead.count({ where: { userId } }),
        ]);
        return { count: Math.max(0, total - read) };
    }

    async markRead(userId: string, notificationId: string) {
        await this.prisma.notificationRead.upsert({
            where: { userId_notificationId: { userId, notificationId } },
            create: { userId, notificationId },
            update: {},
        });
        return { ok: true };
    }

    async markAllRead(userId: string) {
        const unread = await this.prisma.notification.findMany({
            where: { ...this.mineWhere(userId), reads: { none: { userId } } },
            select: { id: true },
        });
        if (unread.length) {
            await this.prisma.notificationRead.createMany({
                data: unread.map((n) => ({ userId, notificationId: n.id })),
                skipDuplicates: true,
            });
        }
        return { marked: unread.length };
    }

    // ----- Admin -----
    adminList() {
        return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    }

    async adminCreate(dto: CreateNotificationDto) {
        if (dto.audience === 'USER' && !dto.userId) throw new BadRequestException('Cần userId khi gửi cho 1 người');
        return this.prisma.notification.create({
            data: {
                title: dto.title, body: dto.body, type: dto.type, audience: dto.audience,
                userId: dto.audience === 'USER' ? dto.userId : null, linkUrl: dto.linkUrl,
            },
        });
    }

    async adminRemove(id: string) {
        await this.prisma.notification.delete({ where: { id } });
        return { deleted: true };
    }

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async remindExpiringCoupons() {
        const now = new Date();
        const soon = new Date(now.getTime() + 2 * 86400000);
        const rows = await this.prisma.userCoupon.findMany({
            where: {
                usedAt: null,
                expiryRemindedAt: null,
                coupon: { isActive: true, endAt: { gte: now, lte: soon } },
            },
            include: { coupon: true },
        });
        for (const r of rows) {
            await this.prisma.notification.create({
                data: {
                    title: 'Mã sắp hết hạn',
                    body: `Mã ${r.coupon.code} của bạn sắp hết hạn. Dùng ngay kẻo lỡ!`,
                    type: 'COUPON', audience: 'USER', userId: r.userId, linkUrl: '/vouchers',
                },
            });
            await this.prisma.userCoupon.update({ where: { id: r.id }, data: { expiryRemindedAt: new Date() } });
        }
    }

    // ----- Cron: báo chuông khi flash sale mở (chạy mỗi phút) -----
    @Cron(CronExpression.EVERY_MINUTE)
    async announceLiveFlashSales() {
        const now = new Date();
        const live = await this.prisma.coupon.findMany({
            where: {
                isFlashSale: true,
                isActive: true,
                announcedAt: null,
                OR: [{ claimStartAt: null }, { claimStartAt: { lte: now } }],
                AND: [{ OR: [{ claimEndAt: null }, { claimEndAt: { gte: now } }] }],
            },
        });
        for (const c of live) {
            await this.prisma.notification.create({
                data: {
                    title: '⚡ Săn mã đang mở!',
                    body: 'Đang có đợt phát mã giảm giá số lượng có hạn. Nhanh tay vào săn ngay!',
                    type: 'COUPON', audience: 'ALL', linkUrl: '/flash-sale',
                },
            });
            await this.prisma.coupon.update({ where: { id: c.id }, data: { announcedAt: now } });
        }
    }
}