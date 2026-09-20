import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';

@ApiTags('Admin Orders')
@ApiBearerAuth()
@Controller('admin/orders')
export class AdminOrdersController {
    constructor(private readonly service: OrdersService) { }

    @Roles(Role.ADMIN)
    @Get()
    @ApiOperation({ summary: '[Admin] Danh sách đơn (lọc/tìm/phân trang)' })
    list(@Query() query: OrderListQueryDto) {
        return this.service.findAllAdmin(query);
    }

    @Roles(Role.ADMIN)
    @Get(':id')
    @ApiOperation({ summary: '[Admin] Chi tiết đơn' })
    get(@Param('id') id: string) {
        return this.service.findOneAdmin(id);
    }

    @Roles(Role.ADMIN)
    @Patch(':id/status')
    @ApiOperation({ summary: '[Admin] Đổi trạng thái (huỷ sẽ hoàn kho)' })
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @CurrentUser('email') actor: string,) {
        return this.service.updateStatus(id, dto.status, actor);
    }
}