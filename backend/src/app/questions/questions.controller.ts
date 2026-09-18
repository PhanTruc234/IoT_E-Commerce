import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@ApiTags('Questions')
@Controller('products/:productId/questions')
export class QuestionsController {
    constructor(private readonly service: QuestionsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Câu hỏi đã trả lời của sản phẩm' })
    findAll(@Param('productId') productId: string) {
        return this.service.findPublic(productId);
    }

    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: 'Đặt câu hỏi (cần đăng nhập)' })
    create(@CurrentUser('id') userId: string, @Param('productId') productId: string, @Body() dto: CreateQuestionDto) {
        return this.service.create(userId, productId, dto.content);
    }
}