import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { ProductAttributesService } from './product-attributes.service';
import { SetAttributesDto } from './dto/set-attributes.dto';

@ApiTags('Product Attributes')
@Controller('products/:productId/attributes')
export class ProductAttributesController {
    constructor(private readonly service: ProductAttributesService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Thuộc tính của sản phẩm' })
    findAll(@Param('productId') productId: string) {
        return this.service.findAll(productId);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Put()
    @ApiOperation({ summary: '[Admin] Thay thế thuộc tính' })
    replace(@Param('productId') productId: string, @Body() dto: SetAttributesDto) {
        return this.service.replace(productId, dto.attributes);
    }
}