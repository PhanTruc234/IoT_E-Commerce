import { Module } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { PromotionsModule } from '../promotions/promotions.module';
import { TaxModule } from '../tax/tax.module';

@Module({
    imports: [PromotionsModule, TaxModule],
    controllers: [CouponsController],
    providers: [CouponsService],
    exports: [CouponsService],
})
export class CouponsModule { }