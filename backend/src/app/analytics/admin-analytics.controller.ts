import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Admin Analytics')
@ApiBearerAuth()
@Controller('admin/analytics')
export class AdminAnalyticsController {
    constructor(private readonly service: AnalyticsService) { }

    @Roles(Role.ADMIN)
    @Get()
    @ApiOperation({ summary: '[Admin] Thống kê hành vi người dùng' })
    get(@Query('days') days?: string) {
        const n = days ? Math.min(90, Math.max(1, Number(days))) : 14;
        return this.service.getAnalytics(n);
    }
}