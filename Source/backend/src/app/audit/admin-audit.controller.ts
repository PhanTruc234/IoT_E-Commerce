import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { AuditListQueryDto } from './dto/audit-list-query.dto';

@ApiTags('Admin Audit')
@ApiBearerAuth()
@Controller('admin/audit-logs')
export class AdminAuditController {
    constructor(private readonly service: AuditService) { }

    @Roles(Role.ADMIN)
    @Get()
    @ApiOperation({ summary: '[Admin] Nhật ký thao tác (audit log)' })
    list(@Query() query: AuditListQueryDto) {
        return this.service.findAll(query);
    }
}
