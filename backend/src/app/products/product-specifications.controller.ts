import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { ProductSpecificationsService } from './product-specifications.service';
import { SetProductSpecificationsDto } from './dto/set-product-specifications.dto';

@ApiTags('Product Specifications')
@Controller('products/:productId/specifications')
export class ProductSpecificationsController {
    constructor(private readonly service: ProductSpecificationsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Thông số kỹ thuật của sản phẩm' })
    findAll(@Param('productId') productId: string) {
        return this.service.findAll(productId);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Put()
    @ApiOperation({ summary: '[Admin] Gán/thay thế toàn bộ thông số của sản phẩm' })
    replace(@Param('productId') productId: string, @Body() dto: SetProductSpecificationsDto) {
        return this.service.replace(productId, dto.items);
    }
}