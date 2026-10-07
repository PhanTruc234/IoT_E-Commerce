import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { UpdateShippingSettingDto } from './dto/update-shipping-setting.dto';

const DEFAULT_FREE_SHIP_FROM = 500_000;
const FALLBACK_FEE = 35_000;

@Injectable()
export class ShippingService {
    constructor(private readonly prisma: PrismaService) { }

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

    async computeFee(subtotal: number, province?: string | null): Promise<number> {
        const setting = await this.getSetting();
        if (subtotal >= setting.freeShipFrom) return 0;

        const zones = await this.prisma.shippingZone.findMany({ where: { isActive: true } });
        const matched = province
            ? zones.find((z) => z.provinces.includes(province))
            : undefined;
        const zone = matched ?? zones.find((z) => z.isDefault);
        return zone ? zone.fee : FALLBACK_FEE;
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
