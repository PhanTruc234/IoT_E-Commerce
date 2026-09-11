import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { ComboItemsService } from './combo-items.service';
import { SetComboItemsDto } from './dto/set-combo-items.dto';

@ApiTags('Combo Items')
@Controller('products/:comboId/combo-items')
export class ComboItemsController {
    constructor(private readonly service: ComboItemsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Thành phần combo + giá gốc/tiết kiệm/tồn khả dụng' })
    findAll(@Param('comboId') comboId: string) {
        return this.service.findAll(comboId);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Put()
    @ApiOperation({ summary: '[Admin] Thay thế thành phần combo (tự đặt type COMBO/SIMPLE)' })
    replace(@Param('comboId') comboId: string, @Body() dto: SetComboItemsDto) {
        return this.service.replace(comboId, dto.items);
    }
}