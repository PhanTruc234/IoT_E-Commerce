import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { OverviewService } from './overview.service';
import { OverviewQueryDto } from './dto/overview-query.dto';

@ApiTags('Admin Overview')
@ApiBearerAuth()
@Controller('admin/overview')
export class OverviewController {
    constructor(private readonly service: OverviewService) { }

    @Roles(Role.ADMIN)
    @Get()
    @ApiOperation({ summary: '[Admin] Tổng quan theo kỳ (giờ VN) kèm số liệu kỳ trước để so sánh' })
    get(@Query() query: OverviewQueryDto) {
        return this.service.getOverview(query);
    }
}
