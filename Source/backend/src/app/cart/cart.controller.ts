import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
    constructor(private readonly service: CartService) { }

    @Get()
    @ApiOperation({ summary: 'Giỏ hàng của tôi' })
    get(@CurrentUser('id') userId: string) {
        return this.service.getCart(userId);
    }

    @Post('items')
    @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ' })
    add(@CurrentUser('id') userId: string, @Body() dto: AddCartItemDto) {
        return this.service.addItem(userId, dto);
    }

    @Patch('items/:id')
    @ApiOperation({ summary: 'Cập nhật số lượng' })
    update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
        return this.service.updateItem(userId, id, dto.quantity);
    }

    @Delete('items/:id')
    @ApiOperation({ summary: 'Xoá 1 mục' })
    remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.removeItem(userId, id);
    }

    @Delete()
    @ApiOperation({ summary: 'Xoá toàn bộ giỏ' })
    clear(@CurrentUser('id') userId: string) {
        return this.service.clear(userId);
    }
}