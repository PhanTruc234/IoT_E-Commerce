import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { PaymentsController } from './payments.controller';
import { OrdersService } from './orders.service';
import { VnpayService } from './vnpay.service';
import { AdminOrdersController } from './admin-orders.controller';

@Module({
    controllers: [OrdersController, PaymentsController, AdminOrdersController],
    providers: [OrdersService, VnpayService],
})
export class OrdersModule { }