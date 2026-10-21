import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { PricingService } from './pricing.service';

@Module({
    controllers: [PromotionsController],
    providers: [PromotionsService, PricingService],
    exports: [PromotionsService, PricingService],
})
export class PromotionsModule { }