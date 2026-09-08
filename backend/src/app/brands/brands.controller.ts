import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandListQueryDto } from './dto/brand-list-query.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Danh sách thương hiệu (mặc định chỉ active)' })
    findAll(@Query() query: BrandListQueryDto) {
        return this.brandsService.findAll(query);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết thương hiệu' })
    findOne(@Param('id') id: string) {
        return this.brandsService.findOne(id);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: '[Admin] Tạo thương hiệu (logoUrl đã upload qua /uploads/images)' })
    create(@Body() dto: CreateBrandDto) {
        return this.brandsService.create(dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch(':id')
    @ApiOperation({ summary: '[Admin] Cập nhật thương hiệu' })
    update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
        return this.brandsService.update(id, dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Delete(':id')
    @ApiOperation({ summary: '[Admin] Xóa thương hiệu' })
    remove(@Param('id') id: string) {
        return this.brandsService.remove(id);
    }
}
