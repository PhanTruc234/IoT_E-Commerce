import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly noti: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Thông báo của tôi' })
    list(@CurrentUser('id') userId: string) { return this.noti.listMine(userId); }

    @Get('unread-count')
    @ApiOperation({ summary: 'Số thông báo chưa đọc' })
    unread(@CurrentUser('id') userId: string) { return this.noti.unreadCount(userId); }

    @Post(':id/read')
    markRead(@CurrentUser('id') userId: string, @Param('id') id: string) { return this.noti.markRead(userId, id); }

    @Post('read-all')
    markAll(@CurrentUser('id') userId: string) { return this.noti.markAllRead(userId); }

    // Admin
    @Roles(Role.ADMIN) @Get('admin')
    adminList() { return this.noti.adminList(); }

    @Roles(Role.ADMIN) @Post('admin')
    adminCreate(@Body() dto: CreateNotificationDto) { return this.noti.adminCreate(dto); }

    @Roles(Role.ADMIN) @Delete('admin/:id')
    adminRemove(@Param('id') id: string) { return this.noti.adminRemove(id); }
}