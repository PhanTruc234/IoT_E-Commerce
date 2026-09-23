import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { SpecificationsService } from './specifications.service';
import { CreateSpecificationDto } from './dto/create-specification.dto';
import { UpdateSpecificationDto } from './dto/update-specification.dto';
import { SpecificationListQueryDto } from './dto/specification-list-query.dto';

@ApiTags('Specifications')
@Controller('specifications')
export class SpecificationsController {
    constructor(private readonly service: SpecificationsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Danh sách thông số (từ điển dùng chung)' })
    findAll(@Query() query: SpecificationListQueryDto) {
        return this.service.findAll(query);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: '[Admin] Tạo thông số' })
    create(@Body() dto: CreateSpecificationDto) {
        return this.service.create(dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch(':id')
    @ApiOperation({ summary: '[Admin] Sửa thông số' })
    update(@Param('id') id: string, @Body() dto: UpdateSpecificationDto) {
        return this.service.update(id, dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Delete(':id')
    @ApiOperation({ summary: '[Admin] Xóa thông số (chặn nếu đang dùng)' })
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}