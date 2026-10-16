import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { OptionalAuth } from '../../core/decorators/optional-auth.decorator';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QuoteCouponDto } from './dto/quote-coupon.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
    constructor(private readonly coupons: CouponsService) { }

    @Post('save')
    @Throttle({ default: { limit: 20, ttl: 60_000, blockDuration: 120_000 } })
    @ApiOperation({ summary: 'Lưu mã vào ví của tôi' })
    save(@CurrentUser('id') userId: string, @Body('code') code: string) {
        return this.coupons.save(userId, code);
    }

    @Get('my')
    @ApiOperation({ summary: 'Ví mã của tôi (sắp hết hạn lên đầu)' })
    my(@CurrentUser('id') userId: string) {
        return this.coupons.my(userId);
    }

    @Post('quote')
    @ApiOperation({ summary: 'Thử áp mã để xem giảm bao nhiêu (preview)' })
    quote(@CurrentUser('id') userId: string, @Body() dto: QuoteCouponDto) {
        return this.coupons.quote(userId, dto.subtotal, dto.shippingFee, dto.productCode, dto.shippingCode);
    }

    @OptionalAuth()
    @Get('flash')
    @ApiOperation({ summary: 'Danh sách mã săn theo khung giờ (khách chưa đăng nhập vẫn xem được)' })
    flash(@CurrentUser('id') userId?: string) {
        return this.coupons.flashList(userId);
    }

    @Post('claim')
    @Throttle({ default: { limit: 20, ttl: 60_000, blockDuration: 120_000 } })
    @ApiOperation({ summary: 'Săn (lấy) 1 mã flash sale' })
    claim(@CurrentUser('id') userId: string, @Body('couponId') couponId: string) {
        return this.coupons.claim(userId, couponId);
    }

    // ----- Admin -----
    @Roles(Role.ADMIN)
    @Get('admin')
    @ApiOperation({ summary: '[Admin] Danh sách mã' })
    adminList() {
        return this.coupons.adminList();
    }

    @Roles(Role.ADMIN)
    @Post('admin')
    @ApiOperation({ summary: '[Admin] Tạo mã' })
    adminCreate(@Body() dto: CreateCouponDto) {
        return this.coupons.adminCreate(dto);
    }

    @Roles(Role.ADMIN)
    @Patch('admin/:id')
    @ApiOperation({ summary: '[Admin] Sửa mã' })
    adminUpdate(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
        return this.coupons.adminUpdate(id, dto);
    }

    @Roles(Role.ADMIN)
    @Delete('admin/:id')
    @ApiOperation({ summary: '[Admin] Xoá mã' })
    adminRemove(@Param('id') id: string) {
        return this.coupons.adminRemove(id);
    }
}