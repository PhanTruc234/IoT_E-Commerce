import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { OverviewService } from './overview.service';

@ApiTags('Admin Overview')
@ApiBearerAuth()
@Controller('admin/overview')
export class OverviewController {
    constructor(private readonly service: OverviewService) { }

    @Roles(Role.ADMIN)
    @Get()
    @ApiOperation({ summary: '[Admin] Số liệu tổng quan' })
    get() {
        return this.service.getOverview();
    }
}
