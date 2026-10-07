import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { ShippingService } from './shipping.service';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { UpdateShippingSettingDto } from './dto/update-shipping-setting.dto';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
    constructor(private readonly shipping: ShippingService) { }

    @Public()
    @Get('config')
    @ApiOperation({ summary: 'Cấu hình phí vận chuyển công khai (zone + ngưỡng freeship) cho trang thanh toán' })
    getConfig() {
        return this.shipping.getConfig();
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Get('admin/zones')
    @ApiOperation({ summary: '[Admin] Danh sách khu vực vận chuyển' })
    listZones() {
        return this.shipping.listZones();
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch('admin/zones/:id')
    @ApiOperation({ summary: '[Admin] Cập nhật phí/tỉnh thành của một khu vực' })
    updateZone(@Param('id') id: string, @Body() dto: UpdateZoneDto) {
        return this.shipping.updateZone(id, dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Get('admin/setting')
    @ApiOperation({ summary: '[Admin] Lấy ngưỡng miễn phí vận chuyển' })
    getSetting() {
        return this.shipping.getSettingAdmin();
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch('admin/setting')
    @ApiOperation({ summary: '[Admin] Cập nhật ngưỡng miễn phí vận chuyển' })
    updateSetting(@Body() dto: UpdateShippingSettingDto) {
        return this.shipping.updateSetting(dto);
    }
}
