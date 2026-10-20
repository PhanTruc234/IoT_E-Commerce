import { Body, Controller, Get, Headers, Ip, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateDirectOrderDto } from './dto/create-direct-order.dto';
import { Throttle } from '@nestjs/throttler';
import { IdempotencyService } from '../../core/idempotency/idempotency.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly service: OrdersService,
        private readonly idempotency: IdempotencyService,
    ) { }

    @Post()
    @Throttle({ default: { limit: 10, ttl: 60_000, blockDuration: 120_000 } })
    @ApiOperation({ summary: 'Đặt hàng từ giỏ' })
    @ApiHeader({ name: 'Idempotency-Key', required: false, description: 'UUID cho mỗi lần đặt hàng; gửi lại cùng key sẽ nhận lại đơn đã tạo' })
    create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto, @Ip() ip: string, @Headers('idempotency-key') key?: string) {
        return this.service.createFromCart(userId, dto, ip, this.idempotency.context(userId, 'order.create', key, dto));
    }

    @Post('direct')
    @Throttle({ default: { limit: 10, ttl: 60_000, blockDuration: 120_000 } })
    @ApiOperation({ summary: 'Mua ngay 1 sản phẩm (không qua giỏ hàng)' })
    @ApiHeader({ name: 'Idempotency-Key', required: false, description: 'UUID cho mỗi lần đặt hàng; gửi lại cùng key sẽ nhận lại đơn đã tạo' })
    createDirect(@CurrentUser('id') userId: string, @Body() dto: CreateDirectOrderDto, @Ip() ip: string, @Headers('idempotency-key') key?: string) {
        return this.service.createDirect(userId, dto, ip, this.idempotency.context(userId, 'order.direct', key, dto));
    }

    @Get()
    @ApiOperation({ summary: 'Đơn hàng của tôi' })
    findMy(@CurrentUser('id') userId: string) {
        return this.service.findMy(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết đơn hàng' })
    findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.findOne(userId, id);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Huỷ đơn của tôi (khi đang chờ xác nhận)' })
    cancel(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.cancelMine(userId, id);
    }

    @Post(':id/repay')
    @Throttle({ default: { limit: 10, ttl: 60_000, blockDuration: 120_000 } })
    @ApiOperation({ summary: 'Thanh toán lại đơn VNPAY (đơn chờ, chưa thanh toán)' })
    repay(@CurrentUser('id') userId: string, @Param('id') id: string, @Ip() ip: string) {
        return this.service.repay(userId, id, ip);
    }
}