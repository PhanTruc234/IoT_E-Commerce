import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
    constructor(private readonly users: UsersService) { }

    @Roles(Role.ADMIN)
    @Get()
    @ApiOperation({ summary: '[Admin] Danh sách người dùng' })
    list(@Query() query: UserListQueryDto) {
        return this.users.findAllAdmin(query);
    }

    @Roles(Role.ADMIN)
    @Get('customers')
    @ApiOperation({ summary: '[Admin] Tìm khách hàng (để gán bảo hành…)' })
    customers(@Query('search') search?: string) {
        return this.users.searchCustomers(search);
    }

    @Roles(Role.ADMIN)
    @Patch(':id/role')
    @ApiOperation({ summary: '[Admin] Đổi vai trò' })
    setRole(@CurrentUser('id') actorId: string, @Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
        return this.users.setRole(actorId, id, dto.role);
    }

    @Roles(Role.ADMIN)
    @Patch(':id/status')
    @ApiOperation({ summary: '[Admin] Khoá / mở tài khoản' })
    setStatus(@CurrentUser('id') actorId: string, @Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
        return this.users.setActive(actorId, id, dto.isActive);
    }
}
