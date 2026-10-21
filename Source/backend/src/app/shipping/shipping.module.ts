import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { GhnService } from './ghn.service';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
    imports: [PromotionsModule],
    controllers: [ShippingController],
    providers: [ShippingService, GhnService],
    exports: [ShippingService, GhnService],
})
export class ShippingModule { }