import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GhnError, GhnService, insuranceFor } from '../shipping/ghn.service';

export interface CarrierEvent {
    orderCode: string;
    clientOrderCode?: string;
    type: string;
    status: string;
    reason?: string;
    warehouse?: string;
    time: Date;
}

export const GHN_STATUS_LABEL: Record<string, string> = {
    ready_to_pick: 'Chờ lấy hàng',
    picking: 'Shipper đang đến lấy hàng',
    money_collect_picking: 'Đang thu tiền người gửi',
    picked: 'Đã lấy hàng',
    storing: 'Hàng đang ở kho GHN',
    sorting: 'Đang phân loại hàng',
    transporting: 'Đang luân chuyển hàng',
    delivering: 'Đang giao hàng',
    money_collect_delivering: 'Đang thu tiền người nhận',
    delivered: 'Giao hàng thành công',
    delivery_fail: 'Giao hàng thất bại',
    waiting_to_return: 'Chờ trả hàng về shop',
    return: 'Đã yêu cầu trả hàng',
    return_transporting: 'Đang luân chuyển hàng trả',
    return_sorting: 'Đang phân loại hàng trả',
    returning: 'Đang trả hàng về shop',
    return_fail: 'Trả hàng thất bại',
    returned: 'Đã trả hàng về shop',
    cancel: 'Đã huỷ vận đơn',
    exception: 'Đơn gặp sự cố',
    lost: 'Hàng bị thất lạc',
    damage: 'Hàng bị hư hỏng',
    scrap: 'Hàng đã bị tiêu huỷ',
};


const IN_TRANSIT = new Set([
    'picked', 'storing', 'sorting', 'transporting', 'delivering', 'money_collect_delivering', 'delivery_fail',
    'waiting_to_return', 'return', 'return_transporting', 'return_sorting', 'returning', 'return_fail',
]);

const STATUS_RANK: Record<string, number> = {
    ready_to_pick: 0, picking: 1, money_collect_picking: 1, picked: 2, storing: 3, sorting: 3, transporting: 4,
    delivering: 5, money_collect_delivering: 5, delivery_fail: 5, waiting_to_return: 6, return: 6,
    return_transporting: 7, return_sorting: 7, returning: 8, return_fail: 8, delivered: 9, returned: 9,
};
export function isBackward(current: string | null, next: string) {
    if (!current || STATUS_RANK[next] === undefined) return false;
    const now = STATUS_RANK[current];
    return now === undefined || STATUS_RANK[next] < now;
}
export function carrierTarget(ghnStatus: string, current: OrderStatus): OrderStatus | null {
    if (current === 'COMPLETED' || current === 'CANCELLED' || current === 'PENDING') return null;
    if (ghnStatus === 'delivered') return 'COMPLETED';
    if (ghnStatus === 'returned') return 'CANCELLED';
    if (IN_TRANSIT.has(ghnStatus) && current === 'CONFIRMED') return 'SHIPPING';
    return null;
}

export const CARRIER_NOTIFY: Record<string, { title: (code: string) => string; body: (e: CarrierEvent) => string }> = {
    picked: {
        title: (code) => `Đơn ${code} đã được giao cho GHN`,
        body: (e) => `Mã vận đơn ${e.orderCode}. Bạn có thể theo dõi hành trình trong chi tiết đơn hàng.`,
    },
    delivering: {
        title: (code) => `Đơn ${code} đang được giao đến bạn`,
        body: () => 'Shipper GHN đang trên đường giao hàng, bạn để ý điện thoại nhé.',
    },
    delivery_fail: {
        title: (code) => `Đơn ${code} giao chưa thành công`,
        body: (e) => (e.reason ? `Lý do: ${e.reason}. ` : '') + 'GHN sẽ liên hệ để giao lại.',
    },
    delivered: {
        title: (code) => `Đơn ${code} đã giao thành công`,
        body: () => 'Cảm ơn bạn đã mua sắm tại IoTech! Hãy dành chút thời gian đánh giá sản phẩm nhé.',
    },
    returned: {
        title: (code) => `Đơn ${code} đã được hoàn về shop`,
        body: () => 'Đơn hàng không giao được và đã hoàn về IoTech. Liên hệ hỗ trợ nếu bạn cần đặt lại.',
    },
};

