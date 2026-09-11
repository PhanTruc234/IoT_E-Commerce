import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Danh sách SP (ACTIVE) — tìm/lọc/sắp xếp/phân trang' })
    findPublic(@Query() query: ProductListQueryDto) {
        return this.productsService.findPublic(query);
    }

    @Public()
    @Get('compare')
    @ApiOperation({ summary: 'So sánh 2–4 sản phẩm theo thông số' })
    compare(@Query('ids') ids?: string) {
        return this.productsService.compare(ids);
    }

    @Public()
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Chi tiết SP theo slug (ảnh, thông số, biến thể, combo)' })
    findBySlug(@Param('slug') slug: string) {
        return this.productsService.findBySlug(slug);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Get('admin')
    @ApiOperation({ summary: '[Admin] Danh sách SP (mọi trạng thái)' })
    findAllAdmin(@Query() query: ProductListQueryDto) {
        return this.productsService.findAllAdmin(query);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Get(':id')
    @ApiOperation({ summary: '[Admin] Chi tiết SP theo id' })
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: '[Admin] Tạo sản phẩm (slug tự sinh)' })
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch(':id')
    @ApiOperation({ summary: '[Admin] Cập nhật sản phẩm' })
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Delete(':id')
    @ApiOperation({ summary: '[Admin] Ẩn sản phẩm (soft delete → INACTIVE)' })
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}