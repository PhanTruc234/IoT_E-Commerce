import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { ProductVariantsService } from './product-variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@ApiTags('Product Variants')
@Controller('products/:productId/variants')
export class ProductVariantsController {
    constructor(private readonly service: ProductVariantsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Biến thể của sản phẩm' })
    findAll(@Param('productId') productId: string) {
        return this.service.findAll(productId);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Post('generate')
    @ApiOperation({ summary: '[Admin] Sinh tất cả biến thể từ tổ hợp option' })
    generate(@Param('productId') productId: string) {
        return this.service.generate(productId);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: '[Admin] Thêm 1 biến thể theo tổ hợp option đã chọn' })
    create(@Param('productId') productId: string, @Body() dto: CreateVariantDto) {
        return this.service.create(productId, dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch(':variantId')
    @ApiOperation({ summary: '[Admin] Cập nhật biến thể (giá/kho/ảnh/ẩn-hiện)' })
    update(
        @Param('productId') productId: string,
        @Param('variantId') variantId: string,
        @Body() dto: UpdateVariantDto,
    ) {
        return this.service.update(productId, variantId, dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Delete(':variantId')
    @ApiOperation({ summary: '[Admin] Xóa biến thể' })
    remove(@Param('productId') productId: string, @Param('variantId') variantId: string) {
        return this.service.remove(productId, variantId);
    }
}