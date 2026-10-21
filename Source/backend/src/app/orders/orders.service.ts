import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateDirectOrderDto } from './dto/create-direct-order.dto';
import { PaymentsService, UNPAID_CANCEL_MIN } from './payments.service';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { OrderStatus, Prisma } from '@prisma/client';
import { IdempotencyService, type IdempotencyContext } from '../../core/idempotency/idempotency.service';
import { buildMeta } from 'src/core/utils/pagination.util';
import { ShippingService } from '../shipping/shipping.service';
import { CouponsService } from '../coupons/coupons.service';
import { applyPromotions, PromotionsService } from '../promotions/promotions.service';
import { GhnError, GhnService, type ParcelLine } from '../shipping/ghn.service';
import { CARRIER_NOTIFY, carrierTarget, GHN_STATUS_LABEL, isBackward, ShipmentsService, type CarrierEvent } from './shipments.service';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã huỷ',
};

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly payments: PaymentsService,
        private readonly shipping: ShippingService,
        private readonly coupons: CouponsService,
        private readonly promotions: PromotionsService,
        private readonly ghn: GhnService,
        private readonly shipments: ShipmentsService,
        private readonly idempotency: IdempotencyService,
    ) { }

    private genCode(): string {
        return `DH${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    }

    /** Trừ kho có điều kiện: 2 đơn tranh nhau món cuối thì đơn sau rollback thay vì làm kho âm. */
    private async takeStock(tx: Prisma.TransactionClient, kind: 'product' | 'variant', id: string, qty: number, name: string) {
        const where = { id, stockQuantity: { gte: qty } };
        const data = { stockQuantity: { decrement: qty } };
        const r = kind === 'variant'
            ? await tx.productVariant.updateMany({ where, data })
            : await tx.product.updateMany({ where, data });
        if (r.count !== 1) {
            throw new ConflictException(`"${name}" vừa hết hàng hoặc không còn đủ số lượng, vui lòng kiểm tra lại`);
        }
    }

    private async resolveAddress(dto: CreateOrderDto) {
        if (!dto.provinceId || !dto.wardId) {
            return { province: dto.province ?? null, address: dto.address };
        }
        let loc: Awaited<ReturnType<GhnService['resolve']>>;
        try {
            loc = await this.ghn.resolve(dto.provinceId, dto.wardId);
        } catch (e) {
            if (e instanceof GhnError && e.code !== 'NETWORK' && e.code !== 'NOT_CONFIGURED') loc = null;
            else throw new ServiceUnavailableException('Chưa kiểm tra được địa chỉ, vui lòng thử lại sau ít phút');
        }
        if (!loc) throw new BadRequestException('Phường/xã không hợp lệ, vui lòng chọn lại địa chỉ');
        return {
            province: loc.province.name,
            provinceId: loc.province.id,
            wardId: loc.ward.id,
            wardName: loc.ward.name,
            street: dto.address,
            address: `${dto.address}, ${loc.ward.name}, ${loc.province.name}`,
        };
    }

    /**
     * Có Idempotency-Key: request trước cùng key đã tạo đơn → trả lại đơn đó (kèm link VNPAY còn hạn), không tạo đơn mới.
     * Request song song cùng key: một request tạo đơn, request còn lại chờ rồi nhận lại đúng đơn đó.
     */
    private async idempotentCreate(
        userId: string,
        idem: IdempotencyContext | null,
        place: (idem: IdempotencyContext | null) => Promise<{ order: { id: string }; paymentUrl?: string }>,
    ) {
        const hit = idem ? await this.idempotency.find(idem) : null;
        if (hit?.resourceId) return this.replayCreate(userId, hit.resourceId);
        try {
            return await place(idem);
        } catch (e) {
            const rec = await this.idempotency.recover(idem, e);
            return this.replayCreate(userId, rec.resourceId!);
        }
    }

    private async replayCreate(userId: string, orderId: string) {
        const order = await this.prisma.order.findFirst({ where: { id: orderId, userId }, include: { items: true } });
        if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
        const awaitingPayment = order.paymentMethod === 'VNPAY' && order.status === 'PENDING' && order.paymentStatus !== 'PAID';
        const paymentUrl = awaitingPayment ? await this.payments.liveUrl(order.id) : undefined;
        return { order, paymentUrl, replayed: true };
    }

    async createFromCart(userId: string, dto: CreateOrderDto, ip: string, idem: IdempotencyContext | null = null) {
        return this.idempotentCreate(userId, idem, (ctx) => this.placeFromCart(userId, dto, ip, ctx));
    }

    private async placeFromCart(userId: string, dto: CreateOrderDto, ip: string, idem: IdempotencyContext | null) {
        const cart = await this.prisma.cart.findUnique({ where: { userId }, select: { id: true } });
        const items = cart ? await this.prisma.cartItem.findMany({
            where: { cartId: cart.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        salePrice: true,
                        stockQuantity: true,
                        status: true,
                        type: true,
                        categoryId: true,
                        sku: true,
                        weightGram: true,
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
        const promoRules = await this.promotions.getActiveRules();
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
        const stockName = new Map<string, string>();
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
            const baseUnit = v ? (v.salePrice ?? v.price) : (it.product.salePrice ?? it.product.price);
            const promoUnit = applyPromotions(promoRules, it.productId, it.product.categoryId, v ? v.price : it.product.price);
            const unitPrice = Math.min(baseUnit, promoUnit);

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
                stockName.set(v.id, it.product.name);
            }
            else if (it.product.type === 'COMBO') {
                for (const c of comboComps.get(it.productId) ?? []) {
                    const dec = c.quantity * it.quantity;
                    if (c.variantId) {
                        variantDec.set(c.variantId, (variantDec.get(c.variantId) ?? 0) + dec);
                        stockName.set(c.variantId, it.product.name);
                    }
                    else {
                        productDec.set(c.componentId, (productDec.get(c.componentId) ?? 0) + dec);
                        stockName.set(c.componentId, it.product.name);
                    }
                }
            } else {
                productDec.set(it.productId, (productDec.get(it.productId) ?? 0) + it.quantity);
                stockName.set(it.productId, it.product.name);
            }
        }

        const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
        const addr = await this.resolveAddress(dto);
        const lines: ParcelLine[] = items.map((it, idx) => ({
            name: it.product.name,
            code: it.product.sku,
            quantity: it.quantity,
            price: orderItems[idx].unitPrice,
            weightGram: it.product.weightGram,
        }));
        const { fee: shippingFee } = await this.shipping.quote({ subtotal, lines, provinceName: addr.province, wardName: addr.wardName });
        const cp = await this.coupons.resolve(userId, subtotal, shippingFee, dto.productCouponCode, dto.shippingCouponCode);
        if (cp.errors.product) throw new BadRequestException(`Mã giảm giá: ${cp.errors.product}`);
        if (cp.errors.shipping) throw new BadRequestException(`Mã vận chuyển: ${cp.errors.shipping}`);
        const discountAmount = cp.discountAmount;
        const shippingDiscount = cp.shippingDiscount;
        const total = Math.max(0, subtotal - discountAmount + (shippingFee - shippingDiscount));

        return this.prisma.$transaction(async (tx) => {
            const idemId = idem ? await this.idempotency.claim(tx, idem) : null;
            const created = await tx.order.create({
                data: {
                    code: this.genCode(),
                    userId,
                    recipientName: dto.recipientName,
                    phone: dto.phone,
                    ...addr,
                    note: dto.note,
                    subtotal,
                    shippingFee,
                    total,
                    discountAmount,
                    shippingDiscount,
                    productCouponCode: cp.productCoupon?.code ?? null,
                    shippingCouponCode: cp.shippingCoupon?.code ?? null,
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
                await this.takeStock(tx, 'variant', id, dec, stockName.get(id) ?? 'Sản phẩm');
            }
            for (const [id, dec] of productDec) {
                await this.takeStock(tx, 'product', id, dec, stockName.get(id) ?? 'Sản phẩm');
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
            if (cp.productCoupon) {
                await this.coupons.markUsed(tx, cp.productCoupon.id, userId, created.id);
            }
            if (cp.shippingCoupon) {
                await this.coupons.markUsed(tx, cp.shippingCoupon.id, userId, created.id);
            }
            const paymentUrl = created.paymentMethod === 'VNPAY' ? await this.payments.createAttempt(tx, created, ip, 1) : undefined;
            if (idemId) await this.idempotency.attach(tx, idemId, created.id);
            return { order: created, paymentUrl };
        });
    }
    async createDirect(userId: string, dto: CreateDirectOrderDto, ip: string, idem: IdempotencyContext | null = null) {
        return this.idempotentCreate(userId, idem, (ctx) => this.placeDirect(userId, dto, ip, ctx));
    }

    private async placeDirect(userId: string, dto: CreateDirectOrderDto, ip: string, idem: IdempotencyContext | null) {
        const qty = dto.quantity;
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
            select: {
                id: true, name: true, price: true, salePrice: true, stockQuantity: true, status: true, type: true, categoryId: true, sku: true, weightGram: true,
                images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
            },
        });
        if (!product || product.status !== 'ACTIVE') {
            throw new BadRequestException('Sản phẩm không còn được bán');
        }

        let variant: { id: string; price: number; salePrice: number | null; stockQuantity: number; imageUrl: string | null; isActive: boolean; options: { option: { value: string; attribute: { name: string } } }[] } | null = null;
        if (dto.variantId) {
            variant = await this.prisma.productVariant.findFirst({
                where: { id: dto.variantId, productId: dto.productId },
                select: {
                    id: true, price: true, salePrice: true, stockQuantity: true, imageUrl: true, isActive: true,
                    options: { select: { option: { select: { value: true, attribute: { select: { name: true } } } } } },
                },
            });
            if (!variant || !variant.isActive) throw new BadRequestException('Phân loại không hợp lệ');
        }

        // Xác định tồn kho
        let comboComps: { quantity: number; variantId: string | null; componentId: string }[] = [];
        let stock: number;
        if (variant) {
            stock = variant.stockQuantity;
        } else if (product.type === 'COMBO') {
            const comps = await this.prisma.comboItem.findMany({
                where: { comboId: product.id },
                select: { quantity: true, variantId: true, productId: true, component: { select: { stockQuantity: true } }, variant: { select: { stockQuantity: true } } },
            });
            comboComps = comps.map((c) => ({ quantity: c.quantity, variantId: c.variantId, componentId: c.productId }));
            stock = comps.length ? Math.min(...comps.map((c) => Math.floor((c.variant?.stockQuantity ?? c.component.stockQuantity) / c.quantity))) : 0;
        } else {
            stock = product.stockQuantity;
        }
        if (stock < qty) throw new BadRequestException(`"${product.name}" chỉ còn ${stock} sản phẩm`);

        // Giá (áp khuyến mãi như luồng giỏ hàng)
        const rules = await this.promotions.getActiveRules();
        const baseUnit = variant ? (variant.salePrice ?? variant.price) : (product.salePrice ?? product.price);
        const promoUnit = applyPromotions(rules, product.id, product.categoryId, variant ? variant.price : product.price);
        const unitPrice = Math.min(baseUnit, promoUnit);
        const variantLabel = variant ? variant.options.map((o) => `${o.option.attribute.name}: ${o.option.value}`).join(', ') : null;
        const image = variant?.imageUrl ?? product.images[0]?.imageUrl ?? null;

        const subtotal = unitPrice * qty;
        const addr = await this.resolveAddress(dto);
        const { fee: shippingFee } = await this.shipping.quote({
            subtotal,
            lines: [{ name: product.name, code: product.sku, quantity: qty, price: unitPrice, weightGram: product.weightGram }],
            provinceName: addr.province,
            wardName: addr.wardName,
        });
        const cp = await this.coupons.resolve(userId, subtotal, shippingFee, dto.productCouponCode, dto.shippingCouponCode);
        if (cp.errors.product) throw new BadRequestException(`Mã giảm giá: ${cp.errors.product}`);
        if (cp.errors.shipping) throw new BadRequestException(`Mã vận chuyển: ${cp.errors.shipping}`);
        const discountAmount = cp.discountAmount;
        const shippingDiscount = cp.shippingDiscount;
        const total = Math.max(0, subtotal - discountAmount + (shippingFee - shippingDiscount));

        return this.prisma.$transaction(async (tx) => {
            const idemId = idem ? await this.idempotency.claim(tx, idem) : null;
            const created = await tx.order.create({
                data: {
                    code: this.genCode(),
                    userId,
                    recipientName: dto.recipientName,
                    phone: dto.phone,
                    ...addr,
                    note: dto.note,
                    subtotal, shippingFee, total,
                    discountAmount, shippingDiscount,
                    productCouponCode: cp.productCoupon?.code ?? null,
                    shippingCouponCode: cp.shippingCoupon?.code ?? null,
                    status: 'PENDING',
                    paymentMethod: dto.paymentMethod,
                    paymentStatus: dto.paymentMethod === 'VNPAY' ? 'PENDING' : 'UNPAID',
                    items: { create: [{ productId: product.id, variantId: dto.variantId ?? null, name: product.name, variantLabel, image, unitPrice, quantity: qty, lineTotal: subtotal }] },
                },
                include: { items: true },
            });

            // Trừ kho
            if (variant) {
                await this.takeStock(tx, 'variant', variant.id, qty, product.name);
            } else if (product.type === 'COMBO') {
                for (const c of comboComps) {
                    const dec = c.quantity * qty;
                    if (c.variantId) await this.takeStock(tx, 'variant', c.variantId, dec, product.name);
                    else await this.takeStock(tx, 'product', c.componentId, dec, product.name);
                }
            } else {
                await this.takeStock(tx, 'product', product.id, qty, product.name);
            }
            await tx.product.update({ where: { id: product.id }, data: { soldCount: { increment: qty } } });

            if (cp.productCoupon) await this.coupons.markUsed(tx, cp.productCoupon.id, userId, created.id);
            if (cp.shippingCoupon) await this.coupons.markUsed(tx, cp.shippingCoupon.id, userId, created.id);
            const paymentUrl = created.paymentMethod === 'VNPAY' ? await this.payments.createAttempt(tx, created, ip, 1) : undefined;
            if (idemId) await this.idempotency.attach(tx, idemId, created.id);
            return { order: created, paymentUrl };
        });
    }

    async findMy(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { items: true },
        });
    }

    async repay(userId: string, id: string, ip: string) {
        return this.payments.repay(userId, id, ip);
    }

    async findOne(userId: string, id: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId }, include: {
                items: true,
                orderStatusHistories: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                shipmentEvents: { orderBy: { occurredAt: 'asc' } },
                payments: { orderBy: { createdAt: 'asc' }, select: { status: true, amount: true, expiresAt: true, needsRefund: true, createdAt: true } },
            }
        });
        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        return { ...order, trackingUrl: order.trackingCode ? this.shipments.trackingUrl(order.trackingCode) : null };
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
                },
                shipmentEvents: { orderBy: { occurredAt: 'asc' } },
                payments: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true, txnRef: true, amount: true, status: true, expiresAt: true, providerTxnNo: true,
                        bankCode: true, responseCode: true, paidAt: true, needsRefund: true, checkedAt: true, createdAt: true,
                    },
                },
            },
        });
        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        return {
            ...order,
            trackingUrl: order.trackingCode ? this.shipments.trackingUrl(order.trackingCode) : null,
            canShip: this.shipments.canShip(order),
            carrierSandbox: this.shipments.sandbox,
        };
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
    /**
     * Đổi trạng thái có điều kiện: chỉ thành công khi đơn VẪN đang ở `from` (kiểm tra ngay trong câu UPDATE).
     * true  → request này thắng, được làm tiếp phần việc đi kèm (hoàn kho, gán serial, ghi lịch sử…).
     * false → request khác vừa chuyển đơn sang đúng `to` rồi → coi như xong, không làm lại.
     * Đơn đã sang trạng thái khác → 409.
     */
    private async transition(
        tx: Prisma.TransactionClient,
        id: string,
        from: OrderStatus,
        to: OrderStatus,
        data: Prisma.OrderUpdateManyMutationInput = {},
        where: Prisma.OrderWhereInput = {},
    ): Promise<boolean> {
        const r = await tx.order.updateMany({ where: { ...where, id, status: from }, data: { ...data, status: to } });
        if (r.count) return true;
        const cur = await tx.order.findUnique({ where: { id }, select: { status: true } });
        if (cur?.status === to) return false;
        const label = cur ? ORDER_STATUS_LABEL[cur.status] : 'không xác định';
        throw new ConflictException(`Đơn vừa được chuyển sang "${label}" bởi thao tác khác, vui lòng tải lại trang`);
    }

    async updateStatus(id: string, status: OrderStatus, actor?: string, opts: { note?: string; carrier?: boolean } = {}) {
        const FORWARD: Record<OrderStatus, OrderStatus[]> = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['SHIPPING', 'CANCELLED'],
            SHIPPING: ['COMPLETED'],
            COMPLETED: [],
            CANCELLED: [],
        };
        const CARRIER_EXTRA: Partial<Record<OrderStatus, OrderStatus[]>> = { SHIPPING: ['CANCELLED'] };

        const load = () => this.prisma.order.findUnique({ where: { id }, include: { items: true } });
        let order = await load();
        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        if (status === 'CANCELLED' && !opts.carrier && order.status === 'PENDING' && order.paymentMethod === 'VNPAY' && order.paymentStatus !== 'PAID') {
            await this.payments.settleBeforeCancel(id);
            order = (await load())!;
            if (order.paymentStatus === 'PAID') {
                throw new BadRequestException('Khách vừa thanh toán VNPAY thành công, đơn đã được xác nhận — kiểm tra lại trước khi huỷ');
            }
        }
        if (order.status === status) {
            return this.findOneAdmin(id);
        }
        const allowed = [...FORWARD[order.status], ...(opts.carrier ? CARRIER_EXTRA[order.status] ?? [] : [])];
        if (!allowed.includes(status)) {
            throw new BadRequestException(`Không thể chuyển đơn từ "${order.status}" sang "${status}"`);
        }

        let shipment: Prisma.OrderUpdateInput = {};
        let note = opts.note;
        if (status === 'CONFIRMED' && !opts.carrier) {
            if (order.paymentMethod === 'VNPAY' && order.paymentStatus !== 'PAID') {
                throw new BadRequestException('Đơn VNPAY chưa thanh toán, chưa thể xác nhận');
            }
            if (!order.trackingCode && this.shipments.canShip(order)) {
                shipment = await this.shipments.create(order);
                note ??= `Đã tạo vận đơn GHN ${shipment.trackingCode as string}`;
            }
        }
        if (status === 'CANCELLED' && !opts.carrier && order.trackingCode && order.shippingStatus !== 'cancel') {
            await this.shipments.cancel(order.trackingCode);
            shipment = { shippingStatus: 'cancel' };
        } else if (status === 'CANCELLED' && !opts.carrier && !order.trackingCode && order.status === 'CONFIRMED' && this.shipments.canShip(order)) {
            // Đơn đã xác nhận mà chưa có mã vận đơn: có thể GHN đã tạo nhưng server chưa kịp lưu → tìm và huỷ để shipper không tới lấy
            const orphan = await this.shipments.findActive(order.code);
            if (orphan) {
                await this.shipments.cancel(orphan.trackingCode);
                shipment = { trackingCode: orphan.trackingCode, shippingStatus: 'cancel' };
                note ??= `Huỷ đơn & hoàn kho · đã huỷ vận đơn GHN ${orphan.trackingCode} chưa được lưu`;
            }
        }

        if (status === 'CANCELLED') {
            const cur = order;
            const paidOnline = cur.paymentMethod === 'VNPAY' && cur.paymentStatus === 'PAID';
            await this.prisma.$transaction(async (tx) => {
                // Chỉ request đổi được trạng thái mới hoàn kho → huỷ trùng (admin + khách + cron + GHN) không cộng kho 2 lần
                const won = await this.transition(tx, id, cur.status, 'CANCELLED', {
                    ...(shipment as Prisma.OrderUpdateManyMutationInput),
                    ...(cur.paymentStatus === 'PENDING' ? { paymentStatus: 'FAILED' } : {}),
                });
                if (!won) return;
                await this.restock(tx, cur.items);
                if (paidOnline) {
                    const paid = await tx.paymentTransaction.findFirst({ where: { orderId: id, status: 'SUCCESS' }, orderBy: { paidAt: 'desc' } });
                    if (paid) await tx.paymentTransaction.update({ where: { id: paid.id }, data: { needsRefund: true } });
                }
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: id,
                        status: 'CANCELLED',
                        changedBy: actor ?? 'Quản trị viên',
                        note: (note ?? 'Huỷ đơn & hoàn kho') + (paidOnline && !note?.includes('hoàn tiền') ? ' · cần hoàn tiền VNPAY cho khách' : ''),
                    },
                });
            });
            return this.findOneAdmin(id);
        }

        const cur = order;
        try {
            await this.prisma.$transaction(async (tx) => {
                const data: Prisma.OrderUpdateManyMutationInput = { ...(shipment as Prisma.OrderUpdateManyMutationInput) };
                if (status === 'COMPLETED' && cur.paymentMethod === 'COD' && cur.paymentStatus !== 'PAID') {
                    data.paymentStatus = 'PAID';
                    data.paidAt = new Date();
                }
                // Admin bấm + webhook GHN cùng lúc: chỉ 1 request gán serial / ghi lịch sử
                if (!(await this.transition(tx, id, cur.status, status, data))) return;
                if (status === 'COMPLETED') {
                    await this.assignSerials(tx, cur);
                }
                await tx.orderStatusHistory.create({
                    data: { orderId: id, status, changedBy: actor ?? 'Quản trị viên', note },
                });
            });
        } catch (e) {
            // Vừa tạo vận đơn GHN mà đơn đã bị huỷ/đổi bởi thao tác khác → huỷ vận đơn vừa tạo để không bị mồ côi
            if (e instanceof ConflictException && shipment.trackingCode) {
                await this.shipments.cancel(shipment.trackingCode as string).catch(() => undefined);
            }
            throw e;
        }
        return this.findOneAdmin(id);
    }

    async createShipment(id: string, actor?: string) {
        const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
        if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
        if (order.status !== 'CONFIRMED') throw new BadRequestException('Chỉ tạo vận đơn cho đơn đã xác nhận');
        if (order.trackingCode) throw new BadRequestException('Đơn đã có vận đơn GHN');
        if (!this.shipments.canShip(order)) {
            throw new BadRequestException('Đơn chưa có phường/xã theo địa chỉ mới nên không tạo được vận đơn GHN');
        }
        const shipment = await this.shipments.create(order);
        // Bấm "Tạo vận đơn" 2 lần: GHN trả cùng mã → chỉ request đầu lưu & ghi lịch sử
        const saved = await this.prisma.$transaction(async (tx) => {
            const r = await tx.order.updateMany({ where: { id, status: 'CONFIRMED', trackingCode: null }, data: shipment });
            if (!r.count) return false;
            await tx.orderStatusHistory.create({
                data: { orderId: id, status: 'CONFIRMED', changedBy: actor ?? 'Quản trị viên', note: `Đã tạo vận đơn GHN ${shipment.trackingCode}` },
            });
            return true;
        });
        if (!saved) {
            const cur = await this.prisma.order.findUnique({ where: { id }, select: { trackingCode: true } });
            // Đơn vừa bị huỷ (hoặc đã lưu vận đơn khác) → huỷ vận đơn vừa tạo để không bị mồ côi
            if (cur?.trackingCode !== shipment.trackingCode) {
                await this.shipments.cancel(shipment.trackingCode).catch(() => undefined);
                throw new ConflictException('Đơn vừa được thay đổi bởi thao tác khác, vui lòng tải lại trang');
            }
        }
        return this.findOneAdmin(id);
    }
    async applyCarrierEvent(e: CarrierEvent, verify: boolean) {
        const order = await this.shipments.findByCarrierCode(e);
        if (!order) return { handled: false };
        const backward = isBackward(order.shippingStatus, e.status);
        if (backward && e.type === 'switch_status') return { handled: true, ignored: 'backward' };
        const target = e.type === 'switch_status' ? carrierTarget(e.status, order.status) : null;
        if (verify && (target === 'COMPLETED' || target === 'CANCELLED')) {
            const live = await this.shipments.liveStatus(e.orderCode);
            if (live.status !== e.status) return { handled: false };
        }
        if (!(await this.shipments.record(order.id, e, !backward))) return { handled: true, duplicate: true };
        const label = GHN_STATUS_LABEL[e.status] ?? e.status;
        if (target === 'COMPLETED' && order.status === 'CONFIRMED') {
            await this.updateStatus(order.id, 'SHIPPING', 'GHN', { carrier: true, note: 'GHN: Đã lấy hàng' });
        }
        if (target) {
            const refund = target === 'CANCELLED' && order.paymentStatus === 'PAID' ? ' · cần hoàn tiền cho khách' : '';
            const note = target === 'CANCELLED' ? `GHN: ${label} · hoàn kho${refund}` : `GHN: ${label}`;
            await this.updateStatus(order.id, target, 'GHN', { carrier: true, note });
        }

        const tpl = e.type === 'switch_status' ? CARRIER_NOTIFY[e.status] : undefined;
        if (tpl) {
            await this.prisma.notification.create({
                data: {
                    title: tpl.title(order.code),
                    body: tpl.body(e),
                    type: 'ORDER',
                    audience: 'USER',
                    userId: order.userId,
                    linkUrl: `/orders/${order.id}`,
                },
            });
        }
        return { handled: true };
    }

    async syncShipment(id: string) {
        const order = await this.prisma.order.findUnique({ where: { id }, select: { code: true, trackingCode: true, shippingStatus: true } });
        if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
        if (!order.trackingCode) throw new BadRequestException('Đơn chưa có vận đơn GHN');
        const live = await this.shipments.liveStatus(order.trackingCode);
        if (live.status !== order.shippingStatus) {
            await this.applyCarrierEvent(
                { orderCode: order.trackingCode, clientOrderCode: order.code, type: 'switch_status', status: live.status, time: new Date() },
                false,
            );
        }
        if (live.leadtime) {
            await this.prisma.order.update({ where: { id }, data: { expectedDeliveryAt: new Date(live.leadtime) } });
        }
        return this.findOneAdmin(id);
    }

    async simulateShipment(id: string, status: string) {
        if (!this.shipments.sandbox) throw new ForbiddenException('Chỉ giả lập được khi dùng GHN sandbox');
        const order = await this.prisma.order.findUnique({ where: { id }, select: { code: true, trackingCode: true } });
        if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
        if (!order.trackingCode) throw new BadRequestException('Đơn chưa có vận đơn GHN');
        await this.applyCarrierEvent({
            orderCode: order.trackingCode,
            clientOrderCode: order.code,
            type: 'switch_status',
            status,
            reason: status === 'delivery_fail' ? 'Không liên lạc được người nhận (giả lập)' : undefined,
            warehouse: ['picked', 'transporting'].includes(status) ? 'Bưu cục GHN Hà Nội (giả lập)' : undefined,
            time: new Date(),
        }, false);
        return this.findOneAdmin(id);
    }
    async shipmentLive(id: string) {
        const order = await this.prisma.order.findUnique({ where: { id }, select: { trackingCode: true } });
        if (!order?.trackingCode) throw new BadRequestException('Đơn chưa có vận đơn GHN');
        return this.shipments.liveStatus(order.trackingCode);
    }
    async shipmentLabel(id: string) {
        const order = await this.prisma.order.findUnique({ where: { id }, select: { trackingCode: true } });
        if (!order?.trackingCode) throw new BadRequestException('Đơn chưa có vận đơn GHN');
        return { url: await this.shipments.printUrl(order.trackingCode) };
    }

    async cancelMine(userId: string, id: string) {
        const load = () => this.prisma.order.findFirst({ where: { id, userId }, include: { items: true } });
        let order = await load();
        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        if (order.status === 'PENDING' && order.paymentMethod === 'VNPAY' && order.paymentStatus !== 'PAID') {
            await this.payments.settleBeforeCancel(id);
            order = (await load())!;
        }
        if (order.status === 'CANCELLED') {
            return this.findOne(userId, id);
        }
        if (order.status !== 'PENDING') {
            throw new BadRequestException(order.paymentStatus === 'PAID'
                ? 'Đơn đã được thanh toán và xác nhận, vui lòng liên hệ hỗ trợ nếu muốn huỷ'
                : 'Chỉ có thể huỷ đơn khi đang chờ xác nhận');
        }
        const items = order.items;
        const paymentStatus = order.paymentStatus;
        await this.prisma.$transaction(async (tx) => {
            const won = await this.transition(tx, id, 'PENDING', 'CANCELLED',
                paymentStatus === 'PENDING' ? { paymentStatus: 'FAILED' } : {},
                { paymentStatus: { not: 'PAID' } });
            if (!won) return;
            await this.restock(tx, items);
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

    /** Cron: huỷ đơn VNPAY quá hạn chưa thanh toán. Trả về true nếu đơn được huỷ ở lần gọi này. */
    async cancelUnpaid(id: string) {
        const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
        if (!order || order.status !== 'PENDING' || order.paymentStatus === 'PAID') return false;
        return this.prisma.$transaction(async (tx) => {
            const won = await tx.order.updateMany({
                where: { id, status: 'PENDING', paymentStatus: { not: 'PAID' } },
                data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
            });
            if (!won.count) return false;
            await this.restock(tx, order.items);
            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status: 'CANCELLED',
                    changedBy: 'Hệ thống',
                    note: `Quá ${UNPAID_CANCEL_MIN} phút sau hạn thanh toán VNPAY · huỷ đơn & hoàn kho`,
                },
            });
            await tx.notification.create({
                data: {
                    title: `Đơn ${order.code} đã tự huỷ`,
                    body: 'Đơn hàng chưa được thanh toán VNPAY trong thời gian quy định nên đã được huỷ. Bạn có thể đặt lại bất cứ lúc nào.',
                    type: 'ORDER',
                    audience: 'USER',
                    userId: order.userId,
                    linkUrl: `/orders/${id}`,
                },
            });
            return true;
        });
    }
}
