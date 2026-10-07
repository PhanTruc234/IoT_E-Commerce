import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { WishlistService } from './wishlist.service';
import { AddWishlistDto } from './dto/add-wishlist.dto';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlist: WishlistService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách sản phẩm yêu thích của tôi' })
    list(@CurrentUser('id') userId: string) {
        return this.wishlist.list(userId);
    }

    @Get('ids')
    @ApiOperation({ summary: 'Danh sách id sản phẩm đã yêu thích (để đánh dấu nút tim)' })
    ids(@CurrentUser('id') userId: string) {
        return this.wishlist.ids(userId);
    }

    @Post()
    @ApiOperation({ summary: 'Thêm sản phẩm vào yêu thích' })
    add(@CurrentUser('id') userId: string, @Body() dto: AddWishlistDto) {
        return this.wishlist.add(userId, dto.productId);
    }

    @Delete(':productId')
    @ApiOperation({ summary: 'Bỏ sản phẩm khỏi yêu thích' })
    remove(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
        return this.wishlist.remove(userId, productId);
    }
}
