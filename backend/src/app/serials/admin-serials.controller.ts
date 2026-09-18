import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { SerialsService } from './serials.service';
import { CreateSerialsDto } from './dto/create-serials.dto';
import { ActivateSerialDto } from './dto/activate-serial.dto';
import { SerialListQueryDto } from './dto/serial-list-query.dto';
import { GenerateSerialsDto } from './dto/generate-serials.dto';

@ApiTags('Admin Serials')
@ApiBearerAuth()
@Controller('admin/serials')
export class AdminSerialsController {
    constructor(private readonly service: SerialsService) { }

    @Roles(Role.ADMIN) @Get()
    @ApiOperation({ summary: '[Admin] Danh sách serial' })
    list(@Query() query: SerialListQueryDto) { return this.service.findAllAdmin(query); }

    @Roles(Role.ADMIN) @Post()
    @ApiOperation({ summary: '[Admin] Thêm serial hàng loạt' })
    create(@Body() dto: CreateSerialsDto) { return this.service.createBulk(dto); }

    @Roles(Role.ADMIN) @Get('summary')
    @ApiOperation({ summary: '[Admin] Tồn kho & số serial hiện có (gợi ý số cần sinh)' })
    summary(@Query('productId') productId: string, @Query('variantId') variantId?: string) {
        return this.service.summary(productId, variantId);
    }

    @Roles(Role.ADMIN) @Post('generate')
    @ApiOperation({ summary: '[Admin] Sinh serial tự động theo SKU' })
    generate(@Body() dto: GenerateSerialsDto) {
        return this.service.generate(dto);
    }

    @Roles(Role.ADMIN) @Patch(':id/activate')
    @ApiOperation({ summary: '[Admin] Kích hoạt bảo hành' })
    activate(@Param('id') id: string, @Body() dto: ActivateSerialDto) { return this.service.activate(id, dto); }

    @Roles(Role.ADMIN) @Delete(':id')
    @ApiOperation({ summary: '[Admin] Xoá serial' })
    remove(@Param('id') id: string) { return this.service.remove(id); }
}