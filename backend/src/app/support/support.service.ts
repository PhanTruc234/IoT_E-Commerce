import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from 'src/core/utils/pagination.util';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketListQueryDto } from './dto/ticket-list-query.dto';

@Injectable()
export class SupportService {
    constructor(private readonly prisma: PrismaService) { }

    private genCode(): string {
        return `YC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    }

    async create(userId: string, dto: CreateTicketDto) {
        if (dto.orderId) {
            const order = await this.prisma.order.findFirst({
                where: {
                    id: dto.orderId,
                    userId
                },
                select: { id: true }
            });
            if (!order) {
                throw new NotFoundException('Không tìm thấy đơn hàng của bạn');
            }
        }
        const ticket = await this.prisma.supportTicket.create({
            data: {
                code: this.genCode(),
                userId,
                orderId: dto.orderId ?? null,
                type: dto.type,
                subject: dto.subject,
                status: 'OPEN',
                messages: {
                    create: {
                        senderId: userId,
                        isStaff: false,
                        body: dto.message,
                        attachments: dto.attachments ?? []
                    }
                },
            },
        });
        return this.findMine(userId, ticket.id);
    }

    async listMine(userId: string) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true, code: true, type: true, status: true, subject: true, createdAt: true, updatedAt: true,
                order: { select: { code: true } },
                _count: { select: { messages: true } },
            },
        });
    }

    async findMine(userId: string, id: string) {
        const ticket = await this.prisma.supportTicket.findFirst({
            where: { id, userId },
            include: {
                order: { select: { id: true, code: true } },
                messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { fullName: true } } } },
            },
        });
        if (!ticket) {
            throw new NotFoundException('Không tìm thấy yêu cầu hỗ trợ');
        }
        return ticket;
    }

    async addMessageMine(userId: string, id: string, message: string, attachments: string[]) {
        const ticket = await this.prisma.supportTicket.findFirst({ where: { id, userId }, select: { id: true, status: true } });
        if (!ticket) {
            throw new NotFoundException('Không tìm thấy yêu cầu hỗ trợ');
        }
        if (ticket.status === 'CLOSED') {
            throw new BadRequestException('Yêu cầu đã đóng, không thể gửi thêm');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.supportMessage.create({
                data: {
                    ticketId: id,
                    senderId: userId,
                    isStaff: false,
                    body: message,
                    attachments
                }
            });
            await tx.supportTicket.update({
                where: { id },
                data: {
                    status: ticket.status === 'RESOLVED' ? 'IN_PROGRESS' : undefined
                },
            });
        });
        return this.findMine(userId, id);
    }

    async closeMine(userId: string, id: string) {
        const ticket = await this.prisma.supportTicket.findFirst({ where: { id, userId }, select: { id: true, status: true } });
        if (!ticket) {
            throw new NotFoundException('Không tìm thấy yêu cầu hỗ trợ');
        }
        if (ticket.status !== 'CLOSED') {
            await this.prisma.$transaction(async (tx) => {
                await tx.supportTicket.update({
                    where: { id },
                    data: { status: 'CLOSED' }
                });
                await tx.supportMessage.create({
                    data: {
                        ticketId: id,
                        senderId: userId,
                        isStaff: false,
                        body: 'Khách hàng đã đóng yêu cầu.'
                    }
                });
            });
        }
        return this.findMine(userId, id);
    }

    async listAdmin(query: TicketListQueryDto) {
        const { page, limit, search, status, type } = query;
        const where: Prisma.SupportTicketWhereInput = {
            ...(status ? { status } : {}),
            ...(type ? { type } : {}),
            ...(search
                ? {
                    OR: [
                        { code: { contains: search, mode: 'insensitive' } },
                        { subject: { contains: search, mode: 'insensitive' } },
                        { user: { fullName: { contains: search, mode: 'insensitive' } } },
                        { user: { email: { contains: search, mode: 'insensitive' } } },
                    ],
                }
                : {}),
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.supportTicket.findMany({
                where, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * limit, take: limit,
                select: {
                    id: true,
                    code: true,
                    type: true,
                    status: true,
                    subject: true,
                    createdAt: true,
                    updatedAt: true,
                    order: {
                        select: {
                            code: true
                        }
                    },
                    user: {
                        select: {
                            fullName: true,
                            email: true
                        }
                    },
                    _count: {
                        select: {
                            messages: true
                        }
                    },
                },
            }),
            this.prisma.supportTicket.count({ where }),
        ]);
        return { data, meta: buildMeta(total, page, limit) };
    }

    async findAdmin(id: string) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id },
            include: {
                order: {
                    select: {
                        id: true,
                        code: true
                    }
                },
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true
                    }
                },
                messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { fullName: true } } } },
            },
        });
        if (!ticket) throw new NotFoundException('Không tìm thấy yêu cầu hỗ trợ');
        return ticket;
    }

    async addMessageAdmin(staffId: string, id: string, message: string, attachments: string[]) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id }, select: { id: true, status: true } });
        if (!ticket) {
            throw new NotFoundException('Không tìm thấy yêu cầu hỗ trợ');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.supportMessage.create({
                data: {
                    ticketId: id,
                    senderId: staffId,
                    isStaff: true,
                    body: message,
                    attachments
                }
            });
            await tx.supportTicket.update({
                where: { id },
                data: { status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : undefined },
            });
        });
        return this.findAdmin(id);
    }

    async updateStatusAdmin(id: string, status: TicketStatus) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id }, select: { id: true } });
        if (!ticket) {
            throw new NotFoundException('Không tìm thấy yêu cầu hỗ trợ');
        }
        await this.prisma.supportTicket.update({
            where: {
                id
            }, data: {
                status
            }
        });
        return this.findAdmin(id);
    }
}