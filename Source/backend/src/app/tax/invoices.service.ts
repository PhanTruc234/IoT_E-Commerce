import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { CreateInvoiceRequestDto, InvoiceListQueryDto, ProcessInvoiceRequestDto } from './dto/invoice-request.dto';

@Injectable()
export class InvoicesService {
    constructor(private readonly prisma: PrismaService) { }

    /** Khách yêu cầu xuất hoá đơn VAT cho đơn của mình (mỗi đơn 1 yêu cầu). */
    async request(userId: string, dto: CreateInvoiceRequestDto) {
        const order = await this.prisma.order.findFirst({ where: { id: dto.orderId, userId }, select: { id: true, status: true } });
        if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
        if (order.status === 'CANCELLED') throw new BadRequestException('Đơn đã huỷ, không thể xuất hoá đơn');
        // Trùng đơn → lỗi unique (P2002) → filter trả 409 "Đơn này đã có yêu cầu xuất hoá đơn"
        return this.prisma.invoiceRequest.create({
            data: {
                orderId: dto.orderId,
                userId,
                buyerType: dto.buyerType,
                buyerName: dto.buyerName.trim(),
                taxCode: dto.buyerType === 'COMPANY' ? dto.taxCode : dto.taxCode || null,
                address: dto.address.trim(),
                email: dto.email.trim(),
                note: dto.note?.trim() || null,
            },
        });
    }

    async listAdmin(query: InvoiceListQueryDto) {
        const { page, limit, status } = query;
        const where: Prisma.InvoiceRequestWhereInput = status ? { status } : {};
        const [data, total, pending] = await Promise.all([
            this.prisma.invoiceRequest.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    order: { select: { id: true, code: true, total: true, taxRate: true, taxAmount: true, pricesIncludeTax: true, status: true, createdAt: true } },
                    user: { select: { fullName: true, email: true } },
                },
            }),
            this.prisma.invoiceRequest.count({ where }),
            this.prisma.invoiceRequest.count({ where: { status: 'PENDING' } }),
        ]);
        return { data, meta: buildMeta(total, page, limit), pending };
    }

    /** Chỉ xử lý yêu cầu đang chờ (cập nhật có điều kiện → 2 admin bấm cùng lúc không xử lý 2 lần). */
    async process(id: string, dto: ProcessInvoiceRequestDto, actor?: string) {
        const req = await this.prisma.invoiceRequest.findUnique({ where: { id }, include: { order: { select: { id: true, code: true } } } });
        if (!req) throw new NotFoundException('Không tìm thấy yêu cầu');
        return this.prisma.$transaction(async (tx) => {
            const r = await tx.invoiceRequest.updateMany({
                where: { id, status: 'PENDING' },
                data: {
                    status: dto.status,
                    invoiceNumber: dto.status === 'ISSUED' ? dto.invoiceNumber!.trim() : null,
                    adminNote: dto.adminNote?.trim() || null,
                    processedAt: new Date(),
                },
            });
            if (!r.count) throw new ConflictException('Yêu cầu này đã được xử lý');
            await tx.notification.create({
                data: {
                    title: dto.status === 'ISSUED' ? `Đã xuất hoá đơn VAT cho đơn ${req.order.code}` : `Yêu cầu hoá đơn đơn ${req.order.code} bị từ chối`,
                    body: dto.status === 'ISSUED'
                        ? `Số hoá đơn ${dto.invoiceNumber}. Hoá đơn điện tử được gửi tới ${req.email}.`
                        : `Lý do: ${dto.adminNote}`,
                    type: 'ORDER',
                    audience: 'USER',
                    userId: req.userId,
                    linkUrl: `/orders/${req.order.id}`,
                },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: req.order.id,
                    status: (await tx.order.findUniqueOrThrow({ where: { id: req.order.id }, select: { status: true } })).status,
                    changedBy: actor ?? 'Quản trị viên',
                    note: dto.status === 'ISSUED' ? `Đã xuất hoá đơn VAT số ${dto.invoiceNumber}` : `Từ chối xuất hoá đơn: ${dto.adminNote}`,
                },
            });
            return tx.invoiceRequest.findUniqueOrThrow({ where: { id } });
        });
    }
}
