import { Body, Controller, Get, Header, HttpCode, Param, ParseIntPipe, Patch, Post, ServiceUnavailableException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { ShippingService } from './shipping.service';
import { GhnService } from './ghn.service';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { UpdateShippingSettingDto } from './dto/update-shipping-setting.dto';
import { ShippingQuoteDto } from './dto/shipping-quote.dto';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
    constructor(
        private readonly shipping: ShippingService,
        private readonly ghn: GhnService,
    ) { }

    @Public()
    @Get('config')
    @ApiOperation({ summary: 'Cấu hình phí vận chuyển công khai (zone + ngưỡng freeship) cho trang thanh toán' })
    getConfig() {
        return this.shipping.getConfig();
    }

    @Public()
    @Get('provinces')
    @Header('Cache-Control', 'public, max-age=3600')
    @ApiOperation({ summary: 'Tỉnh/thành theo mô hình 2 cấp (nguồn GHN)' })
    async provinces() {
        try {
            return await this.ghn.provinces();
        } catch {
            throw new ServiceUnavailableException('Không tải được danh sách tỉnh/thành');
        }
    }

    @Public()
    @Get('provinces/:id/wards')
    @Header('Cache-Control', 'public, max-age=3600')
    @ApiOperation({ summary: 'Phường/xã của một tỉnh/thành (nguồn GHN)' })
    async wards(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.ghn.wards(id);
        } catch {
            throw new ServiceUnavailableException('Không tải được danh sách phường/xã');
        }
    }

    @ApiBearerAuth()
    @Post('quote')
    @HttpCode(200)
    @Throttle({ default: { limit: 60, ttl: 60_000 } })
    @ApiOperation({ summary: 'Báo phí vận chuyển cho checkout (GHN, lỗi thì dùng phí khu vực)' })
    quote(@Body() dto: ShippingQuoteDto) {
        return this.shipping.quoteForItems(dto);
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