export const SIMULATABLE = ['picking', 'picked', 'transporting', 'delivering', 'delivery_fail', 'delivered', 'returned'] as const;

type ShippableOrder = {
    id: string;
    code: string;
    recipientName: string;
    phone: string;
    street: string | null;
    address: string;
    province: string | null;
    wardName: string | null;
    note: string | null;
    subtotal: number;
    total: number;
    paymentMethod: 'COD' | 'VNPAY';
    paymentStatus: string;
    items: { productId: string; name: string; unitPrice: number; quantity: number }[];
};

@Injectable()
export class ShipmentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly ghn: GhnService,
    ) { }

    get sandbox() {
        return this.ghn.isSandbox;
    }
    canShip(order: { wardName: string | null; province: string | null }) {
        return this.ghn.enabled && !!order.wardName && !!order.province;
    }

    private fail(e: unknown): never {
        throw new BadRequestException(e instanceof GhnError ? e.message : 'Không gửi được yêu cầu tới GHN');
    }

    async create(order: ShippableOrder) {
        const products = await this.prisma.product.findMany({
            where: { id: { in: [...new Set(order.items.map((i) => i.productId))] } },
            select: { id: true, sku: true, weightGram: true },
        });
        const map = new Map(products.map((p) => [p.id, p]));
        try {
            const res = await this.ghn.createOrder({
                clientOrderCode: order.code,
                toName: order.recipientName,
                toPhone: order.phone,
                toAddress: order.street ? `${order.street}, ${order.wardName}, ${order.province}` : order.address,
                toWardName: order.wardName!,
                toProvinceName: order.province!,
                lines: order.items.map((i) => ({
                    name: i.name,
                    code: map.get(i.productId)?.sku,
                    quantity: i.quantity,
                    price: i.unitPrice,
                    weightGram: map.get(i.productId)?.weightGram ?? 300,
                })),
                codAmount: order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID' ? order.total : 0,
                insuranceValue: insuranceFor(order.subtotal),
                note: order.note,
            });
            return {
                trackingCode: res.orderCode,
                carrierFee: res.totalFee,
                expectedDeliveryAt: res.expectedDeliveryAt ? new Date(res.expectedDeliveryAt) : null,
                shippingStatus: 'ready_to_pick',
            };
        } catch (e) {
            this.fail(e);
        }
    }

    async cancel(trackingCode: string) {
        let ok: boolean;
        try {
            ok = await this.ghn.cancelOrder(trackingCode);
        } catch (e) {
            this.fail(e);
        }
        if (!ok) throw new BadRequestException('GHN không cho huỷ vì đơn đã được lấy hoặc đang giao');
    }

    async liveStatus(trackingCode: string) {
        try {
            return await this.ghn.orderDetail(trackingCode);
        } catch (e) {
            this.fail(e);
        }
    }

    async printUrl(trackingCode: string) {
        try {
            return await this.ghn.printUrl(trackingCode);
        } catch (e) {
            this.fail(e);
        }
    }

    trackingUrl(trackingCode: string) {
        return this.ghn.trackingUrl(trackingCode);
    }

    isOurShop(shopId: unknown) {
        return Number(shopId) === this.ghn.shopIdNumber;
    }

    async findByCarrierCode(e: Pick<CarrierEvent, 'orderCode' | 'clientOrderCode'>) {
        const byTracking = await this.prisma.order.findUnique({ where: { trackingCode: e.orderCode }, include: { items: true } });
        if (byTracking || !e.clientOrderCode) return byTracking;
        const byCode = await this.prisma.order.findUnique({ where: { code: e.clientOrderCode }, include: { items: true } });
        return byCode && (!byCode.trackingCode || byCode.trackingCode === e.orderCode) ? byCode : null;
    }
    async record(orderId: string, e: CarrierEvent, updateStatus = true): Promise<boolean> {
        try {
            await this.prisma.$transaction([
                this.prisma.shipmentEvent.create({
                    data: {
                        orderId,
                        type: e.type,
                        status: e.status,
                        reason: e.reason || null,
                        warehouse: e.warehouse || null,
                        occurredAt: e.time,
                    },
                }),
                this.prisma.order.update({ where: { id: orderId }, data: updateStatus ? { shippingStatus: e.status } : {} }),
            ]);
            return true;
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return false;
            throw err;
        }
    }
}