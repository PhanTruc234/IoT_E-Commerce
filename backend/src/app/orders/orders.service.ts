import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VnpayService } from './vnpay.service';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { OrderStatus, Prisma } from '@prisma/client';
import { buildMeta } from 'src/core/utils/pagination.util';

const FREE_SHIP_FROM = 500_000;
const SHIPPING_FEE = 30_000;

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly vnpay: VnpayService,
    ) { }

    private genCode(): string {
        return `DH${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    }

    async createFromCart(userId: string, dto: CreateOrderDto, ip: string) {
        const cart = await this.prisma.cart.findUnique({ where: { userId }, select: { id: true } });
        const items = cart ? await this.prisma.cartItem.findMany({
            where: { cartId: cart.id },
            include: {
                product: {
                    select: {
                        id: true, name: true, price: true, salePrice: true, stockQuantity: true, status: true, type: true,
                        images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
                    },
                },
                variant: {
                    select: {
                        id: true, price: true, salePrice: true, stockQuantity: true, imageUrl: true, isActive: true,
                        options: { select: { option: { select: { value: true, attribute: { select: { name: true } } } } } },
                    },
                },
            },
        }) : [];
        if (!items.length) {
            throw new BadRequestException('Giỏ hàng trống');
        }
        const comboComps = new Map<string, { quantity: number; variantId: string | null; componentId: string; stock: number }[]>();
        for (const it of items) {
            if (!it.variant && it.product.type === 'COMBO') {
                const comps = await this.prisma.comboItem.findMany({
                    where: { comboId: it.productId },
                    select: {
                        quantity: true,
                        variantId: true,
                        productId: true,
                        component: {
                            select: {
                                stockQuantity: true
                            }
                        },
                        variant: {
                            select: {
                                stockQuantity: true
                            }
                        },
                    },
                });
                comboComps.set(it.productId, comps.map((c) => ({
                    quantity: c.quantity,
                    variantId: c.variantId,
                    componentId: c.productId,
                    stock: c.variant?.stockQuantity ?? c.component.stockQuantity
                })),);
            }
        }
        const variantDec = new Map<string, number>();
        const productDec = new Map<string, number>();
        const orderItems: {
            productId: string;
            variantId: string | null;
            name: string;
            variantLabel: string | null;
            image: string | null;
            unitPrice: number;
            quantity: number;
            lineTotal: number;
        }[] = [];

        for (const it of items) {
            if (it.product.status !== 'ACTIVE') {
                throw new BadRequestException(`"${it.product.name}" không còn được bán`);
            }
            const v = it.variant;
            const unitPrice = v ? (v.salePrice ?? v.price) : (it.product.salePrice ?? it.product.price);
            let stock: number;
            if (v) {
                if (!v.isActive) {
                    throw new BadRequestException(`Phân loại của "${it.product.name}" không còn bán`);
                }
                stock = v.stockQuantity;
            } else if (it.product.type === 'COMBO') {
                const comps = comboComps.get(it.productId) ?? [];
                stock = comps.length ? Math.min(...comps.map((c) => Math.floor(c.stock / c.quantity))) : 0;
            } else {
                stock = it.product.stockQuantity;
            }

            if (stock < it.quantity) {
                throw new BadRequestException(`"${it.product.name}" chỉ còn ${stock} sản phẩm`);
            }

            const variantLabel = v ? v.options.map((o) => `${o.option.attribute.name}: ${o.option.value}`).join(', ') : null;
            orderItems.push({
                productId: it.productId,
                variantId: it.variantId,
                name: it.product.name,
                variantLabel,
                image: v?.imageUrl ?? it.product.images[0]?.imageUrl ?? null,
                unitPrice,
                quantity: it.quantity,
                lineTotal: unitPrice * it.quantity,
            });

            if (v) {
                variantDec.set(v.id, (variantDec.get(v.id) ?? 0) + it.quantity);
            }
            else if (it.product.type === 'COMBO') {
                for (const c of comboComps.get(it.productId) ?? []) {
                    const dec = c.quantity * it.quantity;
                    if (c.variantId) {
                        variantDec.set(c.variantId, (variantDec.get(c.variantId) ?? 0) + dec);
                    }
                    else {
                        productDec.set(c.componentId, (productDec.get(c.componentId) ?? 0) + dec);
                    }
                }
            } else {
                productDec.set(it.productId, (productDec.get(it.productId) ?? 0) + it.quantity);
            }
        }

        const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
        const shippingFee = subtotal >= FREE_SHIP_FROM ? 0 : SHIPPING_FEE;
        const total = subtotal + shippingFee;

        const order = await this.prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    code: this.genCode(),
                    userId,
                    recipientName: dto.recipientName,
                    phone: dto.phone,
                    address: dto.address,
                    note: dto.note,
                    subtotal, shippingFee, total,
                    status: 'PENDING',
                    paymentMethod: dto.paymentMethod,
                    paymentStatus: dto.paymentMethod === 'VNPAY' ? 'PENDING' : 'UNPAID',
                    items: { create: orderItems },
                },
                include: { items: true },
            });
            await tx.orderStatusHistory.create({
                data: { orderId: created.id, status: 'PENDING', changedBy: 'Khách hàng', note: 'Đơn hàng được tạo' },
            });
            for (const [id, dec] of variantDec) {
                await tx.productVariant.update({
                    where: {
                        id
                    },
                    data: {
                        stockQuantity: {
                            decrement: dec
                        }
                    }
                });
            }
            for (const [id, dec] of productDec) {
                await tx.product.update({
                    where: {
                        id
                    },
                    data: {
                        stockQuantity: {
                            decrement: dec
                        }
                    }
                });
            }
            for (const it of items) {
                await tx.product.update({
                    where: {
                        id: it.productId
                    },
                    data: {
                        soldCount: {
                            increment: it.quantity
                        }
                    }
                });
            }
            await tx.cartItem.deleteMany({ where: { cartId: cart!.id } });
            return created;
        });

        let paymentUrl: string | undefined;
        if (order.paymentMethod === 'VNPAY') {
            paymentUrl = this.vnpay.buildPaymentUrl({ code: order.code, amount: order.total, ip, orderInfo: `Thanh toán đơn ${order.code}` });
        }
        return { order, paymentUrl };
    }

    async findMy(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { items: true },
        });
    }

    async repay(userId: string, id: string, ip: string) {
        const order = await this.prisma.order.findFirst({ where: { id, userId } });
        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        if (order.paymentMethod !== 'VNPAY') {
            throw new BadRequestException('Đơn này không dùng VNPAY');
        }
        if (order.paymentStatus === 'PAID') {
            throw new BadRequestException('Đơn đã được thanh toán');
        }
        if (order.status !== 'PENDING') {
            throw new BadRequestException('Đơn không thể thanh toán lại');
        }
        await this.prisma.order.update({ where: { id }, data: { paymentStatus: 'PENDING' } });
        const paymentUrl = this.vnpay.buildPaymentUrl({
            code: order.code,
            amount: order.total,
            ip,
            orderInfo: `Thanh toan don ${order.code}`,
        });
        return { paymentUrl };
    }

    async findOne(userId: string, id: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId }, include: {
                items: true,
                orderStatusHistories: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });
        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        return order;
    }

    async findByCode(code: string) {
        return this.prisma.order.findUnique({ where: { code }, select: { id: true } });
    }

    async markPaid(code: string, success: boolean) {
        const order = await this.prisma.order.findUnique({
            where: {
                code
            },
            select: {
                paymentStatus: true
            }
        });
        if (!order || order.paymentStatus === 'PAID') return;
        await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { code },
                data: success
                    ? {
                        paymentStatus: 'PAID',
                        paidAt: new Date(),
                        status: 'CONFIRMED'
                    }
                    : { paymentStatus: 'FAILED' },
            });
            if (success && order.status !== 'CONFIRMED') {
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: order.id,
                        status: 'CONFIRMED',
                        changedBy: 'Hệ thống',
                        note: 'Thanh toán VNPAY thành công'
                    },
                });
            }
        })

    }
    async findAllAdmin(query: OrderListQueryDto) {
        const { page, limit, search, status, paymentStatus } = query;
        const where: Prisma.OrderWhereInput = {
            ...(status ? { status } : {}),
            ...(paymentStatus ? { paymentStatus } : {}),
            ...(search
                ? {
                    OR: [
                        { code: { contains: search, mode: 'insensitive' } },
                        { recipientName: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } },
                    ],
                }
                : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: { select: { fullName: true, email: true } },
                    _count: { select: { items: true } },
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return { data, meta: buildMeta(total, page, limit) };
    }

    async findOneAdmin(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true
                    }
                },
                orderStatusHistories: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            },
        });
        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        return order;
    }

    private async restock(tx: Prisma.TransactionClient, items: { productId: string; variantId: string | null; quantity: number }[]) {
        const productIds = [...new Set(items.map((i) => i.productId))];
        const products = await tx.product.findMany({ where: { id: { in: productIds } }, select: { id: true, type: true } });
        const typeMap = new Map(products.map((p) => [p.id, p.type]));

        for (const it of items) {
            if (it.variantId) {
                await tx.productVariant.update({ where: { id: it.variantId }, data: { stockQuantity: { increment: it.quantity } } });
            } else if (typeMap.get(it.productId) === 'COMBO') {
                const comps = await tx.comboItem.findMany({ where: { comboId: it.productId }, select: { quantity: true, variantId: true, productId: true } });
                for (const c of comps) {
                    const inc = c.quantity * it.quantity;
                    if (c.variantId) await tx.productVariant.update({ where: { id: c.variantId }, data: { stockQuantity: { increment: inc } } });
                    else await tx.product.update({ where: { id: c.productId }, data: { stockQuantity: { increment: inc } } });
                }
            } else {
                await tx.product.update({ where: { id: it.productId }, data: { stockQuantity: { increment: it.quantity } } });
            }
            await tx.product.update({ where: { id: it.productId }, data: { soldCount: { decrement: it.quantity } } });
        }
    }
    private async assignSerials(
        tx: Prisma.TransactionClient,
        order: { id: string; userId: string; recipientName: string; phone: string; items: { productId: string; variantId: string | null; quantity: number }[] },
    ) {
        const productIds = [...new Set(order.items.map((i) => i.productId))];
        const products = await tx.product.findMany({ where: { id: { in: productIds } }, select: { id: true, type: true } });
        const typeMap = new Map(products.map((p) => [p.id, p.type]));
        const completedAt = new Date();

        for (const item of order.items) {
            if (typeMap.get(item.productId) === 'COMBO') continue;
            const serials = await tx.serial.findMany({
                where: { productId: item.productId, variantId: item.variantId ?? null, status: 'IN_STOCK', orderId: null },
                take: item.quantity,
                orderBy: { createdAt: 'asc' },
                select: { id: true, warrantyMonths: true },
            });
            for (const s of serials) {
                const end = new Date(completedAt);
                end.setMonth(end.getMonth() + s.warrantyMonths);
                await tx.serial.update({
                    where: { id: s.id },
                    data: {
                        status: 'ACTIVATED',
                        activatedAt: completedAt,
                        warrantyEndAt: end,
                        ownerUserId: order.userId,
                        ownerName: order.recipientName,
                        ownerPhone: order.phone,
                        orderId: order.id,
                    },
                });
            }
        }
    }
    async updateStatus(id: string, status: OrderStatus, actor?: string) {
        const FORWARD: Record<OrderStatus, OrderStatus[]> = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['SHIPPING', 'CANCELLED'],
            SHIPPING: ['COMPLETED'],
            COMPLETED: [],
            CANCELLED: [],
        };

        const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        if (order.status === status) {
            return this.findOneAdmin(id);
        }
        if (!FORWARD[order.status].includes(status)) {
            throw new BadRequestException(`Không thể chuyển đơn từ "${order.status}" sang "${status}"`);
        }

        if (status === 'CANCELLED') {
            await this.prisma.$transaction(async (tx) => {
                await this.restock(tx, order.items);
                await tx.order.update({
                    where: { id },
                    data: { status: 'CANCELLED', ...(order.paymentStatus === 'PENDING' ? { paymentStatus: 'FAILED' } : {}) },
                });
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: id,
                        status: 'CANCELLED',
                        changedBy: actor ?? 'Quản trị viên',
                        note: 'Huỷ đơn & hoàn kho'
                    },
                });
            });
            return this.findOneAdmin(id);
        }

        await this.prisma.$transaction(async (tx) => {
            const data: Prisma.OrderUpdateInput = { status };
            if (status === 'COMPLETED' && order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID') {
                data.paymentStatus = 'PAID';
                data.paidAt = new Date();
            }
            await tx.order.update({ where: { id }, data });
            if (status === 'COMPLETED') {
                await this.assignSerials(tx, order);
            }
            await tx.orderStatusHistory.create({
                data: { orderId: id, status, changedBy: actor ?? 'Quản trị viên' },
            });
        });
        return this.findOneAdmin(id);
    }
    async cancelMine(userId: string, id: string) {
        const order = await this.prisma.order.findFirst({ where: { id, userId }, include: { items: true } });
        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        if (order.status !== 'PENDING') {
            throw new BadRequestException('Chỉ có thể huỷ đơn khi đang chờ xác nhận');
        }
        await this.prisma.$transaction(async (tx) => {
            await this.restock(tx, order.items);
            await tx.order.update({
                where: { id },
                data: { status: 'CANCELLED', ...(order.paymentStatus === 'PENDING' ? { paymentStatus: 'FAILED' } : {}) },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status: 'CANCELLED',
                    changedBy: 'Khách hàng',
                    note: 'Khách hàng huỷ đơn'
                },
            });
        });
        return this.findOne(userId, id);
    }
}