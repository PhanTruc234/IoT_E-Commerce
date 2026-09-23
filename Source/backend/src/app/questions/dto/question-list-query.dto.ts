import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class QuestionListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: ['true', 'false'] })
    @IsOptional()
    @IsIn(['true', 'false'])
    answered?: string;
}