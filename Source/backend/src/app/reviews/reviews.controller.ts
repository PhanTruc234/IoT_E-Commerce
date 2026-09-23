import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ReviewsController {
    constructor(private readonly service: ReviewsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Đánh giá đã duyệt + điểm trung bình' })
    findAll(@Param('productId') productId: string) {
        return this.service.findPublic(productId);
    }

    @ApiBearerAuth()
    @Get('eligibility')
    @ApiOperation({ summary: 'Kiểm tra có được đánh giá không' })
    eligibility(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
        return this.service.eligibility(userId, productId);
    }

    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: 'Gửi đánh giá (đã mua & nhận hàng)' })
    create(@CurrentUser('id') userId: string, @Param('productId') productId: string, @Body() dto: CreateReviewDto) {
        return this.service.create(userId, productId, dto);
    }
}