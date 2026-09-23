import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { ProductImagesService } from './product-images.service';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { AttachImagesDto } from './dto/attach-images.dto';

@ApiTags('Product Images')
@Controller('products/:productId/images')
export class ProductImagesController {
    constructor(private readonly service: ProductImagesService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Danh sách ảnh của sản phẩm' })
    findAll(@Param('productId') productId: string) {
        return this.service.findAll(productId);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: '[Admin] Gắn ảnh vào SP' })
    attach(@Param('productId') productId: string, @Body() dto: AttachImagesDto) {
        return this.service.attach(productId, dto.imageUrls);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch('reorder')
    @ApiOperation({ summary: '[Admin] Sắp xếp lại thứ tự ảnh' })
    reorder(@Param('productId') productId: string, @Body() dto: ReorderImagesDto) {
        return this.service.reorder(productId, dto.imageIds);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch(':imageId/primary')
    @ApiOperation({ summary: '[Admin] Đặt ảnh chính' })
    setPrimary(@Param('productId') productId: string, @Param('imageId') imageId: string) {
        return this.service.setPrimary(productId, imageId);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Delete(':imageId')
    @ApiOperation({ summary: '[Admin] Xóa ảnh' })
    remove(@Param('productId') productId: string, @Param('imageId') imageId: string) {
        return this.service.remove(productId, imageId);
    }
}
