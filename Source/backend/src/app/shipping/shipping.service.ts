import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { UpdateShippingSettingDto } from './dto/update-shipping-setting.dto';
import { GhnService, insuranceFor, type ParcelLine } from './ghn.service';

const DEFAULT_FREE_SHIP_FROM = 500_000;
const FALLBACK_FEE = 35_000;

export interface ShippingQuote {
    fee: number;
    baseFee: number;
    carrierFee: number | null;
    subsidy: number;
    source: 'GHN' | 'ZONE';
    expectedDeliveryAt: string | null;
    freeShipFrom: number;
}

function normalizeProvince(name: string) {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd')
        .toLowerCase()
        .replace(/^\s*(tp\.?|thanh pho|tinh)\s*/, '')
        .replace(/[^a-z0-9]/g, '');
}

@Injectable()
export class ShippingService {
    private readonly logger = new Logger(ShippingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ghn: GhnService,
    ) { }

    private async getSetting() {
        const setting = await this.prisma.shippingSetting.findFirst();
        return setting ?? { freeShipFrom: DEFAULT_FREE_SHIP_FROM };
    }

    async getConfig() {
        const [zones, setting] = await Promise.all([
            this.prisma.shippingZone.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
                select: { id: true, name: true, fee: true, provinces: true, isDefault: true },
            }),
            this.getSetting(),
        ]);
        return { zones, freeShipFrom: setting.freeShipFrom };
    }

    private async zoneFee(province?: string | null): Promise<number> {
        const zones = await this.prisma.shippingZone.findMany({ where: { isActive: true } });
        const key = province ? normalizeProvince(province) : '';
        const matched = key ? zones.find((z) => z.provinces.some((p) => normalizeProvince(p) === key)) : undefined;
        const zone = matched ?? zones.find((z) => z.isDefault);
        return zone ? zone.fee : FALLBACK_FEE;
    }
    /**
 * Phí ship khách trả. Phí khu vực của shop là mức trần: GHN báo cao hơn thì khách trả phí khu vực
 * (shop bù phần chênh), thấp hơn thì khách trả đúng giá GHN. GHN lỗi thì dùng phí khu vực.
 * Đạt ngưỡng thì miễn phí (shop chịu toàn bộ cước GHN).
 */
    async quote(args: {
        subtotal: number;
        lines: ParcelLine[];
        provinceName?: string | null;
        wardName?: string | null;
    }): Promise<ShippingQuote> {
        const [setting, zoneFee] = await Promise.all([this.getSetting(), this.zoneFee(args.provinceName)]);
        let carrierFee: number | null = null;
        let expectedDeliveryAt: string | null = null;

        if (args.provinceName && args.wardName && this.ghn.enabled) {
            try {
                const res = await this.ghn.previewFee({
                    toAddress: `${args.wardName}, ${args.provinceName}`,
                    toWardName: args.wardName,
                    toProvinceName: args.provinceName,
                    lines: args.lines,
                    codAmount: 0,
                    insuranceValue: insuranceFor(args.subtotal),
                });
                carrierFee = res.totalFee;
                expectedDeliveryAt = res.expectedDeliveryAt;
            } catch (e) {
                this.logger.warn(`Tính phí GHN thất bại, dùng phí khu vực: ${(e as Error).message}`);
            }
        }

        const baseFee = carrierFee == null ? zoneFee : Math.min(carrierFee, zoneFee);
        const fee = args.subtotal >= setting.freeShipFrom ? 0 : baseFee;
        return {
            fee,
            baseFee,
            carrierFee,
            subsidy: carrierFee == null ? 0 : carrierFee - fee,
            source: carrierFee == null ? 'ZONE' : 'GHN',
            expectedDeliveryAt,
            freeShipFrom: setting.freeShipFrom,
        };
    }

    async quoteForItems(args: {
        subtotal: number;
        items: { productId: string; quantity: number }[];
        provinceId?: number;
        wardId?: number;
    }) {
        const ids = [...new Set(args.items.map((i) => i.productId))];
        const products = await this.prisma.product.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, sku: true, weightGram: true, price: true, salePrice: true },
        });
        const map = new Map(products.map((p) => [p.id, p]));
        const lines: ParcelLine[] = args.items.flatMap((i) => {
            const p = map.get(i.productId);
            return p ? [{ name: p.name, code: p.sku, quantity: i.quantity, price: p.salePrice ?? p.price, weightGram: p.weightGram }] : [];
        });

        let place: { provinceName: string; wardName: string } | null = null;
        if (args.provinceId && args.wardId && this.ghn.enabled) {
            const loc = await this.ghn.resolve(args.provinceId, args.wardId).catch(() => null);
            if (loc) place = { provinceName: loc.province.name, wardName: loc.ward.name };
        }
        return this.quote({ subtotal: args.subtotal, lines, ...place });
    }

    listZones() {
        return this.prisma.shippingZone.findMany({ orderBy: { sortOrder: 'asc' } });
    }

    async updateZone(id: string, dto: UpdateZoneDto) {
        const zone = await this.prisma.shippingZone.findUnique({ where: { id } });
        if (!zone) throw new NotFoundException('Không tìm thấy khu vực vận chuyển');
        return this.prisma.shippingZone.update({ where: { id }, data: dto });
    }

    async getSettingAdmin() {
        const setting = await this.prisma.shippingSetting.findFirst();
        return setting ?? this.prisma.shippingSetting.create({ data: { freeShipFrom: DEFAULT_FREE_SHIP_FROM } });
    }

    async updateSetting(dto: UpdateShippingSettingDto) {
        const existing = await this.prisma.shippingSetting.findFirst();
        if (!existing) return this.prisma.shippingSetting.create({ data: { freeShipFrom: dto.freeShipFrom } });
        return this.prisma.shippingSetting.update({ where: { id: existing.id }, data: { freeShipFrom: dto.freeShipFrom } });
    }
}