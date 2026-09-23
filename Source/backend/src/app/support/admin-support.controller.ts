import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { SupportService } from './support.service';
import { TicketListQueryDto } from './dto/ticket-list-query.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@ApiTags('Admin Support')
@ApiBearerAuth()
@Controller('admin/support/tickets')
export class AdminSupportController {
    constructor(private readonly service: SupportService) { }

    @Roles(Role.ADMIN)
    @Get()
    @ApiOperation({ summary: '[Admin] Danh sách yêu cầu' })
    list(@Query() query: TicketListQueryDto) {
        return this.service.listAdmin(query);
    }

    @Roles(Role.ADMIN)
    @Get(':id')
    @ApiOperation({ summary: '[Admin] Chi tiết yêu cầu' })
    get(@Param('id') id: string) {
        return this.service.findAdmin(id);
    }

    @Roles(Role.ADMIN)
    @Post(':id/messages')
    @ApiOperation({ summary: '[Admin] Trả lời yêu cầu' })
    reply(
        @CurrentUser('id') staffId: string,
        @Param('id') id: string,
        @Body() dto: AddMessageDto) {
        return this.service.addMessageAdmin(staffId, id, dto.message ?? '', dto.attachments ?? []);
    }

    @Roles(Role.ADMIN)
    @Patch(':id/status')
    @ApiOperation({ summary: '[Admin] Đổi trạng thái yêu cầu' })
    updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
        return this.service.updateStatusAdmin(id, dto.status);
    }
}