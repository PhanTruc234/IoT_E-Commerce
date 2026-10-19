import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { PaymentsController } from './payments.controller';
import { OrdersService } from './orders.service';
import { VnpayService } from './vnpay.service';
import { AdminOrdersController } from './admin-orders.controller';
import { ShipmentsService } from './shipments.service';
import { GhnWebhookController } from './ghn-webhook.controller';
import { ShippingModule } from '../shipping/shipping.module';
import { CouponsModule } from '../coupons/coupons.module';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
    imports: [ShippingModule, CouponsModule, PromotionsModule],
    controllers: [OrdersController, PaymentsController, AdminOrdersController, GhnWebhookController],
    providers: [OrdersService, VnpayService, ShipmentsService],
})
export class OrdersModule { }