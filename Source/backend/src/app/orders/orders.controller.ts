import { Body, Controller, Get, Ip, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
    constructor(private readonly service: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Đặt hàng từ giỏ' })
    create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto, @Ip() ip: string) {
        return this.service.createFromCart(userId, dto, ip);
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
    @ApiOperation({ summary: 'Thanh toán lại đơn VNPAY (đơn chờ, chưa thanh toán)' })
    repay(@CurrentUser('id') userId: string, @Param('id') id: string, @Ip() ip: string) {
        return this.service.repay(userId, id, ip);
    }
}