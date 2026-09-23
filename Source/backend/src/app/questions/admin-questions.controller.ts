import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { QuestionsService } from './questions.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { QuestionListQueryDto } from './dto/question-list-query.dto';

@ApiTags('Admin Questions')
@ApiBearerAuth()
@Controller('admin/questions')
export class AdminQuestionsController {
    constructor(private readonly service: QuestionsService) { }

    @Roles(Role.ADMIN) @Get()
    @ApiOperation({ summary: '[Admin] Danh sách câu hỏi' })
    list(@Query() query: QuestionListQueryDto) { return this.service.findAllAdmin(query); }

    @Roles(Role.ADMIN) @Patch(':id/answer')
    @ApiOperation({ summary: '[Admin] Trả lời câu hỏi' })
    answer(@Param('id') id: string, @Body() dto: AnswerQuestionDto) { return this.service.answer(id, dto.answer); }

    @Roles(Role.ADMIN) @Delete(':id')
    @ApiOperation({ summary: '[Admin] Xoá câu hỏi' })
    remove(@Param('id') id: string) { return this.service.remove(id); }
}