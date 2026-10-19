import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SimulateShipmentDto } from './dto/simulate-shipment.dto';
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
    @ApiOperation({ summary: '[Admin] Đổi trạng thái (xác nhận sẽ tạo vận đơn GHN, huỷ sẽ hoàn kho)' })
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @CurrentUser('email') actor: string,) {
        return this.service.updateStatus(id, dto.status, actor);
    }

    @Roles(Role.ADMIN)
    @Post(':id/shipment')
    @ApiOperation({ summary: '[Admin] Tạo vận đơn GHN cho đơn đã xác nhận (VD: đơn VNPAY)' })
    createShipment(@Param('id') id: string, @CurrentUser('email') actor: string) {
        return this.service.createShipment(id, actor);
    }

    @Roles(Role.ADMIN)
    @Post(':id/shipment/sync')
    @ApiOperation({ summary: '[Admin] Đồng bộ trạng thái vận đơn từ GHN' })
    syncShipment(@Param('id') id: string) {
        return this.service.syncShipment(id);
    }

    @Roles(Role.ADMIN)
    @Get(':id/shipment/live')
    @ApiOperation({ summary: '[Admin] Trạng thái vận đơn đang lưu trên GHN' })
    live(@Param('id') id: string) {
        return this.service.shipmentLive(id);
    }

    @Roles(Role.ADMIN)
    @Get(':id/shipment/label')
    @ApiOperation({ summary: '[Admin] Lấy link in vận đơn A5 (hết hạn sau ~30 phút)' })
    label(@Param('id') id: string) {
        return this.service.shipmentLabel(id);
    }

    @Roles(Role.ADMIN)
    @Post(':id/shipment/simulate')
    @ApiOperation({ summary: '[Admin] Giả lập trạng thái GHN (chỉ khi dùng GHN sandbox)' })
    simulate(@Param('id') id: string, @Body() dto: SimulateShipmentDto) {
        return this.service.simulateShipment(id, dto.status);
    }
}