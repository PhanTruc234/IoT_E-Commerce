import { Injectable } from '@nestjs/common';
import { TaxSetting } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTaxSettingDto } from './dto/update-tax-setting.dto';

/** VAT của 1 đơn, chụp lại lúc đặt hàng. */
export interface TaxBreakdown {
    /** null = không tính VAT */
    taxRate: number | null;
    taxAmount: number;
    pricesIncludeTax: boolean;
    /** Tổng khách trả sau khi tính VAT (giá đã gồm VAT thì bằng tổng trước thuế) */
    total: number;
}

export function applyTax(setting: Pick<TaxSetting, 'enabled' | 'rate' | 'pricesIncludeTax'>, taxable: number): TaxBreakdown {
    const { enabled, rate, pricesIncludeTax } = setting;
    if (!enabled || rate <= 0 || taxable <= 0) return { taxRate: enabled && rate > 0 ? rate : null, taxAmount: 0, pricesIncludeTax, total: taxable };
    if (pricesIncludeTax) {
        // Giá đã gồm VAT: tách phần thuế nằm sẵn trong tổng
        return { taxRate: rate, taxAmount: Math.round((taxable * rate) / (100 + rate)), pricesIncludeTax, total: taxable };
    }
    const taxAmount = Math.round((taxable * rate) / 100);
    return { taxRate: rate, taxAmount, pricesIncludeTax, total: taxable + taxAmount };
}

@Injectable()
export class TaxService {
    constructor(private readonly prisma: PrismaService) { }

    async getSetting() {
        return (await this.prisma.taxSetting.findFirst()) ?? this.prisma.taxSetting.create({ data: {} });
    }

    async publicSetting() {
        const s = await this.getSetting();
        return { enabled: s.enabled, rate: s.rate, pricesIncludeTax: s.pricesIncludeTax };
    }

    /** VAT cho số tiền chịu thuế (tiền hàng sau giảm + phí ship sau giảm) theo cài đặt hiện tại. */
    async compute(taxable: number) {
        return applyTax(await this.getSetting(), taxable);
    }

    async update(dto: UpdateTaxSettingDto) {
        const s = await this.getSetting();
        return this.prisma.taxSetting.update({ where: { id: s.id }, data: dto });
    }
}
