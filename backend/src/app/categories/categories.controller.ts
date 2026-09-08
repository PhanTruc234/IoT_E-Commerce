import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryListQueryDto } from './dto/category-list-query.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }


    @Public()
    @Get('tree')
    @ApiOperation({ summary: 'Cây danh mục đang hoạt động' })
    getTree() {
        return this.categoriesService.getTree(false);
    }

    @Public()
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Chi tiết danh mục theo slug' })
    findBySlug(@Param('slug') slug: string) {
        return this.categoriesService.findBySlug(slug);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Get()
    @ApiOperation({ summary: '[Admin] Danh sách phẳng có phân trang' })
    findAll(@Query() query: CategoryListQueryDto) {
        return this.categoriesService.findAllFlat(query);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Get('admin/tree')
    @ApiOperation({ summary: '[Admin] Cây danh mục (gồm cả ẩn)' })
    getAdminTree() {
        return this.categoriesService.getTree(true);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Get(':id')
    @ApiOperation({ summary: '[Admin] Chi tiết danh mục' })
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: '[Admin] Tạo danh mục' })
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch(':id')
    @ApiOperation({ summary: '[Admin] Cập nhật danh mục' })
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.update(id, dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Delete(':id')
    @ApiOperation({ summary: '[Admin] Xóa danh mục (chặn nếu còn con)' })
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}