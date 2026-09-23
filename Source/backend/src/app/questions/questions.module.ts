import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { AdminQuestionsController } from './admin-questions.controller';
import { QuestionsService } from './questions.service';

@Module({
    controllers: [QuestionsController, AdminQuestionsController],
    providers: [QuestionsService],
})
export class QuestionsModule { }